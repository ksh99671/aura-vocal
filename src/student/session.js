import { useState, useEffect, useCallback } from "react";
import {
  doc, collection, getDoc, setDoc, deleteDoc, writeBatch, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth, googleProvider } from "../firebase";

export const normCode = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

// ── 로그인 ──
export function useStudentAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }), []);
  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") {
        await signInWithRedirect(auth, googleProvider); // 팝업이 막힌 폰 브라우저
      } else if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") {
        console.error(e);
        throw e;
      }
    }
  };
  return { user, loading, signIn, logOut: () => signOut(auth) };
}

const linkDoc = (uid) => doc(db, "studentLinks", uid);

// ── 연결 상태: loading → needCode(코드 입력) / ready(보기) / error ──
export function useLink(user) {
  const [state, setState] = useState({ phase: "loading", link: null, notice: "", error: "" });

  const check = useCallback(async () => {
    if (!user) return;
    setState((s) => ({ ...s, phase: "loading" }));
    try {
      const snap = await getDoc(linkDoc(user.uid));
      if (!snap.exists()) return setState({ phase: "needCode", link: null, notice: "", error: "" });
      const link = snap.data();
      // 트레이너가 연결을 해제했는지 확인
      const mine = await getDoc(doc(db, "trainers", link.trainerUid, "students", link.studentId, "links", user.uid));
      if (!mine.exists()) {
        try { await deleteDoc(linkDoc(user.uid)); } catch { /* 무시 */ }
        return setState({ phase: "needCode", link: null, notice: "선생님이 연결을 해제했어요. 새 코드로 다시 연결해주세요.", error: "" });
      }
      setState({ phase: "ready", link, notice: "", error: "" });
    } catch (e) {
      console.error(e);
      setState({ phase: "error", link: null, notice: "", error: e.code || e.message });
    }
  }, [user]);

  useEffect(() => { check(); }, [check]);
  return { ...state, recheck: check };
}

// 코드를 읽어서 쓸 수 있는지 확인 (트레이너/학생 이름도 함께)
export async function lookupInvite(raw) {
  const code = normCode(raw);
  if (code.length !== 8) throw new Error("코드는 8자리예요 (예: ABCD-2345)");
  const snap = await getDoc(doc(db, "invites", code));
  if (!snap.exists()) throw new Error("없는 코드예요. 다시 확인해주세요.");
  const d = snap.data();
  if (d.used) throw new Error("이미 사용된 코드예요. 선생님께 새 코드를 요청하세요.");
  if ((d.expiresAt?.toMillis?.() ?? 0) < Date.now()) throw new Error("만료된 코드예요. 선생님께 새 코드를 요청하세요.");
  return { code, ...d };
}

// 연결 확정: 코드 사용 처리 + 연결 문서 + 내 연결 위치를 한 번에 (규칙이 한 묶음으로 검사한다)
export async function redeemInvite(user, inv) {
  const b = writeBatch(db);
  b.update(doc(db, "invites", inv.code), { used: true, usedBy: user.uid, usedAt: serverTimestamp() });
  b.set(doc(db, "trainers", inv.trainerUid, "students", inv.studentId, "links", user.uid), {
    code: inv.code, linkedAt: serverTimestamp(),
  });
  b.set(linkDoc(user.uid), {
    trainerUid: inv.trainerUid, studentId: inv.studentId,
    trainerName: inv.trainerName || "", studentName: inv.studentName || "",
  });
  await b.commit();
}

// ── 공유받은 레슨 (최신순) ──
export function useSharedLessons(link) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!link) return;
    return onSnapshot(
      collection(db, "trainers", link.trainerUid, "students", link.studentId, "shared"),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.date?.toMillis?.() ?? 0) - (a.date?.toMillis?.() ?? 0) || (b.lessonNo || 0) - (a.lessonNo || 0));
        setLessons(list);
        setLoading(false);
      },
      (e) => { console.error(e); setError(e.code || e.message); setLoading(false); }
    );
  }, [link?.trainerUid, link?.studentId]);
  return { lessons, loading, error };
}

// ── 내가 체크한 과제 (레슨 하나당 문서 하나) ──
export function usePractice(link, user, logId) {
  const [items, setItems] = useState(null); // [{text,status}] 또는 null
  const ref = link && logId
    ? doc(db, "trainers", link.trainerUid, "students", link.studentId, "practice", logId)
    : null;
  useEffect(() => {
    setItems(null);
    if (!ref) return;
    return onSnapshot(ref, (snap) => setItems(snap.exists() ? snap.data().items || [] : []), (e) => console.error(e));
  }, [link?.trainerUid, link?.studentId, logId]);

  const setStatus = async (allItems, text, status) => {
    const base = allItems.map((h) => ({ text: h.text, status: (items || []).find((x) => x.text === h.text)?.status || "" }));
    const next = base.map((h) => (h.text === text ? { ...h, status: h.status === status ? "" : status } : h));
    setItems(next); // 눌렀을 때 바로 보이게
    await setDoc(ref, { studentUid: user.uid, logId, items: next, updatedAt: serverTimestamp() });
  };
  return { items: items || [], setStatus };
}

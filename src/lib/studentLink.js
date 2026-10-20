import { useState, useEffect } from "react";
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, deleteField,
  writeBatch, onSnapshot, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { hwItemsFromLog } from "./lessonMemo";

// 학생 앱 연결: 학생 코드 발급, 연결 상태, 레슨 공유(학생에게 보이는 사본)
// 학생에게는 트레이너 메모(memo)를 절대 보내지 않는다. 공유 사본에는 아래 payload에 적힌 것만 들어간다.
export const INVITE_DAYS = 7;
const DAY = 86400000;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 헷갈리는 글자(0 O 1 I) 제외, 32개

export function makeCode() {
  const a = new Uint32Array(8);
  crypto.getRandomValues(a);
  return Array.from(a, (n) => ALPHABET[n % 32]).join(""); // 32로 나눠 떨어져서 치우침 없음
}
export const fmtCode = (c) => (c ? `${c.slice(0, 4)}-${c.slice(4)}` : "");
export const normCode = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

const uid = () => auth.currentUser.uid;
const sRef = (sid) => doc(db, "trainers", uid(), "students", sid);
const linksCol = (sid) => collection(db, "trainers", uid(), "students", sid, "links");
const sharedCol = (sid) => collection(db, "trainers", uid(), "students", sid, "shared");
const sharedRef = (sid, logId) => doc(db, "trainers", uid(), "students", sid, "shared", logId);
const logRef = (sid, logId) => doc(db, "trainers", uid(), "students", sid, "lessonLogs", logId);
const inviteRef = (code) => doc(db, "invites", code);

// ── 학생 코드 ──
export async function issueInvite(sid, studentName) {
  const snap = await getDoc(sRef(sid));
  const oldCode = snap.exists() ? snap.data().inviteCode : null;
  const code = makeCode();
  const expiresAt = Timestamp.fromMillis(Date.now() + INVITE_DAYS * DAY);
  const b = writeBatch(db);
  if (oldCode) b.delete(inviteRef(oldCode)); // 이전 코드는 바로 못 쓰게
  b.set(inviteRef(code), {
    trainerUid: uid(),
    trainerName: auth.currentUser.displayName || "",
    studentId: sid,
    studentName: studentName || "",
    createdAt: serverTimestamp(),
    expiresAt,
    used: false,
  });
  b.update(sRef(sid), { inviteCode: code, inviteExpiresAt: expiresAt });
  await b.commit();
  return code;
}

export async function cancelInvite(sid) {
  const snap = await getDoc(sRef(sid));
  const code = snap.exists() ? snap.data().inviteCode : null;
  const b = writeBatch(db);
  if (code) b.delete(inviteRef(code));
  b.update(sRef(sid), { inviteCode: deleteField(), inviteExpiresAt: deleteField() });
  await b.commit();
}

// 연결 해제: 학생이 더는 못 보게 한다 (공유 사본은 남겨 둬서, 다시 연결하면 이어서 보임)
export async function unlinkStudent(sid) {
  const [l, snap] = await Promise.all([getDocs(linksCol(sid)), getDoc(sRef(sid))]);
  const code = snap.exists() ? snap.data().inviteCode : null;
  const b = writeBatch(db);
  l.docs.forEach((d) => b.delete(d.ref));
  if (code) b.delete(inviteRef(code)); // 이미 쓴 코드가 다시 "발급됨"으로 보이지 않게 정리
  b.update(sRef(sid), { inviteCode: deleteField(), inviteExpiresAt: deleteField() });
  await b.commit();
}

// 학생 삭제(휴지통)·완전 삭제 때: 연결, 공유 사본, 코드를 모두 지운다
export async function revokeAll(sid) {
  const snap = await getDoc(sRef(sid));
  const code = snap.exists() ? snap.data().inviteCode : null;
  const [l, s] = await Promise.all([getDocs(linksCol(sid)), getDocs(sharedCol(sid))]);
  const refs = [...l.docs, ...s.docs].map((d) => d.ref);
  if (code) refs.push(inviteRef(code));
  for (let i = 0; i < refs.length; i += 400) {
    const b = writeBatch(db);
    refs.slice(i, i + 400).forEach((r) => b.delete(r));
    await b.commit();
  }
}

// 학생 상세 카드가 쓴다: 연결 여부 + 발급된 코드
export function useStudentLink(sid) {
  const [link, setLink] = useState(null);
  const [invite, setInvite] = useState(null);
  const [ready, setReady] = useState({ link: false, student: false });

  useEffect(() => {
    setLink(null); setInvite(null); setReady({ link: false, student: false });
    if (!sid || !auth.currentUser) return;
    const off1 = onSnapshot(linksCol(sid), (snap) => {
      const d = snap.docs[0];
      setLink(d ? { id: d.id, ...d.data() } : null);
      setReady((r) => ({ ...r, link: true }));
    }, (e) => { console.error(e); setReady((r) => ({ ...r, link: true })); });
    const off2 = onSnapshot(sRef(sid), (snap) => {
      const x = snap.data() || {};
      setInvite(x.inviteCode ? { code: x.inviteCode, expiresAt: x.inviteExpiresAt?.toMillis?.() ?? 0 } : null);
      setReady((r) => ({ ...r, student: true }));
    }, (e) => { console.error(e); setReady((r) => ({ ...r, student: true })); });
    return () => { off1(); off2(); };
  }, [sid]);

  return { linked: link, invite, loading: !(ready.link && ready.student) };
}

// ── 레슨 공유 ──
// 학생에게 보이는 사본. trainer memo는 넣지 않는다.
export function sharedPayload(log, lessonNo, note) {
  return {
    date: log.date ?? null,
    lessonNo: Number(lessonNo) || 0,
    segments: (log.segments || []).map((s) => ({
      name: s.name || "", song: s.song || "", status: s.status || "", note: s.note || "",
    })),
    homeworkItems: hwItemsFromLog(log).map((x) => ({ text: x.text, status: x.status || "" })),
    note: (note ?? log.studentNote ?? "").trim(),
    updatedAt: serverTimestamp(),
  };
}

// 이 레슨에 학생에게 보낼 "구조"(칩 기록)가 있는지. 없으면 한 줄 피드백이 꼭 필요하다
export const needsStudentNote = (log) => !(log.segments && log.segments.length);

export async function shareLog(sid, logId, log, lessonNo, note) {
  await setDoc(sharedRef(sid, logId), sharedPayload(log, lessonNo, note));
  await updateDoc(logRef(sid, logId), { shared: true, studentNote: (note || "").trim() });
}

export async function unshareLog(sid, logId) {
  await deleteDoc(sharedRef(sid, logId));
  try { await updateDoc(logRef(sid, logId), { shared: false }); } catch { /* 기록이 이미 지워졌으면 무시 */ }
}

// 기록 삭제할 때 사본만 지운다
export async function removeShared(sid, logId) {
  try { await deleteDoc(sharedRef(sid, logId)); } catch (e) { console.warn(e); }
}

// 공유 중인 레슨이 바뀌면 사본도 바꾼다 (실패해도 트레이너 기록은 그대로)
export async function resyncShared(sid, logId, log, lessonNo, note) {
  try {
    await setDoc(sharedRef(sid, logId), sharedPayload(log, lessonNo, note));
    if (note !== undefined) await updateDoc(logRef(sid, logId), { studentNote: (note || "").trim() });
  } catch (e) {
    console.warn("공유 사본을 갱신하지 못했어요", e);
  }
}

export async function syncSharedHomework(sid, logId, items) {
  try {
    await updateDoc(sharedRef(sid, logId), {
      homeworkItems: items.map((x) => ({ text: x.text, status: x.status || "" })),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("공유된 과제 상태를 갱신하지 못했어요", e);
  }
}

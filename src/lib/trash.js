import { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, addDoc, writeBatch, onSnapshot, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

// 학생 삭제 = 휴지통으로 이동. 학생과 레슨 기록이 휴지통에 30일 보관되고, 그 안에는 되살릴 수 있다.
export const TRASH_DAYS = 30;
const DAY = 86400000;

const uid = () => auth.currentUser.uid;
const P = (...s) => ["trainers", uid(), ...s];
const sRef = (id) => doc(db, ...P("students", id));
const sLogs = (id) => collection(db, ...P("students", id, "lessonLogs"));
const tRef = (id) => doc(db, ...P("trash", id));
const tLogs = (id) => collection(db, ...P("trash", id, "lessonLogs"));
const tCol = () => collection(db, ...P("trash"));
const dCol = () => collection(db, ...P("deletions"));

// 한 번에 쓸 수 있는 개수(500)를 넘지 않게 나눠서 처리한다
export const chunk = (arr, n = 400) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};
async function copyDocs(docs, toRefOf) {
  for (const part of chunk(docs)) {
    const b = writeBatch(db);
    part.forEach((d) => b.set(toRefOf(d.id), d.data()));
    await b.commit();
  }
}
async function deleteDocs(refs) {
  for (const part of chunk(refs)) {
    const b = writeBatch(db);
    part.forEach((r) => b.delete(r));
    await b.commit();
  }
}

// 삭제 기록: "무엇을, 언제"만 남긴다. 이름이나 메모 같은 내용은 절대 넣지 않는다.
export async function logDeletion(type, action, extra = {}) {
  try {
    const { refId, logCount } = extra;
    const rec = { type, action, at: serverTimestamp() };
    if (refId) rec.refId = refId;
    if (typeof logCount === "number") rec.logCount = logCount;
    await addDoc(dCol(), rec);
  } catch (e) {
    console.warn("삭제 기록을 남기지 못했어요", e);
  }
}

async function rollbackTrash(id) {
  try {
    const l = await getDocs(tLogs(id));
    await deleteDocs(l.docs.map((d) => d.ref));
    await deleteDoc(tRef(id));
  } catch (e) {
    console.warn("휴지통 정리에 실패했어요", e);
  }
}

// 학생 + 레슨 기록을 휴지통으로. 휴지통에 다 복사된 뒤에만 원래 자리에서 지운다.
export async function moveStudentToTrash(studentId) {
  const s = await getDoc(sRef(studentId));
  if (!s.exists()) return false;
  const logs = await getDocs(sLogs(studentId));
  const count = logs.docs.length;
  try {
    await setDoc(tRef(studentId), {
      ...s.data(),
      deletedAt: serverTimestamp(),
      purgeAfter: Timestamp.fromMillis(Date.now() + TRASH_DAYS * DAY),
      logCount: count,
    });
    await copyDocs(logs.docs, (id) => doc(db, ...P("trash", studentId, "lessonLogs", id)));
  } catch (e) {
    await rollbackTrash(studentId); // 복사 중 실패: 아무것도 지우지 않고 휴지통 쪽만 정리
    throw e;
  }
  try {
    await deleteDoc(sRef(studentId)); // 목록에서 사라지는 순간
  } catch (e) {
    await rollbackTrash(studentId);
    throw e;
  }
  try {
    await deleteDocs(logs.docs.map((d) => d.ref)); // 남은 기록 정리. 실패해도 휴지통에 전부 있어서 괜찮다
  } catch (e) {
    console.warn("원래 자리의 레슨 기록을 지우지 못했어요(휴지통에는 전부 있어요)", e);
  }
  await logDeletion("student", "trash", { refId: studentId, logCount: count });
  return true;
}

// 휴지통에서 되살리기: 이미 같은 학생이 있어도 휴지통 내용으로 덮어쓴다
export async function restoreStudent(studentId) {
  const t = await getDoc(tRef(studentId));
  if (!t.exists()) return false;
  const { deletedAt, purgeAfter, logCount, ...rest } = t.data();
  const logs = await getDocs(tLogs(studentId));
  await setDoc(sRef(studentId), rest);
  await copyDocs(logs.docs, (id) => doc(db, ...P("students", studentId, "lessonLogs", id)));
  await deleteDocs(logs.docs.map((d) => d.ref));
  await deleteDoc(tRef(studentId));
  await logDeletion("student", "restore", { refId: studentId, logCount: logs.docs.length });
  return true;
}

// 휴지통에서 완전히 삭제 (원래 자리에 남았을 수 있는 기록까지 함께)
export async function purgeStudent(studentId) {
  const logs = await getDocs(tLogs(studentId));
  await deleteDocs(logs.docs.map((d) => d.ref));
  await deleteDoc(tRef(studentId));
  try {
    const orphans = await getDocs(sLogs(studentId));
    if (orphans.docs.length) await deleteDocs(orphans.docs.map((d) => d.ref));
  } catch (e) {
    console.warn(e);
  }
  await logDeletion("student", "purge", { refId: studentId, logCount: logs.docs.length });
}

// 30일이 지난 학생을 완전히 지운다 (앱을 열 때 한 번)
let purged = false;
export async function purgeExpiredTrash() {
  if (purged) return;
  purged = true;
  try {
    const snap = await getDocs(tCol());
    const now = Date.now();
    for (const d of snap.docs) {
      const p = d.data().purgeAfter;
      if (p && p.toMillis() < now) await purgeStudent(d.id);
    }
  } catch (e) {
    console.warn("휴지통 정리에 실패했어요", e);
  }
}

export const daysLeft = (item) => Math.max(0, Math.ceil(((item.purgeAfter?.toMillis?.() ?? 0) - Date.now()) / DAY));

export function useTrash() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!auth.currentUser) return;
    return onSnapshot(
      tCol(),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.deletedAt?.toMillis?.() ?? 0) - (a.deletedAt?.toMillis?.() ?? 0));
        setItems(list);
        setLoading(false);
      },
      (e) => {
        console.error(e);
        setLoading(false);
      }
    );
  }, []);
  return { items, loading };
}

import { useState, useEffect } from "react";
import {
  collection, addDoc, doc, updateDoc,
  query, orderBy, serverTimestamp, getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../firebase";

const getTrainerId = () => auth.currentUser?.uid || "trainer_default";

// ── 학생 관련 ──
export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = collection(db, "trainers", getTrainerId(), "students");
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (e) => { console.error(e); setLoading(false); });
    return unsub;
  }, []);

  const addStudent = async (name) => {
    const ref = collection(db, "trainers", getTrainerId(), "students");
    const docRef = await addDoc(ref, { name, createdAt: serverTimestamp() });
    return docRef.id;
  };

  return { students, loading, addStudent };
}

// ── 레슨 기록 ──
export function useLessonLogs(studentId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const ref = collection(db, "trainers", getTrainerId(), "students", studentId, "lessonLogs");
    const q = query(ref, orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (e) => { console.error(e); setLoading(false); });
    return unsub;
  }, [studentId]);

  const addLog = async (data) => {
    const ref = collection(db, "trainers", getTrainerId(), "students", studentId, "lessonLogs");
    await addDoc(ref, { ...data, date: serverTimestamp() });
  };

  const updateLog = async (logId, data) => {
    const ref = doc(db, "trainers", getTrainerId(), "students", studentId, "lessonLogs", logId);
    await updateDoc(ref, data);
  };

  return { logs, loading, addLog, updateLog };
}

// ── 셀프 진단 기록 ──
export function useSelfDiagnosisLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = collection(db, "trainers", getTrainerId(), "selfDiagnoses");
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (e) => { console.error(e); setLoading(false); });
    return unsub;
  }, []);

  const addLog = async (data) => {
    const ref = collection(db, "trainers", getTrainerId(), "selfDiagnoses");
    await addDoc(ref, { ...data, createdAt: serverTimestamp() });
  };

  return { logs, loading, addLog };
}

// ── 학생 페이지용 ──
export function useStudentPage(studentId, trainerId) {
  const [student, setStudent] = useState(null);
  const [journals, setJournals] = useState([]);
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId || !trainerId) return;

    // 학생 정보
    const studentRef = doc(db, "trainers", trainerId, "students", studentId);
    getDoc(studentRef).then(snap => {
      if (snap.exists()) setStudent({ id: snap.id, ...snap.data() });
    });

    // 연습 일지 실시간
    const journalRef = collection(db, "trainers", trainerId, "students", studentId, "journals");
    const jUnsub = onSnapshot(query(journalRef, orderBy("createdAt", "desc")), (snap) => {
      setJournals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 과제 실시간
    const hwRef = collection(db, "trainers", trainerId, "students", studentId, "homework");
    const hUnsub = onSnapshot(query(hwRef, orderBy("createdAt", "desc")), (snap) => {
      setHomework(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { jUnsub(); hUnsub(); };
  }, [studentId, trainerId]);

  const addJournal = async (data) => {
    const ref = collection(db, "trainers", trainerId, "students", studentId, "journals");
    await addDoc(ref, { ...data, createdAt: serverTimestamp() });
  };

  const checkHomework = async (hwId, done) => {
    const ref = doc(db, "trainers", trainerId, "students", studentId, "homework", hwId);
    await updateDoc(ref, { done });
  };

  return { student, journals, homework, loading, addJournal, checkHomework };
}

export async function addHomework(trainerId, studentId, content) {
  const ref = collection(db, "trainers", trainerId, "students", studentId, "homework");
  await addDoc(ref, { content, done: false, createdAt: serverTimestamp() });
}

export async function addFeedback(trainerId, studentId, journalId, feedback) {
  const ref = doc(db, "trainers", trainerId, "students", studentId, "journals", journalId);
  await updateDoc(ref, { trainerFeedback: feedback, feedbackAt: serverTimestamp() });
}

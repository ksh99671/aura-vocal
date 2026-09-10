import { useState, useEffect } from "react";
import {
  collection, addDoc, getDocs, doc, updateDoc,
  query, orderBy, serverTimestamp, getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";

const getTrainerId = () => auth.currentUser?.uid || "trainer_default";

// ── 학생 관련 ──
export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const ref = collection(db, "trainers", getTrainerId(), "students");
      const snap = await getDocs(query(ref, orderBy("createdAt", "desc")));
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addStudent = async (name) => {
    const ref = collection(db, "trainers", getTrainerId(), "students");
    const docRef = await addDoc(ref, { name, createdAt: serverTimestamp() });
    await fetchStudents();
    return docRef.id;
  };

  useEffect(() => { fetchStudents(); }, []);
  return { students, loading, addStudent, refetch: fetchStudents };
}

// ── 레슨 기록 ──
export function useLessonLogs(studentId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const ref = collection(db, "trainers", getTrainerId(), "students", studentId, "lessonLogs");
      const snap = await getDocs(query(ref, orderBy("date", "desc")));
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addLog = async (data) => {
    const ref = collection(db, "trainers", getTrainerId(), "students", studentId, "lessonLogs");
    await addDoc(ref, { ...data, date: serverTimestamp() });
    await fetchLogs();
  };

  const updateLog = async (logId, data) => {
    const ref = doc(db, "trainers", getTrainerId(), "students", studentId, "lessonLogs", logId);
    await updateDoc(ref, data);
    await fetchLogs();
  };

  useEffect(() => { fetchLogs(); }, [studentId]);
  return { logs, loading, addLog, updateLog, refetch: fetchLogs };
}

// ── 셀프 진단 기록 ──
export function useSelfDiagnosisLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const ref = collection(db, "trainers", getTrainerId(), "selfDiagnoses");
      const snap = await getDocs(query(ref, orderBy("createdAt", "desc")));
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addLog = async (data) => {
    const ref = collection(db, "trainers", getTrainerId(), "selfDiagnoses");
    await addDoc(ref, { ...data, createdAt: serverTimestamp() });
    await fetchLogs();
  };

  useEffect(() => { fetchLogs(); }, []);
  return { logs, loading, addLog, refetch: fetchLogs };
}

// ── 학생 페이지용 ──
export function useStudentPage(studentId, trainerId) {
  const [student, setStudent] = useState(null);
  const [journals, setJournals] = useState([]);
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!studentId || !trainerId) return;
    setLoading(true);
    try {
      const studentRef = doc(db, "trainers", trainerId, "students", studentId);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) setStudent({ id: studentSnap.id, ...studentSnap.data() });

      const journalRef = collection(db, "trainers", trainerId, "students", studentId, "journals");
      const journalSnap = await getDocs(query(journalRef, orderBy("createdAt", "desc")));
      setJournals(journalSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const hwRef = collection(db, "trainers", trainerId, "students", studentId, "homework");
      const hwSnap = await getDocs(query(hwRef, orderBy("createdAt", "desc")));
      setHomework(hwSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addJournal = async (data) => {
    const ref = collection(db, "trainers", trainerId, "students", studentId, "journals");
    await addDoc(ref, { ...data, createdAt: serverTimestamp() });
    await fetchData();
  };

  const checkHomework = async (hwId, done) => {
    const ref = doc(db, "trainers", trainerId, "students", studentId, "homework", hwId);
    await updateDoc(ref, { done });
    await fetchData();
  };

  useEffect(() => { fetchData(); }, [studentId, trainerId]);
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

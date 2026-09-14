import { useState, useEffect } from "react";
import {
  collection, addDoc, doc, updateDoc, deleteDoc, setDoc,
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

// ── 레슨 일정 ──
export function useLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = collection(db, "trainers", getTrainerId(), "lessons");
    const q = query(ref, orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (e) => { console.error(e); setLoading(false); });
    return unsub;
  }, []);

  const addLesson = async ({ studentId, studentName, date, time, memo }) => {
    const ref = collection(db, "trainers", getTrainerId(), "lessons");
    await addDoc(ref, {
      studentId, studentName, date, time,
      memo: memo || "",
      createdAt: serverTimestamp(),
    });
  };

  const deleteLesson = async (lessonId) => {
    const ref = doc(db, "trainers", getTrainerId(), "lessons", lessonId);
    await deleteDoc(ref);
  };

  return { lessons, loading, addLesson, deleteLesson };
}

// ── 카테고리 관련 ──
export function useCategories() {
  const [categories, setCategories] = useState([
    { id: "exam", name: "입시", color: "#a78bda" },
    { id: "hobby", name: "취미", color: "#5ec4a0" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "trainers", getTrainerId(), "settings", "categories");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists() && snap.data().list) {
        setCategories(snap.data().list);
      }
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const saveCategories = async (list) => {
    const ref = doc(db, "trainers", getTrainerId(), "settings", "categories");
    await setDoc(ref, { list });
    setCategories(list);
  };

  const addCategory = async (name, color) => {
    const newCat = { id: `cat_${Date.now()}`, name, color };
    const newList = [...categories, newCat];
    await saveCategories(newList);
  };

  const deleteCategory = async (id) => {
    const newList = categories.filter(c => c.id !== id);
    await saveCategories(newList);
  };

  return { categories, loading, addCategory, deleteCategory };
}

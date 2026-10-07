import { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { studentSignals } from "../lib/studentSignals";

const RECENT = 6; // 학생마다 최근 이만큼만 읽는다 (전체 기록을 읽지 않는다)

// 학생 목록의 각 학생에 대해 "관리가 필요한지"를 계산한다.
// 학생마다 최근 레슨 기록 몇 개만 실시간으로 읽어서, 기록을 어디서 고쳐도 항상 맞는 값이 나온다.
export function useStudentSignals(students) {
  const [logsById, setLogsById] = useState({});
  const [readyIds, setReadyIds] = useState({});
  const key = students.map((s) => s.id).sort().join(",");

  useEffect(() => {
    if (!auth.currentUser || !key) return;
    const uid = auth.currentUser.uid;
    const toDocs = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const unsubs = key.split(",").map((id) => {
      const col = collection(db, "trainers", uid, "students", id, "lessonLogs");
      const put = (docs) => {
        setLogsById((m) => ({ ...m, [id]: docs }));
        setReadyIds((r) => (r[id] ? r : { ...r, [id]: true }));
      };
      let fellBack = false;
      return onSnapshot(
        query(col, orderBy("order", "desc"), limit(RECENT)),
        (snap) => {
          const docs = toDocs(snap);
          // 회차 번호(order)가 아직 없는 옛 기록만 있는 학생: 한 번만 번호 없이 읽어본다
          if (docs.length === 0 && !fellBack) {
            fellBack = true;
            getDocs(query(col, limit(RECENT)))
              .then((s2) => put(toDocs(s2)))
              .catch(() => put([]));
          } else {
            put(docs);
          }
        },
        (e) => {
          console.error(e);
          put([]);
        }
      );
    });
    return () => unsubs.forEach((u) => u());
  }, [key]);

  const signals = useMemo(() => {
    const m = {};
    students.forEach((s) => {
      if (readyIds[s.id]) m[s.id] = studentSignals(logsById[s.id] || []);
    });
    return m;
  }, [students, logsById, readyIds]);

  const ready = students.length > 0 && students.every((s) => readyIds[s.id]);
  return { signals, ready };
}

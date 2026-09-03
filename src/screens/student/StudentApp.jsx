import { useState } from "react";
import { useStudentPage } from "../../hooks/useFirestore";
import StudentHome from "./StudentHome";
import StudentJournalWrite from "./StudentJournalWrite";
import StudentJournalDetail from "./StudentJournalDetail";
import StudentHomework from "./StudentHomework";

// URL에서 studentId 파싱 — 나중에 React Router 붙이면 교체
const getStudentId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "demo";
};

export default function StudentApp() {
  const studentId = getStudentId();
  const { student, journals, homework, loading, addJournal, checkHomework } = useStudentPage(studentId);
  const [screen, setScreen] = useState("home");
  const [selected, setSelected] = useState(null);

  if (loading) {
    return (
      <div className="screen" style={{paddingTop:80, textAlign:"center"}}>
        <p className="loading-text">불러오는 중...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="screen" style={{paddingTop:80, textAlign:"center"}}>
        <p className="screen-title">페이지를 찾을 수 없어요</p>
        <p className="screen-sub">트레이너에게 링크를 다시 요청해주세요</p>
      </div>
    );
  }

  const go = (s, data = null) => { setSelected(data); setScreen(s); };

  if (screen === "write") return <StudentJournalWrite student={student} onSubmit={async (data) => { await addJournal(data); go("home"); }} onBack={() => go("home")} />;
  if (screen === "detail") return <StudentJournalDetail journal={selected} onBack={() => go("home")} />;
  if (screen === "homework") return <StudentHomework homework={homework} onCheck={checkHomework} onBack={() => go("home")} />;

  return <StudentHome student={student} journals={journals} homework={homework} go={go} />;
}

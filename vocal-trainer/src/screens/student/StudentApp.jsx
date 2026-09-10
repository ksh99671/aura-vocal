import { useState } from "react";
import { useStudentPage } from "../../hooks/useFirestore";
import StudentHome from "./StudentHome";
import StudentJournalWrite from "./StudentJournalWrite";
import StudentJournalDetail from "./StudentJournalDetail";
import StudentHomework from "./StudentHomework";

const getParams = () => {
  const params = new URLSearchParams(window.location.search);
  return { studentId: params.get("id"), trainerId: params.get("tid") };
};

export default function StudentApp() {
  const { studentId, trainerId } = getParams();
  const { student, journals, homework, loading, addJournal, checkHomework } = useStudentPage(studentId, trainerId);
  const [screen, setScreen] = useState("home");
  const [selected, setSelected] = useState(null);

  if (loading) {
    return (
      <div style={{minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center"}}>
        <p style={{color:"var(--text2)", fontSize:14}}>불러오는 중...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 32px", textAlign:"center"}}>
        <p style={{fontSize:20, fontWeight:600, color:"var(--text1)", marginBottom:8}}>페이지를 찾을 수 없어요</p>
        <p style={{fontSize:14, color:"var(--text2)"}}>트레이너에게 링크를 다시 요청해주세요</p>
      </div>
    );
  }

  const go = (s, data = null) => { setSelected(data); setScreen(s); };

  if (screen === "write") return <StudentJournalWrite student={student} onSubmit={async (data) => { await addJournal(data); go("home"); }} onBack={() => go("home")} />;
  if (screen === "detail") return <StudentJournalDetail journal={selected} onBack={() => go("home")} />;
  if (screen === "homework") return <StudentHomework homework={homework} onCheck={checkHomework} onBack={() => go("home")} />;

  return <StudentHome student={student} journals={journals} homework={homework} go={go} />;
}

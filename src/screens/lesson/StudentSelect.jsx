import { useState } from "react";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { useStudents } from "../../hooks/useFirestore";

export default function StudentSelect({ go }) {
  const { students, loading, addStudent } = useStudents();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    await addStudent(newName.trim());
    setNewName("");
    setAdding(false);
    setSaving(false);
  };

  return (
    <div className="screen">
      <BackButton label="레슨 모드" onClick={() => go("lessonHub")} />
      <p className="eyebrow">Lesson Mode</p>
      <h2 className="screen-title"><strong>학생 선택</strong></h2>
      <p className="screen-sub">진단할 학생을 선택하세요</p>

      {loading ? (
        <div className="loading-card">
          <p className="loading-text">불러오는 중...</p>
        </div>
      ) : (
        <>
          {students.length === 0 && !adding && (
            <div style={{textAlign:"center", padding:"40px 0"}}>
              <p style={{fontSize:14, color:"var(--text2)"}}>아직 학생이 없어요</p>
              <p style={{fontSize:12, color:"var(--text3)", marginTop:4}}>아래 버튼으로 추가해보세요</p>
            </div>
          )}

          {students.map(s => (
            <div key={s.id} className="student-card" onClick={() => go("checklist", { student: s })}>
              <div className="student-avatar">{s.name.slice(-1)}</div>
              <div style={{flex:1}}>
                <p className="student-name">{s.name}</p>
                <p className="student-sub">탭해서 레슨 시작</p>
              </div>
              <span className="student-arrow">→</span>
            </div>
          ))}

          {adding ? (
            <div className="checklist-item" style={{marginBottom:8}}>
              <p className="checklist-label">학생 이름</p>
              <input
                type="text"
                placeholder="이름 입력"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                autoFocus
                style={{
                  width:"100%", background:"transparent", border:"none",
                  outline:"none", fontSize:15, fontWeight:500,
                  color:"var(--text1)", fontFamily:"inherit", marginTop:6
                }}
              />
              <div className="btn-row" style={{marginTop:12}}>
                <button className="btn-secondary" onClick={() => { setAdding(false); setNewName(""); }}>취소</button>
                <button className="btn-primary" disabled={!newName.trim() || saving} onClick={handleAdd}>
                  {saving ? "저장 중..." : "추가"}
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-dashed" onClick={() => setAdding(true)}>+ 학생 추가</button>
          )}
        </>
      )}

      <NavBar go={go} active="home" />
    </div>
  );
}

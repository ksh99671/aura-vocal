import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";

const STUDENTS = [
  { id: "s1", name: "학생 A", lastLesson: "어제" },
  { id: "s2", name: "학생 B", lastLesson: "3일 전" },
];

export default function StudentSelect({ go }) {
  return (
    <div className="screen">
      <BackButton label="레슨 모드" onClick={() => go("lessonHub")} />
      <p className="eyebrow">Lesson Mode</p>
      <h2 className="screen-title"><strong>학생 선택</strong></h2>
      <p className="screen-sub">진단할 학생을 선택하세요</p>

      {STUDENTS.map(s => (
        <div key={s.id} className="student-card" onClick={() => go("checklist", { student: s })}>
          <div className="student-avatar">{s.name.slice(-1)}</div>
          <div style={{flex:1}}>
            <p className="student-name">{s.name}</p>
            <p className="student-sub">마지막 레슨 · {s.lastLesson}</p>
          </div>
          <span className="student-arrow">→</span>
        </div>
      ))}

      <button className="btn-dashed" style={{marginTop:4}}>+ 학생 추가</button>
      <NavBar go={go} active="home" />
    </div>
  );
}

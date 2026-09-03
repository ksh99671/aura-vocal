import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";

export default function LessonHub({ go }) {
  return (
    <div className="screen">
      <BackButton label="홈" onClick={() => go("home")} />
      <p className="eyebrow">Lesson Mode</p>
      <h2 className="screen-title"><strong>레슨 모드</strong></h2>
      <p className="screen-sub">학생을 선택해 진단을 시작하세요</p>
      <button className="btn-primary" onClick={() => go("studentSelect")}>학생 선택 →</button>
      <NavBar go={go} active="home" />
    </div>
  );
}

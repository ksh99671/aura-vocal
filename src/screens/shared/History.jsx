import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";

const HISTORY = [
  { type: "self", name: "셀프 진단", sub: "성구 전환 불안정 · 해결 방안 3개", time: "오늘" },
  { type: "lesson", name: "레슨 — 학생 A", sub: "chest-heavy · 호흡 지지 연습법", time: "어제" },
  { type: "self", name: "셀프 진단", sub: "피치 안정성 양호 · 비브라토 확인", time: "3일 전" },
  { type: "lesson", name: "레슨 — 학생 B", sub: "호흡 지지 부족 · 성구 전환 연습", time: "5일 전" },
];

export default function History({ go }) {
  return (
    <div className="screen">
      <BackButton label="홈" onClick={() => go("home")} />
      <p className="eyebrow">History</p>
      <h2 className="screen-title"><strong>진단 기록</strong></h2>
      <p className="screen-sub" style={{marginBottom:20}}>과거 진단 결과를 확인해요</p>

      {HISTORY.map((item, i) => (
        <div key={i} className="history-item">
          <div className={`history-dot ${item.type}`} />
          <div style={{flex:1}}>
            <p className="history-name">{item.name}</p>
            <p className="history-sub">{item.sub}</p>
          </div>
          <span className="activity-time">{item.time}</span>
          <span className="history-arrow">→</span>
        </div>
      ))}
      <NavBar go={go} active="history" />
    </div>
  );
}

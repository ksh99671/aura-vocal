import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";

export default function SelfHub({ go }) {
  return (
    <div className="screen">
      <BackButton label="홈" onClick={() => go("home")} />
      <p className="eyebrow">Self Diagnosis</p>
      <h2 className="screen-title"><strong>무엇을 할까요?</strong></h2>
      <p className="screen-sub" style={{marginBottom:24}}>발성 진단 또는 기록을 탐색해요</p>

      {[
        { icon: "🎙", title: "새 진단 시작", sub: "오디오 녹음 → 증상 선택 → AI 결과", screen: "audioRecord" },
        { icon: "📚", title: "발성 라이브러리", sub: "이론 및 연습법 탐색", screen: "library" },
        { icon: "◷", title: "이전 진단 기록", sub: "과거 결과 및 해결 방안 조회", screen: "history" },
      ].map((item, i) => (
        <div key={i} className="sub-card" onClick={() => go(item.screen)}>
          <span className="sub-card-icon">{item.icon}</span>
          <div>
            <p className="sub-card-title">{item.title}</p>
            <p className="sub-card-sub">{item.sub}</p>
          </div>
          <span className="sub-card-arrow">→</span>
        </div>
      ))}
      <NavBar go={go} active="home" />
    </div>
  );
}

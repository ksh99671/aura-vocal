import { useState } from "react";
import BackButton from "../../components/BackButton";
import StepIndicator from "../../components/StepIndicator";
import NavBar from "../../components/NavBar";

const SYMPTOMS = [
  { id: "tight", label: "목이 조이는 느낌" },
  { id: "force", label: "힘이 들어가는 느낌" },
  { id: "open", label: "열리는 느낌" },
  { id: "unknown", label: "잘 모르겠음" },
];
const RANGES = [
  { id: "low", label: "저음" }, { id: "mid", label: "중음" },
  { id: "high", label: "고음" }, { id: "all", label: "전 음역" },
];

export default function SymptomSelect({ go }) {
  const [symptom, setSymptom] = useState(null);
  const [range, setRange] = useState(null);

  return (
    <div className="screen">
      <BackButton label="녹음" onClick={() => go("audioRecord")} />
      <StepIndicator total={3} current={1} />
      <p className="eyebrow">Self Diagnosis</p>
      <h2 className="screen-title"><strong>증상 선택</strong></h2>

      <p className="card-label" style={{marginBottom:10, color:"var(--text2)"}}>고음에서 어떤 느낌인가요?</p>
      <div className="choice-grid">
        {SYMPTOMS.map(s => (
          <button key={s.id} className={`choice-btn ${symptom === s.id ? "selected" : ""}`} onClick={() => setSymptom(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <p className="card-label" style={{marginBottom:10, color:"var(--text2)"}}>불편한 음역대</p>
      <div className="choice-row">
        {RANGES.map(r => (
          <button key={r.id} className={`choice-pill ${range === r.id ? "selected" : ""}`} onClick={() => setRange(r.id)}>
            {r.label}
          </button>
        ))}
      </div>

      <button className="btn-primary" disabled={!symptom || !range} onClick={() => go("selfResult", { symptom, range })}>
        진단 요청 →
      </button>
      <NavBar go={go} active="home" />
    </div>
  );
}

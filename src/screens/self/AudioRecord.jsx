import { useState } from "react";
import BackButton from "../../components/BackButton";
import StepIndicator from "../../components/StepIndicator";
import NavBar from "../../components/NavBar";

export default function AudioRecord({ go }) {
  const [status, setStatus] = useState("idle");

  const handleRecord = () => {
    if (status === "idle") {
      setStatus("recording");
      setTimeout(() => setStatus("done"), 5000);
    }
  };

  return (
    <div className="screen">
      <BackButton label="셀프 진단" onClick={() => go("selfHub")} />
      <StepIndicator total={3} current={0} />
      <p className="eyebrow">Self Diagnosis</p>
      <h2 className="screen-title"><strong>발성 녹음</strong></h2>
      <p className="screen-sub">아~ 하고 5초간 일정하게 발성해 주세요</p>

      <div className="record-area">
        <div className="record-arc-wrap">
          <svg className="record-arc-svg" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="60" fill="none" stroke="rgba(201,169,110,0.08)" strokeWidth="0.5"/>
            <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(201,169,110,0.14)" strokeWidth="0.8"
              style={{transformOrigin:"65px 65px", animation:"breathe 4s ease-in-out infinite"}}/>
            <circle cx="65" cy="65" r="42" fill="none" stroke="rgba(201,169,110,0.25)" strokeWidth="1"
              strokeDasharray="20 14" strokeLinecap="round"
              style={{transformOrigin:"65px 65px", animation:"arc-slow 10s linear infinite"}}/>
            <circle cx="65" cy="65" r="30" fill="rgba(201,169,110,0.06)"
              style={{transformOrigin:"65px 65px", animation:"breathe2 3s ease-in-out infinite"}}/>
          </svg>
          <button className="record-center-btn" onClick={handleRecord}>
            {status === "recording" ? "⏹" : "🎙"}
          </button>
        </div>

        {status === "recording" && (
          <div className="waveform">
            {[8,20,14,28,10,22,16,30,12,18,24].map((h, i) => (
              <div key={i} className="wave-bar" style={{height:h, animation:`pulse-bar 1s infinite ${i*0.08}s`}} />
            ))}
          </div>
        )}

        <p className="record-hint">
          {status === "idle" && "버튼을 눌러 녹음을 시작하세요"}
          {status === "recording" && "녹음 중..."}
          {status === "done" && "녹음 완료 ✓"}
        </p>
      </div>

      <div className="btn-stack">
        {status === "done" ? (
          <button className="btn-primary" onClick={() => go("symptomSelect")}>다음 단계 →</button>
        ) : (
          <button className="btn-primary" onClick={handleRecord} disabled={status === "recording"}>
            {status === "idle" ? "녹음 시작" : "녹음 중..."}
          </button>
        )}
      </div>
      <NavBar go={go} active="home" />
    </div>
  );
}

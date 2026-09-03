import { useEffect } from "react";
import BackButton from "../../components/BackButton";
import StepIndicator from "../../components/StepIndicator";
import NavBar from "../../components/NavBar";
import { useSelfDiagnosis } from "../../hooks/useClaude";

export default function SelfResult({ go, params }) {
  const { diagnose, result, loading, error } = useSelfDiagnosis();

  useEffect(() => {
    if (params?.symptom) diagnose({ symptom: params.symptom, range: params.range });
  }, []);

  return (
    <div className="screen">
      <BackButton label="셀프 진단" onClick={() => go("selfHub")} />
      <StepIndicator total={3} current={2} />
      <p className="eyebrow">Diagnosis Result</p>
      <h2 className="screen-title"><strong>진단 결과</strong></h2>

      {loading && (
        <div className="loading-card">
          <p className="loading-text">AI 진단 중...</p>
          <p className="loading-sub">보컬 트레이너가 분석하고 있어요</p>
        </div>
      )}

      {error && (
        <div className="result-card">
          <p className="error-text">{error}</p>
          <button className="btn-secondary" style={{marginTop:12,width:"100%"}} onClick={() => diagnose({ symptom: params?.symptom, range: params?.range })}>
            다시 시도
          </button>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="result-main">
            <p className="card-label">주요 문제</p>
            <p className="card-value">{result.issues ?? result.raw}</p>
          </div>
          {result.cause && (
            <div className="result-card">
              <p className="card-label">원인</p>
              <p className="result-body">{result.cause}</p>
            </div>
          )}
          <div className="result-card">
            <p className="card-label">해결 방안</p>
            <div className="solution-list">
              {result.solutions?.map((s, i) => (
                <div key={i} className="solution-item">
                  <span className="sol-num">0{i+1}</span>
                  <span className="sol-text">{s}</span>
                </div>
              ))}
            </div>
          </div>
          {result.exercise && (
            <div className="highlight-card">
              <p className="card-label">오늘 바로 할 연습</p>
              <p className="card-value">{result.exercise}</p>
            </div>
          )}
          <div className="btn-row">
            <button className="btn-secondary" onClick={() => go("library")}>연습법 보기</button>
            <button className="btn-primary" onClick={() => go("home")}>홈으로</button>
          </div>
        </>
      )}
      <NavBar go={go} active="home" />
    </div>
  );
}

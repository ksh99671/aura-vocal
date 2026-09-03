import { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";
import StepIndicator from "../../components/StepIndicator";
import NavBar from "../../components/NavBar";
import { useLessonDiagnosis } from "../../hooks/useClaude";
import { useLessonLogs } from "../../hooks/useFirestore";

export default function LessonResult({ go, params }) {
  const { diagnose, result, loading, error } = useLessonDiagnosis();
  const student = params?.student;
  const { addLog } = useLessonLogs(student?.id);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params?.memo) diagnose({ student, memo: params.memo });
  }, []);

  useEffect(() => {
    if (result && !saved && student?.id) {
      const save = async () => {
        setSaving(true);
        await addLog({
          memo: params.memo,
          pattern: result.pattern,
          cause: result.cause,
          directions: result.directions,
          homework: result.homework,
        });
        setSaved(true);
        setSaving(false);
      };
      save();
    }
  }, [result]);

  const copyKakao = () => {
    if (!result) return;
    const text = `[레슨 피드백 - ${student?.name ?? "학생"}]\n주요 패턴: ${result.pattern}\n\n오늘 연습 방향:\n${result.directions?.map((d, i) => `${i+1}. ${d}`).join("\n")}${result.homework ? `\n\n다음 레슨 전 과제:\n${result.homework}` : ""}`;
    navigator.clipboard.writeText(text);
    alert("카카오톡 메시지가 복사됐어요!");
  };

  return (
    <div className="screen">
      <BackButton label="레슨 메모" onClick={() => go("checklist", { student })} />
      <StepIndicator total={2} current={1} />
      <p className="eyebrow">Lesson Result</p>
      <h2 className="screen-title">{student?.name || "학생"}<br /><strong>진단 결과</strong></h2>

      {loading && (
        <div className="loading-card">
          <p className="loading-text">AI 진단 중...</p>
          <p className="loading-sub">레슨 방향 분석 중이에요</p>
        </div>
      )}

      {error && (
        <div className="result-card">
          <p className="error-text">{error}</p>
          <button className="btn-secondary" style={{marginTop:12, width:"100%"}}
            onClick={() => diagnose({ student, memo: params?.memo })}>
            다시 시도
          </button>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="result-main">
            <p className="card-label">주요 패턴</p>
            <p className="card-value">{result.pattern ?? result.raw}</p>
          </div>

          {result.cause && (
            <div className="result-card">
              <p className="card-label">원인</p>
              <p className="result-body">{result.cause}</p>
            </div>
          )}

          <div className="result-card">
            <p className="card-label">오늘 레슨 방향</p>
            <div className="solution-list">
              {result.directions?.map((d, i) => (
                <div key={i} className="solution-item">
                  <span className="sol-num">0{i+1}</span>
                  <span className="sol-text">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {result.homework && (
            <div className="highlight-card">
              <p className="card-label">다음 레슨 전 과제</p>
              <p className="card-value">{result.homework}</p>
            </div>
          )}

          {saving && <p style={{fontSize:12, color:"var(--text2)", textAlign:"center"}}>기록 저장 중...</p>}
          {saved && <p style={{fontSize:12, color:"var(--accent)", textAlign:"center"}}>✓ 레슨 기록 저장됨</p>}

          <div className="btn-row" style={{marginBottom:8}}>
            <button className="btn-secondary" onClick={copyKakao}>📋 카톡 복사</button>
            <button className="btn-secondary" onClick={() => go("library")}>연습법 보기</button>
          </div>
          <button className="btn-primary" onClick={() => go("studentSelect")}>완료</button>
        </>
      )}
      <NavBar go={go} active="home" />
    </div>
  );
}

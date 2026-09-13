import { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";
import StepIndicator from "../../components/StepIndicator";
import NavBar from "../../components/NavBar";
import { useLessonLogs } from "../../hooks/useFirestore";

export default function LessonResult({ go, params }) {
  const student = params?.student;
  const { addLog } = useLessonLogs(student?.id);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params?.memo && student?.id && !saved) {
      const save = async () => {
        setSaving(true);
        await addLog({
          memo: params.memo || "",
          pattern: "",
          cause: "",
          directions: [],
          homework: "",
        });
        setSaved(true);
        setSaving(false);
      };
      save();
    }
  }, []);

  const copyKakao = () => {
    const text = `[레슨 메모 - ${student?.name ?? "학생"}]\n\n${params?.memo || ""}`;
    navigator.clipboard.writeText(text);
    alert("카카오톡 메시지가 복사됐어요!");
  };

  return (
    <div className="screen">
      <BackButton label="레슨 메모" onClick={() => go("checklist", { student })} />
      <StepIndicator total={2} current={1} />
      <p className="eyebrow">Lesson Result</p>
      <h2 className="screen-title">{student?.name || "학생"}<br /><strong>레슨 기록</strong></h2>

      {/* 메모 내용 */}
      <div className="result-card">
        <p className="card-label">오늘 레슨 메모</p>
        <p className="result-body" style={{marginTop:8, whiteSpace:"pre-line"}}>{params?.memo}</p>
      </div>

      {/* AI 진단 안내 */}
      <div style={{
        background:"var(--accent-dim)",
        border:"0.5px solid var(--accent-mid)",
        borderRadius:16,
        padding:"18px 18px",
        marginBottom:10,
        textAlign:"center"
      }}>
        <p style={{fontSize:14, fontWeight:600, color:"var(--accent)", marginBottom:6}}>✨ AI 진단</p>
        <p style={{fontSize:13, color:"var(--text2)", lineHeight:1.7}}>
          구독하면 AI가 메모를 분석해서{"\n"}레슨 방향과 연습 과제를 제안해줘요
        </p>
        <button style={{
          marginTop:12,
          background:"var(--accent)",
          color:"#0e0e12",
          border:"none",
          borderRadius:10,
          padding:"10px 20px",
          fontSize:13,
          fontWeight:600,
          cursor:"pointer",
          fontFamily:"inherit"
        }}>
          구독하기 (준비 중)
        </button>
      </div>

      {saving && <p style={{fontSize:12, color:"var(--text2)", textAlign:"center"}}>기록 저장 중...</p>}
      {saved && <p style={{fontSize:12, color:"var(--accent)", textAlign:"center"}}>✓ 레슨 기록 저장됨</p>}

      <div className="btn-row" style={{marginBottom:8}}>
        <button className="btn-secondary" onClick={copyKakao}>📋 카톡 복사</button>
        <button className="btn-secondary" onClick={() => go("library")}>연습법 보기</button>
      </div>
      <button className="btn-primary" onClick={() => go("studentSelect")}>완료</button>

      <NavBar go={go} active="home" />
    </div>
  );
}

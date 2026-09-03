import { useState } from "react";
import BackButton from "../../components/BackButton";

export default function StudentJournalWrite({ student, onSubmit, onBack }) {
  const [song, setSong] = useState("");
  const [condition, setCondition] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!song) return;
    setSubmitting(true);
    await onSubmit({ song, condition, selfFeedback: feedback });
    setSubmitting(false);
  };

  return (
    <div className="screen">
      <BackButton label="일지 목록" onClick={onBack} />
      <p className="eyebrow">Practice Journal</p>
      <h2 className="screen-title"><strong>오늘 연습 기록</strong></h2>
      <p className="screen-sub">레슨 전에 제출하면 트레이너가 확인해요</p>

      {/* 연습한 곡 */}
      <div className="checklist-item" style={{marginBottom:10}}>
        <p className="checklist-label">연습한 곡</p>
        <input
          type="text"
          placeholder="곡명 입력"
          value={song}
          onChange={e => setSong(e.target.value)}
          style={{
            width:"100%", background:"transparent", border:"none", outline:"none",
            fontSize:15, fontWeight:500, color:"var(--text1)", fontFamily:"inherit",
            marginTop:4
          }}
        />
      </div>

      {/* 컨디션 */}
      <div className="checklist-item" style={{marginBottom:10}}>
        <p className="checklist-label">오늘 컨디션</p>
        <div style={{display:"flex", gap:8, marginTop:8}}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setCondition(n)}
              style={{
                width:40, height:40, borderRadius:"50%",
                border:`0.5px solid ${condition >= n ? "var(--accent)" : "var(--border2)"}`,
                background: condition >= n ? "var(--accent-dim)" : "var(--bg2)",
                fontSize:18, cursor:"pointer", transition:"all .15s"
              }}>
              {condition >= n ? "⭐" : "☆"}
            </button>
          ))}
        </div>
      </div>

      {/* 자체 피드백 */}
      <div className="checklist-item" style={{marginBottom:20}}>
        <p className="checklist-label">자체 피드백</p>
        <textarea
          placeholder="오늘 연습하면서 느낀 점, 어려웠던 부분 등을 자유롭게 적어주세요"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          rows={4}
          style={{
            width:"100%", background:"transparent", border:"none", outline:"none",
            fontSize:13, color:"var(--text1)", fontFamily:"inherit", resize:"none",
            lineHeight:1.7, marginTop:8
          }}
        />
      </div>

      <button className="btn-primary" disabled={!song || submitting} onClick={handleSubmit}>
        {submitting ? "제출 중..." : "제출하기 →"}
      </button>
      <div style={{height:40}} />
    </div>
  );
}

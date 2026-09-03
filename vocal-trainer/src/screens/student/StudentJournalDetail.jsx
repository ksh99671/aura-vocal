import BackButton from "../../components/BackButton";

export default function StudentJournalDetail({ journal, onBack }) {
  if (!journal) return null;

  return (
    <div className="screen">
      <BackButton label="일지 목록" onClick={onBack} />
      <p className="eyebrow">Journal Detail</p>
      <h2 className="screen-title"><strong>{journal.song || "곡 미입력"}</strong></h2>
      <p className="screen-sub">{journal.createdAt?.toDate?.()?.toLocaleDateString("ko-KR") || ""}</p>

      <div className="result-card">
        <p className="card-label">컨디션</p>
        <p style={{fontSize:20, marginTop:4}}>{"⭐".repeat(journal.condition || 0)}{"☆".repeat(5 - (journal.condition || 0))}</p>
      </div>

      {journal.selfFeedback && (
        <div className="result-card">
          <p className="card-label">자체 피드백</p>
          <p className="result-body" style={{marginTop:8}}>{journal.selfFeedback}</p>
        </div>
      )}

      {journal.trainerFeedback ? (
        <div className="highlight-card">
          <p className="card-label">트레이너 피드백</p>
          <p className="result-body" style={{marginTop:8}}>{journal.trainerFeedback}</p>
        </div>
      ) : (
        <div style={{background:"var(--bg2)", border:"0.5px solid var(--border)", borderRadius:16, padding:"20px 18px", textAlign:"center"}}>
          <p style={{fontSize:13, color:"var(--text2)"}}>트레이너 피드백 대기 중...</p>
          <p style={{fontSize:11, color:"var(--text3)", marginTop:4}}>다음 레슨 전에 확인해보세요</p>
        </div>
      )}

      <div style={{height:40}} />
    </div>
  );
}

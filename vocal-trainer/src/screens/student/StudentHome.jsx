export default function StudentHome({ student, journals, homework, go }) {
  const doneCount = homework.filter(h => h.done).length;
  const totalCount = homework.length;

  return (
    <div className="screen">
      <div className="home-header">
        <div>
          <p className="home-greeting">안녕하세요 👋</p>
          <h1 className="home-title"><strong>{student.name}</strong>님의<br />연습 일지</h1>
        </div>
        <div style={{textAlign:"right", marginTop:4}}>
          <p style={{fontSize:11, color:"var(--text2)", marginBottom:4}}>과제 완료</p>
          <p style={{fontSize:22, fontWeight:600, color:"var(--accent)", lineHeight:1}}>{doneCount}<span style={{fontSize:13, fontWeight:400, color:"var(--text2)"}}>/{totalCount}</span></p>
        </div>
      </div>

      {/* 과제 현황 */}
      {totalCount > 0 && (
        <div style={{background:"var(--accent-dim)", border:"0.5px solid var(--accent-mid)", borderRadius:16, padding:"16px 18px", marginBottom:16, cursor:"pointer"}} onClick={() => go("homework")}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
            <p style={{fontSize:13, fontWeight:500, color:"var(--text1)"}}>이번 레슨 과제</p>
            <span style={{fontSize:12, color:"var(--accent)"}}>전체 보기 →</span>
          </div>
          <div style={{height:4, background:"var(--border2)", borderRadius:2, overflow:"hidden"}}>
            <div style={{height:"100%", background:"var(--accent)", borderRadius:2, width:`${totalCount ? (doneCount/totalCount)*100 : 0}%`, transition:"width .3s"}} />
          </div>
          <p style={{fontSize:11, color:"var(--text2)", marginTop:6}}>{totalCount - doneCount}개 남음</p>
        </div>
      )}

      {/* 새 기록 버튼 */}
      <button className="btn-primary" style={{marginBottom:20}} onClick={() => go("write")}>
        + 오늘 연습 기록하기
      </button>

      <div className="section-divider" />

      {/* 일지 목록 */}
      <div className="section-header">
        <p className="section-title">연습 일지</p>
        <p style={{fontSize:12, color:"var(--text2)"}}>{journals.length}개</p>
      </div>

      {journals.length === 0 ? (
        <div style={{textAlign:"center", padding:"40px 0"}}>
          <p style={{fontSize:14, color:"var(--text2)"}}>아직 기록이 없어요</p>
          <p style={{fontSize:12, color:"var(--text3)", marginTop:4}}>오늘 연습을 기록해보세요</p>
        </div>
      ) : (
        journals.map((j, i) => (
          <div key={j.id || i} className="history-item" onClick={() => go("detail", j)}>
            <div style={{flex:1}}>
              <p className="history-name">{j.song || "곡 미입력"}</p>
              <div style={{display:"flex", gap:8, marginTop:3, flexWrap:"wrap"}}>
                <span style={{fontSize:11, color:"var(--text2)"}}>컨디션 {"⭐".repeat(j.condition || 0)}</span>
                {j.trainerFeedback && <span style={{fontSize:11, color:"var(--accent)"}}>피드백 있음</span>}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <p className="activity-time">{j.createdAt?.toDate?.()?.toLocaleDateString("ko-KR") || "최근"}</p>
            </div>
          </div>
        ))
      )}

      <div style={{height:40}} />
    </div>
  );
}

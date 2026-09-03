import BackButton from "../../components/BackButton";

export default function StudentHomework({ homework, onCheck, onBack }) {
  const doneCount = homework.filter(h => h.done).length;

  return (
    <div className="screen">
      <BackButton label="일지 목록" onClick={onBack} />
      <p className="eyebrow">Homework</p>
      <h2 className="screen-title"><strong>연습 과제</strong></h2>
      <p className="screen-sub">트레이너가 준 과제를 확인하고 완료하면 체크해요</p>

      {/* 진행률 */}
      <div className="result-card" style={{marginBottom:16}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
          <p className="card-label">완료율</p>
          <p style={{fontSize:14, fontWeight:600, color:"var(--accent)"}}>{doneCount}/{homework.length}</p>
        </div>
        <div style={{height:4, background:"var(--border2)", borderRadius:2, overflow:"hidden"}}>
          <div style={{
            height:"100%", background:"var(--accent)", borderRadius:2,
            width:`${homework.length ? (doneCount/homework.length)*100 : 0}%`,
            transition:"width .3s"
          }} />
        </div>
      </div>

      {homework.length === 0 ? (
        <div style={{textAlign:"center", padding:"40px 0"}}>
          <p style={{fontSize:14, color:"var(--text2)"}}>아직 과제가 없어요</p>
          <p style={{fontSize:12, color:"var(--text3)", marginTop:4}}>다음 레슨 후 과제가 추가될 거예요</p>
        </div>
      ) : (
        homework.map((hw, i) => (
          <div key={hw.id || i}
            style={{
              background: hw.done ? "var(--accent-dim)" : "var(--bg2)",
              border: `0.5px solid ${hw.done ? "var(--accent-mid)" : "var(--border2)"}`,
              borderRadius:14, padding:"14px 16px", marginBottom:8,
              display:"flex", alignItems:"center", gap:12, cursor:"pointer",
              transition:"all .2s"
            }}
            onClick={() => onCheck(hw.id, !hw.done)}
          >
            <div style={{
              width:22, height:22, borderRadius:"50%",
              border:`1.5px solid ${hw.done ? "var(--accent)" : "var(--border2)"}`,
              background: hw.done ? "var(--accent)" : "transparent",
              display:"flex", alignItems:"center", justifyContent:"center",
              flex:"shrink 0", flexShrink:0, transition:"all .2s"
            }}>
              {hw.done && <span style={{color:"#0e0e12", fontSize:12, fontWeight:700}}>✓</span>}
            </div>
            <p style={{
              fontSize:13, fontWeight:500,
              color: hw.done ? "var(--text2)" : "var(--text1)",
              textDecoration: hw.done ? "line-through" : "none",
              flex:1, lineHeight:1.6
            }}>
              {hw.content}
            </p>
          </div>
        ))
      )}

      <div style={{height:40}} />
    </div>
  );
}

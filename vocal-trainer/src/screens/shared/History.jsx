import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { useSelfDiagnosisLogs } from "../../hooks/useFirestore";

export default function History({ go }) {
  const { logs, loading } = useSelfDiagnosisLogs();

  return (
    <div className="screen">
      <BackButton label="홈" onClick={() => go("home")} />
      <p className="eyebrow">History</p>
      <h2 className="screen-title"><strong>진단 기록</strong></h2>
      <p className="screen-sub" style={{marginBottom:20}}>과거 셀프 진단 결과를 확인해요</p>

      {loading ? (
        <div className="loading-card">
          <p className="loading-text">불러오는 중...</p>
        </div>
      ) : logs.length === 0 ? (
        <div style={{textAlign:"center", padding:"40px 0"}}>
          <p style={{fontSize:14, color:"var(--text2)"}}>아직 진단 기록이 없어요</p>
          <p style={{fontSize:12, color:"var(--text3)", marginTop:4}}>셀프 진단을 시작해보세요</p>
        </div>
      ) : (
        logs.map((log, i) => (
          <div key={log.id || i} className="history-item">
            <div className="history-dot self" />
            <div style={{flex:1}}>
              <p className="history-name">{log.issues || "진단 결과"}</p>
              <p className="history-sub">
                {log.createdAt?.toDate?.()?.toLocaleDateString("ko-KR") || "최근"}
              </p>
            </div>
            <span className="history-arrow">→</span>
          </div>
        ))
      )}

      <NavBar go={go} active="history" />
    </div>
  );
}

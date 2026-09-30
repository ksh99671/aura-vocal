import { useState } from "react";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { useLessonLogs } from "../../hooks/useFirestore";

export default function LessonDetail({ go, params }) {
  const student = params?.student;
  const log = params?.log;
  const lessonNo = params?.lessonNo;
  const { updateLog, deleteLog } = useLessonLogs(student?.id);

  const [memo, setMemo] = useState(log?.memo || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!student || !log) return null;

  const dateStr = log.date?.toDate?.()?.toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  }) || "날짜 없음";

  const save = async () => {
    setSaving(true);
    await updateLog(log.id, { memo });
    setSaving(false);
    setEditing(false);
  };

  const remove = async () => {
    if (!confirm("이 레슨 기록을 삭제할까요?")) return;
    await deleteLog(log.id);
    go("studentDetail", { student });
  };

  return (
    <div className="screen">
      <BackButton label={student.name} onClick={() => go("studentDetail", { student })} />

      {/* 헤더 */}
      <div style={{marginBottom:18}}>
        <p className="eyebrow">Lesson {lessonNo}</p>
        <h2 className="screen-title"><strong>{lessonNo}회차 레슨</strong></h2>
        <p style={{fontSize:13, color:"var(--text2)", marginTop:6}}>{dateStr}</p>
      </div>

      {/* 레슨 내용 */}
      <div className="result-card" style={{marginBottom:12}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
          <p className="card-label" style={{marginBottom:0}}>레슨 내용</p>
          {!editing && (
            <button onClick={() => setEditing(true)} style={{
              fontSize:11, color:"var(--accent)", background:"none", border:"none",
              cursor:"pointer", fontFamily:"inherit", opacity:.8, padding:0,
            }}>수정</button>
          )}
        </div>

        {editing ? (
          <>
            <textarea
              value={memo} onChange={e => setMemo(e.target.value)} rows={12}
              placeholder="오늘 레슨에서 다룬 내용, 학생 상태, 다음 과제 등을 자유롭게 적어보세요"
              style={{
                width:"100%", background:"var(--bg3)", border:"0.5px solid var(--border2)",
                borderRadius:12, padding:"14px", outline:"none",
                fontSize:14, color:"var(--text1)", fontFamily:"inherit",
                resize:"vertical", lineHeight:1.8, minHeight:200,
              }}
            />
            <div className="btn-row" style={{marginTop:10}}>
              <button className="btn-secondary" onClick={() => { setMemo(log.memo || ""); setEditing(false); }}>취소</button>
              <button className="btn-primary" disabled={saving} onClick={save}>
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </>
        ) : (
          <p style={{
            fontSize:14, color: memo ? "var(--text1)" : "var(--text3)",
            lineHeight:1.9, whiteSpace:"pre-wrap", minHeight:60,
          }}>
            {memo || "내용이 없어요. 수정을 눌러 작성해보세요."}
          </p>
        )}
      </div>

      {/* 삭제 */}
      {!editing && (
        <button onClick={remove} style={{
          width:"100%", padding:"11px", background:"transparent",
          color:"rgba(224,74,74,0.7)", border:"0.5px solid rgba(224,74,74,0.2)",
          borderRadius:12, fontSize:12, cursor:"pointer", fontFamily:"inherit",
        }}>레슨 기록 삭제</button>
      )}

      <NavBar go={go} active="studentsList" />
    </div>
  );
}

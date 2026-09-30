import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { useLessonLogs } from "../../hooks/useFirestore";

const toInput = (ts) => {
  const d = ts?.toDate?.();
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fromInput = (s) => (s ? Timestamp.fromDate(new Date(s + "T12:00:00")) : null);
const label = (s) =>
  s
    ? new Date(s + "T12:00:00").toLocaleDateString("ko-KR", {
        year: "numeric", month: "long", day: "numeric", weekday: "short",
      })
    : "날짜 미상";

export default function LessonDetail({ go, params }) {
  const student = params?.student;
  const log = params?.log;
  const lessonNo = params?.lessonNo;
  const { logs, updateLog, deleteLog, moveLog } = useLessonLogs(student?.id);

  const [memo, setMemo] = useState(log?.memo || "");
  const [dateVal, setDateVal] = useState(toInput(log?.date));
  const [noVal, setNoVal] = useState(String(lessonNo ?? ""));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!student || !log) return null;

  const base = Number(student.baseCount || 0);
  const maxNo = base + logs.length;
  const no = Number(noVal);
  const noValid = noVal !== "" && Number.isInteger(no) && no > base && no <= maxNo;
  const range = (a, b) => (a === b ? `${a}회차` : `${a}~${b}회차`);
  let noHint = "";
  if (noVal !== "" && logs.length > 0) {
    if (!noValid) noHint = `${base + 1}회 ~ ${maxNo}회 사이로 입력해주세요`;
    else if (no < lessonNo) noHint = `${range(no, lessonNo - 1)}였던 기록이 한 칸씩 뒤로 밀려요`;
    else if (no > lessonNo) noHint = `${range(lessonNo + 1, no)}였던 기록이 한 칸씩 앞으로 당겨져요`;
  }

  const save = async () => {
    if (!noValid) {
      alert(`${base + 1}회 ~ ${maxNo}회 사이로 입력해주세요`);
      return;
    }
    setSaving(true);
    const newDate = fromInput(dateVal);
    await updateLog(log.id, { memo, date: newDate });
    if (no !== lessonNo) await moveLog(log.id, no - base);
    // 화면 정보도 최신으로 (다시 수정/취소할 때 옛 값으로 돌아가지 않게)
    go("lessonDetail", { student, log: { ...log, memo, date: newDate }, lessonNo: no });
    setSaving(false);
    setEditing(false);
  };

  const cancel = () => {
    setMemo(log.memo || "");
    setDateVal(toInput(log.date));
    setNoVal(String(lessonNo));
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
        <p style={{fontSize:13, color: dateVal ? "var(--text2)" : "var(--text3)", marginTop:6}}>{label(dateVal)}</p>
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
            <p className="card-label">회차</p>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
              <input type="number" value={noVal} min={base + 1} max={maxNo} onChange={e => setNoVal(e.target.value)} style={{
                width:90, padding:"10px 12px", borderRadius:10, textAlign:"center",
                background:"var(--bg3)", border:"0.5px solid var(--border2)",
                color:"var(--text1)", fontSize:14, fontFamily:"inherit", outline:"none",
              }} />
              <span style={{fontSize:13, color:"var(--text2)"}}>회차</span>
            </div>
            <p style={{fontSize:11, color:"var(--text3)", marginBottom:14, lineHeight:1.6, minHeight:16}}>{noHint}</p>

            <p className="card-label">날짜</p>
            <div style={{display:"flex", gap:8, alignItems:"center", marginBottom:14}}>
              <input type="date" value={dateVal} onChange={e => setDateVal(e.target.value)} style={{
                flex:1, padding:"10px 12px", borderRadius:10,
                background:"var(--bg3)", border:"0.5px solid var(--border2)",
                color:"var(--text1)", fontSize:13, fontFamily:"inherit", outline:"none",
              }} />
              <button onClick={() => setDateVal("")} style={{
                fontSize:11, color:"var(--text3)", background:"none", whiteSpace:"nowrap",
                border:"0.5px solid var(--border2)", borderRadius:8,
                padding:"9px 10px", cursor:"pointer", fontFamily:"inherit",
              }}>날짜 모름</button>
            </div>

            <p className="card-label">내용</p>
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
              <button className="btn-secondary" onClick={cancel}>취소</button>
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

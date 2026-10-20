import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { buildSummaryText } from "../../lib/lessonText";
import { useStudentLink, shareLog, unshareLog } from "../../lib/studentLink";

// 레슨 저장 뒤: 한 번에 훑어보고 고쳐서, 레슨생에게 보낸다 (복사/공유, 학생 앱 연결 시 앱으로도)
export default function LessonSummary({ go, params }) {
  const { student, logId, lessonNo, segments = [], homework = [] } = params || {};
  const { linked } = useStudentLink(student?.id);
  const [date] = useState(() => (params?.date ? new Date(params.date) : new Date()));
  const [note, setNote] = useState("");
  const [edited, setEdited] = useState(null); // 직접 고친 글. null이면 자동 생성 글을 그대로 쓴다
  const [shared, setShared] = useState(!!params?.shared);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (!student) return null;

  const auto = buildSummaryText({ name: student.name, lessonNo, date, segments, homework, note });
  const text = edited ?? auto;
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2200); };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      flash("복사했어요. 카톡이나 문자에 붙여넣으세요");
    } catch {
      flash("복사하지 못했어요. 글을 직접 선택해서 복사해주세요");
    }
  };
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* 취소 */ }
    } else {
      copy();
    }
  };
  const toApp = async () => {
    if (busy || !logId) return;
    setBusy(true);
    try {
      if (shared) {
        await unshareLog(student.id, logId);
        setShared(false);
        flash("학생 앱 공유를 껐어요");
      } else {
        await shareLog(student.id, logId, { date: Timestamp.fromDate(date), segments, homeworkItems: homework.map((h) => ({ text: typeof h === "string" ? h : h.text, status: h.status || "" })) }, lessonNo, note);
        setShared(true);
        flash("학생 앱으로 보냈어요");
      }
    } catch (e) {
      console.error(e);
      flash("처리하지 못했어요: " + (e.code || e.message));
    }
    setBusy(false);
  };

  return (
    <div className="screen">
      <BackButton label={student.name} onClick={() => go("studentDetail", { student })} />
      <p className="eyebrow">Lesson Summary</p>
      <h2 className="screen-title"><strong>{student.name}</strong> · {lessonNo}회차 정리</h2>
      <p style={{ fontSize: 12, color: "var(--text3)", margin: "4px 0 14px" }}>레슨이 저장됐어요. 아래 글을 고쳐서 레슨생에게 보내세요.</p>

      <div className="result-card" style={{ marginBottom: 12 }}>
        <p className="card-label">한마디 (선택)</p>
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="예: 오늘 고음 연결이 좋아졌어요. 과제 꼭 해오세요"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: "var(--bg3)", border: "0.5px solid var(--border2)", color: "var(--text1)", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div className="result-card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p className="card-label" style={{ marginBottom: 0 }}>보낼 글</p>
          {edited !== null && (
            <button onClick={() => setEdited(null)} style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>처음 상태로</button>
          )}
        </div>
        <textarea data-testid="summary-text" value={text} onChange={(e) => setEdited(e.target.value)} rows={14}
          style={{ width: "100%", boxSizing: "border-box", background: "var(--bg3)", border: "0.5px solid var(--border2)", borderRadius: 12, padding: 14, outline: "none", fontSize: 14, color: "var(--text1)", fontFamily: "inherit", resize: "vertical", lineHeight: 1.8, minHeight: 220, whiteSpace: "pre-wrap" }} />
      </div>

      <div className="btn-row" style={{ marginBottom: 8 }}>
        <button className="btn-secondary" onClick={copy}>복사</button>
        <button className="btn-primary" onClick={share}>{navigator.share ? "공유하기" : "복사해서 보내기"}</button>
      </div>

      {linked ? (
        <button className="btn-secondary" style={{ width: "100%", marginBottom: 8 }} disabled={busy} onClick={toApp}>
          {shared ? "학생 앱에 공유됨 · 누르면 끄기" : "학생 앱으로 보내기"}
        </button>
      ) : (
        <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, lineHeight: 1.6 }}>학생 앱에 연결된 학생이면 앱으로도 보낼 수 있어요.</p>
      )}
      {msg && <p style={{ fontSize: 12, color: "var(--accent)", margin: "4px 0 8px" }} role="status">{msg}</p>}

      <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => go("studentDetail", { student })}>완료</button>
      <NavBar go={go} active="home" />
    </div>
  );
}

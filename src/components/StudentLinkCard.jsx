import { useState } from "react";
import { useStudentLink, issueInvite, cancelInvite, unlinkStudent, fmtCode } from "../lib/studentLink";

const DAY = 86400000;
const fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString("ko-KR", { year: "numeric", month: "numeric", day: "numeric" }) : "");

const linkBtn = {
  fontSize: 11, color: "var(--accent)", background: "none", border: "none",
  cursor: "pointer", fontFamily: "inherit", opacity: 0.85, padding: 0,
};

// 학생 상세: 학생 앱 연결 상태 / 학생 코드 발급
export default function StudentLinkCard({ student }) {
  const { linked, invite, loading } = useStudentLink(student.id);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");

  if (loading) return null;

  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      await fn();
    } catch (e) {
      console.error(e);
      setErr("처리하지 못했어요: " + (e.code || e.message));
    }
    setBusy(false);
  };

  const left = invite ? Math.ceil((invite.expiresAt - Date.now()) / DAY) : 0;
  const active = invite && invite.expiresAt > Date.now();
  const connectedAt = linked?.linkedAt?.toMillis?.() ?? linked?.createdAt?.toMillis?.() ?? 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fmtCode(invite.code));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setErr("복사하지 못했어요. 코드를 직접 적어주세요.");
    }
  };

  return (
    <div className="result-card" style={{ marginBottom: 12 }} data-testid="link-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p className="card-label" style={{ marginBottom: 0 }}>학생 앱</p>
        {linked && (
          <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, fontWeight: 500, background: "var(--accent-dim)", color: "var(--accent)" }}>
            앱 연결됨
          </span>
        )}
      </div>

      {linked ? (
        <>
          <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.7, marginTop: 8 }}>
            {connectedAt ? `${fmtDate(connectedAt)}에 연결됐어요. ` : ""}공유를 켠 레슨의 피드백과 과제만 학생에게 보여요.
          </p>
          <button
            style={{ ...linkBtn, color: "rgba(224,74,74,0.75)", marginTop: 8 }}
            disabled={busy}
            onClick={() => {
              if (!confirm(`${student.name} 학생의 앱 연결을 해제할까요?\n해제하면 학생은 더 이상 기록을 볼 수 없어요. 새 코드로 다시 연결할 수 있어요.`)) return;
              run(() => unlinkStudent(student.id));
            }}
          >연결 해제</button>
        </>
      ) : active ? (
        <>
          <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 8 }}>학생 앱에서 이 코드를 입력하면 연결돼요 (1회용)</p>
          <p data-testid="invite-code" style={{ fontSize: 28, fontWeight: 600, letterSpacing: ".12em", color: "var(--accent)", margin: "10px 0 4px", fontVariantNumeric: "tabular-nums" }}>
            {fmtCode(invite.code)}
          </p>
          <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10 }}>
            {fmtDate(invite.expiresAt)}까지 · {left <= 1 ? "오늘 만료" : `${left}일 남음`}
          </p>
          <div style={{ display: "flex", gap: 14 }}>
            <button style={linkBtn} onClick={copy}>{copied ? "복사됨" : "코드 복사"}</button>
            <button style={linkBtn} disabled={busy} onClick={() => run(() => issueInvite(student.id, student.name))}>새 코드 발급</button>
            <button style={{ ...linkBtn, color: "var(--text3)" }} disabled={busy} onClick={() => run(() => cancelInvite(student.id))}>발급 취소</button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.7, marginTop: 8 }}>
            {invite ? "발급한 코드가 만료됐어요. " : ""}학생 앱에 연결하면 공유한 레슨의 피드백과 과제를 학생이 볼 수 있어요. 트레이너 메모는 보이지 않아요.
          </p>
          <button className="btn-secondary" style={{ marginTop: 10 }} disabled={busy} onClick={() => run(() => issueInvite(student.id, student.name))}>
            {busy ? "발급 중..." : "학생 코드 발급"}
          </button>
        </>
      )}
      {err && <p style={{ fontSize: 11, color: "#e04a4a", marginTop: 8 }}>{err}</p>}
    </div>
  );
}

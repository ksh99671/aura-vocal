import { useState, useEffect } from "react";
import { STATUS, HW_STATUS } from "../lib/lessonMemo";
import {
  useStudentAuth, useLink, lookupInvite, redeemInvite, useSharedLessons, usePractice, normCode,
} from "./session";

const fmtDate = (ts, long) => {
  const d = ts?.toDate?.();
  if (!d) return "날짜 미상";
  return d.toLocaleDateString("ko-KR", long ? { year: "numeric", month: "long", day: "numeric", weekday: "short" } : { month: "long", day: "numeric", weekday: "short" });
};
const fmtCodeInput = (s) => {
  const c = normCode(s).slice(0, 8);
  return c.length > 4 ? `${c.slice(0, 4)}-${c.slice(4)}` : c;
};

function Center({ children }) {
  return <div className="stu-center">{children}</div>;
}

function Login({ onSignIn }) {
  const [err, setErr] = useState("");
  return (
    <Center>
      <div className="stu-logo">Aura</div>
      <p className="stu-sub">선생님과 함께하는 보컬 레슨 기록</p>
      <button className="stu-btn" onClick={() => onSignIn().catch((e) => setErr(e.code || e.message))}>Google로 시작하기</button>
      {err && <p className="stu-err">{err}</p>}
    </Center>
  );
}

function EnterCode({ user, notice, onDone, onLogOut }) {
  const [text, setText] = useState("");
  const [inv, setInv] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const find = async () => {
    setErr(""); setBusy(true);
    try { setInv(await lookupInvite(text)); } catch (e) { setErr(e.code === "permission-denied" ? "서버 설정이 아직 끝나지 않았어요. 선생님께 알려주세요." : e.message); }
    setBusy(false);
  };
  const confirm = async () => {
    setBusy(true); setErr("");
    try { await redeemInvite(user, inv); onDone(); } catch (e) { console.error(e); setErr("연결하지 못했어요: " + (e.code || e.message)); setBusy(false); }
  };

  if (inv) {
    return (
      <Center>
        <p className="stu-sub">이 선생님과 연결할까요?</p>
        <div className="stu-card" style={{ textAlign: "center", width: "100%" }}>
          <p className="stu-big">{inv.trainerName || "선생님"}</p>
          <p className="stu-muted">{inv.studentName ? `${inv.studentName} 학생으로 연결돼요` : ""}</p>
        </div>
        <button className="stu-btn" disabled={busy} onClick={confirm}>{busy ? "연결 중..." : "연결하기"}</button>
        <button className="stu-link" onClick={() => { setInv(null); setErr(""); }}>다시 입력</button>
        {err && <p className="stu-err">{err}</p>}
      </Center>
    );
  }
  return (
    <Center>
      <p className="stu-big">선생님이 알려준 코드를 입력하세요</p>
      {notice && <p className="stu-notice">{notice}</p>}
      <input
        className="stu-code" inputMode="text" autoCapitalize="characters" autoComplete="off" spellCheck={false}
        value={text} placeholder="ABCD-2345" aria-label="학생 코드"
        onChange={(e) => setText(fmtCodeInput(e.target.value))}
        onKeyDown={(e) => e.key === "Enter" && normCode(text).length === 8 && find()}
      />
      <button className="stu-btn" disabled={busy || normCode(text).length !== 8} onClick={find}>{busy ? "확인 중..." : "다음"}</button>
      {err && <p className="stu-err">{err}</p>}
      <button className="stu-link" onClick={onLogOut}>다른 계정으로 로그인</button>
    </Center>
  );
}

function Segments({ list }) {
  if (!list?.length) return null;
  return (
    <div className="stu-segs">
      {list.map((s, i) => {
        const st = STATUS.find((x) => x.key === s.status);
        return (
          <div className="stu-seg" key={i}>
            <div className="stu-seg-head">
              <b>{s.name}</b>
              {s.song && <span className="stu-song">{s.song}</span>}
              {st && <span className={`stu-st st-${st.key}`}>{st.label}</span>}
            </div>
            {s.note && <p className="stu-seg-note">{s.note}</p>}
          </div>
        );
      })}
    </div>
  );
}

// 과제: 내가 체크하고, 선생님이 확인한 결과도 같이 보인다
function Homework({ lesson, link, user }) {
  const items = lesson.homeworkItems || [];
  const { items: mine, setStatus } = usePractice(link, user, lesson.id);
  const [err, setErr] = useState("");
  if (!items.length) return null;
  const done = items.filter((h) => mine.find((x) => x.text === h.text)?.status).length;
  return (
    <div className="stu-card">
      <div className="stu-row-between">
        <p className="stu-label">이번 과제</p>
        <span className="stu-muted">{done}/{items.length} 체크</span>
      </div>
      {items.map((h) => {
        const my = mine.find((x) => x.text === h.text)?.status || "";
        const tr = HW_STATUS.find((x) => x.key === h.status);
        return (
          <div className="stu-hw" key={h.text}>
            <p className="stu-hw-text">{h.text}</p>
            <div className="stu-hw3">
              {HW_STATUS.map((s) => (
                <button key={s.key} className={`stu-hwb ${my === s.key ? "on" : ""}`} data-k={s.key}
                  onClick={() => setStatus(items, h.text, s.key).catch((e) => setErr("저장하지 못했어요: " + (e.code || e.message)))}>
                  {s.label}
                </button>
              ))}
            </div>
            {tr && <p className="stu-tr">선생님 확인: {tr.label}</p>}
          </div>
        );
      })}
      {err && <p className="stu-err">{err}</p>}
    </div>
  );
}

function LessonView({ lesson }) {
  return (
    <div className="stu-card">
      <p className="stu-label">{lesson.lessonNo ? `${lesson.lessonNo}회차 · ` : ""}{fmtDate(lesson.date, true)}</p>
      {lesson.note && <p className="stu-note">{lesson.note}</p>}
      <Segments list={lesson.segments} />
      {!lesson.note && !lesson.segments?.length && <p className="stu-muted">남겨진 내용이 없어요</p>}
    </div>
  );
}

function Today({ lessons, link, user }) {
  const latest = lessons[0];
  if (!latest) {
    return (
      <div className="stu-empty">
        <p className="stu-big">아직 공유된 레슨이 없어요</p>
        <p className="stu-muted">선생님이 레슨 후 공유하면 여기에 나타나요</p>
      </div>
    );
  }
  return (
    <>
      <h1 className="stu-h1">오늘</h1>
      <p className="stu-muted" style={{ marginBottom: 12 }}>가장 최근 레슨이에요</p>
      <LessonView lesson={latest} />
      <Homework lesson={latest} link={link} user={user} />
    </>
  );
}

function History({ lessons, onOpen }) {
  return (
    <>
      <h1 className="stu-h1">기록</h1>
      {lessons.length === 0 && <p className="stu-muted">아직 공유된 레슨이 없어요</p>}
      {lessons.map((l) => (
        <button className="stu-item" key={l.id} onClick={() => onOpen(l)}>
          <span className="stu-item-date">{fmtDate(l.date)}</span>
          <span className="stu-item-body">
            {l.lessonNo ? `${l.lessonNo}회차` : "레슨"}
            <small>{(l.segments || []).map((s) => s.name).join(" · ") || l.note || ""}</small>
          </span>
          <span className="stu-chev">›</span>
        </button>
      ))}
    </>
  );
}

function Detail({ lesson, link, user, onBack }) {
  return (
    <>
      <button className="stu-back" onClick={onBack}>‹ 기록</button>
      <LessonView lesson={lesson} />
      <Homework lesson={lesson} link={link} user={user} />
    </>
  );
}

function Settings({ link, user, onLogOut }) {
  return (
    <>
      <h1 className="stu-h1">설정</h1>
      <div className="stu-card">
        <p className="stu-label">연결된 선생님</p>
        <p className="stu-big" style={{ margin: "6px 0 2px" }}>{link.trainerName || "선생님"}</p>
        <p className="stu-muted">{link.studentName ? `${link.studentName} 학생` : ""}</p>
      </div>
      <div className="stu-card">
        <p className="stu-label">계정</p>
        <p className="stu-muted" style={{ margin: "6px 0 10px" }}>{user.email}</p>
        <button className="stu-btn ghost" onClick={onLogOut}>로그아웃</button>
      </div>
      <p className="stu-muted" style={{ fontSize: 11, textAlign: "center" }}>연결을 바꾸려면 선생님께 새 코드를 요청하세요</p>
    </>
  );
}

function Main({ link, user, onLogOut }) {
  const { lessons, loading, error } = useSharedLessons(link);
  const [tab, setTab] = useState("today");
  const [open, setOpen] = useState(null);

  // 폰의 뒤로 가기로 상세에서 목록으로 돌아오게
  useEffect(() => {
    const onPop = () => setOpen(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const openLesson = (l) => { window.history.pushState({ stu: 1 }, ""); setOpen(l); };
  const live = open && lessons.find((l) => l.id === open.id);

  return (
    <div className="stu-wrap">
      <main className="stu-main">
        {loading ? <p className="stu-muted">불러오는 중...</p>
          : error ? <p className="stu-err">불러오지 못했어요: {error}</p>
          : tab === "today" ? <Today lessons={lessons} link={link} user={user} />
          : tab === "history" ? (live ? <Detail lesson={live} link={link} user={user} onBack={() => window.history.back()} /> : <History lessons={lessons} onOpen={openLesson} />)
          : <Settings link={link} user={user} onLogOut={onLogOut} />}
      </main>
      <nav className="stu-tabs">
        {[["today", "오늘"], ["history", "기록"], ["settings", "설정"]].map(([k, label]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); setOpen(null); }}>{label}</button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  const { user, loading, signIn, logOut } = useStudentAuth();
  const { phase, link, notice, error, recheck } = useLink(user);

  if (loading) return <Center><p className="stu-muted">불러오는 중...</p></Center>;
  if (!user) return <Login onSignIn={signIn} />;
  if (phase === "loading") return <Center><p className="stu-muted">불러오는 중...</p></Center>;
  if (phase === "error") {
    return (
      <Center>
        <p className="stu-big">연결 정보를 읽지 못했어요</p>
        <p className="stu-muted">{error === "permission-denied" ? "서버 설정이 아직 끝나지 않았어요. 선생님께 알려주세요." : error}</p>
        <button className="stu-btn" onClick={recheck}>다시 시도</button>
        <button className="stu-link" onClick={logOut}>로그아웃</button>
      </Center>
    );
  }
  if (phase === "needCode") return <EnterCode user={user} notice={notice} onDone={recheck} onLogOut={logOut} />;
  return <Main link={link} user={user} onLogOut={logOut} />;
}

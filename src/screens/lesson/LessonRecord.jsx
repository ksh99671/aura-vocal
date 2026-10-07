import { useState, useEffect, useRef } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { useLessonLogs } from "../../hooks/useFirestore";
import { useLessonItems } from "../../hooks/useLessonItems";
import {
  STATUS, HW_STATUS, composeMemo, toSegments, rowFromItem, rowsFromSegments,
  splitHomework, cleanHw, hwItemsFromLog, hwScore, fmtScore,
} from "../../lib/lessonMemo";

const draftKey = (id) => `aura:lesson-draft:${id}`;
const loadDraft = (id) => {
  try {
    return JSON.parse(localStorage.getItem(draftKey(id)) || "null");
  } catch {
    return null;
  }
};

export default function LessonRecord({ go, params }) {
  const student = params?.student;
  const isNew = !!params?.isNew;
  const { items, loaded } = useLessonItems();
  const { logs, addLog } = useLessonLogs(student?.id);

  const [rows, setRows] = useState(() => (student && loadDraft(student.id)?.rows) || []);
  // 다음 과제: 한 줄에 하나. (예전 임시저장은 글 한 덩어리였으니 줄로 쪼개서 이어받는다)
  const [hwTexts, setHwTexts] = useState(() => {
    const d = student && loadDraft(student.id);
    if (d?.hwTexts?.length) return d.hwTexts;
    const old = splitHomework(d?.homework);
    return old.length ? [...old, ""] : [""];
  });
  const [localHw, setLocalHw] = useState(null); // 지난 과제 확인 결과 (저장이 끝나기 전에도 바로 보이게)
  const [hwErr, setHwErr] = useState("");
  const [focusHw, setFocusHw] = useState(-1);
  const [firstMemo, setFirstMemo] = useState(() => (student && loadDraft(student.id)?.firstMemo) || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);

  const lessonNo = Number(student?.baseCount || 0) + logs.length + 1;
  const hwClean = cleanHw(hwTexts);
  const canSave = rows.length > 0 || hwClean.length > 0 || (isNew && firstMemo.trim() !== "");

  const prev = logs[0];
  const prevItems = !isNew ? hwItemsFromLog(prev) : [];
  const hwItems = localHw || prevItems;
  const score = hwScore(hwItems);
  useEffect(() => setLocalHw(null), [prev?.id]);

  // 지난 과제를 "했어요 / 조금 했어요 / 못 했어요"로 확인. 지난 레슨 기록 자체에 바로 저장한다
  const setHwStatus = async (idx, key) => {
    if (!prev) return;
    const base = hwItems;
    const next = base.map((x, i) => (i === idx ? { ...x, status: x.status === key ? "" : key } : x));
    setLocalHw(next);
    setHwErr("");
    try {
      await updateDoc(doc(db, "trainers", auth.currentUser.uid, "students", student.id, "lessonLogs", prev.id), {
        homeworkItems: next.map((x) => ({ text: x.text, status: x.status })),
        homeworkCheckedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
      setLocalHw(base);
      setHwErr("저장하지 못했어요: " + (e.code || e.message));
    }
  };

  // 못 했거나 조금만 한 과제는 "이어서 내기" 후보로만 제안한다 (자동으로 넣지는 않는다)
  const have = new Set(hwTexts.map((t) => t.trim().toLowerCase()).filter(Boolean));
  const suggestions = hwItems.filter((x) => (x.status === "partial" || x.status === "skip") && !have.has(x.text.toLowerCase()));
  const addHw = (text) =>
    setHwTexts((list) => {
      const n = [...list];
      const i = n.findIndex((t) => !t.trim());
      if (i >= 0) n[i] = text;
      else n.push(text);
      if (n[n.length - 1].trim()) n.push("");
      return n;
    });
  const changeHw = (i, v) => setHwTexts((l) => l.map((t, k) => (k === i ? v : t)));
  const removeHw = (i) => setHwTexts((l) => (l.length > 1 ? l.filter((_, k) => k !== i) : [""]));
  const onHwKey = (e, i) => {
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (!hwTexts[i].trim()) return;
      setHwTexts((l) => {
        const n = [...l];
        n.splice(i + 1, 0, "");
        return n;
      });
      setFocusHw(i + 1);
    }
  };
  useEffect(() => {
    if (focusHw >= 0) {
      document.getElementById(`hw-${focusHw}`)?.focus();
      setFocusHw(-1);
    }
  }, [focusHw]);

  const addRow = (item) => setRows((r) => [...r, rowFromItem(item)]);
  const updateRow = (key, patch) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const removeRow = (key) => setRows((r) => r.filter((x) => x.key !== key));

  // 쓰는 중 자동 임시저장 (화면을 옮기거나 새로고침해도 안 사라지게)
  useEffect(() => {
    if (!student) return;
    const empty = rows.length === 0 && hwClean.length === 0 && firstMemo.trim() === "";
    const t = setTimeout(() => {
      try {
        if (empty) {
          localStorage.removeItem(draftKey(student.id));
          setDraftSaved(false);
        } else {
          localStorage.setItem(draftKey(student.id), JSON.stringify({ rows, hwTexts, firstMemo }));
          setDraftSaved(true);
        }
      } catch {
        /* 저장 공간이 없어도 기록은 계속 쓸 수 있다 */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [rows, hwTexts, firstMemo, student?.id]);

  const save = async () => {
    if (!student || saving || !canSave) return;
    setSaving(true);
    setError("");
    try {
      const memo = composeMemo(rows, hwClean);
      await addLog({
        memo: memo || "첫 레슨",
        segments: toSegments(rows),
        homework: hwClean.join("\n"),
        homeworkItems: hwClean.map((text) => ({ text, status: "" })),
      });
      let updated = student;
      if (isNew && firstMemo.trim()) {
        await updateDoc(doc(db, "trainers", auth.currentUser.uid, "students", student.id), { memo: firstMemo.trim() });
        updated = { ...student, memo: firstMemo.trim() };
      }
      try {
        localStorage.removeItem(draftKey(student.id));
      } catch {
        /* 무시 */
      }
      go("studentDetail", { student: updated });
    } catch (err) {
      console.error(err);
      setError("저장하지 못했어요: " + (err.code || err.message));
      setSaving(false);
    }
  };

  // 컴퓨터 키보드: 1~9 = 항목 추가, Ctrl/⌘ + Enter = 저장
  const live = useRef({});
  live.current = { items: loaded ? items : [], save, addRow };
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        live.current.save();
        return;
      }
      const t = e.target;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[1-9]$/.test(e.key)) {
        const it = live.current.items[Number(e.key) - 1];
        if (it) {
          e.preventDefault();
          live.current.addRow(it);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!student) {
    return (
      <div className="screen">
        <BackButton label="Home" onClick={() => go("home")} />
        <p style={{ fontSize: 13, color: "var(--text2)" }}>학생을 먼저 선택해주세요.</p>
        <NavBar go={go} active="home" />
      </div>
    );
  }

  const prevDate = prev?.date?.toDate?.()?.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
  const todayLabel = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });

  return (
    <div className="screen">
      <BackButton label="학생 선택" onClick={() => go("lessonHub")} />

      <div className="rec-head">
        <div>
          <p className="eyebrow">{isNew ? "First Lesson" : "Lesson"}</p>
          <h2 className="screen-title" style={{ marginBottom: 2 }}>
            <strong>{student.name}</strong> · {lessonNo}회차
          </h2>
          <p className="rec-sub">{todayLabel}</p>
        </div>
        {draftSaved && <span className="rec-auto">자동 임시저장됨</span>}
      </div>

      <div className="rec-cols">
        <div className="rec-left">
          {isNew && (
            <div className="rec-first">
              <p className="rec-lbl">첫 레슨 메모 — 학생의 현재 상태, 목표, 고민</p>
              <textarea
                className="rec-textarea"
                rows={3}
                value={firstMemo}
                onChange={(e) => setFirstMemo(e.target.value)}
                placeholder="학생 프로필의 트레이너 메모로 저장돼요"
              />
            </div>
          )}

          {hwItems.length > 0 && (
            <div className="rec-hwcheck">
              <div className="rec-hwhead">
                <b>지난 과제 확인</b>
                <span>{prevDate ? `${prevDate} 레슨` : ""}</span>
              </div>
              {hwItems.map((it, i) => (
                <div className="rec-hwitem" key={`${i}-${it.text}`}>
                  <p className="rec-hwtext">{it.text}</p>
                  <div className="rec-hw3">
                    {HW_STATUS.map((s) => (
                      <button
                        key={s.key}
                        className={`hw3 ${it.status === s.key ? "on" : ""}`}
                        data-k={s.key}
                        onClick={() => setHwStatus(i, s.key)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rec-hwsum">
                <span>{score.unchecked > 0 ? `아직 확인 안 한 과제 ${score.unchecked}개` : "모두 확인했어요"}</span>
                {score.total > 0 && <b>이행 {fmtScore(score.score)} / {score.total}</b>}
              </div>
              {hwErr && <p className="error-text" style={{ marginTop: 8 }}>{hwErr}</p>}
            </div>
          )}

          <p className="rec-lbl">오늘 한 것 — 눌러서 추가</p>
          {!loaded ? (
            <p className="rec-empty" style={{ textAlign: "left", padding: "8px 0" }}>수업 항목을 불러오는 중...</p>
          ) : (
          <div className="rec-chips">
            {items.map((it, i) => (
              <button
                key={it.id}
                className="rec-chip"
                style={{ background: `${it.color}1f`, borderColor: `${it.color}80`, color: it.color }}
                onClick={() => addRow(it)}
              >
                <i style={{ background: it.color }} />
                {i < 9 && <kbd className="rec-kbd">{i + 1}</kbd>}
                {it.name}
              </button>
            ))}
            <button className="rec-chip rec-chip-add" onClick={() => go("settings")} aria-label="수업 항목 편집">
              ＋
            </button>
          </div>
          )}

          <p className="rec-lbl">기록 {rows.length}</p>
          {rows.length === 0 ? (
            <p className="rec-empty">위 칩을 눌러 오늘 한 것을 추가하세요</p>
          ) : (
            <div className="rec-card">
              {rows.map((r) => (
                <div className="rec-row" key={r.key}>
                  <div className="rec-main">
                    <i className="rec-dot" style={{ background: r.color }} />
                    <b className="rec-name">{r.name}</b>
                    {r.hasSong && (
                      <input
                        className="rec-song"
                        value={r.song}
                        onChange={(e) => updateRow(r.key, { song: e.target.value })}
                        placeholder="곡 이름"
                      />
                    )}
                  </div>
                  <input
                    className="rec-note"
                    value={r.note}
                    onChange={(e) => updateRow(r.key, { note: e.target.value })}
                    placeholder="메모"
                  />
                  <div className="rec-status">
                    {STATUS.map((s) => (
                      <button
                        key={s.key}
                        className={`rec-st ${r.status === s.key ? "on" : ""}`}
                        data-k={s.key}
                        onClick={() => updateRow(r.key, { status: r.status === s.key ? "" : s.key })}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <button className="rec-x" onClick={() => removeRow(r.key)} aria-label="삭제">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rec-right">
          {prev && (
            <div className="rec-prev">
              <p className="rec-lbl" style={{ margin: 0 }}>
                지난 레슨{prevDate ? ` · ${prevDate}` : ""}
              </p>
              <p className="rec-prev-body">{(prev.memo || "").split("\n").slice(0, 4).join("\n")}</p>
              {prev.segments && prev.segments.length > 0 && (
                <button className="rec-link" onClick={() => setRows((r) => [...r, ...rowsFromSegments(prev.segments, items)])}>
                  ↻ 지난 항목 그대로 추가
                </button>
              )}
            </div>
          )}

          <p className="rec-lbl">다음 과제 — 한 줄에 하나</p>
          {suggestions.length > 0 && (
            <div className="rec-sugg">
              <span className="rec-suggl">지난번에 못 한 것</span>
              {suggestions.map((s) => (
                <button key={s.text} onClick={() => addHw(s.text)}>
                  + {s.text}
                </button>
              ))}
            </div>
          )}
          {hwTexts.map((t, i) => (
            <div className="rec-hwrow" key={i}>
              <input
                id={`hw-${i}`}
                className="rec-hw-in"
                value={t}
                onChange={(e) => changeHw(i, e.target.value)}
                onKeyDown={(e) => onHwKey(e, i)}
                placeholder={i === 0 ? "예: 스케일 5분" : "과제 추가"}
              />
              {(hwTexts.length > 1 || t.trim()) && (
                <button className="rec-x" onClick={() => removeHw(i)} aria-label="과제 삭제">
                  ✕
                </button>
              )}
            </div>
          ))}

          <div className="rec-save">
            {error && <p className="error-text" style={{ marginBottom: 8 }}>{error}</p>}
            <button className="btn-primary" disabled={!canSave || saving} onClick={save}>
              {saving ? "저장 중..." : `저장 (${lessonNo}회차)`}
            </button>
            <p className="rec-kh">⌘ / Ctrl + Enter 로 저장</p>
          </div>
        </div>
      </div>

      <NavBar go={go} active="home" />
    </div>
  );
}

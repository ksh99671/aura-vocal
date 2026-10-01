import { useState, useEffect } from "react";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { useVaultNotes, useVaultCategories, deleteNote, setNoteVisibility, updateNoteText } from "../../hooks/useVault";
import { useStudents } from "../../hooks/useFirestore";
import { getPhoto } from "../../lib/photoStore";

const VIS = [
  { key: "private", label: "비공개" },
  { key: "all", label: "전체 학생" },
  { key: "some", label: "특정 학생" },
];

export default function VaultNote({ go, params }) {
  const noteId = params?.noteId;
  const { notes, loading } = useVaultNotes();
  const { categories } = useVaultCategories();
  const { students } = useStudents();

  const note = notes.find((n) => n.id === noteId);
  const photos = note?.photos || [];
  const [idx, setIdx] = useState(0);
  const [full, setFull] = useState({}); // { 사진id: 원본 dataURL }
  const [lightbox, setLightbox] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [visError, setVisError] = useState("");
  const [editField, setEditField] = useState(null); // "title" | "body" | null
  const [draft, setDraft] = useState("");

  const cur = photos[Math.min(idx, Math.max(photos.length - 1, 0))];

  // 선택한 사진의 원본을 불러온다 (그동안은 썸네일을 보여줌)
  useEffect(() => {
    if (!note || !cur || full[cur.id]) return;
    let alive = true;
    getPhoto(note.id, cur.id)
      .then((src) => { if (alive && src) setFull((f) => ({ ...f, [cur.id]: src })); })
      .catch(console.error);
    return () => { alive = false; };
  }, [note?.id, cur?.id]);

  if (!note) {
    return (
      <div className="screen">
        <BackButton label="Vault" onClick={() => go("library")} />
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          {loading ? "노트를 불러오는 중..." : "노트를 찾을 수 없어요. 삭제됐을 수 있어요."}
        </p>
        <NavBar go={go} active="library" />
      </div>
    );
  }

  const cat = categories.find((c) => c.id === note.categoryId);
  const heroSrc = cur ? full[cur.id] || cur.thumb : null;
  const dateStr = note.updatedAt?.toDate?.()?.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) || "";

  const flash = () => {
    setSavedFlash(true);
    // 알림 효과 길이(CSS의 --speed에 따라 달라짐)에 맞춰 화면에서 뺀다
    const sp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--speed")) || 1;
    setTimeout(() => setSavedFlash(false), 2200 * sp + 120);
  };

  // 제목/내용: 글자를 누르면 바로 고칠 수 있고, 바깥을 누르면 저장된다
  const startEdit = (field) => {
    setDraft(field === "title" ? note.title || "" : note.body || "");
    setEditField(field);
  };
  const commit = async () => {
    const field = editField;
    if (!field) return;
    setEditField(null);
    const cur = field === "title" ? note.title || "" : note.body || "";
    const next = field === "title" ? draft.trim() : draft;
    if (field === "title" && !next) return; // 빈 제목은 저장하지 않고 원래대로
    if (next === cur) return;
    try {
      await updateNoteText(note.id, { [field]: next });
      flash();
    } catch (err) {
      console.error(err);
      alert("저장하지 못했어요: " + (err.code || err.message));
    }
  };

  // 공개 범위는 누르는 즉시 저장된다
  const setVis = async (visibility, sharedWith) => {
    setVisError("");
    try {
      await setNoteVisibility(note.id, visibility, sharedWith);
      flash();
    } catch (err) {
      console.error(err);
      setVisError("저장하지 못했어요: " + (err.code || err.message));
    }
  };
  const pickVis = (key) => {
    if (key !== note.visibility) setVis(key, note.sharedWith || []);
  };
  const toggleStudent = (id) => {
    const cur = note.sharedWith || [];
    setVis("some", cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };
  const picked = note.sharedWith || [];

  const remove = async () => {
    if (!confirm("이 노트를 삭제할까요? 사진도 함께 삭제돼요.")) return;
    setDeleting(true);
    try {
      await deleteNote(note);
      go("library");
    } catch (err) {
      console.error(err);
      alert("삭제하지 못했어요: " + (err.code || err.message));
      setDeleting(false);
    }
  };

  return (
    <div className="screen">
      <BackButton label="Vault" onClick={() => go("library")} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {cat && (
          <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, fontWeight: 600, background: `${cat.color}22`, color: cat.color }}>
            {cat.name}
          </span>
        )}
        <span style={{ fontSize: 11, color: "var(--text3)" }}>{dateStr}</span>
        <button
          onClick={() => go("vaultEdit", { noteId: note.id })}
          style={{ marginLeft: "auto", fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
        >사진·카테고리</button>
      </div>
      {editField === "title" ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          style={{
            width: "100%", fontSize: 22, fontWeight: 600, color: "var(--text1)", letterSpacing: "-.01em",
            background: "var(--bg3)", border: "0.5px solid var(--accent-mid)", borderRadius: 12,
            padding: "8px 12px", fontFamily: "inherit", outline: "none", marginBottom: 14,
          }}
        />
      ) : (
        <h2
          onClick={() => startEdit("title")}
          style={{ fontSize: 22, fontWeight: 600, color: "var(--text1)", letterSpacing: "-.01em", lineHeight: 1.3, marginBottom: 14, cursor: "text" }}
        >
          {note.title}
        </h2>
      )}

      {/* 사진 */}
      {photos.length > 0 && (
        <>
          <div
            onClick={() => setLightbox(true)}
            style={{
              height: 230, borderRadius: 16, position: "relative", overflow: "hidden", cursor: "zoom-in",
              backgroundImage: `url("${heroSrc}")`, backgroundSize: "cover", backgroundPosition: "center",
              border: "0.5px solid var(--border2)",
            }}
          >
            <span style={{
              position: "absolute", right: 10, bottom: 10, fontSize: 10, color: "#f0eee8",
              background: "rgba(8,8,10,0.65)", padding: "3px 9px", borderRadius: 10,
            }}>{Math.min(idx, photos.length - 1) + 1} / {photos.length}</span>
          </div>
          {photos.length > 1 && (
            <div style={{ display: "flex", gap: 7, margin: "9px 0 4px", overflowX: "auto" }}>
              {photos.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => setIdx(i)}
                  style={{
                    width: 54, height: 54, borderRadius: 10, flexShrink: 0, cursor: "pointer",
                    backgroundImage: `url("${p.thumb}")`, backgroundSize: "cover", backgroundPosition: "center",
                    border: i === idx ? "1.5px solid var(--accent)" : "1.5px solid transparent",
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 내용 */}
      {editField === "body" ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          rows={Math.max(6, draft.split("\n").length + 1)}
          style={{
            width: "100%", fontSize: 14, lineHeight: 1.9, color: "var(--text1)",
            background: "var(--bg3)", border: "0.5px solid var(--accent-mid)", borderRadius: 12,
            padding: "12px 14px", fontFamily: "inherit", outline: "none", resize: "vertical", margin: "14px 0 16px",
          }}
        />
      ) : (
        <p
          onClick={() => startEdit("body")}
          style={{
            fontSize: 14, lineHeight: 1.9, whiteSpace: "pre-wrap", margin: "14px 0 16px", cursor: "text",
            color: note.body ? "var(--text1)" : "var(--text3)",
          }}
        >
          {note.body || "눌러서 내용을 작성해보세요"}
        </p>
      )}

      {/* 공개 범위 — 누르면 바로 저장 */}
      <div className="result-card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <p className="card-label" style={{ marginBottom: 0 }}>공개 범위</p>
        </div>

        <div style={{ display: "flex", background: "var(--bg3)", borderRadius: 12, padding: 3, gap: 3 }}>
          {VIS.map((v) => (
            <button
              key={v.key}
              onClick={() => pickVis(v.key)}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 12, fontFamily: "inherit", cursor: "pointer",
                border: "none",
                background: note.visibility === v.key ? "var(--accent-dim)" : "transparent",
                color: note.visibility === v.key ? "var(--accent)" : "var(--text2)",
                fontWeight: note.visibility === v.key ? 600 : 400,
              }}
            >{v.label}</button>
          ))}
        </div>

        {note.visibility === "some" && (
          <>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
              {students.length === 0 && (
                <p style={{ fontSize: 12, color: "var(--text3)" }}>학생을 먼저 추가해주세요</p>
              )}
              {students.map((s) => {
                const on = picked.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleStudent(s.id)}
                    style={{
                      padding: "7px 13px", borderRadius: 14, fontSize: 12, fontFamily: "inherit", cursor: "pointer",
                      background: on ? "rgba(167,139,218,0.15)" : "var(--bg3)",
                      color: on ? "#a78bda" : "var(--text2)",
                      border: `0.5px solid ${on ? "#a78bda" : "var(--border2)"}`,
                    }}
                  >{on ? "✓ " : ""}{s.name}</button>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 9 }}>
              {picked.length === 0 ? "공개할 학생을 골라주세요. 아무도 고르지 않으면 나만 볼 수 있어요." : `${picked.length}명에게 공개 중`}
            </p>
          </>
        )}
        {note.visibility === "all" && (
          <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 9 }}>등록된 모든 학생에게 보여요</p>
        )}
        {(!note.visibility || note.visibility === "private") && (
          <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 9 }}>나만 볼 수 있어요</p>
        )}
        {visError && <p className="error-text" style={{ marginTop: 8 }}>{visError}</p>}
        <p style={{ fontSize: 10, color: "var(--text3)", marginTop: 10, lineHeight: 1.6 }}>
          학생 앱을 연결하기 전에는 설정만 저장돼요.
        </p>
      </div>

      <button
        onClick={remove}
        disabled={deleting}
        style={{
          width: "100%", padding: "11px", background: "transparent",
          color: "rgba(224,74,74,0.7)", border: "0.5px solid rgba(224,74,74,0.2)",
          borderRadius: 12, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        }}
      >{deleting ? "삭제 중..." : "노트 삭제"}</button>

      {savedFlash && (
        <div style={{
          position: "fixed", bottom: 92, left: "50%", transform: "translateX(-50%)", zIndex: 250,
          background: "var(--text1)", color: "var(--bg)", fontSize: 12, fontWeight: 500,
          padding: "8px 15px", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}>✓ 저장됨</div>
      )}

      {/* 사진 크게 보기 */}
      {lightbox && heroSrc && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 300,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 12, cursor: "zoom-out",
          }}
        >
          <img src={heroSrc} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 }} />
        </div>
      )}

      <NavBar go={go} active="library" />
    </div>
  );
}

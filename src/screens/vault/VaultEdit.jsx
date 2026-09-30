import { useState, useEffect, useRef } from "react";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { useVaultNotes, useVaultCategories, newNoteId, saveNote } from "../../hooks/useVault";
import { useStudents } from "../../hooks/useFirestore";
import { prepareImage, MAX_PHOTOS } from "../../lib/photoStore";

const VIS = [
  { key: "private", label: "비공개" },
  { key: "all", label: "전체 학생" },
  { key: "some", label: "특정 학생" },
];

export default function VaultEdit({ go, params }) {
  const editingId = params?.noteId || null;
  const { notes } = useVaultNotes();
  const { categories } = useVaultCategories();
  const { students } = useStudents();

  const idRef = useRef(editingId || newNoteId());
  const noteId = idRef.current;
  const existing = notes.find((n) => n.id === editingId);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [sharedWith, setSharedWith] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [loaded, setLoaded] = useState(!editingId);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  // 수정할 때: 기존 노트 내용을 한 번만 채워 넣는다
  useEffect(() => {
    if (editingId && existing && !loaded) {
      setTitle(existing.title || "");
      setBody(existing.body || "");
      setCategoryId(existing.categoryId || "");
      setVisibility(existing.visibility || "private");
      setSharedWith(existing.sharedWith || []);
      setPhotos((existing.photos || []).map((p) => ({ id: p.id, thumb: p.thumb })));
      setLoaded(true);
    }
  }, [existing, loaded, editingId]);

  const addPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    setError("");
    setBusy(true);
    try {
      for (const f of files.slice(0, Math.max(room, 0))) {
        const p = await prepareImage(f);
        setPhotos((prev) => [...prev, { ...p, pending: true }]);
      }
      if (files.length > room) setError(`사진은 최대 ${MAX_PHOTOS}장까지 넣을 수 있어요`);
    } catch (err) {
      setError(err.message || "사진을 처리하지 못했어요");
    } finally {
      setBusy(false);
    }
  };

  const removePhotoItem = (p) => {
    setPhotos((prev) => prev.filter((x) => x.id !== p.id));
    if (!p.pending) setRemovedIds((prev) => [...prev, p.id]);
  };

  const toggleStudent = (id) =>
    setSharedWith((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const cancel = () => (editingId ? go("vaultNote", { noteId }) : go("library"));

  const save = async () => {
    if (!title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveNote(
        noteId,
        {
          title: title.trim(),
          body,
          categoryId,
          visibility,
          sharedWith: visibility === "some" ? sharedWith : [],
          photos,
        },
        { isNew: !editingId, pending: photos.filter((p) => p.pending), removedIds }
      );
      go("vaultNote", { noteId });
    } catch (err) {
      console.error(err);
      setError("저장하지 못했어요: " + (err.code || err.message));
      setSaving(false);
    }
  };

  if (editingId && !loaded) {
    return (
      <div className="screen">
        <BackButton label="Vault" onClick={() => go("library")} />
        <p style={{ fontSize: 13, color: "var(--text2)" }}>노트를 불러오는 중...</p>
        <NavBar go={go} active="library" />
      </div>
    );
  }

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 12,
    background: "var(--bg3)", border: "0.5px solid var(--border2)",
    color: "var(--text1)", fontFamily: "inherit", outline: "none",
  };

  return (
    <div className="screen">
      <BackButton label={editingId ? "노트" : "Vault"} onClick={cancel} />
      <p className="eyebrow">{editingId ? "Edit Note" : "New Note"}</p>
      <h2 className="screen-title" style={{ marginBottom: 6 }}><strong>{editingId ? "노트 수정" : "새 노트"}</strong></h2>

      <p className="card-label" style={{ marginTop: 16 }}>제목</p>
      <input
        value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 복식호흡 3단계 정리"
        style={{ ...inputStyle, fontSize: 15, fontWeight: 600 }}
      />

      <p className="card-label" style={{ marginTop: 16 }}>카테고리</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {categories.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--text3)" }}>카테고리가 없어요. Vault 목록에서 만들 수 있어요.</p>
        )}
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(categoryId === c.id ? "" : c.id)}
            style={{
              padding: "6px 13px", borderRadius: 14, fontSize: 11, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
              background: categoryId === c.id ? `${c.color}22` : "var(--bg3)",
              color: categoryId === c.id ? c.color : "var(--text2)",
              border: `0.5px solid ${categoryId === c.id ? c.color : "var(--border2)"}`,
            }}
          >{c.name}</button>
        ))}
      </div>

      <p className="card-label" style={{ marginTop: 16 }}>사진 ({photos.length}/{MAX_PHOTOS})</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {photos.map((p) => (
          <div key={p.id} style={{
            width: 72, height: 72, borderRadius: 12, position: "relative", flexShrink: 0,
            backgroundImage: `url("${p.thumb}")`, backgroundSize: "cover", backgroundPosition: "center",
            border: "0.5px solid var(--border2)",
          }}>
            <button
              onClick={() => removePhotoItem(p)}
              style={{
                position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                background: "var(--bg)", color: "var(--text1)", border: "0.5px solid var(--border2)",
                fontSize: 11, cursor: "pointer", lineHeight: 1, padding: 0,
              }}
            >✕</button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            style={{
              width: 72, height: 72, borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
              border: "0.5px dashed var(--border2)", background: "transparent", color: "var(--text2)",
              fontSize: busy ? 10 : 22, flexShrink: 0,
            }}
          >{busy ? "처리 중" : "+"}</button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={addPhotos} style={{ display: "none" }} />

      <p className="card-label" style={{ marginTop: 16 }}>내용</p>
      <textarea
        value={body} onChange={(e) => setBody(e.target.value)} rows={9}
        placeholder="정리한 내용을 자유롭게 적어보세요"
        style={{ ...inputStyle, fontSize: 14, lineHeight: 1.8, resize: "vertical", minHeight: 160 }}
      />

      <p className="card-label" style={{ marginTop: 16 }}>공개 범위</p>
      <div style={{ display: "flex", background: "var(--bg3)", borderRadius: 12, padding: 3, gap: 3 }}>
        {VIS.map((v) => (
          <button
            key={v.key}
            onClick={() => setVisibility(v.key)}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 12, fontFamily: "inherit", cursor: "pointer",
              border: "none",
              background: visibility === v.key ? "var(--accent-dim)" : "transparent",
              color: visibility === v.key ? "var(--accent)" : "var(--text2)",
              fontWeight: visibility === v.key ? 600 : 400,
            }}
          >{v.label}</button>
        ))}
      </div>
      {visibility === "some" && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {students.length === 0 && <p style={{ fontSize: 12, color: "var(--text3)" }}>학생을 먼저 추가해주세요</p>}
          {students.map((s) => {
            const on = sharedWith.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleStudent(s.id)}
                style={{
                  padding: "6px 12px", borderRadius: 14, fontSize: 11, fontFamily: "inherit", cursor: "pointer",
                  background: on ? "rgba(167,139,218,0.15)" : "var(--bg3)",
                  color: on ? "#a78bda" : "var(--text2)",
                  border: `0.5px solid ${on ? "#a78bda" : "var(--border2)"}`,
                }}
              >{s.name}</button>
            );
          })}
        </div>
      )}
      <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, lineHeight: 1.6 }}>
        공개 범위는 저장만 돼요. 학생 앱에서 보이는 건 학생 앱을 만들 때 연결해요.
      </p>

      {error && <p className="error-text" style={{ marginTop: 12 }}>{error}</p>}

      <div className="btn-row" style={{ marginTop: 18 }}>
        <button className="btn-secondary" onClick={cancel}>취소</button>
        <button className="btn-primary" style={{ flex: 2 }} disabled={saving || busy} onClick={save}>
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>

      <NavBar go={go} active="library" />
    </div>
  );
}

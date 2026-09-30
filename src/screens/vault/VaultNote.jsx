import { useState, useEffect } from "react";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { useVaultNotes, useVaultCategories, deleteNote } from "../../hooks/useVault";
import { useStudents } from "../../hooks/useFirestore";
import { getPhoto } from "../../lib/photoStore";

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

  let visText = "비공개";
  if (note.visibility === "all") visText = "전체 학생";
  if (note.visibility === "some") {
    const names = (note.sharedWith || []).map((id) => students.find((s) => s.id === id)?.name).filter(Boolean);
    visText = names.length ? names.join(", ") : "특정 학생 (선택된 학생 없음)";
  }

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
        >수정</button>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text1)", letterSpacing: "-.01em", lineHeight: 1.3, marginBottom: 14 }}>
        {note.title}
      </h2>

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
      <p style={{
        fontSize: 14, lineHeight: 1.9, whiteSpace: "pre-wrap", margin: "14px 0 16px",
        color: note.body ? "var(--text1)" : "var(--text3)",
      }}>
        {note.body || "내용이 없어요. 수정을 눌러 작성해보세요."}
      </p>

      {/* 공개 범위 */}
      <div className="result-card" style={{ marginBottom: 12 }}>
        <p className="card-label" style={{ marginBottom: 6 }}>공개 범위</p>
        <p style={{ fontSize: 13, color: note.visibility === "private" ? "var(--text2)" : "var(--accent)", fontWeight: 500 }}>{visText}</p>
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

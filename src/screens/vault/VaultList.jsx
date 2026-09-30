import { useState } from "react";
import NavBar from "../../components/NavBar";
import { useVaultNotes, useVaultCategories } from "../../hooks/useVault";

const PRESET_COLORS = ["#c9a96e", "#a78bda", "#5ec4a0", "#e07b6a", "#6ab0e0", "#e0a06a"];

function visLabel(note) {
  if (note.visibility === "all") return "전체 공개";
  if (note.visibility === "some") return `학생 ${note.sharedWith?.length || 0}명`;
  return "비공개";
}

const dateLabel = (t) =>
  t?.toDate?.()?.toLocaleDateString("ko-KR", { month: "long", day: "numeric" }) || "";

function CategoryModal({ categories, onAdd, onDelete, onClose }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onAdd(name.trim(), color);
    setName("");
    setSaving(false);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg2)", borderRadius: "20px 20px 0 0",
          padding: "22px 22px 40px", width: "100%", maxWidth: 480,
          border: "0.5px solid var(--border2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text1)" }}>노트 카테고리 관리</p>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: "var(--text2)", cursor: "pointer" }}>✕</button>
        </div>

        <p style={{ fontSize: 10, color: "var(--text3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>현재 카테고리</p>
        {categories.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 18 }}>아직 카테고리가 없어요</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            {categories.map((cat) => (
              <div key={cat.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px", background: "var(--bg3)", borderRadius: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text1)" }}>{cat.name}</span>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`"${cat.name}" 카테고리를 삭제할까요? 이 카테고리의 노트는 삭제되지 않고 분류만 사라져요.`)) onDelete(cat.id);
                  }}
                  style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 14 }}
                >🗑</button>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: 10, color: "var(--text3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>새 카테고리 추가</p>
        <input
          placeholder="카테고리 이름" value={name} onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%", padding: "11px 14px", borderRadius: 11,
            background: "var(--bg3)", border: "0.5px solid var(--border2)",
            color: "var(--text1)", fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 12,
          }}
        />
        <p style={{ fontSize: 10, color: "var(--text3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>색상 선택</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {PRESET_COLORS.map((c) => (
            <div key={c} onClick={() => setColor(c)} style={{
              width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer",
              border: color === c ? "2.5px solid var(--text1)" : "2px solid transparent",
            }} />
          ))}
        </div>
        <button className="btn-primary" disabled={!name.trim() || saving} onClick={handleAdd}>
          {saving ? "추가 중..." : "추가"}
        </button>
      </div>
    </div>
  );
}

export default function VaultList({ go }) {
  const { notes, loading, error } = useVaultNotes();
  const { categories, addCategory, deleteCategory } = useVaultCategories();
  const [filter, setFilter] = useState(null);
  const [showCat, setShowCat] = useState(false);

  const shown = filter ? notes.filter((n) => n.categoryId === filter) : notes;
  const catOf = (n) => categories.find((c) => c.id === n.categoryId);

  return (
    <div className="screen">
      <div style={{ paddingTop: 52, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p className="eyebrow">Vault</p>
          <h2 className="screen-title" style={{ marginBottom: 0 }}><strong>내 노트</strong></h2>
        </div>
        <button
          onClick={() => go("vaultEdit", {})}
          style={{
            fontSize: 11, fontWeight: 600, color: "#0e0e12", background: "var(--accent)",
            border: "none", padding: "7px 13px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
          }}
        >+ 새 노트</button>
      </div>

      {/* 카테고리 필터 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        <button
          onClick={() => setFilter(null)}
          style={{
            padding: "6px 12px", borderRadius: 16, fontSize: 11, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
            background: filter === null ? "var(--accent-dim)" : "var(--bg2)",
            color: filter === null ? "var(--accent)" : "var(--text2)",
            border: `0.5px solid ${filter === null ? "var(--accent)" : "var(--border2)"}`,
          }}
        >전체</button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(filter === cat.id ? null : cat.id)}
            style={{
              padding: "6px 12px", borderRadius: 16, fontSize: 11, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
              background: filter === cat.id ? `${cat.color}22` : "var(--bg2)",
              color: filter === cat.id ? cat.color : "var(--text2)",
              border: `0.5px solid ${filter === cat.id ? cat.color : "var(--border2)"}`,
            }}
          >{cat.name}</button>
        ))}
        <button
          onClick={() => setShowCat(true)}
          style={{
            padding: "6px 10px", borderRadius: 16, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
            border: "0.5px dashed var(--border2)", background: "transparent", color: "var(--text3)",
          }}
        >+ 카테고리</button>
      </div>

      {error && (
        <div className="highlight-card">
          <p className="card-label">노트를 불러오지 못했어요</p>
          <p className="card-value" style={{ fontSize: 12 }}>
            {error === "permission-denied"
              ? "Firestore 규칙에서 vault 경로가 막혀 있어요. 규칙을 확인해야 해요."
              : error}
          </p>
        </div>
      )}

      {/* 빈 화면 */}
      {!loading && !error && shown.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 10px 30px" }}>
          <div style={{ fontSize: 30, opacity: 0.5, marginBottom: 12 }}>📓</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text1)", marginBottom: 6 }}>
            {filter ? "이 카테고리에는 노트가 없어요" : "아직 노트가 없어요"}
          </p>
          <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.7, marginBottom: 18 }}>
            수업하면서 정리한 발성법이나<br />공부한 내용을 여기에 쌓아보세요.
          </p>
          <button className="btn-primary" style={{ width: "auto", padding: "11px 20px" }} onClick={() => go("vaultEdit", {})}>
            + 첫 노트 쓰기
          </button>
        </div>
      )}

      {/* 커버 그리드 */}
      <div className="vault-grid">
        {shown.map((n) => {
          const cat = catOf(n);
          const cover = n.photos?.[0]?.thumb;
          const hasPhoto = !!cover;
          const color = cat?.color || "#c9a96e";
          const bg = hasPhoto
            ? { backgroundImage: `url("${cover}")`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: `linear-gradient(160deg, ${color}38 0%, var(--bg2) 62%)` };
          return (
            <div
              key={n.id}
              onClick={() => go("vaultNote", { noteId: n.id })}
              style={{
                height: 150, borderRadius: 14, padding: 11, position: "relative", overflow: "hidden", cursor: "pointer",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                border: "0.5px solid var(--border2)", ...bg,
              }}
            >
              {hasPhoto && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.05) 25%, rgba(8,8,10,0.85) 100%)",
                }} />
              )}
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {cat ? (
                  <span style={{
                    fontSize: 8, fontWeight: 600, color, letterSpacing: ".04em",
                    padding: hasPhoto ? "2px 7px" : 0, borderRadius: 8,
                    background: hasPhoto ? "rgba(8,8,10,0.55)" : "transparent",
                  }}>{cat.name}</span>
                ) : <span />}
                {hasPhoto ? (
                  <span style={{ fontSize: 8, color: "#f0eee8", background: "rgba(8,8,10,0.6)", padding: "2px 6px", borderRadius: 8 }}>
                    {n.photos.length}장
                  </span>
                ) : (
                  <span style={{ fontSize: 8, color: "var(--text3)" }}>{visLabel(n)}</span>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <p style={{
                  fontSize: 13, fontWeight: 600, lineHeight: 1.35, letterSpacing: "-.01em",
                  color: hasPhoto ? "#f0eee8" : "var(--text1)",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>{n.title}</p>
                <p style={{ fontSize: 8, marginTop: 4, color: hasPhoto ? "rgba(240,238,232,0.55)" : "var(--text3)" }}>
                  {dateLabel(n.updatedAt)}{hasPhoto ? ` · ${visLabel(n)}` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showCat && (
        <CategoryModal
          categories={categories}
          onAdd={addCategory}
          onDelete={deleteCategory}
          onClose={() => setShowCat(false)}
        />
      )}

      <NavBar go={go} active="library" />
    </div>
  );
}

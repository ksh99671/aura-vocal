import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { auth } from "../firebase";
import { useLessonItems, ITEM_COLORS } from "../hooks/useLessonItems";

function ItemRow({ item, index, last, onUpdate, onDelete, onMove }) {
  const [name, setName] = useState(item.name);
  const [pick, setPick] = useState(false);
  useEffect(() => setName(item.name), [item.name]);

  const commitName = () => {
    const nm = name.trim();
    if (!nm) {
      setName(item.name);
      return;
    }
    if (nm !== item.name) onUpdate(item.id, { name: nm });
  };

  return (
    <div className="set-item">
      <div className="set-row">
        <div className="set-move">
          <button disabled={index === 0} onClick={() => onMove(item.id, -1)} aria-label="위로">▲</button>
          <button disabled={last} onClick={() => onMove(item.id, 1)} aria-label="아래로">▼</button>
        </div>
        <button className="set-dot" style={{ background: item.color }} onClick={() => setPick(!pick)} aria-label="색 바꾸기" />
        <input
          className="set-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
        <label className="set-toggle">
          곡 입력
          <input type="checkbox" checked={!!item.song} onChange={(e) => onUpdate(item.id, { song: e.target.checked })} />
          <span className="set-sw" />
        </label>
        <button
          className="set-del"
          onClick={() => confirm(`"${item.name}" 항목을 삭제할까요? 이미 저장된 기록은 그대로 남아요.`) && onDelete(item.id)}
          aria-label="삭제"
        >
          ✕
        </button>
      </div>
      {pick && (
        <div className="set-colors">
          {ITEM_COLORS.map((c) => (
            <button
              key={c}
              className={item.color === c ? "on" : ""}
              style={{ background: c }}
              onClick={() => { onUpdate(item.id, { color: c }); setPick(false); }}
              aria-label={c}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Settings({ go, logOut }) {
  const user = auth.currentUser;
  const { items, loaded, addItem, updateItem, deleteItem, moveItem, resetItems } = useLessonItems();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(ITEM_COLORS[0]);

  const submit = async () => {
    if (!newName.trim()) return;
    await addItem(newName.trim(), newColor);
    setNewName("");
    setAdding(false);
  };

  return (
    <div className="screen">
      <div style={{ paddingTop: 52, marginBottom: 24 }}>
        <p className="eyebrow">Settings</p>
        <h2 className="screen-title"><strong>설정</strong></h2>
      </div>

      <div className="result-card" style={{ marginBottom: 16 }}>
        <p className="card-label">계정</p>
        <p style={{ fontSize: 14, color: "var(--text1)", marginTop: 6 }}>{user?.email}</p>
        <button
          onClick={logOut}
          style={{ marginTop: 12, fontSize: 13, color: "#e24b4a", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}
        >
          로그아웃
        </button>
      </div>

      <div className="set-cols">
        <div>
          <div className="section-header">
            <p className="section-title">수업 항목</p>
            <button className="section-link" onClick={() => confirm("수업 항목을 기본 5개로 되돌릴까요?") && resetItems()}>
              기본값으로
            </button>
          </div>
          <p style={{ fontSize: 12, color: "var(--text2)", marginBottom: 10, lineHeight: 1.6 }}>
            수업 중 눌러서 기록하는 칩이에요. 이름과 색을 정하고, 순서를 바꿀 수 있어요.
          </p>

          {!loaded ? (
            <p style={{ fontSize: 12, color: "var(--text3)", padding: "14px 0" }}>불러오는 중...</p>
          ) : (
          <>
          <div className="set-card">
            {items.map((it, i) => (
              <ItemRow
                key={it.id}
                item={it}
                index={i}
                last={i === items.length - 1}
                onUpdate={updateItem}
                onDelete={deleteItem}
                onMove={moveItem}
              />
            ))}
            {items.length === 0 && <p style={{ fontSize: 12, color: "var(--text3)", padding: "14px 0" }}>항목이 없어요. 아래에서 추가해보세요.</p>}
          </div>

          {adding ? (
            <div className="checklist-item" style={{ marginTop: 10 }}>
              <p className="checklist-label">새 항목 이름</p>
              <input
                type="text"
                placeholder="예: 음정 · 리듬"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                autoFocus
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 15, fontWeight: 500, color: "var(--text1)", fontFamily: "inherit", marginTop: 6 }}
              />
              <div className="set-colors" style={{ marginTop: 10 }}>
                {ITEM_COLORS.map((c) => (
                  <button key={c} className={newColor === c ? "on" : ""} style={{ background: c }} onClick={() => setNewColor(c)} aria-label={c} />
                ))}
              </div>
              <div className="btn-row" style={{ marginTop: 12 }}>
                <button className="btn-secondary" onClick={() => { setAdding(false); setNewName(""); }}>취소</button>
                <button className="btn-primary" style={{ flex: 2 }} disabled={!newName.trim()} onClick={submit}>추가</button>
              </div>
            </div>
          ) : (
            <button className="btn-dashed" style={{ marginTop: 10 }} onClick={() => setAdding(true)}>
              + 항목 추가
            </button>
          )}
          </>
          )}
        </div>

        <div className="set-preview">
          <p className="card-label">미리보기 — 기록 화면에 이렇게 보여요</p>
          <div className="rec-chips" style={{ marginBottom: 0 }}>
            {items.map((it, i) => (
              <span
                key={it.id}
                className="rec-chip"
                style={{ background: `${it.color}1f`, borderColor: `${it.color}80`, color: it.color, cursor: "default" }}
              >
                <i style={{ background: it.color }} />
                {i < 9 && <kbd className="rec-kbd">{i + 1}</kbd>}
                {it.name}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 12, lineHeight: 1.7 }}>
            컴퓨터에서는 키보드 1~9로 순서대로 추가돼요. "곡 입력"을 켠 항목만 곡 이름 칸이 나와요.
          </p>
        </div>
      </div>

      <NavBar go={go} active="settings" />
    </div>
  );
}

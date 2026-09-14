import { useState } from "react";
import NavBar from "../../components/NavBar";
import { useStudents, useCategories } from "../../hooks/useFirestore";

const PRESET_COLORS = ["#c9a96e","#a78bda","#5ec4a0","#e07b6a","#6ab0e0","#e0a06a"];

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
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.6)",
      display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200,
    }} onClick={onClose}>
      <div style={{
        background:"var(--bg2)", borderRadius:"20px 20px 0 0",
        padding:"22px 22px 40px", width:"100%", maxWidth:480,
        border:"0.5px solid var(--border2)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18}}>
          <p style={{fontSize:15, fontWeight:600, color:"var(--text1)"}}>카테고리 관리</p>
          <button onClick={onClose} style={{background:"none", border:"none", fontSize:20, color:"var(--text2)", cursor:"pointer"}}>✕</button>
        </div>

        {/* 기존 카테고리 */}
        <p style={{fontSize:10, color:"var(--text3)", letterSpacing:".08em", textTransform:"uppercase", marginBottom:8}}>현재 카테고리</p>
        <div style={{display:"flex", flexDirection:"column", gap:6, marginBottom:18}}>
          {categories.map(cat => (
            <div key={cat.id} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"10px 12px", background:"var(--bg3)", borderRadius:10,
            }}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <div style={{width:10, height:10, borderRadius:"50%", background:cat.color}} />
                <span style={{fontSize:13, fontWeight:500, color:"var(--text1)"}}>{cat.name}</span>
              </div>
              <button onClick={() => onDelete(cat.id)} style={{background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:14}}>🗑</button>
            </div>
          ))}
        </div>

        {/* 새 카테고리 추가 */}
        <p style={{fontSize:10, color:"var(--text3)", letterSpacing:".08em", textTransform:"uppercase", marginBottom:8}}>새 카테고리 추가</p>
        <input
          placeholder="카테고리 이름"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            width:"100%", padding:"11px 14px", borderRadius:11,
            background:"var(--bg3)", border:"0.5px solid var(--border2)",
            color:"var(--text1)", fontSize:13, fontFamily:"inherit",
            outline:"none", marginBottom:12,
          }}
        />

        <p style={{fontSize:10, color:"var(--text3)", letterSpacing:".08em", textTransform:"uppercase", marginBottom:8}}>색상 선택</p>
        <div style={{display:"flex", gap:8, marginBottom:18}}>
          {PRESET_COLORS.map(c => (
            <div key={c} onClick={() => setColor(c)} style={{
              width:26, height:26, borderRadius:"50%", background:c, cursor:"pointer",
              border: color === c ? "2.5px solid #fff" : "2px solid transparent",
              transition:"border .15s",
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

export default function StudentsList({ go }) {
  const { students, addStudent } = useStudents();
  const { categories, addCategory, deleteCategory } = useCategories();
  const [activeFilter, setActiveFilter] = useState(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = activeFilter
    ? students.filter(s => s.category === activeFilter)
    : students;

  const getCat = (catId) => categories.find(c => c.id === catId);

  const handleAddStudent = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    await addStudent(newName.trim(), newCategory || categories[0]?.id || "");
    setNewName("");
    setNewCategory("");
    setShowAddStudent(false);
    setSaving(false);
  };

  return (
    <div className="screen">
      <div style={{paddingTop:52, marginBottom:4}}>
        <p className="eyebrow">Students</p>
        <h2 className="screen-title"><strong>내 학생</strong></h2>
      </div>

      {/* 카테고리 필터 */}
      <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:16, alignItems:"center"}}>
        {categories.map(cat => (
          <button key={cat.id}
            onClick={() => setActiveFilter(activeFilter === cat.id ? null : cat.id)}
            style={{
              padding:"6px 12px", borderRadius:16, fontSize:11, fontWeight:500,
              background: activeFilter === cat.id ? `${cat.color}22` : "var(--bg2)",
              color: activeFilter === cat.id ? cat.color : "var(--text2)",
              border: `0.5px solid ${activeFilter === cat.id ? cat.color : "var(--border2)"}`,
              cursor:"pointer", fontFamily:"inherit", transition:"all .15s",
            }}
          >{cat.name}</button>
        ))}
        <button
          onClick={() => setShowCatModal(true)}
          style={{
            padding:"6px 10px", borderRadius:16, fontSize:11,
            border:"0.5px dashed var(--border2)", background:"transparent",
            color:"var(--text3)", cursor:"pointer", fontFamily:"inherit",
          }}
        >+ 카테고리</button>
      </div>

      {/* 학생 목록 */}
      {filtered.length === 0 ? (
        <div style={{textAlign:"center", padding:"40px 0"}}>
          <p style={{fontSize:14, color:"var(--text2)"}}>학생이 없어요</p>
          <p style={{fontSize:12, color:"var(--text3)", marginTop:4}}>아래 버튼으로 추가해보세요</p>
        </div>
      ) : (
        filtered.map(s => {
          const cat = getCat(s.category);
          return (
            <div key={s.id} className="student-card" onClick={() => go("studentDetail", { student: s })}>
              <div className="student-avatar">{s.name.slice(-1)}</div>
              <div style={{flex:1}}>
                <p className="student-name">{s.name}</p>
                <p className="student-sub">탭해서 상세 보기</p>
              </div>
              {cat && (
                <span style={{
                  fontSize:10, padding:"2px 8px", borderRadius:10, fontWeight:500,
                  background:`${cat.color}22`, color:cat.color,
                }}>{cat.name}</span>
              )}
            </div>
          );
        })
      )}

      {/* 학생 추가 */}
      {showAddStudent ? (
        <div className="checklist-item" style={{marginTop:8}}>
          <p className="checklist-label">학생 이름</p>
          <input
            type="text" placeholder="이름 입력" value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddStudent()}
            autoFocus
            style={{
              width:"100%", background:"transparent", border:"none",
              outline:"none", fontSize:15, fontWeight:500,
              color:"var(--text1)", fontFamily:"inherit", marginTop:6,
            }}
          />
          <p className="checklist-label" style={{marginTop:10}}>카테고리</p>
          <div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:6}}>
            {categories.map(cat => (
              <button key={cat.id}
                onClick={() => setNewCategory(cat.id)}
                style={{
                  padding:"5px 10px", borderRadius:14, fontSize:11, fontWeight:500,
                  background: newCategory === cat.id ? `${cat.color}22` : "var(--bg3)",
                  color: newCategory === cat.id ? cat.color : "var(--text2)",
                  border:`0.5px solid ${newCategory === cat.id ? cat.color : "var(--border2)"}`,
                  cursor:"pointer", fontFamily:"inherit",
                }}
              >{cat.name}</button>
            ))}
          </div>
          <div className="btn-row" style={{marginTop:12}}>
            <button className="btn-secondary" onClick={() => { setShowAddStudent(false); setNewName(""); }}>취소</button>
            <button className="btn-primary" disabled={!newName.trim() || saving} onClick={handleAddStudent}>
              {saving ? "저장 중..." : "추가"}
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-dashed" style={{marginTop:8}} onClick={() => setShowAddStudent(true)}>
          + 학생 추가
        </button>
      )}

      {showCatModal && (
        <CategoryModal
          categories={categories}
          onAdd={addCategory}
          onDelete={deleteCategory}
          onClose={() => setShowCatModal(false)}
        />
      )}

      <NavBar go={go} active="studentSelect" />
    </div>
  );
}

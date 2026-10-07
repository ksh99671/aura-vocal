import { useState, useEffect, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { useStudents, useCategories } from "../../hooks/useFirestore";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function LessonStart({ go }) {
  const { students, addStudent } = useStudents();
  const { categories } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const pending = useRef(null); // 방금 만든 학생을 찾는 중일 때 { name, category, before, id?, done }
  const timer = useRef(null);
  const studentsRef = useRef(students);
  studentsRef.current = students;

  const catOf = (id) => categories.find((c) => c.id === id);

  const finish = async (found) => {
    const p = pending.current;
    p.done = true;
    clearTimeout(timer.current);
    const start = todayStr();
    // 카테고리와 수강 시작일은 학생 상세와 같은 방식으로 직접 저장해서, 추가 함수의 모양에 기대지 않는다
    try {
      await updateDoc(doc(db, "trainers", auth.currentUser.uid, "students", found.id), {
        category: p.category,
        startDate: start,
        baseCount: 0,
      });
    } catch (e) {
      console.error(e);
    }
    go("lessonRecord", { student: { ...found, category: p.category, startDate: start, baseCount: 0 }, isNew: true });
  };

  // 학생 목록에 방금 만든 학생이 나타나면 첫 레슨으로 넘어간다
  const check = () => {
    const p = pending.current;
    if (!p || p.done) return;
    const list = studentsRef.current;
    const found = p.id
      ? list.find((s) => s.id === p.id)
      : list.find((s) => !p.before.has(s.id) && s.name === p.name);
    if (found) finish(found);
  };
  useEffect(check, [students]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const create = async () => {
    const nm = name.trim();
    if (!nm || creating) return;
    setCreating(true);
    setError("");
    pending.current = {
      name: nm,
      category: category || categories[0]?.id || "",
      before: new Set(studentsRef.current.map((s) => s.id)),
      done: false,
    };
    timer.current = setTimeout(() => {
      if (pending.current && !pending.current.done) {
        pending.current = null;
        setCreating(false);
        setError("학생을 추가하지 못했어요. 잠시 후 다시 시도해주세요.");
      }
    }, 8000);
    try {
      const ret = await addStudent(nm);
      if (ret && ret.id && pending.current) pending.current.id = ret.id;
      check();
    } catch (e) {
      console.error(e);
      clearTimeout(timer.current);
      pending.current = null;
      setCreating(false);
      setError("학생을 추가하지 못했어요: " + (e.code || e.message));
    }
  };

  const formOpen = showForm || students.length === 0;

  return (
    <div className="screen">
      <BackButton label="Home" onClick={() => go("home")} />
      <p className="eyebrow">Lesson</p>
      <h2 className="screen-title" style={{ marginBottom: 14 }}>
        <strong>누구와 레슨할까요?</strong>
      </h2>

      {!formOpen && (
        <button className="btn-dashed" style={{ marginBottom: 12 }} onClick={() => setShowForm(true)}>
          + 신규 학생
        </button>
      )}

      {formOpen && (
        <div className="checklist-item" style={{ marginBottom: 12 }}>
          <p className="checklist-label">신규 학생 이름</p>
          <input
            type="text"
            placeholder="이름 입력"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            autoFocus
            style={{
              width: "100%", background: "transparent", border: "none", outline: "none",
              fontSize: 15, fontWeight: 500, color: "var(--text1)", fontFamily: "inherit", marginTop: 6,
            }}
          />
          {categories.length > 0 && (
            <>
              <p className="checklist-label" style={{ marginTop: 10 }}>카테고리</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    style={{
                      padding: "6px 12px", borderRadius: 14, fontSize: 12, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
                      background: category === c.id ? `${c.color}22` : "var(--bg3)",
                      color: category === c.id ? c.color : "var(--text2)",
                      border: `0.5px solid ${category === c.id ? c.color : "var(--border2)"}`,
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </>
          )}
          {error && <p className="error-text" style={{ marginTop: 10 }}>{error}</p>}
          <div className="btn-row" style={{ marginTop: 12 }}>
            {students.length > 0 && (
              <button className="btn-secondary" onClick={() => { setShowForm(false); setName(""); setError(""); }}>
                취소
              </button>
            )}
            <button className="btn-primary" style={{ flex: 2 }} disabled={!name.trim() || creating} onClick={create}>
              {creating ? "추가 중..." : "첫 레슨 시작 →"}
            </button>
          </div>
        </div>
      )}

      {students.length > 0 && <p className="rec-lbl" style={{ marginTop: 4 }}>기존 학생</p>}
      {students.map((s) => {
        const cat = catOf(s.category);
        return (
          <div key={s.id} className="student-card" onClick={() => go("lessonRecord", { student: s })}>
            <div className="student-avatar">{(s.name || "?").slice(-1)}</div>
            <div style={{ flex: 1 }}>
              <p className="student-name">{s.name}</p>
              <p className="student-sub">탭해서 수업 기록</p>
            </div>
            {cat && (
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 500, background: `${cat.color}22`, color: cat.color }}>
                {cat.name}
              </span>
            )}
          </div>
        );
      })}

      <NavBar go={go} active="home" />
    </div>
  );
}

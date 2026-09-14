import { useState } from "react";
import { useLessons } from "../hooks/useFirestore";
import { useStudents } from "../hooks/useFirestore";

const TODAY = new Date().getDate();
const THIS_MONTH = new Date().getMonth() + 1;
const THIS_YEAR = new Date().getFullYear();

const DAYS_IN_MONTH = new Date(THIS_YEAR, THIS_MONTH, 0).getDate();
const FIRST_DAY = new Date(THIS_YEAR, THIS_MONTH - 1, 1).getDay();

const STUDENT_COLORS = ["#c9a96e","#a78bda","#5ec4a0","#e07b6a","#6ab0e0","#e0a06a"];

function getHeatLevel(count) {
  if (!count) return "h0";
  if (count === 1) return "h1";
  if (count === 2) return "h2";
  if (count === 3) return "h3";
  return "h4";
}

// 일정 추가 모달
function AddLessonModal({ students, onAdd, onClose }) {
  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState(`${THIS_YEAR}-${String(THIS_MONTH).padStart(2,"0")}-${String(TODAY).padStart(2,"0")}`);
  const [time, setTime] = useState("14:00");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedStudent = students.find(s => s.id === studentId);

  const handleAdd = async () => {
    if (!studentId || !date || !time) return;
    setSaving(true);
    await onAdd({ studentId, studentName: selectedStudent?.name || "", date, time, memo });
    setSaving(false);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      z: 200, zIndex: 200,
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg2)", borderRadius: "20px 20px 0 0",
        padding: "24px 22px 40px", width: "100%", maxWidth: 480,
        border: "0.5px solid var(--border2)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
          <p style={{fontSize:16, fontWeight:600, color:"var(--text1)"}}>일정 추가</p>
          <button onClick={onClose} style={{background:"none", border:"none", fontSize:20, color:"var(--text2)", cursor:"pointer"}}>✕</button>
        </div>

        {/* 학생 선택 */}
        <p style={{fontSize:11, color:"var(--text2)", letterSpacing:".06em", textTransform:"uppercase", marginBottom:8}}>학생</p>
        <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:16}}>
          {students.map(s => (
            <button key={s.id}
              onClick={() => setStudentId(s.id)}
              style={{
                padding:"8px 14px", borderRadius:20, fontSize:13, fontWeight:500,
                background: studentId === s.id ? "var(--accent-dim)" : "var(--bg3)",
                color: studentId === s.id ? "var(--accent)" : "var(--text1)",
                border: `0.5px solid ${studentId === s.id ? "var(--accent)" : "var(--border2)"}`,
                cursor:"pointer", fontFamily:"inherit", transition:"all .15s"
              }}
            >{s.name}</button>
          ))}
        </div>

        {/* 날짜 */}
        <p style={{fontSize:11, color:"var(--text2)", letterSpacing:".06em", textTransform:"uppercase", marginBottom:8}}>날짜</p>
        <input
          type="date" value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            width:"100%", padding:"12px 14px", borderRadius:12,
            background:"var(--bg3)", border:"0.5px solid var(--border2)",
            color:"var(--text1)", fontSize:14, fontFamily:"inherit",
            outline:"none", marginBottom:16,
          }}
        />

        {/* 시간 */}
        <p style={{fontSize:11, color:"var(--text2)", letterSpacing:".06em", textTransform:"uppercase", marginBottom:8}}>시간</p>
        <input
          type="time" value={time}
          onChange={e => setTime(e.target.value)}
          style={{
            width:"100%", padding:"12px 14px", borderRadius:12,
            background:"var(--bg3)", border:"0.5px solid var(--border2)",
            color:"var(--text1)", fontSize:14, fontFamily:"inherit",
            outline:"none", marginBottom:16,
          }}
        />

        {/* 메모 */}
        <p style={{fontSize:11, color:"var(--text2)", letterSpacing:".06em", textTransform:"uppercase", marginBottom:8}}>메모 (선택)</p>
        <textarea
          value={memo} onChange={e => setMemo(e.target.value)}
          placeholder="간단한 메모"
          rows={2}
          style={{
            width:"100%", padding:"12px 14px", borderRadius:12,
            background:"var(--bg3)", border:"0.5px solid var(--border2)",
            color:"var(--text1)", fontSize:13, fontFamily:"inherit",
            outline:"none", resize:"none", marginBottom:20, lineHeight:1.6,
          }}
        />

        <button
          className="btn-primary"
          disabled={!studentId || !date || !time || saving}
          onClick={handleAdd}
        >
          {saving ? "저장 중..." : "일정 추가"}
        </button>
      </div>
    </div>
  );
}

export default function Home({ go, theme, toggleTheme }) {
  const isDark = theme === "dark";
  const { lessons, addLesson, deleteLesson } = useLessons();
  const { students } = useStudents();
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [showModal, setShowModal] = useState(false);

  // 학생별 색상 매핑
  const studentColorMap = {};
  students.forEach((s, i) => {
    studentColorMap[s.id] = STUDENT_COLORS[i % STUDENT_COLORS.length];
  });

  // 날짜별 레슨 그룹핑
  const lessonsByDay = {};
  lessons.forEach(lesson => {
    if (!lesson.date) return;
    const day = parseInt(lesson.date.split("-")[2]);
    if (!lessonsByDay[day]) lessonsByDay[day] = [];
    lessonsByDay[day].push(lesson);
  });

  const selectedLessons = lessonsByDay[selectedDay] || [];

  return (
    <div className="screen">

      {/* 헤더 */}
      <div className="home-header">
        <div>
          <p className="home-greeting">안녕하세요 👋</p>
          <h1 className="home-title">오늘의<br /><strong>레슨 일정</strong></h1>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          <span className="theme-toggle-icon">{isDark ? "🌙" : "☀️"}</span>
          <div className={`theme-toggle-track ${!isDark ? "on" : ""}`}>
            <div className="theme-toggle-thumb" />
          </div>
        </button>
      </div>

      {/* 달력 */}
      <div className="section-header">
        <p className="section-title">{THIS_YEAR}년 {THIS_MONTH}월</p>
        <button className="section-link" onClick={() => setShowModal(true)}>+ 일정 추가</button>
      </div>
      <div className="cal-card">
        <div className="cal-header">
          <button className="cal-nav">‹</button>
          <span className="cal-month">{THIS_MONTH}월</span>
          <button className="cal-nav">›</button>
        </div>
        <div className="cal-grid">
          {["일","월","화","수","목","금","토"].map(d => (
            <div key={d} className="cal-day-label">{d}</div>
          ))}
          {Array.from({length: FIRST_DAY}).map((_, i) => (
            <div key={`empty-${i}`} className="cal-day" />
          ))}
          {Array.from({length: DAYS_IN_MONTH}, (_, i) => i + 1).map(day => {
            const count = (lessonsByDay[day] || []).length;
            const level = getHeatLevel(count);
            return (
              <div
                key={day}
                className={`cal-day ${level} ${day === TODAY ? "today" : ""} ${day === selectedDay ? "selected" : ""}`}
                onClick={() => setSelectedDay(day)}
              >
                <span className="cal-day-num">{day}</span>
                {count > 0 && <span className="cal-day-count">{count}명</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 선택된 날 일정 */}
      <div className="schedule-card">
        <p className="schedule-label">{THIS_MONTH}월 {selectedDay}일</p>
        {selectedLessons.length === 0 ? (
          <p style={{fontSize:13, color:"var(--text3)", textAlign:"center", padding:"12px 0"}}>
            일정이 없어요
          </p>
        ) : (
          selectedLessons.map((lesson, i) => (
            <div key={lesson.id} className="schedule-item">
              <div className="schedule-bar" style={{background: studentColorMap[lesson.studentId] || "var(--accent)"}} />
              <div style={{flex:1}}>
                <p className="schedule-name">{lesson.studentName}</p>
                <p className="schedule-time">{lesson.time} {lesson.memo && `· ${lesson.memo}`}</p>
              </div>
              <button
                onClick={() => deleteLesson(lesson.id)}
                style={{background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:16, padding:"0 4px"}}
              >✕</button>
            </div>
          ))
        )}
        <button
          onClick={() => setShowModal(true)}
          style={{
            width:"100%", marginTop:10, padding:"9px",
            background:"none", border:"0.5px dashed var(--border2)",
            borderRadius:10, fontSize:12, color:"var(--text2)",
            cursor:"pointer", fontFamily:"inherit"
          }}
        >+ 이 날 일정 추가</button>
      </div>

      <div className="section-divider" />

      {/* 레슨 카드 */}
      <div className="lesson-card-main" onClick={() => go("lessonHub")}>
        <div className="lesson-card-deco">👥</div>
        <p className="lesson-card-ey">Lesson Mode</p>
        <h2 className="lesson-card-title">레슨 시작</h2>
        <p className="lesson-card-desc">학생을 선택하고 레슨 메모를 작성해요</p>
        <span className="lesson-card-btn">시작하기 →</span>
      </div>

      {/* 일정 추가 모달 */}
      {showModal && (
        <AddLessonModal
          students={students}
          onAdd={addLesson}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* 탭바 */}
      <nav className="nav-bar">
        <button className="nav-item active">
          <span className="nav-icon">⊙</span>
          <div className="nav-pip" />
        </button>
        <button className="nav-item" onClick={() => go("history")}>
          <span className="nav-icon">◷</span>
          <span className="nav-label">History</span>
        </button>
        <button className="nav-item" onClick={() => go("studentSelect")}>
          <span className="nav-icon">👥</span>
          <span className="nav-label">Students</span>
        </button>
        <button className="nav-item" onClick={() => go("library")}>
          <span className="nav-icon">📓</span>
          <span className="nav-label">Vault</span>
        </button>
        <button className="nav-item" onClick={() => go("settings")}>
          <span className="nav-icon">◈</span>
          <span className="nav-label">Settings</span>
        </button>
      </nav>
    </div>
  );
}

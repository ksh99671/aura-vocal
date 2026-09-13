import { useState } from "react";

const STUDENT_COLORS = ["#c9a96e","#a78bda","#5ec4a0","#e07b6a","#6ab0e0","#e0a06a"];

const MOCK_STUDENTS = [
  { id: "s1", name: "학생 A", category: "exam", color: "#c9a96e" },
  { id: "s2", name: "학생 B", category: "hobby", color: "#a78bda" },
  { id: "s3", name: "학생 C", category: "exam", color: "#5ec4a0" },
];

const MOCK_LESSONS = {
  2: ["s1"], 4: ["s2"], 5: ["s1","s2"],
  8: ["s2"], 9: ["s1"], 11: ["s1","s2","s3"],
  13: ["s1","s2"], 15: ["s3"], 16: ["s1","s2","s3","s3"],
  18: ["s1","s2"], 21: ["s1"], 22: ["s1","s2"],
  24: ["s2"], 25: ["s1","s2","s3"],
};

const TODAY = 13;

function getHeatLevel(count) {
  if (!count) return "h0";
  if (count === 1) return "h1";
  if (count === 2) return "h2";
  if (count === 3) return "h3";
  return "h4";
}

export default function Home({ go, theme, toggleTheme }) {
  const isDark = theme === "dark";
  const [selectedDay, setSelectedDay] = useState(TODAY);

  const selectedLessons = (MOCK_LESSONS[selectedDay] || []).map(sid =>
    MOCK_STUDENTS.find(s => s.id === sid)
  ).filter(Boolean);

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
        <p className="section-title">2026년 9월</p>
        <button className="section-link">+ 일정 추가</button>
      </div>
      <div className="cal-card">
        <div className="cal-header">
          <button className="cal-nav">‹</button>
          <span className="cal-month">9월</span>
          <button className="cal-nav">›</button>
        </div>
        <div className="cal-grid">
          {["일","월","화","수","목","금","토"].map(d => (
            <div key={d} className="cal-day-label">{d}</div>
          ))}
          <div className="cal-day" />
          {Array.from({length: 27}, (_, i) => i + 1).map(day => {
            const count = (MOCK_LESSONS[day] || []).length;
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
      {selectedLessons.length > 0 && (
        <div className="schedule-card">
          <p className="schedule-label">{selectedDay}일 일정</p>
          {selectedLessons.map((s, i) => (
            <div key={i} className="schedule-item">
              <div className="schedule-bar" style={{background: s.color}} />
              <div style={{flex:1}}>
                <p className="schedule-name">{s.name}</p>
                <p className="schedule-time">오후 {2 + i * 2}:00 · 60분</p>
              </div>
              <span className="schedule-tag" style={
                s.category === "exam"
                  ? {background:"rgba(167,139,218,0.15)", color:"#a78bda"}
                  : {background:"rgba(94,196,160,0.15)", color:"#5ec4a0"}
              }>
                {s.category === "exam" ? "입시" : "취미"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="section-divider" />

      {/* 레슨 카드 */}
      <div className="lesson-card-main" onClick={() => go("lessonHub")}>
        <div className="lesson-card-deco">👥</div>
        <p className="lesson-card-ey">Lesson Mode</p>
        <h2 className="lesson-card-title">레슨 시작</h2>
        <p className="lesson-card-desc">학생을 선택하고 레슨 메모를 작성해요</p>
        <span className="lesson-card-btn">시작하기 →</span>
      </div>

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

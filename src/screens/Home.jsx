export default function Home({ go, theme, toggleTheme }) {
  const isDark = theme === "dark";

  return (
    <div className="screen">
      <div className="home-header">
        <div>
          <p className="home-greeting">안녕하세요 👋</p>
          <h1 className="home-title">오늘<br /><strong>연습할까요?</strong></h1>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          <span className="theme-toggle-icon">{isDark ? "🌙" : "☀️"}</span>
          <div className={`theme-toggle-track ${!isDark ? "on" : ""}`}>
            <div className="theme-toggle-thumb" />
          </div>
        </button>
      </div>

      <div className="arc-section">
        <svg className="arc-svg" viewBox="0 0 190 190">
          <circle cx="95" cy="95" r="88" fill="none" stroke="rgba(201,169,110,0.06)" strokeWidth="0.5"/>
          <circle cx="95" cy="95" r="76" fill="none" stroke="rgba(201,169,110,0.1)" strokeWidth="0.8"
            style={{transformOrigin:"95px 95px",animation:"breathe 5s ease-in-out infinite"}}/>
          <circle cx="95" cy="95" r="89" fill="none" stroke="rgba(201,169,110,0.35)" strokeWidth="1"
            strokeDasharray="45 20 10 285" strokeLinecap="round"
            style={{transformOrigin:"95px 95px",animation:"arc-slow 18s linear infinite"}}/>
          <circle cx="95" cy="95" r="68" fill="none" stroke="rgba(201,169,110,0.18)" strokeWidth="0.7"
            strokeDasharray="20 28" strokeLinecap="round"
            style={{transformOrigin:"95px 95px",animation:"arc-slow-rev 12s linear infinite"}}/>
          <circle cx="95" cy="95" r="54" fill="none" stroke="rgba(201,169,110,0.12)" strokeWidth="0.5"
            style={{transformOrigin:"95px 95px",animation:"breathe2 6s ease-in-out infinite"}}/>
          <circle cx="95" cy="95" r="36" fill="rgba(201,169,110,0.05)" style={{animation:"breathe 5s ease-in-out infinite"}}/>
          <circle cx="95" cy="95" r="22" fill="rgba(201,169,110,0.08)" style={{animation:"breathe2 4s ease-in-out infinite"}}/>
          <circle cx="95" cy="95" r="8" fill="rgba(201,169,110,0.5)" style={{animation:"glow-pulse 4s ease-in-out infinite"}}/>
          <circle cx="95" cy="9" r="2" fill="rgba(201,169,110,0.5)" style={{animation:"breathe 3s ease-in-out infinite"}}/>
          <circle cx="166" cy="52" r="1.5" fill="rgba(201,169,110,0.4)" style={{animation:"breathe2 4s ease-in-out infinite"}}/>
          <circle cx="24" cy="138" r="1.5" fill="rgba(201,169,110,0.35)" style={{animation:"breathe 3.5s ease-in-out infinite"}}/>
        </svg>
        <div className="arc-center">
          <p className="arc-num">12</p>
          <p className="arc-label">진단 횟수</p>
        </div>
      </div>

      <div className="mode-section">
        <div className="mode-card-main" onClick={() => go("selfHub")}>
          <div className="card-deco">🎙</div>
          <p className="card-eyebrow">Self Diagnosis</p>
          <h2 className="card-title">셀프 진단</h2>
          <p className="card-desc">내 발성 상태를 직접 측정하고 AI가 문제점과 해결 방안을 제시해요</p>
          <span className="card-btn">시작하기 →</span>
        </div>
        <div className="mode-card-sub" onClick={() => go("lessonHub")}>
          <div>
            <p className="sub-eyebrow">Lesson Mode</p>
            <p className="sub-title">레슨 모드</p>
            <p className="sub-desc">학생 진단 · 기록 관리 · 카톡 공유</p>
          </div>
          <div className="sub-arrow">→</div>
        </div>
      </div>

      <div className="section-divider" />

      <div className="section-header">
        <p className="section-title">최근 활동</p>
        <button className="section-link" onClick={() => go("history")}>전체 보기 →</button>
      </div>

      {[
        { icon: "🎙", name: "셀프 진단", sub: "성구 전환 불안정 · 해결 방안 3개", time: "오늘" },
        { icon: "👥", name: "레슨 — 학생 A", sub: "chest-heavy · 호흡 지지 연습법", time: "어제" },
        { icon: "🎙", name: "셀프 진단", sub: "피치 안정성 양호 · 비브라토 확인", time: "3일 전" },
      ].map((item, i) => (
        <div key={i} className="activity-item" onClick={() => go("history")}>
          <div className="activity-icon">{item.icon}</div>
          <div style={{flex:1}}>
            <p className="activity-name">{item.name}</p>
            <p className="activity-sub">{item.sub}</p>
          </div>
          <span className="activity-time">{item.time}</span>
        </div>
      ))}

      <div style={{height:20}} />

      <div className="lib-banner" onClick={() => go("library")}>
        <div className="lib-icon-box">📚</div>
        <div className="lib-text">
          <p className="lib-eyebrow">Library</p>
          <p className="lib-name">발성 라이브러리</p>
        </div>
        <span className="lib-arr">→</span>
      </div>

      <nav className="nav-bar">
        <button className="nav-item active">
          <span className="nav-icon">⊙</span>
          <div className="nav-pip" />
        </button>
        <button className="nav-item" onClick={() => go("history")}>
          <span className="nav-icon">◷</span>
          <span className="nav-label">기록</span>
        </button>
        <button className="nav-item" onClick={() => go("library")}>
          <span className="nav-icon">⊞</span>
          <span className="nav-label">라이브러리</span>
        </button>
        <button className="nav-item">
          <span className="nav-icon">◈</span>
          <span className="nav-label">설정</span>
        </button>
      </nav>
    </div>
  );
}

export default function NavBar({ go, active = "home" }) {
  const items = [
    { key: "home", icon: "⊙", label: null },
    { key: "history", icon: "◷", label: "기록" },
    { key: "library", icon: "⊞", label: "라이브러리" },
    { key: "settings", icon: "◈", label: "설정" },
  ];
  return (
    <nav className="nav-bar">
      {items.map(item => (
        <button key={item.key} className={`nav-item ${active === item.key ? "active" : ""}`} onClick={() => go(item.key)}>
          <span className="nav-icon">{item.icon}</span>
          {active === item.key && !item.label ? <div className="nav-pip" /> : <span className="nav-label">{item.label || ""}</span>}
        </button>
      ))}
    </nav>
  );
}

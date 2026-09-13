export default function NavBar({ go, active = "home" }) {
  const items = [
    { key: "home", icon: "⊙", label: null },
    { key: "history", icon: "◷", label: "History" },
    { key: "studentSelect", icon: "👥", label: "Students" },
    { key: "library", icon: "📓", label: "Vault" },
    { key: "settings", icon: "◈", label: "Settings" },
  ];
  return (
    <nav className="nav-bar">
      {items.map(item => (
        <button
          key={item.key}
          className={`nav-item ${active === item.key ? "active" : ""}`}
          onClick={() => go(item.key)}
        >
          <span className="nav-icon">{item.icon}</span>
          {active === item.key && !item.label
            ? <div className="nav-pip" />
            : <span className="nav-label">{item.label || ""}</span>}
        </button>
      ))}
    </nav>
  );
}

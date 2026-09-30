import { auth } from "../firebase";

export default function NavBar({ go, active = "home" }) {
  const items = [
    { key: "home", icon: "⊙", label: null },
    { key: "history", icon: "◷", label: "History" },
    { key: "studentsList", icon: "👥", label: "Students" },
    { key: "library", icon: "📓", label: "Vault" },
    { key: "settings", icon: "◈", label: "Settings" },
  ];
  const email = auth.currentUser?.email;

  return (
    <nav className="nav-bar">
      <div className="nav-brand">AURA</div>
      {items.map((item) => {
        const isActive =
          active === item.key || (active === "studentSelect" && item.key === "studentsList");
        return (
          <button
            key={item.key}
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={() => go(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            {isActive && !item.label ? (
              <div className="nav-pip" />
            ) : (
              <span className="nav-label">{item.label || ""}</span>
            )}
            {!item.label && <span className="nav-label-desk">Home</span>}
          </button>
        );
      })}
      <div className="nav-side-bottom">
        <button
          className="nav-theme-btn"
          onClick={() => window.dispatchEvent(new Event("aura-toggle-theme"))}
        >
          <span className="nav-theme-icon">◐</span>
          <span className="nav-theme-text">테마 전환</span>
        </button>
        {email && <p className="nav-email">{email}</p>}
      </div>
    </nav>
  );
}

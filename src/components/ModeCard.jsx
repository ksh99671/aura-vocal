export default function ModeCard({ icon, title, description, chips = [], onClick }) {
  return (
    <div className="mode-card" onClick={onClick}>
      <div className="mode-card-icon">{icon}</div>
      <p className="mode-card-title">{title}</p>
      <p className="mode-card-desc">{description}</p>
      {chips.length > 0 && (
        <div className="mode-card-chips">
          {chips.map((c) => (
            <span key={c} className="chip">{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}

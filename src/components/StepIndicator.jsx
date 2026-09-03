export default function StepIndicator({ total, current }) {
  return (
    <div className="step-indicator">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`step-dot ${i < current ? "done" : i === current ? "active" : ""}`} />
      ))}
    </div>
  );
}

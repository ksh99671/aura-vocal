export default function BackButton({ label, onClick }) {
  return (
    <button className="back-btn" onClick={onClick}>← {label}</button>
  );
}

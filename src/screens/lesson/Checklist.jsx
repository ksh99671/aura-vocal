import { useState } from "react";
import BackButton from "../../components/BackButton";
import StepIndicator from "../../components/StepIndicator";
import NavBar from "../../components/NavBar";

const ITEMS = [
  { id: "passaggio", label: "성구 전환", options: ["안정적", "불안정", "브레이크 있음"] },
  { id: "breath", label: "호흡 지지", options: ["충분함", "부족함", "흉식 위주"] },
  { id: "tone", label: "음색", options: ["chest-heavy", "균형적", "breathy"] },
  { id: "larynx", label: "후두 긴장", options: ["이완됨", "약간 긴장", "과긴장"] },
];

export default function Checklist({ go, params }) {
  const [sel, setSel] = useState({});
  const student = params?.student;
  const allDone = ITEMS.every(i => sel[i.id]);

  return (
    <div className="screen">
      <BackButton label="학생 선택" onClick={() => go("studentSelect")} />
      <StepIndicator total={3} current={0} />
      <p className="eyebrow">Lesson Mode</p>
      <h2 className="screen-title">{student?.name || "학생"}<br /><strong>발성 체크</strong></h2>
      <p className="screen-sub">들은 발성 기준으로 체크하세요</p>

      {ITEMS.map(item => (
        <div key={item.id} className="checklist-item">
          <p className="checklist-label">{item.label}</p>
          <div className="check-opts">
            {item.options.map(opt => (
              <button key={opt} className={`check-opt ${sel[item.id] === opt ? "selected" : ""}`}
                onClick={() => setSel(p => ({...p, [item.id]: opt}))}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{height:12}} />
      <button className="btn-primary" disabled={!allDone} onClick={() => go("lessonResult", { student, selections: sel })}>
        진단 요청 →
      </button>
      <NavBar go={go} active="home" />
    </div>
  );
}

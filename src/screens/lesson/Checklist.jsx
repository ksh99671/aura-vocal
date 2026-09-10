import { useState } from "react";
import BackButton from "../../components/BackButton";
import StepIndicator from "../../components/StepIndicator";
import NavBar from "../../components/NavBar";

export default function Checklist({ go, params }) {
  const [memo, setMemo] = useState("");
  const student = params?.student;

  return (
    <div className="screen">
      <BackButton label="학생 선택" onClick={() => go("studentSelect")} />
      <StepIndicator total={2} current={0} />
      <p className="eyebrow">Lesson Mode</p>
      <h2 className="screen-title">{student?.name || "학생"}<br /><strong>레슨 메모</strong></h2>
      <p className="screen-sub">오늘 레슨에서 관찰한 내용을 자유롭게 적어주세요</p>

      <div style={{
        background: "var(--bg2)",
        border: "0.5px solid var(--border2)",
        borderRadius: 18,
        padding: "18px 18px",
        marginBottom: 16,
        minHeight: 260,
      }}>
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder={`예시:\n- 고음에서 목이 조이는 경향\n- 호흡 지지가 약해서 롱톤이 불안정\n- 성구 전환 구간에서 브레이크 발생\n- 전반적으로 흉성 위주 발성`}
          style={{
            width: "100%",
            minHeight: 220,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 14,
            color: "var(--text1)",
            fontFamily: "inherit",
            resize: "none",
            lineHeight: 1.8,
          }}
        />
      </div>

      <button
        className="btn-primary"
        disabled={!memo.trim()}
        onClick={() => go("lessonResult", { student, memo })}
      >
        AI 진단 요청 →
      </button>

      <NavBar go={go} active="home" />
    </div>
  );
}

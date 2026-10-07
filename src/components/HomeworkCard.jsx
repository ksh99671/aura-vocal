import { hwItemsFromLog, hwScore, recentRate } from "../lib/lessonMemo";
import { studentSignals, signalTags, lessonRate } from "../lib/studentSignals";

// 레슨 하나의 과제 이행 상태: none(과제 없음) / pending(확인 전) / low / mid / good
// 기준은 학생 목록의 "관리가 필요한 학생"과 같다 (50% 미만이면 못 한 것)
export function hwTone(log) {
  if (!hwItemsFromLog(log).length) return "none";
  const r = lessonRate(log);
  if (r === null) return "pending";
  return r >= 0.7 ? "good" : r >= 0.5 ? "mid" : "low";
}

const TONE_LABEL = { good: "과제 잘함", mid: "과제 보통", low: "과제 못 함", pending: "과제 확인 전", none: "과제 없음" };
const ST_LABEL = { done: "했어요", partial: "조금", skip: "못 했어요" };

// 레슨 기록 목록의 각 줄에 붙는 작은 점 (과제를 낸 레슨에만)
export function HwDot({ log }) {
  const t = hwTone(log);
  if (t === "none") return null;
  return <i className={`hw-dot ${t}`} title={TONE_LABEL[t]} aria-label={TONE_LABEL[t]} />;
}

// 학생 상세: 최근 레슨의 과제 이행을 한눈에. 과제를 낸 적이 없으면 보이지 않는다
export default function HomeworkCard({ logs, baseCount = 0, student, go }) {
  const withHw = logs.filter((l) => hwItemsFromLog(l).length > 0);
  if (withHw.length === 0) return null;

  const noOf = (i) => Number(baseCount) + logs.length - i; // logs는 최신순
  const rate3 = recentRate(logs, 3);
  const notes = signalTags(studentSignals(logs)).filter((t) => !t.text.startsWith("최근 3회"));
  const recent = logs.slice(0, 6).map((log, i) => ({ log, no: noOf(i) })).reverse(); // 왼쪽이 오래된 레슨

  const lastIdx = logs.indexOf(withHw[0]);
  const last = withHw[0];
  const items = hwItemsFromLog(last);
  const sc = hwScore(items);
  const lastDate = last.date?.toDate?.()?.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });

  return (
    <div className="result-card hwcard">
      <div className="hwcard-head">
        <p className="card-label">과제 이행</p>
        <span className="hwcard-rate">{rate3 !== null ? `최근 3회 ${rate3}%` : "아직 확인 전"}</span>
      </div>

      {notes.length > 0 && (
        <div className="sig-tags">
          {notes.map((t) => (
            <span key={t.text} className={`sig-tag ${t.tone}`}>{t.text}</span>
          ))}
        </div>
      )}

      <div className="hwcard-dots">
        {recent.map(({ log, no }) => (
          <button key={log.id || no} className="hwcard-dot" onClick={() => go("lessonDetail", { student, log, lessonNo: no })}>
            <i className={`hw-dot big ${hwTone(log)}`} />
            <span>{no}회</span>
          </button>
        ))}
      </div>
      <p className="hwcard-legend">초록 70% 이상 · 노랑 50% 이상 · 빨강 50% 미만 · 회색 확인 전 · 빈 점 과제 없음</p>

      <p className="hwcard-sub">
        가장 최근 과제 · {lastDate ? `${lastDate} ` : ""}({noOf(lastIdx)}회)
      </p>
      {items.map((it, i) => (
        <div className="hwcard-item" key={`${i}-${it.text}`}>
          <span>{it.text}</span>
          <span className={`hwcard-st ${it.status || "none"}`}>{ST_LABEL[it.status] || "확인 전"}</span>
        </div>
      ))}
      {sc.unchecked > 0 && <p className="hwcard-note">다음 수업을 시작할 때 "지난 과제 확인"에서 눌러주세요.</p>}
    </div>
  );
}

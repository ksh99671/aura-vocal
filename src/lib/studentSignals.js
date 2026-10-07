import { hwItemsFromLog, hwScore, recentRate } from "./lessonMemo";

// 학생 한 명의 최근 레슨 기록으로 "관리가 필요한지"를 판단한다. (화면과 상관없는 순수 계산)

// 마지막 레슨이 이만큼 지났으면 연락이 필요하다고 본다
export const GAP_DAYS = 14;

const dateMs = (l) => {
  const d = l?.date;
  if (!d) return 0;
  if (typeof d.toMillis === "function") return d.toMillis();
  if (d instanceof Date) return d.getTime();
  return 0;
};

// 레슨 하나의 과제 이행률(0~1). 확인한 과제가 없으면 null
export function lessonRate(log) {
  const s = hwScore(hwItemsFromLog(log));
  return s.total ? s.score / s.total : null;
}

// logs: 학생의 최근 레슨 기록들 (순서는 상관없다. 회차(order)가 큰 것이 최근)
export function studentSignals(logs, now = Date.now()) {
  const sorted = [...(logs || [])].sort((a, b) => (b.order ?? -1) - (a.order ?? -1) || dateMs(b) - dateMs(a));
  const lastMs = sorted.reduce((m, l) => Math.max(m, dateMs(l)), 0);
  const daysSince = lastMs ? Math.max(0, Math.floor((now - lastMs) / 86400000)) : null;
  const rates = sorted.map(lessonRate).filter((r) => r !== null);
  const lowStreak = rates.length >= 2 && rates[0] < 0.5 && rates[1] < 0.5; // 확인한 최근 두 레슨이 모두 절반 미만
  const longGap = daysSince !== null && daysSince >= GAP_DAYS;
  const hasLogs = sorted.length > 0;
  const level = !hasLogs ? "none" : lowStreak || longGap ? "attention" : "ok";
  return { level, lowStreak, longGap, daysSince, rate3: recentRate(sorted, 3), hasLogs };
}

// 학생 목록을 "관리가 필요해요 / 잘하고 있어요 / 기록 없음"으로 나눈다. 필요한 쪽은 심한 순서로
export function groupBySignals(students, signals) {
  const attention = [];
  const ok = [];
  const none = [];
  students.forEach((s) => {
    const g = signals[s.id];
    if (g?.level === "attention") attention.push(s);
    else if (g?.level === "ok") ok.push(s);
    else none.push(s);
  });
  const severity = (s) => (signals[s.id].lowStreak ? 1e6 : 0) + (signals[s.id].daysSince || 0);
  attention.sort((a, b) => severity(b) - severity(a));
  return { attention, ok, none };
}

// 학생 카드 아래에 보여줄 작은 표시들
export function signalTags(g) {
  if (!g.hasLogs) return [{ text: "아직 레슨 기록이 없어요", tone: "" }];
  const tags = [];
  if (g.lowStreak) tags.push({ text: "과제 연속 2번 못 했어요", tone: "bad" });
  else if (g.rate3 !== null) tags.push({ text: `최근 3회 이행 ${g.rate3}%`, tone: g.rate3 >= 70 ? "good" : "" });
  if (g.daysSince !== null) tags.push({ text: g.daysSince === 0 ? "마지막 레슨 오늘" : `마지막 레슨 ${g.daysSince}일 전`, tone: g.longGap ? "warn" : "" });
  return tags;
}

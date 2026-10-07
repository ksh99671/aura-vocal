// 수업 중 기록(칩 + 줄)을 레슨 메모 글과 저장용 데이터로 바꾸는 순수 함수들

export const STATUS = [
  { key: "good", label: "잘됨" },
  { key: "ok", label: "보통" },
  { key: "fix", label: "보완" },
];

export const statusLabel = (key) => STATUS.find((s) => s.key === key)?.label || "";

// 기록 줄들 + 다음 과제(글 또는 목록) -> 레슨 메모 글
// 예) "호흡 (잘됨)\n곡 연습 · Dynamite (보완) — 후렴 고음에서 목이 조임\n과제\n· 스케일 5분"
export function composeMemo(rows, homework) {
  const lines = rows.map((r) => {
    let s = r.name;
    const song = (r.song || "").trim();
    if (r.hasSong && song) s += ` · ${song}`;
    const st = statusLabel(r.status);
    if (st) s += ` (${st})`;
    const note = (r.note || "").trim();
    if (note) s += ` — ${note}`;
    return s;
  });
  const hw = cleanHw(homework);
  if (hw.length) {
    lines.push("과제");
    hw.forEach((t) => lines.push(`· ${t}`));
  }
  return lines.join("\n");
}

// Firestore에는 undefined를 저장할 수 없어서 항상 문자열로 맞춘다
export function toSegments(rows) {
  return rows.map((r) => ({
    itemId: r.itemId || "",
    name: r.name || "",
    color: r.color || "",
    song: r.hasSong ? (r.song || "").trim() : "",
    status: r.status || "",
    note: (r.note || "").trim(),
  }));
}

let seq = 0;
export const newRowKey = () => `r${Date.now().toString(36)}_${seq++}`;

export function rowFromItem(item) {
  return { key: newRowKey(), itemId: item.id, name: item.name, color: item.color, hasSong: !!item.song, song: "", status: "", note: "" };
}

// 지난 레슨의 항목을 오늘 기록으로 (곡은 그대로, 상태와 메모는 비움)
export function rowsFromSegments(segments, items) {
  return (segments || []).map((s) => {
    const it = items.find((i) => i.id === s.itemId);
    return {
      key: newRowKey(),
      itemId: s.itemId || "",
      name: it?.name || s.name || "",
      color: it?.color || s.color || "#c9a96e",
      hasSong: !!it?.song || !!s.song,
      song: s.song || "",
      status: "",
      note: "",
    };
  });
}

// ── 과제 (한 줄에 하나씩) ──────────────────────────────────────────

// 지난 과제를 학생이 얼마나 했는지: 했어요 1점, 조금 0.5점, 못 했어요 0점
export const HW_STATUS = [
  { key: "done", label: "했어요", score: 1 },
  { key: "partial", label: "조금 했어요", score: 0.5 },
  { key: "skip", label: "못 했어요", score: 0 },
];

// 글(여러 줄)을 과제 목록으로. 맨 앞의 "· ", "- ", "1. " 같은 번호 표시는 떼지만 "3회 녹음"의 숫자는 그대로 둔다
export function splitHomework(text) {
  return (text || "")
    .split(/\n+/)
    .map((s) => s.replace(/^(?:[·•\-]\s*|\d+[.)]\s+)/, "").trim())
    .filter(Boolean);
}

// 목록(또는 글)을 정리: 앞뒤 공백 제거, 빈 줄 삭제, 같은 과제는 한 번만
export function cleanHw(list) {
  const items = Array.isArray(list) ? list : splitHomework(list);
  const seen = new Set();
  const out = [];
  items.forEach((t) => {
    const s = String(t || "").trim();
    const k = s.toLowerCase();
    if (s && !seen.has(k)) {
      seen.add(k);
      out.push(s);
    }
  });
  return out;
}

// 레슨 기록 하나에서 과제 목록과 확인 결과를 꺼낸다. 예전 기록(글만 있는 것)도 읽는다
export function hwItemsFromLog(log) {
  if (!log) return [];
  if (Array.isArray(log.homeworkItems) && log.homeworkItems.length) {
    return log.homeworkItems
      .map((x) => ({ text: String(x?.text || "").trim(), status: x?.status || "" }))
      .filter((x) => x.text);
  }
  return splitHomework(log.homework).map((text) => ({ text, status: "" }));
}

// 확인한 과제의 점수. total은 확인한 개수, unchecked는 아직 안 누른 개수
export function hwScore(items) {
  const checked = items.filter((i) => i.status);
  const score = checked.reduce((a, i) => a + (HW_STATUS.find((s) => s.key === i.status)?.score ?? 0), 0);
  return { score, total: checked.length, unchecked: items.length - checked.length };
}

export const fmtScore = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

// 최근 n번 레슨의 이행률(%). 확인한 과제가 하나도 없으면 null
export function recentRate(logs, n = 3) {
  let score = 0;
  let total = 0;
  logs.slice(0, n).forEach((l) => {
    const s = hwScore(hwItemsFromLog(l));
    score += s.score;
    total += s.total;
  });
  return total ? Math.round((score / total) * 100) : null;
}

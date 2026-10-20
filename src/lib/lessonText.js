import { STATUS } from "./lessonMemo";

const stLabel = (k) => STATUS.find((s) => s.key === k)?.label || "";
const indent = (s) => String(s).trim().split("\n").join("\n   ");

// 레슨 정리 글: 레슨생에게 보낼 문장. 트레이너 전용 메모(첫 레슨 메모 등)는 넣지 않는다.
export function buildSummaryText({ name, lessonNo, date, segments = [], homework = [], note = "" }) {
  const d = date instanceof Date ? date : new Date();
  const head = `${name}님 ${lessonNo}회차 레슨 정리 (${d.getMonth() + 1}/${d.getDate()})`;
  const out = [head];
  if (segments.length) {
    out.push("", "■ 오늘 한 것");
    segments.forEach((s) => {
      let line = `· ${s.name}`;
      if (s.song) line += ` (${s.song})`;
      const st = stLabel(s.status);
      if (st) line += ` [${st}]`;
      if (s.note && s.note.trim()) line += `\n   ${indent(s.note)}`;
      out.push(line);
    });
  }
  const hw = homework.map((h) => (typeof h === "string" ? h : h.text)).filter(Boolean);
  if (hw.length) {
    out.push("", "■ 다음 과제");
    hw.forEach((t, i) => out.push(`${i + 1}. ${t}`));
  }
  if (note && note.trim()) out.push("", "■ 한마디", note.trim());
  return out.join("\n");
}

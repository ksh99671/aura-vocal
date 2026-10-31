// 줄 노트: 하나의 글 칸에 "발성 - 내용" 식으로 적는다. 항목 버튼을 누르면 새 줄에 "항목 - "이 생기고,
// 저장할 때 줄을 항목별로 나눠서 각 항목의 메모로 넣는다 (상태, 학생 앱 공유 등은 항목 단위로 그대로 동작).
const head = (r) => `${r.name} - `;

export const padFromRows = (rows) =>
  rows.map((r) => head(r) + (r.note || "")).join("\n");

export function appendHeader(pad, row) {
  const sep = pad && !pad.endsWith("\n") ? "\n" : "";
  return pad + sep + head(row);
}

// 줄을 훑으면서 "다음 항목 이름 - "으로 시작하는 줄이 나오면 그 항목의 시작으로 본다.
// 어떤 항목에도 속하지 않는 앞부분의 글은 extra로 따로 둔다.
function blocks(pad, rows) {
  const lines = String(pad || "").split("\n");
  const found = []; // 항목별 [시작줄, 끝줄)
  const extra = [];
  let j = 0;
  let cur = -1;
  lines.forEach((ln, i) => {
    if (j < rows.length && ln.startsWith(head(rows[j])) || (j < rows.length && ln.trimEnd() === rows[j].name + " -")) {
      found.push({ start: i, first: ln, end: lines.length });
      if (found.length > 1) found[found.length - 2].end = i;
      cur = j;
      j++;
    } else if (cur < 0) {
      extra.push(ln);
    }
  });
  return { lines, found, extra };
}

export function parsePad(pad, rows) {
  const { lines, found, extra } = blocks(pad, rows);
  const notes = rows.map((r, i) => {
    const b = found[i];
    if (!b) return "";
    const first = b.first.startsWith(head(r)) ? b.first.slice(head(r).length) : "";
    const rest = lines.slice(b.start + 1, b.end);
    return [first, ...rest].join("\n").trim();
  });
  return { notes, extra: extra.join("\n").trim() };
}

// 항목을 지우면 노트에서도 그 항목의 줄(내용 포함)을 지운다
export function removeBlock(pad, rows, key) {
  const idx = rows.findIndex((r) => r.key === key);
  if (idx < 0) return pad;
  const { lines, found } = blocks(pad, rows);
  const b = found[idx];
  if (!b) return pad;
  return [...lines.slice(0, b.start), ...lines.slice(b.end)].join("\n");
}

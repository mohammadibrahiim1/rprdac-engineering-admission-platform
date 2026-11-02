export function computeResults(students, entries, fullMarks) {
  const entryById = Object.fromEntries(entries.map(e => [String(e.studentId), e]));
  const rows = students.map(student => {
    const entry = entryById[String(student.id)];
    const absent = Boolean(entry?.absent);
    const entered = Boolean(entry) && (absent || entry.marks !== null && entry.marks !== undefined);
    return {
      ...student,
      marks: entered && !absent ? Number(entry.marks) : null,
      absent, entered,
      percentage: entered && !absent && fullMarks > 0 ? (Number(entry.marks) / fullMarks) * 100 : null,
      position: null,
    };
  });
  // Standard competition ranking: equal marks => equal position, then skip rank.
  rows.sort((a, b) => {
    const as = a.marks === null ? -1 : a.marks;
    const bs = b.marks === null ? -1 : b.marks;
    return bs - as || String(a.id).localeCompare(String(b.id));
  });
  let lastMarks = null;
  let lastRank = 0;
  let eligibleIndex = 0;
  for (const row of rows) {
    if (row.marks === null) continue;
    eligibleIndex++;
    if (row.marks !== lastMarks) lastRank = eligibleIndex;
    row.position = lastRank;
    lastMarks = row.marks;
  }
  return rows;
}

export function examStats(rows) {
  const present = rows.filter(r => r.marks !== null);
  const marks = present.map(r => r.marks);
  return {
    total: rows.length,
    entered: rows.filter(r => r.entered).length,
    present: present.length,
    absent: rows.filter(r => r.absent).length,
    highest: marks.length ? Math.max(...marks) : null,
    lowest: marks.length ? Math.min(...marks) : null,
    average: marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : null,
  };
}

export const marksText = row => !row.entered ? 'Not entered' : row.absent ? 'Absent' : String(row.marks);
export const pretty = n => n === null || n === undefined ? '—' : Number.isInteger(n) ? String(n) : Number(n).toFixed(1);

import { getMCQMarks } from "./mcqStore.js";
/**
 * Build a printable batch-wise report from a chosen set of exam records.
 * ABS = an entered absence (counts as 0), — = unentered (not ranked).
 * All selected exams must be complete for a student to receive an aggregate rank.
 * Comparison uses percentage-point change between the last two selected exams,
 * regardless of differing full marks. It is indicative, not proof of progress.
 */
export function buildBatchResults(students, selectedExams, marksByExam) {
  const exams = [...selectedExams].sort((a, b) => a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id)));
  const totalPossible = exams.reduce((acc, e) => acc + Number(e.fullMarks), 0);
  const marksMaps = exams.map(exam => new Map((marksByExam[String(exam.id)] || []).map(e => [String(e.studentId), e])));
  const rows = students.map(s => {
    const cells = exams.map((exam, i) => {
      // Get previously saved written/combined result
const savedEntry = marksMaps[i].get(String(s.id));

// For Only MCQ exams, use locked MCQ marks automatically
const lockedMCQ =
  exam.examType === "mcq"
    ? getMCQMarks(exam.id, s.id)
    : null;

// MCQ marks become the result without separate Marks Entry
const entry = lockedMCQ
  ? {
      studentId: s.id,
      marks: lockedMCQ.absent
        ? null
        : Number(lockedMCQ.marks),
      absent: Boolean(lockedMCQ.absent)
    }
  : savedEntry;
      const entered = Boolean(entry) && (entry.absent || entry.marks !== null && entry.marks !== undefined);
      const absent = Boolean(entry?.absent);
      const marks = entered ? (absent ? 0 : Number(entry.marks)) : null;
      const max = Number(exam.fullMarks);
      return { entered, absent, marks, max, display: !entered ? '—' : absent ? 'AB' : String(marks), pct: entered && max > 0 ? marks / max * 100 : null };
    });
    const complete = cells.length > 0 && cells.every(c => c.entered);
    const earned = cells.reduce((sum, c) => sum + (c.marks ?? 0), 0);
    const percent = complete && totalPossible > 0 ? earned / totalPossible * 100 : null;
    let delta = null;
    if (cells.length >= 2) {
      const before = cells[cells.length - 2];
      const after = cells[cells.length - 1];
      if (before.pct !== null && after.pct !== null) delta = after.pct - before.pct;
    }
    const trend = delta === null ? 'Insufficient data' : delta > 0.0001 ? 'Improved' : delta < -0.0001 ? 'Needs improvement' : 'Unchanged';
    return { ...s, cells, complete, total: complete ? earned : null, percent, delta, trend, position: null };
  });
  // Standard competition rank (1, 2, 2, 4), based on summed marks
  const ranked = rows.filter(r => r.complete).sort((a, b) => b.total - a.total || String(a.id).localeCompare(String(b.id)));
  let prior = null;
  let position = 0;
  ranked.forEach((row, i) => { if (prior !== row.total) position = i + 1; row.position = position; prior = row.total; });
  return [...ranked, ...rows.filter(r => !r.complete).sort((a, b) => String(a.id).localeCompare(String(b.id)))];
}

export const shortDate = iso => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) return String(iso || '');
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export const numberText = value => value == null ? '—' : Number.isInteger(value) ? String(value) : Number(value).toFixed(1);

export function selectedMonthOptions(exams) {
  return [...new Set(exams.map(e => e.date.slice(0, 7)))].sort().reverse();
}

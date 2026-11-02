const MCQ_KEY = "rpr-mcq-marks-locked-v1";

// Read MCQ data from browser storage
function readMCQData() {
  const saved = localStorage.getItem(MCQ_KEY);

  if (!saved) return {};

  try {
    return JSON.parse(saved);
  } catch {
    throw new Error(
      "Saved MCQ data could not be read. Existing data was not changed."
    );
  }
}

// Get saved MCQ data for an exam
export function getMCQExam(examId) {
  if (!examId) return null;

  const data = readMCQData();

  return data[String(examId)] || null;
}

// Get one student's MCQ marks
export function getMCQMarks(examId, studentId) {
  if (!examId || !studentId) return null;

  const exam = getMCQExam(examId);

  if (!exam) return null;

  const id = String(studentId).trim().toUpperCase();

  return exam.students?.[id] || null;
}

// Save and lock MCQ marks
export function saveMCQMarks(
  batchId,
  examId,
  mcqFullMarks,
  records,
  examFullMarks
) {
  if (!batchId || !examId) {
    throw new Error("Please select Batch and Exam.");
  }

  const limit = Number(mcqFullMarks);
  const examLimit = Number(examFullMarks);

  if (
    !Number.isFinite(limit) ||
    limit <= 0 ||
    !Number.isFinite(examLimit) ||
    limit > examLimit
  ) {
    throw new Error("Invalid MCQ Full Marks.");
  }

  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("No MCQ records found.");
  }

  const data = readMCQData();

  // Lock: Prevent replacing existing MCQ marks
  if (Object.prototype.hasOwnProperty.call(data, String(examId))) {
    throw new Error(
      "MCQ Marks are already saved and locked for this exam."
    );
  }

  const students = {};

  for (const record of records) {
    const id = String(record.studentId || "")
      .trim()
      .toUpperCase();

    const name = String(record.studentName || "").trim();

    const absent = Boolean(record.absent);

    if (!id || !name) {
      throw new Error("Student ID and Name are required.");
    }

    if (students[id]) {
      throw new Error(`Duplicate Student ID: ${id}`);
    }

    if (
      !absent &&
      (record.marks === null ||
        record.marks === undefined ||
        String(record.marks).trim() === "")
    ) {
      throw new Error(`MCQ Marks missing for ${id}`);
    }

    const marks = absent ? 0 : Number(record.marks);

    if (
      !Number.isFinite(marks) ||
      marks < 0 ||
      marks > limit
    ) {
      throw new Error(`Invalid MCQ Marks for ${id}`);
    }

    students[id] = {
      studentId: id,
      studentName: name,
      marks,
      absent
    };
  }

  // Save all validated records together
  data[String(examId)] = {
    batchId: String(batchId),
    examId: String(examId),
    mcqFullMarks: limit,
    students,
    locked: true,
    savedAt: new Date().toISOString()
  };

  localStorage.setItem(MCQ_KEY, JSON.stringify(data));

  return Object.keys(students).length;
}
// ===================================
// SAVED WRITTEN MARKS
// ===================================

const WRITTEN_KEY = "rpr-written-marks-v1";

// Get saved written marks
export function getSavedWrittenMark(examId, studentId) {
  if (!examId || !studentId) return null;

  try {
    const data = JSON.parse(
      localStorage.getItem(WRITTEN_KEY) || "{}"
    );

    const id = String(studentId).trim().toUpperCase();

    return data[String(examId)]?.[id] ?? null;
  } catch {
    return null;
  }
}

// Save written marks separately
export function saveWrittenMark(
  examId,
  studentId,
  writtenMarks,
  absent = false
) {
  const data = JSON.parse(
    localStorage.getItem(WRITTEN_KEY) || "{}"
  );

  const examKey = String(examId);
  const id = String(studentId).trim().toUpperCase();

  if (!examId || !id) {
    throw new Error("Exam ID and Student ID are required.");
  }

  if (
    !absent &&
    (
      writtenMarks === null ||
      writtenMarks === undefined ||
      !Number.isFinite(Number(writtenMarks))
    )
  ) {
    throw new Error("Invalid Written Marks.");
  }

  if (!data[examKey]) {
    data[examKey] = {};
  }

  data[examKey][id] = {
    value: absent ? "" : String(writtenMarks),
    absent: Boolean(absent),
    savedAt: new Date().toISOString()
  };

  localStorage.setItem(
    WRITTEN_KEY,
    JSON.stringify(data)
  );
}
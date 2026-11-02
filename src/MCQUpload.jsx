import {
  saveMCQMarks,
  getMCQExam
} from "./mcqStore.js";

import { api } from "./api.js";
import React, { useEffect, useState } from "react";

export default function MCQUpload({ batches = [], exams = [] }) {
  const [batchId, setBatchId] = useState("");
  const [examId, setExamId] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState([]);
const [previewMessage, setPreviewMessage] = useState("");
const [mcqFullMarks, setMcqFullMarks] = useState("30");

const [saveNotice, setSaveNotice] = useState("");

const [previewContext, setPreviewContext] = useState(null);
  const availableExams = exams.filter((exam) => {
  const selectedBatches =
    Array.isArray(exam.batchIds) && exam.batchIds.length
      ? exam.batchIds.map(String)
      : [String(exam.batchId)];

  const sameBatch =
    selectedBatches.includes(String(batchId));

  const supportsMCQ =
    exam.examType !== "written" ||
    Boolean(getMCQExam(exam.id));

  return sameBatch && supportsMCQ;
});
// Automatically load MCQ Full Marks from Exam Management
useEffect(() => {
  const selectedExam = exams.find(
    (exam) => String(exam.id) === String(examId)
  );

  if (!selectedExam) {
    setMcqFullMarks("");
    return;
  }

  const savedMCQ = getMCQExam(selectedExam.id);

  let mcqMarks = 0;

  if (selectedExam.examType === "mcq") {
    mcqMarks = Number(selectedExam.fullMarks);
  } else if (selectedExam.examType === "combined") {
    mcqMarks = Number(selectedExam.mcqFullMarks);
  } else if (savedMCQ) {
    // Support previously created MCQ exams
    mcqMarks = Number(savedMCQ.mcqFullMarks);
  }
  setMcqFullMarks(String(mcqMarks));

}, [examId, exams]);
  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setError("");
    setFile(null);

    if (!selectedFile) return;

    const name = selectedFile.name.toLowerCase();

    if (!name.endsWith(".xlsx") && !name.endsWith(".pdf")) {
      setError("Only Excel (.xlsx) and PDF (.pdf) files are allowed.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  }
async function handlePreview() {
  if (!batchId || !examId || !file) {
    setError("Please select Batch, Exam and Excel file.");
    return;
  }

  setError("");
  setPreview([]);
  setPreviewMessage("⏳ Reading Excel file...");
setPreviewContext(null);
setSaveNotice("");
  if (file.name.toLowerCase().endsWith(".pdf")) {
    setError("PDF processing is not enabled yet. Please use an Excel (.xlsx) file.");
    return;
  }

  try {
    const { default: ExcelJS } = await import("exceljs");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());

    const sheet = workbook.worksheets[0];

    if (!sheet) {
      throw new Error("No worksheet found.");
    }

    const normalize = (value) =>
      String(value ?? "")
        .toLowerCase()
        .replace(/[\s_\-().]/g, "");

    const headerRow = sheet.getRow(1);

    let idColumn = 0;
let nameColumn = 0;
let marksColumn = 0;

    headerRow.eachCell((cell, columnNumber) => {
      const header = normalize(cell.text);

      if (header === "id" || header === "studentid") {
  idColumn = columnNumber;
}

if (header === "name" || header === "studentname") {
  nameColumn = columnNumber;
}

if (header === "mcqmarks") {
  marksColumn = columnNumber;
}
    });

    if (!idColumn || !nameColumn || !marksColumn) {
  throw new Error(
    "Excel must contain ID, Name and MCQ Marks columns in the first row."
  );
}

    const records = [];
    const seenIds = new Set();
    const errors = [];

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      const studentId = row.getCell(idColumn).text.trim();
const studentName = row.getCell(nameColumn).text.trim();
const marksText = row.getCell(marksColumn).text.trim();

      if (!studentId && !studentName && !marksText) continue;

      const absent = marksText.toUpperCase() === "AB";
      const marks = absent ? 0 : Number(marksText);

      if (!studentId) {
        errors.push(`Row ${i}: Student ID missing`);
        continue;
      }
if (!studentName) {
  errors.push(`Row ${i}: Student Name missing`);
  continue;
}
      if (
        !absent &&
        (marksText === "" || !Number.isFinite(marks) || marks < 0)
      ) {
        errors.push(`Row ${i}: Invalid MCQ Marks`);
        continue;
      }

      const key = studentId.toUpperCase();

      if (seenIds.has(key)) {
        errors.push(`Row ${i}: Duplicate Student ID ${studentId}`);
        continue;
      }

      seenIds.add(key);

      records.push({
  studentId,
  studentName,
  marks,
  absent,
  displayMarks: absent ? "AB" : marks
});
    }

    setPreview(records);
if (errors.length === 0 && records.length > 0) {
  setPreviewContext({
    file,
    batchId,
    examId
  });
}
    setPreviewMessage(
      `${records.length} student records found. ${errors.length} issue(s).`
    );

    if (errors.length) {
      setError(errors.slice(0, 10).join(" | "));
    }
  } catch (err) {
    setError(err.message || "Unable to read Excel file.");
  }
}
async function handleSaveMCQ() {
  try {
    setError("");
    setSaveNotice("");

    if (
      !previewContext ||
      previewContext.file !== file ||
      String(previewContext.batchId) !== String(batchId) ||
      String(previewContext.examId) !== String(examId) ||
      preview.length === 0
    ) {
      throw new Error(
        "Please preview a valid MCQ Excel file before saving."
      );
    }

    if (getMCQExam(examId)) {
      throw new Error(
        "MCQ Marks already saved and locked for this exam."
      );
    }

    const selectedExam = exams.find(
      (exam) => String(exam.id) === String(examId)
    );

    if (!selectedExam) {
      throw new Error("Selected exam not found.");
    }

    if (selectedExam.status === "published") {
      throw new Error(
        "Cannot upload MCQ marks for a published exam."
      );
    }

    const databaseStudents = await api.getStudents(batchId);

    const studentMap = new Map(
      databaseStudents.map((student) => [
        String(student.id).trim().toUpperCase(),
        student
      ])
    );

    const normalizeName = (name) =>
      String(name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const issues = [];

    for (const student of preview) {
      const id = String(student.studentId)
        .trim()
        .toUpperCase();

      const databaseStudent = studentMap.get(id);

      if (!databaseStudent) {
        issues.push(`${id}: Student ID not found`);
        continue;
      }

      if (
        normalizeName(student.studentName) !==
        normalizeName(databaseStudent.name)
      ) {
        issues.push(`${id}: Student Name mismatch`);
      }
    }

    if (issues.length > 0) {
      throw new Error(
        `MCQ validation failed: ${issues.slice(0, 5).join(" | ")}`
      );
    }
// Use MCQ Full Marks from Exam Management
const expectedMCQFullMarks =
  selectedExam.examType === "mcq"
    ? Number(selectedExam.fullMarks)
    : selectedExam.examType === "combined"
      ? Number(selectedExam.mcqFullMarks)
      : 0;

// Validate configured MCQ Full Marks
if (
  !Number.isFinite(expectedMCQFullMarks) ||
  expectedMCQFullMarks <= 0 ||
  expectedMCQFullMarks > Number(selectedExam.fullMarks)
) {
  throw new Error(
    "Invalid MCQ Full Marks. Please check Exam Management."
  );
}

// Validate uploaded student marks
const invalidRecord = preview.find(
  (student) =>
    !student.absent &&
    (
      !Number.isFinite(Number(student.marks)) ||
      Number(student.marks) < 0 ||
      Number(student.marks) > expectedMCQFullMarks
    )
);

if (invalidRecord) {
  throw new Error(
    `Invalid MCQ Marks for Student ID: ${invalidRecord.studentId}`
  );
}
    const confirmed = window.confirm(
      "Confirm MCQ Marks Save?\n\nAfter saving, MCQ marks will be locked and cannot be changed."
    );

    if (!confirmed) return;

    const count = saveMCQMarks(
      batchId,
      examId,
      expectedMCQFullMarks,
      preview,
      selectedExam.fullMarks
    );

    setSaveNotice(
      `${count} students' MCQ marks saved and locked successfully!`
    );

  } catch (err) {
    setError(err.message || "MCQ Marks Save Failed");
  }
}  
return (
    <div style={{ padding: "25px" }}>
      {/* Page Header */}
      <div
        style={{
          background: "linear-gradient(120deg, #123568, #2563eb)",
          padding: "30px",
          borderRadius: "15px",
          color: "white",
          marginBottom: "25px"
        }}
      >
        <h1>MCQ Result Upload</h1>
        <p>Upload MCQ marks using Excel or PDF files.</p>
      </div>

      {/* Upload Form */}
      <div className="panel" style={{ padding: "25px" }}>
        <h2>Upload MCQ Result File</h2>

        <div
          style={{
            display: "grid",
            gap: "18px",
            marginTop: "20px"
          }}
        >
          {/* Select Batch */}
          <label>
            SELECT BATCH

            <select
              value={batchId}
              onChange={(e) => {
                setBatchId(e.target.value);
                setExamId("");
                setFile(null);
                setError("");
              }}
            >
              <option value="">Choose Batch</option>

              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </label>

          {/* Select Exam */}
          <label>
            SELECT EXAM

            <select
              value={examId}
              onChange={(e) => {
                setExamId(e.target.value);
                setFile(null);
                setError("");
              }}
              disabled={!batchId}
            >
              <option value="">Choose Exam</option>

              {availableExams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} — {exam.date}
                </option>
              ))}
            </select>
          </label>
{/* Automatic Exam Marks Information */}
{examId && (() => {
  const selectedExam = exams.find(
    (exam) => String(exam.id) === String(examId)
  );

  if (!selectedExam) return null;

  const savedMCQ = getMCQExam(examId);

  const total = Number(selectedExam.fullMarks || 0);

  const mcqFull = savedMCQ
    ? Number(savedMCQ.mcqFullMarks)
    : selectedExam.examType === "mcq"
      ? total
      : Number(selectedExam.mcqFullMarks || 0);

  const writtenFull = total - mcqFull;

  return (
    <div
      style={{
        marginTop: "18px",
        padding: "20px",
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: "12px"
      }}
    >
      <h3
        style={{
          margin: "0 0 15px",
          color: "#1e3a8a",
          fontSize: "16px"
        }}
      >
        📊 Exam Marks Information
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px"
        }}
      >
        <div>
          <strong>Total Full Marks</strong>
          <h2>{total}</h2>
        </div>

        <div>
          <strong>MCQ Full Marks 🔒</strong>
          <h2>{mcqFull}</h2>
        </div>

        <div>
          <strong>Written Full Marks</strong>
          <h2>{writtenFull}</h2>
        </div>
      </div>

      <div
        style={{
          marginTop: "12px",
          color: savedMCQ ? "#047857" : "#1d4ed8",
          fontWeight: "700"
        }}
      >
        {savedMCQ
          ? "🔒 MCQ Marks Already Saved & Locked"
          : "MCQ Marks Not Uploaded"}
      </div>
    </div>
  );
})()}
          {/* Upload MCQ File */}
          <label>
            UPLOAD MCQ FILE

            <input
              type="file"
              accept=".xlsx,.pdf"
              onChange={handleFileChange}
            />
          </label>

          {/* Selected File */}
          {file && (
            <div
              style={{
                padding: "15px",
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                color: "#065f46"
              }}
            >
              ✅ Selected File: <strong>{file.name}</strong>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p
              style={{
                color: "#dc2626",
                fontWeight: "600"
              }}
            >
              {error}
            </p>
          )}

          {/* Upload Button */}
          <button
  type="button"
  className="btn btn-primary"
  disabled={!batchId || !examId || !file}
  onClick={handlePreview}
>
  Upload & Preview MCQ Marks
</button>
{previewMessage && (
  <div
    style={{
      marginTop: "15px",
      padding: "14px 18px",
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: "10px",
      color: "#1e40af",
      fontWeight: "600"
    }}
  >
    {previewMessage}
  </div>
)}
{preview.length > 0 && (
  <div
    style={{
      marginTop: "20px",
      padding: "20px",
      background: "#f8fafc",
      border: "1px solid #dbeafe",
      borderRadius: "12px"
    }}
  >
    <label>
      <strong>MCQ FULL MARKS</strong>

      <input
        type="number"
        min="1"
        value={mcqFullMarks}
        readOnly
        disabled={Boolean(getMCQExam(examId))}
        onChange={(e) => setMcqFullMarks(e.target.value)}
        style={{
          display: "block",
          width: "200px",
          padding: "12px",
          marginTop: "10px",
          marginBottom: "18px",
          border: "1px solid #cbd5e1",
          borderRadius: "8px"
        }}
      />
    </label>

    <button
      type="button"
      onClick={handleSaveMCQ}
      disabled={
        !previewContext ||
        Boolean(getMCQExam(examId)) ||
        previewContext.file !== file ||
        previewContext.batchId !== batchId ||
        previewContext.examId !== examId
      }
      style={{
        width: "100%",
        padding: "15px",
        background: getMCQExam(examId)
          ? "#94a3b8"
          : "#059669",
        color: "white",
        fontWeight: "700",
        border: "none",
        borderRadius: "10px",
        cursor: getMCQExam(examId)
          ? "not-allowed"
          : "pointer"
      }}
    >
      {getMCQExam(examId)
        ? "🔒 MCQ Marks Locked"
        : "✓ Confirm & Save MCQ Marks"}
    </button>
  </div>
)}

{saveNotice && (
  <div
    style={{
      marginTop: "15px",
      padding: "15px",
      background: "#ecfdf5",
      border: "1px solid #86efac",
      color: "#047857",
      borderRadius: "10px",
      fontWeight: "700"
    }}
  >
    {saveNotice}
  </div>
)}

{getMCQExam(examId) && (
  <p style={{ color: "#047857", fontWeight: "700" }}>
    🔒 MCQ marks for this exam are already saved and locked.
  </p>
)}
  {preview.length > 0 && (
  <div style={{ marginTop: "25px" }}>
    <h3 style={{ marginBottom: "15px", color: "#123568" }}>
      📊 MCQ Marks Preview
    </h3>

    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#ffffff"
        }}
      >
        <thead>
          <tr style={{ background: "#e8f1ff" }}>
            <th style={{ padding: "14px", textAlign: "left" }}>
              SL
            </th>
            <th style={{ padding: "14px", textAlign: "left" }}>
              Student ID
            </th>
            <th style={{ padding: "14px", textAlign: "left" }}>
  Student Name
</th>
            <th style={{ padding: "14px", textAlign: "left" }}>
              MCQ Marks
            </th>
            <th style={{ padding: "14px", textAlign: "left" }}>
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {preview.map((student, index) => (
            <tr
              key={`${student.studentId}-${index}`}
              style={{ borderBottom: "1px solid #e2e8f0" }}
            >
              <td style={{ padding: "12px 14px" }}>
                {index + 1}
              </td>

              <td style={{ padding: "12px 14px", fontWeight: "700" }}>
                {student.studentId}
              </td>
<td style={{ padding: "12px 14px", fontWeight: "600" }}>
  {student.studentName}
</td>
              <td style={{ padding: "12px 14px" }}>
                {student.displayMarks}
              </td>

              <td style={{ padding: "12px 14px" }}>
                <span
                  style={{
                    color: student.absent ? "#dc2626" : "#059669",
                    fontWeight: "700"
                  }}
                >
                  {student.absent ? "Absent" : "Parsed"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}        
        </div>
      </div>
    </div>
  );
}
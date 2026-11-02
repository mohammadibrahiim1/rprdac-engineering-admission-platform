import React, { useEffect, useState } from "react";
import { api } from "./api.js";
import { buildBatchResults } from "./batchResults.js";
import {
  getMCQExam,
  getMCQMarks,
  getSavedWrittenMark
} from "./mcqStore.js";

export default function StudentAllResults({
  studentId,
  exams = [],
  selectedExamId
}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadResults() {
      if (!studentId) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const studentKey = String(studentId).trim().toUpperCase();

        const data = await Promise.all(
          exams
  .filter((exam) => String(exam.id) === String(selectedExamId))
  .map(async (exam) => {
            const students = await api.getStudents(exam.batchId);
            const savedMarks = await api.getMarks(exam.id);

            const rows = buildBatchResults(
              students,
              [exam],
              {
                [String(exam.id)]: savedMarks
              }
            );

            const row = rows.find(
              (r) =>
                String(r.id).trim().toUpperCase() === studentKey
            );

            if (!row) return null;

            const cell = row.cells[0];

            const mcqExam = getMCQExam(exam.id);
            const mcq = mcqExam
              ? getMCQMarks(exam.id, studentId)
              : null;

            const written = getSavedWrittenMark(
              exam.id,
              studentId
            );

            const totalFull = Number(exam.fullMarks);

            const mcqFull = Number(
              mcqExam?.mcqFullMarks ??
              exam.mcqFullMarks ??
              0
            );

            const onlyMCQ =
              exam.examType === "mcq" ||
              (Boolean(mcqExam) && mcqFull === totalFull);

            let mcqText = "—";

            if (mcq) {
              mcqText = mcq.absent
                ? "AB"
                : `${mcq.marks}/${mcqFull}`;
            }

            let writtenText = "—";

            if (!onlyMCQ) {
              if (mcqExam) {
                if (written) {
                  writtenText = written.absent
                    ? "AB"
                    : written.value === ""
                      ? "—"
                      : `${written.value}/${totalFull - mcqFull}`;
                }
              } else if (cell.entered && !cell.absent) {
                writtenText = `${cell.marks}/${totalFull}`;
              }
            }

            return {
              id: exam.id,
              title: exam.title,
              date: exam.date,
              mcq: mcqText,
              written: writtenText,
              total: cell.entered
                ? cell.absent
                  ? "AB"
                  : `${cell.display}/${totalFull}`
                : "—",
              merit: row.position ? `#${row.position}` : "—",
              status: exam.status,
              entered: cell.entered
            };
          })
        );

        if (active) {
          setResults(data.filter(Boolean));
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load results.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResults();

    return () => {
      active = false;
    };
  }, [studentId, exams, selectedExamId]);

  if (!studentId) return null;

  return (
    <div
      style={{
        marginTop: "24px",
        padding: "20px",
        background: "#ffffff",
        border: "1px solid #dbeafe",
        borderRadius: "14px"
      }}
    >
      <h2 style={{ color: "#123568" }}>
        📊 All Exam Results
      </h2>

      <p>
        Student ID: <strong>{studentId}</strong>
      </p>

      {loading && <p>Loading results...</p>}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {!loading && !error && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left"
            }}
          >
            <thead>
              <tr style={{ background: "#eaf2ff" }}>
                {[
                  "Exam",
                  "MCQ 🔒",
                  "Written",
                  "Total",
                  "Merit",
                  "Status"
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{ padding: "12px" }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {results.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: "1px solid #e2e8f0"
                  }}
                >
                  <td style={{ padding: "12px" }}>
                    <strong>{r.title}</strong>
                    <br />
                    <small>{r.date}</small>
                  </td>

                  <td>{r.mcq}</td>
                  <td>{r.written}</td>

                  <td style={{
                    fontWeight: "800",
                    color: "#047857"
                  }}>
                    {r.total}
                  </td>

                  <td>{r.merit}</td>

                  <td>
                    {r.status === "published"
                      ? "Published"
                      : "Draft"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {results.length === 0 && (
            <p>No exam results found for this student.</p>
          )}
        </div>
      )}
    </div>
  );
}
import {
  getMCQMarks,
  getMCQExam,
  getSavedWrittenMark,
  saveWrittenMark,
} from "./mcqStore.js";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import {
  buildBatchResults,
  numberText,
  shortDate,
  selectedMonthOptions,
} from "./batchResults.js";
import "./AdminBatchResult.css";
import { findStudentById } from "./studentLookup.js";

function saveExcel(buffer, filename) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

const sortExams = (exams) =>
  [...exams].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id)),
  );
const normalFullMarks = (e) => `${e.fullMarks}`;

export default function AdminBatchResult({
  onBack,
  initialScreen = "batch",
  embedded = false,
}) {
  const [screen, setScreen] = useState(initialScreen);
  const [batches, setBatches] = useState([]);
  const [allExams, setAllExams] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [month, setMonth] = useState("all");
  const [resultSort, setResultSort] = useState("highest");
  const [chosenIds, setChosenIds] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksByExam, setMarksByExam] = useState({});
  const [entryExamId, setEntryExamId] = useState("");
  const [draft, setDraft] = useState({});
  const [query, setQuery] = useState("");
  const matchedStudent = findStudentById(query);
  // Automatically find locked MCQ marks
  const lockedMCQ =
    matchedStudent && entryExamId
      ? getMCQMarks(entryExamId, matchedStudent.id)
      : null;

  // Get MCQ full marks for selected exam
  const mcqExamInfo = entryExamId ? getMCQExam(entryExamId) : null;
  const [working, setWorking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const available = useMemo(
    () =>
      sortExams(
        allExams.filter((exam) => {
          const selectedBatches =
            Array.isArray(exam.batchIds) && exam.batchIds.length
              ? exam.batchIds.map(String)
              : [String(exam.batchId)];

          return selectedBatches.includes(String(batchId));
        }),
      ),
    [allExams, batchId],
  );
  // Employee Marks Entry - Automatic Batch Detection

  const normalizeBatch = (name) =>
    String(name ?? "")
      .toLowerCase()
      .trim()
      .replace(/^\d+\s*[.)-]\s*/, "")
      .replace(/\s+20\d{2}$/, "")
      .trim();

  // Find student's batch automatically
  const studentBatch = matchedStudent
    ? batches.find(
        (b) =>
          String(b.id) === String(matchedStudent.batchId) ||
          normalizeBatch(b.name) === normalizeBatch(matchedStudent.batch),
      )
    : null;

  // Show exams belonging to student's batch
  const entryAvailable = studentBatch
    ? sortExams(
        allExams.filter((exam) => {
          const selectedBatchIds =
            Array.isArray(exam.batchIds) && exam.batchIds.length > 0
              ? exam.batchIds.map(String)
              : [String(exam.batchId)];

          return selectedBatchIds.includes(String(studentBatch.id));
        }),
      )
    : [];
  const monthOptions = useMemo(
    () => selectedMonthOptions(available),
    [available],
  );
  const visibleExams = useMemo(
    () => available.filter((e) => month === "all" || e.date.startsWith(month)),
    [available, month],
  );
  const selectedExams = useMemo(
    () => sortExams(available.filter((e) => chosenIds.includes(String(e.id)))),
    [available, chosenIds],
  );
  const resultBatchIds = [
    ...new Set(
      selectedExams.flatMap((exam) =>
        Array.isArray(exam.batchIds) && exam.batchIds.length
          ? exam.batchIds.map(String)
          : [String(exam.batchId)],
      ),
    ),
  ];

  const resultBatchName = resultBatchIds
    .map((id) => batches.find((b) => String(b.id) === id)?.name || id)
    .join(" + ");
  const selectedKey = selectedExams.map((e) => String(e.id)).join("|");
  const currentEntry = entryAvailable.find(
    (e) => String(e.id) === String(entryExamId),
  );
  // Written Full Marks = Exam Full Marks - MCQ Full Marks
  const writtenFullMarks = Math.max(
    0,
    Number(currentEntry?.fullMarks ?? 0) -
      Number(getMCQExam(currentEntry?.id)?.mcqFullMarks ?? 0),
  );
  const rows = useMemo(
    () => buildBatchResults(students, selectedExams, marksByExam),
    [students, selectedExams, marksByExam],
  );
  const completed = rows.filter((r) => r.complete);
  // Batch Result Sorting

  // Calculate available marks for sorting
  const getSortingTotal = (row) => {
    return row.cells.reduce((total, cell) => {
      if (cell.absent || !cell.entered) {
        return total;
      }

      const marks = Number(String(cell.display).replace(/,/g, "").trim());

      return total + (Number.isFinite(marks) ? marks : 0);
    }, 0);
  };

  // Sort students by available marks
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aHasMarks = a.cells.some((cell) => cell.entered || cell.absent);

      const bHasMarks = b.cells.some((cell) => cell.entered || cell.absent);

      // Students without any marks stay at the bottom
      if (aHasMarks !== bHasMarks) {
        return aHasMarks ? -1 : 1;
      }

      const aTotal = getSortingTotal(a);
      const bTotal = getSortingTotal(b);

      if (aTotal !== bTotal) {
        return resultSort === "lowest" ? aTotal - bTotal : bTotal - aTotal;
      }

      return String(a.id).localeCompare(String(b.id));
    });
  }, [rows, resultSort]);
  const countImproved = rows.filter((r) => r.trend === "Improved").length;
  const countDeclined = rows.filter(
    (r) => r.trend === "Needs improvement",
  ).length;
  const currentMarks = marksByExam[String(entryExamId)] || [];
  const savedMap = useMemo(
    () => new Map(currentMarks.map((e) => [String(e.studentId), e])),
    [currentMarks],
  );
  // Employee Marks Entry: Show only the searched student
  const filteredStudents = matchedStudent ? [matchedStudent] : [];
  const batch = batches.find((b) => String(b.id) === String(batchId));

  useEffect(() => {
    let alive = true;
    Promise.all([api.getBatches(), api.getExams()])
      .then(([b, e]) => {
        if (!alive) return;
        setBatches(b);
        setAllExams(e);
        setBatchId(String(b[0]?.id || ""));
      })
      .catch((e) => setError(e.message))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const subset = available.filter(
      (e) => month === "all" || e.date.startsWith(month),
    );
    setChosenIds(subset.slice(-4).map((e) => String(e.id)));
    const editable = [...subset]
      .reverse()
      .find((e) => e.status !== "published");
    setEntryExamId(String(editable?.id || subset.at(-1)?.id || ""));
    setQuery("");
  }, [batchId, month, allExams]);

  useEffect(() => {
    let alive = true;

    if (!batchId) {
      setStudents([]);
      return;
    }

    // Find selected exam
    const selectedExam = allExams.find(
      (exam) => String(exam.id) === String(entryExamId),
    );

    // Get all selected batches for Series Exam
    const selectedBatchIds =
      Array.isArray(selectedExam?.batchIds) && selectedExam.batchIds.length > 0
        ? selectedExam.batchIds.map(String)
        : [String(batchId)];

    setLoading(true);
    setError("");

    api
      .getStudents(
        selectedBatchIds.length > 1 ? selectedBatchIds : selectedBatchIds[0],
      )
      .then((students) => {
        if (alive) setStudents(students);
      })
      .catch((error) => {
        if (alive) setError(error.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [batchId, entryExamId, allExams]);

  useEffect(() => {
    let alive = true;
    // Only fetch selected exams + exam open for entry. The API should scope results by employee permissions in production.
    const ids = [
      ...new Set(
        [...selectedExams.map((e) => String(e.id)), String(entryExamId)].filter(
          Boolean,
        ),
      ),
    ];
    if (!ids.length) return;
    setWorking(true);
    Promise.all(
      ids.map(async (id) => {
        const marks = await api.getMarks(id);
        return [id, marks];
      }),
    )
      .then((result) => {
        if (alive)
          setMarksByExam((old) => ({ ...old, ...Object.fromEntries(result) }));
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setWorking(false);
      });
    return () => {
      alive = false;
    };
  }, [selectedKey, entryExamId, reloadKey]);

  useEffect(() => {
    const entries = marksByExam[String(entryExamId)] || [];

    // Check whether MCQ marks have been uploaded
    const hasMCQ = Boolean(getMCQExam(entryExamId));

    const initialDraft = Object.fromEntries(
      entries.map((r) => {
        const savedWritten = hasMCQ
          ? getSavedWrittenMark(entryExamId, r.studentId)
          : null;

        return [
          String(r.studentId),
          {
            value: hasMCQ
              ? (savedWritten?.value ?? "")
              : r.marks === null || r.marks === undefined
                ? ""
                : String(r.marks),

            absent: Boolean(r.absent),
          },
        ];
      }),
    );

    setDraft(initialDraft);
  }, [entryExamId, marksByExam]);
  function toggleExam(id) {
    setChosenIds((old) =>
      old.includes(String(id))
        ? old.filter((x) => x !== String(id))
        : [...old, String(id)],
    );
  }

  function updateMark(id, changes) {
    setDraft((old) => ({
      ...old,
      [String(id)]: {
        value: "",
        absent: false,
        ...(old[String(id)] || {}),
        ...changes,
      },
    }));
  }

  async function saveEntry() {
    if (!matchedStudent) {
      setError("Please search a valid Student ID first.");
      return;
    }

    if (!currentEntry) {
      setError("Please select an exam first.");
      return;
    }

    if (currentEntry.status === "published") {
      setError("Published exam marks cannot be edited.");
      return;
    }

    const studentId = String(matchedStudent.id);

    const studentDraft = draft[studentId];

    if (
      !studentDraft ||
      (!studentDraft.absent && String(studentDraft.value ?? "").trim() === "")
    ) {
      setError("Please enter Written Marks or select Absent.");
      return;
    }

    const absent = Boolean(studentDraft.absent);

    // Get saved and locked MCQ marks
    const mcqInfo = getMCQExam(currentEntry.id);

    const mcqRecord = getMCQMarks(currentEntry.id, matchedStudent.id);

    // Calculate written full marks
    const mcqFull = Number(mcqInfo?.mcqFullMarks ?? 0);

    const writtenFull = Number(currentEntry.fullMarks) - mcqFull;

    // Student must have an MCQ record if MCQ was uploaded
    if (mcqInfo && !mcqRecord) {
      setError("MCQ marks not found for this student.");
      return;
    }

    // Written marks entered manually
    const onlyMCQ = currentEntry.examType === "mcq";

    if (onlyMCQ && (!mcqInfo || !mcqRecord)) {
      setError("Please upload and lock MCQ marks first.");
      return;
    }

    const writtenText = onlyMCQ ? "0" : String(studentDraft.value ?? "").trim();

    const writtenMarks = absent ? null : Number(writtenText);

    // Validate written marks
    if (
      !absent &&
      !onlyMCQ &&
      (writtenText === "" ||
        !Number.isFinite(writtenMarks) ||
        writtenMarks < 0 ||
        writtenMarks > writtenFull)
    ) {
      setError(`Written Marks must be between 0 and ${writtenFull}`);
      return;
    }

    // Final Combined Marks
    const marks = absent
      ? null
      : Number((writtenMarks + Number(mcqRecord?.marks ?? 0)).toFixed(2));

    if (
      !absent &&
      (!Number.isFinite(marks) ||
        marks < 0 ||
        marks > Number(currentEntry.fullMarks))
    ) {
      setError(`Marks must be between 0 and ${currentEntry.fullMarks}`);
      return;
    }

    setWorking(true);
    setError("");
    setNotice("");

    try {
      // Preserve previously saved student marks
      const previousMarks = await api.getMarks(currentEntry.id);

      const updatedMarks = previousMarks.filter(
        (item) => String(item.studentId) !== studentId,
      );

      // Add or update only the searched student
      updatedMarks.push({
        studentId,
        marks,
        absent,
      });

      await api.saveMarks(currentEntry.id, updatedMarks);
      // Store written marks only after total marks are saved
      if (mcqInfo) {
        saveWrittenMark(currentEntry.id, studentId, writtenMarks, absent);
      }

      const savedMarks = await api.getMarks(currentEntry.id);

      setMarksByExam((old) => ({
        ...old,
        [String(currentEntry.id)]: savedMarks,
      }));

      setNotice(`Marks saved successfully for ${matchedStudent.name}!`);
    } catch (error) {
      setError("Marks Save Failed: " + error.message);
    } finally {
      setWorking(false);
    }
  }

  async function downloadExcel() {
    if (!selectedExams.length) return;
    setWorking(true);
    setError("");
    try {
      const { default: ExcelJS } = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      const sheet = wb.addWorksheet("Batch Result", {
        views: [{ state: "frozen", xSplit: 3, ySplit: 3 }],
      });
      const titles = [
        "Merit",
        "Student ID",
        "Student Name",
        ...selectedExams.map(
          (e) => `${shortDate(e.date)} | ${e.title} / ${normalFullMarks(e)}`,
        ),
        "Total",
        "Out of",
        "Percentage",
        "Change (pp)",
        "Remarks",
      ];
      sheet.addRow(["RPR DUET ADMISSION CARE — BATCH RESULT SHEET"]);
      sheet.mergeCells(1, 1, 1, titles.length);
      sheet.getRow(1).font = {
        bold: true,
        size: 15,
        color: { argb: "FFFFFFFF" },
      };
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF133455" },
      };
      sheet.addRow([
        `Batch: ${batch?.name || ""} | Selected dates: ${selectedExams.map((e) => shortDate(e.date)).join(", ")}`,
      ]);
      sheet.mergeCells(2, 1, 2, titles.length);
      sheet.addRow(titles);
      sheet.getRow(3).font = { bold: true, color: { argb: "FF183658" } };
      sheet.getRow(3).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE8F2FF" },
      };
      const possible = selectedExams.reduce(
        (sum, e) => sum + Number(e.fullMarks),
        0,
      );
      sortedRows.forEach((row) =>
        sheet.addRow([
          row.position ?? "—",
          String(row.id),
          row.name,
          ...row.cells.map((cell, i) => {
            const exam = selectedExams[i];

            const mcqExam = getMCQExam(exam.id);

            const mcqRecord = getMCQMarks(exam.id, row.id);

            const writtenRecord = getSavedWrittenMark(exam.id, row.id);

            if (
              !cell.entered ||
              cell.absent ||
              !mcqExam ||
              !mcqRecord ||
              !writtenRecord ||
              writtenRecord.absent ||
              writtenRecord.value === "" ||
              writtenRecord.value === null ||
              writtenRecord.value === undefined
            ) {
              return cell.display;
            }

            const mcqMarks = Number(mcqRecord.marks);
            const writtenMarks = Number(writtenRecord.value);

            const writtenFull =
              Number(exam.fullMarks) - Number(mcqExam.mcqFullMarks);

            const combined = mcqMarks + writtenMarks;

            // Show breakdown only when it matches saved total
            if (
              !Number.isFinite(combined) ||
              Math.abs(combined - Number(cell.display)) > 0.01
            ) {
              return cell.display;
            }

            return (
              `${cell.display}/${exam.fullMarks}\n` +
              `MCQ: ${mcqRecord.absent ? "AB" : mcqMarks}/${mcqExam.mcqFullMarks}\n` +
              `Written: ${writtenMarks}/${writtenFull}`
            );
          }),
          row.complete ? row.total : "—",
          row.complete ? possible : "—",
          row.percent === null ? "—" : Number(row.percent.toFixed(2)),
          row.delta === null ? "—" : Number(row.delta.toFixed(2)),
          selectedExams.length === 1
            ? row.complete
              ? "First Exam"
              : "Marks Pending"
            : row.trend &&
                row.trend !== "—" &&
                row.trend !== "Insufficient data"
              ? row.trend
              : "Insufficient Marks",
        ]),
      );
      sheet.getColumn(1).width = 10;
      sheet.getColumn(2).width = 24;
      sheet.getColumn(3).width = 26;
      for (let i = 0; i < selectedExams.length; i++) {
        const column = sheet.getColumn(4 + i);

        column.width = 34;

        column.alignment = {
          wrapText: true,
          vertical: "middle",
          horizontal: "center",
        };
      }

      // Increase row height for MCQ/Written breakdown
      rows.forEach((row, index) => {
        const excelRow = sheet.getRow(index + 4);

        const hasBreakdown = selectedExams.some((exam) => {
          const mcq = getMCQExam(exam.id);

          const written = getSavedWrittenMark(exam.id, row.id);

          return mcq && written && !written.absent && written.value !== "";
        });

        excelRow.height = hasBreakdown ? 54 : 25;
      });
      for (let i = titles.length - 4; i <= titles.length; i++)
        sheet.getColumn(i).width = i === titles.length ? 23 : 16;
      sheet.getRow(3).height = 28;
      sheet.autoFilter = {
        from: { row: 3, column: 1 },
        to: { row: Math.max(3, 3 + rows.length), column: titles.length },
      };
      sheet.addRow([]);
      sheet.addRow([
        "AB = Absent (counts as 0); — = Not entered (no aggregate rank); change = percentage-point change of last two selected dates.",
      ]);
      saveExcel(
        await wb.xlsx.writeBuffer(),
        `RPR_Batch_Result_${batchId}_${selectedExams[0].date}_to_${selectedExams.at(-1).date}.xlsx`,
      );
      setNotice("Selected exam dates exported to Excel.");
    } catch (e) {
      setError(`Excel export failed: ${e.message}`);
    } finally {
      setWorking(false);
    }
  }

  const possible = selectedExams.reduce(
    (sum, e) => sum + Number(e.fullMarks),
    0,
  );
  const isWide = selectedExams.length > 6;

  return (
    <div className={`employee-root ${embedded ? "embedded-admin" : ""}`}>
      <header className="employee-top no-print">
        <div className="employee-brand">
          <span className="brand-mark">R</span>
          <span>
            <strong>RPR DUET ADMISSION CARE</strong>
            <small>EMPLOYEE WORKSTATION · SYSTEM VIEW</small>
          </span>
        </div>
        <div className="employee-user">
          <span className="preview-label">
            ● FRONTEND PREVIEW — NO LOGIN YET
          </span>
          <button type="button" className="employee-back" onClick={onBack}>
            ← Admin Preview
          </button>
        </div>
      </header>
      <div className="employee-layout">
        <aside className="employee-side no-print">
          <span className="employee-side-label">WORKSPACE</span>
          <button
            className={screen === "batch" ? "chosen" : ""}
            onClick={() => {
              setScreen("batch");
              setError("");
            }}
          >
            ▤ &nbsp; Batch-wise Result
          </button>
          <button
            className={screen === "entry" ? "chosen" : ""}
            onClick={() => {
              setScreen("entry");
              setError("");
            }}
          >
            ✎ &nbsp; Marks Entry
          </button>
          <div className="employee-side-foot">
            Access to batches and exams will be controlled by Admin after
            backend integration.
          </div>
        </aside>
        <main
          className={`employee-main ${
            screen === "batch" ? "batch-screen" : "entry-screen"
          }`}
        >
          {error && (
            <div className="emp-message error no-print" role="alert">
              ⚠ {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          )}
          {notice && (
            <div className="emp-message no-print" role="status">
              ✓ {notice}
              <button onClick={() => setNotice("")}>×</button>
            </div>
          )}
          {screen === "batch" ? (
            <>
              <div className="employee-title no-print">
                <div>
                  <div className="eyebrow">FLEXIBLE EXAM DATE SELECTION</div>
                  <h1>Batch-wise Result Sheet</h1>
                  <p>
                    Select any exam dates from a batch. Print only the columns
                    you choose.
                  </p>
                </div>
              </div>
              <div className="emp-select panel no-print">
                <div className="emp-select-fields">
                  <label>
                    SELECT BATCH
                    <select
                      value={batchId}
                      onChange={(e) => {
                        setBatchId(e.target.value);
                        setMonth("all");
                        setNotice("");
                      }}
                    >
                      <option value="">Choose batch</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    EXAM MONTH
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      <option value="all">All months</option>
                      {monthOptions.map((m) => (
                        <option value={m} key={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    RESULT SORTING
                    <select
                      value={resultSort}
                      onChange={(e) => setResultSort(e.target.value)}
                    >
                      <option value="highest">Highest to Lowest</option>

                      <option value="lowest">Lowest to Highest</option>
                    </select>
                  </label>
                  <div className="emp-count">
                    {visibleExams.length} exams available
                    <br />
                    <b>{selectedExams.length} selected for report</b>
                  </div>
                </div>
                <div className="emp-choose-head">
                  <div>
                    <strong>Choose exam dates</strong>
                    <small>
                      Each checkbox = one column in the result sheet. Different
                      exams on the same date can be selected separately.
                    </small>
                  </div>
                  <div className="emp-quick">
                    <button
                      onClick={() =>
                        setChosenIds(visibleExams.map((e) => String(e.id)))
                      }
                    >
                      Select all
                    </button>
                    <button
                      onClick={() =>
                        setChosenIds(
                          visibleExams.slice(-4).map((e) => String(e.id)),
                        )
                      }
                    >
                      Last 4
                    </button>
                    <button onClick={() => setChosenIds([])}>Clear</button>
                  </div>
                </div>
                <div className="emp-exam-grid">
                  {visibleExams.map((e) => (
                    <label
                      key={e.id}
                      className={`emp-exam-choice ${chosenIds.includes(String(e.id)) ? "is-checked" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={chosenIds.includes(String(e.id))}
                        onChange={() => toggleExam(e.id)}
                      />
                      <span className="emp-date">{shortDate(e.date)}</span>
                      <span className="emp-exam-info">
                        <b>{e.title}</b>
                        <small>
                          {e.subject} · Full Marks: {normalFullMarks(e)} ·{" "}
                          {e.status}
                        </small>
                      </span>
                    </label>
                  ))}
                  {visibleExams.length === 0 && (
                    <p className="emp-no-exams">
                      No exams in this batch/month. Create exams in the existing
                      management view.
                    </p>
                  )}
                </div>
              </div>
              {selectedExams.length > 0 ? (
                <div className="employee-print-wrap printable">
                  <div className="emp-print-head">
                    <h2>RPR DUET ADMISSION CARE</h2>
                    <h3>BATCH-WISE COMPARATIVE RESULT SHEET</h3>
                    <p>
                      Batch: {batch?.name || "—"} &nbsp; | &nbsp; Selected
                      Dates:{" "}
                      {selectedExams.map((e) => shortDate(e.date)).join(" · ")}
                    </p>
                  </div>
                  <div className="emp-result-head no-print">
                    <div>
                      <div className="eyebrow">LIVE RESULT PREVIEW</div>
                      <h2>{resultBatchName}</h2>
                      <p>
                        Only checked dates are included in Print / PDF / Excel.
                      </p>
                    </div>
                    <div className="btn-group">
                      <button
                        className="btn btn-outline"
                        disabled={working || loading}
                        onClick={() => {
                          setNotice("");
                          window.print();
                        }}
                      >
                        ⎙ Print / Save PDF
                      </button>
                      <button
                        className="btn btn-primary"
                        disabled={working || loading}
                        onClick={downloadExcel}
                      >
                        ↓ Download Excel
                      </button>
                    </div>
                  </div>
                  <div className="emp-stats no-print">
                    <div>
                      <small>Batch Students</small>
                      <b>{students.length}</b>
                    </div>
                    <div>
                      <small>Completed all selected dates</small>
                      <b>{completed.length}</b>
                    </div>
                    <div>
                      <small>Improved (last vs previous)</small>
                      <b className="positive">{countImproved}</b>
                    </div>
                    <div>
                      <small>Needs improvement</small>
                      <b className="negative">{countDeclined}</b>
                    </div>
                  </div>
                  <div className="emp-table-scroll">
                    <table
                      className={`emp-report-table ${isWide ? "table-wide" : ""}`}
                    >
                      <thead>
                        <tr>
                          <th className="emp-rank">Merit</th>
                          <th>Student ID</th>
                          <th>Student Name</th>
                          {selectedExams.map((e) => (
                            <th className="emp-exam-th" key={e.id}>
                              <span>{shortDate(e.date)}</span>
                              <small>{e.title}</small>
                              <em>/{normalFullMarks(e)}</em>
                            </th>
                          ))}
                          <th>Total / {possible}</th>
                          <th>%</th>
                          <th>Change*</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRows.map((row) => (
                          <tr key={row.id}>
                            <td className="emp-rank">
                              <strong>{row.position ?? "—"}</strong>
                            </td>
                            <td className="emp-id">{row.id}</td>
                            <td className="emp-name">{row.name}</td>
                            {row.cells.map((cell, i) => (
                              <td
                                key={selectedExams[i].id}
                                className={
                                  cell.absent
                                    ? "emp-absent"
                                    : cell.entered
                                      ? ""
                                      : "emp-missing"
                                }
                              >
                                {(() => {
                                  const exam = selectedExams[i];

                                  const mcqExam = getMCQExam(exam.id);

                                  const mcqRecord = getMCQMarks(
                                    exam.id,
                                    row.id,
                                  );

                                  const writtenRecord = getSavedWrittenMark(
                                    exam.id,
                                    row.id,
                                  );

                                  const hasWritten =
                                    writtenRecord &&
                                    !writtenRecord.absent &&
                                    writtenRecord.value !== "" &&
                                    writtenRecord.value !== null &&
                                    writtenRecord.value !== undefined;

                                  const writtenFull = mcqExam
                                    ? Number(exam.fullMarks) -
                                      Number(mcqExam.mcqFullMarks)
                                    : 0;

                                  return (
                                    <div>
                                      <strong>{cell.display}</strong>

                                      {cell.entered &&
                                        !cell.absent &&
                                        mcqExam &&
                                        mcqRecord &&
                                        hasWritten && (
                                          <div
                                            style={{
                                              marginTop: "6px",
                                              fontSize: "11px",
                                              lineHeight: "1.7",
                                              color: "#475569",
                                            }}
                                          >
                                            <div>
                                              🔒 MCQ:{" "}
                                              <b>
                                                {mcqRecord.absent
                                                  ? "AB"
                                                  : mcqRecord.marks}
                                              </b>
                                              /{mcqExam.mcqFullMarks}
                                            </div>

                                            <div>
                                              ✏️ Written:{" "}
                                              <b>{writtenRecord.value}</b>/
                                              {writtenFull}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  );
                                })()}
                              </td>
                            ))}
                            <td>
                              <b>{numberText(row.total)}</b>
                            </td>
                            <td>
                              {row.percent === null
                                ? "—"
                                : `${numberText(row.percent)}%`}
                            </td>
                            <td
                              className={
                                row.delta === null
                                  ? ""
                                  : row.delta > 0
                                    ? "emp-up"
                                    : row.delta < 0
                                      ? "emp-down"
                                      : ""
                              }
                            >
                              {row.delta === null
                                ? "—"
                                : `${row.delta > 0 ? "+" : ""}${numberText(row.delta)} pp`}
                            </td>
                            <td className="emp-trend">
                              {selectedExams.length < 2
                                ? row.complete
                                  ? "First Exam"
                                  : "Marks Pending"
                                : row.trend && row.trend !== "—"
                                  ? row.trend
                                  : "Insufficient Marks"}
                            </td>
                          </tr>
                        ))}
                        {rows.length === 0 && (
                          <tr>
                            <td colSpan={selectedExams.length + 7}>
                              No students in this batch.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="emp-legend">
                    <strong>AB</strong> = Absent (counts as 0).{" "}
                    <strong>—</strong> = Not entered (total/merit not
                    calculated). <strong>Change*</strong> = percentage-point
                    difference between the final two selected exams, normalized
                    for different full marks. Comparisons across subjects are
                    indicative only. Merit uses total of all selected exams;
                    ties share the same position.
                  </div>
                  <div className="emp-signature">
                    <span>Prepared by: __________________</span>
                    <span>Verified by: __________________</span>
                    <span>Authorized Signature: __________________</span>
                  </div>
                </div>
              ) : (
                <div className="emp-empty no-print">
                  ☑ Select at least one exam date to generate the batch result
                  sheet.
                </div>
              )}
            </>
          ) : (
            <>
              <div className="employee-title no-print">
                <div>
                  <div className="eyebrow">EMPLOYEE WORKSPACE · DEMO</div>
                  <h1>Student Marks Entry</h1>
                  <p>
                    Employees enter marks for assigned exams. Login and
                    assignment rules will be added later.
                  </p>
                </div>
              </div>
              <section className="panel emp-entry">
                <div className="emp-entry-filters">
                  <label>
                    STUDENT BATCH (AUTO)
                    <input
                      type="text"
                      value={matchedStudent?.batch || "Not Found"}
                      readOnly
                      style={{
                        background: "#e8f5f0",
                        color: "#065f46",
                        fontWeight: "700",
                        cursor: "not-allowed",
                      }}
                    />
                  </label>
                  <label>
                    SELECT EXAM
                    <select
                      value={entryExamId}
                      onChange={(e) => {
                        setEntryExamId(e.target.value);
                        setNotice("");
                      }}
                    >
                      <option value="">Choose exam</option>
                      {entryAvailable.map((e) => (
                        <option value={e.id} key={e.id}>
                          {shortDate(e.date)} · {e.title} · {e.status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    SEARCH STUDENT
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter Student ID"
                    />
                  </label>
                </div>
                {/* AUTO STUDENT INFORMATION */}

                {screen === "entry" && query.trim() && (
                  <div
                    style={{
                      background: "#ffffff",
                      padding: "25px",
                      margin: "20px 0",
                      borderRadius: "14px",
                      border: "1px solid #d1e5e0",
                      boxShadow: "0 5px 18px rgba(0,0,0,0.04)",
                    }}
                  >
                    {matchedStudent ? (
                      <>
                        <h2
                          style={{
                            marginBottom: "24px",
                            paddingBottom: "15px",
                            borderBottom: "1px solid #dbeafe",
                            color: "#1e3a8a",
                            fontSize: "20px",
                            fontWeight: "800",
                          }}
                        >
                          👤 Student Information
                        </h2>

                        <div
                          className="admin-student-grid"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "20px",
                          }}
                        >
                          <div>
                            <strong>Student ID</strong>
                            <p>{matchedStudent.id}</p>
                          </div>

                          <div>
                            <strong>Student Name</strong>
                            <p>{matchedStudent.name}</p>
                          </div>

                          <div>
                            <strong>Phone Number</strong>
                            <p>{matchedStudent.phone || "—"}</p>
                          </div>

                          <div>
                            <strong>Batch</strong>
                            <p>{matchedStudent.batch || "—"}</p>
                          </div>

                          <div>
                            <strong>Department</strong>
                            <p>{matchedStudent.department || "—"}</p>
                          </div>

                          <div>
                            <strong>Student Type</strong>
                            <p>{matchedStudent.source}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p style={{ color: "#dc2626" }}>Student ID not found.</p>
                    )}
                  </div>
                )}
                {currentEntry && (
                  <>
                    <div className="emp-entry-head">
                      <div>
                        <h2>{currentEntry.title}</h2>
                        {matchedStudent && (
                          <div
                            style={{
                              marginTop: "15px",
                              padding: "18px",
                              background: "#eff6ff",
                              border: "1px solid #bfdbfe",
                              borderRadius: "12px",
                            }}
                          >
                            <div
                              style={{ fontWeight: "700", color: "#1e40af" }}
                            >
                              🔒 MCQ Marks (Automatic)
                            </div>

                            <div
                              style={{
                                fontSize: "24px",
                                fontWeight: "800",
                                color: "#0f172a",
                                marginTop: "8px",
                              }}
                            >
                              {!mcqExamInfo
                                ? "MCQ Not Uploaded"
                                : !lockedMCQ
                                  ? "MCQ Record Not Found"
                                  : lockedMCQ.absent
                                    ? "AB"
                                    : `${lockedMCQ.marks} / ${mcqExamInfo.mcqFullMarks}`}
                            </div>

                            <small style={{ color: "#64748b" }}>
                              MCQ marks are locked and cannot be edited here.
                            </small>
                          </div>
                        )}
                        <p>
                          {batch?.name} · {shortDate(currentEntry.date)} · Full
                          Marks: {normalFullMarks(currentEntry)} ·{" "}
                          {currentEntry.status}
                        </p>
                      </div>
                      <button
                        className="btn btn-primary"
                        disabled={
                          working ||
                          loading ||
                          currentEntry.status === "published"
                        }
                        onClick={saveEntry}
                      >
                        {working ? "Saving…" : "✓ Save Marks"}
                      </button>
                    </div>
                    {currentEntry.status === "published" && (
                      <div className="emp-entry-alert">
                        This exam is Published. The employee view cannot edit
                        its marks. Admin may reopen it after review.
                      </div>
                    )}
                    <div className="emp-table-scroll">
                      <table className="emp-mark-table">
                        <thead>
                          <tr>
                            <th>Student ID</th>
                            <th>Student Name</th>
                            <th>Department</th>
                            <th>MCQ Marks 🔒</th>
                            <th>Written Marks ✏️ / {writtenFullMarks}</th>
                            <th>
                              Total Marks / {normalFullMarks(currentEntry)}
                            </th>
                            <th>Absent</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((s) => (
                            <tr key={s.id}>
                              <td className="emp-id">{s.id}</td>
                              <td className="emp-name">{s.name}</td>
                              <td>{s.department || "—"}</td>
                              <td>
                                {getMCQExam(currentEntry?.id)
                                  ? getMCQMarks(currentEntry?.id, s.id)?.absent
                                    ? "AB"
                                    : (getMCQMarks(currentEntry?.id, s.id)
                                        ?.marks ?? "Not Found")
                                  : "—"}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  max={writtenFullMarks}
                                  disabled={
                                    currentEntry.status === "published" ||
                                    draft[String(s.id)]?.absent
                                  }
                                  value={draft[String(s.id)]?.value ?? ""}
                                  onChange={(e) =>
                                    updateMark(s.id, { value: e.target.value })
                                  }
                                  aria-label={`Marks ${s.name}`}
                                />
                              </td>
                              <td
                                style={{
                                  fontWeight: "800",
                                  color: "#047857",
                                  fontSize: "16px",
                                }}
                              >
                                {(() => {
                                  const studentMCQ = getMCQMarks(
                                    currentEntry.id,
                                    s.id,
                                  );

                                  const hasMCQExam = Boolean(
                                    getMCQExam(currentEntry.id),
                                  );

                                  const draftMark = draft[String(s.id)];

                                  const writtenValue = String(
                                    draftMark?.value ?? "",
                                  ).trim();

                                  if (draftMark?.absent) {
                                    return "AB";
                                  }

                                  if (writtenValue === "") {
                                    const savedRecord = (
                                      marksByExam[String(currentEntry.id)] || []
                                    ).find(
                                      (r) =>
                                        String(r.studentId)
                                          .trim()
                                          .toUpperCase() ===
                                        String(s.id).trim().toUpperCase(),
                                    );

                                    if (!savedRecord) {
                                      return "—";
                                    }

                                    if (savedRecord.absent) {
                                      return "AB (Saved)";
                                    }

                                    if (
                                      savedRecord.marks === null ||
                                      savedRecord.marks === undefined ||
                                      savedRecord.marks === ""
                                    ) {
                                      return "—";
                                    }

                                    return `${savedRecord.marks} (Saved Total)`;
                                  }

                                  if (hasMCQExam && !studentMCQ) {
                                    return "MCQ Not Found";
                                  }

                                  if (studentMCQ?.absent) {
                                    return "MCQ AB";
                                  }

                                  const written = Number(writtenValue);
                                  const mcq = Number(studentMCQ?.marks ?? 0);

                                  const total = written + mcq;

                                  return Number.isFinite(total)
                                    ? Number(total.toFixed(2))
                                    : "—";
                                })()}
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  disabled={currentEntry.status === "published"}
                                  checked={Boolean(draft[String(s.id)]?.absent)}
                                  onChange={(e) =>
                                    updateMark(s.id, {
                                      absent: e.target.checked,
                                      value: e.target.checked
                                        ? ""
                                        : draft[String(s.id)]?.value || "",
                                    })
                                  }
                                  aria-label={`Absent ${s.name}`}
                                />
                              </td>
                              <td>
                                {savedMap.has(String(s.id)) ? (
                                  <span className="emp-saved">● Saved</span>
                                ) : (
                                  "Pending"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="emp-entry-footer">
                      Saved exam marks are used immediately in the comparative
                      result sheet.{" "}
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          setChosenIds((old) =>
                            old.includes(String(currentEntry.id))
                              ? old
                              : [...old, String(currentEntry.id)],
                          );
                          setScreen("batch");
                        }}
                      >
                        View Batch Result →
                      </button>
                    </div>
                  </>
                )}
              </section>
            </>
          )}
          <footer className="emp-footer no-print">
            RPR DUET Admission Care · Preview uses sample student records stored
            in this browser only · No real employee authentication yet
          </footer>
        </main>
      </div>
    </div>
  );
}

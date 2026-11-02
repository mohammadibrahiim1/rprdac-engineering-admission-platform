// import StudentAllResults from "./StudentAllResults.jsx";
// import { getMCQExam } from "./mcqStore.js";
// import MCQUpload from "./MCQUpload.jsx";
// import AdminBatchResult from "./AdminBatchResult.jsx";
// import DataManagement from "./DataManagement.jsx";
// import StudentManagement from "./StudentManagement.jsx";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { api, DEMO } from "./api.js";
// import { computeResults, examStats, pretty, marksText } from "./utils.js";
// import BatchManagement from "./BatchManagement.jsx";
// import "./App.css";

// const NAV = [
//   { id: "dashboard", icon: "◫", label: "Dashboard", hint: "ওভারভিউ" },
//   {
//     id: "exams",
//     icon: "▤",
//     label: "Exam Management",
//     hint: "পরীক্ষা তৈরি ও প্রকাশ",
//   },
//   { id: "marks", icon: "✎", label: "Marks Entry", hint: "নম্বর এন্ট্রি" },
//   {
//     id: "mcq-upload",
//     icon: "📄",
//     label: "MCQ Result Upload",
//     hint: "Excel / PDF MCQ নম্বর আপলোড",
//   },
//   {
//     id: "results",
//     icon: "▥",
//     label: "Result & Merit List",
//     hint: "রেজাল্ট ও মেধাতালিকা",
//   },
//   {
//     id: "batch-results",
//     icon: "📊",
//     label: "Batch-wise Result",
//     hint: "ব্যাচভিত্তিক পরীক্ষার ফলাফল",
//   },
//   {
//     id: "lookup",
//     icon: "⌕",
//     label: "Student Result",
//     hint: "শিক্ষার্থী অনুসন্ধান",
//   },
//   {
//     id: "students",
//     icon: "👨‍🎓",
//     label: "Student Management",
//     hint: "Student ID & Excel",
//   },
//   {
//     id: "data-management",
//     icon: "⚙️",
//     label: "Data Management",
//     hint: "Admin Data Control",
//   },
//   {
//     id: "batches",
//     icon: "📚",
//     label: "Batch Management",
//     hint: "Create & Manage Batches",
//   },
// ];

// const emptyForm = {
//   title: "",
//   subject: "",
//   date: new Date().toISOString().slice(0, 10),
//   batchId: "",
//   batchIds: [],
//   examType: "written",
//   fullMarks: "100",
//   mcqFullMarks: "0",
// };
// const statusClass = (status) =>
//   status === "published" ? "success" : "warning";
// const batchName = (batches, id) =>
//   batches.find((b) => String(b.id) === String(id))?.name || id;

// function Badge({ value }) {
//   return (
//     <span className={`badge ${statusClass(value)}`}>
//       {value === "published" ? "● Published" : "● Draft"}
//     </span>
//   );
// }

// function EmptyState({ title, description }) {
//   return (
//     <div className="empty">
//       <div className="empty-symbol">▧</div>
//       <h3>{title}</h3>
//       <p>{description}</p>
//     </div>
//   );
// }

// function PageHeading({ eyebrow, title, description, right }) {
//   return (
//     <div className="page-heading">
//       <div>
//         <div className="eyebrow">{eyebrow}</div>
//         <h1>{title}</h1>
//         <p>{description}</p>
//       </div>
//       {right && <div className="heading-actions">{right}</div>}
//     </div>
//   );
// }

// function StatCard({ icon, label, value, note, tone = "blue" }) {
//   return (
//     <div className="stat-card">
//       <div className={`stat-icon ${tone}`}>{icon}</div>
//       <div className="stat-label">{label}</div>
//       <div className="stat-value">{value}</div>
//       <div className="stat-note">{note}</div>
//     </div>
//   );
// }

// function ExcelButton({
//   children,
//   onClick,
//   disabled = false,
//   secondary = false,
// }) {
//   return (
//     <button
//       type="button"
//       className={`btn ${secondary ? "btn-outline" : "btn-primary"}`}
//       onClick={onClick}
//       disabled={disabled}
//     >
//       {children}
//     </button>
//   );
// }

// async function newWorkbook() {
//   const { default: ExcelJS } = await import("exceljs");
//   return new ExcelJS.Workbook();
// }

// function downloadBuffer(buffer, filename) {
//   const blob = new Blob([buffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   setTimeout(() => URL.revokeObjectURL(url), 1200);
// }

// function makeExcelSheet(wb, heading, columns, rows) {
//   const sheet = wb.addWorksheet("Results");
//   sheet.addRow([heading]);
//   sheet.mergeCells(1, 1, 1, columns.length);
//   sheet.getRow(1).font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
//   sheet.getRow(1).fill = {
//     type: "pattern",
//     pattern: "solid",
//     fgColor: { argb: "FF12345A" },
//   };
//   sheet.getRow(1).height = 30;
//   sheet.addRow(columns.map((c) => c.title));
//   const header = sheet.getRow(2);
//   header.font = { bold: true };
//   header.fill = {
//     type: "pattern",
//     pattern: "solid",
//     fgColor: { argb: "FFE7F0FF" },
//   };
//   rows.forEach((row) => sheet.addRow(columns.map((c) => row[c.key] ?? "")));
//   columns.forEach((c, i) => {
//     sheet.getColumn(i + 1).width = c.width || 20;
//   });
//   sheet.views = [{ state: "frozen", ySplit: 2 }];
//   return sheet;
// }

// const resultColumns = [
//   { key: "id", title: "Student ID", width: 20 },
//   { key: "name", title: "Student Name", width: 28 },
//   { key: "department", title: "Department", width: 17 },
//   { key: "marksDisplay", title: "Marks", width: 14 },
//   { key: "percentageDisplay", title: "Percentage", width: 15 },
//   { key: "positionDisplay", title: "Merit Position", width: 17 },
// ];

// export default function App() {
//   const [resultSort, setResultSort] = useState("highest");
//   const [tab, setTab] = useState("dashboard");
//   const [batches, setBatches] = useState([]);
//   const [exams, setExams] = useState([]);
//   const [allCount, setAllCount] = useState(null);
//   const [selectedExamId, setSelectedExamId] = useState("");
//   const [editingExamId, setEditingExamId] = useState(null);
//   const [examStructureLocked, setExamStructureLocked] = useState(false);
//   const [students, setStudents] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [draft, setDraft] = useState({});
//   const [filter, setFilter] = useState("");
//   const [examDateFilter, setExamDateFilter] = useState("");
//   const [examBatchSearch, setExamBatchSearch] = useState("");
//   const [form, setForm] = useState(emptyForm);
//   const [lookupId, setLookupId] = useState("");
//   const [lookupSubmitted, setLookupSubmitted] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [fetching, setFetching] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState(null);
//   const fileRef = useRef(null);

//   const selectedExam = useMemo(
//     () => exams.find((e) => String(e.id) === String(selectedExamId)),
//     [exams, selectedExamId],
//   );
//   const results = useMemo(
//     () => computeResults(students, marks, selectedExam?.fullMarks || 100),
//     [students, marks, selectedExam],
//   );
//   // Admin Result Sorting
//   const sortedResults = useMemo(() => {
//     return [...results].sort((a, b) => {
//       const aRecorded = Boolean(a.entered || a.absent);
//       const bRecorded = Boolean(b.entered || b.absent);

//       // Students without marks stay at the bottom
//       if (aRecorded !== bRecorded) {
//         return aRecorded ? -1 : 1;
//       }

//       const aMarks = a.absent ? 0 : Number(a.marks);
//       const bMarks = b.absent ? 0 : Number(b.marks);

//       if (aRecorded && bRecorded && aMarks !== bMarks) {
//         return resultSort === "lowest" ? aMarks - bMarks : bMarks - aMarks;
//       }

//       return String(a.id).localeCompare(String(b.id));
//     });
//   }, [results, resultSort]);
//   const stats = useMemo(() => examStats(results), [results]);
//   const filteredStudents = useMemo(
//     () =>
//       students.filter((s) =>
//         `${s.id} ${s.name} ${s.department || ""}`
//           .toLowerCase()
//           .includes(filter.toLowerCase()),
//       ),
//     [students, filter],
//   );

//   const flash = (text, type = "success") => {
//     setMessage({ text, type, id: Date.now() });
//   };

//   useEffect(() => {
//     let active = true;
//     (async () => {
//       try {
//         const [b, e] = await Promise.all([api.getBatches(), api.getExams()]);
//         if (!active) return;
//         setBatches(b);
//         setExams(e);
//         if (e.length) setSelectedExamId(String(e[0].id));
//         setForm((f) => ({ ...f, batchId: b[0] ? String(b[0].id) : "" }));
//         const counts = await Promise.all(
//           b.map((batch) => api.getStudents(batch.id)),
//         );
//         if (active)
//           setAllCount(
//             new Set(counts.flat().map((student) => String(student.id))).size,
//           );
//       } catch (err) {
//         if (active) flash(err.message, "error");
//       } finally {
//         if (active) setLoading(false);
//       }
//     })();
//     return () => {
//       active = false;
//     };
//   }, []);

//   useEffect(() => {
//     if (!selectedExam) {
//       setStudents([]);
//       setMarks([]);
//       setDraft({});
//       return;
//     }
//     let active = true;
//     setFetching(true);
//     setFilter("");
//     (async () => {
//       try {
//         const [s, m] = await Promise.all([
//           api.getStudents(selectedExam.batchId),
//           api.getMarks(selectedExam.id),
//         ]);
//         if (!active) return;
//         setStudents(s);
//         setMarks(m);
//         setDraft(
//           Object.fromEntries(
//             m.map((row) => [
//               String(row.studentId),
//               {
//                 value:
//                   row.marks === null || row.marks === undefined
//                     ? ""
//                     : String(row.marks),
//                 absent: Boolean(row.absent),
//               },
//             ]),
//           ),
//         );
//       } catch (err) {
//         if (active) flash(err.message, "error");
//       } finally {
//         if (active) setFetching(false);
//       }
//     })();
//     return () => {
//       active = false;
//     };
//   }, [selectedExamId, selectedExam?.batchId]);

//   async function refreshExams() {
//     const updated = await api.getExams();
//     setExams(updated);
//     return updated;
//   }

//   async function handleCreate(e) {
//     e.preventDefault();
//     const fullMarks = Number(form.fullMarks);
//     if (
//       !form.title.trim() ||
//       !form.subject.trim() ||
//       !form.batchId ||
//       !form.date
//     )
//       return flash("সব তথ্য পূরণ করুন।", "error");
//     if (!Number.isFinite(fullMarks) || fullMarks <= 0)
//       return flash("পূর্ণমান শূন্যের বেশি হতে হবে।", "error");
//     // Exam Type Validation
//     const examType = form.examType || "written";

//     // Calculate MCQ Full Marks
//     const mcqFullMarks =
//       examType === "mcq"
//         ? fullMarks
//         : examType === "combined"
//           ? Number(form.mcqFullMarks)
//           : 0;

//     // Calculate Written Full Marks
//     const writtenFullMarks = fullMarks - mcqFullMarks;

//     // Validate Exam Type
//     if (!["mcq", "written", "combined"].includes(examType)) {
//       return flash("Invalid Exam Type", "error");
//     }

//     // Validate Combined Exam
//     if (
//       examType === "combined" &&
//       (String(form.mcqFullMarks ?? "").trim() === "" ||
//         !Number.isFinite(mcqFullMarks) ||
//         mcqFullMarks <= 0 ||
//         mcqFullMarks >= fullMarks)
//     ) {
//       return flash(
//         "MCQ Full Marks must be greater than 0 and less than Total Marks.",
//         "error",
//       );
//     }
//     setSaving(true);
//     try {
//       if (editingExamId) {
//         const updated = await api.updateExam(editingExamId, {
//           title: form.title.trim(),
//           subject: form.subject.trim(),
//           batchId: form.batchId,
//           batchIds: form.batchIds?.length
//             ? form.batchIds.map(String)
//             : form.batchId && form.batchId !== "all"
//               ? [String(form.batchId)]
//               : [],
//           date: form.date,
//           fullMarks,

//           // Exam Type Settings
//           examType,
//           mcqFullMarks,
//           writtenFullMarks,
//         });

//         await refreshExams();

//         setSelectedExamId(String(updated.id || editingExamId));

//         setEditingExamId(null);
//         setExamStructureLocked(false);
//         setForm({
//           ...emptyForm,
//           batchId: form.batchId,
//         });

//         flash("পরীক্ষার তথ্য সফলভাবে আপডেট হয়েছে!");

//         return;
//       }
//       const created = await api.createExam({
//         title: form.title.trim(),
//         subject: form.subject.trim(),
//         batchId: form.batchId,
//         batchIds: form.batchIds?.length
//           ? form.batchIds.map(String)
//           : form.batchId
//             ? [String(form.batchId)]
//             : [],
//         date: form.date,
//         fullMarks,

//         // New Exam Type Settings
//         examType,
//         mcqFullMarks,
//         writtenFullMarks,
//       });
//       await refreshExams();
//       setSelectedExamId(String(created.id));
//       setForm({ ...emptyForm, batchId: form.batchId });
//       setTab("marks");
//       flash("নতুন পরীক্ষা তৈরি হয়েছে। এবার নম্বর এন্ট্রি করুন।");
//     } catch (err) {
//       flash(err.message, "error");
//     } finally {
//       setSaving(false);
//     }
//   }
//   // =================================
//   // EDIT EXAM
//   // =================================

//   async function handleEditExam(exam) {
//     setEditingExamId(String(exam.id));
//     // Check whether the exam already has saved marks
//     try {
//       const existingMarks = await api.getMarks(exam.id);

//       const hasWrittenMarks = Array.isArray(existingMarks)
//         ? existingMarks.length > 0
//         : Object.keys(existingMarks || {}).length > 0;

//       const hasLockedMCQ = Boolean(getMCQExam(exam.id));

//       setExamStructureLocked(hasWrittenMarks || hasLockedMCQ);
//     } catch (error) {
//       // Keep exam structure locked if marks cannot be checked
//       setExamStructureLocked(true);
//       flash("Exam marks could not be checked.", "error");
//     }

//     // Get previously saved MCQ information
//     const savedMCQ = getMCQExam(exam.id);

//     const totalFullMarks = Number(exam.fullMarks ?? 100);

//     const savedMCQFullMarks = Number(
//       savedMCQ?.mcqFullMarks ?? exam.mcqFullMarks ?? 0,
//     );

//     // Detect exam type for old and new exams
//     const detectedExamType =
//       exam.examType ||
//       (savedMCQFullMarks === 0
//         ? "written"
//         : savedMCQFullMarks >= totalFullMarks
//           ? "mcq"
//           : "combined");

//     // Fill Edit Form automatically
//     setForm({
//       title: exam.title || "",
//       subject: exam.subject || "",
//       batchId: String(exam.batchId || ""),
//       batchIds:
//         Array.isArray(exam.batchIds) && exam.batchIds.length
//           ? exam.batchIds.map(String)
//           : exam.batchId && exam.batchId !== "all"
//             ? [String(exam.batchId)]
//             : [],
//       date: String(exam.date || "").slice(0, 10),
//       fullMarks: String(totalFullMarks),
//       examType: detectedExamType,
//       mcqFullMarks: String(savedMCQFullMarks),
//     });

//     setTab("exams");

//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     });
//   }
//   async function handleDeleteExam(exam) {
//     const confirmed = window.confirm(
//       `Are you sure you want to delete "${exam.title}"?\n\nAll marks of this exam will also be deleted permanently.`,
//     );

//     if (!confirmed) return;

//     setSaving(true);

//     try {
//       await api.deleteExam(exam.id);

//       const updated = await refreshExams();

//       if (String(selectedExamId) === String(exam.id)) {
//         setSelectedExamId(updated.length ? String(updated[0].id) : "");
//       }

//       flash("Exam deleted successfully!");
//     } catch (error) {
//       flash(error.message, "error");
//     } finally {
//       setSaving(false);
//     }
//   }
//   async function handleStatus(exam) {
//     const next = exam.status === "published" ? "draft" : "published";
//     const action = next === "published" ? "Publish" : "Unpublish";
//     if (!window.confirm(`${exam.title} — ${action} করবেন?`)) return;
//     setSaving(true);
//     try {
//       await api.setExamStatus(exam.id, next);
//       await refreshExams();
//       flash(`Result ${action} হয়েছে।`);
//     } catch (err) {
//       flash(err.message, "error");
//     } finally {
//       setSaving(false);
//     }
//   }

//   function updateDraft(studentId, changes) {
//     setDraft((old) => ({
//       ...old,
//       [String(studentId)]: {
//         value: "",
//         absent: false,
//         ...old[String(studentId)],
//         ...changes,
//       },
//     }));
//   }

//   async function handleSave() {
//     if (!selectedExam) return;
//     if (selectedExam.status === "published")
//       return flash("নম্বর পরিবর্তনের আগে Unpublish করুন।", "error");
//     const entries = [];
//     for (const s of students) {
//       const row = draft[String(s.id)];
//       if (!row || (!row.absent && row.value.trim() === "")) continue;
//       const number = row.absent ? null : Number(row.value);
//       if (
//         !row.absent &&
//         (!Number.isFinite(number) ||
//           number < 0 ||
//           number > selectedExam.fullMarks)
//       ) {
//         return flash(
//           `${s.name} (${s.id}): নম্বর ০ থেকে ${selectedExam.fullMarks} হতে হবে।`,
//           "error",
//         );
//       }
//       entries.push({
//         studentId: String(s.id),
//         marks: number,
//         absent: Boolean(row.absent),
//       });
//     }
//     if (!entries.length) return flash("সেভ করার মতো কোনো নম্বর নেই।", "error");
//     setSaving(true);
//     try {
//       await api.saveMarks(selectedExam.id, entries);
//       setMarks(await api.getMarks(selectedExam.id));
//       flash(`${entries.length} জনের নম্বর সেভ হয়েছে।`);
//     } catch (err) {
//       flash(err.message, "error");
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function downloadTemplate() {
//     if (!selectedExam) return;
//     try {
//       const wb = await newWorkbook();
//       makeExcelSheet(
//         wb,
//         `Marks Entry Template | ${selectedExam.title} | Full Marks: ${selectedExam.fullMarks}`,
//         [
//           { key: "id", title: "Student ID", width: 23 },
//           { key: "name", title: "Student Name (Reference)", width: 30 },
//           { key: "marks", title: "Marks", width: 16 },
//           { key: "absent", title: "Absent (YES/NO)", width: 20 },
//         ],
//         students.map((s) => ({
//           id: s.id,
//           name: s.name,
//           marks: draft[String(s.id)]?.value || "",
//           absent: draft[String(s.id)]?.absent ? "YES" : "NO",
//         })),
//       );
//       downloadBuffer(
//         await wb.xlsx.writeBuffer(),
//         `RPR_Marks_Template_${selectedExam.id}.xlsx`,
//       );
//       flash("Excel template ডাউনলোড হয়েছে।");
//     } catch (err) {
//       flash(`Excel তৈরি হয়নি: ${err.message}`, "error");
//     }
//   }

//   async function importExcel(e) {
//     const file = e.target.files?.[0];
//     e.target.value = "";
//     if (!file || !selectedExam) return;
//     if (selectedExam.status === "published")
//       return flash("Published পরীক্ষায় Import করা যাবে না।", "error");
//     try {
//       const wb = await newWorkbook();
//       await wb.xlsx.load(await file.arrayBuffer());
//       const sheet = wb.getWorksheet(1);
//       if (!sheet || sheet.rowCount < 2)
//         throw new Error("Excel worksheet খালি।");
//       const normalize = (s) =>
//         String(s ?? "")
//           .trim()
//           .toLowerCase();
//       const headers = sheet.getRow(2).values.map(normalize);
//       const getColumn = (...terms) =>
//         headers.findIndex((v) => terms.includes(v));
//       const idCol = getColumn("student id", "id");
//       const marksCol = getColumn("marks", "mark");
//       const absentCol = getColumn("absent (yes/no)", "absent");
//       if (idCol < 1 || marksCol < 1 || absentCol < 1)
//         throw new Error(
//           "শুধু এখান থেকে ডাউনলোড করা Excel Template ব্যবহার করুন।",
//         );
//       const allowed = new Set(students.map((s) => String(s.id)));
//       const updated = {};
//       let skipped = 0;
//       sheet.eachRow((row, idx) => {
//         if (idx <= 2) return;
//         const id = String(row.getCell(idCol).text || "").trim();
//         const value = String(row.getCell(marksCol).text || "").trim();
//         const absentTxt = String(row.getCell(absentCol).text || "")
//           .trim()
//           .toLowerCase();
//         if (!id) return;
//         if (!allowed.has(id)) {
//           skipped++;
//           return;
//         }
//         const absent = ["yes", "true", "1", "y", "absent"].includes(absentTxt);
//         if (!absent && value === "") return;
//         const number = Number(value);
//         if (
//           !absent &&
//           (!Number.isFinite(number) ||
//             number < 0 ||
//             number > selectedExam.fullMarks)
//         ) {
//           skipped++;
//           return;
//         }
//         updated[id] = { value: absent ? "" : String(number), absent };
//       });
//       setDraft((old) => ({ ...old, ...updated }));
//       flash(
//         `${Object.keys(updated).length} জনের নম্বর ফর্মে এসেছে${skipped ? `, ${skipped} টি সারি বাদ` : ""}। এখন “Save Marks” চাপুন।`,
//       );
//     } catch (err) {
//       flash(`Import ব্যর্থ: ${err.message}`, "error");
//     }
//   }

//   async function downloadResults() {
//     if (!selectedExam) return;
//     try {
//       const wb = await newWorkbook();
//       makeExcelSheet(
//         wb,
//         `RPR DUET ADMISSION CARE | ${selectedExam.title}`,
//         resultColumns,
//         sortedResults.map((r) => ({
//           ...r,
//           marksDisplay: marksText(r),
//           percentageDisplay:
//             r.percentage === null ? "—" : `${pretty(r.percentage)}%`,
//           positionDisplay: r.position ?? "—",
//         })),
//       );
//       downloadBuffer(
//         await wb.xlsx.writeBuffer(),
//         `RPR_Results_${selectedExam.id}.xlsx`,
//       );
//       flash("Result Excel ডাউনলোড হয়েছে।");
//     } catch (err) {
//       flash(`Excel তৈরি হয়নি: ${err.message}`, "error");
//     }
//   }

//   const go = (id, examId) => {
//     if (examId) setSelectedExamId(String(examId));
//     setTab(id);
//     setMessage(null);
//   };
//   const page = NAV.find((n) => n.id === tab);
//   const studentFound = students.find(
//     (s) => String(s.id).toLowerCase() === lookupSubmitted.toLowerCase(),
//   );
//   const studentResult = results.find(
//     (s) => String(s.id).toLowerCase() === lookupSubmitted.toLowerCase(),
//   );

//   return (
//     <div className="shell">
//       <aside className="sidebar no-print">
//         <div className="brand">
//           <div className="brand-mark">R</div>
//           <div>
//             <strong>
//               RPR <span>DUET</span>
//             </strong>
//             <small>ADMISSION CARE</small>
//           </div>
//         </div>
//         <div className="sidebar-overline">MANAGEMENT SYSTEM</div>
//         <nav aria-label="Main menu">
//           {NAV.map((n) => (
//             <button
//               key={n.id}
//               onClick={() => go(n.id)}
//               className={`nav-link ${tab === n.id ? "active" : ""}`}
//             >
//               <span className="nav-icon">{n.icon}</span>
//               <span className="nav-text">
//                 <strong>{n.label}</strong>
//                 <small>{n.hint}</small>
//               </span>
//               {tab === n.id && <span className="active-dash" />}
//             </button>
//           ))}
//         </nav>
//         <div className="sidebar-bottom">
//           <div className="online-pulse" /> Exam Management{" "}
//           <small>Version 1.0</small>
//         </div>
//       </aside>
//       <div className="main-area">
//         <header className="topbar no-print">
//           <div className="crumb">
//             RPR DUET ADMISSION CARE <span>/</span> {page?.label}
//           </div>
//           <div className="top-right">
//             <span className={`mode-pill ${DEMO ? "demo" : ""}`}>
//               {DEMO ? "DEMO MODE" : "LIVE API MODE"}
//             </span>
//             <span className="avatar">AD</span>
//           </div>
//         </header>
//         <main className="content">
//           {message && (
//             <div className={`toast ${message.type}`} role="status">
//               <span>{message.type === "error" ? "⚠" : "✓"}</span>
//               {message.text}
//               <button
//                 className="toast-close"
//                 aria-label="Dismiss"
//                 onClick={() => setMessage(null)}
//               >
//                 ×
//               </button>
//             </div>
//           )}
//           {DEMO && tab === "dashboard" && (
//             <div className="demo-alert">
//               <span>ⓘ</span> এটি Demo Preview — শিক্ষার্থীদের তথ্য নমুনা এবং
//               নম্বর শুধু এই ব্রাউজারে সংরক্ষিত হয়। মূল ওয়েবসাইটের ডেটাবেস এখনো
//               যুক্ত নয়।
//             </div>
//           )}
//           {loading ? (
//             <div className="loading-box">Loading exam management system…</div>
//           ) : (
//             <>
//               {tab === "dashboard" && (
//                 <>
//                   <PageHeading
//                     eyebrow="WELCOME BACK"
//                     title="Exam Dashboard"
//                     description="পরীক্ষা, নম্বর এবং রেজাল্টের সারসংক্ষেপ এক জায়গায়।"
//                     right={
//                       <ExcelButton onClick={() => go("exams")}>
//                         + Create New Exam
//                       </ExcelButton>
//                     }
//                   />
//                   <div className="stats-grid">
//                     <StatCard
//                       icon="♧"
//                       label="Total Students"
//                       value={allCount ?? "—"}
//                       note="Existing Student Database"
//                       tone="blue"
//                     />
//                     <StatCard
//                       icon="▤"
//                       label="Total Exams"
//                       value={exams.length}
//                       note="All batches & subjects"
//                       tone="purple"
//                     />
//                     <StatCard
//                       icon="✓"
//                       label="Published Results"
//                       value={
//                         exams.filter((e) => e.status === "published").length
//                       }
//                       note="Visible to students after integration"
//                       tone="green"
//                     />
//                     <StatCard
//                       icon="◷"
//                       label="Draft Exams"
//                       value={exams.filter((e) => e.status === "draft").length}
//                       note="Waiting for publication"
//                       tone="orange"
//                     />
//                   </div>
//                   <div className="dashboard-row">
//                     <section className="panel">
//                       <div className="panel-header">
//                         <div>
//                           <div className="eyebrow">LATEST ACTIVITY</div>
//                           <h2>Recent Exams</h2>
//                         </div>
//                         <button
//                           className="text-button"
//                           onClick={() => go("exams")}
//                         >
//                           View all →
//                         </button>
//                       </div>
//                       <div className="table-wrap">
//                         <table>
//                           <thead>
//                             <tr>
//                               <th>EXAM</th>
//                               <th>BATCH</th>
//                               <th>DATE</th>
//                               <th>STATUS</th>
//                               <th></th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {exams.slice(0, 7).map((e) => (
//                               <tr key={e.id}>
//                                 <td>
//                                   <strong>{e.title}</strong>
//                                   <div className="table-muted">
//                                     {e.subject} • {e.fullMarks} Marks
//                                   </div>
//                                 </td>
//                                 <td>
//                                   {(Array.isArray(e.batchIds) &&
//                                   e.batchIds.length > 0
//                                     ? e.batchIds
//                                     : [e.batchId]
//                                   )
//                                     .map((id) => batchName(batches, id))
//                                     .join(" + ")}
//                                 </td>
//                                 <td>{e.date}</td>
//                                 <td>
//                                   <Badge value={e.status} />
//                                 </td>
//                                 <td>
//                                   <button
//                                     className="mini-link"
//                                     onClick={() => go("marks", e.id)}
//                                   >
//                                     Marks →
//                                   </button>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                       {exams.length === 0 && (
//                         <EmptyState
//                           title="কোনো পরীক্ষা নেই"
//                           description="প্রথম পরীক্ষা তৈরি করুন।"
//                         />
//                       )}
//                     </section>
//                     <section className="panel quick-panel">
//                       <div className="panel-header">
//                         <div>
//                           <div className="eyebrow">GET STARTED</div>
//                           <h2>Quick Actions</h2>
//                         </div>
//                       </div>
//                       <button onClick={() => go("exams")}>
//                         <span className="quick-icon">＋</span>
//                         <span>
//                           <b>Create an Exam</b>
//                           <small>নতুন পরীক্ষার তথ্য যোগ করুন</small>
//                         </span>
//                         <span>→</span>
//                       </button>
//                       <button onClick={() => go("marks")}>
//                         <span className="quick-icon">✎</span>
//                         <span>
//                           <b>Enter Student Marks</b>
//                           <small>ব্যাচভিত্তিক নম্বর এন্ট্রি করুন</small>
//                         </span>
//                         <span>→</span>
//                       </button>
//                       <button onClick={() => go("results")}>
//                         <span className="quick-icon">▥</span>
//                         <span>
//                           <b>View Merit List</b>
//                           <small>মেধাতালিকা ও রেজাল্ট দেখুন</small>
//                         </span>
//                         <span>→</span>
//                       </button>
//                     </section>
//                   </div>
//                 </>
//               )}
//               {tab === "exams" && (
//                 <>
//                   <PageHeading
//                     eyebrow="EXAM SETUP"
//                     title="Exam Management"
//                     description="ব্যাচ, বিষয়, পূর্ণমান নির্ধারণ করে নতুন পরীক্ষা তৈরি করুন।"
//                   />
//                   <div className="exam-layout">
//                     <section className="panel">
//                       <div className="panel-header">
//                         <div>
//                           <div className="eyebrow">NEW EXAM</div>
//                           <h2>{editingExamId ? "Edit Exam" : "Create Exam"}</h2>
//                         </div>
//                       </div>
//                       <form onSubmit={handleCreate} className="form-grid">
//                         <label className="form-full">
//                           Exam Name
//                           <input
//                             required
//                             value={form.title}
//                             onChange={(e) =>
//                               setForm((v) => ({ ...v, title: e.target.value }))
//                             }
//                             placeholder="e.g. Weekly Model Test - 03"
//                           />
//                         </label>
//                         <label>
//                           Subject
//                           <input
//                             required
//                             value={form.subject}
//                             onChange={(e) =>
//                               setForm((v) => ({
//                                 ...v,
//                                 subject: e.target.value,
//                               }))
//                             }
//                             placeholder="e.g. Mathematics"
//                           />
//                         </label>
//                         {/* Multiple Batch Selection */}
//                         <div
//                           className="rpr-batch-picker"
//                           style={{
//                             display: "flex",
//                             flexDirection: "column",
//                             gap: "10px",
//                           }}
//                         >
//                           <strong>Batch — Search & Select</strong>

//                           <input
//                             type="text"
//                             placeholder="🔍 Search Batch..."
//                             value={examBatchSearch}
//                             onChange={(e) => setExamBatchSearch(e.target.value)}
//                             disabled={
//                               examStructureLocked && Boolean(editingExamId)
//                             }
//                           />

//                           <div style={{ display: "flex", gap: "8px" }}>
//                             <button
//                               type="button"
//                               disabled={
//                                 examStructureLocked && Boolean(editingExamId)
//                               }
//                               onClick={() => {
//                                 const ids = batches.map((b) => String(b.id));

//                                 setForm((v) => ({
//                                   ...v,
//                                   batchIds: ids,
//                                   batchId: ids[0] || "",
//                                 }));
//                               }}
//                             >
//                               Select All Batches
//                             </button>

//                             <button
//                               type="button"
//                               disabled={
//                                 examStructureLocked && Boolean(editingExamId)
//                               }
//                               onClick={() =>
//                                 setForm((v) => ({
//                                   ...v,
//                                   batchIds: [],
//                                   batchId: "",
//                                 }))
//                               }
//                             >
//                               Clear Selection
//                             </button>
//                           </div>

//                           <div
//                             style={{
//                               maxHeight: "180px",
//                               overflowY: "auto",
//                               padding: "10px",
//                               border: "1px solid #cbd5e1",
//                               borderRadius: "8px",
//                               background: "#ffffff",
//                             }}
//                           >
//                             {batches
//                               .filter((b) =>
//                                 String(b.name || "")
//                                   .toLowerCase()
//                                   .includes(
//                                     examBatchSearch.trim().toLowerCase(),
//                                   ),
//                               )
//                               .map((b) => {
//                                 const selected = (
//                                   form.batchIds?.length
//                                     ? form.batchIds
//                                     : form.batchId && form.batchId !== "all"
//                                       ? [form.batchId]
//                                       : []
//                                 ).map(String);

//                                 return (
//                                   <label
//                                     key={b.id}
//                                     style={{
//                                       display: "flex",
//                                       alignItems: "center",
//                                       gap: "10px",
//                                       padding: "8px",
//                                       cursor: "pointer",
//                                     }}
//                                   >
//                                     <input
//                                       type="checkbox"
//                                       checked={selected.includes(String(b.id))}
//                                       disabled={
//                                         examStructureLocked &&
//                                         Boolean(editingExamId)
//                                       }
//                                       onChange={(e) => {
//                                         setForm((v) => {
//                                           const previous = (
//                                             v.batchIds?.length
//                                               ? v.batchIds
//                                               : v.batchId && v.batchId !== "all"
//                                                 ? [v.batchId]
//                                                 : []
//                                           ).map(String);

//                                           const next = e.target.checked
//                                             ? [
//                                                 ...new Set([
//                                                   ...previous,
//                                                   String(b.id),
//                                                 ]),
//                                               ]
//                                             : previous.filter(
//                                                 (id) => id !== String(b.id),
//                                               );

//                                           return {
//                                             ...v,
//                                             batchIds: next,
//                                             batchId: next[0] || "",
//                                           };
//                                         });
//                                       }}
//                                     />

//                                     {b.name}
//                                   </label>
//                                 );
//                               })}
//                           </div>

//                           <div
//                             style={{
//                               padding: "10px",
//                               background: "#eff6ff",
//                               borderRadius: "8px",
//                               color: "#1e40af",
//                               fontWeight: "700",
//                             }}
//                           >
//                             Selected Batches:{" "}
//                             {form.batchIds?.length || (form.batchId ? 1 : 0)}
//                             <div
//                               style={{ marginTop: "6px", fontWeight: "400" }}
//                             >
//                               {(form.batchIds?.length
//                                 ? form.batchIds
//                                 : form.batchId && form.batchId !== "all"
//                                   ? [form.batchId]
//                                   : []
//                               )
//                                 .map(
//                                   (id) =>
//                                     batches.find(
//                                       (b) => String(b.id) === String(id),
//                                     )?.name,
//                                 )
//                                 .filter(Boolean)
//                                 .join(", ") || "No batch selected"}
//                             </div>
//                           </div>
//                         </div>
//                         <label>
//                           Exam Date
//                           <input
//                             required
//                             type="date"
//                             value={form.date}
//                             onChange={(e) =>
//                               setForm((v) => ({ ...v, date: e.target.value }))
//                             }
//                           />
//                         </label>
//                         <label>
//                           Full Marks
//                           <input
//                             required
//                             type="number"
//                             min="1"
//                             step="0.01"
//                             disabled={
//                               examStructureLocked && Boolean(editingExamId)
//                             }
//                             value={form.fullMarks}
//                             onChange={(e) =>
//                               setForm((v) => ({
//                                 ...v,
//                                 fullMarks: e.target.value,
//                               }))
//                             }
//                           />
//                         </label>
//                         {/* Exam Type Selection */}
//                         <label>
//                           Exam Type
//                           <select
//                             disabled={
//                               examStructureLocked && Boolean(editingExamId)
//                             }
//                             value={form.examType || "written"}
//                             onChange={(e) =>
//                               setForm((v) => ({
//                                 ...v,
//                                 examType: e.target.value,
//                                 mcqFullMarks: "0",
//                               }))
//                             }
//                           >
//                             <option value="written">Only Written</option>
//                             <option value="mcq">Only MCQ</option>
//                             <option value="combined">MCQ + Written</option>
//                           </select>
//                         </label>

//                         {/* MCQ Full Marks */}
//                         {form.examType === "combined" && (
//                           <label>
//                             MCQ Full Marks
//                             <input
//                               type="number"
//                               min="1"
//                               disabled={
//                                 examStructureLocked && Boolean(editingExamId)
//                               }
//                               value={form.mcqFullMarks}
//                               onChange={(e) =>
//                                 setForm((v) => ({
//                                   ...v,
//                                   mcqFullMarks: e.target.value,
//                                 }))
//                               }
//                               placeholder="Enter MCQ Full Marks"
//                             />
//                           </label>
//                         )}

//                         {/* Automatic Marks Distribution */}
//                         <div
//                           style={{
//                             padding: "14px",
//                             background: "#eff6ff",
//                             border: "1px solid #bfdbfe",
//                             borderRadius: "10px",
//                             color: "#1e40af",
//                             fontWeight: "700",
//                           }}
//                         >
//                           <div>
//                             MCQ Full Marks:{" "}
//                             {form.examType === "mcq"
//                               ? form.fullMarks
//                               : form.examType === "combined"
//                                 ? form.mcqFullMarks
//                                 : 0}
//                           </div>

//                           <div style={{ marginTop: "8px" }}>
//                             Written Full Marks:{" "}
//                             {form.examType === "mcq"
//                               ? 0
//                               : form.examType === "combined"
//                                 ? Number(form.fullMarks || 0) -
//                                   Number(form.mcqFullMarks || 0)
//                                 : form.fullMarks}
//                           </div>
//                         </div>
//                         <div className="form-full">
//                           <button
//                             className="btn btn-primary full-btn"
//                             disabled={saving}
//                             type="submit"
//                           >
//                             {saving
//                               ? "Creating..."
//                               : editingExamId
//                                 ? "✓ Save Changes"
//                                 : "+ Create Exam"}
//                           </button>
//                           {editingExamId && (
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 setEditingExamId(null);
//                                 setExamStructureLocked(false);
//                                 setForm({
//                                   ...emptyForm,
//                                   batchId: form.batchId,
//                                 });
//                               }}
//                               style={{
//                                 width: "100%",
//                                 padding: "13px",
//                                 marginTop: "10px",
//                                 background: "#e2e8f0",
//                                 color: "#334155",
//                                 border: "1px solid #cbd5e1",
//                                 borderRadius: "9px",
//                                 fontWeight: "700",
//                                 cursor: "pointer",
//                               }}
//                             >
//                               ✕ Cancel Edit
//                             </button>
//                           )}
//                         </div>
//                       </form>
//                     </section>
//                     <section className="panel all-exams">
//                       <div className="panel-header">
//                         <div>
//                           <div className="eyebrow">ALL RECORDS</div>
//                           {/* EXAM DATE FILTER */}

//                           <div
//                             style={{
//                               display: "flex",
//                               alignItems: "center",
//                               gap: "12px",
//                               padding: "18px",
//                               background: "#f8fafc",
//                               borderBottom: "1px solid #e2e8f0",
//                               flexWrap: "wrap",
//                             }}
//                           >
//                             <label
//                               htmlFor="exam-date-filter"
//                               style={{ fontWeight: "700", color: "#102a4c" }}
//                             >
//                               📅 Select Date
//                             </label>

//                             <input
//                               id="exam-date-filter"
//                               type="date"
//                               value={examDateFilter}
//                               onChange={(e) =>
//                                 setExamDateFilter(e.target.value)
//                               }
//                               style={{
//                                 padding: "10px",
//                                 border: "1px solid #cbd5e1",
//                                 borderRadius: "8px",
//                               }}
//                             />

//                             <button
//                               type="button"
//                               onClick={() => setExamDateFilter("")}
//                               style={{
//                                 padding: "10px 18px",
//                                 background: "#2563eb",
//                                 color: "#ffffff",
//                                 border: "none",
//                                 borderRadius: "8px",
//                                 cursor: "pointer",
//                               }}
//                             >
//                               All Dates
//                             </button>
//                           </div>
//                           <h2>
//                             Exam List{" "}
//                             <span className="count-tag">{exams.length}</span>
//                           </h2>
//                         </div>
//                       </div>
//                       <div className="table-wrap">
//                         <table>
//                           <thead>
//                             <tr>
//                               <th>EXAM DETAILS</th>
//                               <th>BATCH</th>
//                               <th>STATUS</th>
//                               <th>ACTION</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {exams
//                               .filter(
//                                 (e) =>
//                                   !examDateFilter ||
//                                   String(e.date ?? "").slice(0, 10) ===
//                                     examDateFilter,
//                               )
//                               .map((e) => (
//                                 <tr key={e.id}>
//                                   <td>
//                                     <strong>{e.title}</strong>
//                                     <div className="table-muted">
//                                       {e.subject} · {e.date} · {e.fullMarks}{" "}
//                                       marks
//                                     </div>
//                                   </td>
//                                   <td>{batchName(batches, e.batchId)}</td>
//                                   <td>
//                                     <Badge value={e.status} />
//                                   </td>
//                                   <td>
//                                     <div className="table-actions">
//                                       <button
//                                         className="mini-link"
//                                         onClick={() => go("marks", e.id)}
//                                       >
//                                         Marks
//                                       </button>
//                                       <button
//                                         className="mini-link"
//                                         onClick={() => go("results", e.id)}
//                                       >
//                                         Result
//                                       </button>
//                                       <button
//                                         disabled={saving}
//                                         className={
//                                           e.status === "published"
//                                             ? "mini-danger"
//                                             : "mini-success"
//                                         }
//                                         onClick={() => handleStatus(e)}
//                                       >
//                                         {e.status === "published"
//                                           ? "Unpublish"
//                                           : "Publish"}
//                                       </button>
//                                       <button
//                                         type="button"
//                                         className="mini-link"
//                                         onClick={() => handleEditExam(e)}
//                                         disabled={
//                                           saving || e.status === "published"
//                                         }
//                                         style={{
//                                           background: "#eff6ff",
//                                           color: "#2563eb",
//                                           border: "1px solid #bfdbfe",
//                                           borderRadius: "7px",
//                                           padding: "9px 14px",
//                                           fontWeight: "700",
//                                           cursor: "pointer",
//                                           marginLeft: "8px",
//                                         }}
//                                       >
//                                         ✏️ Edit
//                                       </button>
//                                       <button
//                                         type="button"
//                                         className="mini-danger"
//                                         disabled={saving}
//                                         onClick={() => handleDeleteExam(e)}
//                                         style={{ marginLeft: "8px" }}
//                                       >
//                                         🗑 Delete
//                                       </button>
//                                     </div>
//                                   </td>
//                                 </tr>
//                               ))}
//                           </tbody>
//                         </table>
//                       </div>
//                       {!exams.length && (
//                         <EmptyState
//                           title="পরীক্ষা নেই"
//                           description="বাঁ পাশের ফর্ম থেকে একটি পরীক্ষা তৈরি করুন।"
//                         />
//                       )}
//                     </section>
//                   </div>
//                 </>
//               )}
//               {tab === "marks" && (
//                 <AdminBatchResult
//                   initialScreen="entry"
//                   embedded={true}
//                   onBack={() => setTab("dashboard")}
//                 />
//               )}
//               {tab === "marks-backup" && (
//                 <>
//                   <PageHeading
//                     eyebrow="EXAM OPERATION"
//                     title="Student Marks Entry"
//                     description="আগে থেকে থাকা শিক্ষার্থী তালিকা থেকেই পরীক্ষার নম্বর এন্ট্রি করুন।"
//                   />
//                   <section className="panel selection-panel">
//                     <div className="field-wrap">
//                       <label>SELECT EXAM</label>
//                       <select
//                         value={selectedExamId}
//                         onChange={(e) => setSelectedExamId(e.target.value)}
//                       >
//                         <option value="">Select exam</option>
//                         {exams.map((e) => (
//                           <option value={e.id} key={e.id}>
//                             {e.title} — {batchName(batches, e.batchId)}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     {selectedExam && (
//                       <>
//                         <div className="selection-summary">
//                           <strong>{selectedExam.subject}</strong>
//                           <span>
//                             {batchName(batches, selectedExam.batchId)} · Full
//                             Marks: {selectedExam.fullMarks}
//                           </span>
//                         </div>
//                         <Badge value={selectedExam.status} />
//                       </>
//                     )}
//                   </section>
//                   {selectedExam ? (
//                     <section className="panel">
//                       <div className="panel-header align-wrap">
//                         <div>
//                           <div className="eyebrow">
//                             EXAM: {selectedExam.date}
//                           </div>
//                           <h2>
//                             Marks Entry Sheet{" "}
//                             <span className="count-tag">
//                               {students.length} Students
//                             </span>
//                           </h2>
//                         </div>
//                         <div className="btn-group no-print">
//                           <button
//                             className="btn btn-outline"
//                             onClick={downloadTemplate}
//                             disabled={fetching}
//                           >
//                             ↓ Excel Template
//                           </button>
//                           <button
//                             className="btn btn-outline"
//                             onClick={() => fileRef.current?.click()}
//                             disabled={
//                               selectedExam.status === "published" || fetching
//                             }
//                           >
//                             ↑ Import Excel
//                           </button>
//                           <input
//                             type="file"
//                             hidden
//                             ref={fileRef}
//                             accept=".xlsx"
//                             onChange={importExcel}
//                           />
//                           <ExcelButton
//                             disabled={
//                               saving ||
//                               fetching ||
//                               selectedExam.status === "published"
//                             }
//                             onClick={handleSave}
//                           >
//                             {saving ? "Saving…" : "✓ Save Marks"}
//                           </ExcelButton>
//                         </div>
//                       </div>
//                       {selectedExam.status === "published" && (
//                         <div className="info-banner">
//                           এই পরীক্ষার রেজাল্ট Published। নম্বর পরিবর্তন করতে
//                           Exam Management থেকে আগে <b>Unpublish</b> করুন।
//                         </div>
//                       )}
//                       <div className="table-tools no-print">
//                         <div className="search-box">
//                           ⌕{" "}
//                           <input
//                             value={filter}
//                             onChange={(e) => setFilter(e.target.value)}
//                             placeholder="Search by Student ID / Name / Department"
//                           />
//                         </div>
//                         <div className="meta-count">
//                           {marks.length} saved / {students.length} students
//                         </div>
//                       </div>
//                       {fetching ? (
//                         <div className="loading-box">
//                           Loading students & marks…
//                         </div>
//                       ) : (
//                         <div className="table-wrap">
//                           <table className="marks-table">
//                             <thead>
//                               <tr>
//                                 <th>#</th>
//                                 <th>STUDENT ID</th>
//                                 <th>STUDENT NAME</th>
//                                 <th>DEPARTMENT</th>
//                                 <th>MARKS / {selectedExam.fullMarks}</th>
//                                 <th>ABSENT</th>
//                                 <th>SAVED STATUS</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {filteredStudents.map((s, i) => (
//                                 <tr key={s.id}>
//                                   <td className="table-muted">{i + 1}</td>
//                                   <td>
//                                     <span className="id-pill">{s.id}</span>
//                                   </td>
//                                   <td>
//                                     <strong>{s.name}</strong>
//                                   </td>
//                                   <td>{s.department || "—"}</td>
//                                   <td>
//                                     <input
//                                       className="marks-input"
//                                       type="number"
//                                       min="0"
//                                       max={selectedExam.fullMarks}
//                                       step="0.01"
//                                       placeholder="Enter marks"
//                                       disabled={
//                                         selectedExam.status === "published" ||
//                                         Boolean(draft[String(s.id)]?.absent)
//                                       }
//                                       value={draft[String(s.id)]?.value ?? ""}
//                                       onChange={(e) =>
//                                         updateDraft(s.id, {
//                                           value: e.target.value,
//                                         })
//                                       }
//                                       aria-label={`Marks for ${s.name}`}
//                                     />
//                                   </td>
//                                   <td>
//                                     <label className="check-label">
//                                       <input
//                                         type="checkbox"
//                                         disabled={
//                                           selectedExam.status === "published"
//                                         }
//                                         checked={Boolean(
//                                           draft[String(s.id)]?.absent,
//                                         )}
//                                         onChange={(e) =>
//                                           updateDraft(s.id, {
//                                             absent: e.target.checked,
//                                             value: e.target.checked
//                                               ? ""
//                                               : draft[String(s.id)]?.value ||
//                                                 "",
//                                           })
//                                         }
//                                       />
//                                       Absent
//                                     </label>
//                                   </td>
//                                   <td>
//                                     {marks.some(
//                                       (m) =>
//                                         String(m.studentId) === String(s.id),
//                                     ) ? (
//                                       <span className="saved-dot">● Saved</span>
//                                     ) : (
//                                       <span className="unsaved-dot">
//                                         ○ Pending
//                                       </span>
//                                     )}
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                           {filteredStudents.length === 0 && (
//                             <EmptyState
//                               title="শিক্ষার্থী পাওয়া যায়নি"
//                               description="সার্চ পরিবর্তন করে দেখুন।"
//                             />
//                           )}
//                         </div>
//                       )}
//                       <div className="panel-footer no-print">
//                         <span>
//                           Excel Import করলে নম্বর আগে ফর্মে আসবে—Save Marks
//                           চাপলেই সংরক্ষিত হবে।
//                         </span>
//                         <ExcelButton
//                           disabled={
//                             saving ||
//                             fetching ||
//                             selectedExam.status === "published"
//                           }
//                           onClick={handleSave}
//                         >
//                           ✓ Save Marks
//                         </ExcelButton>
//                       </div>
//                     </section>
//                   ) : (
//                     <EmptyState
//                       title="একটি পরীক্ষা নির্বাচন করুন"
//                       description="প্রথমে Exam Management থেকে পরীক্ষা তৈরি করুন।"
//                     />
//                   )}
//                 </>
//               )}
//               {tab === "results" && (
//                 <>
//                   <PageHeading
//                     eyebrow="RESULT CENTER"
//                     title="Result & Merit List"
//                     description="স্বয়ংক্রিয়ভাবে র‍্যাংকিং, সর্বোচ্চ নম্বর ও সম্পূর্ণ রেজাল্ট শিট।"
//                   />
//                   <div className="selection-panel panel no-print">
//                     <div className="field-wrap">
//                       <label>SELECT EXAM</label>
//                       <select
//                         value={selectedExamId}
//                         onChange={(e) => setSelectedExamId(e.target.value)}
//                       >
//                         {exams.map((e) => (
//                           <option value={e.id} key={e.id}>
//                             {e.title} — {batchName(batches, e.batchId)}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     {selectedExam && <Badge value={selectedExam.status} />}
//                   </div>
//                   {selectedExam && (
//                     <div className="printable">
//                       <div className="print-header">
//                         <div className="eyebrow">RPR DUET ADMISSION CARE</div>
//                         <h2>{selectedExam.title}</h2>
//                         <p>
//                           {selectedExam.subject} ·{" "}
//                           {batchName(batches, selectedExam.batchId)} ·{" "}
//                           {selectedExam.date} · Full Marks:{" "}
//                           {selectedExam.fullMarks}
//                         </p>
//                       </div>
//                       {selectedExam.status !== "published" && (
//                         <div className="info-banner">
//                           এটি <b>Draft</b> ফলাফল। শুধুমাত্র অ্যাডমিন প্রিভিউ
//                           দেখতে পারবেন। Published না হওয়া পর্যন্ত শিক্ষার্থীদের
//                           দেখানো উচিত নয়।
//                         </div>
//                       )}
//                       <div className="results-stats">
//                         <StatCard
//                           icon="◉"
//                           label="Total Students"
//                           value={stats.total}
//                           note="Registered in batch"
//                         />
//                         <StatCard
//                           icon="✓"
//                           label="Marks Entered"
//                           value={stats.entered}
//                           note={`${stats.absent} student(s) absent`}
//                           tone="green"
//                         />
//                         <StatCard
//                           icon="↑"
//                           label="Highest Marks"
//                           value={pretty(stats.highest)}
//                           note={`Out of ${selectedExam.fullMarks}`}
//                           tone="purple"
//                         />
//                         <StatCard
//                           icon="≈"
//                           label="Average Marks"
//                           value={pretty(stats.average)}
//                           note={`${stats.present} present students`}
//                           tone="orange"
//                         />
//                       </div>
//                       <section className="panel">
//                         <div className="panel-header align-wrap">
//                           <div>
//                             <div className="eyebrow">AUTOMATED RANKING</div>
//                             <h2>Full Merit List</h2>
//                           </div>
//                           <div className="btn-group no-print">
//                             <select
//                               value={resultSort}
//                               onChange={(e) => setResultSort(e.target.value)}
//                               style={{
//                                 padding: "10px 14px",
//                                 borderRadius: "8px",
//                                 border: "1px solid #cbd5e1",
//                                 fontWeight: "600",
//                                 background: "#ffffff",
//                                 color: "#1e293b",
//                               }}
//                             >
//                               <option value="highest">Highest to Lowest</option>
//                               <option value="lowest">Lowest to Highest</option>
//                             </select>
//                             <button
//                               className="btn btn-outline"
//                               onClick={() => window.print()}
//                             >
//                               ⎙ Print / Save PDF
//                             </button>
//                             <ExcelButton onClick={downloadResults}>
//                               ↓ Download Excel
//                             </ExcelButton>
//                           </div>
//                         </div>
//                         {fetching ? (
//                           <div className="loading-box">Loading results…</div>
//                         ) : (
//                           <div className="table-wrap">
//                             <table>
//                               <thead>
//                                 <tr>
//                                   <th>MERIT</th>
//                                   <th>STUDENT ID</th>
//                                   <th>STUDENT NAME</th>
//                                   <th>DEPARTMENT</th>
//                                   <th>MARKS</th>
//                                   <th>PERCENTAGE</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {sortedResults.map((r) => (
//                                   <tr key={r.id}>
//                                     <td>
//                                       {r.position ? (
//                                         <span
//                                           className={`rank ${r.position <= 3 ? "top" : ""}`}
//                                         >
//                                           #{r.position}
//                                         </span>
//                                       ) : (
//                                         "—"
//                                       )}
//                                     </td>
//                                     <td>
//                                       <span className="id-pill">{r.id}</span>
//                                     </td>
//                                     <td>
//                                       <strong>{r.name}</strong>
//                                     </td>
//                                     <td>{r.department || "—"}</td>
//                                     <td>
//                                       {r.absent ? (
//                                         <span className="absent-tag">
//                                           Absent
//                                         </span>
//                                       ) : r.entered ? (
//                                         <b>{r.marks}</b>
//                                       ) : (
//                                         <span className="table-muted">
//                                           Not entered
//                                         </span>
//                                       )}
//                                     </td>
//                                     <td>
//                                       {r.percentage !== null
//                                         ? `${pretty(r.percentage)}%`
//                                         : "—"}
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         )}
//                       </section>
//                     </div>
//                   )}
//                 </>
//               )}
//               {tab === "batch-results" && (
//                 <AdminBatchResult
//                   initialScreen="batch"
//                   embedded={true}
//                   onBack={() => setTab("dashboard")}
//                 />
//               )}
//               {tab === "mcq-upload" && (
//                 <MCQUpload batches={batches} exams={exams} />
//               )}
//               {tab === "lookup" && (
//                 <>
//                   <PageHeading
//                     eyebrow="STUDENT REPORT"
//                     title="Individual Student Result"
//                     description="Student ID দিয়ে নির্বাচিত পরীক্ষার ব্যক্তিগত ফলাফল দেখুন।"
//                   />
//                   <section className="panel lookup-panel">
//                     <div className="panel-header">
//                       <div>
//                         <div className="eyebrow">FIND STUDENT</div>
//                         <h2>Search Result</h2>
//                       </div>
//                     </div>
//                     <form
//                       className="lookup-form"
//                       onSubmit={(e) => {
//                         e.preventDefault();
//                         setLookupSubmitted(lookupId.trim());
//                       }}
//                     >
//                       <label>
//                         Exam
//                         <select
//                           value={selectedExamId}
//                           onChange={(e) => {
//                             setSelectedExamId(e.target.value);
//                             setLookupSubmitted("");
//                           }}
//                         >
//                           {exams.map((e) => (
//                             <option value={e.id} key={e.id}>
//                               {e.title} — {batchName(batches, e.batchId)}
//                             </option>
//                           ))}
//                         </select>
//                       </label>
//                       <label>
//                         Student ID
//                         <input
//                           placeholder="e.g. RPR-2026001"
//                           value={lookupId}
//                           onChange={(e) => setLookupId(e.target.value)}
//                         />
//                       </label>
//                       <button
//                         className="btn btn-primary"
//                         type="submit"
//                         disabled={!lookupId.trim() || fetching}
//                       >
//                         ⌕ Search Result
//                       </button>
//                     </form>
//                     <div className="info-banner">
//                       এটি অ্যাডমিন প্রিভিউ। মূল ওয়েবসাইটে শিক্ষার্থীকে ব্যক্তিগত
//                       রেজাল্ট দেখানোর আগে <b>Student Login বা OTP</b> যাচাই
//                       প্রয়োজন। শুধু ID দিয়ে অন্যের ফলাফল দেখা নিরাপদ নয়।
//                     </div>
//                     {/* All Exam Results */}
//                     {lookupSubmitted && studentFound && (
//                       <StudentAllResults
//                         studentId={lookupSubmitted}
//                         exams={exams}
//                         selectedExamId={selectedExamId}
//                       />
//                     )}
//                     {lookupSubmitted &&
//                       (studentFound ? (
//                         <div className="student-report">
//                           <div className="student-report-head">
//                             <div className="report-initial">
//                               {studentFound.name[0]}
//                             </div>
//                             <div>
//                               <h3>{studentFound.name}</h3>
//                               <p>
//                                 {studentFound.id} ·{" "}
//                                 {studentFound.department || "—"} ·{" "}
//                                 {batchName(batches, studentFound.batchId)}
//                               </p>
//                             </div>
//                             <Badge value={selectedExam?.status} />
//                           </div>
//                           <div className="report-grid">
//                             <div>
//                               <small>Exam</small>
//                               <b>{selectedExam?.title}</b>
//                             </div>
//                             <div>
//                               <small>Marks</small>
//                               <b>
//                                 {studentResult ? marksText(studentResult) : "—"}{" "}
//                                 / {selectedExam?.fullMarks}
//                               </b>
//                             </div>
//                             <div>
//                               <small>Merit Position</small>
//                               <b>
//                                 {studentResult?.position
//                                   ? `#${studentResult.position}`
//                                   : "—"}
//                               </b>
//                             </div>
//                             <div>
//                               <small>Result Status</small>
//                               <b>
//                                 {selectedExam?.status === "published"
//                                   ? "Published"
//                                   : "Draft (Admin Preview)"}
//                               </b>
//                             </div>
//                           </div>
//                         </div>
//                       ) : (
//                         <EmptyState
//                           title="Student ID পাওয়া যায়নি"
//                           description="এই পরীক্ষার ব্যাচে Student ID টি আছে কিনা দেখুন।"
//                         />
//                       ))}
//                   </section>
//                 </>
//               )}
//               {tab === "students" && <StudentManagement />}
//             </>
//           )}
//           {tab === "data-management" && <DataManagement />}
//           {tab === "batches" && <BatchManagement />}
//         </main>
//         <footer className="footer no-print">
//           © RPR DUET Admission Care · Exam Result Management ·{" "}
//           {DEMO
//             ? "Demo data — not connected to live website"
//             : "Integrated with existing student database"}
//         </footer>
//       </div>
//     </div>
//   );
// }

import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/appRoutes";

export function App() {
  return <RouterProvider router={router} />;
}

export default App;

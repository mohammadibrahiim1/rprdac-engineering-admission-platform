import React from "react";
import { DEMO } from "./api.js";

const EXAM_KEY = "rpr-exam-management-demo-v1";
const EXCEL_KEY = "rpr-external-students-demo-v1";
const BATCH_KEY = "rpr-demo-batches-cleared";

export default function DataManagement() {

  function confirmDelete(message) {
    return window.confirm(
      message + "\n\nThis action cannot be undone!"
    );
  }

  function deleteExams() {

    if (!confirmDelete(
      "Delete all Demo Exams and Marks?"
    )) return;

    localStorage.setItem(
      EXAM_KEY,
      JSON.stringify({
        exams: [],
        marks: {}
      })
    );

    alert("All Demo Exams and Marks deleted!");

    window.location.reload();
  }

  function deleteExcel() {

    if (!confirmDelete(
      "Delete all imported Excel Student Data?"
    )) return;

    localStorage.removeItem(EXCEL_KEY);

    alert("All imported Excel Data deleted!");

    window.location.reload();
  }

  function deleteBatches() {

    if (!confirmDelete(
      "Delete all Demo Batches?"
    )) return;

    localStorage.setItem(BATCH_KEY, "1");

    alert("All Demo Batches cleared!");

    window.location.reload();
  }

  function resetAll() {

    if (!confirmDelete(
      "WARNING! Delete ALL Demo Exams, Marks, Batches and Excel Student Data?"
    )) return;

    localStorage.setItem(
      EXAM_KEY,
      JSON.stringify({
        exams: [],
        marks: {}
      })
    );

    localStorage.removeItem(EXCEL_KEY);

    localStorage.setItem(BATCH_KEY, "1");

    alert("All Demo Data cleared successfully!");

    window.location.reload();
  }

  const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",

  padding: "13px 26px",
  minHeight: "46px",

  background: "linear-gradient(135deg, #102A43, #164E78)",
  color: "#FFFFFF",

  border: "1px solid #1E5278",
  borderRadius: "12px",

  fontFamily: "'Segoe UI', Arial, sans-serif",
  fontSize: "14px",
  fontWeight: "600",
  letterSpacing: "0.3px",

  cursor: "pointer",

  boxShadow: "0 5px 14px rgba(16, 42, 67, 0.18)",

  transition: "all 0.25s ease"
};

  const cardStyle = {
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    marginBottom: "18px",
    border: "1px solid #e5e7eb"
  };

  if (!DEMO) {
    return (
      <div style={cardStyle}>
        <h2>Data Management</h2>
        <p>
          Demo reset tools are disabled in production mode.
        </p>
      </div>
    );
  }

  return (
    <div>

      <h1>Admin Data Management</h1>

      <p style={{marginBottom:"25px"}}>
        Manage and delete Demo System Data
      </p>

      <div style={cardStyle}>
        <h3>🗑️ Delete All Exams</h3>

        <p>
          Delete all Demo Exams and their Marks.
        </p>

        <button
          style={buttonStyle}
          onClick={deleteExams}
        >
          Delete All Exams
        </button>
      </div>

      <div style={cardStyle}>
        <h3>🗑️ Delete Excel Data</h3>

        <p>
          Delete imported Excel Student Records.
        </p>

        <button
          style={buttonStyle}
          onClick={deleteExcel}
        >
          Delete Excel Data
        </button>
      </div>

      <div style={cardStyle}>
        <h3>🗑️ Delete All Batches</h3>

        <p>
          Clear all Demo Batch Records.
        </p>

        <button
          style={buttonStyle}
          onClick={deleteBatches}
        >
          Delete All Batches
        </button>
      </div>

      <div style={{
        ...cardStyle,
        background: "#fff1f2",
        border: "1px solid #fecaca"
      }}>

        <h3 style={{color:"#b91c1c"}}>
          ⚠️ Reset All Demo Data
        </h3>

        <p>
          Delete all Demo Exams, Marks,
          Batches and Imported Excel Student Data.
        </p>

        <button
          style={{
  ...buttonStyle,
  background: "linear-gradient(135deg, #DC2626, #991B1B)",
  color: "#FFFFFF",
  border: "1px solid #991B1B",
  borderRadius: "12px",
  boxShadow: "0 5px 15px rgba(220, 38, 38, 0.20)"
}}
          onClick={resetAll}
        >
          Reset All Demo Data
        </button>

      </div>

    </div>
  );
}
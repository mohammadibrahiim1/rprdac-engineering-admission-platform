import React, { useEffect, useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { api, DEMO } from "./api.js";
import "./StudentManagement.css";

const STORAGE_KEY = "rpr-external-students-demo-v1";

const normalizeId = value =>
  String(value ?? "").trim().toUpperCase();

const normalizeHeader = value =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_.()/-]+/g, "");

const headerNames = {
  id: ["studentid", "id", "systemid", "studentcode"],
  name: ["studentname", "name", "fullname"],
  phone: ["phone", "phonenumber", "mobile", "mobilenumber"],
  batch: ["batch", "batchname"],
  department: ["department", "dept", "technology"],
};

function cellText(cell) {
  const value = cell?.value;

  if (value && typeof value === "object") {
    if ("text" in value) {
      return String(value.text).trim();
    }

    if ("result" in value) {
      return String(value.result ?? "").trim();
    }
  }

  return String(cell?.text ?? "").trim();
}

// Read uploaded files from browser storage
function loadUploadedFiles() {
  if (!DEMO) return [];

  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "null"
    );

    if (!saved) return [];

    // Support previously imported student data
    if (Array.isArray(saved)) {
      if (saved.length === 0) return [];

      return [{
        id: "legacy-import",
        name: "Previous Imported Students",
        uploadedAt: "",
        students: saved
      }];
    }

    if (Array.isArray(saved.files)) {
      return saved.files;
    }

    return [];

  } catch (error) {
    console.error("Excel data read error:", error);
    return [];
  }
}

export default function StudentManagement() {

  const [website, setWebsite] = useState([]);
  const [batches, setBatches] = useState([]);

  const [uploadedFiles, setUploadedFiles] = useState(
    loadUploadedFiles
  );

  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");

  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  // Load Website Students
  useEffect(() => {
    let active = true;

    async function loadStudents() {
      try {
        const list = await api.getBatches();

        const groups = await Promise.all(
          list.map(batch => api.getStudents(batch.id))
        );

        if (!active) return;

        setBatches(list);
        setWebsite(groups.flat());

      } catch (error) {
        if (active) {
          setNotice("Student load failed: " + error.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStudents();

    return () => {
      active = false;
    };
  }, []);

  // Website Student Map
  const websiteMap = useMemo(() => {
    return new Map(
      website.map(student => [
        normalizeId(student.id),
        student
      ])
    );
  }, [website]);

  // Combine students from all uploaded Excel files
  const excelMap = useMemo(() => {
    const map = new Map();

    uploadedFiles.forEach(file => {
      file.students.forEach(student => {
        const id = normalizeId(student.id);

        if (id) {
          map.set(id, student);
        }
      });
    });

    return map;
  }, [uploadedFiles]);

  // Total Unique Students
  const allIds = new Set([
    ...websiteMap.keys(),
    ...excelMap.keys()
  ]);

  const externalCount = [...excelMap.keys()]
    .filter(id => !websiteMap.has(id)).length;

  const duplicateCount = [...excelMap.keys()]
    .filter(id => websiteMap.has(id)).length;

  // Search Student
  const foundWebsite = websiteMap.get(
    normalizeId(searched)
  );

  const foundExcel = excelMap.get(
    normalizeId(searched)
  );

  const found = foundWebsite || foundExcel;

  const source = foundWebsite
    ? "Website Student"
    : foundExcel
      ? "External Student"
      : "Not Found";

  const batchLabel =
    found?.batch ||
    batches.find(
      batch => String(batch.id) === String(found?.batchId)
    )?.name ||
    "—";

  // Save uploaded file records
  function saveUploadedFiles(files) {
    if (!DEMO) return false;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ files })
      );

      setUploadedFiles(files);
      return true;

    } catch (error) {
      setNotice(
        "Unable to save Excel data. Browser storage may be full."
      );

      console.error(error);
      return false;
    }
  }

  // Excel Import
  async function importStudents(event) {

    const file = event.target.files?.[0];

    if (!file) return;

    setBusy(true);

    try {
      const workbook = new ExcelJS.Workbook();

      await workbook.xlsx.load(
        await file.arrayBuffer()
      );

      const sheet = workbook.worksheets[0];

      if (!sheet) {
        throw new Error("Worksheet not found");
      }

      let headerRow = 0;
      let cols = {};

      for (
        let i = 1;
        i <= Math.min(10, sheet.rowCount);
        i++
      ) {
        const row = sheet.getRow(i);
        const current = {};

        row.eachCell((cell, index) => {

          const header = normalizeHeader(
            cellText(cell)
          );

          Object.entries(headerNames).forEach(
            ([field, names]) => {
              if (names.includes(header)) {
                current[field] = index;
              }
            }
          );

        });

        if (current.id && current.name) {
          headerRow = i;
          cols = current;
          break;
        }
      }

      if (!headerRow) {
        throw new Error(
          "Student ID and Student Name columns required"
        );
      }

      const studentsMap = new Map();

      for (
        let i = headerRow + 1;
        i <= sheet.rowCount;
        i++
      ) {

        const row = sheet.getRow(i);

        const get = field =>
          cols[field]
            ? cellText(row.getCell(cols[field]))
            : "";

        const id = normalizeId(get("id"));
        const name = get("name");

        if (!id || !name) continue;

        studentsMap.set(id, {
          id,
          name,
          phone: get("phone"),
          batch: get("batch"),
          department: get("department")
        });
      }

      if (studentsMap.size === 0) {
        throw new Error(
          "No valid students found in Excel"
        );
      }

      // Store each Excel file separately
      const newFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        name: file.name,
        uploadedAt: new Date().toISOString(),
        students: [...studentsMap.values()]
      };

      const updatedFiles = [
        ...uploadedFiles,
        newFile
      ];

      const saved = saveUploadedFiles(updatedFiles);

      if (saved) {
        setNotice(
          `${file.name} uploaded successfully! ` +
          `${studentsMap.size} students found.`
        );
      }

    } catch (error) {

      setNotice(
        "Excel Import Failed: " + error.message
      );

    } finally {

      setBusy(false);
      event.target.value = "";
    }
  }

  // Delete individual uploaded Excel file
  function deleteUploadedFile(fileId) {

    const selectedFile = uploadedFiles.find(
      file => file.id === fileId
    );

    if (!selectedFile) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedFile.name}"?\n\n` +
      "Students imported only from this file will be removed."
    );

    if (!confirmed) return;

    const updatedFiles = uploadedFiles.filter(
      file => file.id !== fileId
    );

    const saved = saveUploadedFiles(updatedFiles);

    if (saved) {
      setNotice(
        `${selectedFile.name} deleted successfully!`
      );
    }
  }

  // Delete All Imported Excel Files
  function deleteAllFiles() {

    if (uploadedFiles.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete ALL uploaded Excel files?"
    );

    if (!confirmed) return;

    const saved = saveUploadedFiles([]);

    if (saved) {
      setNotice(
        "All uploaded Excel files deleted successfully!"
      );
    }
  }

  const cardStyle = {
    padding: "20px",
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "20px"
  };

  return (
  <div className="rpr-students">

      <div className="page-heading">
        <div>
          <div className="eyebrow">
            STUDENT DIRECTORY
          </div>

          <h1>Student Management</h1>

          <p>
            Student ID Search | Website Priority |
            Excel Fallback
          </p>
        </div>
      </div>

      {DEMO && (
        <div className="info-banner">
          Demo Mode: Website Student Database
          is not connected yet.
        </div>
      )}

      {/* Statistics */}

      <div className="results-stats">

        {[
          ["Website Students", websiteMap.size],
          ["External Students", externalCount],
          ["Matched in Both", duplicateCount],
          ["Unique Students", allIds.size]
        ].map(([label, value]) => (

          <div className="stat-card" key={label}>
            <div className="stat-label">
              {label}
            </div>

            <div className="stat-value">
              {value}
            </div>
          </div>

        ))}

      </div>

      {/* Student Search */}

      <section style={cardStyle}>

        <h2>Search Student by ID</h2>

        <form
          onSubmit={event => {
            event.preventDefault();
            setSearched(query.trim());
          }}
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "15px"
          }}
        >

          <input
            style={{
              flex: 1,
              padding: "12px",
              minWidth: 0
            }}
            value={query}
            onChange={event =>
              setQuery(event.target.value)
            }
            placeholder="Enter Student ID"
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            Search Student
          </button>

        </form>

        {searched && !loading && (

          found ? (

            <div style={{ marginTop: "20px" }}>

              <div className="info-banner">
                <strong>{source}</strong>

                {foundWebsite && foundExcel &&
                  " — Also found in Excel. Counted once."}
              </div>

              <div className="table-wrap">

                <table>
                  <tbody>

                    <tr>
                      <th>Student ID</th>
                      <td>{found.id}</td>
                    </tr>

                    <tr>
                      <th>Name</th>
                      <td>{found.name}</td>
                    </tr>

                    <tr>
                      <th>Phone</th>
                      <td>{found.phone || "—"}</td>
                    </tr>

                    <tr>
                      <th>Batch</th>
                      <td>{batchLabel}</td>
                    </tr>

                    <tr>
                      <th>Department</th>
                      <td>{found.department || "—"}</td>
                    </tr>

                    <tr>
                      <th>Source</th>
                      <td>{source}</td>
                    </tr>

                  </tbody>
                </table>

              </div>

            </div>

          ) : (

            <div
              className="info-banner"
              style={{ marginTop: "15px" }}
            >
              Student ID not found.
            </div>

          )

        )}

      </section>

      {/* Excel Upload */}

      <section style={cardStyle}>

        <h2>Upload Student Excel</h2>

        <p style={{ margin: "12px 0" }}>
          Required: Student ID, Student Name
          <br />
          Optional: Phone, Batch, Department
        </p>

        <input
          type="file"
          accept=".xlsx"
          onChange={importStudents}
          disabled={busy || loading || !DEMO}
        />

        {busy && <p>Importing Excel...</p>}

        {notice && (
          <div
            className="info-banner"
            style={{ marginTop: "15px" }}
          >
            {notice}
          </div>
        )}

      </section>

      {/* Uploaded Files List */}

      <section style={cardStyle}>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >

          <h2>
            Uploaded Excel Files ({uploadedFiles.length})
          </h2>

          {uploadedFiles.length > 0 && DEMO && (

            <button
              type="button"
              onClick={deleteAllFiles}
              disabled={busy}
              style={{
                padding: "10px 15px",
                borderRadius: "8px",
                border: "1px solid #fecaca",
                background: "#fee2e2",
                color: "#b91c1c",
                cursor: "pointer"
              }}
            >
              Delete All Files
            </button>

          )}

        </div>

        {uploadedFiles.length === 0 ? (

          <p style={{ marginTop: "20px" }}>
            No Excel files uploaded yet.
          </p>

        ) : (

          <div
            className="table-wrap"
            style={{ marginTop: "20px" }}
          >

            <table>

              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Students</th>
                  <th>Upload Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {uploadedFiles.map(file => (

                  <tr key={file.id}>

                    <td>
                      <strong>{file.name}</strong>
                    </td>

                    <td>
                      {file.students.length}
                    </td>

                    <td>
                      {file.uploadedAt
                        ? new Date(
                            file.uploadedAt
                          ).toLocaleString("en-GB")
                        : "Previous Import"}
                    </td>

                    <td>

                      <button
                        type="button"
                        disabled={busy || !DEMO}
                        onClick={() =>
                          deleteUploadedFile(file.id)
                        }
                        style={{
                          background: "#fee2e2",
                          color: "#b91c1c",
                          padding: "8px 12px",
                          border: "1px solid #fecaca",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        🗑 Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}
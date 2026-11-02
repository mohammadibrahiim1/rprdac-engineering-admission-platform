import React, { useEffect, useState } from "react";
import { api } from "./api.js";

export default function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadBatches() {
    try {
      const data = await api.getBatches();
      setBatches(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadBatches();
  }, []);

  async function createBatch(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter batch name");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.createBatch({
        name: name.trim()
      });

      setName("");
      await loadBatches();

      setMessage("Batch created successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
async function deleteBatch(batch) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${batch.name}"?`
  );

  if (!confirmed) return;

  setLoading(true);
  setError("");
  setMessage("");

  try {
    await api.deleteBatch(batch.id);

    await loadBatches();

    setMessage("Batch deleted successfully!");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(search.toLowerCase())
  );

  const card = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 5px 20px rgba(15,23,42,0.04)"
  };

  const input = {
    width: "100%",
    padding: "14px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    marginTop: "12px",
    marginBottom: "18px"
  };

  return (
    <div style={{ maxWidth: "1250px", margin: "auto" }}>

      <div
        style={{
          background: "linear-gradient(120deg,#0b2545,#2563eb)",
          padding: "35px",
          borderRadius: "18px",
          color: "#ffffff",
          marginBottom: "25px"
        }}
      >
        <div style={{ fontSize: "12px", letterSpacing: "2px" }}>
          RPR DUET ADMISSION CARE
        </div>

        <h1 style={{ color: "white", margin: "12px 0" }}>
          Batch Management
        </h1>

        <p>Create and manage examination batches.</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: "20px"
        }}
      >

        <div style={card}>
          <h2>Create New Batch</h2>

          <form onSubmit={createBatch}>
            <label>
              Batch Name

              <input
                style={input}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Example: Alpha 2026"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "14px 22px",
                border: "none",
                borderRadius: "9px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              {loading ? "Creating..." : "+ Create Batch"}
            </button>
          </form>

          {message && (
            <p role="status" style={{ color: "green", marginTop: "15px" }}>
              {message}
            </p>
          )}

          {error && (
            <p role="alert" style={{ color: "red", marginTop: "15px" }}>
              {error}
            </p>
          )}
        </div>

        <div style={card}>
          <h2>All Batches ({batches.length})</h2>

          <input
            style={input}
            placeholder="Search batch..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Batch Name
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Status
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
  Action
</th>
                </tr>
              </thead>

              <tbody>
                {filteredBatches.map(batch => (
                  <tr key={batch.id}>
                    <td style={{ padding: "13px", borderTop: "1px solid #eee" }}>
                      {batch.name}
                    </td>
                    <td style={{ padding: "13px", borderTop: "1px solid #eee" }}>
                      <span style={{ color: "#059669" }}>
                        Active
                      </span>
                    </td>
                    <td style={{ padding: "13px", borderTop: "1px solid #eee" }}>
  <button
    type="button"
    onClick={() => deleteBatch(batch)}
    disabled={loading}
    style={{
      background: "#fff1f2",
      color: "#dc2626",
      border: "1px solid #fecaca",
      padding: "10px 18px",
      borderRadius: "9px",
      fontWeight: "700",
      cursor: "pointer"
    }}
  >
    🗑 Delete
  </button>
</td>
                  </tr>
                ))}

                {filteredBatches.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ padding: "20px", textAlign: "center" }}>
                      No batches found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
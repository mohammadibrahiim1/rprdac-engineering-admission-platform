import { mockApi } from "./mock.js";

// IMPORTANT: Production must authenticate ADMIN access on the backend and apply
// role-based permissions. Frontend navigation is NOT access control.
export const DEMO = import.meta.env.VITE_USE_MOCK !== "false";
const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok)
    throw new Error(payload?.message || `Server error (${response.status})`);
  return payload;
}

const liveApi = {
  getBatches: () => request("/api/admin/exams/batches"),
  createBatch: (payload) =>
    request("/api/admin/exams/batches", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteBatch: (batchId) =>
    request(`/api/admin/exams/batches/${encodeURIComponent(batchId)}`, {
      method: "DELETE",
    }),
  getStudents: (batchId, search = "") =>
    request(
      `/api/admin/exams/students?batchId=${encodeURIComponent(batchId || "")}&search=${encodeURIComponent(search)}`,
    ),
  getExams: () => request("/api/admin/exams"),
  deleteExam: (examId) =>
    request(`/api/admin/exams/${encodeURIComponent(examId)}`, {
      method: "DELETE",
    }),
  createExam: (payload) =>
    request("/api/admin/exams", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateExam: (examId, payload) =>
    request(`/api/admin/exams/${encodeURIComponent(examId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  setExamStatus: (examId, status) =>
    request(`/api/admin/exams/${encodeURIComponent(examId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getMarks: (examId) =>
    request(`/api/admin/exams/${encodeURIComponent(examId)}/marks`),
  saveMarks: (examId, entries) =>
    request(`/api/admin/exams/${encodeURIComponent(examId)}/marks`, {
      method: "PUT",
      body: JSON.stringify({ entries }),
    }),
};

export const api = DEMO ? mockApi : liveApi;

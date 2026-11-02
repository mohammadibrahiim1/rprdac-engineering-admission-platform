// DEMO ONLY. Sample student records. Production mode NEVER reads these records.
import { getMCQExam } from "./mcqStore.js";
import { findStudentById, getExcelStudents } from "./studentLookup.js";
const DEMO_KEY = "rpr-exam-management-demo-v1";

const batches = [{ id: "test-2026", name: "Test Batch" }];
const firstNames = [
  "Rahim",
  "Karim",
  "Sumon",
  "Rakib",
  "Rifat",
  "Nusrat",
  "Tamim",
  "Shuvo",
  "Mim",
  "Sadia",
  "Arif",
  "Fahim",
];
const lastNames = [
  "Ahmed",
  "Hasan",
  "Islam",
  "Hossain",
  "Rahman",
  "Akter",
  "Chowdhury",
  "Sarker",
  "Khan",
  "Jahan",
  "Mahmud",
  "Alam",
];
const departments = ["EEE", "Civil", "Mechanical", "Computer", "Power"];
const students = [];
// ==============================
// RPR BATCH MANAGEMENT
// ==============================

const BATCH_STORAGE_KEY = "rpr-custom-batches-v1";

function getCustomBatches() {
  try {
    return JSON.parse(localStorage.getItem(BATCH_STORAGE_KEY) || "[]");
  } catch (error) {
    console.error("Batch loading error:", error);
    return [];
  }
}

function saveCustomBatches(batchList) {
  localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(batchList));
}

function getAllBatches() {
  const cleared = localStorage.getItem("rpr-demo-batches-cleared") === "1";

  const defaultBatches = cleared ? [] : batches;

  return [...defaultBatches, ...getCustomBatches()];
}

const seed = {
  exams: [],
  marks: {},
};

function readState() {
  try {
    const raw = localStorage.getItem(DEMO_KEY);

    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Demo data read error:", error);
  }

  return structuredClone(seed);
}

function saveState(state) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(state));
}

const pause = () => new Promise((resolve) => setTimeout(resolve, 110));

export const mockApi = {
  async getBatches() {
    await pause();
    return getAllBatches();
  },
  async createBatch(payload) {
    await pause();

    const name = String(payload.name || "").trim();

    if (!name) {
      throw new Error("Batch name is required");
    }

    const allBatches = getAllBatches();

    const exists = allBatches.some(
      (batch) => batch.name.toLowerCase() === name.toLowerCase(),
    );

    if (exists) {
      throw new Error("This batch already exists");
    }

    const newBatch = {
      id: `batch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name,
      createdAt: new Date().toISOString(),
    };

    const customBatches = getCustomBatches();

    customBatches.push(newBatch);

    saveCustomBatches(customBatches);

    return newBatch;
  },
  async deleteBatch(batchId) {
    await pause();

    const customBatches = getCustomBatches();

    const batch = customBatches.find((b) => String(b.id) === String(batchId));

    if (!batch) {
      throw new Error("Batch not found or cannot be deleted");
    }

    const state = readState();

    const hasExams = state.exams.some(
      (e) => String(e.batchId) === String(batchId),
    );

    if (hasExams) {
      throw new Error("This batch has exams. Delete its exams first.");
    }

    const updated = customBatches.filter(
      (b) => String(b.id) !== String(batchId),
    );

    saveCustomBatches(updated);

    return { success: true };
  },

  async getStudents(batchId, search = "") {
    // Support multiple selected batches
    if (Array.isArray(batchId)) {
      const selectedIds = [...new Set(batchId.map(String))];

      const studentGroups = await Promise.all(
        selectedIds.map((id) => mockApi.getStudents(id, search)),
      );

      const uniqueStudents = new Map();

      studentGroups.flat().forEach((student) => {
        const id = String(student.id || student.studentId || "")
          .trim()
          .toUpperCase();

        if (!id) return;

        const previous = uniqueStudents.get(id);

        const isWebsiteStudent = (item) =>
          String(item?.source || "")
            .toLowerCase()
            .includes("website");

        if (
          !previous ||
          (!isWebsiteStudent(previous) && isWebsiteStudent(student))
        ) {
          uniqueStudents.set(id, student);
        }
      });

      return [...uniqueStudents.values()];
    }
    await pause();

    const allBatches = getAllBatches();

    const selectedBatch = allBatches.find(
      (b) => String(b.id) === String(batchId),
    );

    // Normalize batch name
    const normalizeBatch = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/^\d+\s*[.)-]\s*/, "")
        .replace(/\s+20\d{2}$/, "")
        .replace(/\s+/g, " ");

    // Check student's batch
    const matchesBatch = (student) => {
      if (!batchId) return true;

      if (
        student.batchId != null &&
        String(student.batchId) === String(batchId)
      ) {
        return true;
      }

      return Boolean(
        selectedBatch &&
        student.batch &&
        normalizeBatch(student.batch) === normalizeBatch(selectedBatch.name),
      );
    };

    // Load Excel Students
    const excelStudents = getExcelStudents();

    const studentMap = new Map();

    // Excel Students first
    excelStudents.forEach((student) => {
      const id = String(student.id ?? "")
        .trim()
        .toUpperCase();

      if (id && matchesBatch(student)) {
        studentMap.set(id, {
          ...student,
          id,
        });
      }
    });

    // Website Students have priority
    students.forEach((student) => {
      const id = String(student.id ?? "")
        .trim()
        .toUpperCase();

      if (id && matchesBatch(student)) {
        studentMap.set(id, {
          ...student,
          id,
        });
      }
    });

    // Student Search
    const q = String(search ?? "")
      .trim()
      .toLowerCase();

    return [...studentMap.values()].filter((student) => {
      if (!q) return true;

      return [student.id, student.name, student.phone, student.department].some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(q),
      );
    });
  },
  async deleteExam(examId) {
    await pause();

    const state = readState();

    const exam = state.exams.find((e) => String(e.id) === String(examId));

    if (!exam) {
      throw new Error("Exam not found!");
    }

    state.exams = state.exams.filter((e) => String(e.id) !== String(examId));

    delete state.marks[examId];

    saveState(state);

    return { success: true };
  },
  async getExams() {
    await pause();
    return readState().exams;
  },
  async createExam(payload) {
    await pause();
    const state = readState();
    const item = {
      ...payload,
      id: `exam-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      status: "draft",
    };
    state.exams.unshift(item);
    state.marks[item.id] = {};
    saveState(state);
    return item;
  },
  // =================================
  // UPDATE EXAM INFORMATION
  // =================================

  async updateExam(examId, payload) {
    await pause();

    const state = readState();

    const exam = state.exams.find((e) => String(e.id) === String(examId));

    if (!exam) {
      throw new Error("পরীক্ষাটি পাওয়া যায়নি!");
    }

    // Published Exam Protection
    if (exam.status === "published") {
      throw new Error(
        "Published পরীক্ষা Edit করা যাবে না। আগে Unpublish করুন।",
      );
    }

    const title = String(payload.title || "").trim();
    const subject = String(payload.subject || "").trim();
    const date = String(payload.date || "").trim();
    const batchId = String(payload.batchId || "");
    const fullMarks = Number(payload.fullMarks);

    if (!title || !subject || !date || !batchId) {
      throw new Error("সকল তথ্য পূরণ করুন!");
    }

    if (!Number.isFinite(fullMarks) || fullMarks <= 0) {
      throw new Error("Full Marks সঠিক নয়!");
    }

    // Check Batch
    const batchExists = getAllBatches().some((b) => String(b.id) === batchId);

    if (!batchExists) {
      throw new Error("নির্বাচিত Batch পাওয়া যায়নি!");
    }

    // Check Existing Marks
    const existingMarks = state.marks[String(examId)] || {};

    const hasMarks = Object.keys(existingMarks).length > 0;

    if (hasMarks) {
      if (String(exam.batchId) !== batchId) {
        throw new Error("Marks Entry হয়েছে। এখন Batch পরিবর্তন করা যাবে না!");
      }

      if (Number(exam.fullMarks) !== fullMarks) {
        throw new Error(
          "Marks Entry হয়েছে। এখন Full Marks পরিবর্তন করা যাবে না!",
        );
      }
    }
    // Exam Type and Marks Distribution
    const examType = payload.examType || exam.examType || "written";

    const mcqFullMarks = Number(payload.mcqFullMarks ?? exam.mcqFullMarks ?? 0);

    const writtenFullMarks = Number(
      payload.writtenFullMarks ?? fullMarks - mcqFullMarks,
    );

    // Validate Marks Distribution
    if (
      !["mcq", "written", "combined"].includes(examType) ||
      !Number.isFinite(mcqFullMarks) ||
      !Number.isFinite(writtenFullMarks) ||
      mcqFullMarks < 0 ||
      writtenFullMarks < 0 ||
      Math.abs(mcqFullMarks + writtenFullMarks - fullMarks) > 0.001
    ) {
      throw new Error("Invalid Exam Type or Marks Distribution.");
    }
    // Update Exam
    exam.title = title;
    exam.subject = subject;
    exam.date = date;
    exam.batchId = batchId;
    exam.batchIds =
      Array.isArray(payload.batchIds) && payload.batchIds.length > 0
        ? [...new Set(payload.batchIds.map(String))]
        : [String(batchId)];
    exam.fullMarks = fullMarks;
    exam.examType = examType;
    exam.mcqFullMarks = mcqFullMarks;
    exam.writtenFullMarks = writtenFullMarks;

    saveState(state);

    return { ...exam };
  },
  async setExamStatus(examId, status) {
    await pause();
    const state = readState();
    const exam = state.exams.find((e) => e.id === examId);
    if (!exam) throw new Error("পরীক্ষাটি পাওয়া যায়নি।");
    if (
      status === "published" &&
      !Object.keys(state.marks[examId] || {}).length
    )
      throw new Error("প্রথমে নম্বর সেভ করুন।");
    exam.status = status;
    saveState(state);
    return exam;
  },
  // =================================
  // GET EXAM MARKS
  // =================================

  async getMarks(examId) {
    await pause();

    const state = readState();

    const examMarks = state.marks?.[String(examId)] || {};

    return Object.values(examMarks);
  },
  async saveMarks(examId, entries) {
    await pause();

    const state = readState();
    const exam = state.exams.find((e) => String(e.id) === String(examId));

    if (!exam) {
      throw new Error("পরীক্ষাটি পাওয়া যায়নি!");
    }

    if (exam.status === "published") {
      throw new Error("Published পরীক্ষার নম্বর পরিবর্তন করা যাবে না!");
    }

    if (!Array.isArray(entries)) {
      throw new Error("ভুল Marks Data!");
    }

    // Find Exam Batch
    const examBatch = getAllBatches().find(
      (b) => String(b.id) === String(exam.batchId),
    );

    if (!examBatch) {
      throw new Error("পরীক্ষার Batch পাওয়া যায়নি!");
    }

    // Normalize batch names
    const normalizeBatch = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/^\d+\s*[.)-]\s*/, "")
        .replace(/\s+20\d{2}$/, "")
        .replace(/\s+/g, " ");

    if (!state.marks[examId]) {
      state.marks[examId] = {};
    }

    for (const entry of entries) {
      const studentId = String(entry.studentId ?? "").trim();

      // Website first, Excel fallback
      const student = findStudentById(studentId, students);

      if (!student) {
        throw new Error(`Student ID ${studentId} পাওয়া যায়নি!`);
      }

      // Validate Student Against All Selected Exam Batches
      const selectedBatchIds =
        Array.isArray(exam.batchIds) && exam.batchIds.length > 0
          ? exam.batchIds.map(String)
          : [String(exam.batchId)];

      const selectedBatchNames = getAllBatches()
        .filter((b) => selectedBatchIds.includes(String(b.id)))
        .map((b) => normalizeBatch(b.name));

      const sameBatchById =
        student.batchId != null &&
        selectedBatchIds.includes(String(student.batchId));

      const sameBatchByName =
        Boolean(student.batch) &&
        selectedBatchNames.includes(normalizeBatch(student.batch));

      if (!sameBatchById && !sameBatchByName) {
        throw new Error(
          `${studentId} এই পরীক্ষার নির্বাচিত Batch-এর শিক্ষার্থী নয়!`,
        );
      }
      const absent = Boolean(entry.absent);

      const marks = absent ? null : Number(entry.marks);

      if (
        !absent &&
        (entry.marks === null ||
          entry.marks === undefined ||
          String(entry.marks).trim() === "" ||
          !Number.isFinite(marks) ||
          marks < 0 ||
          marks > Number(exam.fullMarks))
      ) {
        throw new Error(
          `${studentId}: Marks অবশ্যই 0 থেকে ${exam.fullMarks} এর মধ্যে হতে হবে।`,
        );
      }

      // Save or Update Student Marks
      state.marks[examId][studentId] = {
        studentId,
        marks,
        absent,
      };
    }

    saveState(state);

    return {
      updated: entries.length,
    };
  },
};

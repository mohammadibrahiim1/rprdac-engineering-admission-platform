import { z } from "zod";

// ==================== SELECTOR & ENTITY INTERFACES ====================
export interface IBatch {
  _id: string;
  title: string;
}

export interface IExam {
  _id: string;
  title: string;
  fullMarks: number;
  mcqFullMarks: number;
  writtenFullMarks: number;
}

export interface IStudent {
  _id: string;
  studentId: string;
  name: string;
  phone: string;
  batch: string;
  department: string;
  source: "internal" | "external";
}

// ==================== ZOD & FORM VALIDATION TYPES ====================

// প্রতিটি স্টুডেন্টের ব্যক্তিগত মার্কস রো এর জন্য Zod Schema
export const studentMarkRowZodSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  name: z.string().min(1, "Name is required"),
  phone: z.string(),
  batch: z.string(),
  department: z.string(),
  source: z.enum(["internal", "external"]),

  // MCQ Detailed Breakdown
  mcqAnswered: z.number().min(0, "Cannot be negative").default(0),
  mcqCorrect: z.number().min(0, "Cannot be negative").default(0),
  mcqIncorrect: z.number().min(0, "Cannot be negative").default(0),
  mcqMarks: z.number().min(0, "Cannot be negative").default(0),

  // Written Marks
  writtenMarks: z.number().min(0, "Cannot be negative").default(0),
});

// পুরো ফর্মের (Bulk Submit) জন্য Zod Schema
export const bulkExamMarksZodSchema = z.object({
  batchId: z
    .string({ message: "Please select a batch" })
    .min(1, "Please select a batch"),
  examId: z
    .string({ message: "Please select an exam" })
    .min(1, "Please select an exam"),
  studentsMarks: z
    .array(studentMarkRowZodSchema)
    .min(1, "No student data available to submit"),
});

// Zod থেকে Inferred Types (যা আপনার হুক এবং কম্পোনেন্টে ব্যবহার হবে)
export type StudentMarkRowValues = z.infer<typeof studentMarkRowZodSchema>;
export type BulkExamMarksFormValues = z.infer<typeof bulkExamMarksZodSchema>;

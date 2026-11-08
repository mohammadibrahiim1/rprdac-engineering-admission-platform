import { ExamFormValues, ExamRecord, ExamType } from "../types/Exam.types";

export function isExamType(value: string): value is ExamType {
  return value === "written" || value === "mcq" || value === "combined";
}

export function examTypeLabel(type: ExamType | null | undefined): string {
  switch (type) {
    case "written":
      return "Only Written";
    case "mcq":
      return "Only MCQ";
    case "combined":
      return "MCQ + Written";
    default:
      return "Unknown";
  }
}

export function toFormValues(exam: ExamRecord): ExamFormValues {
  return {
    title: exam.title ?? "",
    subject: exam.subject ?? "",
    batchIds: exam.batchIds ?? [],
    date: exam.date ?? "",
    session: exam.session ?? "",
    status: exam.status ?? "draft",
    fullMarks: exam.fullMarks ?? 100,
    examType: exam.examType ?? "written",
    mcqFullMarks: exam.mcqFullMarks ?? 0,
    writtenFullMarks: exam.writtenFullMarks ?? 0,
  };
}

const FIELD_LABELS: Record<keyof ExamFormValues, string> = {
  title: "Exam Name",
  subject: "Subject",
  batchIds: "Batches",
  date: "Exam Date",
  session: "Academic Session",
  status: "Exam Status",
  fullMarks: "Full Marks",
  examType: "Exam Type",
  mcqFullMarks: "MCQ Full Marks",
  writtenFullMarks: "Written Full Marks",
};

export function labelFor(key: string): string {
  return FIELD_LABELS[key as keyof ExamFormValues] ?? key;
}

export function buildExamPatch(
  values: ExamFormValues,
  dirtyFields: Partial<Record<keyof ExamFormValues, any>>, // ✨ Changed from boolean | boolean[] to any
): Partial<ExamFormValues> {
  const patch = {} as Partial<ExamFormValues>;

  for (const key of Object.keys(dirtyFields) as (keyof ExamFormValues)[]) {
    if (dirtyFields[key]) {
      switch (key) {
        case "title":
        case "subject":
        case "date":
        case "session":
        case "status":
          patch[key] = values[key];
          break;
        case "batchIds":
          patch.batchIds = values.batchIds;
          break;
        case "fullMarks":
        case "mcqFullMarks":
        case "writtenFullMarks":
          patch[key] = values[key];
          break;
        case "examType":
          patch.examType = values.examType;
          break;
      }
    }
  }

  return patch;
}

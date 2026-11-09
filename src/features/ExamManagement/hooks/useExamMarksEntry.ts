import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import {
  BulkExamMarksFormValues,
  bulkExamMarksZodSchema,
  IExam,
  IStudent,
} from "../types/ExamMarksEntry.types";
import { useGetBatchesQuery } from "@/features/control-panel/control-panel-services/batch/batchApi";
import { useGetStudentsQuery } from "@/features/admin/studentPanel/services/api/studentApi";
import { useGetExamsQuery } from "../services/examApi";

export function useExamMarksEntry() {
  const [examBatchSearch, setExamBatchSearch] = useState<string>("");
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);

  // 1. Live Batch Search (Backend filtered)
  const { data: batches = [], isLoading: isBatchLoading } =
    useGetBatchesQuery(examBatchSearch);

  // Form
  const form = useForm<BulkExamMarksFormValues>({
    resolver: zodResolver(bulkExamMarksZodSchema),
    defaultValues: {
      batchId: "",
      examId: "",
      studentsMarks: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "studentsMarks",
  });

  const selectedBatchId = form.watch("batchId");
  const selectedExamId = form.watch("examId");

  const selectedBatch = useMemo(() => {
    if (!selectedBatchId) return "";
    const foundBatch = batches.find((btc) => btc?._id === selectedBatchId);
    return foundBatch?.title || "";
  }, [selectedBatchId, batches]);

  // 2. Fetch Students ONLY when batch is selected (Backend filtered by batch)
  const { data: studentsResponse, isLoading: isStudentLoading } =
    useGetStudentsQuery({
      batch: selectedBatch.toLowerCase(),
      search: studentSearchQuery,
    });

  // 3. Fetch Exams ONLY when batch is selected (Backend filtered by batch)
  const {
    data: examsResponse,
    isLoading: isLoadingExams,
    refetch: refetchExams,
  } = useGetExamsQuery(selectedBatchId, {
    skip: !selectedBatchId,
  });

  // Normalize Students
  const students: IStudent[] = useMemo(() => {
    if (!studentsResponse) return [];
    if (Array.isArray(studentsResponse)) return studentsResponse;
    if (Array.isArray((studentsResponse as any)?.data))
      return (studentsResponse as any).data;
    if (Array.isArray((studentsResponse as any)?.students))
      return (studentsResponse as any).students;
    return [];
  }, [studentsResponse]);

  // Normalize Exams
  const exams: IExam[] = useMemo(() => {
    if (!examsResponse) return [];
    if (Array.isArray(examsResponse)) return examsResponse;
    if (Array.isArray((examsResponse as any)?.exams))
      return (examsResponse as any).exams;
    if (Array.isArray((examsResponse as any)?.data))
      return (examsResponse as any).data;
    return [];
  }, [examsResponse]);

  // Selected Exam Object
  const selectedExam = useMemo(() => {
    return exams.find((e) => String(e._id) === String(selectedExamId)) || null;
  }, [exams, selectedExamId]);

  // Load students of selected batch into form
  useEffect(() => {
    if (!selectedBatchId) {
      replace([]);
      return;
    }

    const formattedMarks = students.map((s: IStudent) => ({
      studentId: s.studentId,
      name: s.name,
      phone: s.phone || "",
      batch: s.batch,
      department: s.department || "",
      source: (s.source as "internal" | "external") || "internal",
      mcqAnswered: 0,
      mcqCorrect: 0,
      mcqIncorrect: 0,
      mcqMarks: 0,
      writtenMarks: 0,
    }));

    replace(formattedMarks);
  }, [selectedBatchId, students, replace]);

  // ===================== Excel Upload Logic (kept intact + improved) =====================

  type ExcelMarkRecord = {
    studentId: string;
    mcqAnswered?: number;
    mcqCorrect?: number;
    mcqIncorrect?: number;
    mcqMarks?: number;
  };

  const normalizeStudentId = (value: unknown): string => {
    return String(value ?? "")
      .trim()
      .replace(/\s+/g, "")
      .toUpperCase();
  };

  const normalizeHeader = (value: unknown): string => {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
  };

  const getExcelCellValue = (cell: ExcelJS.Cell): unknown => {
    const value = cell.value;

    if (value === null || value === undefined) return "";

    if (typeof value === "object") {
      if ("result" in value) return (value as any).result ?? "";
      if ("richText" in value)
        return (value as any).richText.map((item: any) => item.text).join("");
      if ("text" in value) return (value as any).text ?? "";
      if ("hyperlink" in value) return (value as any).text ?? "";
    }

    return value;
  };

  const parseExcelNumber = (
    value: unknown,
    columnName: string,
    studentId: string,
  ): number | undefined => {
    if (value === undefined || value === null || value === "") return undefined;

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new Error(`Invalid ${columnName} for Student ID: ${studentId}`);
    }

    return parsed;
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Please upload an .xlsx Excel file.");
      e.target.value = "";
      return;
    }

    if (!selectedBatchId) {
      toast.error("Please select a batch first.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const buffer = event.target?.result;
        if (!(buffer instanceof ArrayBuffer)) {
          throw new Error("Unable to read Excel file.");
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.worksheets[0];
        if (!worksheet || worksheet.rowCount < 2) {
          throw new Error("Excel file contains no student records.");
        }

        // ===== Headers =====
        const headerRow = worksheet.getRow(1);
        const headerMap = new Map<string, number>();

        headerRow.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
          const header = normalizeHeader(getExcelCellValue(cell));
          if (!header) return;
          if (headerMap.has(header)) {
            throw new Error(`Duplicate Excel column: ${header}`);
          }
          headerMap.set(header, columnNumber);
        });

        const findColumn = (aliases: string[]): number | undefined => {
          for (const alias of aliases) {
            const column = headerMap.get(alias);
            if (column !== undefined) return column;
          }
          return undefined;
        };

        const studentIdColumn = findColumn(["studentid", "studentcode", "id"]);
        const answeredColumn = findColumn([
          "mcqanswered",
          "totalanswered",
          "answered",
        ]);
        const correctColumn = findColumn([
          "mcqcorrect",
          "mcqright",
          "correct",
          "right",
        ]);
        const incorrectColumn = findColumn([
          "mcqincorrect",
          "mcqwrong",
          "incorrect",
          "wrong",
        ]);
        const marksColumn = findColumn([
          "mcqmarks",
          "mcqscore",
          "marks",
          "score",
        ]);

        if (!studentIdColumn) {
          throw new Error("Student ID column is missing in Excel.");
        }

        if (
          !answeredColumn &&
          !correctColumn &&
          !incorrectColumn &&
          !marksColumn
        ) {
          throw new Error("No MCQ marks columns found in Excel.");
        }

        // ===== Build Excel Map =====
        const excelStudentMap = new Map<string, ExcelMarkRecord>();
        const excelErrors: string[] = [];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;

          const rawStudentId = getExcelCellValue(row.getCell(studentIdColumn));
          if (
            rawStudentId === null ||
            rawStudentId === undefined ||
            String(rawStudentId).trim() === ""
          ) {
            return;
          }

          const studentId = normalizeStudentId(rawStudentId);
          if (!studentId) return;

          if (excelStudentMap.has(studentId)) {
            excelErrors.push(
              `Duplicate Student ID ${studentId} at row ${rowNumber}`,
            );
            return;
          }

          const record: ExcelMarkRecord = {
            studentId,
            mcqAnswered: answeredColumn
              ? parseExcelNumber(
                  getExcelCellValue(row.getCell(answeredColumn)),
                  "MCQ Answered",
                  studentId,
                )
              : undefined,
            mcqCorrect: correctColumn
              ? parseExcelNumber(
                  getExcelCellValue(row.getCell(correctColumn)),
                  "MCQ Correct",
                  studentId,
                )
              : undefined,
            mcqIncorrect: incorrectColumn
              ? parseExcelNumber(
                  getExcelCellValue(row.getCell(incorrectColumn)),
                  "MCQ Incorrect",
                  studentId,
                )
              : undefined,
            mcqMarks: marksColumn
              ? parseExcelNumber(
                  getExcelCellValue(row.getCell(marksColumn)),
                  "MCQ Marks",
                  studentId,
                )
              : undefined,
          };

          excelStudentMap.set(studentId, record);
        });

        if (excelErrors.length > 0) {
          throw new Error(
            `Excel validation failed:\n${excelErrors.slice(0, 5).join("\n")}`,
          );
        }

        if (excelStudentMap.size === 0) {
          throw new Error("No valid student records found in Excel.");
        }

        // ===== Current Form Students =====
        const currentStudents = form.getValues("studentsMarks");
        if (currentStudents.length === 0) {
          throw new Error("No students found in the selected batch.");
        }

        const batchStudentMap = new Map<string, number>();
        currentStudents.forEach((student, index) => {
          const studentId = normalizeStudentId(student.studentId);
          if (!studentId) {
            throw new Error(`Student at index ${index} has no Student ID.`);
          }
          if (batchStudentMap.has(studentId)) {
            throw new Error(
              `Duplicate Student ID in selected batch: ${studentId}`,
            );
          }
          batchStudentMap.set(studentId, index);
        });

        // ===== Validate Excel IDs against batch =====
        const unmatchedIds: string[] = [];
        for (const excelId of excelStudentMap.keys()) {
          if (!batchStudentMap.has(excelId)) {
            unmatchedIds.push(excelId);
          }
        }

        if (unmatchedIds.length > 0) {
          throw new Error(
            `These Excel Student IDs do not belong to the selected batch: ${unmatchedIds
              .slice(0, 10)
              .join(", ")}`,
          );
        }

        // ===== Update Form =====
        const updatedStudents = currentStudents.map((student) => ({
          ...student,
        }));

        let matchedCount = 0;

        for (const [excelId, excelRecord] of excelStudentMap) {
          const formIndex = batchStudentMap.get(excelId);
          if (formIndex === undefined) {
            throw new Error(`Student mapping failed: ${excelId}`);
          }

          const existingStudent = updatedStudents[formIndex];

          if (normalizeStudentId(existingStudent.studentId) !== excelId) {
            throw new Error(
              `Student identity mismatch for ${excelId}. Upload cancelled.`,
            );
          }

          updatedStudents[formIndex] = {
            ...existingStudent,
            mcqAnswered: excelRecord.mcqAnswered ?? existingStudent.mcqAnswered,
            mcqCorrect: excelRecord.mcqCorrect ?? existingStudent.mcqCorrect,
            mcqIncorrect:
              excelRecord.mcqIncorrect ?? existingStudent.mcqIncorrect,
            mcqMarks: excelRecord.mcqMarks ?? existingStudent.mcqMarks,
          };

          matchedCount++;
        }

        if (matchedCount === 0) {
          throw new Error("No matching Student IDs found.");
        }

        replace(updatedStudents);

        const unmatchedBatchCount = currentStudents.length - matchedCount;

        toast.success(
          `Successfully imported marks for ${matchedCount} students.`,
          {
            description:
              unmatchedBatchCount > 0
                ? `${unmatchedBatchCount} students had no matching Excel record. Their existing marks were preserved.`
                : "All student IDs matched successfully.",
          },
        );
      } catch (error) {
        console.error("Excel marks import error:", error);
        toast.error(
          error instanceof Error ? error.message : "Excel upload failed.",
        );
      } finally {
        e.target.value = "";
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read Excel file.");
      e.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  // Reset Form
  const handleClearForm = () => {
    form.reset({
      batchId: "",
      examId: "",
      studentsMarks: [],
    });
    replace([]);
    setStudentSearchQuery("");
    setExamBatchSearch("");
    setIsBatchDropdownOpen(false);
    toast.info("Form cleared successfully.");
  };

  // Submit Handler
  const handleFormSubmit = async (values: BulkExamMarksFormValues) => {
    try {
      setIsSubmitting(true);
      const fullMarks = selectedExam?.fullMarks || 100;

      const payload = {
        batchId: values.batchId,
        examId: values.examId,
        fullMarks,
        studentsMarks: values.studentsMarks,
      };

      const res = await fetch("/api/result-sheets/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Submission failed");

      toast.success("Exam result sheet created and marks saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Error submitting marks");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    fields,
    allFieldsLength: fields.length,
    students,
    batches,
    exams,
    selectedExam,
    isBatchLoading,
    isStudentLoading,
    isLoadingExams,
    isSubmitting,
    examBatchSearch,
    setExamBatchSearch,
    studentSearchQuery,
    setStudentSearchQuery,
    isBatchDropdownOpen,
    setIsBatchDropdownOpen,
    refetchExams,
    handleExcelUpload,
    handleClearForm,
    onSubmit: form.handleSubmit(handleFormSubmit),
  };
}

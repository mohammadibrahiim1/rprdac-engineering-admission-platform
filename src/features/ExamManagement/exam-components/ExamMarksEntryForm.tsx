import { useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  FileSpreadsheet,
  Search,
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  Phone,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useExamMarksEntry } from "../hooks/useExamMarksEntry";

export function ExamMarksEntryForm() {
  const {
    form,
    allFieldsLength,
    batches,
    exams,
    students,
    selectedExam,
    isBatchLoading,
    isLoadingExams,
    isSubmitting,
    examBatchSearch,
    setExamBatchSearch,
    studentSearchQuery,
    setStudentSearchQuery,
    isBatchDropdownOpen,
    setIsBatchDropdownOpen,
    handleExcelUpload,
    handleClearForm,
    onSubmit,
  } = useExamMarksEntry();

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedBatchId = watch("batchId");
  const selectedExamId = watch("examId");

  const batchDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        batchDropdownRef.current &&
        !batchDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBatchDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsBatchDropdownOpen]);

  /* =======================================================
     Student Search & Batch Selection Handlers
  ======================================================= */

  const handleBatchSelect = (batchId: string, batchTitle: string) => {
    setValue("batchId", batchId, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("examId", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setExamBatchSearch(batchTitle);
    setIsBatchDropdownOpen(false);
  };

  // 🛠️ FIX: টাইপসেফ করার জন্য value-কে string | null অ্যালাউ করা হলো
  const handleExamChange = (value: string | null) => {
    setValue("examId", value || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleStudentSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStudentSearchQuery(event.target.value);
  };

  // Selected batch title for display
  const selectedBatchTitle = useMemo(() => {
    if (!selectedBatchId) return "";
    const found = batches?.find(
      (b: any) => String(b._id) === String(selectedBatchId),
    );
    return found?.title || examBatchSearch;
  }, [selectedBatchId, batches, examBatchSearch]);

  // Dynamic Max values from selected exam
  const maxMcqMarks = selectedExam?.mcqFullMarks ?? 100;
  const maxWrittenMarks = selectedExam?.writtenFullMarks ?? 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-6 space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Result Sheet Management
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 mt-1">
            <GraduationCap className="h-7 w-7 text-primary" />
            Batch-wise Exam Marks Entry
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Select batch, link exam, upload MCQ results via Excel, or manually
            enter marks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearForm}
            disabled={isSubmitting}
            className="h-9 gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Form
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card className="shadow-sm border-border">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Batch, Exam, and File Upload Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Live Searchable Batch Select */}
              <div className="space-y-2 relative" ref={batchDropdownRef}>
                <Label htmlFor="batchSearch" className="text-xs font-medium">
                  1. Select Batch
                </Label>

                <div className="relative">
                  <Input
                    id="batchSearch"
                    type="text"
                    placeholder={
                      isBatchLoading
                        ? "Loading batches..."
                        : "Search & select batch..."
                    }
                    value={
                      isBatchDropdownOpen ? examBatchSearch : selectedBatchTitle
                    }
                    onChange={(e) => {
                      setExamBatchSearch(e.target.value);
                      setIsBatchDropdownOpen(true);
                      if (selectedBatchId) {
                        setValue("batchId", "", { shouldValidate: true });
                        setValue("examId", "", { shouldValidate: true });
                      }
                    }}
                    onFocus={() => setIsBatchDropdownOpen(true)}
                    disabled={isSubmitting}
                    className="h-9 text-xs pr-8"
                    autoComplete="off"
                  />
                  <ChevronDown
                    className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform ${
                      isBatchDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {isBatchDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {isBatchLoading ? (
                      <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Searching...
                      </div>
                    ) : (batches?.length ?? 0) === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No batches found
                      </div>
                    ) : (
                      batches?.map((batch: any) => (
                        <button
                          key={batch._id}
                          type="button"
                          onClick={() =>
                            handleBatchSelect(String(batch._id), batch.title)
                          }
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors ${
                            String(batch._id) === String(selectedBatchId)
                              ? "bg-accent font-medium"
                              : ""
                          }`}
                        >
                          {batch.title}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {errors?.batchId && (
                  <p className="text-xs text-destructive mt-1">
                    {String(errors.batchId.message)}
                  </p>
                )}
              </div>

              {/* 2. Select Exam */}
              <div className="space-y-2">
                <Label htmlFor="examId" className="text-xs font-medium">
                  2. Select Exam
                </Label>

                <Select
                  disabled={!selectedBatchId || isLoadingExams || isSubmitting}
                  onValueChange={handleExamChange}
                  value={selectedExamId || ""}
                >
                  <SelectTrigger id="examId" className="h-9 text-xs">
                    <SelectValue
                      placeholder={
                        !selectedBatchId
                          ? "Select batch first"
                          : isLoadingExams
                            ? "Loading Exams..."
                            : "Choose Exam"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {exams?.map((exam: any) => (
                      <SelectItem
                        key={exam._id}
                        value={String(exam._id)}
                        className="text-xs"
                      >
                        {exam?.title} (Full Marks: {exam?.fullMarks})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors?.examId && (
                  <p className="text-xs text-destructive mt-1">
                    {String(errors.examId.message)}
                  </p>
                )}
              </div>

              {/* 3. Upload Excel */}
              <div className="space-y-2">
                <Label htmlFor="excelFile" className="text-xs font-medium">
                  3. Upload MCQ Excel File
                </Label>

                <div className="relative">
                  <Input
                    id="excelFile"
                    type="file"
                    accept=".xlsx"
                    disabled={
                      !selectedBatchId || allFieldsLength === 0 || isSubmitting
                    }
                    onChange={handleExcelUpload}
                    className="cursor-pointer pr-10 h-9 text-xs file:text-xs file:font-medium"
                  />
                  <FileSpreadsheet className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Selected Exam Summary Badge */}
            {selectedExam && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-accent/40 rounded-lg border text-xs text-accent-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="leading-normal">
                  Selected Exam: <strong>{selectedExam?.title}</strong>
                  <span className="mx-1 text-muted-foreground">|</span>
                  Full Marks: <strong>{selectedExam.fullMarks}</strong>
                  <span className="mx-1 text-muted-foreground">|</span>
                  MCQ Marks: <strong>{selectedExam.mcqFullMarks}</strong>
                  <span className="mx-1 text-muted-foreground">|</span>
                  Written Marks:{" "}
                  <strong>{selectedExam?.writtenFullMarks}</strong>
                </span>
              </div>
            )}

            {/* Student Marks Table Section */}
            {allFieldsLength > 0 && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Students Mark Entry ({allFieldsLength} Students Enrolled)
                  </h3>

                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search by Name, Student ID, or Phone..."
                      value={studentSearchQuery}
                      onChange={handleStudentSearch}
                      className="pl-9 h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table className="w-full text-left text-xs">
                    <TableHeader className="bg-muted/80 uppercase font-semibold text-muted-foreground">
                      <TableRow>
                        <TableHead className="w-[200px]">
                          Student Info
                        </TableHead>
                        <TableHead className="w-[130px]">
                          Dept / Source
                        </TableHead>
                        <TableHead className="w-[90px]">MCQ Ans</TableHead>
                        <TableHead className="w-[90px]">MCQ Right</TableHead>
                        <TableHead className="w-[90px]">MCQ Wrong</TableHead>
                        <TableHead className="w-[100px]">
                          MCQ Marks
                          {selectedExam && (
                            <span className="block text-[10px] font-normal normal-case text-muted-foreground">
                              Max: {maxMcqMarks}
                            </span>
                          )}
                        </TableHead>
                        <TableHead className="w-[100px]">
                          Written Marks
                          {selectedExam && (
                            <span className="block text-[10px] font-normal normal-case text-muted-foreground">
                              Max: {maxWrittenMarks}
                            </span>
                          )}
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-border bg-card">
                      {(students?.length ?? 0) > 0 ? (
                        students?.map((student: any) => {
                          const idx = student._formIndex;

                          return (
                            <TableRow
                              key={student.id || student.studentId || idx}
                              className="hover:bg-muted/40 transition-colors"
                            >
                              <TableCell className="p-2.5 align-middle">
                                <div className="min-w-[150px] space-y-0.5">
                                  <p className="font-semibold text-foreground">
                                    {student.name}
                                  </p>
                                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                                    <span>ID: {student.studentId}</span>
                                    {student.phone && (
                                      <span className="flex items-center gap-0.5 text-muted-foreground/80">
                                        <Phone className="h-2.5 w-2.5" />
                                        {student.phone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell className="p-2.5 align-middle">
                                <div className="min-w-[100px]">
                                  <p className="text-xs capitalize">
                                    {student?.department || "N/A"}
                                    {" | "}
                                    {student?.batch || "N/A"}
                                  </p>
                                  <span className="inline-block px-1.5 py-0.5 text-[10px] bg-accent rounded uppercase font-bold text-accent-foreground mt-0.5">
                                    {student.source || "System"}
                                  </span>
                                </div>
                              </TableCell>

                              {/* MCQ Answered */}
                              <TableCell className="p-2.5 align-middle">
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  defaultValue={0}
                                  className="h-8 w-20 text-xs bg-background text-foreground border-input"
                                  {...register(
                                    `studentsMarks.${idx}.mcqAnswered`,
                                    { valueAsNumber: true },
                                  )}
                                />
                              </TableCell>

                              {/* MCQ Correct */}
                              <TableCell className="p-2.5 align-middle">
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  defaultValue={0}
                                  className="h-8 w-20 text-xs bg-background text-foreground border-input"
                                  {...register(
                                    `studentsMarks.${idx}.mcqCorrect`,
                                    { valueAsNumber: true },
                                  )}
                                />
                              </TableCell>

                              {/* MCQ Incorrect */}
                              <TableCell className="p-2.5 align-middle">
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  defaultValue={0}
                                  className="h-8 w-20 text-xs bg-background text-foreground border-input"
                                  {...register(
                                    `studentsMarks.${idx}.mcqIncorrect`,
                                    { valueAsNumber: true },
                                  )}
                                />
                              </TableCell>

                              {/* MCQ Marks - Dynamic Max */}
                              <TableCell className="p-2.5 align-middle">
                                <Input
                                  type="number"
                                  min="0"
                                  max={maxMcqMarks}
                                  step="0.5"
                                  defaultValue={0}
                                  placeholder={`0 - ${maxMcqMarks}`}
                                  className="h-8 w-20 text-xs bg-background text-foreground border-input"
                                  {...register(
                                    `studentsMarks.${idx}.mcqMarks`,
                                    {
                                      valueAsNumber: true,
                                      onChange: (e) => {
                                        const value = Number(e.target.value);
                                        if (value > maxMcqMarks) {
                                          setValue(
                                            `studentsMarks.${idx}.mcqMarks`,
                                            maxMcqMarks,
                                            { shouldValidate: true },
                                          );
                                        }
                                      },
                                    },
                                  )}
                                />
                              </TableCell>

                              {/* Written Marks - Dynamic Max */}
                              <TableCell className="p-2.5 align-middle">
                                <Input
                                  type="number"
                                  min="0"
                                  max={maxWrittenMarks}
                                  step="0.5"
                                  defaultValue={0}
                                  placeholder={`0 - ${maxWrittenMarks}`}
                                  className="h-8 w-20 text-xs bg-background text-foreground border-input"
                                  {...register(
                                    `studentsMarks.${idx}.writtenMarks`,
                                    {
                                      valueAsNumber: true,
                                      onChange: (e) => {
                                        const value = Number(e.target.value);
                                        if (value > maxWrittenMarks) {
                                          setValue(
                                            `studentsMarks.${idx}.writtenMarks`,
                                            maxWrittenMarks,
                                            { shouldValidate: true },
                                          );
                                        }
                                      },
                                    },
                                  )}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No matching students found for "{studentSearchQuery}
                            ".
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <p className="text-xs text-muted-foreground text-right">
                  Showing {students?.length || 0} of {allFieldsLength} students
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={
                isSubmitting ||
                allFieldsLength === 0 ||
                !selectedBatchId ||
                !selectedExamId
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Exam Marks...
                </>
              ) : (
                "Submit & Create Result Sheet"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

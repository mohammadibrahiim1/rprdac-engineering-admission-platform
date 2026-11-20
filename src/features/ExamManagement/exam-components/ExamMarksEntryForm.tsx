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
  Users,
  SearchX,
  BookOpen,
  Hash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    isStudentLoading,
    isLoadingExams,
    isSubmitting,
    examBatchSearch,
    setExamBatchSearch,
    studentSearchQuery,
    setStudentSearchQuery,
    startStudentId,
    setStartStudentId,
    endStudentId,
    setEndStudentId,
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

  // Close batch dropdown when clicking outside
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

  const handleBatchSelect = (batchId: string, batchTitle: string) => {
    setValue("batchId", batchId, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("examId", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setStudentSearchQuery("");
    setStartStudentId("");
    setEndStudentId("");
    setExamBatchSearch(batchTitle);
    setIsBatchDropdownOpen(false);
  };

  const handleExamChange = (value: string | null) => {
    setValue("examId", value || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const selectedBatchTitle = useMemo(() => {
    if (!selectedBatchId) return "";
    const found = batches?.find(
      (b: any) => String(b._id) === String(selectedBatchId),
    );
    return found?.title || examBatchSearch;
  }, [selectedBatchId, batches, examBatchSearch]);

  const maxMcqMarks = selectedExam?.mcqFullMarks ?? 100;
  const maxWrittenMarks = selectedExam?.writtenFullMarks ?? 100;

  const hasActiveFilter =
    Boolean(studentSearchQuery.trim()) ||
    Boolean(startStudentId.trim()) ||
    Boolean(endStudentId.trim());

  const handleClearFilters = () => {
    setStudentSearchQuery("");
    setStartStudentId("");
    setEndStudentId("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-4 md:p-6 space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-primary/10 via-indigo-500/5 to-transparent p-5 rounded-xl border border-primary/15">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <BookOpen className="h-3 w-3" />
            Result Sheet Management
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            Batch-wise Exam Marks Entry
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Select a batch, filter by Student ID range, upload MCQ Excel, or
            enter marks directly.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClearForm}
          disabled={isSubmitting}
          className="h-9 gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900 self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Form
        </Button>
      </div>

      {/* Main Form Card */}
      <Card className="shadow-sm border-border/80 overflow-visible">
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Step 1, 2, 3 Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 rounded-xl bg-muted/30 border border-border/60">
              {/* 1. Live Searchable Batch Select */}
              <div className="space-y-1.5 relative" ref={batchDropdownRef}>
                <Label
                  htmlFor="batchSearch"
                  className="text-xs font-semibold flex items-center gap-1.5 text-foreground"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white font-bold">
                    1
                  </span>
                  Select Batch
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
                    className="h-9 text-xs pr-8 bg-background focus-visible:ring-indigo-500"
                    autoComplete="off"
                  />
                  <ChevronDown
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      isBatchDropdownOpen ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </div>

                {isBatchDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-auto py-1">
                    {isBatchLoading ? (
                      <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mr-2 text-indigo-600" />
                        Searching batches...
                      </div>
                    ) : (batches?.length ?? 0) === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No batches found
                      </div>
                    ) : (
                      batches?.map((batch: any) => {
                        const isSelected =
                          String(batch._id) === String(selectedBatchId);
                        return (
                          <button
                            key={batch._id}
                            type="button"
                            onClick={() =>
                              handleBatchSelect(String(batch._id), batch.title)
                            }
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors ${
                              isSelected
                                ? "bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold text-indigo-700 dark:text-indigo-300"
                                : "text-foreground"
                            }`}
                          >
                            <span>{batch.title}</span>
                            {isSelected && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {errors?.batchId && (
                  <p className="text-[11px] text-destructive font-medium">
                    {String(errors.batchId.message)}
                  </p>
                )}
              </div>

              {/* 2. Select Exam */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="examId"
                  className="text-xs font-semibold flex items-center gap-1.5 text-foreground"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] text-white font-bold">
                    2
                  </span>
                  Select Exam
                </Label>

                <Select
                  disabled={!selectedBatchId || isLoadingExams || isSubmitting}
                  onValueChange={handleExamChange}
                  value={selectedExamId || ""}
                >
                  <SelectTrigger
                    id="examId"
                    className="h-9 text-xs w-full bg-background focus:ring-violet-500"
                  >
                    <SelectValue
                      placeholder={
                        !selectedBatchId
                          ? "Select a batch first"
                          : isLoadingExams
                            ? "Loading exams..."
                            : "Choose Exam"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {(exams?.length ?? 0) === 0 ? (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        No exams available for this batch
                      </div>
                    ) : (
                      exams?.map((exam: any) => (
                        <SelectItem
                          key={exam._id}
                          value={String(exam._id)}
                          className="text-xs"
                        >
                          {exam?.title} (Full Marks: {exam?.fullMarks})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {errors?.examId && (
                  <p className="text-[11px] text-destructive font-medium">
                    {String(errors.examId.message)}
                  </p>
                )}
              </div>

              {/* 3. Upload Excel */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="excelFile"
                  className="text-xs font-semibold flex items-center gap-1.5 text-foreground"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white font-bold">
                    3
                  </span>
                  Upload MCQ Excel (.xlsx)
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
                    className="cursor-pointer pr-9 h-9 text-xs bg-background file:text-xs file:font-semibold file:text-emerald-700 dark:file:text-emerald-400"
                  />
                  <FileSpreadsheet className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Selected Exam Summary Banner */}
            {selectedExam && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Active Exam: <strong>{selectedExam?.title}</strong>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-white dark:bg-background text-foreground border text-[11px]"
                  >
                    Total: {selectedExam.fullMarks}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100/80 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 text-[11px]"
                  >
                    MCQ Max: {selectedExam.mcqFullMarks}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-violet-100/80 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border-violet-200 text-[11px]"
                  >
                    Written Max: {selectedExam?.writtenFullMarks}
                  </Badge>
                </div>
              </div>
            )}

            {/* =======================================================
                ALWAYS VISIBLE STUDENT MARKS TABLE & FILTER BAR
            ======================================================= */}
            <div className="space-y-3 pt-2">
              {/* Filter Bar: Title + ID Range + Quick Search */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/80 dark:bg-muted/20 p-3 rounded-xl border border-border/60">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Students Mark Sheet
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[11px] font-medium bg-primary/5 text-primary border-primary/20"
                  >
                    {selectedBatchId
                      ? `${allFieldsLength} Loaded`
                      : "No Batch Selected"}
                  </Badge>
                </div>

                {/* ID Range & Search Inputs */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Start Student ID */}
                  <div className="relative w-32 sm:w-36">
                    <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="From ID (1002)"
                      value={startStudentId}
                      onChange={(e) => setStartStudentId(e.target.value)}
                      disabled={!selectedBatchId}
                      className="pl-8 h-8 text-xs bg-background font-mono"
                    />
                  </div>

                  <span className="text-xs text-muted-foreground font-medium">
                    to
                  </span>

                  {/* End Student ID */}
                  <div className="relative w-32 sm:w-36">
                    <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="To ID (1024)"
                      value={endStudentId}
                      onChange={(e) => setEndStudentId(e.target.value)}
                      disabled={!selectedBatchId}
                      className="pl-8 h-8 text-xs bg-background font-mono"
                    />
                  </div>

                  {/* Quick Name / ID / Phone Search */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={
                        selectedBatchId
                          ? "Search Name, ID, or Phone..."
                          : "Select batch first..."
                      }
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      disabled={!selectedBatchId}
                      className="pl-9 pr-7 h-8 text-xs bg-background"
                    />
                    {studentSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setStudentSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground hover:text-foreground"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Persistent Table Container */}
              <div className="overflow-x-auto rounded-xl border border-border shadow-xs bg-card">
                <Table className="w-full text-left text-xs">
                  <TableHeader className="bg-slate-100/80 dark:bg-muted/70 uppercase text-[11px] font-semibold text-slate-600 dark:text-muted-foreground border-b">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[220px] py-3">
                        Student Info
                      </TableHead>
                      <TableHead className="w-[150px] py-3">
                        Dept / Source
                      </TableHead>
                      <TableHead className="w-[95px] py-3 text-center">
                        MCQ Ans
                      </TableHead>
                      <TableHead className="w-[95px] py-3 text-center">
                        MCQ Right
                      </TableHead>
                      <TableHead className="w-[95px] py-3 text-center">
                        MCQ Wrong
                      </TableHead>
                      <TableHead className="w-[115px] py-3 text-center bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300">
                        MCQ Marks
                        {selectedExam && (
                          <span className="block text-[10px] font-normal normal-case opacity-80">
                            (Max: {maxMcqMarks})
                          </span>
                        )}
                      </TableHead>
                      <TableHead className="w-[115px] py-3 text-center bg-violet-50/50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300">
                        Written Marks
                        {selectedExam && (
                          <span className="block text-[10px] font-normal normal-case opacity-80">
                            (Max: {maxWrittenMarks})
                          </span>
                        )}
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-border">
                    {/* CASE 1: No batch selected yet */}
                    {!selectedBatchId ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={7} className="h-44 text-center">
                          <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                            <div className="p-2.5 rounded-full bg-muted">
                              <Users className="h-5 w-5 text-muted-foreground/70" />
                            </div>
                            <p className="text-sm font-medium text-foreground">
                              No batch selected
                            </p>
                            <p className="text-xs max-w-xs">
                              Select a batch from Step 1 above to load students
                              into this table.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : isStudentLoading ? (
                      /* CASE 2: Fetching students from backend */
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={7} className="h-44 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-xs font-medium">Loading...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : students?.length > 0 ? (
                      /* CASE 3: Students available */
                      students?.map((student) => {
                        const idx = student._formIndex;

                        return (
                          <TableRow
                            key={student.id || student.studentId || idx}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            {/* Student Info */}
                            <TableCell className="p-2.5 align-middle">
                              <div className="min-w-[160px] space-y-0.5">
                                <p className="font-semibold text-foreground text-xs">
                                  {student.name}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-mono">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 font-semibold">
                                    {student.studentId}
                                  </span>
                                  {student.phone && (
                                    <span className="flex items-center gap-1 text-muted-foreground/80">
                                      <Phone className="h-2.5 w-2.5" />
                                      {student.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            {/* Dept / Batch / Source */}
                            <TableCell className="p-2.5 align-middle">
                              <div className="min-w-[110px]">
                                <p className="text-xs font-medium capitalize text-foreground/90">
                                  {student?.department || "N/A"}
                                  <span className="text-muted-foreground mx-1">
                                    •
                                  </span>
                                  {student?.batch || "N/A"}
                                </p>
                                <span className="inline-block px-1.5 py-0.5 text-[10px] bg-sky-50 text-sky-700 border border-sky-200/70 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800 rounded uppercase font-semibold mt-0.5">
                                  {student.source || "System"}
                                </span>
                              </div>
                            </TableCell>

                            {/* MCQ Answered */}
                            <TableCell className="p-2.5 align-middle text-center">
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                className="h-8 w-20 mx-auto text-center text-xs bg-background"
                                {...register(
                                  `studentsMarks.${idx}.mcqAnswered`,
                                  { valueAsNumber: true },
                                )}
                              />
                            </TableCell>

                            {/* MCQ Correct */}
                            <TableCell className="p-2.5 align-middle text-center">
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                className="h-8 w-20 mx-auto text-center text-xs bg-background text-emerald-700 dark:text-emerald-400 font-medium"
                                {...register(
                                  `studentsMarks.${idx}.mcqCorrect`,
                                  { valueAsNumber: true },
                                )}
                              />
                            </TableCell>

                            {/* MCQ Incorrect */}
                            <TableCell className="p-2.5 align-middle text-center">
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                className="h-8 w-20 mx-auto text-center text-xs bg-background text-rose-600 dark:text-rose-400 font-medium"
                                {...register(
                                  `studentsMarks.${idx}.mcqIncorrect`,
                                  { valueAsNumber: true },
                                )}
                              />
                            </TableCell>

                            {/* MCQ Marks */}
                            <TableCell className="p-2.5 align-middle text-center bg-indigo-50/20 dark:bg-indigo-950/10">
                              <Input
                                type="number"
                                min="0"
                                max={maxMcqMarks}
                                step="0.5"
                                placeholder={`0-${maxMcqMarks}`}
                                className="h-8 w-20 mx-auto text-center text-xs font-semibold bg-background border-indigo-200 dark:border-indigo-900 focus-visible:ring-indigo-500"
                                {...register(`studentsMarks.${idx}.mcqMarks`, {
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
                                })}
                              />
                            </TableCell>

                            {/* Written Marks */}
                            <TableCell className="p-2.5 align-middle text-center bg-violet-50/20 dark:bg-violet-950/10">
                              <Input
                                type="number"
                                min="0"
                                max={maxWrittenMarks}
                                step="0.5"
                                placeholder={`0-${maxWrittenMarks}`}
                                className="h-8 w-20 mx-auto text-center text-xs font-semibold bg-background border-violet-200 dark:border-violet-900 focus-visible:ring-violet-500"
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
                      /* CASE 4: Batch selected, but no matching students found */
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={7} className="h-44 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <div className="p-2.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                              <SearchX className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              Data not found
                            </p>
                            <p className="text-xs max-w-sm">
                              {hasActiveFilter
                                ? "No student matched your search or ID range filter."
                                : "No students are enrolled in this batch yet."}
                            </p>
                            {hasActiveFilter && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClearFilters}
                                className="mt-1 h-7 text-xs"
                              >
                                Clear Filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Footer Counter */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                  {selectedExam
                    ? "Enter marks carefully within the maximum limit."
                    : "Tip: Select an exam in Step 2 to enforce max mark limits."}
                </span>
                <span className="font-medium">
                  Showing {students.length} of {allFieldsLength} students
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 font-semibold shadow-sm"
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

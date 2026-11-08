import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  FileSpreadsheet,
  Search,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    fields,
    allFieldsLength,
    batches,
    exams,
    selectedExam,
    isBatchLoading,
    isLoadingExams,
    isSubmitting,
    studentSearchQuery,
    setStudentSearchQuery,
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

  /* =======================================================
     Student Search Filtering with Original Form Index
  ======================================================= */
  const filteredStudentsWithIndex = useMemo(() => {
    const query = studentSearchQuery.trim().toLowerCase();

    return fields
      .map((field, index) => ({
        ...field,
        _formIndex: index,
      }))
      .filter((student) => {
        if (!query) return true;
        const studentName = String(student.name ?? "").toLowerCase();
        const studentId = String(student.studentId ?? "").toLowerCase();
        return studentName.includes(query) || studentId.includes(query);
      });
  }, [fields, studentSearchQuery]);

  const handleBatchChange = (value: string) => {
    setValue("batchId", value, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("examId", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleExamChange = (value: string) => {
    setValue("examId", value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleStudentSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStudentSearchQuery(event.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto p-4"
    >
      <Card className="shadow-lg border-border">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              Result Sheet Management
            </p>

            <CardTitle className="text-xl">
              Batch-wise Exam Marks Entry
            </CardTitle>

            <CardDescription className="text-xs mt-1">
              Select batch, link exam, upload MCQ results via Excel or manually
              input marks.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearForm}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 text-xs text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Form
          </Button>
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Batch, Exam, Excel Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Select Batch */}
              <div className="space-y-2">
                <Label htmlFor="batchId">1. Select Batch</Label>

                <Select
                  disabled={isBatchLoading || isSubmitting}
                  onValueChange={handleBatchChange}
                  value={selectedBatchId || ""}
                >
                  <SelectTrigger id="batchId">
                    <SelectValue
                      placeholder={
                        isBatchLoading ? "Loading Batches..." : "Choose Batch"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {batches?.map((batch: any) => (
                      <SelectItem key={batch._id} value={batch.title}>
                        {batch.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.batchId && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.batchId.message}
                  </p>
                )}
              </div>

              {/* Select Exam */}
              <div className="space-y-2">
                <Label htmlFor="examId">2. Select Exam</Label>

                <Select
                  disabled={!selectedBatchId || isLoadingExams || isSubmitting}
                  onValueChange={handleExamChange}
                  value={selectedExamId || ""}
                >
                  <SelectTrigger id="examId">
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
                      <SelectItem key={exam._id} value={exam?._id}>
                        {exam?.title} (Full Marks: {exam?.fullMarks})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.examId && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.examId.message}
                  </p>
                )}
              </div>

              {/* Upload Excel */}
              <div className="space-y-2">
                <Label htmlFor="excelFile">3. Upload MCQ Excel File</Label>

                <div className="relative">
                  <Input
                    id="excelFile"
                    type="file"
                    accept=".xlsx,.xls"
                    disabled={
                      !selectedBatchId || allFieldsLength === 0 || isSubmitting
                    }
                    onChange={handleExcelUpload}
                    className="cursor-pointer pr-10"
                  />

                  <FileSpreadsheet className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Selected Exam Details Indicator */}
            {selectedExam && (
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg border text-xs text-accent-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                <span>
                  Selected Exam: <strong>{selectedExam?.title}</strong>
                  {" | "}
                  Full Marks: <strong>{selectedExam.fullMarks}</strong> {" | "}
                  MCQ Marks: <strong>{selectedExam.mcqFullMarks}</strong>{" "}
                  {" | "}
                  Written Marks:{" "}
                  <strong>{selectedExam?.writtenFullMarks}</strong>
                </span>
              </div>
            )}

            {/* Student Marks Table (Shadcn UI Table) */}
            {allFieldsLength > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Students Mark Entry ({allFieldsLength} Students Enrolled)
                  </h3>

                  {/* Student Search */}
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />

                    <Input
                      placeholder="Search student by Name or ID..."
                      value={studentSearchQuery}
                      onChange={handleStudentSearch}
                      className="pl-9 h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Shadcn Table Wrapper */}
                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table className="w-full text-left text-xs">
                    <TableHeader className="bg-muted/80 uppercase font-semibold text-muted-foreground">
                      <TableRow>
                        <TableHead className="w-[180px]">
                          Student Info
                        </TableHead>
                        <TableHead className="w-[120px]">
                          Dept / Source
                        </TableHead>
                        <TableHead className="w-[100px]">MCQ Ans</TableHead>
                        <TableHead className="w-[100px]">MCQ Right</TableHead>
                        <TableHead className="w-[100px]">MCQ Wrong</TableHead>
                        <TableHead className="w-[110px]">MCQ Marks</TableHead>
                        <TableHead className="w-[110px]">
                          Written Marks
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-border bg-card">
                      {filteredStudentsWithIndex?.length > 0 ? (
                        filteredStudentsWithIndex?.map((student) => {
                          const idx = student._formIndex;

                          return (
                            <TableRow
                              key={student.id}
                              className="hover:bg-muted/40 transition-colors"
                            >
                              {/* Student Info */}
                              <TableCell className="p-2.5 align-middle">
                                <div className="min-w-[140px]">
                                  <p className="font-semibold text-foreground">
                                    {student.name}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground font-mono">
                                    ID: {student.studentId}
                                  </p>
                                </div>
                              </TableCell>

                              {/* Dept / Source */}
                              <TableCell className="p-2.5 align-middle">
                                <div className="min-w-[100px]">
                                  <p className="text-xs">
                                    {student.department || "N/A"}
                                  </p>
                                  <span className="inline-block px-1.5 py-0.5 text-[10px] bg-accent rounded uppercase font-bold text-accent-foreground">
                                    {student.source}
                                  </span>
                                </div>
                              </TableCell>

                              {/* MCQ Answered */}
                              <TableCell className="p-2.5 align-middle">
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  className="h-8 w-20 text-xs"
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
                                  className="h-8 w-20 text-xs text-emerald-600 font-medium"
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
                                  className="h-8 w-20 text-xs text-rose-600 font-medium"
                                  {...register(
                                    `studentsMarks.${idx}.mcqIncorrect`,
                                    { valueAsNumber: true },
                                  )}
                                />
                              </TableCell>

                              {/* MCQ Marks */}
                              <TableCell className="p-2.5 align-middle">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  className="h-8 w-24 text-xs font-semibold bg-muted"
                                  {...register(
                                    `studentsMarks.${idx}.mcqMarks`,
                                    { valueAsNumber: true },
                                  )}
                                />
                              </TableCell>

                              {/* Written Marks */}
                              <TableCell className="p-2.5 align-middle">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  placeholder="0"
                                  className="h-8 w-24 text-xs border-primary/50"
                                  {...register(
                                    `studentsMarks.${idx}.writtenMarks`,
                                    { valueAsNumber: true },
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

                {/* Counter */}
                <p className="text-xs text-muted-foreground text-right">
                  Showing {filteredStudentsWithIndex.length} of{" "}
                  {allFieldsLength} students
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

import { motion } from "framer-motion";
import type { FC } from "react";
import { Controller } from "react-hook-form";

import {
  flexRender,
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import { Calendar, Search, Edit3, Trash2, X } from "lucide-react";

import type { ExamRecord, ExamType } from "../types/ExamManagement.types";

import { useExamManagement } from "../hooks/useExamManagement";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface ExamManagementProps {
  batches: {
    id: string;
    name: string;
  }[];
  onNavigate: (tab: string, id?: string) => void;
}

/**

 *
 * v9 requires two generic arguments:
 * 1. Features configuration type
 * 2. Row data type
 */
const features = tableFeatures({});

const columnHelper = createColumnHelper<typeof features, ExamRecord>();

export const ExamManagement: FC<ExamManagementProps> = ({
  batches,
  onNavigate,
}) => {
  const {
    form,
    exams,
    allExamsCount,
    batches: filteredBatches,
    editingExamId,
    examStructureLocked,
    examBatchSearch,
    setExamBatchSearch,
    examDateFilter,
    setExamDateFilter,
    saving,
    onSubmit,
    handleEditExam,
    handleDeleteExam,
    handleStatus,
    cancelEdit,
  } = useExamManagement(batches);

  const { control, handleSubmit, watch, setValue } = form;

  const examType = watch("examType");
  const fullMarks = watch("fullMarks") ?? 0;
  const mcqFullMarks = watch("mcqFullMarks") ?? 0;
  const batchIds = watch("batchIds") ?? [];

  const isStructureLocked = examStructureLocked && Boolean(editingExamId);

  /**
   * Calculate written marks according to exam type.
   */
  const writtenMarks =
    examType === "mcq"
      ? 0
      : examType === "combined"
        ? Math.max(0, fullMarks - mcqFullMarks)
        : fullMarks;

  /**
   * Get batch names from batch IDs.
   */
  const getBatchNames = (ids: string[]): string => {
    const names = ids
      .map((id) => batches.find((batch) => batch.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    return names.length > 0 ? names.join(", ") : "No batch selected";
  };

  /**
   * TanStack Table v9 columns.
   */
  const columns = columnHelper.columns([
    // Exam details
    columnHelper.accessor("title", {
      header: "EXAM DETAILS",

      cell: (info) => {
        const row = info.row.original;

        return (
          <div className="space-y-1">
            <strong className="block font-semibold text-slate-900">
              {row.title}
            </strong>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{row.subject}</span>
              <span>·</span>
              <span>{row.date}</span>
              <span>·</span>
              <span>{row.fullMarks} marks</span>
            </div>
          </div>
        );
      },
    }),

    // Batch
    columnHelper.accessor("batchIds", {
      header: "BATCH",

      cell: (info) => {
        const row = info.row.original;

        const ids =
          row.batchIds.length > 0
            ? row.batchIds
            : row.batchId
              ? [row.batchId]
              : [];

        return (
          <span className="text-sm font-medium text-slate-700">
            {getBatchNames(ids)}
          </span>
        );
      },
    }),

    // Status
    columnHelper.accessor("status", {
      header: "STATUS",

      cell: (info) => {
        const status = info.getValue();

        return (
          <Badge
            variant={status === "published" ? "default" : "secondary"}
            className={
              status === "published"
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 text-slate-700"
            }
          >
            {status.toUpperCase()}
          </Badge>
        );
      },
    }),

    // Actions
    columnHelper.display({
      id: "actions",
      header: "ACTION",

      cell: (info) => {
        const row = info.row.original;

        return (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onNavigate("marks", row.id)}
            >
              Marks
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onNavigate("results", row.id)}
            >
              Result
            </Button>

            <Button
              type="button"
              size="sm"
              variant={row.status === "published" ? "destructive" : "default"}
              disabled={saving}
              onClick={() => handleStatus(row)}
            >
              {row.status === "published" ? "Unpublish" : "Publish"}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={saving || row.status === "published"}
              onClick={() => handleEditExam(row)}
            >
              <Edit3 className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>

            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={saving}
              onClick={() => handleDeleteExam(row)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    }),
  ]);

  /**
   * TanStack Table v9
   *
   * Core row model is automatically included.
   * No getCoreRowModel() is required.
   */
  const table = useTable({
    features,
    data: exams,
    columns,
  });

  /**
   * Handle exam type changes safely.
   */
  const handleExamTypeChange = (
    value: string | null,
    onChange: (value: ExamType) => void,
  ) => {
    if (value !== "written" && value !== "mcq" && value !== "combined") {
      return;
    }

    onChange(value);
    setValue("mcqFullMarks", 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Page Heading */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          EXAM SETUP
        </span>

        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
          Exam Management
        </h1>

        <p className="text-sm text-slate-500">
          ব্যাচ, বিষয়, পূর্ণমান নির্ধারণ করে নতুন পরীক্ষা তৈরি করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Form Section */}
        <Card className="border-slate-200 shadow-sm lg:col-span-4">
          <CardHeader className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold tracking-wider text-slate-400">
              NEW EXAM
            </span>

            <CardTitle className="text-lg font-bold text-slate-800">
              {editingExamId ? "Edit Exam" : "Create Exam"}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Exam Name */}
              <div className="space-y-1.5">
                <Label>Exam Name</Label>

                <Controller
                  name="title"
                  control={control}
                  rules={{
                    required: "Exam name is required",
                    validate: (value) =>
                      value.trim().length > 0 || "Exam name cannot be empty",
                  }}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        placeholder="e.g. Weekly Model Test - 03"
                        {...field}
                      />

                      {fieldState.error && (
                        <p className="mt-1 text-xs text-red-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label>Subject</Label>

                <Controller
                  name="subject"
                  control={control}
                  rules={{
                    required: "Subject is required",
                    validate: (value) =>
                      value.trim().length > 0 || "Subject cannot be empty",
                  }}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input placeholder="e.g. Mathematics" {...field} />

                      {fieldState.error && (
                        <p className="mt-1 text-xs text-red-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Batch Selection */}
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-bold">Batch — Search & Select</Label>

                  <div className="space-x-2">
                    <button
                      type="button"
                      className="text-xs font-semibold text-blue-600 hover:underline"
                      disabled={isStructureLocked}
                      onClick={() =>
                        setValue(
                          "batchIds",
                          batches.map((batch) => batch.id),
                          { shouldDirty: true },
                        )
                      }
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      className="text-xs font-semibold text-slate-500 hover:underline"
                      disabled={isStructureLocked}
                      onClick={() =>
                        setValue("batchIds", [], {
                          shouldDirty: true,
                        })
                      }
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                  <Input
                    placeholder="Search Batch..."
                    className="bg-white pl-9"
                    value={examBatchSearch}
                    onChange={(event) => setExamBatchSearch(event.target.value)}
                    disabled={isStructureLocked}
                  />
                </div>

                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
                  {filteredBatches.length > 0 ? (
                    filteredBatches.map((batch) => {
                      const isChecked = batchIds.includes(batch.id);

                      return (
                        <label
                          key={batch.id}
                          className="flex cursor-pointer items-center gap-2.5 rounded p-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Checkbox
                            checked={isChecked}
                            disabled={isStructureLocked}
                            onCheckedChange={(checked) => {
                              const updated =
                                checked === true
                                  ? [...batchIds, batch.id]
                                  : batchIds.filter((id) => id !== batch.id);

                              setValue("batchIds", [...new Set(updated)], {
                                shouldDirty: true,
                              });
                            }}
                          />

                          {batch.name}
                        </label>
                      );
                    })
                  ) : (
                    <p className="py-4 text-center text-xs text-slate-400">
                      No batches found.
                    </p>
                  )}
                </div>

                <div className="rounded border border-blue-100 bg-blue-50 p-2 text-xs font-medium text-blue-700">
                  Selected Batches: {batchIds.length}
                  <p className="mt-1 font-normal text-slate-600">
                    {getBatchNames(batchIds)}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label>Exam Date</Label>

                <Controller
                  name="date"
                  control={control}
                  rules={{
                    required: "Exam date is required",
                  }}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input type="date" {...field} />

                      {fieldState.error && (
                        <p className="mt-1 text-xs text-red-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Full Marks */}
              <div className="space-y-1.5">
                <Label>Full Marks</Label>

                <Controller
                  name="fullMarks"
                  control={control}
                  rules={{
                    required: "Full marks is required",
                    min: {
                      value: 1,
                      message: "Full marks must be at least 1",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        type="number"
                        min={1}
                        disabled={isStructureLocked}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? 0
                              : Number(event.target.value),
                          )
                        }
                      />

                      {fieldState.error && (
                        <p className="mt-1 text-xs text-red-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Exam Type */}
              <div className="space-y-1.5">
                <Label>Exam Type</Label>

                <Controller
                  name="examType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isStructureLocked}
                      value={field.value}
                      onValueChange={(value) =>
                        handleExamTypeChange(value, field.onChange)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="written">Only Written</SelectItem>

                        <SelectItem value="mcq">Only MCQ</SelectItem>

                        <SelectItem value="combined">MCQ + Written</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* MCQ Full Marks */}
              {(examType === "combined" || examType === "mcq") && (
                <div className="space-y-1.5">
                  <Label>
                    {examType === "mcq" ? "MCQ Full Marks" : "MCQ Full Marks"}
                  </Label>

                  {examType === "mcq" ? (
                    <Input type="number" value={fullMarks} disabled />
                  ) : (
                    <Controller
                      name="mcqFullMarks"
                      control={control}
                      rules={{
                        min: {
                          value: 0,
                          message: "MCQ marks cannot be negative",
                        },
                        validate: (value) =>
                          value <= fullMarks ||
                          "MCQ marks cannot exceed full marks",
                      }}
                      render={({ field, fieldState }) => (
                        <div>
                          <Input
                            type="number"
                            min={0}
                            max={fullMarks}
                            disabled={isStructureLocked}
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            value={field.value}
                            onChange={(event) =>
                              field.onChange(
                                event.target.value === ""
                                  ? 0
                                  : Number(event.target.value),
                              )
                            }
                          />

                          {fieldState.error && (
                            <p className="mt-1 text-xs text-red-500">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  )}
                </div>
              )}

              {/* Auto Distribution Summary */}
              <div className="space-y-1 rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs font-semibold text-blue-900">
                <div>
                  MCQ Full Marks:{" "}
                  {examType === "mcq"
                    ? fullMarks
                    : examType === "combined"
                      ? mcqFullMarks
                      : 0}
                </div>

                <div>Written Full Marks: {writtenMarks}</div>
              </div>

              {/* Submit / Cancel */}
              <div className="space-y-2 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 font-bold text-white hover:bg-blue-700"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingExamId
                      ? "✓ Save Changes"
                      : "+ Create Exam"}
                </Button>

                {editingExamId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Table Section */}
        <Card className="border-slate-200 shadow-sm lg:col-span-8">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-400">
                ALL RECORDS
              </span>

              <CardTitle className="mt-0.5 flex items-center gap-2 text-lg font-bold text-slate-800">
                Exam List
                <Badge variant="secondary">{allExamsCount}</Badge>
              </CardTitle>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
              <Calendar className="ml-1 h-4 w-4 text-slate-500" />

              <Input
                type="date"
                className="h-8 bg-white text-xs"
                value={examDateFilter}
                onChange={(event) => setExamDateFilter(event.target.value)}
              />

              {examDateFilter && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setExamDateFilter("")}
                >
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-md">
              <Table>
                <TableHeader className="bg-slate-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getAllCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-40 text-center text-slate-500"
                      >
                        কোনো পরীক্ষা পাওয়া যায়নি।
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ExamManagement;

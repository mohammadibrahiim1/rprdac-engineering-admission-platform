import type { FC } from "react";
import { Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import {
  Search,
  X,
  Plus,
  CheckCircle2,
  Calendar,
  BookOpen,
  GraduationCap,
  Layers,
  ShieldCheck,
  FileText,
  Sparkles,
} from "lucide-react";

import type { ExamBatch, ExamSubmitHandler } from "../types/Exam.types";
import { useExamForm } from "../hooks/useExamForm";

// Shadcn UI Components
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PostExamFormProps {
  batches?: ExamBatch[];
  onSubmit: ExamSubmitHandler;
}

interface RootState {
  auth?: {
    user?: {
      name?: string;
      userName?: string;
      fullName?: string;
      userType?: string;
      role?: string;
    };
  };
}

export const PostExamForm: FC<PostExamFormProps> = ({
  onSubmit: _onSubmit,
}) => {
  const {
    form,
    batches: fetchedBatches,
    filteredBatches,
    editingExamId,
    examBatchSearch,
    setExamBatchSearch,
    saving,
    cancelEdit,
    isBatchLoading,
    examType,
    fullMarks,
    mcqFullMarks,
    batchIds,
    isStructureLocked,
    isAllSelected,
    writtenFullMarksInput,
    handleExamTypeChange,
    handleBatchCheckboxChange,
    selectAllBatches,
    clearAllBatches,
    getBatchNames,
    handleFormSubmit,
    sessionOptions,
  } = useExamForm();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  // Retrieve logged-in user info from Redux store securely
  const currentUser = useSelector((state: RootState) => state?.auth?.user);
  const loggedInName =
    currentUser?.userName ||
    currentUser?.fullName ||
    currentUser?.name ||
    "Exam Coordinator";
  const loggedInUserType =
    currentUser?.userType || currentUser?.role || "Administrator";

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-12">
      {/* Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-30 border-b border-blue-100/80 bg-white/80 backdrop-blur-xl">
        <div className="flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto">
            <Breadcrumb />
          </div>

          {/* Logged-In User Profile Pill */}
          <div className="flex shrink-0 items-center gap-3 rounded-full border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 py-1 pl-1.5 pr-4 shadow-2xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
              {loggedInName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-none text-slate-800 capitalize">
                {loggedInName}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-indigo-600 capitalize">
                <ShieldCheck className="h-3 w-3" />
                {loggedInUserType}
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-800 sm:hidden capitalize">
              {loggedInName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Page Hero Banner */}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-blue-100/80 bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/40 p-6 shadow-xs sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {editingExamId
                    ? "Edit Exam Configuration"
                    : "Create New Exam"}
                </h1>
                <Badge
                  variant="secondary"
                  className="hidden border-blue-200 bg-blue-100 text-[10px] font-semibold text-blue-700 sm:inline-flex"
                >
                  Active System
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Configure exam details, assign target batches, and set up
                precise marks distribution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-indigo-100 bg-white/90 px-3.5 py-2 text-xs font-medium text-slate-600 shadow-2xs sm:self-auto">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span>Automated split calculations active</span>
          </div>
        </div>

        {/* Form Card Container */}
        <Card className="border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xs">
          <CardHeader className="border-b border-slate-100 pb-5">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              EXAM MANAGEMENT PORTAL
            </span>
            <CardTitle className="text-lg font-bold text-slate-900">
              {editingExamId ? "Modify Exam Structure" : "New Assessment Setup"}
            </CardTitle>
            <CardDescription className="text-xs">
              Fill in the parameters below to publish or update exam records.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              {/* Responsive 2-Column Grid */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* ================= LEFT COLUMN: General Details & Batch Selection ================= */}
                <div className="space-y-6 lg:col-span-6">
                  {/* Exam Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Exam Name
                    </Label>
                    <Controller
                      name="title"
                      control={control}
                      rules={{
                        required: "Exam name is required",
                        validate: (value) =>
                          value.trim().length > 0 ||
                          "Exam name cannot be empty",
                      }}
                      render={({ field }) => (
                        <div>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="e.g. Weekly Model Test - 03"
                            disabled={saving}
                            className="h-10 border-slate-200 bg-slate-50/50 text-sm focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-blue-200"
                          />
                          {errors.title && (
                            <p className="mt-1 text-xs font-medium text-red-500">
                              {errors.title.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Subject
                    </Label>
                    <Controller
                      name="subject"
                      control={control}
                      rules={{
                        required: "Subject is required",
                        validate: (value) =>
                          value.trim().length > 0 || "Subject cannot be empty",
                      }}
                      render={({ field }) => (
                        <div>
                          <div className="relative">
                            <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="e.g. Higher Mathematics"
                              disabled={saving}
                              className="h-10 border-slate-200 bg-slate-50/50 pl-9 text-sm focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-blue-200"
                            />
                          </div>
                          {errors.subject && (
                            <p className="mt-1 text-xs font-medium text-red-500">
                              {errors.subject.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Academic Session & Exam Date Row */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Academic Session */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Academic Session
                      </Label>
                      <Controller
                        name="session"
                        control={control}
                        rules={{ required: "Session is required" }}
                        render={({ field }) => (
                          <div>
                            <Select
                              value={field.value ?? ""}
                              onValueChange={field.onChange}
                              disabled={saving}
                            >
                              <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50 text-sm">
                                <SelectValue placeholder="Select session" />
                              </SelectTrigger>
                              <SelectContent>
                                {sessionOptions?.map((session) => (
                                  <SelectItem key={session} value={session}>
                                    {session}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.session && (
                              <p className="mt-1 text-xs font-medium text-red-500">
                                {errors.session.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* Exam Date */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Exam Date
                      </Label>
                      <Controller
                        name="date"
                        control={control}
                        rules={{ required: "Exam date is required" }}
                        render={({ field }) => (
                          <div>
                            <div className="relative">
                              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <Input
                                type="date"
                                {...field}
                                disabled={saving}
                                className="h-10 border-slate-200 bg-slate-50/50 pl-9 text-sm"
                              />
                            </div>
                            {errors.date && (
                              <p className="mt-1 text-xs font-medium text-red-500">
                                {errors.date.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Batch Search & Selection Block */}
                  <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        Target Batches
                      </Label>

                      <div className="flex gap-3 text-xs">
                        <button
                          type="button"
                          disabled={isStructureLocked || saving}
                          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                          onClick={selectAllBatches}
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          disabled={isStructureLocked || saving}
                          className="font-semibold text-slate-500 hover:text-slate-700 hover:underline disabled:opacity-50"
                          onClick={clearAllBatches}
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search batch by name..."
                        className="h-10 bg-white pl-9 text-sm border-slate-200 focus-visible:border-blue-400 focus-visible:ring-blue-200"
                        value={examBatchSearch}
                        onChange={(e) => setExamBatchSearch(e.target.value)}
                        disabled={isStructureLocked || saving}
                      />
                    </div>

                    <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-2xs">
                      {isBatchLoading ? (
                        <p className="py-6 text-center text-xs text-slate-400">
                          Loading batches...
                        </p>
                      ) : filteredBatches?.length > 0 ? (
                        filteredBatches.map((batch) => (
                          <label
                            key={batch._id}
                            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-slate-50"
                          >
                            <Checkbox
                              checked={
                                isAllSelected || batchIds.includes(batch._id)
                              }
                              disabled={isStructureLocked || saving}
                              onCheckedChange={(checked) =>
                                handleBatchCheckboxChange(batch._id, checked)
                              }
                            />
                            <span className="font-medium text-slate-700">
                              {batch.title}
                            </span>
                          </label>
                        ))
                      ) : (
                        <p className="py-6 text-center text-xs text-slate-400">
                          No batches found.
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-3 text-xs text-blue-900">
                      <div className="font-semibold flex items-center justify-between">
                        <span>Selected Batches Count:</span>
                        <Badge className="bg-blue-600 text-white font-mono text-[10px]">
                          {isAllSelected
                            ? fetchedBatches.length
                            : batchIds.length}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-blue-700/80 line-clamp-2">
                        {getBatchNames(batchIds)}
                      </p>
                    </div>

                    {batchIds.length === 0 && !isAllSelected && (
                      <p className="text-xs font-medium text-red-500">
                        * Please select at least one target batch.
                      </p>
                    )}
                  </div>
                </div>

                {/* ================= RIGHT COLUMN: Marks & Submission Actions ================= */}
                <div className="flex flex-col justify-between space-y-6 lg:col-span-6">
                  <div className="space-y-5">
                    {/* Exam Type Selection */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Exam Type Structure
                      </Label>
                      <Controller
                        name="examType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            disabled={isStructureLocked || saving}
                            value={field.value ?? ""}
                            onValueChange={(value) =>
                              handleExamTypeChange(value, field.onChange)
                            }
                          >
                            <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50 text-sm">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="written">
                                Only Written
                              </SelectItem>
                              <SelectItem value="mcq">Only MCQ</SelectItem>
                              <SelectItem value="combined">
                                MCQ + Written
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Full Marks */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Full Marks
                      </Label>
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
                        render={({ field }) => (
                          <div>
                            <Input
                              type="number"
                              min={1}
                              value={field.value ?? 100}
                              disabled={isStructureLocked || saving}
                              className="h-10 border-slate-200 bg-slate-50/50 text-sm font-semibold"
                              onChange={(e) => {
                                const val =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                field.onChange(val);

                                // Auto re-calculate marks distribution
                                if (examType === "written") {
                                  setValue("writtenFullMarks", val, {
                                    shouldDirty: true,
                                  });
                                  setValue("mcqFullMarks", 0, {
                                    shouldDirty: true,
                                  });
                                } else if (examType === "mcq") {
                                  setValue("mcqFullMarks", val, {
                                    shouldDirty: true,
                                  });
                                  setValue("writtenFullMarks", 0, {
                                    shouldDirty: true,
                                  });
                                } else if (examType === "combined") {
                                  const half = Math.floor(val / 2);
                                  setValue("mcqFullMarks", half, {
                                    shouldDirty: true,
                                  });
                                  setValue("writtenFullMarks", val - half, {
                                    shouldDirty: true,
                                  });
                                }
                              }}
                            />
                            {errors.fullMarks && (
                              <p className="mt-1 text-xs font-medium text-red-500">
                                {errors.fullMarks.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* MCQ Full Marks */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                        <span>MCQ Full Marks</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          {examType === "written"
                            ? "(Auto Calculated)"
                            : examType === "combined"
                              ? "(Editable)"
                              : ""}
                        </span>
                      </Label>
                      <Controller
                        name="mcqFullMarks"
                        control={control}
                        rules={{
                          min: {
                            value: 0,
                            message: "MCQ marks cannot be negative",
                          },
                          validate: (value) =>
                            (value ?? 0) <= fullMarks ||
                            `MCQ marks cannot exceed full marks (${fullMarks})`,
                        }}
                        render={({ field }) => (
                          <div>
                            <Input
                              type="number"
                              min={0}
                              max={fullMarks}
                              value={field.value ?? 0}
                              disabled={
                                isStructureLocked ||
                                saving ||
                                examType === "written"
                              }
                              className={`h-10 text-sm ${
                                examType === "written"
                                  ? "bg-slate-100 font-semibold text-slate-500"
                                  : "border-slate-200 bg-slate-50/50"
                              }`}
                              onChange={(e) => {
                                const mcqVal =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                if (mcqVal <= fullMarks) {
                                  field.onChange(mcqVal);
                                  setValue(
                                    "writtenFullMarks",
                                    Math.max(0, fullMarks - mcqVal),
                                    {
                                      shouldDirty: true,
                                    },
                                  );
                                }
                              }}
                            />
                            {errors.mcqFullMarks && (
                              <p className="mt-1 text-xs font-medium text-red-500">
                                {errors.mcqFullMarks.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* Written Full Marks */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                        <span>Written Full Marks</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          {examType === "mcq"
                            ? "(Auto Calculated)"
                            : examType === "combined"
                              ? "(Editable)"
                              : ""}
                        </span>
                      </Label>
                      <Controller
                        name="writtenFullMarks"
                        control={control}
                        rules={{
                          min: {
                            value: 0,
                            message: "Written marks cannot be negative",
                          },
                          validate: (value) =>
                            (value ?? 0) <= fullMarks ||
                            `Written marks cannot exceed full marks (${fullMarks})`,
                        }}
                        render={({ field }) => (
                          <div>
                            <Input
                              type="number"
                              min={0}
                              max={fullMarks}
                              value={field.value ?? 0}
                              disabled={
                                isStructureLocked ||
                                saving ||
                                examType === "mcq"
                              }
                              className={`h-10 text-sm ${
                                examType === "mcq"
                                  ? "bg-slate-100 font-semibold text-slate-500"
                                  : "border-slate-200 bg-slate-50/50"
                              }`}
                              onChange={(e) => {
                                const writtenVal =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                if (writtenVal <= fullMarks) {
                                  field.onChange(writtenVal);
                                  setValue(
                                    "mcqFullMarks",
                                    Math.max(0, fullMarks - writtenVal),
                                    {
                                      shouldDirty: true,
                                    },
                                  );
                                }
                              }}
                            />
                            {errors.writtenFullMarks && (
                              <p className="mt-1 text-xs font-medium text-red-500">
                                {errors.writtenFullMarks.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* Marks Breakdown Summary Card */}
                    <div className="space-y-2 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-blue-50/50 p-4 text-xs font-medium text-indigo-950 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-2">
                        <Layers className="h-4 w-4 text-indigo-600" />
                        <span>Marks Distribution Breakdown</span>
                      </div>
                      <div className="flex justify-between border-b border-indigo-100/60 pb-1.5">
                        <span className="text-slate-600">MCQ Marks:</span>
                        <span className="font-mono font-bold text-indigo-900">
                          {mcqFullMarks}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-indigo-100/60 pb-1.5">
                        <span className="text-slate-600">Written Marks:</span>
                        <span className="font-mono font-bold text-indigo-900">
                          {writtenFullMarksInput}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 font-bold text-sm text-indigo-900">
                        <span>Total Full Marks:</span>
                        <span className="font-mono">{fullMarks}</span>
                      </div>
                    </div>
                  </div>

                  {/* Submission & Cancel Actions */}
                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Saving Changes...
                        </span>
                      ) : editingExamId ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Save Exam Changes
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Create & Publish Exam
                        </span>
                      )}
                    </Button>

                    {editingExamId && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

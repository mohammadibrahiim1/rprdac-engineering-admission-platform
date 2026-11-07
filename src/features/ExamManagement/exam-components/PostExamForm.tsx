import type { FC } from "react";
import { Controller } from "react-hook-form";
import { Search, X } from "lucide-react";

import type {
  ExamBatch,
  ExamSubmitHandler,
} from "../types/ExamManagement.types";

import { useExamForm } from "../hooks/useExamForm";

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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface PostExamFormProps {
  batches?: ExamBatch[];
  onSubmit: ExamSubmitHandler;
}

export const PostExamForm: FC<PostExamFormProps> = ({ onSubmit }) => {
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

  return (
    <div className="max-w-5xl space-y-5 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {editingExamId ? "Edit Exam Configuration" : "Create New Exam"}
        </h1>
        <p className="text-sm text-slate-500">
          Configure exam details, assign target batches, and set up marks
          distribution.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <span className="text-xs font-bold tracking-wider text-slate-400">
            EXAM MANAGEMENT
          </span>
          <CardTitle className="text-lg font-bold text-slate-800">
            {editingExamId ? "Edit Exam" : "Create Exam"}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Responsive 2-Column Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* ================= LEFT COLUMN ================= */}
              <div className="space-y-4">
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
                    render={({ field }) => (
                      <div>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g. Weekly Model Test - 03"
                          disabled={saving}
                        />
                        {errors.title && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.title.message}
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
                    render={({ field }) => (
                      <div>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g. Mathematics"
                          disabled={saving}
                        />
                        {errors.subject && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.subject.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Academic Session */}
                <div className="space-y-1.5">
                  <Label>Academic Session</Label>
                  <Controller
                    name="session"
                    control={control}
                    rules={{ required: "Academic session is required" }}
                    render={({ field }) => (
                      <div>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                          disabled={saving}
                        >
                          <SelectTrigger>
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
                          <p className="text-xs text-red-500 mt-1">
                            {errors.session.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Exam Date */}
                <div className="space-y-1.5">
                  <Label>Exam Date</Label>
                  <Controller
                    name="date"
                    control={control}
                    rules={{ required: "Exam date is required" }}
                    render={({ field }) => (
                      <div>
                        <Input type="date" {...field} disabled={saving} />
                        {errors.date && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.date.message}
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

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isStructureLocked || saving}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                        onClick={selectAllBatches}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        disabled={isStructureLocked || saving}
                        className="text-xs font-semibold text-slate-500 hover:underline"
                        onClick={clearAllBatches}
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
                      onChange={(e) => setExamBatchSearch(e.target.value)}
                      disabled={isStructureLocked || saving}
                    />
                  </div>

                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border bg-white p-2">
                    {isBatchLoading ? (
                      <p className="py-4 text-center text-xs text-slate-400">
                        Please wait...
                      </p>
                    ) : filteredBatches?.length > 0 ? (
                      filteredBatches.map((batch) => (
                        <label
                          key={batch._id}
                          className="flex cursor-pointer items-center gap-2.5 rounded p-1.5 text-sm hover:bg-slate-50"
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
                          {batch.title}
                        </label>
                      ))
                    ) : (
                      <p className="py-4 text-center text-xs text-slate-400">
                        No batches found.
                      </p>
                    )}
                  </div>

                  <div className="rounded border border-blue-100 bg-blue-50 p-2 text-xs font-medium text-blue-700">
                    Selected Batches:{" "}
                    {isAllSelected ? fetchedBatches.length : batchIds.length}
                    <p className="mt-1 font-normal text-slate-600">
                      {getBatchNames(batchIds)}
                    </p>
                  </div>

                  {batchIds.length === 0 && !isAllSelected && (
                    <p className="text-xs text-red-500">
                      Please select at least one batch.
                    </p>
                  )}
                </div>
              </div>

              {/* ================= RIGHT COLUMN ================= */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Exam Type */}
                  <div className="space-y-1.5">
                    <Label>Exam Type</Label>
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
                          <SelectTrigger>
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
                      render={({ field }) => (
                        <div>
                          <Input
                            type="number"
                            min={1}
                            value={field.value ?? 100}
                            disabled={isStructureLocked || saving}
                            onChange={(e) => {
                              const val =
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value);
                              field.onChange(val);

                              // Re-calculate active fields based on new full marks
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
                            <p className="mt-1 text-xs text-red-500">
                              {errors.fullMarks.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* MCQ Full Marks */}
                  <div className="space-y-1.5">
                    <Label>
                      MCQ Full Marks{" "}
                      {examType === "written"
                        ? "(Auto Calculated)"
                        : examType === "combined"
                          ? "(Editable)"
                          : ""}
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
                            // Disabled if Only Written is selected
                            disabled={
                              isStructureLocked ||
                              saving ||
                              examType === "written"
                            }
                            className={
                              examType === "written"
                                ? "bg-slate-100 font-semibold text-slate-700"
                                : ""
                            }
                            onChange={(e) => {
                              const mcqVal =
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value);
                              if (mcqVal <= fullMarks) {
                                field.onChange(mcqVal);
                                // Auto calculate opposite field (Written)
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
                            <p className="mt-1 text-xs text-red-500">
                              {errors.mcqFullMarks.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Written Full Marks */}
                  <div className="space-y-1.5">
                    <Label>
                      Written Full Marks{" "}
                      {examType === "mcq"
                        ? "(Auto Calculated)"
                        : examType === "combined"
                          ? "(Editable)"
                          : ""}
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
                            // Disabled if Only MCQ is selected
                            disabled={
                              isStructureLocked || saving || examType === "mcq"
                            }
                            className={
                              examType === "mcq"
                                ? "bg-slate-100 font-semibold text-slate-700"
                                : ""
                            }
                            onChange={(e) => {
                              const writtenVal =
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value);
                              if (writtenVal <= fullMarks) {
                                field.onChange(writtenVal);
                                // Auto calculate opposite field (MCQ)
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
                            <p className="mt-1 text-xs text-red-500">
                              {errors.writtenFullMarks.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Marks Distribution Summary */}
                  <div className="space-y-1 rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs font-semibold text-blue-900">
                    <div>MCQ Full Marks: {mcqFullMarks}</div>
                    <div>Written Full Marks: {writtenFullMarksInput}</div>
                    <div className="mt-1 border-t border-blue-200 pt-1 font-bold">
                      Total Full Marks: {fullMarks}
                    </div>
                  </div>
                </div>

                {/* Submit / Cancel Actions */}
                <div className="space-y-2 pt-4">
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
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>

    // <Card className="border-slate-200 shadow-sm">
    //   <CardHeader className="border-b border-slate-100 pb-4">
    //     <span className="text-xs font-bold tracking-wider text-slate-400">
    //       EXAM MANAGEMENT
    //     </span>
    //     <CardTitle className="text-lg font-bold text-slate-800">
    //       {editingExamId ? "Edit Exam" : "Create Exam"}
    //     </CardTitle>
    //   </CardHeader>

    //   <CardContent className="pt-6">
    //     <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
    //       {/* Exam Name */}
    //       <div className="space-y-1.5">
    //         <Label>Exam Name</Label>
    //         <Controller
    //           name="title"
    //           control={control}
    //           rules={{
    //             required: "Exam name is required",
    //             validate: (value) =>
    //               value.trim().length > 0 || "Exam name cannot be empty",
    //           }}
    //           render={({ field }) => (
    //             <div>
    //               <Input
    //                 {...field}
    //                 value={field.value ?? ""}
    //                 placeholder="e.g. Weekly Model Test - 03"
    //                 disabled={saving}
    //               />
    //               {errors.title && (
    //                 <p className="text-xs text-red-500">
    //                   {errors.title.message}
    //                 </p>
    //               )}
    //             </div>
    //           )}
    //         />
    //       </div>

    //       {/* Subject */}
    //       <div className="space-y-1.5">
    //         <Label>Subject</Label>
    //         <Controller
    //           name="subject"
    //           control={control}
    //           rules={{
    //             required: "Subject is required",
    //             validate: (value) =>
    //               value.trim().length > 0 || "Subject cannot be empty",
    //           }}
    //           render={({ field }) => (
    //             <div>
    //               <Input
    //                 {...field}
    //                 value={field.value ?? ""}
    //                 placeholder="e.g. Mathematics"
    //                 disabled={saving}
    //               />
    //               {errors.subject && (
    //                 <p className="text-xs text-red-500">
    //                   {errors.subject.message}
    //                 </p>
    //               )}
    //             </div>
    //           )}
    //         />
    //       </div>

    //       {/* Academic Session */}
    //       <div className="space-y-1.5">
    //         <Label>Academic Session</Label>
    //         <Controller
    //           name="session"
    //           control={control}
    //           rules={{ required: "Academic session is required" }}
    //           render={({ field }) => (
    //             <div>
    //               <Select
    //                 value={field.value ?? ""}
    //                 onValueChange={field.onChange}
    //                 disabled={saving}
    //               >
    //                 <SelectTrigger>
    //                   <SelectValue placeholder="Select session" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   {sessionOptions?.map((session) => (
    //                     <SelectItem key={session} value={session}>
    //                       {session}
    //                     </SelectItem>
    //                   ))}
    //                 </SelectContent>
    //               </Select>
    //               {errors.session && (
    //                 <p className="text-xs text-red-500">
    //                   {errors.session.message}
    //                 </p>
    //               )}
    //             </div>
    //           )}
    //         />
    //       </div>

    //       {/* Batch Selection */}
    //       <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
    //         <div className="flex items-center justify-between gap-2">
    //           <Label className="font-bold">Batch — Search & Select</Label>

    //           <div className="flex gap-2">
    //             <button
    //               type="button"
    //               disabled={isStructureLocked || saving}
    //               className="text-xs font-semibold text-blue-600 hover:underline"
    //               onClick={selectAllBatches}
    //             >
    //               Select All
    //             </button>
    //             <button
    //               type="button"
    //               disabled={isStructureLocked || saving}
    //               className="text-xs font-semibold text-slate-500 hover:underline"
    //               onClick={clearAllBatches}
    //             >
    //               Clear
    //             </button>
    //           </div>
    //         </div>

    //         <div className="relative">
    //           <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
    //           <Input
    //             placeholder="Search Batch..."
    //             className="bg-white pl-9"
    //             value={examBatchSearch}
    //             onChange={(e) => setExamBatchSearch(e.target.value)}
    //             disabled={isStructureLocked || saving}
    //           />
    //         </div>

    //         <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border bg-white p-2">
    //           {isBatchLoading ? (
    //             <p className="py-4 text-center text-xs text-slate-400">
    //               Please wait...
    //             </p>
    //           ) : filteredBatches?.length > 0 ? (
    //             filteredBatches.map((batch) => (
    //               <label
    //                 key={batch._id}
    //                 className="flex cursor-pointer items-center gap-2.5 rounded p-1.5 text-sm hover:bg-slate-50"
    //               >
    //                 <Checkbox
    //                   checked={isAllSelected || batchIds.includes(batch._id)}
    //                   disabled={isStructureLocked || saving}
    //                   onCheckedChange={(checked) =>
    //                     handleBatchCheckboxChange(batch._id, checked)
    //                   }
    //                 />
    //                 {batch.title}
    //               </label>
    //             ))
    //           ) : (
    //             <p className="py-4 text-center text-xs text-slate-400">
    //               No batches found.
    //             </p>
    //           )}
    //         </div>

    //         <div className="rounded border border-blue-100 bg-blue-50 p-2 text-xs font-medium text-blue-700">
    //           Selected Batches:{" "}
    //           {isAllSelected ? fetchedBatches.length : batchIds.length}
    //           <p className="mt-1 font-normal text-slate-600">
    //             {getBatchNames(batchIds)}
    //           </p>
    //         </div>

    //         {batchIds.length === 0 && !isAllSelected && (
    //           <p className="text-xs text-red-500">
    //             Please select at least one batch.
    //           </p>
    //         )}
    //       </div>

    //       {/* Exam Date */}
    //       <div className="space-y-1.5">
    //         <Label>Exam Date</Label>
    //         <Controller
    //           name="date"
    //           control={control}
    //           rules={{ required: "Exam date is required" }}
    //           render={({ field }) => (
    //             <div>
    //               <Input type="date" {...field} disabled={saving} />
    //               {errors.date && (
    //                 <p className="text-xs text-red-500">
    //                   {errors.date.message}
    //                 </p>
    //               )}
    //             </div>
    //           )}
    //         />
    //       </div>

    //       {/* Exam Type */}
    //       <div className="space-y-1.5">
    //         <Label>Exam Type</Label>
    //         <Controller
    //           name="examType"
    //           control={control}
    //           render={({ field }) => (
    //             <Select
    //               disabled={isStructureLocked || saving}
    //               value={field.value ?? ""}
    //               onValueChange={(value) =>
    //                 handleExamTypeChange(value, field.onChange)
    //               }
    //             >
    //               <SelectTrigger>
    //                 <SelectValue placeholder="Select type" />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 <SelectItem value="written">Only Written</SelectItem>
    //                 <SelectItem value="mcq">Only MCQ</SelectItem>
    //                 <SelectItem value="combined">MCQ + Written</SelectItem>
    //               </SelectContent>
    //             </Select>
    //           )}
    //         />
    //       </div>

    //       {/* Full Marks */}
    //       <div className="space-y-1.5">
    //         <Label>Full Marks</Label>
    //         <Controller
    //           name="fullMarks"
    //           control={control}
    //           rules={{
    //             required: "Full marks is required",
    //             min: { value: 1, message: "Full marks must be at least 1" },
    //           }}
    //           render={({ field }) => (
    //             <div>
    //               <Input
    //                 type="number"
    //                 min={1}
    //                 value={field.value ?? 100}
    //                 disabled={isStructureLocked || saving}
    //                 onChange={(e) => {
    //                   const val =
    //                     e.target.value === "" ? 0 : Number(e.target.value);
    //                   field.onChange(val);
    //                   if (examType === "written") {
    //                     setValue("writtenFullMarks", val, {
    //                       shouldDirty: true,
    //                     });
    //                   } else if (examType === "mcq") {
    //                     setValue("mcqFullMarks", val, { shouldDirty: true });
    //                   }
    //                 }}
    //               />
    //               {errors.fullMarks && (
    //                 <p className="text-xs text-red-500">
    //                   {errors.fullMarks.message}
    //                 </p>
    //               )}
    //             </div>
    //           )}
    //         />
    //       </div>

    //       {/* MCQ Full Marks */}
    //       {examType !== "written" ? (
    //         <div className="space-y-1.5">
    //           <Label>MCQ Full Marks</Label>
    //           <Controller
    //             name="mcqFullMarks"
    //             control={control}
    //             rules={{
    //               min: { value: 0, message: "MCQ marks cannot be negative" },
    //               validate: (value) =>
    //                 (value ?? 0) <= fullMarks ||
    //                 `MCQ marks cannot exceed full marks (${fullMarks})`,
    //             }}
    //             render={({ field }) => (
    //               <div>
    //                 <Input
    //                   type="number"
    //                   min={0}
    //                   max={fullMarks}
    //                   value={field.value ?? 0}
    //                   disabled={isStructureLocked || saving}
    //                   onChange={(e) =>
    //                     field.onChange(
    //                       e.target.value === "" ? 0 : Number(e.target.value),
    //                     )
    //                   }
    //                 />
    //                 {errors.mcqFullMarks && (
    //                   <p className="text-xs text-red-500">
    //                     {errors.mcqFullMarks.message}
    //                   </p>
    //                 )}
    //               </div>
    //             )}
    //           />
    //         </div>
    //       ) : (
    //         <div className="space-y-1.5">
    //           <Label>MCQ Full Marks (Auto Calculated)</Label>
    //           <Input
    //             type="number"
    //             value={calculatedMcqMarks}
    //             disabled
    //             className="bg-slate-100 font-semibold text-slate-700"
    //           />
    //         </div>
    //       )}

    //       {/* Written Full Marks */}
    //       {examType !== "mcq" ? (
    //         <div className="space-y-1.5">
    //           <Label>Written Full Marks</Label>
    //           <Controller
    //             name="writtenFullMarks"
    //             control={control}
    //             rules={{
    //               min: {
    //                 value: 0,
    //                 message: "Written marks cannot be negative",
    //               },
    //               validate: (value) =>
    //                 (value ?? 0) <= fullMarks ||
    //                 `Written marks cannot exceed full marks (${fullMarks})`,
    //             }}
    //             render={({ field }) => (
    //               <div>
    //                 <Input
    //                   type="number"
    //                   min={0}
    //                   max={fullMarks}
    //                   value={field.value ?? 0}
    //                   disabled={isStructureLocked || saving}
    //                   onChange={(e) =>
    //                     field.onChange(
    //                       e.target.value === "" ? 0 : Number(e.target.value),
    //                     )
    //                   }
    //                 />
    //               </div>
    //             )}
    //           />
    //         </div>
    //       ) : (
    //         <div className="space-y-1.5">
    //           <Label>Written Full Marks (Auto Calculated)</Label>
    //           <Input
    //             type="number"
    //             value={calculatedWrittenMarks}
    //             disabled
    //             className="bg-slate-100 font-semibold text-slate-700"
    //           />
    //         </div>
    //       )}

    //       {/* Marks Distribution Summary */}
    //       <div className="space-y-1 rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs font-semibold text-blue-900">
    //         <div>MCQ Full Marks: {finalMcqMarks}</div>
    //         <div>Written Full Marks: {finalWrittenMarks}</div>
    //         <div className="border-t border-blue-200 pt-1 mt-1 font-bold">
    //           Total Full Marks: {fullMarks}
    //         </div>
    //       </div>

    //       {/* Submit / Cancel */}
    //       <div className="space-y-2 pt-2">
    //         <Button
    //           type="submit"
    //           className="w-full bg-blue-600 font-bold text-white hover:bg-blue-700"
    //           disabled={saving}
    //         >
    //           {saving
    //             ? "Saving..."
    //             : editingExamId
    //               ? "✓ Save Changes"
    //               : "+ Create Exam"}
    //         </Button>

    //         {editingExamId && (
    //           <Button
    //             type="button"
    //             variant="outline"
    //             className="w-full"
    //             onClick={cancelEdit}
    //             disabled={saving}
    //           >
    //             <X className="mr-1 h-4 w-4" />
    //             Cancel Edit
    //           </Button>
    //         )}
    //       </div>
    //     </form>
    //   </CardContent>
    // </Card>
  );
};

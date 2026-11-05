import type { FC } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { Search, X } from "lucide-react";

import type { ExamType } from "../types/ExamManagement.types";
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
  form: UseFormReturn<any>;
  batches: { id: string; name: string }[];
  filteredBatches: { id: string; name: string }[];
  editingExamId: string | null;
  examStructureLocked: boolean;
  examBatchSearch: string;
  setExamBatchSearch: (search: string) => void;
  saving: boolean;
  onSubmit: (data: any) => void;
  cancelEdit: () => void;
}

export const PostExamForm: FC<PostExamFormProps> = ({
  form,
  batches,
  filteredBatches,
  editingExamId,
  examStructureLocked,
  examBatchSearch,
  setExamBatchSearch,
  saving,
  onSubmit,
  cancelEdit,
}) => {
  const { control, handleSubmit, watch, setValue } = form;

  const examType = watch("examType") as ExamType;
  const fullMarks = watch("fullMarks") ?? 0;
  const mcqFullMarks = watch("mcqFullMarks") ?? 0;
  const batchIds = watch("batchIds") ?? [];

  const isStructureLocked = examStructureLocked && Boolean(editingExamId);

  const writtenMarks =
    examType === "mcq"
      ? 0
      : examType === "combined"
        ? Math.max(0, fullMarks - mcqFullMarks)
        : fullMarks;

  const getBatchNames = (ids: string[]): string => {
    const names = ids
      .map((id) => batches.find((batch) => batch.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    return names.length > 0 ? names.join(", ") : "No batch selected";
  };

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
    <Card className="border-slate-200 shadow-sm">
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
                  <Input placeholder="e.g. Weekly Model Test - 03" {...field} />
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
                    setValue("batchIds", [], { shouldDirty: true })
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
                              : batchIds.filter(
                                  (id: string) => id !== batch.id,
                                );

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
              rules={{ required: "Exam date is required" }}
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
                min: { value: 1, message: "Full marks must be at least 1" },
              }}
              render={({ field, fieldState }) => (
                <div>
                  <Input
                    type="number"
                    min={1}
                    disabled={isStructureLocked}
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
              <Label>MCQ Full Marks</Label>
              {examType === "mcq" ? (
                <Input type="number" value={fullMarks} disabled />
              ) : (
                <Controller
                  name="mcqFullMarks"
                  control={control}
                  rules={{
                    min: { value: 0, message: "MCQ marks cannot be negative" },
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
  );
};

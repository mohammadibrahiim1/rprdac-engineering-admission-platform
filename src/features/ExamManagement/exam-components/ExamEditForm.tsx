import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getSessionOptions } from "@/utils/session";
import { ExamBatch, ExamFormValues, ExamRecord } from "../types/Exam.types";
import {
  buildExamPatch,
  isExamType,
  labelFor,
  toFormValues,
} from "../utils/examFormUtils";

type ExamEditFormProps = {
  exam: ExamRecord;
  batches: ExamBatch[];
  onCancel: () => void;
};

export function ExamEditForm({ exam, batches, onCancel }: ExamEditFormProps) {
  const [saving, setSaving] = useState(false);
  const [examBatchSearch, setExamBatchSearch] = useState("");
  const [savedLabels, setSavedLabels] = useState<string[] | null>(null);
  const isBatchLoading = false;
  const isStructureLocked = Boolean(exam.fullMarks);

  const sessionOptions = useMemo<string[]>(() => getSessionOptions(), []);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    register,
    reset,
    formState: { errors, dirtyFields },
    watch,
  } = useForm<ExamFormValues>({
    defaultValues: toFormValues(exam),
    mode: "onSubmit",
  });

  const examType = watch("examType");
  const fullMarks = watch("fullMarks");
  const mcqFullMarks = watch("mcqFullMarks");
  const writtenFullMarksInput = watch("writtenFullMarks");
  const batchIds = watch("batchIds") ?? [];
  const liveValues = watch();

  useEffect(() => {
    register("batchIds", {
      validate: (value) =>
        (Array.isArray(value) && value.length > 0) ||
        "Please select at least one batch.",
    });
  }, [register]);

  const filteredBatches = useMemo(() => {
    const query = examBatchSearch.trim().toLowerCase();
    if (!query) return batches;
    return batches.filter((batch) =>
      batch?.title?.toLowerCase().includes(query),
    );
  }, [batches, examBatchSearch]);

  const isAllSelected =
    batches.length > 0 &&
    batches?.every((batch) => batchIds.includes(batch._id));

  const pendingLabels = Object.keys(
    buildExamPatch(liveValues, dirtyFields),
  ).map(labelFor);

  function selectAllBatches() {
    if (isStructureLocked || saving) return;
    setValue(
      "batchIds",
      batches?.map((batch) => batch._id),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function clearAllBatches() {
    if (isStructureLocked || saving) return;
    setValue("batchIds", [], { shouldDirty: true, shouldValidate: true });
  }

  function handleBatchCheckboxChange(
    id: string,
    checked: boolean | "indeterminate",
  ) {
    if (isStructureLocked || saving) return;
    const current = getValues("batchIds") ?? [];
    const next =
      checked === true
        ? Array.from(new Set([...current, id]))
        : current.filter((batchId) => batchId !== id);
    setValue("batchIds", next, { shouldDirty: true, shouldValidate: true });
  }

  function handleExamTypeChange(
    value: string,
    onChange: (next: ExamFormValues["examType"]) => void,
  ) {
    if (!isExamType(value)) return; // ← exam.isExamType না, শুধু isExamType
    onChange(value);
    redistribute(getValues("fullMarks"), value);
  }

  function redistribute(total: number, type: ExamFormValues["examType"]) {
    if (type === "written") {
      setValue("writtenFullMarks", total, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("mcqFullMarks", 0, { shouldDirty: true, shouldValidate: true });
    } else if (type === "mcq") {
      setValue("mcqFullMarks", total, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("writtenFullMarks", 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      const half = Math.floor(total / 2);
      setValue("mcqFullMarks", half, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("writtenFullMarks", total - half, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  // function redistribute(total: number, type: ExamFormValues["examType"]) {
  //   if (type === "written") {
  //     setValue("writtenFullMarks", total, {
  //       shouldDirty: true,
  //       shouldValidate: true,
  //     });
  //     setValue("mcqFullMarks", 0, { shouldDirty: true, shouldValidate: true });
  //   } else if (type === "mcq") {
  //     setValue("mcqFullMarks", total, {
  //       shouldDirty: true,
  //       shouldValidate: true,
  //     });
  //     setValue("writtenFullMarks", 0, {
  //       shouldDirty: true,
  //       shouldValidate: true,
  //     });
  //   } else {
  //     const half = Math.floor(total / 2);
  //     setValue("mcqFullMarks", half, {
  //       shouldDirty: true,
  //       shouldValidate: true,
  //     });
  //     setValue("writtenFullMarks", total - half, {
  //       shouldDirty: true,
  //       shouldValidate: true,
  //     });
  //   }
  // }

  // const handleFormSubmit = handleSubmit((values) => {
  //   if (!values.batchIds.length) return;

  //   const patch = buildExamPatch(values, dirtyFields);
  //   if (Object.keys(patch).length === 0) {
  //     toast("Nothing to update. Change a field first.");
  //     return;
  //   }

  //   setSaving(true);
  //   const updated = onPatch(exam.id, patch);
  //   if (!updated) {
  //     setSaving(false);
  //     toast.error("This exam could not be updated.");
  //     return;
  //   }

  //   reset(toFormValues(updated));
  //   const labels = Object.keys(patch).map(labelFor);
  //   setSavedLabels(labels);
  //   setSaving(false);
  //   toast.success(
  //     `Updated ${labels.join(", ")}. Other fields were left unchanged.`,
  //   );
  // });

  return (
    <Card className="panel-in">
      <CardHeader>
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          Edit exam
        </p>
        <CardTitle>{exam?.title}</CardTitle>
        <CardDescription>
          Current values are filled in. Saving writes a partial update, so any
          field you leave alone stays exactly as it is. This paper is{" "}
          {exam?.examType.toLowerCase()}
          {isStructureLocked
            ? ", and the mark structure is locked because marks already exist."
            : "."}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form
        // onSubmit={handleFormSubmit}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="exam-title">Exam Name</Label>
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
                        id="exam-title"
                        value={field.value ?? ""}
                        placeholder="e.g. Weekly Model Test - 03"
                        disabled={saving}
                      />
                      {errors.title && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.title.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exam-subject">Subject</Label>
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
                        id="exam-subject"
                        value={field.value ?? ""}
                        placeholder="e.g. Mathematics"
                        disabled={saving}
                      />
                      {errors.subject && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

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
                        <p className="mt-1 text-xs text-destructive">
                          {errors.session.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exam-date">Exam Date</Label>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: "Exam date is required" }}
                  render={({ field }) => (
                    <div>
                      <Input
                        id="exam-date"
                        type="date"
                        {...field}
                        disabled={saving}
                      />
                      {errors.date && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.date.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2 rounded-xl border border-border bg-muted p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-semibold">
                    Batch — Search & Select
                  </Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isStructureLocked || saving}
                      className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                      onClick={selectAllBatches}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      disabled={isStructureLocked || saving}
                      className="text-xs font-semibold text-muted-foreground hover:underline disabled:opacity-50"
                      onClick={clearAllBatches}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search Batch..."
                    className="bg-card pl-9"
                    value={examBatchSearch}
                    onChange={(event) => setExamBatchSearch(event.target.value)}
                    disabled={isStructureLocked || saving}
                  />
                </div>

                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border bg-card p-2">
                  {isBatchLoading ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      Please wait...
                    </p>
                  ) : filteredBatches.length > 0 ? (
                    filteredBatches.map((batch) => (
                      <label
                        key={batch._id}
                        className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-1.5 text-sm hover:bg-muted"
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
                        {batch?.title}
                      </label>
                    ))
                  ) : (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No batches found.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-border bg-accent p-2 text-xs font-medium text-accent-foreground">
                  Selected Batches:{" "}
                  {isAllSelected ? batches?.length : batchIds?.length}
                </div>

                {batchIds.length === 0 && !isAllSelected && (
                  <p className="text-xs text-destructive">
                    Please select at least one batch.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-4">
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
                          <SelectItem value="written">Only Written</SelectItem>
                          <SelectItem value="mcq">Only MCQ</SelectItem>
                          <SelectItem value="combined">
                            MCQ + Written
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="full-marks">Full Marks</Label>
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
                          id="full-marks"
                          type="number"
                          min={1}
                          value={field.value ?? 100}
                          disabled={isStructureLocked || saving}
                          onWheel={(event) => event.currentTarget.blur()}
                          onChange={(event) => {
                            const val =
                              event.target.value === ""
                                ? 0
                                : Math.max(
                                    0,
                                    Math.round(Number(event.target.value)),
                                  );
                            if (!Number.isFinite(val)) return;
                            field.onChange(val);
                            redistribute(val, getValues("examType"));
                          }}
                        />
                        {errors.fullMarks && (
                          <p className="mt-1 text-xs text-destructive">
                            {errors.fullMarks.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mcq-marks">
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
                        (value ?? 0) <= getValues("fullMarks") ||
                        `MCQ marks cannot exceed full marks (${getValues("fullMarks")})`,
                    }}
                    render={({ field }) => (
                      <div>
                        <Input
                          id="mcq-marks"
                          type="number"
                          min={0}
                          max={fullMarks}
                          value={field.value ?? 0}
                          disabled={
                            isStructureLocked ||
                            saving ||
                            examType === "written"
                          }
                          className={
                            examType === "written"
                              ? "bg-muted font-semibold text-foreground"
                              : ""
                          }
                          onWheel={(event) => event.currentTarget.blur()}
                          onChange={(event) => {
                            const mcqVal =
                              event.target.value === ""
                                ? 0
                                : Math.max(
                                    0,
                                    Math.round(Number(event.target.value)),
                                  );
                            if (!Number.isFinite(mcqVal)) return;
                            const type = getValues("examType");
                            if (type === "mcq") {
                              field.onChange(mcqVal);
                              setValue("fullMarks", Math.max(1, mcqVal), {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              setValue("writtenFullMarks", 0, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              return;
                            }
                            if (mcqVal > fullMarks) return;
                            field.onChange(mcqVal);
                            setValue(
                              "writtenFullMarks",
                              Math.max(0, fullMarks - mcqVal),
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            );
                          }}
                        />
                        {errors.mcqFullMarks && (
                          <p className="mt-1 text-xs text-destructive">
                            {errors.mcqFullMarks.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="written-marks">
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
                        (value ?? 0) <= getValues("fullMarks") ||
                        `Written marks cannot exceed full marks (${getValues("fullMarks")})`,
                    }}
                    render={({ field }) => (
                      <div>
                        <Input
                          id="written-marks"
                          type="number"
                          min={0}
                          max={fullMarks}
                          value={field.value ?? 0}
                          disabled={
                            isStructureLocked || saving || examType === "mcq"
                          }
                          className={
                            examType === "mcq"
                              ? "bg-muted font-semibold text-foreground"
                              : ""
                          }
                          onWheel={(event) => event.currentTarget.blur()}
                          onChange={(event) => {
                            const writtenVal =
                              event.target.value === ""
                                ? 0
                                : Math.max(
                                    0,
                                    Math.round(Number(event.target.value)),
                                  );
                            if (!Number.isFinite(writtenVal)) return;
                            const type = getValues("examType");
                            if (type === "written") {
                              field.onChange(writtenVal);
                              setValue("fullMarks", Math.max(1, writtenVal), {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              setValue("mcqFullMarks", 0, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              return;
                            }
                            if (writtenVal > fullMarks) return;
                            field.onChange(writtenVal);
                            setValue(
                              "mcqFullMarks",
                              Math.max(0, fullMarks - writtenVal),
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            );
                          }}
                        />
                        {errors.writtenFullMarks && (
                          <p className="mt-1 text-xs text-destructive">
                            {errors.writtenFullMarks.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-1 rounded-xl border border-border bg-accent p-3 text-xs font-semibold text-accent-foreground">
                  <div>MCQ Full Marks: {mcqFullMarks}</div>
                  <div>Written Full Marks: {writtenFullMarksInput}</div>
                  <div className="mt-1 border-t border-border pt-1 font-bold">
                    Total Full Marks: {fullMarks}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {pendingLabels?.length === 0
                    ? "No fields changed yet. Saving will not overwrite anything."
                    : `Will update only: ${pendingLabels?.join(", ")}.`}
                </p>
                {savedLabels && savedLabels.length > 0 && (
                  <p className="text-xs leading-relaxed text-foreground">
                    Last save wrote {savedLabels.join(", ")}. Every other field
                    is unchanged.
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    saving ||
                    batchIds.length === 0 ||
                    pendingLabels.length === 0
                  }
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={onCancel}
                  disabled={saving}
                >
                  <X className="size-4" />
                  Cancel edit
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

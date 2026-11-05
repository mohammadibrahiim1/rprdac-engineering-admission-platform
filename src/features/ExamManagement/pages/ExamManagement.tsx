import { motion } from "framer-motion";
import type { FC } from "react";
import {
  flexRender,
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Edit3, Trash2 } from "lucide-react";

import type { ExamRecord } from "../types/ExamManagement.types";
import { useExamManagement } from "../hooks/useExamManagement";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostExamForm } from "../exam-components/PostExamForm";
import { ExamList } from "../exam-components/ExamList";

interface ExamManagementProps {
  batches: { id: string; name: string }[];
  onNavigate: (tab: string, id?: string) => void;
}

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

  const getBatchNames = (ids: string[]): string => {
    const names = ids
      .map((id) => batches.find((batch) => batch.id === id)?.name)
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names.join(", ") : "No batch selected";
  };

  const columns = columnHelper.columns([
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

  const table = useTable({
    features,
    data: exams,
    columns,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
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
        {/* Left: Exam Form Component */}
        <div className="lg:col-span-4">
          <PostExamForm
            form={form}
            batches={batches}
            filteredBatches={filteredBatches}
            editingExamId={editingExamId}
            examStructureLocked={examStructureLocked}
            examBatchSearch={examBatchSearch}
            setExamBatchSearch={setExamBatchSearch}
            saving={saving}
            onSubmit={onSubmit}
            cancelEdit={cancelEdit}
          />
        </div>

        {/* Right: Exam List Component */}
        <div className="lg:col-span-8">
          <ExamList
            table={table}
            allExamsCount={allExamsCount}
            examDateFilter={examDateFilter}
            setExamDateFilter={setExamDateFilter}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ExamManagement;

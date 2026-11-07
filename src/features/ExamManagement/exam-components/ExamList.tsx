import { motion } from "framer-motion";
import type { FC } from "react";

import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import { Edit3 } from "lucide-react";

import type { ExamRecord } from "../types/ExamManagement.types";
import { useExamList } from "../hooks/useExamList";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// ============================================
// Types
// ============================================

interface ExamListPageProps {
  batches: {
    id: string;
    name: string;
  }[];

  onNavigate: (tab: string, id?: string) => void;

  onEdit: (exam: ExamRecord) => void;
}

type ExamRecordWithApiFields = ExamRecord & {
  _id?: string;
  examId?: string;
  publishStatus?: string;
  status?: string;
  batchIds?: string[] | null;
  batchId?: string | null;
};

// ============================================
// TanStack Table V9 Configuration
// ============================================

const features = tableFeatures({});

const columnHelper = createColumnHelper<typeof features, ExamRecord>();

// ============================================
// Component
// ============================================

export const ExamList: FC<ExamListPageProps> = ({
  batches,
  onNavigate,
  onEdit,
}) => {
  const { filteredExams, allExamsCount, examDateFilter, setExamDateFilter } =
    useExamList();

  // ============================================
  // Safe Data
  // ============================================

  const exams: ExamRecord[] = Array.isArray(filteredExams) ? filteredExams : [];

  // ============================================
  // Helpers
  // ============================================

  const getExamId = (exam: ExamRecord): string => {
    const record = exam as ExamRecordWithApiFields;

    return record.id || record._id || record.examId || "";
  };

  const getExamStatus = (exam: ExamRecord): string => {
    const record = exam as ExamRecordWithApiFields;

    return String(
      record.status ?? record.publishStatus ?? "draft",
    ).toLowerCase();
  };

  const getBatchNames = (ids?: string[] | null): string => {
    if (!Array.isArray(ids) || ids.length === 0) {
      return "No batch selected";
    }

    const names = ids
      .map((id) => batches?.find((batch) => batch.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    return names.length > 0 ? names.join(", ") : "No batch selected";
  };

  // ============================================
  // Columns
  // ============================================

  const columns = columnHelper.columns([
    // Exam Details
    columnHelper.accessor("title", {
      header: "EXAM DETAILS",

      cell: ({ row }) => {
        const exam = row.original;

        return (
          <div className="space-y-1">
            <strong className="block font-semibold text-slate-900">
              {exam.title || "Untitled Exam"}
            </strong>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{exam.subject || "N/A"}</span>

              <span>·</span>

              <span>{exam.date || "N/A"}</span>

              <span>·</span>

              <span>{exam.fullMarks ?? 0} marks</span>
            </div>
          </div>
        );
      },
    }),

    // Batch
    columnHelper.accessor("batchIds", {
      header: "BATCH",

      cell: ({ row }) => {
        const exam = row.original as ExamRecordWithApiFields;

        const ids = Array.isArray(exam.batchIds)
          ? exam.batchIds
          : exam.batchId
            ? [exam.batchId]
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

      cell: ({ row }) => {
        const status = getExamStatus(row.original);

        const isPublished = status === "published";

        return (
          <Badge
            variant={isPublished ? "default" : "secondary"}
            className={
              isPublished
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

      cell: ({ row }) => {
        const exam = row.original;

        const examId = getExamId(exam);

        const isPublished = getExamStatus(exam) === "published";

        return (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!examId}
              onClick={() => onNavigate("marks", examId)}
            >
              Marks
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!examId}
              onClick={() => onNavigate("results", examId)}
            >
              Result
            </Button>

            <Button
              type="button"
              size="sm"
              variant={isPublished ? "destructive" : "default"}
              disabled
              title="Status handler is not connected yet"
            >
              {isPublished ? "Unpublish" : "Publish"}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isPublished}
              onClick={() => onEdit(exam)}
            >
              <Edit3 className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        );
      },
    }),
  ]);

  // ============================================
  // Table Instance - TanStack V9
  // ============================================

  const table = useTable({
    features,
    data: exams,
    columns,
  });

  // ============================================
  // Render
  // ============================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            EXAM LISTING
          </span>

          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            All Exams ({allExamsCount ?? exams.length})
          </h1>
        </div>

        <div className="w-full sm:w-auto">
          <Input
            type="date"
            value={examDateFilter}
            onChange={(e) => setExamDateFilter(e.target.value)}
            className="w-full sm:w-48 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header */}
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-3 font-semibold">
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {row.getAllCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        <table.FlexRender cell={cell} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-8 text-slate-400"
                  >
                    No exams found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

import { motion } from "framer-motion";
import type { FC } from "react";
import {
  flexRender,
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Edit3, Trash2 } from "lucide-react";
import { ExamRecord } from "../types/ExamManagement.types";
import { useExamList } from "../hooks/useExamList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ExamListPageProps {
  batches: { id: string; name: string }[];
  onNavigate: (tab: string, id?: string) => void;
  onEdit: (exam: ExamRecord) => void;
}

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, ExamRecord>();

export const ExamList: FC<ExamListPageProps> = ({
  batches,
  onNavigate,
  onEdit,
}) => {
  const {
    exams,
    allExamsCount,
    examDateFilter,
    setExamDateFilter,
    handleDeleteExam,
    handleStatus,
  } = useExamList();

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
              onClick={() => handleStatus(row)}
            >
              {row.status === "published" ? "Unpublish" : "Publish"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={row.status === "published"}
              onClick={() => onEdit(row)}
            >
              <Edit3 className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            EXAM LISTING
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            All Exams ({allExamsCount})
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

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              {table.getHeaderGroups().map((headerGroup: any) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => (
                    <th key={header.id} className="px-6 py-3 font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row: any) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">
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

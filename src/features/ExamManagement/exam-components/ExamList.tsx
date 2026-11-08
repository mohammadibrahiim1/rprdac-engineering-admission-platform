import { useMemo } from "react";
import {
  createColumnHelper,
  createCoreRowModel,
  flexRender,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Edit3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExamBatch, ExamRecord } from "../types/Exam.types";

const features = tableFeatures({});

const columnHelper = createColumnHelper<typeof features, ExamRecord>();

type ExamListProps = {
  exams: ExamRecord[];
  totalCount: number;
  batches: ExamBatch[];
  activeId?: string;
  onEdit: (exam: ExamRecord) => void;
  onOpen: (mode: "marks" | "results", exam: ExamRecord) => void;
  onToggleStatus: (exam: ExamRecord) => void;
  getBatchNames: (ids: string[] | undefined) => string;
};

export function ExamList({
  exams,
  totalCount,
  batches,
  activeId,
  onEdit,
  onOpen,
  onToggleStatus,
  getBatchNames,
}: ExamListProps) {
  console.log("exams list", exams);

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("title", {
          header: "Exam details",
          cell: ({ row }) => {
            const exam = row.original;
            return (
              <div className="space-y-1">
                <strong className="block font-semibold text-foreground">
                  {exam.title || "Untitled Exam"}
                </strong>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>{exam.subject || "N/A"}</span>
                  <span aria-hidden="true">·</span>
                  <span>{exam.date}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{exam.examType}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {exam.fullMarks ?? 0} marks
                  </span>
                </div>
              </div>
            );
          },
        }),
        columnHelper.accessor("batchIds", {
          header: "Batch",
          cell: ({ row }) => (
            <span className="text-sm font-medium text-foreground">
              {getBatchNames(row.original.batchIds)}
            </span>
          ),
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: ({ row }) => {
            const status = row.original.status;
            const isPublished = status === "published";
            return (
              <Badge variant={isPublished ? "default" : "secondary"}>
                {status?.toUpperCase()}
              </Badge>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          header: "Action",
          cell: ({ row }) => {
            const exam = row.original;
            const isPublished = exam.status === "published";
            return (
              <div className="grid w-full min-w-[9.5rem] grid-cols-2 gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto min-h-11 w-full px-2 py-2 text-xs whitespace-normal"
                  onClick={() => onOpen("marks", exam)}
                >
                  Marks
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto min-h-11 w-full px-2 py-2 text-xs whitespace-normal"
                  onClick={() => onOpen("results", exam)}
                >
                  Result
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={isPublished ? "destructive" : "default"}
                  className="h-auto min-h-11 w-full px-2 py-2 text-xs whitespace-normal"
                  onClick={() => onToggleStatus(exam)}
                >
                  {isPublished ? "Unpublish" : "Publish"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-auto min-h-11 w-full px-2 py-2 text-xs whitespace-normal"
                  disabled={isPublished}
                  title={
                    isPublished
                      ? "Unpublish this exam before editing"
                      : "Edit this exam"
                  }
                  onClick={() => onEdit(exam)}
                >
                  <Edit3 className="size-3.5" />
                  Edit
                </Button>
              </div>
            );
          },
        }),
      ]),
    [getBatchNames, onEdit, onOpen, onToggleStatus],
  );

  // v9-এ useTable ব্যবহার করুন (useReactTable নয়)
  const table = useTable({
    features,
    data: exams,
    columns,
    getRowId: (row) => row.id || row._id,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <h2 className="text-lg">Register</h2>
        <p className="text-sm text-muted-foreground tabular-nums">
          Showing {exams?.length} of {totalCount}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left xl:min-w-full">
          <thead className="border-b border-border bg-muted text-xs tracking-wider text-muted-foreground uppercase">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup?.headers?.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className={cn(
                      "px-4 py-3 font-semibold sm:px-6",
                      header.column.id === "title" && "w-[40%]",
                      header.column.id === "actions" && "w-[11.5rem]",
                    )}
                  >
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
          <tbody className="divide-y divide-border text-sm text-foreground">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "transition-colors hover:bg-muted/70",
                    activeId === (row.original.id || row.original._id) &&
                      "bg-accent",
                  )}
                >
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 align-top sm:px-6">
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
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-muted-foreground"
                >
                  No exams found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

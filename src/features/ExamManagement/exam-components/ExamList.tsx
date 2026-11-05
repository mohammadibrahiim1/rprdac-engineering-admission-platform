import type { FC } from "react";
import { flexRender } from "@tanstack/react-table";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ExamListProps {
  table: any;
  allExamsCount: number;
  examDateFilter: string;
  setExamDateFilter: (date: string) => void;
}

export const ExamList: FC<ExamListProps> = ({
  table,
  allExamsCount,
  examDateFilter,
  setExamDateFilter,
}) => {
  return (
    <Card className="border-slate-200 shadow-sm">
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
              {table.getHeaderGroups().map((headerGroup: any) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => (
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
                table.getRowModel().rows.map((row: any) => (
                  <TableRow key={row.id}>
                    {row.getAllCells().map((cell: any) => (
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
                    colSpan={table.getAllColumns().length}
                    className="h-40 text-center text-slate-500"
                  >
                    কোনো পরীক্ষা পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

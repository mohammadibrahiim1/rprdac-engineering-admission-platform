import React from "react";
import {
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Search,
} from "lucide-react";

// Shadcn UI Imports (Adjust paths based on your project configuration)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IBillingRateRecord,
  IBillingRateTableProps,
} from "../types/BillingRate.types";

const BADGE_COLORS: string[] = [
  "bg-slate-100 text-slate-700 border-slate-200",
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-amber-50 text-amber-700 border-amber-200",
];

export default function BillingRateTable({
  data,
  pagination,
  onPageChange,
  onDelete,
  isLoading,
  register,
  isUpdating,
  editingIndex,
  handleStartEdit,
  handleCancelEdit,
  handleInlineSubmit,
  search,
  setSearch,
}: IBillingRateTableProps) {
  return (
    <div className="bg-white rounded-md border border-neutral-200/80 shadow-sm overflow-hidden font-sans capitalize">
      {/* Table Header with Integrated Search Toolbar */}
      <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-10 pr-4 bg-white border-neutral-200 rounded-md text-xs focus-visible:ring-neutral-900 shadow-sm"
          />
        </div>
        <div className="text-xs text-neutral-500 font-medium">
          Total Records:{" "}
          <span className="text-neutral-900 font-bold">{pagination.total}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-neutral-100 bg-neutral-50/30 hover:bg-transparent">
              <TableHead className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                User & Role
              </TableHead>
              <TableHead className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Categories & Rates (Inline Edit)
              </TableHead>
              <TableHead className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-neutral-100">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell colSpan={3} className="px-5 py-4">
                    <div className="h-4 bg-neutral-100 rounded w-3/4" />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="px-5 py-16 text-center text-neutral-400 text-sm"
                >
                  No billing rates found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row: IBillingRateRecord) => {
                const type =
                  row.userType === "staff" ? "employee" : row.userType || "";
                const userName = row.user?.userName || "";
                const phone = row.user?.phone || "";

                return (
                  <TableRow
                    key={row._id}
                    className="hover:bg-neutral-50/60 transition-colors align-top"
                  >
                    {/* User & Role Column */}
                    <TableCell className="px-5 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-neutral-900 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-sm capitalize">
                          {type ? type.slice(0, 2).toUpperCase() : "UR"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-neutral-900 text-sm tracking-tight capitalize">
                            {type}
                          </span>
                          {(userName || phone) && (
                            <span className="text-xs text-neutral-500 font-medium tracking-wide mt-0.5">
                              {userName}{" "}
                              {userName && phone && (
                                <span className="text-neutral-300 mx-1">|</span>
                              )}{" "}
                              {phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Categories & Rates Column */}
                    <TableCell className="px-5 py-3 text-sm">
                      <div className="space-y-3 py-2">
                        {row.rates?.map((r: any, i: number) => {
                          const isEditing = editingIndex === `${row._id}-${i}`;

                          return (
                            <div
                              key={r._id || i}
                              className="p-3 bg-neutral-50/80 rounded-md border border-neutral-200/60 flex flex-col gap-2.5"
                            >
                              {isEditing ? (
                                <form
                                  onSubmit={handleInlineSubmit}
                                  className="space-y-2"
                                >
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Input
                                      type="text"
                                      {...register("inlineCategory", {
                                        required: true,
                                      })}
                                      placeholder="Category name"
                                      className="px-2.5 py-1 text-xs h-8 w-auto bg-white"
                                    />
                                    <div className="flex items-center gap-1">
                                      <Input
                                        type="number"
                                        step="any"
                                        {...register("inlineHourlyRate", {
                                          required: true,
                                        })}
                                        placeholder="Hourly Rate"
                                        className="w-24 px-2.5 py-1 text-xs h-8 bg-white"
                                      />
                                      <span className="text-xs text-neutral-500">
                                        BDT/hr
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-600">
                                    <div className="flex items-center gap-1">
                                      <span>From:</span>
                                      <Input
                                        type="date"
                                        {...register("inlineStartDate")}
                                        className="px-2 py-1 h-8 text-xs w-auto bg-white"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span>To:</span>
                                      <Input
                                        type="date"
                                        {...register("inlineEndDate")}
                                        className="px-2 py-1 h-8 text-xs w-auto bg-white"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 pt-1">
                                    <Button
                                      type="submit"
                                      size="sm"
                                      disabled={isUpdating}
                                      className="h-7 px-3 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
                                    >
                                      <Check className="w-3.5 h-3.5 mr-1" />
                                      {isUpdating ? "Saving..." : "Save"}
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      disabled={isUpdating}
                                      onClick={handleCancelEdit}
                                      className="h-7 px-3 text-xs bg-white text-neutral-700"
                                    >
                                      <X className="w-3.5 h-3.5 mr-1" /> Cancel
                                    </Button>
                                  </div>
                                </form>
                              ) : (
                                <div className="flex flex-col divide-y divide-neutral-100 w-full">
                                  <div className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                      <span
                                        className={`text-[11px] px-2.5 py-0.5 rounded-md border font-medium ${
                                          BADGE_COLORS[i % BADGE_COLORS.length]
                                        }`}
                                      >
                                        {r.category}
                                      </span>

                                      <span className="text-xs text-neutral-700 font-semibold">
                                        {r.hourlyRate} BDT/hr{" "}
                                        <span className="text-neutral-400 font-normal">
                                          ({r.secRate} BDT/sec)
                                        </span>
                                      </span>

                                      <span className="text-xs text-neutral-500">
                                        [
                                        {r.effectiveFrom
                                          ? new Date(r.effectiveFrom)
                                              .toLocaleDateString("en-GB")
                                              .replace(/\//g, "-")
                                          : ""}
                                        {r.effectiveTo
                                          ? ` to ${new Date(r.effectiveTo)
                                              .toLocaleDateString("en-GB")
                                              .replace(/\//g, "-")}`
                                          : " (Active)"}
                                        ]
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleStartEdit(row, r, i)
                                        }
                                        className="h-7 w-7 text-neutral-400 hover:text-neutral-900"
                                        title="Edit Category & Rates"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          onDelete({
                                            billingRateId: row._id,
                                            rateId: r._id,
                                          })
                                        }
                                        className="h-7 w-7 text-neutral-400 hover:text-red-600"
                                        title="Delete Category Rate"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell className="px-5 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete({ billingRateId: row._id })}
                          className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Entire Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-50/30 text-xs text-neutral-500">
        <span>
          Page <strong className="text-neutral-900">{pagination.page}</strong>{" "}
          of{" "}
          <strong className="text-neutral-900">
            {pagination.totalPages || 1}
          </strong>
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="h-8 w-8 rounded-md shadow-sm disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="h-8 w-8 rounded-md shadow-sm disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

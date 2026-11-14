import React from "react";
import { motion } from "framer-motion";
import { Globe, Users, Edit2, Trash2, Lock, Calendar } from "lucide-react";
import { LOCK_SCOPES, SCOPE_LABELS } from "../constants/lockScopes";
import { getLockData } from "../utils/lockHelpers";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Helper for date formatting used inside the timeline view
const formatDateTime = (dateString: string) => {
  if (!dateString) return { date: "N/A", time: "" };

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { date: "Invalid Date", time: "" };

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { date: formattedDate, time: formattedTime };
};

interface SystemLockTableProps {
  data?: any[];
  onEdit: (lock: any) => void;
  onDelete: (id: string) => void;
}

export const SystemLockTable: React.FC<SystemLockTableProps> = ({
  data = [],
  onEdit,
  onDelete,
}) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/40">
      <div className="overflow-x-auto">
        <Table className="w-full text-left border-collapse">
          <TableHeader>
            <TableRow className="border-b border-slate-200/80 bg-slate-50/75 hover:bg-slate-50/75">
              <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap select-none">
                Scope
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap select-none">
                Target Scope
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap select-none">
                Timeline Range
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap select-none">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap select-none text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {data && data.length > 0 ? (
              data.map((lock, idx) => {
                const scope = lock.scope;
                const isGlobal = scope === LOCK_SCOPES?.GLOBAL_ADMISSION;
                const { batchName, session, startDate, endDate, isActive } =
                  getLockData(lock);

                const start = formatDateTime(startDate);
                const end = formatDateTime(endDate);

                return (
                  <motion.tr
                    key={lock._id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className="hover:bg-slate-50/80 transition-colors group border-b border-slate-100"
                  >
                    {/* Scope Column */}
                    <TableCell className="px-6 py-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-3 py-1">
                        <div
                          className="p-2.5 rounded-xl shrink-0 transition-transform hover:scale-105 shadow-sm border border-[#143F6B15]"
                          style={{ backgroundColor: "#143F6B0D" }}
                        >
                          {isGlobal ? (
                            <Globe
                              className="w-4 h-4"
                              style={{ color: "#143F6B" }}
                            />
                          ) : (
                            <Users
                              className="w-4 h-4"
                              style={{ color: "#143F6B" }}
                            />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                            {SCOPE_LABELS[scope] || scope}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {isGlobal
                              ? "System-wide restriction"
                              : "Targeted entity lock"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Target Scope Column */}
                    <TableCell className="px-6 py-4 text-xs sm:text-sm">
                      {batchName || session ? (
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border border-[#143F6B20] shadow-sm"
                          style={{
                            backgroundColor: "#143F6B0A",
                            color: "#143F6B",
                          }}
                        >
                          {batchName
                            ? `Batch: ${batchName}`
                            : `Session: ${session}`}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium tracking-wider uppercase bg-slate-100 px-2.5 py-1 rounded-lg">
                          System Wide
                        </span>
                      )}
                    </TableCell>

                    {/* Timeline Range Column */}
                    <TableCell className="px-6 py-4 text-xs sm:text-sm">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50/80 px-3 py-2 text-xs border border-slate-200/60">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-700 whitespace-nowrap">
                            {start.date}
                            {start.time && (
                              <span className="ml-1 text-slate-400 font-normal">
                                {start.time}
                              </span>
                            )}
                          </span>
                          <span className="text-slate-300">→</span>
                          <span className="font-semibold text-slate-600 whitespace-nowrap">
                            {end.date}
                            {end.time && (
                              <span className="ml-1 text-slate-400 font-normal">
                                {end.time}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status Column */}
                    <TableCell className="px-6 py-4 text-xs sm:text-sm">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border shadow-xs ${
                          isActive === true
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100/50"
                            : "bg-slate-100 text-slate-600 border-slate-200 shadow-slate-100"
                        }`}
                      >
                        <span className="relative flex h-2 w-2">
                          {isActive === true && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          )}
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              isActive === true
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                        </span>
                        {isActive === true ? "Active" : "Inactive"}
                      </span>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell className="px-6 py-4 text-xs sm:text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(lock)}
                          className="p-2 rounded-xl text-slate-400 hover:text-[#143F6B] hover:bg-[#143F6B10] transition-all active:scale-95 cursor-pointer"
                          title="Edit Lock Configuration"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(lock._id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 cursor-pointer"
                          title="Delete System Lock"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="px-6 py-16 text-center text-sm text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                      <Lock className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <p className="font-semibold text-slate-600">
                      No system locks match your criteria
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

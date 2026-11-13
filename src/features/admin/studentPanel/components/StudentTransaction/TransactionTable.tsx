import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// ==================== TypeScript Interfaces ====================
export interface Student {
  name?: string;
  studentId?: string;
}

export interface PerformedBy {
  name?: string;
  userId?: string;
  role?: string;
}

export interface Transaction {
  _id: string;
  transactionNo?: string;
  paymentMethod?: string;
  transactionType?: string;
  invoiceNo?: string;
  student?: Student;
  studentId?: string;
  moneyDirection?: "IN" | "OUT";
  transactionAmount?: number;
  admissionFeePaidThisTransaction?: number;
  messServiceChargePaidThisTransaction?: number;
  studentReturnAmount?: number;
  performedBy?: PerformedBy;
  transactionDate?: string | Date;
}

export interface Pagination {
  currentPage?: number;
  limit?: number | "all";
}

export interface TransactionTableProps {
  transactions?: Transaction[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination?: Pagination;
}

// ==================== Utility Functions ====================
const formatCurrency = (amount?: number): string =>
  `৳${Number(amount || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date?: string | Date): string => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ==================== Component ====================
const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions = [],
  isLoading = false,
  isFetching = false,
  pagination = {},
}) => {
  const currentPage = pagination.currentPage || 1;
  const limit = pagination.limit || 20;

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-16 text-center shadow-xl shadow-slate-100">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent shadow-md"></div>
        <p className="mt-4 text-sm text-slate-600 font-semibold tracking-wide">
          Loading transactions, please wait...
        </p>
      </div>
    );
  }

  // Empty State
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-16 text-center shadow-xl shadow-slate-100">
        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-50 to-violet-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
          No Transactions Found
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">
          Try adjusting your active filters or search keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100/60 overflow-hidden transition-all">
      {/* Desktop Table View using Shadcn Primitives */}
      <div className="hidden md:block overflow-x-auto">
        <Table className="w-full text-left border-collapse">
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 border-b border-slate-200/80 hover:bg-transparent">
              <TableHead className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">
                # SL
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">
                Transaction Details
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">
                Student
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">
                Amount Breakdown
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">
                Performed By
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">
                Date & Time
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            className={`divide-y divide-slate-100/80 transition-opacity duration-300 ${
              isFetching ? "opacity-50" : "opacity-100"
            }`}
          >
            {transactions.map((txn, index) => {
              const serialNumber =
                limit === "all"
                  ? index + 1
                  : (currentPage - 1) * Number(limit) + index + 1;
              const isCredit = txn.moneyDirection === "IN";
              const paymentMethod = txn.paymentMethod || "Cash";
              const typeFormatted =
                txn.transactionType?.replace(/_/g, " ") || "Payment";
              const admFee = txn.admissionFeePaidThisTransaction || 0;
              const messFee = txn.messServiceChargePaidThisTransaction || 0;
              const returnAmt = txn.studentReturnAmount || 0;
              const performed = txn.performedBy;
              const roleDisplay =
                performed?.role === "staff"
                  ? "employee"
                  : performed?.role || "User";

              return (
                <TableRow
                  key={txn._id || index}
                  className="hover:bg-gradient-to-r hover:from-indigo-50/40 hover:via-indigo-50/10 hover:to-transparent transition-all group"
                >
                  {/* Serial Number */}
                  <TableCell className="px-6 py-4 align-middle">
                    <span className="font-bold text-slate-400 text-xs tracking-wider">
                      #{serialNumber}
                    </span>
                  </TableCell>

                  {/* Transaction Details */}
                  <TableCell className="px-6 py-4 align-middle">
                    <div className="space-y-1 py-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                          {txn.transactionNo || "—"}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-200/60 shadow-xs">
                          {paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-600 capitalize">
                          {typeFormatted}
                        </span>
                        {txn.invoiceNo && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100 font-medium">
                              {txn.invoiceNo}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Student Info */}
                  <TableCell className="px-6 py-4 align-middle">
                    <div className="py-1">
                      <div className="text-sm font-bold text-slate-800">
                        {txn.student?.name || "N/A"}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5 font-medium">
                        ID: {txn.studentId || txn.student?.studentId || "N/A"}
                      </div>
                    </div>
                  </TableCell>

                  {/* Amount Breakdown */}
                  <TableCell className="px-6 py-4 align-middle">
                    <div className="py-1">
                      <div
                        className={`text-sm font-black flex items-center gap-1 ${
                          isCredit ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        <span>{isCredit ? "+" : "-"}</span>
                        <span>{formatCurrency(txn.transactionAmount)}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1.5 flex flex-wrap gap-1.5">
                        <span className="bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50 font-medium">
                          Adm:{" "}
                          <b className="text-slate-700">
                            {formatCurrency(admFee)}
                          </b>
                        </span>
                        <span className="bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50 font-medium">
                          Mess:{" "}
                          <b className="text-slate-700">
                            {formatCurrency(messFee)}
                          </b>
                        </span>
                        {Number(returnAmt) > 0 && (
                          <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200/60 font-medium">
                            Return: <b>{formatCurrency(returnAmt)}</b>
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Performed By */}
                  <TableCell className="px-6 py-4 align-middle">
                    <div className="py-1">
                      <div className="text-sm font-bold text-slate-800">
                        {performed?.name || "System"}
                      </div>
                      <div className="text-xs text-slate-400 capitalize font-medium flex items-center gap-1.5 mt-0.5">
                        {performed?.userId && (
                          <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {performed.userId}
                          </span>
                        )}
                        <span>{roleDisplay}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Date & Time */}
                  <TableCell className="px-6 py-4 align-middle">
                    <div className="text-xs font-semibold text-slate-600 whitespace-nowrap py-1">
                      {formatDate(txn.transactionDate)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {transactions.map((txn, index) => {
          const isCredit = txn.moneyDirection === "IN";
          const sl =
            limit === "all"
              ? index + 1
              : (currentPage - 1) * Number(limit) + index + 1;
          const admFee = txn.admissionFeePaidThisTransaction || 0;
          const messFee = txn.messServiceChargePaidThisTransaction || 0;
          const returnAmt = txn.studentReturnAmount || 0;

          return (
            <div
              key={txn._id || index}
              className="p-5 space-y-3.5 bg-white hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-extrabold text-slate-400">
                    #{sl}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {txn.transactionNo || "—"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 uppercase border border-indigo-200/60 shadow-xs">
                    {txn.paymentMethod || "Cash"}
                  </span>
                </div>
                <div
                  className={`text-sm font-black ${
                    isCredit ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {isCredit ? "+" : "-"}
                  {formatCurrency(txn.transactionAmount)}
                </div>
              </div>

              <div className="flex justify-between items-start text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 shadow-xs">
                <div>
                  <div className="font-bold text-slate-800">
                    {txn.student?.name || "N/A"}
                  </div>
                  <div className="text-slate-500 font-mono mt-0.5 font-medium">
                    ID: {txn.studentId || txn.student?.studentId || "N/A"}
                  </div>
                </div>
                {txn.invoiceNo && (
                  <span className="font-mono text-sky-700 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium shadow-xs">
                    {txn.invoiceNo}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-500 flex flex-wrap gap-2 font-medium">
                <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200/60">
                  Adm:{" "}
                  <b className="text-slate-700">{formatCurrency(admFee)}</b>
                </span>
                <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200/60">
                  Mess:{" "}
                  <b className="text-slate-700">{formatCurrency(messFee)}</b>
                </span>
                {Number(returnAmt) > 0 && (
                  <span className="text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/60">
                    Return: <b>{formatCurrency(returnAmt)}</b>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 font-medium">
                <span>By: {txn.performedBy?.name || "System"}</span>
                <span>{formatDate(txn.transactionDate)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionTable;

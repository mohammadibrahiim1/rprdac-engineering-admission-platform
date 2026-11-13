import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import ExcelJS from "exceljs";
import {
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  ReceiptText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TransactionFilters, {
  TransactionFilterValues,
} from "../components/StudentTransaction/TransactionFilters";
import TransactionTable, {
  Transaction,
} from "../components/StudentTransaction/TransactionTable";
import { useGetTransactionsQuery } from "../services/api/studentApi";
import { toast } from "sonner";
import { DataPagination } from "@/components/common/DataPagination";

interface AuthUser {
  userType?: string;
  [key: string]: unknown;
}

interface RootState {
  auth: {
    user?: AuthUser | null;
  };
}

export interface TransactionStatistics {
  totalTransactions?: number;
  totalInAmount?: number;
  totalOutAmount?: number;
  netAmount?: number;
  totalAdmissionFeeCollected?: number;
  totalMessServiceChargeCollected?: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number | "all";
}

interface TransactionsApiResponse {
  data?: {
    transactions?: Transaction[];
    pagination?: Partial<PaginationMeta>;
    statistics?: TransactionStatistics;
  };
}

interface RtkQueryError {
  data?: {
    message?: string;
  };
  message?: string;
}

export interface TransactionQueryParams extends TransactionFilterValues {
  page: number;
  limit: number | "all";
  search: string;
  startDate: string;
  endDate: string;
  userId: string;
  transactionType: string;
  moneyDirection: string;
}

const StudentTransactions: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const isAdmin = [
    "admin",
    "teacher",
    "staff",
    "nursing",
    "super_admin",
  ].includes(String(user?.userType || "").toLowerCase());

  const [filters, setFilters] = useState<TransactionQueryParams>({
    page: 1,
    limit: 20,
    search: "",
    startDate: "",
    endDate: "",
    userId: "",
    transactionType: "",
    moneyDirection: "",
  });

  const queryArgs = {
    ...filters,
    limit: filters?.limit === "all" ? "all" : Number(filters?.limit),
  };

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetTransactionsQuery(queryArgs as any);

  const typedData = data as TransactionsApiResponse | undefined;
  const typedError = error as RtkQueryError | undefined;

  const transactions: Transaction[] = typedData?.data?.transactions || [];
  const rawPagination = typedData?.data?.pagination;
  const statistics: TransactionStatistics = typedData?.data?.statistics || {};

  const pagination: PaginationMeta = {
    currentPage: rawPagination?.currentPage ?? filters.page,
    totalPages: rawPagination?.totalPages ?? 1,
    totalItems: rawPagination?.totalItems ?? 0,
    limit: rawPagination?.limit ?? filters.limit,
  };

  const handleFilterChange = useCallback(
    (newFilters: TransactionFilterValues) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        page: 1,
      }));
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  // DataPagination থেকে limit হিসেবে string আসবে (যেমন: "10" বা "all")
  const handleLimitChange = useCallback((limitValue: string | number) => {
    const parsedLimit: number | "all" =
      limitValue === "all" ? "all" : Number(limitValue) || 20;
    setFilters((prev) => ({
      ...prev,
      limit: parsedLimit,
      page: 1, // Reset to page 1 on limit change
    }));
  }, []);

  const handleExportToExcel = async (): Promise<void> => {
    if (!transactions.length) return;

    try {
      const formattedData = transactions.map((txn, index) => ({
        "SL No": index + 1,
        "Transaction No": txn.transactionNo || "N/A",
        "Invoice No": txn.invoiceNo || "N/A",
        "Student Name": txn.student?.name || "N/A",
        "Student ID": txn.studentId || txn.student?.studentId || "N/A",
        Direction: txn.moneyDirection || "IN",
        "Total Amount (৳)": txn.transactionAmount || 0,
        "Admission Fee Paid (৳)": txn.admissionFeePaidThisTransaction || 0,
        "Mess Charge Paid (৳)": txn.messServiceChargePaidThisTransaction || 0,
        "Return Amount (৳)": txn.studentReturnAmount || 0,
        "Payment Method": txn.paymentMethod || "N/A",
        "Performed By": txn.performedBy?.name || "N/A",
        "Performed By ID": txn.performedBy?.userId || "N/A",
        "Date & Time": txn.transactionDate
          ? new Date(txn.transactionDate).toLocaleString("en-BD")
          : "N/A",
      }));

      const statsData = [
        {
          Metric: "Total Transactions",
          Value: statistics.totalTransactions || 0,
        },
        { Metric: "Total Cash IN (৳)", Value: statistics.totalInAmount || 0 },
        { Metric: "Total Cash OUT (৳)", Value: statistics.totalOutAmount || 0 },
        { Metric: "Net Amount (৳)", Value: statistics.netAmount || 0 },
        {
          Metric: "Total Admission Collected (৳)",
          Value: statistics.totalAdmissionFeeCollected || 0,
        },
        {
          Metric: "Total Mess Charge Collected (৳)",
          Value: statistics.totalMessServiceChargeCollected || 0,
        },
      ];

      const workbook = new ExcelJS.Workbook();

      const transactionsWorksheet = workbook.addWorksheet("Transactions");
      if (formattedData.length > 0) {
        const txnKeys = Object.keys(formattedData[0]);
        const txnWidths = [
          8, 18, 15, 25, 15, 12, 18, 22, 22, 18, 16, 20, 15, 22,
        ];

        transactionsWorksheet.columns = txnKeys.map((key, index) => ({
          header: key,
          key,
          width: txnWidths[index] || 18,
        }));

        transactionsWorksheet.getRow(1).font = { bold: true };
      }
      transactionsWorksheet.addRows(formattedData);

      const statsWorksheet = workbook.addWorksheet("Summary Statistics");
      if (statsData.length > 0) {
        const statsKeys = Object.keys(statsData[0]);
        const statsWidths = [35, 20];

        statsWorksheet.columns = statsKeys.map((key, index) => ({
          header: key,
          key,
          width: statsWidths[index] || 25,
        }));

        statsWorksheet.getRow(1).font = { bold: true };
      }
      statsWorksheet.addRows(statsData);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `Transaction_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);

      toast.success("Transaction report exported successfully!");
    } catch {
      toast.error("Failed to export transaction report. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-6">
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-100/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-gradient-to-tr from-indigo-50 to-violet-100 text-indigo-600 rounded-xl shadow-xs border border-indigo-100">
              <ReceiptText className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Payment Transaction Registry
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium pl-1">
            {isAdmin
              ? "Real-time corporate transaction oversight & financial logging desk"
              : "Your personal collection records and transaction history"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleExportToExcel}
            disabled={isLoading || !transactions.length}
            className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl px-5 py-2.5 h-auto shadow-md shadow-emerald-100 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>

          <Button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl px-5 py-2.5 h-auto shadow-md shadow-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Syncing..." : "Sync"}
          </Button>
        </div>
      </div>

      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isAdmin={isAdmin}
        isFetching={isFetching}
      />

      {isError && (
        <Alert
          variant="destructive"
          className="bg-rose-50/90 border-rose-200 text-rose-800 rounded-2xl shadow-sm"
        >
          <AlertCircle className="h-5 w-5 text-rose-600" />
          <AlertDescription className="font-semibold text-sm ml-1">
            {typedError?.data?.message ||
              typedError?.message ||
              "Failed to sync transaction ledger."}
          </AlertDescription>
        </Alert>
      )}

      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={pagination}
      />

      {pagination.totalItems > 0 && (
        <DataPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          isFetching={isFetching}
        />
      )}
    </div>
  );
};

export default StudentTransactions;

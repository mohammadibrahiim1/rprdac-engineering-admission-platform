import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useGetTransactionsQuery } from '../../../../../redux/features/student/studentApi';
import TransactionStats from '../components/StudentTransaction/TransactionStats';
import TransactionFilters from '../components/StudentTransaction/TransactionFilters';
import TransactionTable from '../components/StudentTransaction/TransactionTable';
import TransactionPagination from '../components/StudentTransaction/TransactionPagination';

import ExcelJS from 'exceljs';
import toast from 'react-hot-toast';

const StudentTransactions = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = [
    'admin',
    'teacher',
    'staff',
    'nursing',
    'super_admin',
  ].includes(String(user?.userType || '').toLowerCase());

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    startDate: '',
    endDate: '',
    userId: '',
    transactionType: '',
    moneyDirection: '',
  });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetTransactionsQuery(filters);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleLimitChange = useCallback((limit) => {
    setFilters((prev) => ({
      ...prev,
      limit,
      page: 1, // Limit change korle page വീണ്ടും 1 theke shuru hobe
    }));
  }, []);

  const transactions = data?.data?.transactions || [];
  const pagination = data?.data?.pagination || {};
  const statistics = data?.data?.statistics || {};

  // export transations
  const handleExportToExcel = async () => {
    if (!transactions.length) return;

    try {
      // Sheet 1: Transactions Data
      const formattedData = transactions.map((txn, index) => ({
        'SL No': index + 1,
        'Transaction No': txn.transactionNo || 'N/A',
        'Invoice No': txn.invoiceNo || 'N/A',
        'Student Name': txn.student?.name || 'N/A',
        'Student ID': txn.studentId || txn.student?.studentId || 'N/A',
        Direction: txn.moneyDirection || 'IN',
        'Total Amount (৳)': txn.transactionAmount || 0,
        'Admission Fee Paid (৳)': txn.admissionFeePaidThisTransaction || 0,
        'Mess Charge Paid (৳)': txn.messServiceChargePaidThisTransaction || 0,
        'Return Amount (৳)': txn.studentReturnAmount || 0,
        'Payment Method': txn.paymentMethod || 'N/A',
        'Performed By': txn.performedBy?.name || 'N/A',
        'Performed By ID': txn.performedBy?.userId || 'N/A',
        'Date & Time': txn.transactionDate
          ? new Date(txn.transactionDate).toLocaleString('en-BD')
          : 'N/A',
      }));

      // Sheet 2: Filter Summary / Stats
      const statsData = [
        {
          Metric: 'Total Transactions',
          Value: statistics.totalTransactions || 0,
        },
        { Metric: 'Total Cash IN (৳)', Value: statistics.totalInAmount || 0 },
        { Metric: 'Total Cash OUT (৳)', Value: statistics.totalOutAmount || 0 },
        { Metric: 'Net Amount (৳)', Value: statistics.netAmount || 0 },
        {
          Metric: 'Total Admission Collected (৳)',
          Value: statistics.totalAdmissionFeeCollected || 0,
        },
        {
          Metric: 'Total Mess Charge Collected (৳)',
          Value: statistics.totalMessServiceChargeCollected || 0,
        },
      ];

      // ১. নতুন ওয়ার্কবুক তৈরি
      const workbook = new ExcelJS.Workbook();

      // ২. প্রথম শিট: Transactions তৈরি ও কনফিগার করা
      const transactionsWorksheet = workbook.addWorksheet('Transactions');
      if (formattedData.length > 0) {
        const txnKeys = Object.keys(formattedData[0]);
        // ট্রানজাকশন শিটের কলামগুলোর নির্দিষ্ট প্রস্থ (Width)
        const txnWidths = [
          8, 18, 15, 25, 15, 12, 18, 22, 22, 18, 16, 20, 15, 22,
        ];

        transactionsWorksheet.columns = txnKeys.map((key, index) => ({
          header: key,
          key: key,
          width: txnWidths[index] || 18,
        }));

        // হেডার রো বোল্ড করা
        transactionsWorksheet.getRow(1).font = { bold: true };
      }
      transactionsWorksheet.addRows(formattedData);

      // ৩. দ্বিতীয় শিট: Summary Statistics তৈরি ও কনফিগার করা
      const statsWorksheet = workbook.addWorksheet('Summary Statistics');
      if (statsData.length > 0) {
        const statsKeys = Object.keys(statsData[0]);
        // সামারি শিটের কলামগুলোর প্রস্থ
        const statsWidths = [35, 20];

        statsWorksheet.columns = statsKeys.map((key, index) => ({
          header: key,
          key: key,
          width: statsWidths[index] || 25,
        }));

        // হেডার রো বোল্ড করা
        statsWorksheet.getRow(1).font = { bold: true };
      }
      statsWorksheet.addRows(statsData);

      // ৪. বাফার তৈরি এবং ব্রাউজারে ফাইল ডাউনলোড ট্রিগার করা
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const fileName = `Transaction_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      window.URL.revokeObjectURL(url);

      toast.success('Transaction report exported successfully!');
    } catch (error) {
      toast.error('Failed to export transaction report. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-6">
      {/* Corporate Desk Header */}
      <div className="bg-white border border-slate-200/80 rounded-md p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-md">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Payment transaction registry
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500">
            {isAdmin
              ? 'Real-time corporate transaction oversight & financial logging desk'
              : 'Your personal collection records and transaction history'}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportToExcel}
            disabled={isLoading || !transactions.length}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm rounded-md shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Excel
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium text-sm rounded-md shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isFetching ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Statistics Display */}
      {/* <TransactionStats statistics={statistics} isLoading={isLoading} isAdmin={isAdmin} /> */}

      {/* Filter Options */}
      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isAdmin={isAdmin}
        isFetching={isFetching}
      />

      {/* Error Boundary View */}
      {isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-medium flex items-center gap-2">
          <svg
            className="w-5 h-5 text-rose-500 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error?.data?.message || 'Failed to sync transaction ledger.'}
        </div>
      )}

      {/* TanStack Transaction Table */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={pagination}
      />

      {/* Pagination View */}
      {pagination.totalItems > 0 && (
        <TransactionPagination
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

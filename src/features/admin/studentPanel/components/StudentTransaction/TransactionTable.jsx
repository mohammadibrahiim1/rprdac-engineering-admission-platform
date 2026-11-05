import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

const formatCurrency = (amount) =>
  `৳${Number(amount || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TransactionTable = ({
  transactions = [],
  isLoading,
  isFetching,
  pagination = {},
}) => {
  // Column definitions using TanStack Table
  const columns = useMemo(
    () => [
      {
        id: 'serialNo',
        header: '# SL',
        cell: (info) => {
          const currentPage = pagination.currentPage || 1;
          const limit = pagination.limit || 20;

          const serialNumber =
            limit === 'all'
              ? info.row.index + 1
              : (currentPage - 1) * limit + info.row.index + 1;

          return (
            <span className="font-semibold text-gray-500 text-xs">
              {serialNumber}
            </span>
          );
        },
      },
      {
        accessorKey: 'transactionNo',
        header: 'Transaction Details',
        cell: ({ row }) => {
          const txn = row.original;
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 tracking-tight">
                  {txn.transactionNo || '—'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {txn.paymentMethod || 'Cash'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-gray-600 capitalize">
                  {txn.transactionType?.replace(/_/g, ' ') || 'Payment'}
                </span>
                {txn.invoiceNo && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {txn.invoiceNo}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'studentInfo',
        header: 'Student',
        cell: ({ row }) => {
          const txn = row.original;
          return (
            <div>
              <div className="text-sm font-semibold text-gray-800">
                {txn.student?.name || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 font-mono mt-0.5">
                ID: {txn.studentId || txn.student?.studentId || 'N/A'}
              </div>
            </div>
          );
        },
      },
      {
        id: 'amountBreakdown',
        header: 'Amount Breakdown',
        cell: ({ row }) => {
          const txn = row.original;
          const isCredit = txn.moneyDirection === 'IN';
          return (
            <div>
              <div
                className={`text-sm font-black flex items-center gap-1 ${
                  isCredit ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                <span>{isCredit ? '+' : '-'}</span>
                <span>{formatCurrency(txn.transactionAmount)}</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                  Adm:{' '}
                  <b className="text-gray-700">
                    {formatCurrency(txn.admissionFeePaidThisTransaction)}
                  </b>
                </span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                  Mess:{' '}
                  <b className="text-gray-700">
                    {formatCurrency(txn.messServiceChargePaidThisTransaction)}
                  </b>
                </span>
                {Number(txn.studentReturnAmount) > 0 && (
                  <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                    Return: <b>{formatCurrency(txn.studentReturnAmount)}</b>
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'performedBy',
        header: 'Performed By',
        cell: ({ row }) => {
          const performed = row.original.performedBy;
          return (
            <div>
              <div className="text-sm font-medium text-gray-800">
                {performed?.name || 'System'}
              </div>
              <div className="text-xs text-gray-400 capitalize">
                {performed?.userId ? `${performed.userId} • ` : ''}
                {performed?.role === 'staff'
                  ? 'employee'
                  : performed.role || 'User'}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'transactionDate',
        header: 'Date & Time',
        cell: ({ getValue }) => (
          <div className="text-xs font-medium text-gray-600 whitespace-nowrap">
            {formatDate(getValue())}
          </div>
        ),
      },
    ],
    [pagination.currentPage, pagination.limit],
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-md p-12 text-center shadow-sm">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">
          Please wait...
        </p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-md p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-800">
          No Transactions Found
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Try adjusting your filters or search keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-md shadow-sm overflow-hidden transition-all capitalize">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-slate-50/80 border-b border-slate-200/80"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            className={`divide-y divide-slate-100 transition-opacity ${isFetching ? 'opacity-50' : 'opacity-100'}`}
          >
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-blue-50/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-4 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {transactions.map((txn, index) => {
          const isCredit = txn.moneyDirection === 'IN';
          const currentPage = pagination.currentPage || 1;
          const limit = pagination.limit || 20;
          const sl = (currentPage - 1) * limit + index + 1;

          return (
            <div
              key={txn._id}
              className="p-4 space-y-3 bg-white hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">
                    #{sl}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {txn.transactionNo}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase border border-indigo-100">
                    {txn.paymentMethod || 'Cash'}
                  </span>
                </div>
                <div
                  className={`text-sm font-extrabold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}
                >
                  {isCredit ? '+' : '-'}
                  {formatCurrency(txn.transactionAmount)}
                </div>
              </div>

              <div className="flex justify-between items-start text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">
                    {txn.student?.name || 'N/A'}
                  </div>
                  <div className="text-slate-500 font-mono">
                    ID: {txn.studentId || txn.student?.studentId || 'N/A'}
                  </div>
                </div>
                {txn.invoiceNo && (
                  <span className="font-mono text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {txn.invoiceNo}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                <span>
                  Adm:{' '}
                  <b className="text-slate-700">
                    {formatCurrency(txn.admissionFeePaidThisTransaction)}
                  </b>
                </span>
                <span>
                  Mess:{' '}
                  <b className="text-slate-700">
                    {formatCurrency(txn.messServiceChargePaidThisTransaction)}
                  </b>
                </span>
                {Number(txn.studentReturnAmount) > 0 && (
                  <span className="text-amber-700">
                    Return: <b>{formatCurrency(txn.studentReturnAmount)}</b>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                <span>By: {txn.performedBy?.name || 'System'}</span>
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

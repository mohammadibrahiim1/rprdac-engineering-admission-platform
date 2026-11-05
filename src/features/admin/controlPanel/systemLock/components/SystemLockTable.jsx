import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import {
  Globe,
  Users,
  Edit2,
  Trash2,
  Lock,
  Calendar,
  Clock,
} from 'lucide-react';
import { LOCK_SCOPES, SCOPE_LABELS } from '../constants/lockScopes';
import { getLockData } from '../utils/lockHelpers';

// Helper for date formatting used inside the timeline view
const formatDateTime = (dateString) => {
  if (!dateString) return { date: 'N/A', time: '' };

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { date: 'Invalid Date', time: '' };

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return { date: formattedDate, time: formattedTime };
};

export const SystemLockTable = ({ data = [], onEdit, onDelete }) => {
  const columns = useMemo(
    () => [
      {
        header: 'Scope',
        accessorKey: 'scope',
        cell: ({ row }) => {
          const scope = row.original.scope;
          const isGlobal = scope === LOCK_SCOPES?.GLOBAL_ADMISSION;
          return (
            <div className="flex items-center gap-3 py-1">
              <div
                className="p-2.5 rounded-xl shrink-0 transition-transform hover:scale-105 shadow-sm border border-[#143F6B15]"
                style={{ backgroundColor: '#143F6B0D' }}
              >
                {isGlobal ? (
                  <Globe className="w-4 h-4" style={{ color: '#143F6B' }} />
                ) : (
                  <Users className="w-4 h-4" style={{ color: '#143F6B' }} />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                  {SCOPE_LABELS[scope] || scope}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {isGlobal
                    ? 'System-wide restriction'
                    : 'Targeted entity lock'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Target Scope',
        id: 'target',
        cell: ({ row }) => {
          const { batchName, session } = getLockData(row.original);

          return batchName || session ? (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border border-[#143F6B20] shadow-sm"
              style={{ backgroundColor: '#143F6B0A', color: '#143F6B' }}
            >
              {batchName ? `Batch: ${batchName}` : `Session: ${session}`}
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase bg-slate-100 px-2.5 py-1 rounded-lg">
              System Wide
            </span>
          );
        },
      },
      {
        header: 'Timeline Range',
        id: 'timeline',
        cell: ({ row }) => {
          const { startDate, endDate } = getLockData(row.original);
          const start = formatDateTime(startDate);
          const end = formatDateTime(endDate);

          return (
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
          );
        },
      },
      {
        header: 'Status',
        id: 'status',
        cell: ({ row }) => {
          const { isActive } = getLockData(row.original);

          return (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border shadow-xs ${
                isActive === true
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100/50'
                  : 'bg-slate-100 text-slate-600 border-slate-200 shadow-slate-100'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isActive === true && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isActive === true ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
              </span>
              {isActive === true ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onEdit(row.original)}
              className="p-2 rounded-xl text-slate-400 hover:text-[#143F6B] hover:bg-[#143F6B10] transition-all active:scale-95 cursor-pointer"
              title="Edit Lock Configuration"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(row.original._id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 cursor-pointer"
              title="Delete System Lock"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/40">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-slate-200/80 bg-slate-50/75"
              >
                {headerGroup?.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap select-none ${
                      header.id === 'actions' ? 'text-right' : 'text-left'
                    }`}
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
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, idx) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-xs sm:text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
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
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

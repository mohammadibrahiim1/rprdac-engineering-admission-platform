import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit3,
  FileText,
  Loader2,
  Trash2,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Student } from '../../types/allStudents.types';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL || '';

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  selectedIds: string[];
  onSelectId: (id: string) => void;
  onSelectAll: () => void;
  onDelete: (ids: string[]) => void;
  isDeleting: boolean;
  currentPage: number;
  totalPages: number;
  limit: number | string;
  setCurrentPage: (p: number | ((prev: number) => number)) => void;
  onLimitChange: (v: string) => void;
  meta: { totalItems: number };
}

const Avatar = ({ src, name }: { src?: string; name?: string }) => {
  const initials =
    name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '??';

  return (
    <div className="relative w-9 h-9 flex-shrink-0">
      {src ? (
        <img
          src={`${SERVER}${src}`}
          alt={name}
          className="w-full h-full rounded-full object-cover ring-2 ring-white shadow-sm"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <div
        className={`absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-slate-100 text-indigo-700 text-xs font-bold ring-2 ring-white ${
          src ? 'hidden' : ''
        }`}
      >
        {initials}
      </div>
    </div>
  );
};

type FeeBadgeProps = {
  paymentStatus?: string;
  dueAmount?: number;
  admissionFeeDue?: number;
  updatedDueAmount?: number;
};

const FeeBadge = ({
  paymentStatus,
  dueAmount,
  admissionFeeDue,
  updatedDueAmount,
}: FeeBadgeProps) => {
  const status = paymentStatus?.toLowerCase();

  const due = updatedDueAmount ?? dueAmount ?? admissionFeeDue ?? 0;

  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 btn btn-xs font-semibold text-emerald-700">
        <span className="rounded-full bg-emerald-500" />
        Fully Cleared
      </span>
    );
  }

  if (due > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 btn btn-xs  font-semibold text-rose-700">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Due ৳{due.toLocaleString('en-BD')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 btn btn-xs font-semibold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Pending
    </span>
  );
};

const DeptBadge = ({ dept }: { dept?: string }) => {
  if (!dept) return <span className="text-slate-400">—</span>;
  const colors: Record<string, string> = {
    CSE: 'bg-violet-50 text-violet-700 border-violet-200',
    EEE: 'bg-sky-50 text-sky-700 border-sky-200',
    ME: 'bg-amber-50 text-amber-700 border-amber-200',
    CE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  const key =
    Object.keys(colors).find((k) => dept.toUpperCase().includes(k)) ||
    'default';
  const cls = colors[key] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cls}`}
    >
      {dept}
    </span>
  );
};

export default function StudentTable({
  students,
  isLoading,
  isFetching,
  error,
  selectedIds,
  onSelectId,
  onSelectAll,
  onDelete,
  isDeleting,
  currentPage,
  totalPages,
  setCurrentPage,
  meta,
  limit,
  onLimitChange,
}: StudentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: () => {
          const allSelected =
            students.length > 0 && selectedIds.length === students.length;
          return (
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
            />
          );
        },
        cell: ({ row }: any) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.original._id)}
            onChange={() => onSelectId(row.original._id)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
          />
        ),
        size: 40,
      },
      {
        id: 'profile',
        header: 'STUDENT PROFILE',
        cell: ({ row }: any) => {
          const s = row.original;
          return (
            <div className="flex items-center gap-3 min-w-[200px]">
              <Avatar src={s.studentPhoto} name={s.name} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate capitalize">
                  {s.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {s.instituteName || '—'}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'roll',
        header: 'ROLL / REGISTRY ID',
        cell: ({ row }: any) => (
          <div className="text-sm">
            <p className="font-medium text-slate-800">
              {row.original.studentId || row.original.rollNo || '—'}
            </p>
            <p className="text-[11px] text-slate-400">
              {row.original.registryId || ''}
            </p>
          </div>
        ),
      },
      {
        id: 'sessionBatch',
        header: 'SESSION & BATCH',
        cell: ({ row }: any) => (
          <div className="text-sm">
            <p className="font-medium text-slate-800">
              {row.original.session || '—'}
            </p>
            <p className="text-[11px] text-slate-500">
              {row.original.batch || '—'}
            </p>
          </div>
        ),
      },
      {
        id: 'dept',
        header: 'DEPARTMENT',
        cell: ({ row }: any) => <DeptBadge dept={row.original.department} />,
      },
      {
        id: 'contact',
        header: 'CONTACT & GUARDIAN',
        cell: ({ row }: any) => {
          const s = row.original;
          return (
            <div className="text-sm min-w-[140px]">
              <p className="font-medium text-slate-800">
                {s.phone || s.mobile || '—'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {s.fatherName || s.guardianName || s.motherName
                  ? `F: ${s.fatherName || s.guardianName || s.motherName}`
                  : '—'}
              </p>
            </div>
          );
        },
      },
      {
        id: 'paymentStatus',
        header: 'Payment Status',
        cell: ({ row }: any) => (
          <FeeBadge
            paymentStatus={row.original.paymentStatus}
            dueAmount={row.original.dueAmount}
            admissionFeeDue={row.original.admissionFeeDue}
            updatedDueAmount={row.original.updatedDueAmount}
          />
        ),
      },
      {
        id: 'admissionStatus',
        header: 'Status',
        cell: ({ row }: any) => {
          const statusStyles: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
          };
          const status = row.original.admissionStatus?.toLowerCase();
          return (
            <span
              className={`btn btn-xs rounded-full border font-sans font-medium capitalize ${
                statusStyles[status] ||
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {row.original.admissionStatus || '—'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'QUICK ACTIONS',
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1">
            <Link
              to={`/dashboard/student/details/${row.original._id}`}
              className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="View"
            >
              <FileText className="w-4 h-4" />
            </Link>
            <Link
              to={`/dashboard/admin/edit/student/${row.original._id}`}
              className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => onDelete([row.original._id])}
              disabled={isDeleting}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
              title="Delete"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
            <button className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [students, selectedIds, isDeleting, onSelectAll, onSelectId, onDelete],
  );

  const table = useReactTable({
    data: students,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  if (isLoading || isFetching) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500">Please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-rose-600">
        <AlertCircle className="w-10 h-10" />
        <p className="font-semibold">Failed to load data</p>
        <p className="text-sm text-rose-500/80">
          {error?.data?.message || 'Please try again'}
        </p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
          <Users className="w-7 h-7 text-slate-400" />
        </div>
        <p className="font-semibold text-slate-700">No students found</p>
        <p className="text-sm text-slate-500">Try adjusting your filters</p>
      </div>
    );
  }

  // At the top of the component (or inside the render)
  const page = Number(currentPage) || 1;
  const perPage = typeof limit === 'number' ? limit : Number(limit) || 10;
  const totalItems = Number(meta?.totalItems) || 0;
  const totalPagesSafe = Number(totalPages) || 1;

  const startItem = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, totalItems);

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full text-left">
          <thead>
            {table.getHeaderGroups()?.map((hg) => (
              <tr
                key={hg.id}
                className="bg-slate-50/80 border-b border-slate-200"
              >
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'flex items-center gap-1 cursor-pointer select-none hover:text-slate-700'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: (
                            <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                          ),
                          desc: (
                            <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <AnimatePresence mode="popLayout">
              {rows.map((row, i) => (
                <motion.tr
                  key={row.original._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.15,
                    delay: Math.min(i * 0.02, 0.15),
                  }}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    selectedIds.includes(row.original._id)
                      ? 'bg-indigo-50/40'
                      : ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}

      {/* Pagination */}
      {!isLoading && !error && rows.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <span>
              Showing {startItem}–{endItem} of {totalItems.toLocaleString()}
            </span>

            <select
              value={limit}
              onChange={(e) => onLimitChange(e.target.value)}
              className="border border-slate-200 rounded-md px-2 py-1 text-xs bg-white"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
              <option value="all">View All</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, Number(p) - 1))}
              className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs font-medium"
            >
              Prev
            </button>

            <span className="px-3 py-1.5 text-xs font-medium text-slate-600">
              Page {page} of {totalPagesSafe}
            </span>

            <button
              type="button"
              disabled={page >= totalPagesSafe}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPagesSafe, Number(p) + 1))
              }
              className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <span>
            Showing {(currentPage - 1) * limit + 1}–
            {Math.min(currentPage * limit, meta.totalItems)} of {meta.totalItems.toLocaleString()}
          </span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(e.target.value)}
            className="border border-slate-200 rounded-md px-2 py-1 text-xs bg-white"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs font-medium"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 text-xs font-medium text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs font-medium"
          >
            Next
          </button>
        </div>
      </div> */}
    </div>
  );
}

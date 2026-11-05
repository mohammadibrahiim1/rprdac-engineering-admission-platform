import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Search,
} from 'lucide-react';

const BADGE_COLORS = [
  'bg-slate-100 text-slate-700 border-slate-200',
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-amber-50 text-amber-700 border-amber-200',
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
}) {
  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'userType',
        header: 'User & Role',
        cell: ({ row }) => {
          const type =
            row.original.userType === 'staff'
              ? 'employee'
              : row.original.userType || '';
          const userName = row.original.user?.userName || '';
          const phone = row.original.user?.phone || '';
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-neutral-900 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-sm capitalize">
                {type ? type.slice(0, 2).toUpperCase() : 'UR'}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-neutral-900 text-sm tracking-tight capitalize">
                  {type}
                </span>
                {(userName || phone) && (
                  <span className="text-xs text-neutral-500 font-medium tracking-wide mt-0.5">
                    {userName}{' '}
                    {userName && phone && (
                      <span className="text-neutral-300 mx-1">|</span>
                    )}{' '}
                    {phone}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'rates',
        header: 'Categories & Rates (Inline Edit)',
        cell: ({ row }) => (
          <div className="space-y-3 py-2">
            {row.original.rates.map((r, i) => {
              const isEditing = editingIndex === `${row.original._id}-${i}`;

              return (
                <div
                  key={r._id || i}
                  className="p-3 bg-neutral-50/80 rounded-md border border-neutral-200/60 flex flex-col gap-2.5"
                >
                  {isEditing ? (
                    <form onSubmit={handleInlineSubmit} className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="text"
                          {...register('inlineCategory', { required: true })}
                          placeholder="Category name"
                          className="px-2.5 py-1 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="any"
                            {...register('inlineHourlyRate', {
                              required: true,
                            })}
                            placeholder="Hourly Rate"
                            className="w-24 px-2.5 py-1 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                          />
                          <span className="text-xs text-neutral-500">
                            BDT/hr
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-600">
                        <div className="flex items-center gap-1">
                          <span>From:</span>
                          <input
                            type="date"
                            {...register('inlineStartDate')}
                            className="px-2 py-1 border border-neutral-300 rounded-md bg-white"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>To:</span>
                          <input
                            type="date"
                            {...register('inlineEndDate')}
                            className="px-2 py-1 border border-neutral-300 rounded-md bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />{' '}
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-neutral-200 text-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-100 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col divide-y divide-neutral-100 w-full">
                      <div className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-md border font-medium ${BADGE_COLORS[i % BADGE_COLORS.length]}`}
                          >
                            {r.category}
                          </span>

                          <span className="text-xs text-neutral-700 font-semibold">
                            {r.hourlyRate} BDT/hr{' '}
                            <span className="text-neutral-400 font-normal">
                              ({r.secRate} BDT/sec)
                            </span>
                          </span>

                          <span className="text-xs text-neutral-500">
                            [
                            {r.effectiveFrom
                              ? new Date(r.effectiveFrom)
                                  .toLocaleDateString('en-GB')
                                  .replace(/\//g, '-')
                              : ''}
                            {r.effectiveTo
                              ? ` to ${new Date(r.effectiveTo).toLocaleDateString('en-GB').replace(/\//g, '-')}`
                              : ' (Active)'}
                            ]
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(row.original, r, i)}
                            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-white transition-colors border border-transparent hover:border-neutral-200 shadow-sm shrink-0"
                            title="Edit Category & Rates"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onDelete({
                                billingRateId: row.original._id,
                                rateId: r._id,
                              })
                            }
                            className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-white transition-colors border border-transparent hover:border-neutral-200 shadow-sm shrink-0"
                            title="Delete Category Rate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => onDelete({ billingRateId: row.original._id })}
              className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Entire Record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [
      editingIndex,
      register,
      isUpdating,
      handleCancelEdit,
      handleStartEdit,
      handleInlineSubmit,
      onDelete,
    ],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="bg-white rounded-md border border-neutral-200/80 shadow-sm overflow-hidden font-sans capitalize">
      {/* Table Header with Integrated Search Toolbar */}
      <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-10 pr-4 bg-white border border-neutral-200 rounded-md text-xs outline-none focus:border-neutral-900 transition-all shadow-sm"
          />
        </div>
        <div className="text-xs text-neutral-500 font-medium">
          Total Records:{' '}
          <span className="text-neutral-900 font-bold">{pagination.total}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-neutral-100 bg-neutral-50/30"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
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
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td colSpan={columns.length} className="px-5 py-4">
                    <div className="h-4 bg-neutral-100 rounded w-3/4" />
                  </td>
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-16 text-center text-neutral-400 text-sm"
                >
                  No billing rates found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-neutral-50/60 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-5 py-3 text-sm align-middle"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-50/30 text-xs text-neutral-500">
        <span>
          Page <strong className="text-neutral-900">{pagination.page}</strong>{' '}
          of{' '}
          <strong className="text-neutral-900">
            {pagination.totalPages || 1}
          </strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-1.5 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="p-1.5 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

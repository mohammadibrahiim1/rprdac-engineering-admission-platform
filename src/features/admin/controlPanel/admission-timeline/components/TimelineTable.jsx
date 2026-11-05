import React, { useMemo, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useSelection } from '../hooks/useSelection';
import { useDebounce } from '../hooks/useDebounce';
import { formatDate, truncate } from '../utils/formatters';

const TimelineTable = React.memo(
  ({ timelines = [], onEdit, onDeleteSelected, isDeleting }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);

    const {
      selectedIds,
      toggleSelection,
      selectAll,
      clearSelection,
      isSelected,
    } = useSelection();

    // Search logic
    const filteredTimelines = useMemo(() => {
      if (!debouncedSearch) return timelines;
      const query = debouncedSearch.toLowerCase();
      return timelines.filter(
        (t) =>
          t.session?.toLowerCase().includes(query) ||
          t.title?.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query),
      );
    }, [timelines, debouncedSearch]);

    const allFilteredIds = useMemo(
      () => filteredTimelines.map((t) => t._id),
      [filteredTimelines],
    );

    const isAllSelected =
      allFilteredIds.length > 0 && allFilteredIds.every((id) => isSelected(id));

    const handleSelectAllToggle = useCallback(
      (e) => {
        if (e.target.checked) {
          selectAll(allFilteredIds);
        } else {
          clearSelection();
        }
      },
      [allFilteredIds, selectAll, clearSelection],
    );

    const handleDelete = async () => {
      if (selectedIds.length === 0) return;
      if (
        window.confirm(
          `Are you sure you want to delete ${selectedIds.length} item(s)?`,
        )
      ) {
        await onDeleteSelected(selectedIds);
        clearSelection();
      }
    };

    // TanStack Table Column Definitions
    const columns = useMemo(
      () => [
        {
          id: 'select',
          header: () => (
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              onChange={handleSelectAllToggle}
              checked={isAllSelected}
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              checked={isSelected(row.original._id)}
              onChange={() => toggleSelection(row.original._id)}
            />
          ),
        },
        {
          accessorKey: 'session',
          header: 'Session',
          cell: (info) => (
            <span className="font-semibold text-gray-900">
              {info.getValue() || '—'}
            </span>
          ),
        },
        {
          accessorKey: 'title',
          header: 'Title & Details',
          cell: ({ row }) => (
            <div className="max-w-xs">
              <div
                className="font-medium text-gray-900 truncate"
                title={row.original.title}
              >
                {truncate(row.original.title, 30) || '—'}
              </div>
              {row.original.description && (
                <div
                  className="text-xs text-gray-500 truncate"
                  title={row.original.description}
                >
                  {row.original.description}
                </div>
              )}
            </div>
          ),
        },
        {
          id: 'application',
          header: 'Application Status',
          cell: ({ row }) => {
            const app = row.original.application;
            if (!app) return <span className="text-gray-400">—</span>;

            return (
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      app.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <span className="font-medium text-gray-700">
                    {app.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-gray-500">
                  {formatDate(app.startDate)} - {formatDate(app.endDate)}
                </div>
              </div>
            );
          },
        },
        {
          id: 'admissionTest',
          header: 'Admission Test',
          cell: ({ row }) => {
            const test = row.original.admissionTest;
            if (!test) return <span className="text-gray-400">—</span>;

            return (
              <div>
                {test.isActive ? (
                  <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-xs font-medium">
                    {test.examDate ? formatDate(test.examDate) : 'Date Pending'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                    Not Active
                  </span>
                )}
              </div>
            );
          },
        },
        {
          id: 'officeHour',
          header: 'Office Hours',
          cell: ({ row }) => {
            const office = row.original.officeHour;
            if (!office) return <span className="text-gray-400">—</span>;

            return (
              <div className="text-xs space-y-0.5">
                <span className="font-medium text-gray-700">
                  {office?.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="text-gray-800 font-medium">
                  {office?.openingTime} - {office?.closingTime}
                </div>
                <div className="text-gray-500">
                  Off:{' '}
                  <span className="text-red-500 font-medium">
                    {office?.weeklyHoliday}
                  </span>
                </div>
              </div>
            );
          },
        },
        {
          accessorKey: 'createdAt',
          header: 'Created Date',
          cell: (info) => (
            <span className="text-xs text-gray-500">
              {formatDate(info.getValue())}
            </span>
          ),
        },
        {
          id: 'actions',
          header: () => <div className="text-right">Action</div>,
          cell: ({ row }) => (
            <div className="text-right">
              <button
                onClick={() => onEdit(row.original)}
                className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-md text-xs transition"
              >
                Edit
              </button>
            </div>
          ),
        },
      ],
      [
        handleSelectAllToggle,
        isAllSelected,
        isSelected,
        toggleSelection,
        onEdit,
      ],
    );

    const table = useReactTable({
      data: filteredTimelines,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
    });

    return (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        {/* Search & Bulk Action Header */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-b bg-gray-50">
          <input
            type="text"
            placeholder="Search by session, title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
          />

          {selectedIds.length > 0 && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              {isDeleting
                ? 'Deleting...'
                : `Delete Selected (${selectedIds.length})`}
            </button>
          )}
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 text-xs">
              {table?.getHeaderGroups()?.map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup?.headers?.map((header) => (
                    <th key={header.id} className="p-4 font-semibold">
                      {header?.isPlaceholder
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
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center p-8 text-gray-500"
                  >
                    No matching timelines found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.original._id}
                    className="hover:bg-gray-50/80 transition text-xs"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4">
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
      </div>
    );
  },
);

TimelineTable.displayName = 'TimelineTable';

export default TimelineTable;

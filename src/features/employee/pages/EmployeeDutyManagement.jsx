import React, { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Search,
  Loader2,
  Trash2,
  CheckCircle,
  FileText,
  Phone,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import Loader from '../../../../components/Loader';
import {
  useDeleteEmployeeDutyMutation,
  useGetEmployeeAllDutiesQuery,
  useUpdateEmployeeDutyMutation,
} from '../../../../redux/features/staff/employeeApi';

// ----------------------------------------------------------------------
const LoadingState = () => (
  <div className="flex items-center justify-center py-24 bg-white rounded border border-gray-150">
    <Loader />
  </div>
);

const EmptyState = ({ type }) => (
  <div className="flex items-center justify-center py-24 bg-white rounded border border-gray-150">
    <div className="text-center">
      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 text-sm font-sans"> No {type} found!</p>
    </div>
  </div>
);

// ----------------------------------------------------------------------
const IndeterminateCheckbox = ({ indeterminate, className = '', ...rest }) => {
  const ref = React.useRef(null);

  useEffect(() => {
    if (typeof indeterminate === 'boolean' && ref.current) {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={`
                h-[16px] w-[16px] rounded-[4px] border-2 border-gray-300 text-blue-600
                focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 cursor-pointer 
                transition-all duration-150 ease-in-out
                checked:bg-blue-600 checked:border-blue-600
                ${className}
            `}
      {...rest}
    />
  );
};

IndeterminateCheckbox.propTypes = {
  indeterminate: PropTypes.bool,
  className: PropTypes.string,
};

// ----------------------------------------------------------------------
const EmployeeDutyManagement = () => {
  // API filters state (Server-side parameters)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    search: '',
    status: 'pending',
    paymentStatus: '',
    startDate: '',
    endDate: '',
    month: '',
    year: '',
  });

  // Local state for UI inputs
  const [searchInput, setSearchInput] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [actionTargetId, setActionTargetId] = useState(null);

  // RTK Query hooks
  const { data, isLoading, isError, error } =
    useGetEmployeeAllDutiesQuery(filters);
  const [UpdateEmployeeDuty, { isLoading: isUpdating }] =
    useUpdateEmployeeDutyMutation();
  const [deleteEmployeeDuty, { isLoading: isDeleting }] =
    useDeleteEmployeeDutyMutation();

  // Map server-side response data
  const dutiesList = useMemo(() => data?.duties || [], [data]);
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

  // Sync input search value with API filters state with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  // --- STATUS UPDATE HANDLER WITH CONFIRM WINDOW ---
  const handleStatusUpdate = useCallback(
    async (id, currentStatus) => {
      const targetStatus = currentStatus === 'pending' ? 'approve' : 'pending';
      const message =
        currentStatus === 'pending'
          ? 'আপনি কি এই ডিউটিটি Approve করতে চান?'
          : 'আপনি কি এই ডিউটিটি আবার Pending করতে চান?';

      if (!window.confirm(message)) return;

      setActionTargetId({ id, action: 'status' });
      try {
        await UpdateEmployeeDuty({
          id,
          status: targetStatus,
        }).unwrap();
        alert(`Duty status updated successfully!`);
      } catch (err) {
        alert(err?.data?.message || 'Update failed!');
      } finally {
        setActionTargetId(null);
      }
    },
    [UpdateEmployeeDuty],
  );

  // --- SINGLE DELETE HANDLER ---
  const handleDeleteSingle = useCallback(
    async (id) => {
      if (!window.confirm('আপনি কি নিশ্চিতভাবে এই ডিউটিটি মুছে ফেলতে চান?'))
        return;

      setActionTargetId({ id, action: 'delete' });
      try {
        await deleteEmployeeDuty([id]).unwrap();

        setRowSelection({}); // selection রিসেট করা হচ্ছে

        alert('ডিউটিটি সফলভাবে মুছে ফেলা হয়েছে।');
      } catch (err) {
        alert(err?.data?.message || 'মুছে ফেলা সম্ভব হয়নি।');
      } finally {
        setActionTargetId(null);
      }
    },
    [deleteEmployeeDuty],
  );

  // --- MULTIPLE DELETE HANDLER ---
  const handleDeleteSelected = async () => {
    const selectedIndices = Object.keys(rowSelection);
    if (selectedIndices.length === 0) return;

    const selectedIds = selectedIndices
      .map((index) => dutiesList[Number(index)]?._id)
      .filter(Boolean);

    if (selectedIds.length === 0) return;

    if (
      !window.confirm(
        `আপনি কি নিশ্চিতভাবে নির্বাচিত ${selectedIds.length}টি ডিউটি মুছে ফেলতে চান?`,
      )
    )
      return;

    setActionTargetId({ id: 'bulk', action: 'delete' });
    try {
      await deleteEmployeeDuty(selectedIds).unwrap();
      setRowSelection({}); // সফল ডিলিট হওয়ার পর রো সিলেকশন ক্লিয়ার করা হচ্ছে
      alert('নির্বাচিত সকল ডিউটি মুছে ফেলা হয়েছে।');
    } catch (err) {
      alert(err?.data?.message || 'মুছে ফেলা সম্ভব হয়নি।');
    } finally {
      setActionTargetId(null);
    }
  };

  // Columns Definition - ডিপেন্ডেন্সি অ্যারে অপ্টিমাইজ করা হয়েছে যাতে লোডিং লুপ না তৈরি হয়
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center pl-1">
            <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center pl-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      },
      {
        id: 'employee',
        header: 'Employee',
        accessorKey: 'employeeName',
        cell: ({ row }) => {
          const name = row.original.employeeName || 'Unknown';
          const phone = row.original.phone || 'N/A';
          return (
            <div className="py-1">
              <p className="font-semibold text-gray-900 text-sm capitalize leading-tight">
                {name}
              </p>
              <span className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                <Phone size={11} className="text-gray-400" /> {phone}
              </span>
            </div>
          );
        },
      },
      {
        id: 'date',
        header: 'Date',
        accessorKey: 'date',
        cell: ({ getValue }) => (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <Calendar size={13} className="text-gray-400" />
            {getValue()
              ? new Date(getValue()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'N/A'}
          </span>
        ),
      },
      {
        id: 'workDetails',
        header: 'Work Details',
        accessorKey: 'workDetails',
        cell: ({ getValue }) => {
          const details = getValue() || 'No details provided';
          return (
            <div className="max-w-[200px] py-1">
              <p
                className="text-xs text-gray-600 font-medium line-clamp-2 break-words"
                title={details}
              >
                {details}
              </p>
            </div>
          );
        },
      },
      {
        id: 'amount',
        header: 'Amount',
        accessorKey: 'totalDutyFee',
        cell: ({ getValue }) => (
          <span className="text-xs font-bold text-gray-800">
            ৳{' '}
            {getValue()
              ? getValue().toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '0.00'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue()?.toLowerCase() || 'pending';

          const badgeStyles = {
            active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            approve: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            pending: 'bg-amber-50 text-amber-700 border-amber-100',
            review: 'bg-amber-50 text-amber-700 border-amber-100',
            cancel: 'bg-rose-50 text-rose-700 border-rose-100',
          };

          const style =
            badgeStyles[status] || 'bg-gray-50 text-gray-700 border-gray-100';

          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-md border capitalize ${style}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right pr-4">Actions</div>,
        enableHiding: false,
        cell: ({ row }) => {
          const id = row.original._id;
          const currentStatus = row.original.status;

          // নির্দিষ্ট রো এর লোডিং স্টেট ডিফাইন করা
          const isStatusLoading =
            actionTargetId?.id === id && actionTargetId?.action === 'status';
          const isDeleteLoading =
            actionTargetId?.id === id && actionTargetId?.action === 'delete';

          return (
            <div className="flex items-center justify-end gap-2 pr-2">
              {/* APPROVE/PENDING TOGGLE BUTTON */}
              <button
                onClick={() => handleStatusUpdate(id, currentStatus)}
                disabled={isStatusLoading || isUpdating || isDeleting}
                className={`inline-flex items-center justify-center p-1.5 rounded transition-colors border border-transparent disabled:opacity-50 ${
                  currentStatus === 'approve'
                    ? 'text-amber-600 hover:bg-amber-50 hover:border-amber-100'
                    : 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
                }`}
                title={
                  currentStatus === 'approve' ? 'Mark as Pending' : 'Approve'
                }
              >
                {isStatusLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </button>

              {/* DELETE BUTTON */}
              <button
                onClick={() => handleDeleteSingle(id)}
                disabled={isDeleteLoading || isDeleting || isUpdating}
                className="inline-flex items-center justify-center p-1.5 rounded text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 disabled:opacity-50"
                title="Delete"
              >
                {isDeleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          );
        },
      },
    ],
    [
      actionTargetId,
      handleStatusUpdate,
      handleDeleteSingle,
      isUpdating,
      isDeleting,
    ],
  );

  // TanStack table initialization
  const table = useReactTable({
    data: dutiesList,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  // Handle pagination controls
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setRowSelection({});
      setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setRowSelection({});
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handlePageSizeChange = (e) => {
    const newLimit = Number(e.target.value);
    setRowSelection({});
    setFilters((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleStatusFilterChange = (statusVal) => {
    setRowSelection({});
    setFilters((prev) => ({
      ...prev,
      status: statusVal === 'all' ? '' : statusVal,
      page: 1,
    }));
  };

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded border border-rose-150 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-gray-800">সার্ভার এরর!</h3>
        <p className="text-gray-500 text-sm">
          {error?.data?.message || 'ডেটা লোড করতে সমস্যা হচ্ছে।'}
        </p>
      </div>
    );

  const selectedRowsCount = Object.keys(rowSelection).length;
  const isBulkDeleting =
    actionTargetId?.id === 'bulk' && actionTargetId?.action === 'delete';
  const currentTabValue = filters.status === '' ? 'all' : filters.status;

  return (
    <div className="bg-[#f5f9fc] flex items-center justify-center font-sans antialiased">
      <div className="w-full max-w-5xl bg-white rounded border border-blue-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 flex flex-col gap-4">
        {/* --- HEADER ACTIONS --- */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5"></div>
            {selectedRowsCount > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isBulkDeleting || isDeleting || isUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded shadow-sm transition-all disabled:opacity-50"
              >
                {isBulkDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete Selected ({selectedRowsCount})
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-black uppercase">
              Employee duty management
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              <input
                type="text"
                placeholder="Search employees or phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200/80 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Status Filters */}
            <div className="flex items-center p-1 bg-gray-100/60 rounded self-start md:self-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Active/Pending' },
                { id: 'approve', label: 'Approved' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleStatusFilterChange(tab.id)}
                  className={`
                                        px-4 py-1 rounded text-xs font-bold transition-all duration-200
                                        ${
                                          currentTabValue === tab.id
                                            ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)]'
                                            : 'text-gray-500 hover:text-gray-800'
                                        }
                                    `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {table
                ?.getAllLeafColumns()
                ?.filter((col) => col.id !== 'select' && col.id !== 'actions')
                ?.map((column) => (
                  <button
                    key={column.id}
                    onClick={column.getToggleVisibilityHandler()}
                    className={`px-3 py-1.5 rounded border font-bold transition-all ${
                      column.getIsVisible()
                        ? 'bg-[#EFF6FF] text-[#0052FF] border-[#BFDBFE]'
                        : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
                    }`}
                  >
                    {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                  </button>
                ))}
            </div>
            <span className="text-[11px] font-bold text-gray-500">
              Total {totalCount} rows / {selectedRowsCount} selected
            </span>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        {isLoading ? (
          <LoadingState />
        ) : dutiesList.length === 0 ? (
          <EmptyState type="employee duties" />
        ) : (
          <div className="border border-gray-150 rounded overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="bg-gray-50/75 border-b border-gray-100"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="py-3.5 px-4 text-black text-xs font-bold tracking-wide select-none"
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
                <tbody className="divide-y divide-gray-100">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`
                                                hover:bg-blue-50/10 transition-colors duration-150
                                                ${row.getIsSelected() ? 'bg-blue-50/20' : ''}
                                            `}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3 px-4 align-middle">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- FOOTER PAGINATION --- */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="flex-1 min-w-[120px] bg-blue-50/30 border border-blue-100/50 rounded p-2">
              <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                FILTERED STATUS
              </span>
              <span className="text-[12px] font-medium text-blue-900 capitalize">
                {currentTabValue}
              </span>
            </div>

            <div className="flex-1 min-w-[120px] bg-blue-50/30 border border-blue-100/50 rounded p-3">
              <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                TOTAL COUNT
              </span>
              <span className="text-[12px] font-medium text-blue-900 capitalize">
                {totalCount} items
              </span>
            </div>

            <div className="flex-1 min-w-[120px] bg-blue-50/30 border border-blue-100/50 rounded p-3">
              <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                SELECTED
              </span>
              <span className="text-[12px] font-medium text-blue-900 capitalize">
                {selectedRowsCount} rows
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filters.limit}
              onChange={handlePageSizeChange}
              className="text-xs font-bold text-blue-700 bg-blue-50/50 border border-blue-100 rounded px-3 py-1.5 focus:outline-none cursor-pointer hover:bg-blue-50 transition-colors"
            >
              {[5, 10, 20].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
          {/* Navigation buttons */}
          <div className="flex items-center justify-end gap-3 lg:pl-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-1.5 text-xs font-bold border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all text-gray-600"
            >
              Prev
            </button>
            <span className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 rounded py-1.5">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading}
              className="px-4 py-1.5 text-xs font-bold border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all text-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDutyManagement;

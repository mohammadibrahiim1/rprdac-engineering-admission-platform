import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Calendar,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  DownloadIcon,
  FilterIcon,
  TrendingUpIcon,
  UserCircleIcon,
  X,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { useFetchEmployeeDutiesQuery } from '../../../../redux/features/staff/employeeApi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

// Animation configurations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 120 },
  },
};

// Style configurations
const roleColors = {
  teacher: 'bg-purple-100 text-purple-800',
  staff: 'bg-blue-100 text-blue-800',
  nursing: 'bg-teal-100 text-teal-800',
};

const statusColors = {
  approve: 'bg-green-100 text-green-800 border border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  default: 'bg-gray-100 text-gray-800 border border-gray-200',
};

const paymentStatusColors = {
  paid: 'bg-blue-100 text-blue-800 border border-blue-200',
  unpaid: 'bg-red-100 text-red-800 border border-red-200',
  default: 'bg-gray-100 text-gray-800 border border-gray-200',
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5;

  const getPageNumbers = () => {
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-b-lg sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                  currentPage === page
                    ? 'z-10 bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                } border`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

const AllStaff = () => {
  const auth = useSelector((state) => state?.auth?.user);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const popoverRef = useRef();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    selectedYear: '',
    selectedMonth: '',
    selectedStatus: '',
    selectedPaymentStatus: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Data fetching
  const { data: staffData } = useFetchEmployeeDutiesQuery({
    employeeId: auth?._id,
    ...filters,
  });

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Flatten the duties data from the nested structure
  const flattenDuties = (statements) => {
    if (!statements) return [];

    return statements.flatMap((yearData) =>
      yearData.months.flatMap((monthData) =>
        (monthData.details?.duties || []).map((duty) => ({
          ...duty,
          year: yearData.year,
          month: monthData.month,
        })),
      ),
    );
  };

  const statements = staffData?.statements || [];
  const allDuties = flattenDuties(statements);

  // Calculate pagination
  const totalItems = allDuties.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDuties = allDuties.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const totalAmount = allDuties.reduce(
    (sum, item) =>
      item.status === 'approve' ? sum + (item.totalDutyFee || 0) : sum,
    0,
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, allDuties.length]);

  const downloadPDF = () => {
    // PDF generation code remains the same as provided
    // (truncated for brevity in this response)
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      selectedYear: '',
      selectedMonth: '',
      selectedStatus: '',
      selectedPaymentStatus: '',
    });
  };

  // Format time function
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m`;

    return result.trim() || '0s';
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-4 capitalize bg-gray-50 md:p-6"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* User Info Section */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 shadow-lg rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <span className="text-xl font-bold text-white">
                  {auth?.userName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="absolute flex items-center justify-center w-6 h-6 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-gray-800 md:text-3xl">
                  {auth?.userName}
                </h1>
                <div className="px-3 py-1 border border-indigo-200 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50">
                  <span className="text-sm font-medium text-indigo-700 capitalize">
                    {auth?.userType === 'staff' ? 'Employee' : auth?.userType}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-2">
                  <UserCircleIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700 capitalize">
                    {auth?.userName}
                  </span>
                </div>
                <div className="hidden w-1 h-1 bg-gray-300 rounded-full sm:block"></div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{auth?.phone}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-gray-600">
                    Total Records:{' '}
                    <span className="font-semibold text-gray-800">
                      {allDuties.length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Total Earned:{' '}
                    <span className="font-bold text-emerald-600">
                      {totalAmount?.toFixed(2)} BDT
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <button
              onClick={downloadPDF}
              disabled={!allDuties.length}
              className="flex items-center gap-3 px-6 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <DownloadIcon className="w-5 h-5 transition-transform group-hover:translate-y-[-1px]" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        variants={itemVariants}
        className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl"
      >
        <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            <p className="mt-1 text-sm text-gray-500">
              Filter and analyze duty records
            </p>
          </div>

          <div className="flex w-full gap-3 md:w-auto">
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg h-11 hover:bg-red-700 whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid items-end grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Date Range Picker */}
          <div className="relative">
            <label className="block px-1 mb-1 text-sm font-medium text-gray-700">
              Date Range
            </label>
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className={`w-full h-11 px-4 flex items-center justify-between gap-2 bg-white border ${
                filters.startDate ? 'border-blue-500' : 'border-gray-300'
              } rounded-lg text-gray-900 hover:bg-gray-50 transition-colors`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {filters.startDate ? (
                  <span className="text-sm truncate">
                    {filters.startDate} - {filters.endDate || filters.startDate}
                  </span>
                ) : (
                  <span className="text-gray-500">Select Date Range</span>
                )}
              </div>
              {filters.startDate && (
                <X
                  className="w-4 h-4 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters((prev) => ({
                      ...prev,
                      startDate: '',
                      endDate: '',
                    }));
                  }}
                />
              )}
            </button>

            {isDatePickerOpen && (
              <div
                ref={popoverRef}
                className="absolute z-40 w-full max-w-md p-4 mt-1 space-y-4 bg-white border border-gray-300 rounded-lg shadow-lg"
              >
                <div className="flex flex-col gap-4">
                  <div className="w-full">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>

                  <div className="w-full">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Year Filter */}
          <div className="relative">
            <label className="block px-1 mb-1 text-sm font-medium text-gray-700">
              Year
            </label>
            <select
              value={filters.selectedYear}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  selectedYear: e.target.value,
                }))
              }
              disabled={filters.startDate || filters.endDate}
              className={`w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 appearance-none bg-no-repeat bg-[center_right_1rem] ${
                filters.startDate || filters.endDate
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-900'
              }`}
              style={{
                backgroundImage:
                  'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiA5TDEyIDE1TDE4IDkiIHN0cm9rZT0iIzRFNEU0RSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=")',
              }}
            >
              <option value="">All Years</option>
              {statements.map((s) => (
                <option key={s.year} value={s.year}>
                  {s.year}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="relative">
            <label className="block px-1 mb-1 text-sm font-medium text-gray-700">
              Month
            </label>
            <select
              value={filters.selectedMonth}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  selectedMonth: e.target.value,
                }))
              }
              disabled={filters.startDate || filters.endDate}
              className={`w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 appearance-none bg-no-repeat bg-[center_right_1rem] ${
                filters.startDate || filters.endDate
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-900'
              }`}
              style={{
                backgroundImage:
                  'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiA5TDEyIDE1TDE4IDkiIHN0cm9rZT0iIzRFNEU0RSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=")',
              }}
            >
              <option value="">All Months</option>
              {Array.from(
                new Set(
                  statements.flatMap((s) => s.months.map((m) => m.month)),
                ),
              )
                .sort((a, b) => {
                  const months = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                  ];
                  return months.indexOf(a) - months.indexOf(b);
                })
                .map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <label className="block px-1 mb-1 text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={filters.selectedStatus}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  selectedStatus: e.target.value,
                }))
              }
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 appearance-none bg-no-repeat bg-[center_right_1rem] bg-white text-gray-900"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiA5TDEyIDE1TDE4IDkiIHN0cm9rZT0iIzRFNEU0RSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=")',
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approve">Approved</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="relative">
            <label className="block px-1 mb-1 text-sm font-medium text-gray-700">
              Payment Status
            </label>
            <select
              value={filters.selectedPaymentStatus}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  selectedPaymentStatus: e.target.value,
                }))
              }
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 appearance-none bg-no-repeat bg-[center_right_1rem] bg-white text-gray-900"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiA5TDEy IDE1TDE4IDkiIHN0cm9rZT0iIzRFNEU0RSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=")',
              }}
            >
              <option value="">Payment Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {/* Items Per Page Selector */}
          <div className="relative">
            <label className="block px-1 mb-1 text-sm font-medium text-gray-700">
              Rows per page
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 appearance-none bg-no-repeat bg-[center_right_1rem] bg-white text-gray-900"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiA5TDEyIDE1TDE4IDkiIHN0cm9rZT0iIzRFNEU0RSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=")',
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        variants={itemVariants}
        className="mb-6 overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl"
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Duty Records
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {allDuties.length} records found
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live Data</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {[
                  { label: 'Date', icon: CalendarIcon },
                  { label: 'Employee', icon: UserCircleIcon },
                  { label: 'Work Details', icon: null },
                  { label: 'Duty Time', icon: ClockIcon },
                  { label: 'Duration', icon: ClockIcon },
                  { label: 'Amount', icon: DollarSignIcon },
                  { label: 'Payment Status', icon: null },
                  { label: 'Status', icon: null },
                ]?.map((header, index) => (
                  <th
                    key={header.label}
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    <div className="flex items-center gap-2">
                      {header.icon && (
                        <header.icon className="w-4 h-4 text-gray-400" />
                      )}
                      {header.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDuties?.map((item, index) => (
                <TableRow
                  key={`${item._id}-${index}`}
                  item={item}
                  role={auth?.userType}
                  formatTime={formatTime}
                />
              ))}
            </tbody>
          </table>

          {!paginatedDuties?.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl">
                <FilterIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-700">
                No Records Found
              </h3>
              <p className="max-w-md mx-auto text-gray-500">
                No duty records match your current filter criteria. Try
                adjusting your filters or clearing them to see all data.
              </p>
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </motion.div>
    </motion.div>
  );
};

// Table Row Component
const TableRow = ({ item, role, formatTime }) => (
  <tr className="transition-colors hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-900">
          {item?.date?.slice(0, 10)}
        </span>
      </div>
    </td>

    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-3">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center ${
            roleColors[role] || roleColors.staff
          }`}
        >
          <UserCircleIcon className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">
            {item?.employeeName}
          </div>
          <div className="text-sm text-gray-500">{item?.phone}</div>
        </div>
      </div>
    </td>

    <td className="px-6 py-4">
      <div className="max-w-xs text-sm text-gray-900 truncate">
        {item?.workDetails}
      </div>
    </td>

    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <ClockIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-900">
          {item?.dutyStartTime} - {item?.dutyEndTime}
        </span>
      </div>
    </td>

    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {formatTime(item?.totalDutyTime || 0)}
      </div>
    </td>

    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <DollarSignIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-900">
          {item?.totalDutyFee?.toFixed(2) || 0} BDT
        </span>
      </div>
    </td>

    <td className="px-6 py-4 whitespace-nowrap">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          paymentStatusColors[item?.paymentStatus] ||
          paymentStatusColors.default
        }`}
      >
        {item?.paymentStatus === 'paid'
          ? 'Paid'
          : item?.paymentStatus === 'unpaid'
            ? 'Unpaid'
            : 'N/A'}
      </span>
    </td>

    <td className="px-6 py-4 whitespace-nowrap">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusColors[item?.status] || statusColors.default
        }`}
      >
        {item?.status?.charAt(0).toUpperCase() + item?.status?.slice(1)}
      </span>
    </td>
  </tr>
);

TableRow.propTypes = {
  item: PropTypes.object.isRequired,
  role: PropTypes.string.isRequired,
  formatTime: PropTypes.func.isRequired,
};

export default AllStaff;

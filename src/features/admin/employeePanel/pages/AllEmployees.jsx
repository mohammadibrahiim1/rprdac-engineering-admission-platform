import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllEmployeeDutiesWithSummaryQuery } from '../../../../../redux/features/staff/employeeApi';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader,
  Search,
  User,
  Users,
  Filter,
  ArrowUpRight,
  Phone,
  Banknote,
  Zap,
  X,
  RefreshCw,
  Plus,
  Loader2,
  XCircle,
  Frown,
  Calendar,
  Clock,
  Home,
  ChevronRightIcon,
  EyeOff,
  Eye,
  File,
  BookOpen,
  DollarSign,
  CreditCard,
  ReceiptText,
  SlidersHorizontal,
  BarChart3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import EmployeeFilterSidebar from '../components/EmployeeFilterSidebar';
import { formatTimeAMPM } from '../../../../../constants/timeFormat';
import { formatDutyTime } from '../../../../../constants/formateDutyTime';
import EmployeePaymentModal from '../components/EmployeePaymentModal';

import ExcelJS from 'exceljs';

const AllEmployees = () => {
  // State management
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    startDate: '',
    endDate: '',
    month: '',
    year: '',
    status: '',
    paymentStatus: '',
  });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [expandedLoans, setExpandedLoans] = useState(new Set());
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Data fetching
  const { data, isError, error, isLoading, refetch, isFetching } =
    useGetAllEmployeeDutiesWithSummaryQuery(filters);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const employees = useMemo(() => {
    return (data?.employees || []).map((emp) => ({
      ...emp.employeeInfo, // 👈 backend nested data
      ...emp, // keep calculated fields
    }));
  }, [data]);

  const pagination = data?.pagination || {};

  // Options for filters
  const statusOptions = useMemo(
    () => [
      { value: '', label: 'All Status' },
      { value: 'pending', label: 'Pending' },
      { value: 'approve', label: 'Approved' },
    ],
    [],
  );

  const paymentStatusOptions = useMemo(
    () => [
      { value: '', label: 'All Payments' },
      { value: 'paid', label: 'Paid' },
      { value: 'unpaid', label: 'Unpaid' },
    ],
    [],
  );

  const monthOptions = useMemo(
    () => [
      { value: '', label: 'All Months' },
      ...Array.from({ length: 12 }, (_, i) => {
        const date = new Date(0, i);
        return {
          value: format(date, 'MMMM'),
          label: format(date, 'MMMM'),
        };
      }),
    ],
    [],
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      { value: '', label: 'All Years' },
      ...Array.from({ length: 5 }, (_, i) => ({
        value: (currentYear - i).toString(),
        label: (currentYear - i).toString(),
      })),
    ];
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      startDate: '',
      endDate: '',
      month: '',
      year: '',
      status: '',
      paymentStatus: '',
    });
    setSearchInput('');
  }, []);

  const handleEmployeePayment = (emp) => {
    setSelectedEmployee(emp);
    setPaymentModalOpen(true);
  };

  const handleChange = (name, value) => {
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleLimitChange = (newLimit) => {
    const limit = newLimit === 'all' ? pagination.totalItems : Number(newLimit);
    setFilters({ ...filters, limit, page: 1 });
  };

  const toggleLoanRow = (employeeId) => {
    setExpandedLoans((prev) => {
      const newSet = new Set(prev);
      newSet.has(employeeId)
        ? newSet.delete(employeeId)
        : newSet.add(employeeId);
      return newSet;
    });
  };

  const toggleRow = (employeeId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      newSet.has(employeeId)
        ? newSet.delete(employeeId)
        : newSet.add(employeeId);
      return newSet;
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      approve: 'text-green-800 border-green-300',
      pending: 'text-amber-800 border-amber-300',
      rejected: 'text-red-800 border-red-300',
    };
    return (
      styles[status?.toLowerCase()] ||
      'bg-gray-100 text-gray-800 border-gray-300'
    );
  };

  const getPaymentBadge = (status) => {
    return status === 'paid'
      ? 'text-emerald-800 border-emerald-300'
      : 'text-rose-800 border-rose-300';
  };

  const handleAction = (action, employee) => {
    switch (action) {
      case 'statement':
        toast.success(`Opening statement for ${employee.userName}`);
        break;
      case 'invoice':
        toast.success(`Generating invoice for ${employee.userName}`);
        break;
      case 'payment':
        toast.success(`Processing payment for ${employee.userName}`);
        break;
      default:
        break;
    }
  };

  const exportToExcel = async () => {
    if (!employees || employees.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const now = new Date();
      const dateTime = now.toLocaleString('en-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const companyName = 'RPR DUET Admission Care';
      const address =
        'M.A. Samad Villa-2 In front of DUET Campus | Gazipur, Bangladesh';
      const contacts =
        '+880 1742 590 128 | +880 1901 852 989 | rpr.group2013@gmail.com';

      const formatPhone = (phone) => {
        if (!phone) return 'N/A';
        const digits = phone.toString().replace(/\D/g, '');
        return digits.length === 11 ? digits : digits.padStart(11, '0');
      };

      // ১. হেডার অ্যারে
      const headers = [
        '#',
        'ID',
        'Name',
        'Phone',
        'Total Duties',
        'Approved',
        'Pending',
        'Total Amount',
        'Approved Amount',
        'Paid Amount',
        'Unpaid/Due Amount',
        'Loan Amount',
        'Payable (Appr - Paid)',
        'Net Payable (After Loan)',
      ];

      // ২. ডাটা ম্যাপিং
      const dataRows = employees.map((emp, i) => [
        (filters.page - 1) * filters.limit + (i + 1),
        emp?.userId || emp?.employeeInfo?.userId || 'N/A',
        emp?.userName || emp?.employeeInfo?.userName || 'N/A',
        formatPhone(emp?.phone || emp?.employeeInfo?.phone || ''),
        emp?.totalDuties || 0,
        emp?.approvedDuties || 0,
        emp?.pendingDuties || 0,
        Number(emp?.totalAmount || 0).toFixed(2),
        Number(emp?.approvedAmount || 0).toFixed(2),
        Number(emp?.paidAmount || 0).toFixed(2),
        Number(emp?.unpaidAmount || 0).toFixed(2),
        Number(emp?.loanAmount || 0).toFixed(2),
        Number(emp?.payableAmount || 0).toFixed(2),
        Number(emp?.netPayable || 0).toFixed(2),
      ]);

      // ৩. ওয়ার্কবুক ও ওয়ার্কশিট তৈরি
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Employee Summary');

      // ৪. এক্সেল শিটে রো গুলো ক্রমানুসারে যোগ করা (SheetData স্ট্রাকচার অনুযায়ী)
      ws.addRow([companyName]);
      ws.addRow([address]);
      ws.addRow([contacts]);
      ws.addRow(['']);
      ws.addRow(['EMPLOYEE PERFORMANCE & PAYMENT SUMMARY REPORT']);
      ws.addRow(['']);
      ws.addRow([`Generated on: ${dateTime}`]);
      ws.addRow(['']);
      ws.addRow(['FILTERS APPLIED:']);
      ws.addRow(['Start Date:', filters.startDate || 'All']);
      ws.addRow(['End Date:', filters.endDate || 'All']);
      ws.addRow(['Month:', filters.month || 'All']);
      ws.addRow(['Year:', filters.year || 'All']);
      ws.addRow(['Status:', filters.status || 'All']);
      ws.addRow(['']);
      ws.addRow(headers); // মূল টেবিল হেডার (Row 16)

      // ডেটা রো গুলো যুক্ত করা
      ws.addRows(dataRows);

      // ৫. প্রফেশনাল স্টাইলিং ও ফন্ট সেটআপ
      ws.getRow(1).font = { bold: true, size: 14, color: { argb: '003366' } };
      ws.getRow(2).font = { italic: true, size: 10, color: { argb: '555555' } };
      ws.getRow(3).font = { italic: true, size: 10, color: { argb: '555555' } };
      ws.getRow(5).font = { bold: true, size: 12, color: { argb: '0047AB' } };
      ws.getRow(7).font = { italic: true, size: 10 };
      ws.getRow(9).font = { bold: true, size: 10, color: { argb: '333333' } };

      // মূল টেবিলের হেডার রো (Row 16) বোল্ড করা
      ws.getRow(16).font = { bold: true };

      // ৬. কলাম উইডথ সেটআপ
      ws.columns = [
        { width: 5 }, // #
        { width: 10 }, // ID
        { width: 20 }, // Name
        { width: 15 }, // Phone
        { width: 12 }, // Total Duties
        { width: 10 }, // Approved
        { width: 10 }, // Pending
        { width: 15 }, // Total Amount
        { width: 15 }, // Approved Amount
        { width: 15 }, // Paid Amount
        { width: 15 }, // Unpaid/Due Amount
        { width: 15 }, // Loan Amount
        { width: 18 }, // Payable
        { width: 20 }, // Net Payable
      ];

      // ৭. বাফার তৈরি এবং ব্রাউজারে ফাইল ডাউনলোড ট্রিগার করা
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const fileName = `Employee_Report_${now.toISOString().split('T')[0]}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      window.URL.revokeObjectURL(url);

      toast.success('Detailed report exported successfully');
    } catch (error) {
      toast.error('Failed to export employee report. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getSerialNumber = (index) => {
    return (filters.page - 1) * filters.limit + index + 1;
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header - Notion style */}
      <header className="sticky top-0 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3 max-w-screen-2xl sm:px-12">
          <div className="flex items-center gap-2 overflow-hidden">
            <BreadCrumbMenu />
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md border-gray-200/60">
        <div className="px-6 py-10 lg:py-16 lg:ps-12 lg:pe-6">
          <div className="">
            <h1 className="flex items-center gap-4 text-xl font-bold tracking-tighter text-gray-900 md:text-2xl">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-2xl">
                <Zap className="text-blue-600 w-7 h-7" />
              </div>
              Employee&apos;s Duty Summary Registry
            </h1>
            <p className="max-w-2xl mt-4 text-xs text-gray-500">
              “Monitor, track, and update employee duty records in real-time
              with our precision-engineered monitoring suite.”
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="px-4 mb-4 lg:hidden sm:px-6">
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Main Content with Sidebar */}
      <div className="px-6 pb-8 lg:ps-12 lg:pe-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-80">
            <EmployeeFilterSidebar
              filters={filters}
              setFilters={setFilters}
              statusOptions={statusOptions}
              paymentStatusOptions={paymentStatusOptions}
              monthOptions={monthOptions}
              yearOptions={yearOptions}
              handleClearFilters={handleClearFilters}
            />
          </div>

          {/* Mobile Filter Sidebar */}
          <AnimatePresence>
            {isMobileFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden"
              >
                <EmployeeFilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  statusOptions={statusOptions}
                  paymentStatusOptions={paymentStatusOptions}
                  monthOptions={monthOptions}
                  yearOptions={yearOptions}
                  handleClearFilters={handleClearFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="overflow-hidden">
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {/* Entries per page */}
                    <select
                      value={
                        filters?.limit === pagination.totalItems
                          ? 'all'
                          : filters.limit
                      }
                      onChange={(e) => handleLimitChange(e.target.value)}
                      className="text-black bg-white disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border"
                    >
                      {[5, 10, 20, 50]?.map((size) => (
                        <option key={size} value={size}>
                          {size} per page
                        </option>
                      ))}
                      <option value="all">All</option>
                    </select>

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-md w-[250px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => refetch()}
                      className="p-2 text-gray-500 transition-colors rounded-lg hover:text-gray-700 hover:bg-gray-100"
                      disabled={isFetching}
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
                      />
                    </button>
                    <button
                      onClick={exportToExcel}
                      className="text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Export to excel</span>
                    </button>
                    <Link
                      to="/dashboard/admin/add-emp-duty"
                      className="bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add New Duty</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Enhanced Employee List */}
              <div className="w-full mx-auto antialiased max-w-7xl text-slate-900">
                <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl">
                  {/* Header Section */}
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-800">
                          Employees Overview
                        </h2>
                        <p className="text-xs text-slate-500">
                          Manage staff members, duties, and payments
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100 rounded-full bg-indigo-50">
                          Total: {employees?.length || 0} Employees
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* States Management */}
                  <div className="min-h-[400px] flex flex-col">
                    {/* Loading State */}
                    {isLoading && (
                      <div className="flex flex-col items-center justify-center flex-1 p-12">
                        <Loader2 className="w-10 h-10 mb-4 text-indigo-600 animate-spin" />
                        <p className="font-medium text-slate-500 animate-pulse">
                          Loading employees...
                        </p>
                      </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                      <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
                        <div className="p-4 mb-4 rounded-full bg-red-50">
                          <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          Failed to Load Data
                        </h3>
                        <p className="max-w-xs mb-6 text-slate-500">
                          {error?.data?.message ||
                            'Unable to fetch employee records'}
                        </p>
                        <button
                          onClick={refetch}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-slate-900 hover:bg-slate-800"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && employees?.length === 0 && (
                      <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
                        <div className="p-4 mb-4 rounded-full bg-slate-100">
                          <User className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          No employees found
                        </h3>
                        <p className="max-w-xs mb-6 text-slate-500">
                          Adjust your search or filters to find what you&apos;re
                          looking for.
                        </p>
                        <button
                          onClick={handleClearFilters}
                          className="text-sm font-medium text-indigo-600 underline hover:text-indigo-700 underline-offset-4"
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}

                    {/* Employee List */}
                    {!isLoading && !error && employees?.length > 0 && (
                      <div className="divide-y divide-slate-100">
                        {employees?.map((employee, index) => (
                          <motion.div
                            key={employee._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="group"
                          >
                            <div className="p-3 transition-colors hover:bg-slate-50">
                              {/* Employee Profile Header */}
                              <div className="flex flex-col justify-between gap-3 mb-8 lg:flex-row lg:items-center">
                                <div className="flex items-start gap-4">
                                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 font-bold text-white uppercase rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700">
                                    {employee?.userName?.charAt(0) || 'N/A'}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold leading-tight capitalize text-slate-900">
                                      {employee?.userName || 'Unknown'} #
                                      {getSerialNumber(index)}
                                    </h4>
                                    <div className="flex items-center gap-3 text-slate-500">
                                      <span className="flex items-center gap-1.5 text-[12px] font-medium">
                                        <Phone className="w-3.5 h-3.5" />
                                        {employee?.phone || 'N/A'}
                                      </span>
                                      <span className="text-slate-300">|</span>
                                      <span className="text-[12px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                        {employee?.userId || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border ${
                                      employee?.totalPaidAmount > 0
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-white text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    Paid Duties ({employee?.paidDuties || 0})
                                  </button>
                                  <button
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border ${
                                      employee?.totalDuePayment > 0
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-white text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    Unpaid Duties ({employee?.unpaidDuties || 0}
                                    )
                                  </button>
                                  <button
                                    onClick={() => toggleRow(employee?._id)}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border ${
                                      expandedRows?.has(employee?._id)
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    {expandedRows?.has(employee?._id) ? (
                                      <EyeOff size={14} />
                                    ) : (
                                      <Eye size={14} />
                                    )}
                                    View Duties ({employee?.allDuties?.length})
                                  </button>
                                  <button
                                    onClick={() => toggleLoanRow(employee?._id)}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border ${
                                      expandedLoans?.has(employee?._id)
                                        ? 'bg-red-500 text-white border-red-500 shadow-sm'
                                        : 'bg-white text-slate-700 border-red-100 hover:bg-red-50'
                                    }`}
                                  >
                                    {expandedLoans?.has(employee?._id) ? (
                                      <EyeOff size={14} />
                                    ) : (
                                      <Eye size={14} />
                                    )}
                                    View Loans ({employee?.loans?.length || 0})
                                  </button>

                                  <Link
                                    to={`/dashboard/employee/statements/${employee?._id}?startDate=${filters.startDate}&endDate=${filters.endDate}`}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[12px] font-semibold rounded-md shadow-sm transition-all"
                                  >
                                    <File size={14} />
                                    Statement
                                  </Link>
                                  <Link
                                    to={`/dashboard/invoice/download/${employee?._id}`}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[12px] font-semibold rounded-md shadow-sm transition-all"
                                  >
                                    <ReceiptText size={14} />
                                    Invoice
                                  </Link>
                                  <button
                                    onClick={() =>
                                      handleEmployeePayment(employee)
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[12px] font-semibold rounded-md shadow-sm transition-all"
                                  >
                                    <Banknote size={14} />
                                    Payment
                                  </button>
                                </div>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
                                {[
                                  {
                                    label: 'Total Duties',
                                    val: employee?.totalDuties,
                                    icon: BookOpen,
                                    color: 'text-blue-600',
                                  },
                                  {
                                    label: 'Approved',
                                    val: employee?.approvedDuties,
                                    icon: CreditCard,
                                    color: 'text-green-600',
                                  },
                                  {
                                    label: 'Pending',
                                    val: employee?.pendingDuties,
                                    icon: AlertCircle,
                                    color: 'text-rose-600',
                                  },
                                  {
                                    label: 'Total Amount',
                                    val: employee?.totalAmount?.toLocaleString(
                                      'en-US',
                                      {
                                        style: 'currency',
                                        currency: 'BDT',
                                      },
                                    ),
                                    icon: DollarSign,
                                    color: 'text-cyan-600',
                                  },
                                  {
                                    label: 'Loan Amount',
                                    val: employee?.loanAmount?.toLocaleString(
                                      'en-US',
                                      {
                                        style: 'currency',
                                        currency: 'BDT',
                                      },
                                    ),
                                    icon: AlertCircle,
                                    color: 'text-orange-600',
                                  },
                                  {
                                    label: 'Paid Amount',
                                    val: employee?.paidAmount?.toLocaleString(
                                      'en-US',
                                      {
                                        style: 'currency',
                                        currency: 'BDT',
                                      },
                                    ),
                                    icon: AlertCircle,
                                    color: 'text-orange-600',
                                  },
                                  {
                                    label: 'Due Amount',
                                    val:
                                      employee?.unpaidAmount?.toLocaleString(
                                        'en-US',
                                        {
                                          style: 'currency',
                                          currency: 'BDT',
                                        },
                                      ) || 'N/A',
                                    icon: CheckCircle,
                                    color:
                                      employee?.status === 'approve'
                                        ? 'text-green-600'
                                        : 'text-amber-600',
                                  },
                                  {
                                    label: 'Payable Amount',
                                    val:
                                      employee?.payableAmount?.toLocaleString(
                                        'en-US',
                                        {
                                          style: 'currency',
                                          currency: 'BDT',
                                        },
                                      ) || 'N/A',
                                    icon: CheckCircle,
                                    color:
                                      employee?.status === 'approve'
                                        ? 'text-green-600'
                                        : 'text-amber-600',
                                  },
                                  {
                                    label: 'Payment Progress',
                                    val: `${Math.round(
                                      (employee?.paidAmount /
                                        employee?.totalAmount) *
                                        100 || 0,
                                    )}%`,
                                    icon: BarChart3,
                                    color: 'text-purple-600',
                                  },
                                ]?.map((item, i) => (
                                  <div
                                    key={i}
                                    className="bg-white border border-slate-100 p-3 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] group/stat hover:border-indigo-200 transition-colors"
                                  >
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <item.icon
                                        size={13}
                                        className="transition-colors text-slate-400 group-hover/stat:text-indigo-500"
                                      />
                                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                                        {item?.label}
                                      </span>
                                    </div>
                                    <div
                                      className={`text-xs font-semibold ${item?.color}`}
                                    >
                                      {item?.val || 0}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Progress Bar */}
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[12px] font-medium text-slate-500">
                                    Payment Completion
                                  </span>
                                  <span className="text-[12px] font-bold text-slate-700">
                                    {Math.round(
                                      (employee?.paidAmount /
                                        employee?.totalAmount) *
                                        100 || 0,
                                    )}
                                    %
                                  </span>
                                </div>
                                <div className="w-full h-1.5 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                    style={{
                                      width: `${Math.min(
                                        (employee?.paidAmount /
                                          employee?.totalAmount) *
                                          100,
                                        100,
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Expandable Sections */}
                              <AnimatePresence>
                                {/* Employee Details Table */}
                                {expandedRows?.has(employee?._id) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-4 overflow-hidden border border-purple-100 rounded-lg shadow-sm"
                                  >
                                    <div className="bg-purple-50/50 px-4 py-2.5 border-b border-purple-100">
                                      <h5 className="flex items-center gap-2 text-xs font-bold tracking-wide text-purple-800 uppercase">
                                        <CreditCard size={14} /> DUTIES DETAILS
                                      </h5>
                                    </div>
                                    <div className="overflow-x-auto bg-white">
                                      <table className="w-full text-xs text-left">
                                        <thead className="font-bold border-b text-slate-400 border-slate-100">
                                          <tr>
                                            <th className="px-4 py-3">#</th>
                                            <th className="px-4 py-3 text-left">
                                              Date
                                            </th>
                                            <th className="px-4 py-3">
                                              Total Duty Time
                                            </th>

                                            <th className="px-4 py-3">
                                              Duty Start-End Time
                                            </th>
                                            <th className="px-4 py-3">
                                              Work Details
                                            </th>
                                            <th className="px-4 py-3">Fee</th>
                                            <th className="px-4 py-3">
                                              Status
                                            </th>
                                            <th className="px-4 py-3">
                                              Payment Status
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                          {employee?.allDuties?.map(
                                            (loan, lIdx) => (
                                              <tr
                                                key={loan?._id}
                                                className="transition-colors hover:bg-purple-50/30"
                                              >
                                                <td className="px-4 py-3 text-slate-400">
                                                  {lIdx + 1}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-left text-slate-500">
                                                  {new Date(
                                                    loan?.date,
                                                  ).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-purple-700">
                                                  {formatDutyTime(
                                                    loan.totalDutyTime,
                                                  )}
                                                </td>
                                                <td className="px-4 py-3 font-medium capitalize text-slate-600">
                                                  {formatTimeAMPM(
                                                    loan.dutyStartTime,
                                                  )}
                                                  -
                                                  {formatTimeAMPM(
                                                    loan?.dutyEndTime,
                                                  )}
                                                </td>
                                                <td className="px-4 py-3">
                                                  <span
                                                    className={`px-2 py-0.5 rounded-full text-[12px] font-bold border`}
                                                  >
                                                    {loan?.workDetails}
                                                  </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                  <span
                                                    className={`px-2 py-0.5 rounded-full text-[12px] font-bold border`}
                                                  >
                                                    {loan?.totalDutyFee?.toLocaleString(
                                                      'en-US',
                                                      {
                                                        style: 'currency',
                                                        currency: 'BDT',
                                                      },
                                                    )}
                                                  </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                  {loan?.status && (
                                                    <span
                                                      className={`px-2 py-0.5 rounded-full text-[12px] font-bold border flex items-center gap-1 capitalize ${getStatusBadge(loan?.status)}`}
                                                    >
                                                      <CheckCircle size={12} />{' '}
                                                      {loan?.status}
                                                    </span>
                                                  )}
                                                </td>
                                                <td className="px-4 py-3">
                                                  <span
                                                    className={`px-2 py-0.5 rounded-full text-[12px] font-bold border ${getPaymentBadge(loan?.paymentStatus)}`}
                                                  >
                                                    {loan?.paymentStatus}
                                                  </span>
                                                </td>
                                              </tr>
                                            ),
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </motion.div>
                                )}

                                {/* Loans Table */}
                                {expandedLoans?.has(employee?._id) &&
                                  employee?.loans?.length > 0 && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="mt-4 overflow-hidden border border-purple-100 rounded-lg shadow-sm"
                                    >
                                      <div className="bg-purple-50/50 px-4 py-2.5 border-b border-purple-100">
                                        <h5 className="flex items-center gap-2 text-xs font-bold tracking-wide text-purple-800 uppercase">
                                          <CreditCard size={14} /> Financial
                                          Loan History
                                        </h5>
                                      </div>
                                      <div className="overflow-x-auto bg-white">
                                        <table className="w-full text-xs text-left">
                                          <thead className="font-bold border-b text-slate-400 border-slate-100">
                                            <tr>
                                              <th className="px-4 py-3">#</th>
                                              <th className="px-4 py-3 text-left">
                                                Issue Date
                                              </th>
                                              <th className="px-4 py-3">
                                                Amount
                                              </th>
                                              <th className="px-4 py-3">
                                                Type
                                              </th>
                                              <th className="px-4 py-3">
                                                Status
                                              </th>
                                              <th className="px-4 py-3">
                                                Settled
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-50">
                                            {employee?.loans?.map(
                                              (loan, lIdx) => (
                                                <tr
                                                  key={loan._id}
                                                  className="transition-colors hover:bg-purple-50/30"
                                                >
                                                  <td className="px-4 py-3 text-slate-400">
                                                    {lIdx + 1}
                                                  </td>
                                                  <td className="px-4 py-3 font-medium text-left text-slate-500">
                                                    {new Date(
                                                      loan.date,
                                                    ).toLocaleDateString()}
                                                  </td>
                                                  <td className="px-4 py-3 font-bold text-purple-700">
                                                    ৳
                                                    {loan.amount?.toLocaleString()}
                                                  </td>
                                                  <td className="px-4 py-3 font-medium capitalize text-slate-600">
                                                    {loan.type}
                                                  </td>
                                                  <td className="px-4 py-3">
                                                    <span
                                                      className={`px-2 py-0.5 rounded-full text-[12px] font-bold border ${getStatusBadge(
                                                        loan?.status,
                                                      )}`}
                                                    >
                                                      {loan?.status}
                                                    </span>
                                                  </td>
                                                  <td className="px-4 py-3">
                                                    {loan?.isPaid === true ? (
                                                      <span className="flex items-center gap-1 font-bold text-emerald-600">
                                                        <CheckCircle
                                                          size={12}
                                                        />{' '}
                                                        Yes
                                                      </span>
                                                    ) : (
                                                      <span className="flex items-center gap-1 font-bold text-rose-500">
                                                        <Clock size={12} />{' '}
                                                        Pending
                                                      </span>
                                                    )}
                                                  </td>
                                                </tr>
                                              ),
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    </motion.div>
                                  )}

                                {/* No Loans Message */}
                                {expandedLoans?.has(employee?._id) &&
                                  employee?.loans?.length === 0 && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="mt-4 overflow-hidden border border-purple-100 rounded-lg shadow-sm"
                                    >
                                      <div className="bg-purple-50/50 px-4 py-2.5 border-b border-purple-100">
                                        <h5 className="flex items-center gap-2 text-xs font-bold tracking-wide text-purple-800 uppercase">
                                          <CreditCard size={14} /> Financial
                                          Loan History
                                        </h5>
                                      </div>
                                      <div className="p-8 text-center bg-white">
                                        <p className="text-sm text-slate-500">
                                          No loan records found for this
                                          employee.
                                        </p>
                                      </div>
                                    </motion.div>
                                  )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Footer Pagination Area */}
                    {employees.length > 0 && (
                      <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 mt-auto border-t bg-slate-50/50 border-slate-100 sm:flex-row">
                        <span className="text-xs font-semibold text-slate-500">
                          Displaying {employees?.length || 0} of{' '}
                          {pagination.totalItems || 0} results
                        </span>

                        {/* Pagination Controls */}
                        {pagination?.totalPages > 1 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handlePageChange(filters.page - 1)}
                              disabled={filters.page === 1}
                              className={`p-1.5 rounded-md transition-colors ${
                                filters.page === 1
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({
                              length: Math.min(5, pagination.totalPages),
                            }).map((_, idx) => {
                              let pageNum;
                              if (pagination.totalPages <= 5) {
                                pageNum = idx + 1;
                              } else if (filters.page <= 3) {
                                pageNum = idx + 1;
                              } else if (
                                filters.page >=
                                pagination.totalPages - 2
                              ) {
                                pageNum = pagination.totalPages - 4 + idx;
                              } else {
                                pageNum = filters.page - 2 + idx;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`min-w-[28px] h-7 text-xs font-medium rounded-md transition-colors ${
                                    filters.page === pageNum
                                      ? 'bg-gray-900 text-white'
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}

                            {pagination?.totalPages > 5 &&
                              filters.page < pagination.totalPages - 2 && (
                                <>
                                  <span className="text-gray-400">...</span>
                                  <button
                                    onClick={() =>
                                      handlePageChange(pagination.totalPages)
                                    }
                                    className="min-w-[28px] h-7 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                  >
                                    {pagination.totalPages}
                                  </button>
                                </>
                              )}

                            <button
                              onClick={() => handlePageChange(filters.page + 1)}
                              disabled={filters.page === pagination.totalPages}
                              className={`p-1.5 rounded-md transition-colors ${
                                filters.page === pagination.totalPages
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmployeePaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        employee={selectedEmployee}
        filters={filters}
      />
    </div>
  );
};

export default AllEmployees;

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  XCircle,
  Frown,
  Users,
  Calendar,
  Clock,
  Home,
  ChevronRightIcon,
  Filter,
  X,
  RefreshCw,
  FileText,
  DollarSign,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  SlidersHorizontal,
  User,
  Phone,
  EyeOff,
  Eye,
  File,
  Banknote,
  BookOpen,
  BarChart3,
  ReceiptText,
  Zap,
} from 'lucide-react';
import { useGetAllNursingDutiesSummaryQuery } from '../../../../../redux/features/Nursing/NursingApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';

import NursingFilterSidebar from '../components/NursingFilterSidebar';
import { formatTimeAMPM } from '../../../../../constants/timeFormat';
import { formatDateDMY } from '../../../../../constants/dateFormat';
import { formatDutyTime } from '../../../../../constants/formateDutyTime';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import NursingPaymentModal from '../components/NursingPaymentModal';

const NursingDutiesSummary = () => {
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
  const [selectedNursing, setSelectedNursing] = useState(null);

  // Data fetching
  const { data, isError, error, isLoading, refetch, isFetching } =
    useGetAllNursingDutiesSummaryQuery(filters);

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

  const dutiesSummary = useMemo(() => data?.employees || [], [data]);
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

  const toggleLoanRow = (teacherId) => {
    setExpandedLoans((prev) => {
      const newSet = new Set(prev);
      newSet.has(teacherId) ? newSet.delete(teacherId) : newSet.add(teacherId);
      return newSet;
    });
  };

  const toggleRow = (nursingId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      newSet.has(nursingId) ? newSet.delete(nursingId) : newSet.add(nursingId);
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

  // const handleAction = (action, nursing) => {
  //   switch (action) {
  //     case "statement":
  //       toast.success(`Opening statement for ${nursing.name}`);
  //       // Navigate to statement page
  //       break;
  //     case "invoice":
  //       toast.success(`Generating invoice for ${nursing.name}`);
  //       // Navigate to invoice page
  //       break;
  //     case "payment":
  //       toast.success(`Processing payment for ${nursing.name}`);
  //       // Navigate to payment page
  //       break;
  //     default:
  //       break;
  //   }
  // };

  const handleNursingPayment = (emp) => {
    setSelectedNursing(emp);
    setPaymentModalOpen(true);
  };

  const exportToExcel = async () => {
    if (dutiesSummary.length === 0) {
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
        const digits = phone.replace(/\D/g, '');
        return digits.length === 11 ? digits : digits.padStart(11, '0');
      };

      const headers = [
        '#',
        'ID',
        'Name',
        'Phone',
        'Total Duties',
        'Paid',
        'Unpaid',
        'Approved',
        'Pending',
        'Total Amount',
        'Paid Amount',
        'Unpaid Amount',
      ];

      const dataRows = dutiesSummary?.map((nursing, i) => [
        (filters.page - 1) * filters.limit + (i + 1),
        nursing?.nursingInfo?.userId || 'N/A',
        nursing?.nursingInfo?.userName || 'N/A',
        formatPhone(nursing?.nursingInfo?.phone),
        nursing?.totalDuties || 0,
        nursing?.paidDuties || 0,
        nursing?.unpaidDuties || 0,
        nursing?.approvedDuties || 0,
        nursing?.pendingDuties || 0,
        nursing?.approvedAmount || 0,
        nursing?.paidAmount || 0,
        nursing?.unpaidAmount || 0,
      ]);

      // ১. ওয়ার্কবুক ও ওয়ার্কশিট তৈরি
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Nursing Summary');

      // ২. এক্সেল শিটে রো গুলো ক্রমানুসারে যোগ করা (আপনার আগের sheetData স্ট্রাকচার অনুযায়ী)
      ws.addRow([companyName]);
      ws.addRow([address]);
      ws.addRow([contacts]);
      ws.addRow(['']);
      ws.addRow(['NURSING PERFORMANCE SUMMARY REPORT']);
      ws.addRow(['']);
      ws.addRow([`Generated on: ${dateTime}`]);
      ws.addRow(['']);
      ws.addRow(['FILTERS APPLIED:']);
      ws.addRow(['Start Date:', filters.startDate || 'N/A']);
      ws.addRow(['End Date:', filters.endDate || 'N/A']);
      ws.addRow(['Month:', filters.month || 'N/A']);
      ws.addRow(['Year:', filters.year || 'N/A']);
      ws.addRow(['Status:', filters.status || 'N/A']);
      ws.addRow(['Payment Status:', filters.paymentStatus || 'N/A']);
      ws.addRow(['']);
      ws.addRow(headers); // মূল টেবিল হেডার (Row 17)

      // ডেটা রো গুলো যোগ করা
      ws.addRows(dataRows);

      // ৩. প্রফেশনাল স্টাইলিং ও ফন্ট সেটআপ
      ws.getRow(1).font = { bold: true, size: 14, color: { argb: '003366' } };
      ws.getRow(2).font = { italic: true, size: 10, color: { argb: '555555' } };
      ws.getRow(3).font = { italic: true, size: 10, color: { argb: '555555' } };
      ws.getRow(5).font = { bold: true, size: 12, color: { argb: '0047AB' } };
      ws.getRow(7).font = { italic: true, size: 10 };
      ws.getRow(9).font = { bold: true, size: 10, color: { argb: '333333' } };

      // মূল টেবিলের হেডার রো (headers) বোল্ড করা
      ws.getRow(17).font = { bold: true };

      // ৪. সুন্দর কলাম উইডথ (Column Widths) সেটআপ
      ws.columns = [
        { width: 6 }, // #
        { width: 15 }, // ID
        { width: 25 }, // Name
        { width: 16 }, // Phone
        { width: 14 }, // Total Duties
        { width: 10 }, // Paid
        { width: 10 }, // Unpaid
        { width: 12 }, // Approved
        { width: 12 }, // Pending
        { width: 16 }, // Total Amount
        { width: 16 }, // Paid Amount
        { width: 16 }, // Unpaid Amount
      ];

      // ৫. ফাইল জেনারেট এবং ব্রাউজারে ডাউনলোড ট্রিগার করা
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const formattedDateNow = format(now, 'yyyy-MM-dd');
      const fileName = `Nursing_Summary_${formattedDateNow}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      window.URL.revokeObjectURL(url);

      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report. Please try again.');
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
              Nursing&apos;s Duty Summary Registry
            </h1>
            <p className="max-w-2xl mt-4 text-xs text-gray-500">
              “Monitor, track, and update nursing duty records in real-time with
              our precision-engineered monitoring suite.”
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
      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-80">
            <NursingFilterSidebar
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
                <NursingFilterSidebar
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
            <div className="overflow-hidden ">
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Entries per page */}
                  <select
                    value={
                      filters?.limit === pagination.totalItems
                        ? 'all'
                        : filters.limit
                    }
                    onChange={(e) => handleLimitChange(e.target.value)}
                    className="text-black  bg-white disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border"
                  >
                    {[5, 10, 20, 50]?.map((size) => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                    <option value="all">All</option>
                  </select>

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
                      className="text-white  bg-blue-600  hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Export to excel</span>
                    </button>
                    <Link
                      to="/dashboard/admin/addNursing"
                      className="bg-gray-900 hover:bg-gray-800 text-white  disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add New Duty</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Enhanced Nursing List */}
              <div className="w-full mx-auto antialiased max-w-7xl text-slate-900">
                <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl">
                  {/* Header Section */}
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-800">
                          Nursings Overview
                        </h2>
                        <p className="text-xs text-slate-500">
                          Manage nursing staff, duties, and payments
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100 rounded-full bg-indigo-50">
                          Total: {dutiesSummary?.length || 0} Nurses
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
                          Loading...
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
                            'Unable to fetch nursing records'}
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
                    {!isLoading && !error && dutiesSummary?.length === 0 && (
                      <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
                        <div className="p-4 mb-4 rounded-full bg-slate-100">
                          <User className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          No nursing records found
                        </h3>
                        <p className="max-w-xs mb-6 text-slate-500">
                          Adjust your search or filters to find what you&apos;re
                          looking for.
                        </p>
                        <button
                          onClick={handleClearFilters}
                          className="text-sm font-medium text-indigo-600 underline hover:text-indigo-700 underline-offset-4"
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    {/* Nursing List */}
                    {!isLoading && !error && dutiesSummary?.length > 0 && (
                      <div className="divide-y divide-slate-100">
                        {dutiesSummary?.map((nursing, index) => (
                          <motion.div
                            key={nursing._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="group"
                          >
                            <div className="p-3 transition-colors hover:bg-slate-50">
                              {/* Nursing Profile Header */}
                              <div className="flex flex-col justify-between gap-3 mb-8 lg:flex-row lg:items-center">
                                <div className="flex items-start gap-4">
                                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 border rounded-full bg-slate-100 border-slate-200">
                                    <span className="text-xs font-semibold uppercase text-slate-600">
                                      {nursing?.nursingInfo?.userName?.substring(
                                        0,
                                        1,
                                      ) || 'N/A'}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold leading-tight capitalize text-slate-900">
                                      {nursing?.nursingInfo?.userName ||
                                        'Unknown'}{' '}
                                      #{index + 1}
                                    </h4>
                                    <div className="flex items-center gap-3 text-slate-500">
                                      <span className="flex items-center gap-1.5 text-[12px] font-medium">
                                        <Phone className="w-3.5 h-3.5" />
                                        {nursing?.nursingInfo?.phone || 'N/A'}
                                      </span>
                                      <span className="text-slate-300">|</span>
                                      <span className="text-[12px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                        {nursing?.nursingInfo?.userId || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    // onClick={() => toggleRow(nursing._id)}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border`}
                                  >
                                    Paid Duties ({nursing?.paidDuties})
                                  </button>
                                  <button
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border`}
                                  >
                                    Unpaid Duties ({nursing?.unpaidDuties})
                                  </button>
                                  <button
                                    onClick={() =>
                                      toggleRow(nursing?.nursingInfo?._id)
                                    }
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border ${
                                      expandedRows?.has(
                                        nursing?.nursingInfo?._id,
                                      )
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    {expandedRows?.has(
                                      nursing?.nursingInfo?._id,
                                    ) ? (
                                      <EyeOff size={14} />
                                    ) : (
                                      <Eye size={14} />
                                    )}
                                    View Duties ({nursing?.totalDuties})
                                  </button>
                                  <button
                                    onClick={() =>
                                      toggleLoanRow(nursing?.nursingInfo?._id)
                                    }
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border ${
                                      expandedLoans?.has(
                                        nursing?.nursingInfo?._id,
                                      )
                                        ? 'bg-red-500 text-white border-red-500 shadow-sm'
                                        : 'bg-white text-slate-700 border-red-100 hover:bg-red-50'
                                    }`}
                                  >
                                    {expandedLoans?.has(
                                      nursing?.nursingInfo?._id,
                                    ) ? (
                                      <EyeOff size={14} />
                                    ) : (
                                      <Eye size={14} />
                                    )}
                                    View Loans ({nursing?.loans?.length})
                                  </button>

                                  <Link
                                    to={`/dashboard/nursing/statement/${nursing?.nursingInfo?._id}?startDate=${filters.startDate}&endDate=${filters.endDate}`}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[12px] font-semibold rounded-md shadow-sm transition-all"
                                  >
                                    <File size={14} />
                                    Statement
                                  </Link>
                                  <Link
                                    to={`/dashboard/invoice/download/${nursing?.nursingInfo?._id}`}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[12px] font-semibold rounded-md shadow-sm transition-all"
                                  >
                                    <ReceiptText size={14} />
                                    Invoice
                                  </Link>
                                  <button
                                    onClick={() =>
                                      handleNursingPayment(nursing)
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[12px] font-semibold rounded-md shadow-sm transition-all"
                                  >
                                    <Banknote size={14} />
                                    Payment
                                  </button>
                                </div>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-8">
                                {[
                                  {
                                    label: 'Total Duties',
                                    val: nursing?.totalDuties || 0,
                                    icon: BookOpen,
                                    color: 'text-blue-600',
                                  },
                                  {
                                    label: 'Approved',
                                    val: nursing?.approvedDuties || 0,
                                    icon: CheckCircle,
                                    color: 'text-teal-600',
                                  },
                                  {
                                    label: 'Pending',
                                    val: nursing?.pendingDuties || 0,
                                    icon: Clock,
                                    color: 'text-yellow-600',
                                  },
                                  {
                                    label: 'Total Amount',
                                    val: nursing?.approvedAmount?.toLocaleString(
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
                                    val: nursing?.loanAmount?.toLocaleString(
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
                                    label: 'Paid Amount',
                                    val: nursing?.paidAmount?.toLocaleString(
                                      'en-US',
                                      {
                                        style: 'currency',
                                        currency: 'BDT',
                                      },
                                    ),
                                    icon: CreditCard,
                                    color: 'text-green-600',
                                  },
                                  {
                                    label: 'Due Amount',
                                    val: nursing?.unpaidAmount?.toLocaleString(
                                      'en-US',
                                      {
                                        style: 'currency',
                                        currency: 'BDT',
                                      },
                                    ),
                                    icon: AlertCircle,
                                    color: 'text-rose-600',
                                  },
                                  {
                                    label: 'Payable',
                                    val: nursing?.payableAmount?.toLocaleString(
                                      'en-US',
                                      {
                                        style: 'currency',
                                        currency: 'BDT',
                                      },
                                    ),
                                    icon: AlertCircle,
                                    color: 'text-rose-600',
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
                                      className={`text-[11px] font-semibold ${item?.color}`}
                                    >
                                      {item?.val || 0}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Expandable Details Section */}
                              {/* Expandable Sections */}
                              <AnimatePresence>
                                {/* duties Table */}
                                {expandedRows?.has(
                                  nursing?.nursingInfo?._id,
                                ) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-6 overflow-hidden border rounded-lg shadow-sm border-slate-200"
                                  >
                                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                                      <h5 className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                        <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                                        ACADEMIC DUTY LOGS
                                      </h5>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs text-left border-collapse">
                                        <thead className="font-semibold bg-white border-b text-slate-500 border-slate-200">
                                          <tr>
                                            <th className="px-4 py-3">#</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">
                                              Total Duty Time
                                            </th>
                                            <th className="px-4 py-3">
                                              Duty Start-End Time
                                            </th>
                                            <th className="px-4 py-3">
                                              Mess Name
                                            </th>
                                            <th className="px-4 py-3">Fee</th>
                                            <th className="px-4 py-3 text-center">
                                              Status
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                              Payment
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                          {nursing?.allDuties?.map(
                                            (duty, idx) => (
                                              <tr
                                                key={duty._id}
                                                className="transition-colors hover:bg-slate-50/80"
                                              >
                                                <td className="px-4 py-3 font-medium text-slate-400">
                                                  {idx + 1}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                                                  {formatDateDMY(duty.date)}
                                                </td>
                                                <td className="px-4 py-3">
                                                  <div className="font-bold capitalize text-slate-900">
                                                    {formatDutyTime(
                                                      duty.totalDutyTime,
                                                    )}
                                                  </div>
                                                  <div className="text-slate-500 text-[10px]">
                                                    {duty.department}
                                                  </div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-600">
                                                  {`${formatTimeAMPM(duty?.dutyStartTime)} - ${formatTimeAMPM(duty?.dutyEndTime)}`}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                  {duty.messName}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-slate-900">
                                                  {duty.totalAmount?.toLocaleString(
                                                    'en-US',
                                                    {
                                                      style: 'currency',
                                                      currency: 'BDT',
                                                    },
                                                  )}
                                                </td>
                                                <td className="px-4 py-3">
                                                  <div className="flex justify-center">
                                                    <span
                                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                                                        duty.status,
                                                      )}`}
                                                    >
                                                      {duty.status === 'approve'
                                                        ? 'Approved'
                                                        : duty.status}
                                                    </span>
                                                  </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                  <span
                                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPaymentBadge(
                                                      duty.paymentStatus,
                                                    )}`}
                                                  >
                                                    {duty.paymentStatus ===
                                                    'paid'
                                                      ? 'PAID'
                                                      : 'UNPAID'}
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
                                {expandedLoans?.has(
                                  nursing?.nursingInfo?._id,
                                ) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-4 overflow-hidden border border-purple-100 rounded-lg shadow-sm"
                                  >
                                    <div className="bg-purple-50/50 px-4 py-2.5 border-b border-purple-100">
                                      <h5 className="flex items-center gap-2 text-xs font-bold tracking-wide text-purple-800 uppercase">
                                        <CreditCard size={14} /> Financial Loan
                                        History
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
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">
                                              Status
                                            </th>
                                            <th className="px-4 py-3">
                                              Settled
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                          {nursing?.loans?.map((loan, lIdx) => (
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
                                                ৳{loan.amount?.toLocaleString()}
                                              </td>
                                              <td className="px-4 py-3 font-medium capitalize text-slate-600">
                                                {loan.type}
                                              </td>
                                              <td className="px-4 py-3">
                                                <span
                                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                                                    loan?.status,
                                                  )}`}
                                                >
                                                  {loan?.status}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3">
                                                {loan?.isPaid === true ? (
                                                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                                                    <CheckCircle size={12} />{' '}
                                                    Yes
                                                  </span>
                                                ) : (
                                                  <span className="flex items-center gap-1 font-bold text-rose-500">
                                                    <Clock size={12} /> Pending
                                                  </span>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
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
                    {dutiesSummary.length > 0 && (
                      <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 mt-auto border-t bg-slate-50/50 border-slate-100 sm:flex-row">
                        <span className="text-xs font-semibold text-slate-500">
                          Displaying {dutiesSummary?.length || 0} results
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NursingPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        nursing={selectedNursing}
        filters={filters}
      />
    </div>
  );
};

export default NursingDutiesSummary;

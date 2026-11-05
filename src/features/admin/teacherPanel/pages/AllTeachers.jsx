import { useCallback, useMemo, useState } from 'react';
import { useGetAllTeacherQuery } from '../../../../../redux/features/teacher/teacherApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  Phone,
  User,
  XCircle,
  Loader2,
  CreditCard,
  BookOpen,
  BarChart3,
  Banknote,
  File,
  Zap,
  ReceiptText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import TeacherFilterSidebar from '../components/TeacherFilterSidebar';
import TeacherPaymentModal from '../components/TeacherPaymentModal';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

import ExcelJS from 'exceljs';

const AllTeachers = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [setIsExporting] = useState(false);
  const [activeTab] = useState('summary');

  const [filters, setFilters] = useState({
    search: '',
    batch: [],
    status: '',
    paymentStatus: '',
    year: '',
    month: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
  });

  const {
    data,
    isLoading: teachersLoading,
    isError: teachersError,
    refetch,
  } = useGetAllTeacherQuery(filters);

  const teachers = useMemo(() => data?.teachers || [], [data]);

  const teacherPendingClasses = useMemo(
    () => teachers?.filter((t) => t.pendingClasses > 0) || [],
    [teachers],
  );

  const handleTeacherPayment = (teacher) => {
    setSelectedTeacher(teacher);
    setPaymentModalOpen(true);
  };

  const [expandedRows, setExpandedRows] = useState(new Set());
  const [expandedLoans, setExpandedLoans] = useState(new Set());

  const toggleLoanRow = (teacherId) => {
    setExpandedLoans((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  const toggleRow = (teacherId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
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

  const clearFilters = () => {
    setFilters({
      batch: '',
      status: '',
      paymentStatus: '',
      year: '',
      month: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10,
      search: '',
    });
  };

  // export teachers

  const exportToExcel = useCallback(async () => {
    const dataToExport =
      activeTab === 'summary' ? teachers : teacherPendingClasses;

    if (!dataToExport?.length) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      const now = new Date();
      const fileName = `Teacher_${
        activeTab === 'summary' ? 'Summary' : 'Pending'
      }_${format(now, 'yyyy-MM-dd_HH-mm')}.xlsx`;

      // Prepare data for export with proper number formatting
      const exportData = dataToExport.map((t, index) => ({
        'SL No': index + 1,
        'Teacher ID': t.teacherInfo?.userId || '',
        'Teacher Name': t.teacherInfo?.userName || '',
        'Phone Number': t.teacherInfo?.phone || '',
        'Total Batches': t.totalBatch || 0,
        'Total Subjects': t.totalSubjects || 0,
        'Total Departments': t.totalDepartments || 0,
        'Total Classes': t.totalClasses || 0,
        'Approved Classes': t.approvedClasses || 0,
        'Pending Classes': t.pendingClasses || 0,
        'Paid Classes': t.paidClasses || 0,
        'Unpaid Classes': t.unpaidClasses || 0,
        'Total Amount (৳)': Number(t.totalAmount || 0).toFixed(2),
        'Approved Amount (৳)': Number(t.approvedAmount || 0).toFixed(2),
        'Paid Amount (৳)': Number(t.paidAmount || 0).toFixed(2),
        'Unpaid Amount (৳)': Number(t.unpaidAmount || 0).toFixed(2),
        'Loan Amount (৳)': Number(t.loanAmount || 0).toFixed(2),
        'Due Loan (৳)': Number(t.dueLoan || 0).toFixed(2),
        'Due Amount (৳)': Number(t.dueAmount || 0).toFixed(2),
        'Payable Amount (৳)': Number(t.payableAmount || 0).toFixed(2),
        'Can Pay': t.canPay ? 'Yes' : 'No',
        'Payment Note': t.finalPaymentNote || '',
        'Export Date': format(now, 'yyyy-MM-dd HH:mm:ss'),
        'Filter Batch': filters.batch || 'All',
        'Filter Status': filters.status || 'All',
        'Filter Payment Status': filters.paymentStatus || 'All',
        'Filter Month': filters.month || 'All',
      }));

      // ১. ওয়ার্কবুক ও ওয়ার্কশিট তৈরি
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Teacher Data');

      // ২. কলাম হেডার এবং উইডথ সেটআপ (আপনার আগের colWidths এর মান অনুযায়ী)
      if (exportData.length > 0) {
        const keys = Object.keys(exportData[0]);
        const colWidths = [
          8, // SL No
          15, // Teacher ID
          25, // Teacher Name
          15, // Phone Number
          12, // Total Batches
          12, // Total Subjects
          12, // Total Departments
          12, // Total Classes
          12, // Approved Classes
          12, // Pending Classes
          12, // Paid Classes
          12, // Unpaid Classes
          15, // Total Amount
          15, // Approved Amount
          15, // Paid Amount
          15, // Unpaid Amount
          15, // Loan Amount
          15, // Due Loan
          15, // Due Amount
          15, // Payable Amount
          8, // Can Pay
          40, // Payment Note
          20, // Export Date
          15, // Filter Batch
          15, // Filter Status
          15, // Filter Payment Status
          15, // Filter Month
        ];

        worksheet.columns = keys.map((key, index) => ({
          header: key,
          key: key,
          width: colWidths[index] || 15,
        }));

        worksheet.getRow(1).font = { bold: true };
      }

      // add date
      worksheet.addRows(exportData);

      //  buffer
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      window.URL.revokeObjectURL(url);

      toast.success(`${exportData.length} records exported successfully`);
    } catch (error) {
      toast.error(error?.data?.message);
    } finally {
      setIsExporting(false);
    }
  }, [teachers, teacherPendingClasses, activeTab, filters, setIsExporting]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* breadcrumb header */}
      <header className="sticky top-0 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3 max-w-screen-2xl sm:px-12">
          <div className="flex items-center gap-2 overflow-hidden">
            <BreadCrumbMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-10 mx-auto lg:py-16 lg:ps-12 lg:pe-6">
        {/* Enhanced Header */}
        <div className="mb-12">
          <h1 className="flex items-center gap-4 text-xl font-bold tracking-tighter text-gray-900 tracing-tight md:text-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-2xl">
              <Zap className="text-blue-600 w-7 h-7" />
            </div>
            All Teacher&apos;s Registry
          </h1>
          <p className="max-w-2xl mt-4 text-xs text-gray-500">
            “All teachers and their class schedules are listed here. Easily
            review and manage teacher assignments.”
          </p>
        </div>

        <div className="flex flex-col gap-3 mx-auto lg:flex-row">
          {/* Enhanced Filters Sidebar */}
          <TeacherFilterSidebar filters={filters} setFilters={setFilters} />

          {/* Enhanced Teachers List */}
          <div className="w-full mx-auto antialiased max-w-7xl text-slate-900">
            <button
              onClick={exportToExcel}
              className="text-white  bg-blue-600  hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export to excel </span>
            </button>
            {/* --- Main Container --- */}
            <div className="mt-2 overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl">
              {/* --- Header Section --- */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-800">
                      Teachers Overview
                    </h2>
                    <p className="text-xs text-slate-500">
                      Manage institutional staff, class distribution, and
                      payroll.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100 rounded-full bg-indigo-50">
                      Total: {teachers?.length || 0} Teacher
                    </div>
                  </div>
                </div>
              </div>

              {/* --- States Management --- */}
              <div className="min-h-[400px] flex flex-col">
                {/* Loading State */}
                {teachersLoading && (
                  <div className="flex flex-col items-center justify-center flex-1 p-12">
                    <Loader2 className="w-10 h-10 mb-4 text-indigo-600 animate-spin" />
                    <p className="font-medium text-slate-500 animate-pulse">
                      Please wait...
                    </p>
                  </div>
                )}

                {/* Error State */}
                {teachersError && (
                  <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
                    <div className="p-4 mb-4 rounded-full bg-red-50">
                      <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Connection Failed
                    </h3>
                    <p className="max-w-xs mb-6 text-slate-500">
                      We couldn&apos;t fetch the teacher records. Please check
                      your network.
                    </p>
                    <button
                      onClick={refetch}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-slate-900 hover:bg-slate-800"
                    >
                      Retry Connection
                    </button>
                  </div>
                )}

                {/* Empty State */}
                {!teachersLoading &&
                  !teachersError &&
                  (activeTab === 'summary'
                    ? teachers?.length === 0
                    : teacherPendingClasses?.length === 0) && (
                    <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
                      <div className="p-4 mb-4 rounded-full bg-slate-100">
                        <User className="w-10 h-10 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        No records found
                      </h3>
                      <p className="max-w-xs mb-6 text-slate-500">
                        {activeTab === 'summary'
                          ? "Adjust your search or filters to find what you're looking for."
                          : 'No teachers with pending payments at the moment.'}
                      </p>
                      <button
                        onClick={clearFilters}
                        className="text-sm font-medium text-indigo-600 underline hover:text-indigo-700 underline-offset-4"
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                {/* --- Teachers List --- */}
                {!teachersLoading &&
                  !teachersError &&
                  (activeTab === 'summary'
                    ? teachers?.length > 0
                    : teacherPendingClasses?.length > 0) && (
                    <div className="divide-y divide-slate-100">
                      {(activeTab === 'summary'
                        ? teachers
                        : teacherPendingClasses
                      )?.map((teacher, index) => (
                        <motion.div
                          key={teacher.teacherInfo._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="group"
                        >
                          <div className="p-3 transition-colors hover:bg-slate-50">
                            {/* Teacher Profile Header */}
                            <div className="flex flex-col justify-between gap-3 mb-8 lg:flex-row lg:items-center">
                              <div className="flex items-start gap-4">
                                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 border rounded-full bg-slate-100 border-slate-200">
                                  <span className="text-xs font-semibold uppercase text-slate-600">
                                    {teacher?.teacherInfo?.userName?.substring(
                                      0,
                                      1,
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold leading-tight capitalize text-slate-900">
                                    {teacher?.teacherInfo?.userName} #
                                    {index + 1}
                                  </h4>
                                  <div className="flex items-center gap-3 text-slate-500">
                                    <span className="flex items-center gap-1.5 text-[12px] font-medium">
                                      <Phone className="w-3.5 h-3.5" />
                                      {teacher?.teacherInfo?.phone}
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-[12px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                      {teacher?.teacherInfo?.userId}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  // onClick={() =>
                                  //   toggleRow(teacher?.teacherInfo?._id)
                                  // }
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border ${
                                    expandedRows?.has(teacher?.teacherInfo?._id)
                                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {/* {expandedRows?.has(
                                    teacher.teacherInfo._id,
                                  ) ? (
                                    <EyeOff size={14} />
                                  ) : (
                                    <Eye size={14} />
                                  )} */}
                                  Dept. ({teacher?.totalDepartments || 0})
                                </button>
                                <button
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border ${
                                    expandedRows?.has(teacher?.teacherInfo?._id)
                                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  Subjects ({teacher?.totalSubjects || 0})
                                </button>
                                <button
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border ${
                                    expandedRows?.has(teacher?.teacherInfo?._id)
                                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  Batches ({teacher?.totalBatch || 0})
                                </button>
                                <button
                                  onClick={() =>
                                    toggleRow(teacher?.teacherInfo?._id)
                                  }
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border ${
                                    expandedRows?.has(teacher?.teacherInfo?._id)
                                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {expandedRows?.has(
                                    teacher?.teacherInfo?._id,
                                  ) ? (
                                    <EyeOff size={14} />
                                  ) : (
                                    <Eye size={14} />
                                  )}
                                  Classes ({teacher?.allClasses?.length || 0})
                                </button>

                                <button
                                  onClick={() =>
                                    toggleLoanRow(teacher?.teacherInfo?._id)
                                  }
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border ${
                                    expandedLoans?.has(teacher?.teacherInfo._id)
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                      : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                                  }`}
                                >
                                  <CreditCard size={14} />
                                  Loans ({teacher?.loans?.length || 0})
                                </button>

                                <Link
                                  to={`/dashboard/teacher/statement/${teacher?.teacherInfo?._id}?startDate=${filters.startDate}&endDate=${filters.endDate}`}
                                  // to={`/dashboard/teacher/statement/${teacher?.teacherInfo?._id}`}
                                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[12px] font-semibold rounded-md shadow-sm transition-all"
                                >
                                  <File size={14} />
                                  Statements
                                </Link>
                                <Link
                                  to={`/dashboard/invoice/download/${teacher?.teacherInfo?._id}`}
                                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[12px] font-semibold rounded-md shadow-sm transition-all"
                                >
                                  <ReceiptText size={14} />
                                  invoices
                                </Link>

                                <button
                                  onClick={() => handleTeacherPayment(teacher)}
                                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[12px] font-semibold rounded-md shadow-sm transition-all"
                                >
                                  {' '}
                                  <Banknote size={14} />
                                  Payment
                                </button>
                              </div>
                            </div>

                            {/* Shadcn-Style Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-8">
                              {[
                                {
                                  label: 'Total Classes',
                                  val: teacher?.totalClasses,
                                  icon: BookOpen,
                                  color: 'text-blue-600',
                                },
                                {
                                  label: 'Approved',
                                  val: teacher?.approvedClasses,
                                  icon: CheckCircle,
                                  color: 'text-teal-600',
                                },
                                {
                                  label: 'Pending',
                                  val: teacher?.pendingClasses,
                                  icon: Clock,
                                  color: 'text-yellow-600',
                                },
                                {
                                  label: 'Earnings',
                                  val: `${teacher?.approvedAmount?.toLocaleString(
                                    'en-US',
                                    {
                                      style: 'currency',
                                      currency: 'BDT',
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    },
                                  )}`,
                                  icon: DollarSign,
                                  color: 'text-cyan-600',
                                },
                                {
                                  label: 'Loaned',
                                  val: `${teacher?.loanAmount?.toLocaleString(
                                    'en-US',
                                    {
                                      style: 'currency',
                                      currency: 'BDT',
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    },
                                  )}`,
                                  icon: CreditCard,
                                  color: 'text-purple-600',
                                },
                                {
                                  label: 'Paid',
                                  val: `${teacher?.paidAmount?.toLocaleString(
                                    'en-US',
                                    {
                                      style: 'currency',
                                      currency: 'BDT',
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    },
                                  )}`,
                                  icon: CreditCard,
                                  color: 'text-green-600',
                                },
                                {
                                  label:
                                    teacher?.loanAmount > teacher?.dueAmount
                                      ? 'Loan Due'
                                      : 'Due Balance',
                                  val: `${(teacher?.loanAmount >
                                  teacher?.unpaidAmount
                                    ? teacher?.loanAmount
                                    : teacher?.unpaidAmount
                                  )?.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'BDT',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}`,
                                  icon: AlertCircle,
                                  color: 'text-rose-600',
                                },
                                {
                                  label: 'Payable',
                                  val: `${teacher?.payableAmount?.toLocaleString(
                                    'en-US',
                                    {
                                      style: 'currency',
                                      currency: 'BDT',
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    },
                                  )}`,
                                  icon: BarChart3,
                                  color: 'text-indigo-600',
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

                            {/* Expandable Sections */}
                            <AnimatePresence>
                              {/* Classes Table */}
                              {expandedRows?.has(teacher.teacherInfo._id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="mt-6 overflow-hidden border rounded-lg shadow-sm border-slate-200"
                                >
                                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                                    <h5 className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                      <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                                      ACADEMIC CLASS LOGS
                                    </h5>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left border-collapse">
                                      <thead className="font-semibold bg-white border-b text-slate-500 border-slate-200">
                                        <tr>
                                          <th className="px-4 py-3">#</th>
                                          <th className="px-4 py-3">Date</th>
                                          <th className="px-4 py-3">
                                            Subject / Dept
                                          </th>
                                          <th className="px-4 py-3">Batch</th>
                                          <th className="px-4 py-3">
                                            Duration
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
                                        {teacher?.allClasses?.map(
                                          (cls, idx) => (
                                            <tr
                                              key={cls._id}
                                              className="transition-colors hover:bg-slate-50/80"
                                            >
                                              <td className="px-4 py-3 font-medium text-slate-400">
                                                {idx + 1}
                                              </td>
                                              <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                                                {cls.classDate}
                                              </td>
                                              <td className="px-4 py-3">
                                                <div className="font-bold capitalize text-slate-900">
                                                  {cls.subject}
                                                </div>
                                                <div className="text-slate-500 text-[10px]">
                                                  {cls.department}
                                                </div>
                                              </td>
                                              <td className="px-4 py-3 font-semibold text-slate-600">
                                                {cls.batch}
                                              </td>
                                              <td className="px-4 py-3 font-medium">
                                                {cls.classQuantity} hr
                                              </td>
                                              <td className="px-4 py-3 font-bold text-slate-900">
                                                ৳
                                                {cls.totalFee?.toLocaleString()}
                                              </td>
                                              <td className="px-4 py-3">
                                                <div className="flex justify-center">
                                                  <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                                                      cls.status,
                                                    )}`}
                                                  >
                                                    {cls.status === 'approve'
                                                      ? 'Approved'
                                                      : cls.status}
                                                  </span>
                                                </div>
                                              </td>
                                              <td className="px-4 py-3 text-right">
                                                <span
                                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPaymentBadge(
                                                    cls.paymentStatus,
                                                  )}`}
                                                >
                                                  {cls.paymentStatus === 'paid'
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
                                teacher?.teacherInfo?._id,
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
                                          <th className="px-4 py-3">Amount</th>
                                          <th className="px-4 py-3">Type</th>
                                          <th className="px-4 py-3">Status</th>
                                          <th className="px-4 py-3">Settled</th>
                                          <th className="px-4 py-3 text-right">
                                            Issue Date
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-50">
                                        {teacher?.loans?.map((loan, lIdx) => (
                                          <tr
                                            key={loan._id}
                                            className="transition-colors hover:bg-purple-50/30"
                                          >
                                            <td className="px-4 py-3 text-slate-400">
                                              {lIdx + 1}
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
                                                  loan.status,
                                                )}`}
                                              >
                                                {loan.status}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3">
                                              {loan.isPaid ? (
                                                <span className="flex items-center gap-1 font-bold text-emerald-600">
                                                  <CheckCircle size={12} /> Yes
                                                </span>
                                              ) : (
                                                <span className="flex items-center gap-1 font-bold text-rose-500">
                                                  <Clock size={12} /> Pending
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-right text-slate-500">
                                              {new Date(
                                                loan.date,
                                              ).toLocaleDateString()}
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
                <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 mt-auto border-t bg-slate-50/50 border-slate-100 sm:flex-row">
                  <span className="text-xs font-semibold text-slate-500">
                    Displaying{' '}
                    {(activeTab === 'summary'
                      ? teachers?.length
                      : teacherPendingClasses?.length) || 0}{' '}
                    results
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TeacherPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        teacher={selectedTeacher}
        filters={filters}
      />
    </div>
  );
};

export default AllTeachers;

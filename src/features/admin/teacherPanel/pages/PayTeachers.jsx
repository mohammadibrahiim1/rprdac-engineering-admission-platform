// components/ClassList.jsx
import React, { useState } from 'react';
import {
  useGetAllTeacherQuery,
  useUpdatePaymentAndGenerateTeacherInvoiceMutation,
} from '../../../../../redux/features/teacher/teacherApi';
import { useGetBatchesQuery } from '../../../../../redux/features/batch/batchApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  Filter,
  Mail,
  Phone,
  RefreshCw,
  Search,
  User,
  Users,
  X,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  BookOpen,
  BarChart3,
  FileText,
  BadgeCheck,
  Wallet,
  ChevronRight,
  Home,
  LayoutGrid,
  Activity,
  Layers,
  Banknote,
} from 'lucide-react';
import toast from 'react-hot-toast';

import bgLogo from '../../../../../assets/img/log-rpr.png';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import TeacherFilterSidebar from '../components/TeacherFilterSidebar';
import TeacherPaymentModal from '../components/TeacherPaymentModal';

const PayTeachers = () => {
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    searchQuery: '',
    batch: '',
    status: '',
    paymentStatus: '',
    year: '',
    month: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
  });

  const { data: batches, isLoading: batchesLoading } =
    useGetBatchesQuery(search);

  const allBatches = batches?.data || [];

  const {
    data,
    isLoading: teachersLoading,
    isError: teachersError,
    refetch,
  } = useGetAllTeacherQuery(filters);

  const teachers = data?.teachers || [];

  const [
    updatePaymentAndGenerateTeacherInvoice,
    { isLoading: isGeneratingInvoice },
  ] = useUpdatePaymentAndGenerateTeacherInvoiceMutation();

  const handleGenerateInvoice = async (teacherId) => {
    try {
      const result = await updatePaymentAndGenerateTeacherInvoice({
        teacherId,
        batch: filters.batch,
        startDate: filters.startDate,
        endDate: filters.endDate,
      }).unwrap();

      if (result?.success) {
        toast.success('Invoice generated successfully!');
        if (result.data?.invoiceUrl) {
          window.open(result.data.invoiceUrl, '_blank');
        }
      } else {
        toast.error(result?.message || 'Failed to generate invoice');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to generate invoice');
    }
  };

  const handleTeacherPayment = (teacher) => {
    setSelectedTeacher(teacher);
    setPaymentModalOpen(true);
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleSelectChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value === 'all' ? '' : value,
      page: 1,
    });
  };

  const handlePageChange = (dir) => {
    setFilters((prev) => ({
      ...prev,
      page: dir === 'next' ? prev.page + 1 : Math.max(prev.page - 1, 1),
    }));
  };

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      value !== '' &&
      value !== 10 &&
      value !== 1 &&
      !['page', 'limit'].includes(key),
  ).length;

  const [expandedRows, setExpandedRows] = useState(new Set());
  const [expandedLoans, setExpandedLoans] = useState(new Set());

  const toggleLoanRow = (teacherId) => {
    setExpandedLoans((prev) => {
      const newSet = new Set(prev);
      newSet.has(teacherId) ? newSet.delete(teacherId) : newSet.add(teacherId);
      return newSet;
    });
  };

  const toggleRow = (teacherId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      newSet.has(teacherId) ? newSet.delete(teacherId) : newSet.add(teacherId);
      return newSet;
    });
  };

  const toggleTeacherSelection = (teacherId) => {
    setSelectedTeacher((prev) => {
      if (prev.includes(teacherId)) {
        return prev.filter((id) => id !== teacherId); // uncheck
      } else {
        return [...prev, teacherId]; // check
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedTeacher?.length === teachers?.length) {
      setSelectedTeacher([]); // unselect all
    } else {
      setSelectedTeacher(teachers.map((t) => t.teacherInfo._id)); // select all
    }
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
    });
  };

  const filterFields = [
    {
      label: 'Batch',
      name: 'batch',
      icon: <Layers className="w-4 h-4" />,
      type: 'select',
      options: ['All Batches', ...allBatches.map((b) => b.title)],
      loading: batchesLoading,
    },
    {
      label: 'Status',
      name: 'status',
      icon: <Activity className="w-4 h-4" />,
      type: 'select',
      options: ['All Status', 'pending', 'approve', 'rejected'],
    },
    {
      label: 'Payment',
      name: 'paymentStatus',
      icon: <CreditCard className="w-4 h-4" />,
      type: 'select',
      options: ['All Payments', 'paid', 'unpaid'],
    },
    {
      label: 'Month',
      name: 'month',
      icon: <Calendar className="w-4 h-4" />,
      type: 'month',
    },
    {
      label: 'Limit',
      name: 'limit',
      icon: <LayoutGrid className="w-4 h-4" />,
      type: 'select',
      options: ['5 items', '10 items', '20 items', '50 items'],
    },
  ];

  return (
    <div className="min-h-screen ">
      {/* Enhanced Header */}
      <header className="relative overflow-hidden bg-[#437373] mb-8 border border-white/10 shadow-2xl">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full -top-24 -right-24 w-96 h-96 bg-blue-500/20 blur-3xl animate-pulse" />
          <div className="absolute rounded-full -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 blur-3xl animate-bounce" />
          {/* Background Logo Overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] bg-no-repeat bg-contain bg-center scale-150"
            style={{ backgroundImage: `url(${bgLogo})` }}
          />
        </div>

        <div className="relative px-6 py-8 md:px-10 md:py-12 lg:px-16 lg:py-16">
          <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Side: Content */}
            <div className="text-white lg:col-span-7 xl:col-span-8">
              {/* 1. Breadcrumb Menu */}
              <BreadCrumbMenu />

              {/* 2. Title & Subtitle */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white md:text-2xl lg:text-3xl">
                  Manage{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
                    Teacher&apos;s
                  </span>
                  <br />
                  Payments
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-xl mt-4 text-xs leading-relaxed text-blue-100/70"
                >
                  An intelligent system to record and process teacher payments
                  with automated precision, transparent logs, and ease of
                  management.
                </motion.p>

                {/* Quick Status Badges */}
                {/* <div className="flex flex-wrap gap-3 mt-8">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white backdrop-blur-md">
                    <Wallet className="w-3.5 h-3.5 text-yellow-500" />
                    Total Disbursed: ৳ 4.5M
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white backdrop-blur-md">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Verified System
                  </div>
                </div> */}
              </motion.div>
            </div>

            {/* Right Side: Payment SVG Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="justify-center hidden lg:flex lg:col-span-5 xl:col-span-4"
            >
              <div className="relative group">
                {/* Decorative Glow */}
                <div className="absolute inset-0 bg-yellow-500/20 blur-[80px] rounded-full group-hover:bg-yellow-500/30 transition-all duration-500" />

                {/* Payment Themed Illustration */}
                <svg
                  viewBox="0 0 500 500"
                  className="w-full max-w-[220px] xl:max-w-[220px] h-auto drop-shadow-2xl"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Simplified Professional Teacher/Payment Illustration */}
                  <circle
                    cx="250"
                    cy="250"
                    r="200"
                    fill="white"
                    fillOpacity="0.05"
                  />
                  {/* Floating Credit Cards */}
                  <rect
                    x="120"
                    y="180"
                    width="220"
                    height="140"
                    rx="20"
                    fill="#F4B41A"
                    transform="rotate(-10 250 250)"
                  />
                  <rect
                    x="180"
                    y="220"
                    width="220"
                    height="140"
                    rx="20"
                    fill="white"
                    fillOpacity="0.9"
                    transform="rotate(5 250 250)"
                  />

                  {/* Details on card */}
                  <rect
                    x="210"
                    y="250"
                    width="100"
                    height="8"
                    rx="4"
                    fill="#00175F"
                    fillOpacity="0.2"
                    transform="rotate(5 250 250)"
                  />
                  <rect
                    x="210"
                    y="270"
                    width="60"
                    height="8"
                    rx="4"
                    fill="#00175F"
                    fillOpacity="0.2"
                    transform="rotate(5 250 250)"
                  />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-5 mx-auto lg:ps-12 lg:pe-6">
        <div className="flex flex-col gap-3 mx-auto lg:flex-row">
          {/* Enhanced Filters Sidebar */}
          <TeacherFilterSidebar filters={filters} setFilters={setFilters} />

          {/* Enhanced Teachers List */}
          <div className="w-full mx-auto antialiased max-w-7xl text-slate-900">
            {/* --- Main Container --- */}
            <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl">
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
                    {/* <label className="flex items-center gap-2 mt-5 text-xs font-semibold cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={
                          teachers.length > 0 &&
                          selectedTeacher.length === teachers.length
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer border-slate-300 focus:ring-indigo-500"
                      />
                      Select All
                    </label> */}
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
                      Synchronizing teacher database...
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
                  teachers?.length === 0 && (
                    <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
                      <div className="p-4 mb-4 rounded-full bg-slate-100">
                        <User className="w-10 h-10 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        No records found
                      </h3>
                      <p className="max-w-xs mb-6 text-slate-500">
                        Adjust your search or filters to find what you&apos;re
                        looking for.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="text-sm font-medium text-indigo-600 underline hover:text-indigo-700 underline-offset-4"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}

                {/* --- Teachers List --- */}
                {!teachersLoading && !teachersError && teachers?.length > 0 && (
                  <div className="divide-y divide-slate-100">
                    {teachers?.map((teacher, index) => (
                      <motion.div
                        key={teacher.teacherInfo._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group"
                      >
                        <div className="p-6 transition-colors hover:bg-slate-50">
                          {/* Teacher Profile Header */}
                          <div className="flex flex-col justify-between gap-6 mb-8 lg:flex-row lg:items-center">
                            <div className="flex items-start gap-4">
                              <div className="pt-1">
                                {/* <input
                                  type="checkbox"
                                  checked={selectedTeacher?.includes(
                                    teacher?.teacherInfo?._id,
                                  )}
                                  onChange={() =>
                                    toggleTeacherSelection(
                                      teacher?.teacherInfo?._id,
                                    )
                                  }
                                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer border-slate-300 focus:ring-indigo-500"
                                /> */}
                              </div>
                              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 border rounded-full bg-slate-100 border-slate-200">
                                <span className="text-sm font-bold uppercase text-slate-600">
                                  {teacher?.teacherInfo?.userName?.substring(
                                    0,
                                    1,
                                  )}
                                </span>
                              </div>
                              <div>
                                <h4 className="text-base font-bold leading-tight capitalize text-slate-900">
                                  {teacher?.teacherInfo?.userName}
                                </h4>
                                <div className="flex items-center gap-3 mt-1 text-slate-500">
                                  <span className="flex items-center gap-1.5 text-xs font-medium">
                                    <Phone className="w-3.5 h-3.5" />
                                    {teacher?.teacherInfo?.phone}
                                  </span>
                                  <span className="text-slate-300">|</span>
                                  <span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                    ID: {teacher.teacherInfo._id.slice(-5)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() =>
                                  toggleRow(teacher.teacherInfo._id)
                                }
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                  expandedRows?.has(teacher.teacherInfo._id)
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {expandedRows?.has(teacher.teacherInfo._id) ? (
                                  <EyeOff size={14} />
                                ) : (
                                  <Eye size={14} />
                                )}
                                Classes ({teacher?.allClasses?.length || 0})
                              </button>

                              <button
                                onClick={() =>
                                  toggleLoanRow(teacher.teacherInfo._id)
                                }
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                  expandedLoans?.has(teacher.teacherInfo._id)
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                                }`}
                              >
                                <CreditCard size={14} />
                                Loans ({teacher?.loans?.length || 0})
                              </button>

                              <button
                                onClick={() =>
                                  handleGenerateInvoice(
                                    teacher?.teacherInfo?._id,
                                  )
                                }
                                disabled={isGeneratingInvoice}
                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-md shadow-sm transition-all"
                              >
                                {isGeneratingInvoice ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Download size={14} />
                                )}
                                Invoice
                              </button>

                              <button
                                onClick={() => handleTeacherPayment(teacher)}
                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-md shadow-sm transition-all"
                              >
                                Payment
                              </button>
                            </div>
                          </div>

                          {/* Shadcn-Style Stats Grid */}
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
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
                                color: 'text-emerald-600',
                              },
                              {
                                label: 'Pending',
                                val: teacher?.pendingClasses,
                                icon: Clock,
                                color: 'text-amber-600',
                              },
                              {
                                label: 'Earnings',
                                val: `৳${teacher?.approvedAmount?.toLocaleString()}`,
                                icon: DollarSign,
                                color: 'text-slate-900',
                              },
                              {
                                label: 'Loaned',
                                val: `৳${teacher?.loanAmount?.toLocaleString()}`,
                                icon: CreditCard,
                                color: 'text-purple-600',
                              },
                              {
                                label:
                                  teacher?.dueLoan > teacher?.dueAmount
                                    ? 'Loan Due'
                                    : 'Due Balance',
                                val: `৳${(teacher?.dueLoan > teacher?.dueAmount ? teacher?.dueLoan : teacher?.dueAmount)?.toLocaleString()}`,
                                icon: AlertCircle,
                                color: 'text-rose-600',
                              },
                              {
                                label: 'Payable',
                                val: `৳${teacher?.payableAmount?.toLocaleString()}`,
                                icon: BarChart3,
                                color: 'text-indigo-600',
                              },
                            ].map((item, i) => (
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
                                    {item.label}
                                  </span>
                                </div>
                                <div
                                  className={`text-sm font-bold ${item.color}`}
                                >
                                  {item.val || 0}
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
                                        <th className="px-4 py-3">Duration</th>
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
                                      {teacher?.allClasses?.map((cls, idx) => (
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
                                            ৳{cls.totalFee?.toLocaleString()}
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="flex justify-center">
                                              <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(cls.status)}`}
                                              >
                                                {cls.status === 'approve'
                                                  ? 'Approved'
                                                  : cls.status}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                            <span
                                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPaymentBadge(cls.paymentStatus)}`}
                                            >
                                              {cls.paymentStatus === 'paid'
                                                ? 'PAID'
                                                : 'UNPAID'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </motion.div>
                            )}

                            {/* Loans Table */}
                            {expandedLoans?.has(teacher.teacherInfo._id) && (
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
                                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(loan.status)}`}
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
                    Displaying {teachers?.length || 0} results from active
                    database
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-xs font-bold bg-white border rounded cursor-not-allowed border-slate-200 text-slate-400">
                      Previous
                    </button>
                    <button className="px-3 py-1 text-xs font-bold transition-colors bg-white border rounded border-slate-200 text-slate-600 hover:bg-slate-50">
                      Next
                    </button>
                  </div>
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

export default PayTeachers;

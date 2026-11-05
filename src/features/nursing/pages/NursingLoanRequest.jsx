import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowRight,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  X,
  Search,
  UserCircle,
  CheckCircle,
  Phone,
  RefreshCw,
  PlusCircle,
  Calendar,
  Wallet,
  Pencil,
  Banknote,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  useDeleteLoanMutation,
  useGetLoansQuery,
  useUpdateLoanDataMutation,
} from '../../../../redux/features/loan/loanApi';
import { useUserRequestForLoanMutation } from '../../../../redux/features/admin/adminApi';
import BreadCrumbMenu from '../../../../components/BreadCrumbMenu';
import { useGetallNursingUserQuery } from '../../../../redux/features/Nursing/NursingApi';
import toast from 'react-hot-toast';

// Validation Schemas
const schema = z.object({
  nursingMember: z
    .any()
    .refine((val) => val !== null, 'Please select a nursing member'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
});

const updateSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['pending', 'approve', 'rejected']),
});

const RequestForLoanNursing = () => {
  const [panelType] = useState('nursing');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editingLoan, setEditingLoan] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);
  const [selectedLoans, setSelectedLoans] = useState([]);

  // API Hooks
  const { data: nursingData } = useGetallNursingUserQuery({ search });

  const {
    data,
    isLoading: isFetching,
    isFetching: isRefetching,
    refetch,
    error: apiError,
  } = useGetLoansQuery({
    panelType,
    status,
    search,
    date: dateFilter,
    page,
    limit: 10,
  });

  const [userRequestForLoan, { isLoading: isSubmitting }] =
    useUserRequestForLoanMutation();

  const [updateLoanData, { isLoading: isUpdating }] =
    useUpdateLoanDataMutation();
  const [deleteLoan] = useDeleteLoanMutation();

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', nursingMember: null },
  });

  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm({
    resolver: zodResolver(updateSchema),
  });

  // Handle Outside Click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update Modal Logic
  useEffect(() => {
    if (editingLoan) {
      resetUpdate({
        amount: editingLoan.amount,
        status: editingLoan.status,
        date: new Date(editingLoan.date || editingLoan.createdAt)
          .toISOString()
          .split('T')[0],
      });
    }
  }, [editingLoan, resetUpdate]);

  const { data: loans = [], stats = {}, pagination = {} } = data || {};

  const handleSelectLoan = (id) => {
    setSelectedLoans((prev) =>
      prev.includes(id)
        ? prev.filter((loanId) => loanId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedLoans.length === loans.length) {
      setSelectedLoans([]);
    } else {
      setSelectedLoans(loans.map((loan) => loan._id));
    }
  };

  const onSubmit = async (formData) => {
    try {
      const res = await userRequestForLoan({
        userId: formData.nursingMember?._id,
        amount: Number(formData.amount),
        userName: formData.nursingMember?.userName,
        phone: formData.nursingMember?.phone,
        userType: 'nursing',
      }).unwrap();
      toast.success(res?.message);
      refetch();
      reset();
    } catch (err) {
      toast.error(err?.data?.message || 'Request failed!');
    }
  };

  const onUpdateSubmit = async (formData) => {
    try {
      const res = await updateLoanData({
        id: editingLoan?._id,
        ...formData,
      }).unwrap();
      toast.success(res?.message);
      setEditingLoan(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message);
    }
  };

  const handleDeleteSelected = async (id) => {
    if (!window.confirm('Delete selected loan requests permanently?')) return;

    try {
      const res = await deleteLoan({ ids: selectedLoans }).unwrap();
      toast.success(res?.message);

      refetch();
    } catch (err) {
      toast.err(err?.data?.message);
    }
  };

  // UI Components Styles
  const inputStyles =
    'w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-[14px]';
  const labelStyles =
    'text-[11px] font-bold text-gray-500 mb-2 block uppercase tracking-widest';

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#37352F] selection:bg-blue-100">
      {/* breadcrumb header  */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#F1F1F0] h-12 flex items-center px-6">
        <BreadCrumbMenu />
      </nav>

      <main className="px-4 py-14">
        {/* Title Section */}
        {/* Page Title */}
        <div className="flex flex-wrap justify-center mb-12 md:justify-between md:items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Loan Registry
              </h1>
              <p className="text-[#7E7D77] text-sm mt-1">
                Manage and track employee financial disbursements.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-6 mt-8 md:mt-0 ">
            <div className="text-right">
              <p className={labelStyles}>Approved Total</p>
              <p className="text-xl font-bold">
                {stats?.totalApprovedAmount?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'BDT',
                }) || 0}
              </p>
            </div>
            <div className="w-px h-10 bg-[#EDECE9]" />
            <div className="text-right">
              <p className={labelStyles}>Pending</p>
              <p className="text-xl font-bold text-amber-500">
                {stats?.pendingCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Left Column: Form Section */}
          <section className="lg:w-[400px] space-y-8">
            <div className="p-6 bg-white border border-gray-200 rounded shadow-sm">
              <h3 className="flex items-center gap-2 mb-8 text-sm font-bold tracking-tight text-gray-800 uppercase">
                <PlusCircle className="w-4 h-4 text-blue-500" /> New Loan
                Request
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className={labelStyles}>Select Nursing</label>
                  <Controller
                    name="nursingMember"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <div ref={containerRef} className="relative">
                        <div className="relative">
                          <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                          <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                              setSearch(e.target.value);
                              setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            placeholder="Find by name or phone..."
                            className={`${inputStyles} pl-10 h-11`}
                          />
                        </div>

                        <AnimatePresence>
                          {isDropdownOpen && nursingData?.data?.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute z-50 w-full mt-2 overflow-y-auto bg-white border border-gray-200 shadow-2xl rounded-xl max-h-60"
                            >
                              {nursingData?.data?.map((staff) => (
                                <button
                                  key={staff._id}
                                  type="button"
                                  onClick={() => {
                                    onChange(staff);
                                    setSearch(staff.userName);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="flex items-center w-full gap-3 px-4 py-3 text-left transition-colors border-b hover:bg-blue-50/50 border-gray-50 last:border-0"
                                >
                                  <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-blue-600 uppercase bg-blue-100 rounded-full">
                                    {staff.userName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800 capitalize">
                                      {staff.userName}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                      {staff.phone}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="mt-4">
                          {value ? (
                            <div className="flex items-center gap-4 p-4 border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <UserCircle className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 capitalize">
                                  {value.userName}
                                </p>
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">
                                  Active Recipient
                                </p>
                              </div>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                          ) : (
                            <div className="p-6 text-center border-2 border-gray-100 border-dashed rounded-xl">
                              <p className="text-xs text-gray-400">
                                Search to select member
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  />
                  {errors.nursingMember && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errors.nursingMember.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelStyles}>Amount (BDT)</label>
                  <input
                    type="number"
                    {...register('amount')}
                    className={inputStyles}
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-gray-200"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Process Request <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Vertical Divider */}
          <div className="self-stretch hidden w-px lg:block bg-gray-200/60" />

          {/* Right Column: Table & Stats */}
          <section className="flex-1 space-y-5">
            {/* Table Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div className="flex flex-1 min-w-[300px] items-center gap-3">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A4A39E]"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    className={`${inputStyles} pl-9`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="relative w-48">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A4A39E]"
                    size={14}
                  />
                  <input
                    type="date"
                    className={`${inputStyles} pl-9 pr-6`}
                    value={dateFilter || ''}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />

                  {/* Clear Button */}
                  {dateFilter && (
                    <button
                      type="button"
                      onClick={() => setDateFilter('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A4A39E] hover:text-[#b12307] transition"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 border-l border-[#EDECE9] pl-4">
                <Filter size={14} className="text-[#A4A39E]" />
                <select
                  className="text-xs font-medium bg-transparent border-none cursor-pointer focus:ring-0"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approve">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              {selectedLoans?.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-2 text-sm text-white bg-red-500 rounded-md"
                >
                  Delete Selected ({selectedLoans.length})
                </button>
              )}
            </div>

            {/* Notion Style Table */}
            <div className="overflow-hidden bg-white border border-gray-200 rounded shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-tighter">
                      <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={
                            selectedLoans?.length === loans?.length &&
                            loans?.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">User Identity</th>
                      <th className="px-6 py-4 text-left">Amount</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isFetching ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan="5" className="h-16 px-6 bg-gray-50/20" />
                        </tr>
                      ))
                    ) : apiError ? (
                      <tr>
                        <td
                          colSpan="12"
                          className="px-6 py-12 text-sm font-medium text-center text-red-500"
                        >
                          Failed to load records. Please try again.
                        </td>
                      </tr>
                    ) : loans?.length > 0 ? (
                      loans?.map((loan, i) => (
                        <motion.tr
                          key={loan?._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="transition-colors group hover:bg-gray-50/80"
                        >
                          <td className="px-4 py-4 text-left font-sans font-semibold text-[#37352F]">
                            <input
                              type="checkbox"
                              checked={selectedLoans.includes(loan._id)}
                              onChange={() => handleSelectLoan(loan._id)}
                            />
                          </td>

                          <td className="px-6 py-4 text-start">
                            <span className="text-xs font-black text-gray-900">
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 text-gray-400 transition-colors bg-gray-100 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600">
                                <UserCircle size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800 capitalize">
                                  {loan?.userDetails?.userName}
                                </p>
                                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                  <Phone size={10} /> {loan?.userDetails?.phone}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-start">
                            <span className="text-xs font-black text-gray-900">
                              {loan.amount?.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'BDT',
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-start">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                                loan?.status === 'approve'
                                  ? 'bg-green-100 text-green-700'
                                  : loan?.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {loan?.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-500 text-start">
                            {new Date(loan?.date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-start">
                            <div className="flex items-center gap-2 mx-auto justify-evenly">
                              <button
                                onClick={() => setEditingLoan(loan)}
                                className="p-2 text-gray-400 transition-all border border-transparent rounded-lg hover:text-blue-600 hover:bg-white hover:border-blue-100"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-2 text-gray-300">
                            <Search size={40} strokeWidth={1} />
                            <p className="text-sm font-medium">
                              No records found matching criteria
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between text-[11px] font-bold text-[#7E7D77] uppercase tracking-widest">
              <span>
                Showing Page {page} of {pagination?.totalPages || 1}
              </span>
              <div className="flex gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 hover:bg-[#F7F7F5] border border-[#EDECE9] rounded disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={page >= (pagination?.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 hover:bg-[#F7F7F5] border border-[#EDECE9] rounded disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modern Modal Overlay */}
      <AnimatePresence>
        {editingLoan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingLoan(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-3xl"
            >
              <div className="p-6 text-white bg-gradient-to-br from-blue-600 to-indigo-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold">Update Loan Request</h3>
                  <button
                    onClick={() => setEditingLoan(null)}
                    className="p-1 transition-colors rounded-full hover:bg-white/20"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm font-medium capitalize opacity-90">
                  {editingLoan?.userDetails?.userName} —{' '}
                  {editingLoan?.userDetails?.phone}
                </p>
              </div>

              <form
                onSubmit={handleUpdateSubmit(onUpdateSubmit)}
                className="p-8 space-y-6"
              >
                <div>
                  <label className={labelStyles}>Amount (BDT)</label>
                  <input
                    type="number"
                    {...registerUpdate('amount')}
                    className={inputStyles}
                  />
                  {updateErrors.amount && (
                    <p className="text-[10px] text-red-500 mt-1 font-bold">
                      {updateErrors.amount.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelStyles}>Entry Date</label>
                  <input
                    type="date"
                    {...registerUpdate('date')}
                    className={inputStyles}
                  />
                </div>

                <div>
                  <label className={labelStyles}>Status Workflow</label>
                  <select {...registerUpdate('status')} className={inputStyles}>
                    <option value="pending">Pending</option>
                    <option value="approve">Approve</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 h-12 font-bold text-white transition-all bg-blue-600 shadow-lg hover:bg-blue-700 rounded-xl shadow-blue-100"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RequestForLoanNursing;

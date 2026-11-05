import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowRight,
  Loader2,
  Zap,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  X,
  Search,
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import EmployeeSelector from '../../../../../components/forms/EmployeeSelector';

// API Hooks
import { useUserRequestForLoanMutation } from '../../../../../redux/features/admin/adminApi';
import {
  useDeleteLoanMutation,
  useGetLoansQuery,
  useUpdateLoanDataMutation,
} from '../../../../../redux/features/loan/loanApi';
import toast from 'react-hot-toast';

// ================= VALIDATION SCHEMAS =================

const schema = z.object({
  employeeId: z.string().min(1, 'Please select an employee'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
});

const updateSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['pending', 'approve', 'rejected']),
});

// ================= STYLES (NOTION PRESETS) =================

const STYLES = {
  input:
    'w-full h-9 text-sm bg-[#F7F7F5] border border-[#EDECE9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2] transition-all text-[#37352F]',
  label:
    'text-[11px] font-semibold text-[#7E7D77] mb-1.5 block uppercase tracking-wider',
  buttonPrimary:
    'h-9 bg-[#2383E2] hover:bg-[#1C6AB8] text-white px-7 rounded text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50',
  buttonSecondary:
    'h-9 bg-white border border-[#EDECE9] hover:bg-[#F7F7F5] text-[#37352F] px-4 rounded-[4px] text-sm font-medium transition-all flex items-center justify-center gap-2',
  card: 'bg-white border border-[#EDECE9] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)]',
};

const RequestForLoanEmployee = () => {
  // --- States ---
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editingLoan, setEditingLoan] = useState(null);
  const [selectedLoans, setSelectedLoans] = useState([]);

  const panelType = 'staff';

  // --- API ---
  const {
    data,
    isLoading: isFetching,
    refetch,
  } = useGetLoansQuery({
    panelType,
    status,
    search, // Pass search to backend
    date: dateFilter, // Pass date to backend
    page,
    limit: 10,
  });

  const [requestLoan, { isLoading: isSubmitting }] =
    useUserRequestForLoanMutation();
  const [updateLoanData, { isLoading: isUpdating }] =
    useUpdateLoanDataMutation();
  const [deleteLoan] = useDeleteLoanMutation();

  // --- Forms ---
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { employeeId: '', amount: '' },
  });

  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm({
    resolver: zodResolver(updateSchema),
  });

  useEffect(() => {
    if (editingLoan) {
      resetUpdate({
        amount: editingLoan.amount,
        status: editingLoan.status,
        date: new Date(editingLoan.date).toISOString().split('T')[0],
      });
    }
  }, [editingLoan, resetUpdate]);

  // --- Handlers ---

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
      const res = await requestLoan({
        userId: formData.employeeId,
        amount: Number(formData.amount),
      }).unwrap();
      reset({ amount: '', employeeId: '' });
      toast.success(res?.message);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Request failed');
    }
  };

  const onUpdateSubmit = async (formData) => {
    try {
      await updateLoanData({ id: editingLoan._id, ...formData }).unwrap();
      setEditingLoan(null);
      refetch();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDeleteSelected = async (id) => {
    if (!window.confirm('Delete selected loan requests permanently?')) return;
    try {
      const res = await deleteLoan({ ids: selectedLoans }).unwrap();
      toast.success(res?.message);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message);
    }
  };

  const loans = data?.data || [];
  const stats = data?.stats || {};
  const pagination = data?.pagination || {};

  return (
    <div className="min-h-screen bg-white text-[#37352F] selection:bg-[#2383E2]/10 font-sans">
      {/* Sticky Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#F1F1F0] h-12 flex items-center px-6">
        <BreadCrumbMenu />
      </nav>

      <main className="px-4 py-14">
        {/* Page Title */}
        <div className="flex flex-wrap justify-center mb-12 md:justify-between md:items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#097FE8] fill-[#097FE8]" />
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
              <p className={STYLES.label}>Approved Total</p>
              <p className="text-xl font-bold">
                {stats?.totalApprovedAmount?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'BDT',
                }) || 0}
              </p>
            </div>
            <div className="w-px h-10 bg-[#EDECE9]" />
            <div className="text-right">
              <p className={STYLES.label}>Pending</p>
              <p className="text-xl font-bold text-amber-500">
                {stats?.pendingCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Creation Sidebar */}
          <div className="lg:col-span-3">
            <div className={`${STYLES.card} p-6 sticky top-24 bg-[#FBFBFA]`}>
              <h3 className="text-xs font-bold uppercase text-[#7E7D77] mb-6 flex items-center gap-2 tracking-[0.05em]">
                <TrendingUp size={14} /> New Loan Request
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <EmployeeSelector
                    name="employeeId"
                    control={control}
                    labelBase={STYLES.label}
                    inputBase={STYLES.input}
                  />
                  {errors.employeeId && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.employeeId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={STYLES.label}>
                    Disbursement Amount (BDT)
                  </label>
                  <input
                    type="number"
                    {...register('amount')}
                    placeholder="e.g. 15000"
                    className={STYLES.input}
                  />
                  {errors.amount && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={STYLES.buttonPrimary}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Submit Record'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Records Section */}
          <div className="lg:col-span-9">
            {/* Table Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-1 min-w-[300px] items-center gap-3">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A4A39E]"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    className={`${STYLES.input} pl-9`}
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
                    className={`${STYLES.input} pl-9 pr-6`}
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
              {selectedLoans.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-2 text-sm text-white bg-red-500 rounded-md"
                >
                  Delete Selected ({selectedLoans.length})
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-hidden border border-[#EDECE9] rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F7F5] border-b border-[#EDECE9] text-[#7E7D77]">
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
                    <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F1F0] capitalize">
                  <AnimatePresence>
                    {isFetching ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="p-5">
                            <div className="h-4 bg-[#F7F7F5] rounded w-full" />
                          </td>
                        </tr>
                      ))
                    ) : loans?.length > 0 ? (
                      loans?.map((loan, i) => (
                        <motion.tr
                          layout
                          key={loan._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group hover:bg-[#F7F7F5]/50 transition-colors"
                        >
                          <td className="px-4 py-4 text-left font-sans font-semibold text-[#37352F]">
                            <input
                              type="checkbox"
                              checked={selectedLoans.includes(loan._id)}
                              onChange={() => handleSelectLoan(loan._id)}
                            />
                          </td>
                          <td className="px-4 py-4 text-left font-sans font-semibold text-[#37352F]">
                            {i + 1}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#37352F]">
                                {loan?.userDetails?.userName}
                              </span>
                              <span className="text-[11px] text-[#A4A39E] font-medium">
                                {loan?.userDetails?.phone}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-left font-sans font-semibold text-[#37352F]">
                            {loan?.amount?.toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'BDT',
                            })}
                          </td>
                          <td className="px-4 py-4 text-left">
                            <StatusBadge status={loan?.status} />
                          </td>
                          <td className="px-4 py-4 text-left text-[#7E7D77] text-xs">
                            {new Date(loan.date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-4 text-left">
                            <div className="flex justify-start gap-1 transition-opacity opacity-1 group-hover:opacity-100">
                              <button
                                onClick={() => setEditingLoan(loan)}
                                className="p-1.5 hover:bg-[#EDECE9] rounded text-[#7E7D77]"
                              >
                                <Edit3 size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={12} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-2 text-[#A4A39E]">
                            <Filter size={32} strokeWidth={1} />
                            <p className="text-sm">
                              No loan records matching your filters.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
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
          </div>
        </div>
      </main>

      {/* ================= EDIT MODAL ================= */}
      <AnimatePresence>
        {editingLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingLoan(null)}
              className="absolute inset-0 bg-[#37352F]/20 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#EDECE9] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[#F1F1F0] flex justify-between items-center bg-[#F7F7F5]">
                <div>
                  <h3 className="text-sm font-bold tracking-wider uppercase">
                    Update Loan Record
                  </h3>
                  <h3 className="text-xs font-semibold tracking-wider uppercase">
                    {editingLoan?.userDetails?.userName}
                  </h3>
                </div>

                <button
                  onClick={() => setEditingLoan(null)}
                  className="text-[#A4A39E] hover:text-[#37352F]"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleUpdateSubmit(onUpdateSubmit)}
                className="p-6 space-y-5"
              >
                <div>
                  <label className={STYLES.label}>Loan Amount</label>
                  <input
                    type="number"
                    {...registerUpdate('amount')}
                    className={STYLES.input}
                  />
                </div>
                <div>
                  <label className={STYLES.label}>Status</label>
                  <select
                    {...registerUpdate('status')}
                    className={STYLES.input}
                  >
                    <option value="pending">Pending</option>
                    <option value="approve">Approve</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className={STYLES.label}>Effective Date</label>
                  <input
                    type="date"
                    {...registerUpdate('date')}
                    className={STYLES.input}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingLoan(null)}
                    className={`${STYLES.buttonSecondary} flex-1`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={`${STYLES.buttonPrimary} flex-1`}
                  >
                    {isUpdating ? (
                      <Loader2 size={16} className="animate-spin" />
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

// Sub-component for Status Badges
const StatusBadge = ({ status }) => {
  const configs = {
    approve: 'bg-[#E7F3EF] text-[#0D593E]',
    pending: 'bg-[#FDECC8] text-[#965E00]',
    rejected: 'bg-[#FFE2E5] text-[#821D24]',
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider ${configs[status] || configs.pending}`}
    >
      {status}
    </span>
  );
};

export default RequestForLoanEmployee;

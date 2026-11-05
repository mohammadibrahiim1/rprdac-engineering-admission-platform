import { useEffect, useState, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  Loader2,
  Zap,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  Search,
  Calendar,
  Trash2,
  CheckSquare,
  Square,
  Edit3,
  Banknote,
  Filter,
} from 'lucide-react';

// API Hooks
import { useUserRequestForLoanMutation } from '../../../../../redux/features/admin/adminApi';
import {
  useDeleteLoanMutation,
  useGetLoansQuery,
  useUpdateLoanDataMutation,
} from '../../../../../redux/features/loan/loanApi';

// Components
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import TeacherSelector from '../../../../../components/forms/TeacherSelector';

// --- Validation Schemas ---
const schema = z.object({
  amount: z.coerce
    .number()
    .min(100, 'Minimum ৳100')
    .max(100000, 'Limit exceeded'),
  teacher: z.any().refine((val) => val !== null, 'Select an employee'),
});

const updateSchema = z.object({
  amount: z.coerce.number().positive('Required'),
  date: z.string().min(1, 'Required'),
  status: z.enum(['pending', 'approve', 'rejected']),
});

// --- Animation Variants ---
const fader = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const RequestForLoan = () => {
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [panelType] = useState('teacher');

  // Selection State
  const [selectedLoans, setSelectedLoans] = useState([]);
  const [editingLoan, setEditingLoan] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  // Queries & Mutations
  const { data, isLoading, isFetching, refetch } = useGetLoansQuery({
    panelType,
    status,
    search,
    date: dateFilter,
    page,
    limit: 10,
  });

  const [updateLoanData, { isLoading: isUpdating }] =
    useUpdateLoanDataMutation();
  const [userRequestForLoan, { isLoading: isSubmitting }] =
    useUserRequestForLoanMutation();
  const [deleteLoan] = useDeleteLoanMutation();

  const loans = data?.data || [];
  const pagination = data?.pagination || {};
  const stats = data?.stats || {};

  // --- Form Hooks ---
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: '' },
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
        date: new Date(editingLoan.date || editingLoan.createdAt)
          .toISOString()
          .split('T')[0],
      });
    }
  }, [editingLoan, resetUpdate]);

  // --- Handlers ---
  const onMainSubmit = async (formData) => {
    try {
      const res = await userRequestForLoan({
        userId: formData.teacher?._id,
        amount: Number(formData.amount),
        teacherName: formData.teacher?.userName,
        phone: formData.teacher?.phone,
        userType: formData.teacher?.userType,
      }).unwrap();
      toast.success(res.message || 'Request Sent');
      reset();
      setResetKey((k) => k + 1);
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to submit');
    }
  };

  const onUpdateSubmit = async (formData) => {
    try {
      await updateLoanData({ id: editingLoan?._id, ...formData }).unwrap();
      setEditingLoan(null);
      toast.success('Record Updated');
      refetch();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleSingleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteLoan(id).unwrap();
      toast.success('Deleted');
      setSelectedLoans((prev) => prev.filter((item) => item !== id));
    } catch (err) {
      toast.error('Error deleting');
    }
  };

  // delete loan data
  const handleBulkDelete = async () => {
    if (!window.confirm('Delete selected loan requests permanently?')) return;
    try {
      const res = await deleteLoan({ ids: selectedLoans }).unwrap();
      toast.success(res?.message);
      setSelectedLoans([]);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLoans.length === loans.length) setSelectedLoans([]);
    else setSelectedLoans(loans.map((l) => l._id));
  };

  const toggleSelectOne = (id) => {
    setSelectedLoans((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // UI Helpers
  const inputStyle =
    'w-full px-3 py-2 text-[13px] bg-[#f7f7f5] border border-[#efefee] rounded-lg focus:outline-none focus:bg-white focus:border-[#2383e2] focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400';
  const labelStyle =
    'text-[11px] font-bold text-gray-400 mb-1.5 block uppercase tracking-wider';

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#37352F] font-sans capitalize selection:bg-blue-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#F1F1F0] h-12 flex items-center px-6">
        <div>
          <BreadCrumbMenu />
        </div>
      </nav>

      <main className="px-4 py-14">
        <div className="flex flex-wrap justify-center md:justify-between ">
          {/* Page Title */}
          <div className="flex items-center gap-4 md:mb-10">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Banknote size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Loan Registry
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage internal employee financial requests
              </p>
            </div>
          </div>
          {/* Quick Stats */}
          <div className="flex gap-6 my-5 md:mt-0 ">
            <div className="text-right">
              <p className={labelStyle}>Approved Total</p>
              <p className="text-xl font-bold">
                {stats?.totalApprovedAmount?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'BDT',
                }) || 0}
              </p>
            </div>
            <div className="w-px h-10 bg-[#EDECE9]" />
            <div className="text-right">
              <p className={labelStyle}>Pending</p>
              <p className="text-xl font-bold text-amber-500">
                {stats?.pendingCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Form Column */}
          <section className="lg:col-span-3 lg:sticky lg:top-24">
            <div className="p-6 bg-[#fbfbfa] border border-[#efefee] rounded">
              <h3 className="flex items-center gap-2 mb-6 text-sm font-bold text-gray-700">
                <TrendingUp size={16} className="text-blue-500" /> New
                Application
              </h3>
              <form onSubmit={handleSubmit(onMainSubmit)} className="space-y-7">
                <div>
                  <Controller
                    name="teacher"
                    control={control}
                    render={({ field }) => (
                      <TeacherSelector
                        resetKey={resetKey}
                        onSelect={(t) => field.onChange(t)}
                        inputBase={inputStyle}
                      />
                    )}
                  />
                  {errors.teacher && (
                    <span className="text-[10px] text-red-500 mt-1">
                      {errors.teacher.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>Amount (BDT)</label>
                  <input
                    type="number"
                    {...register('amount')}
                    placeholder="e.g. 15000"
                    className={inputStyle}
                  />
                  {errors.amount && (
                    <span className="text-[10px] text-red-500 mt-1">
                      {errors.amount.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#2383e2] hover:bg-[#1a6eca] text-white rounded font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Submit Request <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Table Column */}
          <section className="space-y-3 lg:col-span-9">
            {/* Filters Bar */}
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
                    className={`${inputStyle} pl-9`}
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
                    className={`${inputStyle} pl-9 pr-6`}
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
                  onClick={handleBulkDelete}
                  className="px-3 py-2 text-sm text-white bg-red-500 rounded-md"
                >
                  Delete Selected ({selectedLoans.length})
                </button>
              )}
            </div>

            {/* Table */}
            <div className="border border-[#efefee] rounded overflow-hidden shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fbfbfa] border-b border-[#efefee] text-[10px] uppercase font-bold text-gray-400">
                      <th className="w-10 px-4 py-4">
                        <button
                          onClick={toggleSelectAll}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          {selectedLoans.length === loans?.length &&
                          loans?.length > 0 ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </th>
                      <th className="px-2 py-4 text-center">#</th>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4 text-center">Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-center">Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#efefee]">
                    <AnimatePresence mode="popLayout">
                      {isFetching ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan="6" className="h-16 bg-gray-50/30"></td>
                          </tr>
                        ))
                      ) : loans.length > 0 ? (
                        loans?.map((loan, idx) => (
                          <motion.tr
                            key={loan._id}
                            variants={fader}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className={`group hover:bg-[#fbfbfa] transition-colors ${selectedLoans.includes(loan._id) ? 'bg-blue-50/40' : ''}`}
                          >
                            <td className="px-4 py-4">
                              <button
                                onClick={() => toggleSelectOne(loan._id)}
                                className="text-gray-300 transition-colors hover:text-blue-500"
                              >
                                {selectedLoans.includes(loan._id) ? (
                                  <CheckSquare
                                    size={16}
                                    className="text-blue-500"
                                  />
                                ) : (
                                  <Square size={16} />
                                )}
                              </button>
                            </td>
                            <td className="px-2 py-4 text-[11px] text-gray-400 text-center font-medium">
                              {String((page - 1) * 10 + idx + 1).padStart(
                                2,
                                '0',
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-700">
                                  {loan.userDetails?.userName}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {loan.userDetails?.phone}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-black text-center text-gray-700">
                              {loan?.amount?.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'BDT',
                              })}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                  loan.status === 'approve'
                                    ? 'bg-green-50 text-green-600 border-green-100'
                                    : loan.status === 'pending'
                                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                                      : 'bg-red-50 text-red-600 border-red-100'
                                }`}
                              >
                                {loan.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-black text-center text-gray-700">
                              {new Date(loan?.date)?.toLocaleDateString(
                                'en-GB',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                },
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2 transition-opacity group-hover:opacity-100">
                                <button
                                  onClick={() => setEditingLoan(loan)}
                                  className="p-2 text-gray-400 rounded-lg hover:text-blue-500 hover:bg-blue-50"
                                >
                                  <Edit3 size={14} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="12"
                            className="py-20 text-sm text-center text-gray-400"
                          >
                            No records found.
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-xs font-medium text-gray-400">
                Page {page} of {pagination.totalPages || 1}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 border border-[#efefee] rounded-xl hover:bg-gray-50 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= (pagination.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 border border-[#efefee] rounded-xl hover:bg-gray-50 disabled:opacity-20 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Update Modal */}
      <AnimatePresence>
        {editingLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingLoan(null)}
              className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white border border-[#efefee] shadow-2xl rounded-3xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-50">
                <div>
                  <h3 className="text-xl font-bold">Update Loan Request</h3>
                  <h3 className="text-xs font-semibold">
                    {editingLoan?.userDetails?.userName}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingLoan(null)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={handleUpdateSubmit(onUpdateSubmit)}
                className="p-8 space-y-5"
              >
                <div>
                  <label className={labelStyle}>Revised Amount</label>
                  <input
                    type="number"
                    {...registerUpdate('amount')}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Effective Date</label>
                  <input
                    type="date"
                    {...registerUpdate('date')}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Status Update</label>
                  <select {...registerUpdate('status')} className={inputStyle}>
                    <option value="pending">Pending</option>
                    <option value="approve">Approve</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-3 bg-[#2383e2] text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:shadow-none transition-all"
                >
                  {isUpdating ? (
                    <Loader2 className="mx-auto animate-spin" size={20} />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RequestForLoan;

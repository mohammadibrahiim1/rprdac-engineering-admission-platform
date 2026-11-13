import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

// ==================== TypeScript Interfaces ====================
export interface TransactionFilterValues {
  search: string;
  startDate: string;
  endDate: string;
  userId: string;
  transactionType: string;
  moneyDirection: string;
}

export interface TransactionFiltersProps {
  filters: Partial<TransactionFilterValues>;
  onFilterChange: (filters: TransactionFilterValues) => void;
  isAdmin?: boolean;
  isFetching?: boolean;
}

// ==================== Component ====================
const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters = {},
  onFilterChange,
  isAdmin = false,
  isFetching = false,
}) => {
  const [localFilters, setLocalFilters] = useState<TransactionFilterValues>({
    search: filters.search || "",
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
    userId: filters.userId || "",
    transactionType: filters.transactionType || "",
    moneyDirection: filters.moneyDirection || "",
  });

  // Sync state when parent filters change (e.g., reset from outside)
  useEffect(() => {
    setLocalFilters({
      search: filters.search || "",
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
      userId: filters.userId || "",
      transactionType: filters.transactionType || "",
      moneyDirection: filters.moneyDirection || "",
    });
  }, [filters]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetValues: TransactionFilterValues = {
      search: "",
      startDate: "",
      endDate: "",
      userId: "",
      transactionType: "",
      moneyDirection: "",
    };
    setLocalFilters(resetValues);
    onFilterChange(resetValues);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-xl shadow-slate-100/60 transition-all"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="xl:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
            Search (User ID / Name / Phone)
          </label>
          <input
            type="text"
            name="search"
            value={localFilters.search}
            onChange={handleChange}
            placeholder="Search by userId, name or phone..."
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Admin only - User ID filter */}
        {isAdmin && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Filter by User ID
            </label>
            <input
              type="text"
              name="userId"
              value={localFilters.userId}
              onChange={handleChange}
              placeholder="e.g. USR-001"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
            />
          </div>
        )}

        {/* Start Date */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={localFilters.startDate}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={localFilters.endDate}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
            Type
          </label>
          <select
            name="transactionType"
            value={localFilters.transactionType}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="PAYMENT_RECEIVED">Payment Received</option>
            <option value="STUDENT_REFUND">Student Refund</option>
            <option value="CASHBACK">Cashback</option>
            <option value="DISCOUNT_ADJUSTMENT">Discount Adjustment</option>
            <option value="PAYMENT_REVERSAL">Payment Reversal</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isFetching}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 shadow-md shadow-indigo-100 transition-all cursor-pointer"
        >
          {isFetching ? "Applying..." : "Apply Filters"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default TransactionFilters;

// src/pages/Transactions/TransactionFilters.jsx
import { useState, useEffect } from 'react';

const TransactionFilters = ({
  filters,
  onFilterChange,
  isAdmin,
  isFetching,
}) => {
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    userId: filters.userId || '',
    transactionType: filters.transactionType || '',
    moneyDirection: filters.moneyDirection || '',
  });

  // Sync when parent filters change (e.g. reset)
  useEffect(() => {
    setLocalFilters({
      search: filters.search || '',
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      userId: filters.userId || '',
      transactionType: filters.transactionType || '',
      moneyDirection: filters.moneyDirection || '',
    });
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const reset = {
      search: '',
      startDate: '',
      endDate: '',
      userId: '',
      transactionType: '',
      moneyDirection: '',
    };
    setLocalFilters(reset);
    onFilterChange(reset);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Search */}
        <div className="xl:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Search (User ID / Name / Phone)
          </label>
          <input
            type="text"
            name="search"
            value={localFilters.search}
            onChange={handleChange}
            placeholder="Search by userId, name or phone..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Admin only - User ID filter */}
        {isAdmin && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Filter by User ID
            </label>
            <input
              type="text"
              name="userId"
              value={localFilters.userId}
              onChange={handleChange}
              placeholder="e.g. USR-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Start Date */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={localFilters.startDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={localFilters.endDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Type
          </label>
          <select
            name="transactionType"
            value={localFilters.transactionType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      <div className="flex items-center gap-3 mt-4">
        <button
          type="submit"
          disabled={isFetching}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isFetching ? 'Applying...' : 'Apply Filters'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default TransactionFilters;

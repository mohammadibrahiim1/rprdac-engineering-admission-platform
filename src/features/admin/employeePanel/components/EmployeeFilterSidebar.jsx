import { motion } from 'framer-motion';
import { Filter, Search, Calendar, X } from 'lucide-react';

export default function EmployeeFilterSidebar({
  filters,
  setFilters,
  statusOptions,
  paymentStatusOptions,
  monthOptions,
  handleClearFilters,
}) {
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const selects = [
    {
      label: 'Status',
      value: filters.status,
      options: statusOptions,
      key: 'status',
    },
    {
      label: 'Payment',
      value: filters.paymentStatus,
      options: paymentStatusOptions,
      key: 'paymentStatus',
    },
    {
      label: 'Month',
      value: filters.month,
      options: monthOptions,
      key: 'month',
    },
  ];

  const inputBase =
    'w-full px-3 py-2 text-[14px] bg-[#f7f7f5] border border-transparent rounded-md focus:outline-none focus:bg-white focus:border-[#2383e2] transition-all placeholder:text-gray-400 text-gray-800 shadow-sm';
  const labelBase =
    'text-[12px] font-medium text-gray-500 mb-1 block uppercase';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full lg:w-80 shrink-0"
    >
      <div className="sticky mt-6 space-y-4">
        <div className="overflow-hidden bg-white rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <h2 className="text-xs font-semibold tracking-wider text-gray-700 uppercase">
                Filters
              </h2>
            </div>

            <button
              onClick={handleClearFilters}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition"
            >
              Reset
            </button>
          </div>

          <div className="p-5 space-y-5 rounded-xl">
            {/* Search */}
            <div>
              <label className={labelBase}>Search Employee</label>

              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />

                <input
                  type="text"
                  placeholder="ID, Name or Phone..."
                  value={filters?.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={`${inputBase} pl-10`}
                />
              </div>
            </div>

            {/* Select Filters (Status, Payment, Month) */}
            {selects?.map((select) => (
              <div key={select.key}>
                <label className={labelBase}>{select?.label}</label>

                <div className="relative">
                  <select
                    value={select.value}
                    onChange={(e) =>
                      handleFilterChange(select.key, e.target.value)
                    }
                    className={`${inputBase} cursor-pointer appearance-none`}
                  >
                    {select?.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {/* Custom Arrow Icon for Select */}
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}

            {/* Year Selection */}
            <div>
              <label className={labelBase}>Year</label>

              <div className="relative">
                <select
                  value={filters.year || ''}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className={`${inputBase} cursor-pointer appearance-none`}
                >
                  <option value="">All Years</option>
                  {Array.from({ length: 7 }, (_, i) => {
                    const year = new Date().getFullYear() - 3 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Range Selection */}
            <div>
              <label className={labelBase}>Date Range</label>

              <div className="space-y-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) =>
                      handleFilterChange('startDate', e.target.value)
                    }
                    className={`${inputBase} pl-10`}
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) =>
                      handleFilterChange('endDate', e.target.value)
                    }
                    className={`${inputBase} pl-10`}
                  />
                </div>
              </div>
            </div>

            {/* Clear All Button */}
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center w-full gap-2 py-2.5 mt-4 text-[13px] font-medium text-gray-600 transition border border-gray-200 border-dashed rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <X className="w-3.5 h-3.5" />
              Clear active filters
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

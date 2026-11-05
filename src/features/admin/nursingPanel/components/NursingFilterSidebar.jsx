import { motion } from 'framer-motion';
import { Filter, Search, Calendar, X } from 'lucide-react';

export default function NursingFilterSidebar({
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
      <div className="sticky space-y-4 top-8">
        <div className="overflow-hidden bg-white border-slate-200 rounded-xl">
          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <h2 className="text-xs font-semibold tracking-wider text-gray-700 uppercase">
                Filters
              </h2>
            </div>

            <button
              onClick={handleClearFilters}
              className="text-xs text-gray-400 transition opacity-0 group-hover:opacity-100 hover:text-gray-900"
            >
              Reset
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Search */}
            <div>
              <label className={labelBase}>Search</label>

              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />

                <input
                  type="text"
                  placeholder="Find record..."
                  value={filters?.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={`${inputBase} pl-10`}
                />
              </div>
            </div>

            {/* Select Filters */}
            {selects?.map((select) => (
              <div key={select.key}>
                <label className={labelBase}>{select?.label}</label>

                <div className="relative">
                  <select
                    value={select.value}
                    onChange={(e) =>
                      handleFilterChange(select.key, e.target.value)
                    }
                    className={`${inputBase}`}
                  >
                    {select?.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            {/* Year */}
            <div>
              <label className={labelBase}>Year</label>

              <div className="relative">
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className={`${inputBase}`}
                >
                  <option value="">All Years</option>

                  {Array.from({ length: 10 }, (_, i) => {
                    const year = 2020 + i;

                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className={labelBase}>Time Period</label>

              <div className="space-y-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />

                  <input
                    type="date"
                    value={filters.startDate}
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
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange('endDate', e.target.value)
                    }
                    className={`${inputBase} pl-10`}
                  />
                </div>
              </div>
            </div>

            {/* Clear Button */}
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center w-full gap-2 py-2 mt-4 text-xs font-medium text-gray-500 transition border border-gray-300 border-dashed rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <X className="w-3 h-3" />
              Clear active filters
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

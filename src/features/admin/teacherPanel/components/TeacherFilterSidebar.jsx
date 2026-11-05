import { useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import BatchSelector from '../../../../../components/forms/BatchSelector';
import SubjectSelector from '../../../../../components/forms/SubjectSelector';
import DepartmentSelector from '../../../../../components/forms/DepartmentSelector';

const departmentOptions = [
  'ARCH',
  'CE',
  'CHE',
  'CSE',
  'EEE',
  'FE',
  'ME / IPE / MME',
  'TE',
];

const TeacherFilterSidebar = ({ filters, setFilters }) => {
  const [resetKey, setResetKey] = useState(0);

  // 🔥 dynamic year range (prev 3 + current + next 3)
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => current - 3 + i);
  }, []);

  // 🔥 months sentence case
  const months = useMemo(
    () => [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    [],
  );

  const handleSearchChange = (value) => {
    setFilters({
      ...filters,
      search: value,
      page: 1,
    });
  };

  const handleReset = () => {
    setFilters({
      year: '',
      month: '',
      batch: [],
      status: '',
      paymentStatus: '',
      startDate: '',
      endDate: '',
      search: '',
      page: 1,
      limit: 10,
      department: '',
      subject: '',
    });

    setResetKey((p) => p + 1);
  };

  const inputBase =
    'w-full px-3 py-2 text-[14px] bg-[#f7f7f5] border border-transparent rounded-md focus:outline-none focus:bg-white focus:border-[#2383e2] transition-all placeholder:text-gray-400 text-gray-800 shadow-sm';
  const labelBase =
    'text-[12px] font-medium text-gray-500 mb-1 block uppercase';

  return (
    <aside className="w-full lg:w-80 shrink-0">
      <div className="sticky space-y-4 top-8">
        <div className="overflow-hidden bg-white shadow-sm border-slate-200 rounded-xl">
          {/* header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <Filter size={18} className="text-slate-500" />
              Filters
            </h3>
          </div>

          {/* body */}
          <div className="p-5 space-y-5">
            {/* 🔍 Quick Search */}
            <div className="space-y-1.5">
              <label className={labelBase}>Quick Search</label>

              <div className="relative">
                <Search
                  className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Name, ID, or Phone..."
                  value={filters?.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={`${inputBase} pl-10`}
                />
              </div>
            </div>

            {/* ✅ Status */}
            <div className="space-y-1.5">
              <label className={labelBase}>Status</label>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value, page: 1 })
                }
                className={`${inputBase}`}
              >
                <option value="">All</option>
                <option value="approve">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* ✅ Payment Status */}
            <div className="space-y-1.5">
              <label className={labelBase}>Payment Status</label>

              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    paymentStatus: e.target.value,
                    page: 1,
                  })
                }
                className={`${inputBase}`}
              >
                <option value="">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            {/* ✅ Year / Month */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelBase}>Year</label>

                <select
                  value={filters.year}
                  onChange={(e) =>
                    setFilters({ ...filters, year: e.target.value, page: 1 })
                  }
                  className={`${inputBase}`}
                >
                  <option value="">All</option>
                  {years?.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={labelBase}>Month</label>

                <select
                  value={filters.month}
                  onChange={(e) =>
                    setFilters({ ...filters, month: e.target.value, page: 1 })
                  }
                  className={`${inputBase}`}
                >
                  <option value="">All</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ Batch */}
            <BatchSelector
              resetKey={resetKey}
              multiple
              value={filters.batch}
              onSelect={(batches) =>
                setFilters({
                  ...filters,
                  batch: batches || [],
                  page: 1,
                })
              }
              inputBase={inputBase}
              labelBase={labelBase}
            />

            {/* ✅ Department */}
            <DepartmentSelector
              resetKey={resetKey}
              departments={departmentOptions}
              onSelect={(d) =>
                setFilters({ ...filters, department: d || '', page: 1 })
              }
              inputBase={inputBase}
              labelBase={labelBase}
            />

            {/* ✅ Subject */}
            <SubjectSelector
              resetKey={resetKey}
              value={filters.subject}
              onChange={(s) =>
                setFilters({ ...filters, subject: s || '', page: 1 })
              }
              inputBase={inputBase}
              labelBase={labelBase}
            />

            {/* ✅ Date Range */}
            <div className="pt-2 space-y-3 border-t border-slate-100">
              <label className={labelBase}>Date Range</label>

              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    startDate: e.target.value, // YYYY-MM-DD
                    page: 1,
                  })
                }
                className={`${inputBase}`}
              />

              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    endDate: e.target.value, // YYYY-MM-DD
                    page: 1,
                  })
                }
                className={`${inputBase}`}
              />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={labelBase}>Show:</span>
              <select
                value={filters.limit}
                onChange={(e) =>
                  setFilters({ ...filters, page: 1, limit: e.target.value })
                }
                className={`${inputBase}`}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value="all">All</option>
              </select>
            </div>

            {/* ✅ Reset */}
            <button
              onClick={handleReset}
              className="w-full py-2 text-xs font-medium text-white transition-colors btn-sm btn-error btn hover:text-white"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default TeacherFilterSidebar;

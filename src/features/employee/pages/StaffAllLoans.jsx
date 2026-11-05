import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Search,
  Filter,
  ChevronDown,
  FileText,
  DollarSign,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Loader,
} from 'lucide-react';

// Data fetching hooks
import { useFetchEmployeeDutiesQuery } from '../../../../redux/features/staff/employeeApi';
import { useGetSingleNurseAttendancesQuery } from '../../../../redux/features/Nursing/NursingApi';
import { useGetTeacherClassesQuery } from '../../../../redux/features/teacher/teacherApi';

const StaffAllLoans = () => {
  const auth = useSelector((state) => state?.auth?.user);
  const [filters, setFilters] = useState({
    year: '',
    month: '',
    status: '',
    search: '',
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc',
  });

  // Data fetching
  const { data: nursingData, isLoading: isNursingLoading } =
    useGetSingleNurseAttendancesQuery({
      nursingId: auth?._id,
    });
  const { data: staffData, isLoading: isStaffLoading } =
    useFetchEmployeeDutiesQuery({
      employeeId: auth?._id,
    });
  const { data: teacherData, isLoading: isTeacherLoading } =
    useGetTeacherClassesQuery({
      teacherId: auth?._id,
    });

  const isLoading = isNursingLoading || isStaffLoading || isTeacherLoading;

  // Get role-based data
  const roleData = useMemo(() => {
    switch (auth?.userType) {
      case 'teacher':
        return teacherData?.statements || [];
      case 'staff':
        return staffData?.statements || [];
      case 'nursing':
        return nursingData?.statements || [];
      default:
        return [];
    }
  }, [auth?.userType, teacherData, staffData, nursingData]);

  // Available years and months
  const availableYears = useMemo(
    () => [...new Set(roleData.map((d) => d.year))],
    [roleData],
  );

  const availableMonths = useMemo(
    () => [...new Set(roleData.flatMap((d) => d.months.map((m) => m.month)))],
    [roleData],
  );

  // Handle sorting
  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Filtered and sorted loans data
  const filteredLoans = useMemo(() => {
    const { year, month, status, search } = filters;
    const { key, direction } = sortConfig;

    return roleData
      .flatMap((yearData) =>
        yearData.months
          .filter((m) => !month || m.month === month)
          .flatMap(
            (m) =>
              m.details?.loans
                ?.filter(
                  (loan) =>
                    (!year || yearData.year === year) &&
                    (!status || loan.status === status) &&
                    (loan.amount?.toString().includes(search) ||
                      loan.date?.includes(search) ||
                      loan.userDetails?.phone?.includes(search)),
                )
                .map((loan) => ({
                  ...loan,
                  year: yearData.year,
                  month: m.month,
                })) || [],
          ),
      )
      .sort((a, b) => {
        // Handle nested properties
        const getValue = (obj, path) =>
          path.split('.').reduce((o, p) => (o ? o[p] : null), obj);

        const valA = getValue(a, key);
        const valB = getValue(b, key);

        // Special handling for dates
        if (key === 'date') {
          const dateA = valA ? new Date(valA).getTime() : 0;
          const dateB = valB ? new Date(valB).getTime() : 0;
          return direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // Numeric comparison
        if (typeof valA === 'number' && typeof valB === 'number') {
          return direction === 'asc' ? valA - valB : valB - valA;
        }

        // String comparison
        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();
        if (strA < strB) return direction === 'asc' ? -1 : 1;
        if (strA > strB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [roleData, filters, sortConfig]);

  // Total loan amount
  const totalAmount = useMemo(
    () => filteredLoans.reduce((sum, loan) => sum + loan.amount, 0),
    [filteredLoans],
  );

  // Update filters
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({ year: '', month: '', status: '', search: '' });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 bg-gray-50 md:p-6"
    >
      <div className="mx-auto space-y-6 max-w-7xl">
        {/* User Header Card */}
        <motion.div
          variants={itemVariants}
          className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 shadow-lg rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <span className="text-xl font-bold text-white">
                    {auth?.userName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="absolute w-6 h-6 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {auth?.userName}
                  </h1>
                  <span className="px-3 py-1 text-sm font-medium text-indigo-700 capitalize rounded-full bg-indigo-50">
                    {auth?.userType === 'staff' ? 'Employee' : auth?.userType}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span>{auth?.phone}</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>
                      Records:{' '}
                      <span className="font-semibold">
                        {filteredLoans.length}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>
                      Total:{' '}
                      <span className="font-bold text-emerald-600">
                        {totalAmount.toFixed(2)} BDT
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters Card */}
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.1 }}
          className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search loans..."
                className="pl-9 w-full h-11 px-3.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Year */}
            <div className="relative">
              <label className="absolute px-1 text-xs font-medium text-gray-500 bg-white -top-2 left-2">
                Year
              </label>
              <div className="relative mt-1">
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-lg appearance-none h-11 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Years</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
              </div>
            </div>

            {/* Month */}
            <div className="relative">
              <label className="absolute px-1 text-xs font-medium text-gray-500 bg-white -top-2 left-2">
                Month
              </label>
              <div className="relative mt-1">
                <select
                  value={filters.month}
                  onChange={(e) => handleFilterChange('month', e.target.value)}
                  className="w-full pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-lg appearance-none h-11 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Months</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
              </div>
            </div>

            {/* Status */}
            <div className="relative">
              <label className="absolute px-1 text-xs font-medium text-gray-500 bg-white -top-2 left-2">
                Status
              </label>
              <div className="relative mt-1">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-lg appearance-none h-11 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="approve">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
              </div>
            </div>

            {/* Reset Button */}
            <button
              className="flex items-center justify-center w-full gap-2 px-4 text-sm font-medium text-white transition-colors bg-gray-900 rounded-lg h-11 hover:bg-gray-800"
              onClick={resetFilters}
            >
              <Filter className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        </motion.div>

        {/* Loans Table */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader
                    title="Amount"
                    sortKey="amount"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                  <TableHeader
                    title="Date"
                    sortKey="date"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <TableHeader
                    title="Contact"
                    sortKey="userDetails.phone"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                  <TableHeader
                    title="Year"
                    sortKey="year"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                  <TableHeader
                    title="Month"
                    sortKey="month"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader className="w-12 h-12 mb-4 text-blue-500 animate-spin" />
                        <p className="text-gray-600">Loading loan data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 mb-4 text-gray-400" />
                        <h3 className="mb-1 text-lg font-medium text-gray-900">
                          No loans found
                        </h3>
                        <p className="max-w-md text-gray-500">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((loan, index) => (
                    <motion.tr
                      key={index}
                      variants={itemVariants}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 mr-3 rounded-lg bg-indigo-50">
                            <DollarSign className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ৳{loan.amount?.toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {loan.date?.slice(0, 10) || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={loan.status} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 mr-3 rounded-lg bg-blue-50">
                            <Phone className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="text-sm text-gray-900">
                            {loan.userDetails?.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {loan.year}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {loan.month}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredLoans.length > 0 && (
            <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
              <div className="mb-2 text-sm text-gray-700 sm:mb-0">
                Showing{' '}
                <span className="font-medium">{filteredLoans.length}</span>{' '}
                loans
              </div>
              <div className="flex items-center">
                <span className="mr-4 text-sm text-gray-700">
                  Total:{' '}
                  <span className="font-semibold">
                    ৳{totalAmount.toFixed(2)}
                  </span>
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    approve: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: <Clock className="w-4 h-4" />,
    },
    rejected: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.icon}
      <span className="ml-1.5 capitalize">{status}</span>
    </div>
  );
};

// Table Header with Sorting
const TableHeader = ({ title, sortKey, sortConfig, onSort }) => {
  const isActive = sortConfig.key === sortKey;
  const isAscending = isActive && sortConfig.direction === 'asc';

  return (
    <th
      className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase transition-colors cursor-pointer hover:bg-gray-100"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center">
        {title}
        <span className="ml-1">
          {isActive ? (
            isAscending ? (
              <span className="text-gray-500">▲</span>
            ) : (
              <span className="text-gray-500">▼</span>
            )
          ) : (
            <span className="opacity-0">▼</span>
          )}
        </span>
      </div>
    </th>
  );
};

export default StaffAllLoans;

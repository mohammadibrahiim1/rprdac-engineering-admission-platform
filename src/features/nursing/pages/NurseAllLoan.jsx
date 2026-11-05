import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Search,
  Filter,
  ChevronDown,
  FileText,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUpIcon,
} from 'lucide-react';
import { useFetchEmployeeDutiesQuery } from '../../../../redux/features/staff/employeeApi';
import { useGetSingleNurseAttendancesQuery } from '../../../../redux/features/Nursing/NursingApi';
import { useGetTeacherClassesQuery } from '../../../../redux/features/teacher/teacherApi';

const StaffAllLoans = () => {
  const auth = useSelector((state) => state?.auth?.user);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc',
  });

  // Data fetching
  const { data: nursingData } = useGetSingleNurseAttendancesQuery({
    nursingId: auth?._id,
  });
  const { data: staffData } = useFetchEmployeeDutiesQuery({
    employeeId: auth?._id,
  });
  const { data: teacherData } = useGetTeacherClassesQuery({
    teacherId: auth?._id,
  });

  // Get role-based data
  const getRoleData = () => {
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
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtered and sorted loans data
  const filteredLoans = getRoleData()
    .flatMap((yearData) =>
      yearData.months
        .filter((month) => !selectedMonth || month.month === selectedMonth)
        .flatMap(
          (month) =>
            month.details?.loans
              ?.filter(
                (loan) =>
                  (!selectedStatus || loan.status === selectedStatus) &&
                  (!selectedYear || yearData.year === selectedYear) &&
                  (loan.amount?.toString().includes(searchQuery) ||
                    loan.date?.includes(searchQuery) ||
                    loan.userDetails?.phone?.includes(searchQuery)),
              )
              .map((loan) => ({
                ...loan,
                year: yearData.year,
                month: month.month,
              })) || [],
        ),
    )
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

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
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        <span className="ml-1.5 capitalize">{status}</span>
      </div>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50  capitalize"
    >
      <div className="mx-auto space-y-6">
        {/* Modern Financial Dashboard Header */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 md:p-8 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* User Info Section */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {auth?.userName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                    {auth?.userName}
                  </h1>
                  <div className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-full">
                    <span className="text-sm font-medium text-indigo-700 capitalize">
                      {auth?.userType === 'staff' ? 'Employee' : auth?.userType}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-sm">
                      {auth?.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-slate-600">
                      Total Records:{' '}
                      <span className="font-semibold text-slate-800">
                        {filteredLoans?.length}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                      Total Loan:{' '}
                      <span className="font-bold text-emerald-600">
                        {filteredLoans
                          .reduce((sum, loan) => sum + loan.amount, 0)
                          .toFixed(2)}{' '}
                        BDT
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {/* <div className="flex-shrink-0">
              <button
                onClick={downloadPDF}
                disabled={!duties.length}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <DownloadIcon className="w-5 h-5 transition-transform group-hover:translate-y-[-1px]" />
                <span>Export Report</span>
              </button>
            </div> */}
          </div>
        </motion.div>

        {/* Filters Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search loans..."
                className="pl-9 w-full h-11 px-3.5 text-sm border border-gray-300 rounded-lg
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Year Select */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 px-1 text-xs font-medium text-gray-500 bg-white z-10">
                Year
              </label>
              <div className="relative mt-1">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full h-11 pl-3 pr-8 text-sm border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   appearance-none bg-white"
                >
                  <option value="">All Years</option>
                  {[...new Set(getRoleData().map((d) => d.year))].map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ),
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Month Select */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 px-1 text-xs font-medium text-gray-500 bg-white z-10">
                Month
              </label>
              <div className="relative mt-1">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-11 pl-3 pr-8 text-sm border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   appearance-none bg-white"
                >
                  <option value="">All Months</option>
                  {[
                    ...new Set(
                      getRoleData().flatMap((d) =>
                        d.months.map((m) => m.month),
                      ),
                    ),
                  ].map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Status Select */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 px-1 text-xs font-medium text-gray-500 bg-white z-10">
                Status
              </label>
              <div className="relative mt-1">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full h-11 pl-3 pr-8 text-sm border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   appearance-none bg-white"
                >
                  <option value="">All Status</option>
                  {['approve', 'pending', 'rejected'].map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <button
              className="w-full h-11 flex items-center justify-center gap-2 bg-gray-900 text-white
                px-4 rounded-lg hover:bg-gray-800 transition-all text-sm font-medium
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
              onClick={() => {
                setSelectedYear('');
                setSelectedMonth('');
                setSelectedStatus('');
                setSearchQuery('');
              }}
            >
              <Filter className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </motion.div>

        {/* Loans Table */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                {filteredLoans?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          No loans found
                        </h3>
                        <p className="text-gray-500 max-w-md">
                          No loans match your current filters. Try adjusting
                          your search or filter criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  [...filteredLoans].reverse().map((loan, index) => (
                    <motion.tr
                      key={index}
                      variants={itemVariants}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                            <DollarSign className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              ৳{loan.amount?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {loan.date?.slice(0, 10) || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={loan.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-50 p-2 rounded-lg mr-3">
                            <Phone className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="text-sm text-gray-900">
                            {loan.userDetails?.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
            <div className="bg-gray-50 px-6 py-3 flex flex-col md:flex-row items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700 mb-2 md:mb-0">
                Showing{' '}
                <span className="font-medium">{filteredLoans.length}</span>{' '}
                loans
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Total Amount:
                  <span className="font-semibold ml-1">
                    ৳
                    {filteredLoans
                      .reduce((sum, loan) => sum + loan.amount, 0)
                      .toFixed(2)}
                  </span>
                </span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Reusable Select Component
// const SelectInput = ({ label, options, value, onChange }) => (
//   <div className="space-y-1">
//     <label className="text-sm font-medium text-gray-700">{label}</label>
//     <div className="relative">
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full h-12 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//       >
//         <option value="">All {label}</option>
//         {options.map((option) => (
//           <option key={option} value={option}>
//             {option.charAt(0).toUpperCase() + option.slice(1)}
//           </option>
//         ))}
//       </select>
//       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 top-1/2 transform -translate-y-1/2">
//         <ChevronDown className="h-5 w-5 text-gray-400" />
//       </div>
//     </div>
//   </div>
// );

// Table Header with Sorting
const TableHeader = ({ title, sortKey, sortConfig, onSort }) => {
  const isSorted = sortConfig.key === sortKey;
  const isAscending = isSorted && sortConfig.direction === 'asc';

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center">
        {title}
        <span className="ml-1">
          {isSorted ? (
            isAscending ? (
              <ArrowUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-gray-500" />
            )
          ) : (
            <span className="opacity-0">
              <ArrowDown className="h-4 w-4" />
            </span>
          )}
        </span>
      </div>
    </th>
  );
};

export default StaffAllLoans;

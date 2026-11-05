import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFetchNursesQuery } from '../../../../../redux/features/Nursing/NursingApi';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Download,
  Loader,
  AlertCircle,
  CheckCircle,
  FileText,
  Users,
  ChevronDown,
  Home,
  ChevronRight as ChevronRightIcon,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const AllNurses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLimitOpen, setIsLimitOpen] = useState(false);

  const {
    data: nurse,
    isLoading,
    isError,
    error,
  } = useFetchNursesQuery({
    searchQuery,
    limit,
    page,
  });

  const nurses = nurse?.data;
  const totalPages = nurse?.totalPages || 1;
  const allNurses = nurse?.allNurses || 0;

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const options = [5, 10, 20, 30, 50];

  const handleSelect = (option) => {
    setLimit(option);
    setIsLimitOpen(false);
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        stiffness: 100,
      },
    }),
    exit: { opacity: 0, y: -20 },
  };

  // Loading state component
  const TableLoader = () => (
    <tr>
      <td colSpan="9" className="py-16 text-center">
        <div className="flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mb-4"
          >
            <Loader className="w-8 h-8 text-blue-600" />
          </motion.div>
          <p className="text-sm text-gray-600">Loading nursing data...</p>
        </div>
      </td>
    </tr>
  );

  // Error state component
  const TableError = () => (
    <tr>
      <td colSpan="9" className="py-16 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="p-3 mb-4 border border-red-200 rounded-full bg-red-50">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Failed to load data
          </h3>
          <p className="max-w-md mb-4 text-sm text-gray-600">
            {error?.data?.message ||
              'An unexpected error occurred. Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-900 rounded-lg hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      {/* NOTION STYLE HEADER */}
      <header className="sticky top-0 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3 max-w-screen-2xl sm:px-12">
          <div className="flex items-center gap-2 overflow-hidden">
            <BreadCrumbMenu />
          </div>
        </div>
      </header>

      <div className="relative z-10 px-6 lg:px-12">
        {/* Header Section */}
        <div className="my-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                All Nursings
              </h1>
              <p className="text-gray-600">
                Manage and monitor all nursing staff in your organization
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 border border-blue-100 rounded-lg bg-blue-50">
                <p className="text-sm text-gray-600">Total Nurses</p>
                <p className="text-2xl font-bold text-gray-900">{allNurses}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={'/dashboard/nursing/duties/all'}
                className="px-4 py-2 border border-blue-100 rounded-lg bg-blue-50"
              >
                <p className="text-sm text-gray-600">All Duties</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <motion.div
          variants={itemVariants}
          className="mb-16 overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl"
        >
          {/* Table Controls */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, phone..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full h-10 pl-10 pr-4 text-sm placeholder-gray-400 transition-all bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Show Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsLimitOpen(!isLimitOpen)}
                    className="flex items-center gap-2 px-3 text-sm transition-colors bg-white border border-gray-300 rounded h-9 hover:bg-gray-50"
                  >
                    Show {limit}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isLimitOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isLimitOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 z-50 w-32 mt-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg"
                      >
                        {options?.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                              limit === option
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Pagination Info */}
                <div className="items-center hidden gap-3 sm:flex">
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="p-2 transition-colors border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setPage((prev) => (prev < totalPages ? prev + 1 : prev))
                      }
                      disabled={page >= totalPages}
                      className="p-2 transition-colors border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-sm font-semibold tracking-wider text-center text-gray-600">
                    #
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold tracking-wider text-left text-gray-600">
                    Nursing Details
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold tracking-wider text-left text-gray-600">
                    User Type
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold tracking-wider text-left text-gray-600">
                    Earnings
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold tracking-wider text-left text-gray-600">
                    Due Payments
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold tracking-wider text-left text-gray-600">
                    Total Paid
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold tracking-wider text-left text-gray-600">
                    Loans
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold tracking-wider text-left text-gray-600">
                    Due Loan
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold tracking-wider text-center text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {isLoading ? (
                    <TableLoader />
                  ) : isError ? (
                    <TableError />
                  ) : nurses?.length ? (
                    nurses?.map((nus, index) => (
                      <motion.tr
                        key={nus?._id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={tableRowVariants}
                        className="transition-colors hover:bg-gray-50/50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center justify-center w-8 h-8 font-medium text-gray-700 bg-gray-100 rounded-full">
                            {(page - 1) * limit + index + 1}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-blue-600 uppercase border rounded bg-gradient-to-br from-blue-50 to-pink-50">
                              {nus?.userName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 capitalize">
                                {nus?.userName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {nus?.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {nus?.userType === 'staff'
                              ? 'Employee'
                              : nus?.userType}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          <p className="font-semibold text-gray-900">
                            {nus?.totalServiceAmount?.toFixed(2) || 0} BDT
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`font-semibold ${
                              nus?.totalDuePayment > 0
                                ? 'text-amber-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {nus?.totalDuePayment?.toFixed(2) || 0} BDT
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          <p className="font-semibold text-gray-900">
                            {nus?.totalPaidAmount?.toFixed(2) || 0} BDT
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`font-semibold ${
                              nus?.totalLoanAmount > 0
                                ? 'text-purple-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {nus?.totalLoanAmount?.toFixed(2) || 0} BDT
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            {nus?.dueLoanAmount > 0 ? (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            <span
                              className={`font-semibold ${
                                nus?.dueLoanAmount > 0
                                  ? 'text-red-600'
                                  : 'text-gray-400'
                              }`}
                            >
                              {nus?.dueLoanAmount?.toFixed(2) || 0} BDT
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <Link
                              to={`/dashboard/nursing/attendances/${nus?._id}`}
                            >
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Statements
                              </motion.button>
                            </Link>
                            <Link to={`/dashboard/invoice/download/${nus._id}`}>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Invoices
                              </motion.button>
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-4 mb-4 bg-gray-100 rounded-full">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            No nursing staff found
                          </h3>
                          <p className="max-w-md mb-4 text-sm text-gray-600">
                            {searchQuery
                              ? `No results found for "${searchQuery}". Try adjusting your search.`
                              : 'There are no nursing staff in the system yet.'}
                          </p>
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-900 rounded-lg hover:bg-gray-800"
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 sm:hidden">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="p-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setPage((prev) => (prev < totalPages ? prev + 1 : prev))
                  }
                  disabled={page >= totalPages}
                  className="p-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AllNurses;

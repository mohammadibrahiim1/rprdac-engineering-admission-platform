import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useAllUsers } from '../hooks/useAllUsers';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import { UserStatsCards } from '../components/UserStatusCards';
import { UserToolbar } from '../components/UserToolbar';
import { exportUsersToExcel } from '../utils/user.exportExcel';
import { UserTable } from '../components/UserTable';
import { User } from '../types/user.types';

const AllUsers: React.FC = () => {
  const {
    search,
    setSearch,
    userType,
    setUserType,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    limit,
    setLimit,
    rowSelection,
    setRowSelection,
    users,
    isLoading,
    isFetching,
    refetch,
    totalPages,
    totalItems,
    handleStatusChange,
    handleDelete,
  } = useAllUsers();

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLimit(val === 'all' ? 'all' : Number(val));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#37352f] antialiased">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-30 flex items-center justify-between h-[45px] px-5 bg-white/80 backdrop-blur-md border-b border-[#37352f]/10">
        <div className="flex items-center gap-2 text-sm">
          <BreadCrumbMenu />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className={`p-1.5 hover:bg-[#efede8] rounded-md transition-colors text-gray-500 ${
              isFetching ? 'text-sky-500' : ''
            }`}
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="px-5 py-8 max-w-full mx-auto">
        {/* Header Title Section */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-[#37352f]">
                  User Registry
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                  ENTERPRISE PLAN
                </span>
              </div>
              <p className="text-sm text-[#37352f]/50 mt-1">
                Manage organization members, assign granular RBAC roles, audit
                2FA hardware key compliance, and control access lifecycles
                across production nodes.
              </p>
            </div>
          </div>
        </motion.header>

        {/* Top Analytics Cards */}
        <UserStatsCards totalItems={totalItems} />

        {/* Category Filter Pills Bar */}
        <div className="flex items-center gap-2 border-b border-[#37352f]/10 pb-4 mb-6 overflow-x-auto">
          {[
            { id: 'all', label: 'All Users', count: totalItems },
            {
              id: 'approved',
              label: 'Approved',
              count:
                users?.filter((u: User) => u?.status === 'approved')?.length ||
                0,
            },
            {
              id: 'pending',
              label: 'Pending',
              count:
                users?.filter((u: User) => u?.status === 'pending')?.length ||
                0,
            },
            {
              id: 'rejected',
              label: 'Rejected',
              count:
                users?.filter((u: User) => u?.status === 'rejected')?.length ||
                0,
            },
          ]?.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'approved' || tab.id === 'rejected') {
                  setStatusFilter(tab.id);
                } else {
                  setUserType('all');
                  setStatusFilter('all');
                }
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                userType === tab.id || statusFilter === tab.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-[#f7f6f3] text-[#37352f]/70 hover:bg-[#efede8]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Toolbar Controls */}
        <UserToolbar
          search={search}
          setSearch={setSearch}
          userType={userType}
          setUserType={setUserType}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          limit={limit}
          handleLimitChange={handleLimitChange}
          onExport={() => exportUsersToExcel(users, limit, page)}
        />

        {/* Table View */}
        <UserTable
          users={users}
          isLoading={isLoading}
          isFetching={isFetching}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          handleStatusChange={handleStatusChange}
          handleDelete={handleDelete}
        />

        {/* Minimalist Pagination Bar */}
        <AnimatePresence>
          {!isLoading && users.length > 0 && limit !== 'all' && (
            <div className="flex flex-wrap items-center justify-between pt-6 mx-auto mt-6 border-t border-[#37352f]/10">
              <div className="text-xs text-[#37352f]/50">
                Showing{' '}
                <span className="text-[#37352f] font-medium">
                  {(page - 1) * Number(limit) + 1}
                </span>{' '}
                to{' '}
                <span className="text-[#37352f] font-medium">
                  {Math.min(page * Number(limit), totalItems)}
                </span>{' '}
                of{' '}
                <span className="text-[#37352f] font-medium">{totalItems}</span>{' '}
                members
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#f7f6f3] hover:bg-[#efede8] text-[#37352f] rounded-md disabled:opacity-20 transition-colors font-medium"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <div className="flex items-center px-3.5 py-1.5 bg-[#f7f6f3] rounded-md text-xs font-bold text-[#37352f]">
                  {page}{' '}
                  <span className="mx-2 text-gray-300 font-normal">/</span>{' '}
                  {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isFetching}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#f7f6f3] hover:bg-[#efede8] text-[#37352f] rounded-md disabled:opacity-20 transition-colors font-medium"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Subtle Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.4]" />
      </div>
    </div>
  );
};

export default AllUsers;

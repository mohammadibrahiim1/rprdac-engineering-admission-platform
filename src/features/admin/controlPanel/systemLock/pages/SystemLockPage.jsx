import React, { useState } from 'react';
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Lock,
  Shield,
  Search,
} from 'lucide-react';
import BreadCrumbMenu from '../../../../../../components/BreadCrumbMenu';
import { useGetAllSystemLocksQuery } from '../api/systemLockApi';
import { useSystemLockActions } from '../hooks/useSystemLockActions';
import { SystemLockModal } from '../components/SystemLockModal';
import { SystemLockTable } from '../components/SystemLockTable';

export default function SystemLockPage() {
  const {
    handleCreate,
    handleUpdate,
    handleDelete,
    actionError,
    setActionError,
    isSubmitting,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    selectedLock,
    setSelectedLock,
    modalOpen,
    setModalOpen,
    filteredLocks,
    searchQuery,
    setSearchQuery,
    isGettingLock,
    isError,
    error,
    locksData,
  } = useSystemLockActions();

  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-2xs">
        <div className=" px-5 sm:px-5 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-md border border-[#143F6B15]"
                style={{ backgroundColor: '#143F6B0D' }}
              >
                <Shield className="w-5 h-5" style={{ color: '#143F6B' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  System Access Locks
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Configure timeline restrictions for admissions and student
                  updates
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98] hover:shadow-md"
              style={{ backgroundColor: '#143F6B' }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add System Lock
            </button>
          </div>
        </div>
      </header>

      <main className=" px-5 sm:px-5 py-6 sm:py-8">
        {/* Search / Filter Control Bar */}
        {!isGettingLock && !isError && locksData?.length > 0 && (
          <div className="mb-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by scope or batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#143F6B]/20 focus:border-[#143F6B] transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="text-xs font-medium text-gray-500 self-end sm:self-center">
              Total Locks:{' '}
              <span className="font-semibold text-gray-800">
                {filteredLocks?.length}
              </span>
            </div>
          </div>
        )}

        {/* Table Container Box */}
        <div className="w-full">
          {isGettingLock ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-md border border-gray-200/80 shadow-2xs">
              <RefreshCw
                className="w-7 h-7 animate-spin mb-3"
                style={{ color: '#143F6B' }}
              />
              <p className="text-xs font-medium text-gray-500">
                Please wait...
              </p>
            </div>
          ) : isError ? (
            <div className="flex items-center gap-3 p-4 bg-red-50/80 border border-red-100 rounded-md text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span className="text-xs sm:text-sm font-medium">
                {error?.message || 'Interna server error!'}
              </span>
            </div>
          ) : locksData?.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-md border border-gray-200/80 shadow-2xs px-4">
              <div
                className="w-14 h-14 mx-auto rounded-md flex items-center justify-center mb-4"
                style={{ backgroundColor: '#143F6B0D' }}
              >
                <Lock
                  className="w-7 h-7 stroke-[1.5]"
                  style={{ color: '#143F6B' }}
                />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                No locks configured
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Active locks help prevent unauthorized admission or student
                profile updates outside scheduled timelines.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold text-white transition-all shadow-sm active:scale-[0.98]"
                style={{ backgroundColor: '#143F6B' }}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Create First Lock
              </button>
            </div>
          ) : (
            <SystemLockTable
              data={filteredLocks}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      <SystemLockModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        selectedLock={selectedLock}
        handleCreate={handleCreate}
        handleUpdate={handleUpdate}
        actionError={actionError}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

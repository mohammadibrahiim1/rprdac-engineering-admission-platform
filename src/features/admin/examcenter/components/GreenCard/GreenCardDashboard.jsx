// @ts-nocheck

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

import GreenCardTable from './GreenCardTable';
import SellerPerformance from './SellerPerformance';
import GreenCardPagination from './GreenCardPagination';
import { useGreenCardExplorer } from '../../hooks/useGreenCardExplorer';
import EditGreenCardModal from './EditGreenCardModal';

const GreenCardDashboard = ({
  tableData,
  view,
  academicYear,
  summary,
  pagination,
  isLoading,
  isUpdating,
  search,
  formData,
  handleSearchChange,
  handleSetSession,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  handleReset,
  handleDeleteSelected,
  isDeleting,
  handleExport,
  refetch,
  setUseCamera,
  setPhoto,
  handleEditClick,
  selectedCard,
  processImage,
  handleUpdateCard,
  closeEditModal,
  SERVER,
  range,
  handleRangeChange,
  isModalOpen,
  institutesData,
  departmentsData,
  sessionOptions,
  handleChange,
  // @ts-ignore
  limit,
  setLimit,
  page,
  setPage,
}) => {
  if (view !== 'list') return null;

  return (
    <motion.div
      key={'list'}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* MAIN DASHBOARD BODY */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* LEFT: PERFORMANCE STATS */}
        <div className="lg:col-span-1">
          <SellerPerformance
            summary={summary}
            handleSetSession={handleSetSession}
          />
        </div>

        {/* RIGHT: TABLE AND PAGINATION */}
        <div className="lg:col-span-2 space-y-4">
          {/* FOLDER METADATA */}
          <div className="flex items-center justify-between text-sm text-slate-500 bg-white p-3 rounded-lg border border-slate-100">
            <span>
              Folder: <b className="text-slate-800">{academicYear || 'All'}</b>
            </span>
            <span>
              Total Records:{' '}
              <b className="text-slate-800">{pagination?.total}</b>
            </span>
          </div>

          <GreenCardTable
            tableData={tableData}
            selectedIds={selectedIds}
            toggleSelectAll={toggleSelectAll}
            toggleSelect={toggleSelect}
            handleEditClick={handleEditClick}
            handleExport={handleExport}
            handleDeleteSelected={handleDeleteSelected}
            handleSearchChange={handleSearchChange}
            handleReset={handleReset}
            isDeleting={isDeleting}
            SERVER={SERVER}
            loading={isLoading}
            range={range}
            handleRangeChange={handleRangeChange}
            // @ts-ignore
            limit={limit}
            setLimit={setLimit}
          />

          {/* PAGINATION */}
          {pagination && (
            <GreenCardPagination
              pagination={pagination}
              page={page}
              setPage={setPage}
            />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditGreenCardModal
        formData={formData}
        setUseCamera={setUseCamera}
        setPhoto={setPhoto}
        processImage={processImage}
        isOpen={isModalOpen}
        onClose={closeEditModal}
        cardData={selectedCard}
        refetch={refetch}
        handleUpdateCard={handleUpdateCard} // we might need to pass update function or just refetch
        SERVER={SERVER}
        institutesData={institutesData}
        departmentsData={departmentsData}
        sessionOptions={sessionOptions}
        handleChange={handleChange}
        isUpdating={isUpdating}
      />
    </motion.div>
  );
};

export default GreenCardDashboard;

import React, { useState } from 'react';
import {
  LayoutGrid,
  FileText,
  Loader2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAdmitCardsQuery } from '../../../../../redux/features/student/studentApi';

import AdmitCardPrintContainer from '../components/AdmitCard/AdmitCardPrintContainer';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import { useAdmitCardFilters } from '../hooks/admitcard/useAdmitCardFilters';
import AdmitCardFilters from '../components/AdmitCard/AdmitCardFilters';
import SingleAdmitCard from '../components/AdmitCard/SingleAdmitCard';
import AdmitCardPagination from '../components/AdmitCard/AdmitCardPagination';
import AdmitCardFormDashboard from '../components/AdmitCard/AdmitCardFormDashboard';

const AdmitCard = () => {
  const [activeTab, setActiveTab] = useState('form');
  const {
    searchTerm,
    filter,
    handleInputChange,
    handleLimitChange,
    handlePageChange,
    handleReset,
  } = useAdmitCardFilters();

  // API query injection via RTK Query
  const { data, isLoading, isError, error, isFetching } =
    useGetAdmitCardsQuery(filter);

  const admitCards = data?.data || [];
  const meta = data?.meta || {};
  const deleteInfo = data?.deleteInfo || null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      {/* Sticky Premium Top Nav & Global Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md print:hidden">
        <nav className="w-full border-b border-slate-100 px-4 h-11 flex items-center">
          <BreadCrumbMenu />
        </nav>
        <div className="flex flex-col px-4 py-5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Admit Card Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated batch processing system. Create, manage and
            broadcast green printable admit cards.
          </p>
        </div>
      </header>

      {/* Main Container Layer */}
      <main className="w-full">
        {/* Modern Accent Sub-Tab Toggler switcher */}
        <div className="flex w-full px-4 py-1.5 bg-slate-100 border-b border-slate-200">
          <div className="flex gap-1 bg-slate-200/70 p-1 rounded">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'form'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid size={14} />
              Create Admit Card
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'details'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText size={14} />
              Explorer & Overview
            </button>
          </div>
        </div>

        {/* Tab View switching implementation */}
        <div className="">
          <AnimatePresence mode="wait">
            {activeTab === 'form' ? (
              <motion.div
                key="form-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <AdmitCardFormDashboard />
              </motion.div>
            ) : (
              <motion.div
                key="details-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                  {/* LEFT COLUMN: Sidebar Filters panel */}
                  <div className="lg:col-span-3 xl:col-span-3">
                    <AdmitCardFilters
                      searchTerm={searchTerm}
                      filter={filter}
                      handleInputChange={handleInputChange}
                      handleLimitChange={handleLimitChange}
                      handleReset={handleReset}
                    />
                  </div>

                  {/* RIGHT COLUMN: Interactive Grid List system */}
                  <div className="lg:col-span-9 xl:col-span-9 space-y-5">
                    {/* Banner Reminder Notification Alert Box */}
                    {deleteInfo && (
                      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-start gap-3 shadow-sm">
                        <span className="text-lg">⚠️</span>
                        <div className="text-xs">
                          <h4 className="font-bold">
                            Upcoming Lifecycle Auto-Deletion Schedule
                          </h4>
                          <p className="text-amber-700/90 mt-0.5">
                            Admit Cards corresponding to range{' '}
                            <b className="text-amber-900">
                              {deleteInfo.idRange}
                            </b>{' '}
                            are slated for database flush cleanup within{' '}
                            <b>
                              {deleteInfo.remainingTime?.hours}h{' '}
                              {deleteInfo.remainingTime?.minutes}m
                            </b>
                            .
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bulk Actions Bar Interface Layer */}
                    {admitCards?.length > 0 && !isLoading && !isFetching && (
                      <div className="rounded flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                          Query Actions Ready
                        </span>
                        <AdmitCardPrintContainer admitCardsData={admitCards} />
                      </div>
                    )}

                    {/* Grid Core Render Lifecycle Handler switcher */}
                    <div className="min-h-[400px]">
                      {isError ? (
                        <div className="flex flex-col items-center justify-center p-12 border border-red-100 bg-red-50/40 rounded-2xl">
                          <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
                          <p className="text-xs font-medium text-red-600">
                            {error?.data?.message ||
                              'Something went wrong.Please, try again later!'}
                          </p>
                        </div>
                      ) : isLoading || isFetching ? (
                        <div className="flex flex-col items-center justify-center p-24 bg-white border border-slate-200/60 shadow-sm rounded-2xl">
                          <Loader2 className="w-8 h-8 mb-3 text-slate-900 animate-spin" />
                          <p className="text-xs font-semibold text-slate-400 tracking-wide animate-pulse">
                            Please wait...
                          </p>
                        </div>
                      ) : admitCards?.length > 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
                        >
                          {admitCards?.map((card) => (
                            <SingleAdmitCard key={card._id} data={card} />
                          ))}
                        </motion.div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
                          <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-slate-50 border border-slate-100">
                            <Search className="w-5 h-5 text-slate-400" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-800">
                            No Target Match Found
                          </h3>
                          <p className="mt-1 text-xs text-slate-400 max-w-sm leading-relaxed">
                            We couldn&apos;t match your criteria parameters to
                            any existing record schemas. Try clearing filters.
                          </p>
                          <button
                            onClick={handleReset}
                            className="px-4 py-2 mt-4 text-xs font-semibold text-white transition-all rounded-lg bg-slate-900 hover:bg-slate-950 active:scale-95 shadow-sm"
                          >
                            Flush Active Filters
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Pagination Context Integration */}
                    {!isLoading && !isFetching && admitCards.length > 0 && (
                      <AdmitCardPagination
                        meta={meta}
                        handlePageChange={handlePageChange}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdmitCard;

import React from 'react';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import { ConfirmDialog, Button } from '../components/UI';
import { Plus, Search, Users, Tag, BarChart2 } from 'lucide-react';
import { useGetBillingRates } from '../hooks/useGetBillingRates';
import BillingRateTable from '../components/UserBillingRate/BillingRateTable';
import BillingRateFormModal from '../components/UserBillingRate/BillingRateFormModal';
import { useBillingRateUpdate } from '../hooks/useUpdateBillingRate';

export default function BillingRateManager() {
  const {
    records,
    pagination,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    formOpen,
    setFormOpen,
    editData,
    setEditData,
    deleteTarget,
    setDeleteTarget,
    deleting,
    handleConfirmDelete,
    refetch,
  } = useGetBillingRates();

  const updateProps = useBillingRateUpdate(refetch);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-neutral-900 font-sans pb-12">
      {/* Top Breadcrumb Header */}
      <header className="sticky top-0 z-20 border-b border-neutral-200/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-full mx-auto px-4 py-3">
          <BreadCrumbMenu />
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 mt-8 space-y-6">
        {/* Page Title & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Billing Rates
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage user roles, hourly rates, and automated sec-rate
              conversions.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditData(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 px-4 py-2 rounded-xl text-xs font-medium shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Billing Rate</span>
          </Button>
        </div>

        {/* Filter / Search Toolbar */}
        {/* <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by user type or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:bg-white focus:border-neutral-900 transition-all"
            />
          </div>
          <div className="text-xs text-neutral-500 hidden sm:block font-medium">
            Total Records: <span className="text-neutral-900 font-bold">{pagination.total}</span>
          </div>
        </div> */}

        {/* TanStack Data Table */}
        <BillingRateTable
          data={records}
          pagination={pagination}
          onPageChange={(newPage) => setPage(newPage)}
          onEdit={(row) => {
            setEditData(row);
            setFormOpen(true);
          }}
          search={search}
          setSearch={setSearch}
          onDelete={(row) => setDeleteTarget(row)}
          isLoading={isLoading}
          {...updateProps}
        />
      </main>

      {/* Modals */}
      <BillingRateFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditData(null);
        }}
        editData={editData}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Billing Rate"
        description={`Are you sure you want to delete billing rates for "${deleteTarget?.userType}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

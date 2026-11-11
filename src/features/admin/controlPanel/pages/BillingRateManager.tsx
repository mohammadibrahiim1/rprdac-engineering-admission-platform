import { Plus } from "lucide-react";
import { useGetBillingRates } from "../hooks/useGetBillingRates";
import BillingRateTable from "../components/BillingRateTable";
import BillingRateFormModal from "../components/BillingRateFormModal";
import { useUpdateBillingRate } from "../hooks/useUpdateBillingRate";
import { IBillingRateRecord } from "../types/BillingRate.types";
import { Button } from "@/components/ui/button";

export default function BillingRateManager() {
  const {
    records,
    pagination,
    isLoading,
    search,
    setSearch,
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

  const updateProps = useUpdateBillingRate(refetch);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-neutral-900 font-sans pb-12">
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
            className="inline-flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 px-4 py-2 rounded-xl text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Billing Rate</span>
          </Button>
        </div>

        {/* Data Table */}
        <BillingRateTable
          data={records}
          pagination={pagination}
          onPageChange={(newPage: number) => setPage(newPage)}
          onEdit={(row: IBillingRateRecord) => {
            setEditData(row);
            setFormOpen(true);
          }}
          search={search}
          setSearch={setSearch}
          onDelete={(row: any) => setDeleteTarget(row)}
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

      {/* <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Billing Rate"
        description={`Are you sure you want to delete billing rates for "${deleteTarget?.userType || "this record"}"? This action cannot be undone.`}
        confirmLabel="Delete"
      /> */}
    </div>
  );
}

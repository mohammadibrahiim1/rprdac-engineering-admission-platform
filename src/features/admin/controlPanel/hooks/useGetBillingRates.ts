import { useState, useMemo } from "react";
import {
  useGetBillingRatesQuery,
  useDeleteBillingRateMutation,
} from "../services/billingRateApi";
import {
  IBillingRateRecord,
  IPaginationMeta,
} from "../types/BillingRate.types";
import { toast } from "sonner";

export interface IDeleteTarget {
  billingRateId: string;
  rateId?: string;
}

export function useGetBillingRates() {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  const [deleteTarget, setDeleteTarget] = useState<IDeleteTarget | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<IBillingRateRecord | null>(null);

  const { data, isLoading, isError, refetch } = useGetBillingRatesQuery({
    page,
    limit,
    search: search.trim() || undefined,
  });

  const [deleteBillingRate] = useDeleteBillingRateMutation();

  const records = useMemo<IBillingRateRecord[]>(() => data?.data || [], [data]);

  const pagination = useMemo<IPaginationMeta>(() => {
    return (
      data?.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
    );
  }, [data]);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBillingRate({
        billingRateId: deleteTarget.billingRateId,
        rateId: deleteTarget.rateId,
      }).unwrap();

      toast.success(
        deleteTarget.rateId
          ? "Category rate successfully deleted"
          : "Billing rate record deleted",
      );
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete billing rate");
    } finally {
      setDeleting(false);
    }
  };

  return {
    records,
    pagination,
    isLoading,
    isError,
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit,
    formOpen,
    setFormOpen,
    editData,
    setEditData,
    deleteTarget,
    setDeleteTarget,
    deleting,
    handleConfirmDelete,
    refetch,
  };
}

import { useState, useMemo } from 'react';
import {
  useGetBillingRatesQuery,
  useDeleteBillingRateMutation,
} from '../services/billingRateApi';
import toast from 'react-hot-toast';

export function useGetBillingRates() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const { data, isLoading, isError, refetch } = useGetBillingRatesQuery({
    page,
    limit,
    search: search.trim() || undefined,
  });

  const [deleteBillingRate] = useDeleteBillingRateMutation();

  const records = useMemo(() => data?.data || [], [data]);
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBillingRate({
        billingRateId: deleteTarget.billingRateId,
        rateId: deleteTarget.rateId,
      }).unwrap();

      toast.success(
        deleteTarget.rateId
          ? 'Category rate successfully deleted'
          : 'Billing rate record deleted',
      );
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete billing rate');
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

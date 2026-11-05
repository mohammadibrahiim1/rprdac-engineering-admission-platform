// hooks/useStudentInvoices.js

import { useCallback, useEffect, useState } from 'react';
import {
  useDeleteStudentInvoicesMutation,
  useGetStudentsInvoicesQuery,
} from '../services/api/studentInvoiceApi';

export const useStudentInvoices = () => {
  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // API Query
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetStudentsInvoicesQuery({
      search: search.trim(),
      startDate,
      endDate,
      status,
      page,
      limit,
    });

  const [deleteInvoices, { isLoading: isDeletingStudentInvoice }] =
    useDeleteStudentInvoicesMutation();

  const totalInvoices = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 0;
  const currentPage = data?.pagination?.currentPage || page;

  const handleSearch = useCallback((value) => {
    setSearch(value.trimStart());
    setPage(1);
    setSelectedIds([]);
  }, []);

  const handleStartDate = useCallback((value) => {
    setStartDate(value);
    setPage(1);
    setSelectedIds([]);
  }, []);

  const handleEndDate = useCallback((value) => {
    setEndDate(value);
    setPage(1);
    setSelectedIds([]);
  }, []);

  const handleStatus = useCallback((value) => {
    setStatus(value);
    setPage(1);
    setSelectedIds([]);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setStatus('all');
    setPage(1);
    setSelectedIds([]);
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage < 1 || (totalPages > 0 && newPage > totalPages)) return;
      setPage(newPage);
      setSelectedIds([]);
    },
    [totalPages],
  );

  const handleLimitChange = useCallback((value) => {
    const nextLimit = value === 'all' ? 'all' : Number(value);
    setLimit(nextLimit);
    setPage(1);
    setSelectedIds([]);
  }, []);

  const handleDelete = useCallback(
    async (ids) => {
      if (!ids?.length) return;
      if (!window.confirm(`Permanently delete ${ids.length} invoice(s)?`))
        return;

      try {
        await deleteInvoices(ids).unwrap();
        setSelectedIds([]);
      } catch (error) {
        alert(error?.data?.message || 'Failed to delete invoice(s).');
      }
    },
    [deleteInvoices],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  useEffect(() => {
    if (!isFetching && totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, isFetching]);

  return {
    invoices: data?.data || [],
    pagination: data?.pagination || null,
    isLoading,
    isFetching,
    isError,
    error,
    isDeletingStudentInvoice,
    search,
    startDate,
    endDate,
    status,
    page,
    limit,
    totalInvoices,
    totalPages,
    currentPage,
    selectedIds,
    setSelectedIds,
    clearSelection,
    handleSearch,
    handleStartDate,
    handleEndDate,
    handleStatus,
    clearFilters,
    handlePageChange,
    handleLimitChange,
    handleDelete,
    refetch,
  };
};

import {
  useCallback,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import {
  StudentInvoice,
  useDeleteStudentInvoicesMutation,
  useGetStudentsInvoicesQuery,
} from "../services/api/studentInvoiceApi";

export interface PaginationMeta {
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  [key: string]: unknown;
}

export interface UseStudentInvoicesReturn {
  invoices: StudentInvoice[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  isDeletingStudentInvoice: boolean;
  search: string;
  startDate: string;
  endDate: string;
  status: string;
  page: number;
  limit: number | "all";
  totalInvoices: number;
  totalPages: number;
  currentPage: number;
  selectedIds: string[];
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
  clearSelection: () => void;
  handleSearch: (value: string) => void;
  handleStartDate: (value: string) => void;
  handleEndDate: (value: string) => void;
  handleStatus: (value: string) => void;
  clearFilters: () => void;
  handlePageChange: (newPage: number) => void;
  handleLimitChange: (value: string | number) => void;
  handleDelete: (ids: string[]) => Promise<void>;
  refetch: () => void;
}

export const useStudentInvoices = (): UseStudentInvoicesReturn => {
  // Filters
  const [search, setSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<string>("all");

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number | "all">(10);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const handleSearch = useCallback((value: string): void => {
    setSearch(value.trimStart());
    setPage(1);
    setSelectedIds([]);
  }, []);

  const handleStartDate = useCallback((value: string): void => {
    setStartDate(value);
    setPage(1);
    setSelectedIds([]);
  }, []);

  const handleEndDate = useCallback((value: string): void => {
    setEndDate(value);
    setPage(1);
    setSelectedIds([]);
  }, []);

  const handleStatus = useCallback((value: string): void => {
    setStatus(value);
    setPage(1);
    setSelectedIds([]);
  }, []);

  const clearFilters = useCallback((): void => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setStatus("all");
    setPage(1);
    setSelectedIds([]);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number): void => {
      if (newPage < 1 || (totalPages > 0 && newPage > totalPages)) return;
      setPage(newPage);
      setSelectedIds([]);
    },
    [totalPages],
  );

  const handleLimitChange = useCallback((value: string | number): void => {
    const nextLimit = value === "all" ? "all" : Number(value);
    setLimit(nextLimit);
    setPage(1);
    setSelectedIds([]);
  }, []);

  const handleDelete = useCallback(
    async (ids: string[]): Promise<void> => {
      if (!ids?.length) return;
      if (!window.confirm(`Permanently delete ${ids.length} invoice(s)?`))
        return;

      try {
        await deleteInvoices(ids).unwrap();
        setSelectedIds([]);
      } catch (err: unknown) {
        const errorObj = err as { data?: { message?: string } };
        alert(errorObj?.data?.message || "Failed to delete invoice(s).");
      }
    },
    [deleteInvoices],
  );

  const clearSelection = useCallback((): void => {
    setSelectedIds([]);
  }, []);

  useEffect(() => {
    if (!isFetching && totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, isFetching]);

  return {
    invoices: (data?.data as StudentInvoice[]) || [],
    pagination: (data?.pagination as PaginationMeta) || null,
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

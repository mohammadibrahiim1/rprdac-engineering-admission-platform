import { useState, useMemo, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { useGetBatchesQuery } from '../../../../../redux/features/batch/batchApi';
import { computeStudentStats } from '../components/Studentstats';
import {
  exportStudentsToExcel,
  getAllExportableFields,
} from '../components/Exporttoexcel';
import {
  Student,
  StudentMeta,
  StudentStats,
  Batch,
} from '../types/allStudents.types';
import {
  useDeleteStudentsByIdsMutation,
  useGetSessionFoldersQuery,
  useGetStudentsQuery,
  useUpdateStudentInformationMutation,
} from '../../../../../redux/features/student/studentApi';

interface UseStudentManagerOptions {
  initialLimit?: number | string;
}

const useStudentManager = (options: UseStudentManagerOptions = {}) => {
  const { initialLimit = 10 } = options;

  // ─── Pagination ───────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number | string>(initialLimit);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPhone = searchParams.get('phone');

  // ─── Filters ──────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState<string>(currentPhone || '');
  const [debouncedSearch, setDebouncedSearch] = useState<string>(
    currentPhone || '',
  );
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [batchQuery, setBatchQuery] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // ─── UI State ─────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [paymentStudent, setPaymentStudent] = useState<Student | null>(null);
  const [studentsToDownload, setStudentsToDownload] = useState<Student[]>([]);
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] =
    useState<boolean>(false);

  // ─── Export Modal ─────────────────────────────────────────
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // ─── Debounce Search ──────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = searchTerm?.trim() || '';
      setDebouncedSearch(value);

      const currentPhoneInUrl = searchParams.get('phone') || '';
      if (value !== currentPhoneInUrl) {
        setCurrentPage(1);
        if (value) {
          setSearchParams({ phone: value });
        } else {
          setSearchParams({});
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, setSearchParams]);

  // ─── API Calls ────────────────────────────────────────────
  const { data: folderResponse } = useGetSessionFoldersQuery();

  const {
    data: studentsResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetStudentsQuery({
    page: currentPage,
    limit,
    search: debouncedSearch,
    batch: selectedBatch,
    session: selectedSession,
    status: selectedStatus,
  });

  const { data: batchesResponse } = useGetBatchesQuery(batchQuery);

  const [updateStudentInformation] = useUpdateStudentInformationMutation();

  const [deleteStudents, { isLoading: isDeleting }] =
    useDeleteStudentsByIdsMutation();

  // ─── Derived Data ─────────────────────────────────────────
  const folders: string[] = folderResponse?.data || [];
  const students: Student[] = useMemo(
    () => studentsResponse?.data || [],
    [studentsResponse],
  );

  const meta: StudentMeta = useMemo(
    () => studentsResponse?.meta || { totalItems: 0, totalPages: 1 },
    [studentsResponse],
  );

  const statistics = useMemo(
    () => studentsResponse?.statistics || {},
    [studentsResponse],
  );

  const allBatches: Batch[] = useMemo(
    () => batchesResponse?.data || [],
    [batchesResponse],
  );

  const filteredBatches: Batch[] = useMemo(() => {
    if (!batchQuery) return allBatches;
    return allBatches.filter((b) =>
      b.title.toLowerCase().includes(batchQuery.toLowerCase()),
    );
  }, [batchQuery, allBatches]);

  const stats: StudentStats = useMemo(
    () => computeStudentStats(students, meta.totalItems),
    [students, meta.totalItems],
  );

  const hasActiveFilters: boolean = Boolean(
    debouncedSearch || selectedBatch || selectedSession || selectedStatus,
  );

  const exportableFields: string[] = useMemo(
    () => getAllExportableFields(students),
    [students],
  );

  // ─── Selection Handlers ───────────────────────────────────
  const handleSelectId = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === students.length ? [] : students.map((s) => s._id),
    );
  }, [students]);

  // ─── Filter Handlers ──────────────────────────────────────
  const handleBatchSelect = useCallback((title: string) => {
    setSelectedBatch(title);
    setBatchQuery(title);
    setIsBatchDropdownOpen(false);
    setCurrentPage(1);
  }, []);

  const handleClearBatch = useCallback(() => {
    setSelectedBatch('');
    setBatchQuery('');
    setCurrentPage(1);
  }, []);

  const handleClearAll = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedBatch('');
    setBatchQuery('');
    setSelectedSession('');
    setSelectedStatus('');
    setCurrentPage(1);
    setLimit(10);
    setSelectedIds([]);
  }, []);

  const handleSessionChange = useCallback((session: string) => {
    setSelectedSession(session);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  const handleLimitChange = useCallback((newLimit: string | number) => {
    const parsedLimit = newLimit === 'all' ? 'all' : Number(newLimit);
    setLimit(parsedLimit);
    setCurrentPage(1);
  }, []);

  // ─── CRUD Handlers ────────────────────────────────────────
  const handleDeleteSelected = useCallback(async () => {
    if (!selectedIds.length) {
      toast.error('No students selected');
      return;
    }
    try {
      const res = await deleteStudents(selectedIds).unwrap();
      toast.success(res?.message || 'Deleted successfully');
      setSelectedIds([]);
      refetch();
    } catch (err: any) {
      console.log(err);
      toast.error(err?.data?.message || 'Delete failed');
    }
  }, [selectedIds, deleteStudents, refetch]);

  // const handleDeleteOne = useCallback(
  //   async (ids: string[]) => {
  //     try {
  //       const res = await deleteStudents(ids).unwrap();
  //       toast.success(res?.message || 'Student deleted');
  //       refetch();
  //     } catch (err: any) {
  //       toast.error(err?.data?.message || 'Delete failed');
  //     }
  //   },
  //   [deleteStudents, refetch],
  // );

  const handleUpdateStudent = useCallback(
    async ({ id, data: formData }: { id: string; data: any }) => {
      try {
        await updateStudentInformation({ id, data: formData }).unwrap();
        toast.success('Student updated successfully!');
        refetch();
        setEditingStudent(null);
      } catch (err: any) {
        toast.error(err?.data?.message || 'Update failed');
      }
    },
    [updateStudentInformation, refetch],
  );

  const handleOpenModal = () => {
    if (!students.length) {
      toast.error('No student data available to export.');
      return;
    }
    setSelectedFields([]);
    setIsOpen(true);
  };

  const handleToggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  const handleSelectAllToggle = () => {
    if (selectedFields.length === exportableFields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields([...exportableFields]);
    }
  };

  const formatLabel = (str: string) =>
    str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

  const handleExportToExcel = useCallback(async () => {
    let targetStudents: Student[] = [];

    if (selectedIds.length > 0) {
      targetStudents = students.filter((s) => selectedIds.includes(s._id));
    } else {
      targetStudents = students;
    }

    if (targetStudents.length === 0) {
      toast.error('No students selected or found to export!');
      return;
    }

    const result = await exportStudentsToExcel(
      targetStudents,
      'students_report',
      selectedFields,
    );

    if (!result?.success) {
      toast.error(result?.message || 'Export failed');
    } else {
      toast.success('Excel exported successfully!');
    }
  }, [selectedFields, selectedIds, students]);

  const handleAdmitCards = useCallback(() => {
    let targetStudents: Student[] = [];

    if (selectedIds.length > 0) {
      targetStudents = students.filter(
        (s) => selectedIds.includes(s._id) && Number(s.dueAmount) === 0,
      );
    } else {
      targetStudents = students.filter((s) => Number(s.dueAmount) === 0);
    }

    if (targetStudents.length === 0) {
      if (selectedIds.length > 0) {
        toast.error('Selected student-der moddhe karo payment clear nai!');
      } else {
        toast.error('No paid students to generate admit cards for');
      }
      return;
    }

    setStudentsToDownload(targetStudents);
  }, [selectedIds, students]);

  const openPaymentModal = useCallback(
    (s: Student) => setPaymentStudent(s),
    [],
  );
  const closePaymentModal = useCallback(() => setPaymentStudent(null), []);

  return {
    students,
    meta,
    statistics,
    filteredBatches,
    stats,
    folders,
    isLoading,
    isFetching,
    error,
    isDeleting,
    currentPage,
    setCurrentPage,
    limit,
    searchTerm,
    setSearchTerm,
    searchParams,
    setSearchParams,
    debouncedSearch,
    setDebouncedSearch,
    selectedBatch,
    batchQuery,
    setBatchQuery,
    selectedSession,
    setSelectedSession,
    selectedStatus,
    hasActiveFilters,
    isBatchDropdownOpen,
    setIsBatchDropdownOpen,
    currentPhone,
    selectedIds,
    handleSelectId,
    handleSelectAll,
    selectedFields,
    editingStudent,
    setEditingStudent,
    paymentStudent,
    openPaymentModal,
    closePaymentModal,
    studentsToDownload,
    setStudentsToDownload,
    isOpen,
    setIsOpen,
    handleBatchSelect,
    handleBatchChange: handleBatchSelect,
    handleClearBatch,
    handleClearAll,
    handleSessionChange,
    handleStatusChange,
    handleLimitChange,
    handleDeleteSelected,
    // handleDeleteOne,
    handleUpdateStudent,
    handleExportToExcel,
    handleAdmitCards,
    handleOpenModal,
    handleToggleField,
    handleSelectAllToggle,
    formatLabel,
    exportableFields,
    refetch,
  };
};

export default useStudentManager;

import { useState, useEffect, useMemo } from 'react';
import {
  useCreateSubjectMutation,
  useGetSubjectsQuery,
  useDeleteSubjectsMutation,
  useUpdateSubjectMutation,
  useDeleteOptionsMutation,
  useUpdateOptionsMutation,
  useGetDepartmentsQuery,
} from '../../../../../redux/features/subject/subjectApi';

export const useSubjectControll = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingLabel, setEditingLabel] = useState(null);
  const [editingLabelValue, setEditingLabelValue] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });

  // API
  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    isError: subjectsError,
    error: subjectsErrorData,
    refetch: refetchSubjects,
  } = useGetSubjectsQuery(debouncedSearch);

  const { data: departmentsData } = useGetDepartmentsQuery();

  const [createSubject, { isLoading: creatingSubject }] =
    useCreateSubjectMutation();
  const [deleteSubjects] = useDeleteSubjectsMutation();
  const [updateSubject] = useUpdateSubjectMutation();
  const [deleteOptions] = useDeleteOptionsMutation();
  const [updateOptions] = useUpdateOptionsMutation();

  const subjects = subjectsData?.data || [];
  const departments = departmentsData?.data || [];
  const totalCount = subjectsData?.count || 0;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const showToast = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 4000);
  };

  // ---------- Subject CRUD ----------
  const handleCreateSubject = async (data) => {
    try {
      const res = await createSubject({
        label: data.label.trim(),
        departmentId: data.departmentId,
        isCommon: data.isCommon || false,
        thumbnail: data.thumbnail?.trim() || '',
      }).unwrap();

      showToast(res.message || 'Subject created successfully', 'success');
      refetchSubjects();
      return true;
    } catch (err) {
      showToast(err?.data?.message || 'Failed to create subject', 'error');
      return false;
    }
  };

  const handleUpdateSubjectLabel = async (subjectId) => {
    if (!editingLabelValue.trim()) {
      showToast('Label cannot be empty', 'error');
      return;
    }
    try {
      const res = await updateSubject({
        id: subjectId,
        label: editingLabelValue.trim(),
      }).unwrap();
      showToast(res.message || 'Subject label updated', 'success');
      setEditingLabel(null);
      setEditingLabelValue('');
      refetchSubjects();
    } catch (err) {
      showToast(err?.data?.message || 'Failed to update subject', 'error');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?'))
      return;
    try {
      const res = await deleteSubjects([id]).unwrap();
      showToast(res.message || 'Subject deleted successfully', 'success');
      setSelectedSubjects((prev) => prev.filter((sid) => sid !== id));
      refetchSubjects();
    } catch (err) {
      showToast(err?.data?.message || 'Failed to delete subject', 'error');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSubjects.length === 0) return;
    if (
      !window.confirm(`Delete ${selectedSubjects.length} selected subject(s)?`)
    )
      return;
    try {
      const res = await deleteSubjects(selectedSubjects).unwrap();
      showToast(res.message || 'Selected subjects deleted', 'success');
      setSelectedSubjects([]);
      refetchSubjects();
    } catch (err) {
      showToast(
        err?.data?.message || 'Failed to delete selected subjects',
        'error',
      );
    }
  };

  // ---------- Options ----------
  const handleDeleteOption = async (subjectId, option) => {
    if (!window.confirm(`Delete option "${option}"?`)) return;
    try {
      const res = await deleteOptions({
        id: subjectId,
        options: [option],
      }).unwrap();
      showToast(res.message || 'Option deleted', 'success');
      refetchSubjects();
    } catch (err) {
      showToast(err?.data?.message || 'Failed to delete option', 'error');
    }
  };

  const handleUpdateOption = async (subjectId) => {
    if (!editingValue.trim()) {
      showToast('Option cannot be empty', 'error');
      return;
    }
    try {
      const res = await updateOptions({
        id: subjectId,
        updates: [{ old: editingOption, new: editingValue.trim() }],
      }).unwrap();
      showToast(res.message || 'Option updated', 'success');
      setEditingOption(null);
      setEditingValue('');
      refetchSubjects();
    } catch (err) {
      showToast(err?.data?.message || 'Failed to update option', 'error');
    }
  };

  const cancelEdit = () => {
    setEditingOption(null);
    setEditingValue('');
    setEditingLabel(null);
    setEditingLabelValue('');
  };

  // ---------- Selection ----------
  const toggleSubjectSelection = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
  };

  const selectAllSubjects = () => {
    if (selectedSubjects.length === subjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(subjects.map((s) => s._id));
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
  };

  return {
    // Data
    subjects,
    departments,
    totalCount,
    subjectsLoading,
    subjectsError,
    subjectsErrorData,
    creatingSubject,

    // Search & View
    searchTerm,
    setSearchTerm,
    clearSearch,
    viewMode,
    setViewMode,

    // Selection
    selectedSubjects,
    toggleSubjectSelection,
    selectAllSubjects,
    handleDeleteSelected,

    // Editing
    editingOption,
    setEditingOption,
    editingValue,
    setEditingValue,
    editingLabel,
    setEditingLabel,
    editingLabelValue,
    setEditingLabelValue,
    cancelEdit,

    // Handlers
    handleCreateSubject,
    handleUpdateSubjectLabel,
    handleDeleteSubject,
    handleDeleteOption,
    handleUpdateOption,
    refetchSubjects,

    // Notification
    notification,
    setNotification,
    showToast,
  };
};

import { useState, useCallback } from 'react';
import {
  useCreateAdmissionTimelineMutation,
  useDeleteAdmissionTimelineMutation,
  useGetActiveAdmissionTimelineQuery,
  useGetAdmissionTimelinesQuery,
  useUpdateAdmissionTimelineMutation,
} from '../api/admissionTimelineApi';

export const useAdmissionTimelineContainer = () => {
  // RTK Queries
  const {
    data: timelinesData,
    isLoading: isLoadingList,
    isError: isErrorList,
    refetch,
  } = useGetAdmissionTimelinesQuery();

  const {
    data: activeData,
    isLoading: isLoadingActive,
    isError: isErrorActive,
  } = useGetActiveAdmissionTimelineQuery();

  // RTK Mutations
  const [createTimeline, { isLoading: isCreating }] =
    useCreateAdmissionTimelineMutation();
  const [updateTimeline, { isLoading: isUpdating }] =
    useUpdateAdmissionTimelineMutation();
  const [deleteTimeline, { isLoading: isDeleting }] =
    useDeleteAdmissionTimelineMutation();

  // Modal State Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleOpenCreate = useCallback(() => {
    setEditingItem(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);

  // delete selected timeline
  const handleDeleteSelected = useCallback(
    async (ids) => {
      try {
        await deleteTimeline(ids).unwrap();
        refetch();
      } catch (err) {
        alert(err?.data?.message || 'Failed to delete selected timeline(s).');
      }
    },
    [deleteTimeline, refetch],
  );

  return {
    // Data
    timelines: timelinesData?.data || [],
    activeData,
    // Loading & Error states
    isLoadingList,
    isErrorList,
    isLoadingActive,
    isErrorActive,
    isSubmitting: isCreating || isUpdating,
    isDeleting,
    // Modal controls
    isModalOpen,
    editingItem,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    // Actions
    handleDeleteSelected,
    handleSubmitForm: editingItem ? updateTimeline : createTimeline,
  };
};

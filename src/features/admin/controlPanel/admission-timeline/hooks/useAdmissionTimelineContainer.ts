import { useState, useCallback } from "react";
import { AdmissionTimelineItem } from "../timeline-types/Timeline.types";

import {
  useCreateAdmissionTimelineMutation,
  useDeleteAdmissionTimelineMutation,
  useGetActiveAdmissionTimelineQuery,
  useGetAdmissionTimelinesQuery,
  useUpdateAdmissionTimelineMutation,
} from "../api/admissionTimelineApi";

// ==========================================
// Types & Interfaces
// ==========================================
export interface AdmissionTimelineResponse {
  success: boolean;
  message?: string;
  data: AdmissionTimelineItem[];
}

export interface SingleTimelineResponse {
  success: boolean;
  message?: string;
  data: AdmissionTimelineItem;
}

export interface UpdateTimelinePayload {
  id: string;
  body: Partial<AdmissionTimelineItem>;
}

export interface UseAdmissionTimelineContainerReturn {
  timelines: AdmissionTimelineItem[];
  activeData: AdmissionTimelineItem | null | undefined;
  isLoadingList: boolean;
  isErrorList: boolean;
  isLoadingActive: boolean;
  isErrorActive: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  isModalOpen: boolean;
  editingItem: AdmissionTimelineItem | null;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: AdmissionTimelineItem) => void;
  handleCloseModal: () => void;
  handleDeleteSelected: (ids: string[]) => Promise<void>;
  handleSubmitForm: any; // RTK Mutation trigger function typed dynamically
}

export const useAdmissionTimelineContainer =
  (): UseAdmissionTimelineContainerReturn => {
    // RTK Queries
    const {
      data: timelinesData,
      isLoading: isLoadingList,
      isError: isErrorList,
      refetch,
    } = useGetAdmissionTimelinesQuery(undefined);

    const {
      data: activeData,
      isLoading: isLoadingActive,
      isError: isErrorActive,
    } = useGetActiveAdmissionTimelineQuery(undefined);

    // RTK Mutations
    const [createTimeline, { isLoading: isCreating }] =
      useCreateAdmissionTimelineMutation();
    const [updateTimeline, { isLoading: isUpdating }] =
      useUpdateAdmissionTimelineMutation();
    const [deleteTimeline, { isLoading: isDeleting }] =
      useDeleteAdmissionTimelineMutation();

    // Modal State Management
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingItem, setEditingItem] =
      useState<AdmissionTimelineItem | null>(null);

    const handleOpenCreate = useCallback(() => {
      setEditingItem(null);
      setIsModalOpen(true);
    }, []);

    const handleOpenEdit = useCallback((item: AdmissionTimelineItem) => {
      setEditingItem(item);
      setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
      setIsModalOpen(false);
      setEditingItem(null);
    }, []);

    // Delete selected timeline(s)
    const handleDeleteSelected = useCallback(
      async (ids: string[]): Promise<void> => {
        try {
          await deleteTimeline({ ids }).unwrap();
          refetch();
        } catch (err: any) {
          alert(
            err?.data?.message ||
              err?.message ||
              "Failed to delete selected timeline(s).",
          );
        }
      },
      [deleteTimeline, refetch],
    );

    return {
      // Data
      timelines: timelinesData?.data || [],
      activeData: activeData?.data,
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

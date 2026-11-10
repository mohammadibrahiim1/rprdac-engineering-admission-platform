export interface AdmissionTimelineItem {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: string;
  [key: string]: unknown;
}

export interface AdmissionTimelineContainerReturn {
  timelines: AdmissionTimelineItem[];
  isLoadingList: boolean;
  isErrorList: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  isModalOpen: boolean;
  editingItem: AdmissionTimelineItem | null;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: AdmissionTimelineItem) => void;
  handleCloseModal: () => void;
  handleDeleteSelected: (ids: string[]) => Promise<void> | void;
  handleSubmitForm: (formData: Record<string, unknown>) => Promise<void> | void;
}

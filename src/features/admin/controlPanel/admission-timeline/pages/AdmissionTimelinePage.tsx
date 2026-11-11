import React from "react";
import { AdmissionTimelineItem } from "../timeline-types/Timeline.types";
import TimelineHeader from "../components/TimelineHeader";
import TimelineFormModal from "../components/TimelineFormModal";
import TimelineTable from "../components/TimelineTable";
import { useAdmissionTimelineContainer } from "../hooks/useAdmissionTimelineContainer";

const AdmissionTimelinePage: React.FC = () => {
  const {
    timelines,
    isLoadingList,
    isErrorList,
    isSubmitting,
    isDeleting,
    isModalOpen,
    editingItem,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    handleDeleteSelected,
    handleSubmitForm,
  }: {
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
    handleSubmitForm: (
      formData: Record<string, unknown>,
    ) => Promise<void> | void;
  } = useAdmissionTimelineContainer();

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 font-sans antialiased">
      {/* Header */}
      <TimelineHeader
        isModalOpen={isModalOpen}
        handleOpenCreate={handleOpenCreate}
        timelines={timelines}
      />

      {/* Main Timeline Table */}
      <div className="p-5 max-w-7xl mx-auto">
        {isLoadingList ? (
          <div className="flex items-center justify-center py-20 text-xs font-semibold text-slate-400">
            Please wait...
          </div>
        ) : isErrorList ? (
          <div className="p-4 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg border border-rose-200">
            Something went wrong! Failed to load admission timelines.
          </div>
        ) : (
          <TimelineTable
            timelines={timelines}
            onEdit={handleOpenEdit}
            onDeleteSelected={handleDeleteSelected}
            isDeleting={isDeleting}
          />
        )}
      </div>

      {/* Create / Edit Modal */}
      <TimelineFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitForm}
        editingData={editingItem}
        isLoading={isSubmitting} 
      />
    </div>
  );
};

export default AdmissionTimelinePage;

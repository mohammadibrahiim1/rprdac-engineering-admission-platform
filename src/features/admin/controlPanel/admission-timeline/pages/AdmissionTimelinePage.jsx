import { useAdmissionTimelineContainer } from '../hooks/useAdmissionTimelineContainer';
import TimelineTable from '../components/TimelineTable';
import TimelineFormModal from '../components/TimelineFormModal';
import TimelineHeader from '../components/TimelineHeader';

const AdmissionTimelinePage = () => {
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
  } = useAdmissionTimelineContainer();

  return (
    <div>
      {/* Header */}
      <TimelineHeader
        isModalOpen={isModalOpen}
        handleOpenCreate={handleOpenCreate}
        timelines={timelines}
      />

      {/* Main Timeline Table */}
      <div className="p-5">
        {isLoadingList ? (
          <div className="text-center py-10 text-gray-500">Please wait...</div>
        ) : isErrorList ? (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
            Something went wrong!
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

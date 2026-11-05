import { useState } from 'react';
import {
  useCreateSystemLockMutation,
  useUpdateSystemLockMutation,
  useDeleteSystemLockMutation,
  useGetAllSystemLocksQuery,
} from '../api/systemLockApi';
import { buildLockPayload } from '../utils/buildLockPayload';
import { MESSAGES } from '../constants/messages';
import toast from 'react-hot-toast';

export const useSystemLockActions = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLock, setSelectedLock] = useState(null);
  const [actionError, setActionError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [createLock, { isLoading: isCreating }] = useCreateSystemLockMutation();
  const [updateLock, { isLoading: isUpdating }] = useUpdateSystemLockMutation();
  const [deleteLock, { isLoading: isDeleting }] = useDeleteSystemLockMutation();
  const {
    data: response,
    isLoading: isGettingLock,
    isError,
    error,
  } = useGetAllSystemLocksQuery();

  const locksData = response?.data || [];

  const filteredLocks = locksData?.filter((lock) => {
    const q = searchQuery.toLowerCase();
    return (
      lock?.scope?.toLowerCase().includes(q) ||
      lock?.batchName?.toLowerCase().includes(q)
    );
  });

  const handleOpenCreateModal = () => {
    setSelectedLock(null);
    setActionError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (lock) => {
    setSelectedLock(lock);
    setActionError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLock(null);
    setActionError('');
  };

  // create lock system
  const handleCreate = async (formData, onSuccess) => {
    setActionError('');
    try {
      const payload = buildLockPayload(formData, null); // Selected Lock null

      const res = await createLock(payload).unwrap();
      toast.success(res?.message || 'Successfully saved lock system.');
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      const errorMessage =
        err?.data?.message || err?.message || MESSAGES.OPERATION_FAILED;
      setActionError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // update lock system
  const handleUpdate = async (formData, selectedLock, onSuccess) => {
    setActionError('');
    try {
      const payload = buildLockPayload(formData, selectedLock);

      const res = await updateLock(payload).unwrap();

      toast.success(res?.message || 'Successfully updated lock system.');
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      const errorMessage =
        err?.data?.message || err?.message || MESSAGES.OPERATION_FAILED;
      setActionError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id, onSuccess) => {
    if (window.confirm(MESSAGES.DELETE_CONFIRMATION)) {
      try {
        const res = await deleteLock({
          actionType: 'DELETE_FULL_DOCUMENT',
          targetId: id,
        }).unwrap();
        toast.success(res?.message || 'Lock deleted successfully!');
        if (onSuccess) onSuccess();
      } catch (err) {
        toast.error(err?.data?.message || MESSAGES.DELETE_FAILED);
      }
    }
  };

  return {
    modalOpen,
    setModalOpen,
    selectedLock,
    filteredLocks,
    searchQuery,
    setSearchQuery,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleCreate,
    handleUpdate,
    handleDelete,
    actionError,
    setActionError,
    isSubmitting: isCreating || isUpdating,
    isDeleting,
    locksData,
    isGettingLock,
    isError,
    error,
  };
};

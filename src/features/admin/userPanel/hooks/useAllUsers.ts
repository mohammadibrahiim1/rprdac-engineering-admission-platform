import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
} from '../../../../../redux/features/users/userApi';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

export const useAllUsers = () => {
  const [search, setSearch] = useState('');
  const [userType, setUserType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number | 'all'>(10);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const { data, isLoading, refetch, isError, isFetching } = useGetUsersQuery({
    search,
    page,
    limit,
    userType: userType !== 'all' ? userType : '',
    status: statusFilter !== 'all' ? statusFilter : '',
  });

  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = data?.data || [];
  const pagination = data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const promise = updateUserStatus({ userId, status: newStatus }).unwrap();
    toast.promise(promise, {
      loading: 'Updating user status...',
      success: 'Status updated successfully!',
      error: 'Failed to update status.',
    });
    try {
      await promise;
      refetch();
    } catch (e) {
      // Handled by toast.promise
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId).unwrap();
      toast.success('User removed successfully');
      refetch();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return {
    search,
    setSearch,
    userType,
    setUserType,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    limit,
    setLimit,
    rowSelection,
    setRowSelection,
    users,
    isLoading,
    isFetching,
    isError,
    refetch,
    totalPages,
    totalItems,
    handleStatusChange,
    handleDelete,
  };
};

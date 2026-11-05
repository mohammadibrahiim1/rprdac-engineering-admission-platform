import { useState } from 'react';
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
} from '../../../../../redux/features/subject/subjectApi';

export const useDepartmentControll = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });

  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    isError: departmentsError,
    refetch: refetchDepartments,
  } = useGetDepartmentsQuery();

  const [createDepartment, { isLoading: creatingDept }] =
    useCreateDepartmentMutation();

  const departments = departmentsData?.data || [];

  const showToast = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 4000);
  };

  const handleCreateDepartment = async (data) => {
    if (!data.name?.trim()) {
      showToast('Department name is required', 'error');
      return false;
    }
    try {
      const res = await createDepartment({ name: data.name.trim() }).unwrap();
      showToast(res.message || 'Department created successfully', 'success');
      refetchDepartments();
      return true;
    } catch (err) {
      showToast(err?.data?.message || 'Failed to create department', 'error');
      return false;
    }
  };

  return {
    departments,
    departmentsLoading,
    departmentsError,
    creatingDept,
    handleCreateDepartment,
    refetchDepartments,
    notification,
    setNotification,
    showToast,
  };
};

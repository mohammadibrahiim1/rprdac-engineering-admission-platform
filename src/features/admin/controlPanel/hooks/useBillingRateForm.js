import { useState, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import debounce from 'lodash.debounce';
import toast from 'react-hot-toast';
import { useGetUsersQuery } from '../../../../../redux/features/users/userApi';
import { useCreateBillingRateMutation } from '../services/billingRateApi';

export function useBillingRateForm(onClose, onSuccess) {
  const [search, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('teacher'); // Default 'teacher' select thakbe
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState('all'); // Ekbare beshi user load korar jonno
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // RTK Query Mutation for Create / Bulk Save
  const [createBillingRate, { isLoading: isCreating }] =
    useCreateBillingRateMutation();

  // User fetch query (userType and search/phone number diye)
  const { data: userData, isFetching: userLoading } = useGetUsersQuery({
    search,
    page,
    limit,
    userType: userTypeFilter,
  });

  const usersList = userData?.data?.users || userData?.data || [];

  // React Hook Form Setup
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      userType: 'teacher',
      rates: [
        {
          category: '',
          hourlyRate: '',
          secRate: '',
          startDate: '',
          endDate: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rates',
  });

  // Debounced search handler for phone number or name
  const handleSearchChange = useMemo(
    () =>
      debounce((query) => {
        setSearchQuery(query);
      }, 400),
    [],
  );

  // UserType filter change handler
  const handleUserTypeChange = (type) => {
    setUserTypeFilter(type);
    setValue('userType', type, { shouldValidate: true, shouldDirty: true });
    setSelectedUserIds([]); // Filter change korle selection reset hoye jabe
  };

  // Single user checkbox toggle handler
  const handleToggleUserSelect = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // Select All users toggle handler
  const handleSelectAllToggle = (e) => {
    if (e.target.checked) {
      const allIds = usersList.map((user) => user._id || user.id);
      setSelectedUserIds(allIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleHourlyRateChange = useCallback(
    (index, value) => {
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) {
        const sec = (num / 3600).toFixed(4);
        setValue(`rates.${index}.secRate`, sec, { shouldValidate: true });
      } else {
        setValue(`rates.${index}.secRate`, '', { shouldValidate: true });
      }
    },
    [setValue],
  );

  // Submit Handler for Single or Bulk Billing Rate Creation
  const handleCreateSubmit = async (data) => {
    if (selectedUserIds.length === 0) {
      toast.error('Select at least one user.');
      return;
    }

    try {
      const payload = {
        userIds: selectedUserIds, // Backend-er unified controller eeta handle korbe
        userType: data.userType.trim().toLowerCase(),
        rates: data.rates.map((r) => ({
          category: r.category.trim().toLowerCase(),
          hourlyRate: parseFloat(r.hourlyRate) || 0,
          secRate: parseFloat(r.secRate) || 0,
          effectiveFrom: r.startDate
            ? new Date(r.startDate).toISOString()
            : new Date().toISOString(),
          effectiveTo: r.endDate ? new Date(r.endDate).toISOString() : null,
        })),
      };

      await createBillingRate(payload).unwrap();
      toast.success(
        selectedUserIds.length > 1
          ? `Sothikvabe ${selectedUserIds.length} jon user er billing rate save kora hoyeche!`
          : 'Billing rate successfully created!',
      );
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to create billing rate.');
    }
  };

  return {
    register,
    control,
    handleCreateSubmit: handleSubmit(handleCreateSubmit),
    errors,
    isValid,
    isCreating,
    fields,
    append,
    remove,
    handleHourlyRateChange,
    handleSearchChange,
    handleUserTypeChange,
    userTypeFilter,
    usersList,
    userLoading,
    selectedUserIds,
    handleToggleUserSelect,
    handleSelectAllToggle,
  };
}

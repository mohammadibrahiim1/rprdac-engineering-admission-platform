import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { INITIAL_FORM_VALUES } from '../constants/initialValues';
import { formatToLocalDatetime } from '../utils/systemLockDateUtils';
import { getLockData } from '../utils/lockHelpers';

export const useSystemLockForm = (selectedLock = null) => {
  const getInitialValues = useCallback(() => {
    if (!selectedLock) return INITIAL_FORM_VALUES;

    const lockData = getLockData(selectedLock);
    return {
      scope: selectedLock.scope || '',
      batchName: lockData.batchName || '',
      session: lockData.session || '',
      startDate: formatToLocalDatetime(lockData.startDate),
      endDate: formatToLocalDatetime(lockData.endDate),
      isActive: lockData.isActive ?? true,
    };
  }, [selectedLock]);

  const form = useForm({
    defaultValues: getInitialValues(),
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset(getInitialValues());
  }, [form, getInitialValues]);

  return {
    ...form,
    resetForm: (values = INITIAL_FORM_VALUES) => form.reset(values),
  };
};

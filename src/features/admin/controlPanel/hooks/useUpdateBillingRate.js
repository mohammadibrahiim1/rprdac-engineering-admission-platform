import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useUpdateBillingRateMutation } from '../services/billingRateApi';

export function useBillingRateUpdate(onSuccess) {
  const [updateBillingRate, { isLoading: isUpdating }] =
    useUpdateBillingRateMutation();

  const [editingIndex, setEditingIndex] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  const handleStartEdit = useCallback(
    (row, rate, index) => {
      setEditingIndex(`${row._id}-${index}`);
      setActiveRow(row);
      setActiveIndex(index);

      reset({
        inlineCategory: rate.category || '',
        inlineHourlyRate: rate.hourlyRate || '',
        inlineStartDate: rate.effectiveFrom
          ? rate.effectiveFrom.split('T')[0]
          : '',
        inlineEndDate: rate.effectiveTo ? rate.effectiveTo.split('T')[0] : '',
      });
    },
    [reset],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    setActiveRow(null);
    setActiveIndex(null);
  }, []);

  const handleInlineSubmit = handleSubmit(async (values) => {
    if (!activeRow || activeIndex === null) return;

    try {
      const hourlyRateNum = parseFloat(values.inlineHourlyRate) || 0;
      const secRateNum =
        hourlyRateNum > 0 ? parseFloat((hourlyRateNum / 3600).toFixed(4)) : 0;

      // Map rates while passing the sub-document _id for the patch system
      const updatedRates = activeRow.rates.map((r, i) => {
        if (i === activeIndex) {
          return {
            _id: r._id, // Crucial for backend subdocument identification
            category: values.inlineCategory.trim().toLowerCase(),
            hourlyRate: hourlyRateNum,
            secRate: secRateNum,
            effectiveFrom: values.inlineStartDate
              ? new Date(values.inlineStartDate).toISOString()
              : r.effectiveFrom,
            effectiveTo: values.inlineEndDate
              ? new Date(values.inlineEndDate).toISOString()
              : null,
          };
        }
        return {
          _id: r._id,
          category: r.category,
          hourlyRate: r.hourlyRate,
          secRate: r.secRate,
          effectiveFrom: r.effectiveFrom,
          effectiveTo: r.effectiveTo,
        };
      });

      const payload = {
        id: activeRow._id,
        userType: activeRow.userType,
        rates: updatedRates,
      };

      await updateBillingRate(payload).unwrap();
      toast.success('Billing rate updated successfully!');
      handleCancelEdit();
      onSuccess?.();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update billing rate.');
    }
  });

  return {
    register,
    isUpdating,
    editingIndex,
    handleStartEdit,
    handleCancelEdit,
    handleInlineSubmit,
  };
}

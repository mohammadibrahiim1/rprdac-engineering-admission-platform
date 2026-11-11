import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useUpdateBillingRateMutation } from "../services/billingRateApi";
import {
  IBillingRateRecord,
  IInlineUpdateFormValues,
  IRateItem,
  IUpdateBillingRatePayload,
  IUseUpdateBillingRateReturn,
} from "../types/BillingRate.types";
import { toast } from "sonner";

export function useUpdateBillingRate(
  onSuccess?: () => void,
): IUseUpdateBillingRateReturn {
  const [updateBillingRate, { isLoading: isUpdating }] =
    useUpdateBillingRateMutation();

  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [activeRow, setActiveRow] = useState<IBillingRateRecord | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { register, handleSubmit, reset } = useForm<IInlineUpdateFormValues>({
    defaultValues: {
      inlineCategory: "",
      inlineHourlyRate: "",
      inlineStartDate: "",
      inlineEndDate: "",
    },
  });

  const handleStartEdit = useCallback(
    (row: IBillingRateRecord, rate: IRateItem, index: number) => {
      setEditingIndex(`${row._id}-${index}`);
      setActiveRow(row);
      setActiveIndex(index);

      reset({
        inlineCategory: rate.category || "",
        inlineHourlyRate: rate.hourlyRate || "",
        inlineStartDate: rate.effectiveFrom
          ? rate.effectiveFrom.split("T")[0]
          : "",
        inlineEndDate: rate.effectiveTo ? rate.effectiveTo.split("T")[0] : "",
      });
    },
    [reset],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    setActiveRow(null);
    setActiveIndex(null);
  }, []);

  const handleInlineSubmit = handleSubmit(
    async (values: IInlineUpdateFormValues) => {
      if (!activeRow || activeIndex === null) return;

      try {
        const hourlyRateNum = parseFloat(String(values.inlineHourlyRate)) || 0;
        const secRateNum =
          hourlyRateNum > 0 ? parseFloat((hourlyRateNum / 3600).toFixed(4)) : 0;

        // Map rates while passing the sub-document _id for the patch system
        const updatedRates: IRateItem[] = activeRow.rates.map(
          (r: any, i: number) => {
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
          },
        );

        const payload: IUpdateBillingRatePayload = {
          id: activeRow._id,
          userType: activeRow.userType,
          rates: updatedRates,
        };

        await updateBillingRate(payload).unwrap();
        toast.success("Billing rate updated successfully!");
        handleCancelEdit();
        onSuccess?.();
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to update billing rate.");
      }
    },
  );

  return {
    register,
    isUpdating,
    editingIndex,
    handleStartEdit,
    handleCancelEdit,
    handleInlineSubmit,
  };
}

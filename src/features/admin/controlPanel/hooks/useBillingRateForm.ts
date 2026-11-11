import { useState, useMemo, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useCreateBillingRateMutation } from "../services/billingRateApi";
import { useGetUsersQuery } from "../../userPanel/services/userApi";
import {
  IBillingRateFormValues,
  ICreateBillingRatePayload,
  IUseBillingRateFormReturn,
  IUser,
} from "../types/BillingRate.types";
import { useDebounce } from "../admission-timeline/hooks/useDebounce";
import { toast } from "sonner";

export function useBillingRateForm(
  onClose?: () => void,
  onSuccess?: () => void,
): IUseBillingRateFormReturn {
  const [search, setSearchQuery] = useState<string>("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("teacher");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number | "all">("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // RTK Query Mutation for Create / Bulk Save
  const [createBillingRate, { isLoading: isCreating }] =
    useCreateBillingRateMutation();

  // User fetch query
  const { data: userData, isFetching: userLoading } = useGetUsersQuery({
    search,
    page,
    limit,
    userType: userTypeFilter,
  });

  const usersList: IUser[] = userData?.data?.users || userData?.data || [];

  // React Hook Form Setup
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<IBillingRateFormValues>({
    mode: "onChange",
    defaultValues: {
      userType: "teacher",
      rates: [
        {
          category: "",
          hourlyRate: "",
          secRate: "",
          startDate: "",
          endDate: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rates",
  });

  // Debounced search handler for phone number or name
  const handleSearchChange = useMemo(
    () =>
      useDebounce((query: string) => {
        setSearchQuery(query);
      }, 400),
    [],
  );

  // UserType filter change handler
  const handleUserTypeChange = (type: string) => {
    setUserTypeFilter(type);
    setValue("userType", type, { shouldValidate: true, shouldDirty: true });
    setSelectedUserIds([]);
  };

  // Single user checkbox toggle handler
  const handleToggleUserSelect = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // Select All users toggle handler
  const handleSelectAllToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = usersList.map((user: IUser) => user._id || user.id || "");
      setSelectedUserIds(allIds.filter(Boolean));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleHourlyRateChange = useCallback(
    (index: number, value: string) => {
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) {
        const sec = (num / 3600).toFixed(4);
        setValue(`rates.${index}.secRate`, sec, { shouldValidate: true });
      } else {
        setValue(`rates.${index}.secRate`, "", { shouldValidate: true });
      }
    },
    [setValue],
  );

  // Submit Handler for Single or Bulk Billing Rate Creation
  const handleCreateSubmit = async (data: IBillingRateFormValues) => {
    if (selectedUserIds.length === 0) {
      toast.error("Select at least one user.");
      return;
    }

    try {
      const payload: ICreateBillingRatePayload = {
        userIds: selectedUserIds,
        userType: data.userType.trim().toLowerCase(),
        rates: data.rates.map((r) => ({
          category: r.category.trim().toLowerCase(),
          hourlyRate: parseFloat(String(r.hourlyRate)) || 0,
          secRate: parseFloat(String(r.secRate)) || 0,
          effectiveFrom: r.startDate
            ? new Date(r.startDate).toISOString()
            : new Date().toISOString(),
          effectiveTo: r.endDate ? new Date(r.endDate).toISOString() : null,
        })),
      };

      await createBillingRate(payload).unwrap();
      toast.success(
        selectedUserIds.length > 1
          ? `Successfully saved billing rate for ${selectedUserIds.length} users!`
          : "Billing rate successfully created!",
      );
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create billing rate.");
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

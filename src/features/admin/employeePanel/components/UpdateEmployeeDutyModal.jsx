import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2 } from 'lucide-react';

const HOURLY_RATE = 53;
const RATE_PER_SECOND = HOURLY_RATE / 3600;

const UpdateEmployeeDutyModal = ({
  isOpen,
  onClose,
  dutyData,
  onUpdate,
  isUpdating,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: {
      employeeName: '',
      workDetails: '',
      status: '',
      paymentStatus: '',
      totalDutyFee: 0,
      dutyStartTime: '',
      dutyEndTime: '',
    },
    mode: 'onChange',
  });

  const startTime = watch('dutyStartTime');
  const endTime = watch('dutyEndTime');

  useEffect(() => {
    if (startTime && endTime) {
      // Convert time strings to total seconds from start of day
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);

      const startInSeconds = startH * 3600 + startM * 60;
      const endInSeconds = endH * 3600 + endM * 60;

      // Calculate difference
      let diffInSeconds = endInSeconds - startInSeconds;

      // Handle overnight shift (if end time is earlier than start time)
      if (diffInSeconds < 0) {
        diffInSeconds += 24 * 3600;
      }

      // Calculate amount and format to 2 decimal places
      const calculatedAmount = (diffInSeconds * RATE_PER_SECOND).toFixed(2);

      // Update the totalAmount field
      setValue('totalDutyFee', calculatedAmount);
    }
  }, [startTime, endTime, setValue]);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen && dutyData) {
      reset({
        employeeName: dutyData?.employeeName || '',
        workDetails: dutyData?.workDetails || '',
        dutyStartTime: dutyData?.dutyStartTime || '',
        dutyEndTime: dutyData?.dutyEndTime || '',
        status: dutyData?.status?.toLowerCase() || 'pending',
        paymentStatus: dutyData?.paymentStatus?.toLowerCase() || 'unpaid',
        totalDutyFee: dutyData?.totalDutyFee || 0,
      });
    }
  }, [isOpen, dutyData, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    // Only send the fields that were changed
    const changedFields = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== dutyData[key]) {
        changedFields[key] = data[key];
      }
    });

    // If no fields changed, close modal
    if (Object.keys(changedFields).length === 0) {
      onClose();
      return;
    }

    await onUpdate(changedFields);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md duration-200 bg-white rounded-lg shadow-xl animate-in fade-in zoom-in">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Update Employee Duty Record
            </h2>
            <p className="text-xs font-semibold text-gray-900 capitalize">
              {dutyData?.employeeName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase">
              Work Details
            </label>
            <input
              {...register('workDetails', {
                required: 'Mess name is required',
              })}
              className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.workDetails && (
              <p className="mt-1 text-xs text-red-500">
                {errors.workDetails.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase">
                Start Time
              </label>
              <input
                type="time"
                {...register('dutyStartTime', {
                  required: 'Start Time is required',
                })}
                className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.dutyStartTime && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.dutyStartTime.message}
                </p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase">
                End Time
              </label>
              <input
                type="time"
                {...register('dutyEndTime', {
                  required: 'End Time is required',
                })}
                className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.dutyEndTime && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.dutyEndTime.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase">
                Status
              </label>
              <select
                {...register('status', {
                  required: 'Status is required',
                })}
                className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="approve">Approved</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.status.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase">
                Payment
              </label>
              <select
                {...register('paymentStatus', {
                  required: 'Payment status is required',
                })}
                className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
              {errors.paymentStatus && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.paymentStatus.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase">
              Total Amount (৳)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('totalDutyFee', {
                required: 'Amount is required',
                min: {
                  value: 0,
                  message: 'Amount must be positive',
                },
              })}
              readOnly
              className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.totalAmount && (
              <p className="mt-1 text-xs text-red-500">
                {errors.totalAmount.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || !isDirty || !isValid}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEmployeeDutyModal;

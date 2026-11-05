import { AnimatePresence, motion } from 'framer-motion';
import { Banknote, Filter, Save, X } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';
import BatchSelector from '../../../../../components/forms/BatchSelector';
import SubjectSelector from '../../../../../components/forms/SubjectSelector';
import DepartmentSelector from '../../../../../components/forms/DepartmentSelector';
import TimeSlotSelector from '../../../../../components/forms/TimeSlotSelector';
import toast from 'react-hot-toast';
import { Controller, useForm } from 'react-hook-form';
import { useUpdateClassMutation } from '../../../../../redux/features/teacher/teacherApi';

const CLASS_FEE = 213.33;

const EditClassModal = ({ isModalOpen, onClose, data }) => {
  const [updateClass] = useUpdateClassMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { dirtyFields, isSubmitting },
  } = useForm({
    defaultValues: data || {},
  });

  // ⭐ Load previous data
  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  // ⭐ Watch classQuantity (🔥 Important)
  const classQuantity = watch('classQuantity');

  // ⭐ Auto Fee Calculation Engine
  useEffect(() => {
    const quantity = Number(classQuantity || 0);

    const total = quantity > 0 ? Number((quantity * CLASS_FEE).toFixed(2)) : 0;

    setValue('totalFee', total, {
      shouldDirty: true,
    });
  }, [classQuantity, setValue]);

  // ⭐ Submit Handler (Partial Update Engine)
  const onSubmit = async (formData) => {
    try {
      const updatedData = {};

      Object.keys(dirtyFields).forEach((key) => {
        updatedData[key] = formData[key];
      });

      if (!Object.keys(updatedData).length) {
        toast.success('Nothing changed');
        return;
      }

      await updateClass({
        id: data?._id,
        data: updatedData,
      }).unwrap();

      toast.success('Class updated successfully');
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Update failed');
    }
  };

  // ⭐ Month List
  const months = useMemo(
    () => [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    [],
  );

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => current - 3 + i);
  }, []);

  if (!data) return null;

  const inputBase =
    'w-full px-3 py-2 text-[14px] bg-[#f7f7f5] border border-transparent rounded-md focus:outline-none focus:bg-white focus:border-[#2383e2] transition-all placeholder:text-gray-400 text-gray-800 shadow-sm';

  const labelBase =
    'text-[12px] font-medium text-gray-500 mb-1 block uppercase';

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 mt-16">
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-2xl overflow-hidden bg-white shadow-2xl rounded-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between px-6 py-3 border-b bg-slate-50">
              <div>
                <h2 className={labelBase}>Edit Class Record</h2>
                <p className="text-xs capitalize text-slate-500">
                  Teacher: {data?.teacher?.userName}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-3 rounded-full hover:bg-red-50 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 overflow-y-auto max-h-[80vh] space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className={labelBase}>Year</label>
                  <select {...register('yearName')} className={inputBase}>
                    {years.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelBase}>Month</label>
                  <select {...register('monthName')} className={inputBase}>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelBase}>Class Fee</label>
                  <input
                    {...register('classFee')}
                    disabled
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className={labelBase}>Class Date</label>
                  <input
                    {...register('classDate')}
                    type="date"
                    className={inputBase}
                  />
                </div>
              </div>

              <hr />

              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <SubjectSelector
                      value={field.value}
                      onChange={field.onChange}
                      labelBase={labelBase}
                      inputBase={inputBase}
                    />
                  )}
                />

                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <DepartmentSelector
                      value={field.value}
                      onSelect={(val) => field.onChange(val)}
                      labelBase={labelBase}
                      inputBase={inputBase}
                    />
                  )}
                />

                <Controller
                  name="batch"
                  control={control}
                  render={({ field }) => (
                    <BatchSelector
                      value={field.value}
                      onSelect={(val) => field.onChange(val)}
                      labelBase={labelBase}
                      inputBase={inputBase}
                    />
                  )}
                />

                <Controller
                  name="classTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSlotSelector
                      value={field.value}
                      onSelect={field.onChange}
                      labelBase={labelBase}
                      inputBase={inputBase}
                    />
                  )}
                />
              </div>

              <hr />

              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className={labelBase}>Batch Count</label>
                  <input
                    {...register('batchCount')}
                    type="number"
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className={labelBase}>Duration</label>
                  <input
                    {...register('classQuantity')}
                    type="number"
                    step={0.5}
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className={labelBase}>Period</label>
                  <input
                    {...register('period')}
                    type="number"
                    className={inputBase}
                    step={0.5}
                  />
                </div>

                <div>
                  <label className={labelBase}>Status</label>
                  <select {...register('status')} className={inputBase}>
                    <option value="approve">Approve</option>
                    <option value="pending">Pending</option>
                    <option value="cancel">Cancel</option>
                  </select>
                </div>
              </div>

              {/* Total Fee */}
              <div className="p-4 border rounded-xl bg-gray-50">
                <label className={`${labelBase} flex items-center gap-1`}>
                  <Banknote size={14} /> Total Fee
                </label>

                <input
                  {...register('totalFee', { valueAsNumber: true })}
                  type="number"
                  disabled
                  className={inputBase}
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-6 border-t ">
                <button
                  type="button"
                  className="hover:text-red-500"
                  onClick={onClose}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-2.5 text-white bg-blue-600 rounded-lg"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditClassModal;

import { useMemo, useState, useEffect } from 'react';
import {
  Calendar,
  BookOpen,
  Timer,
  Wallet,
  Loader2,
  CheckCircle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePostTeacherAttendanceMutation } from '../../../../../redux/features/teacher/teacherApi';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import TimeSlotSelector from '../../../../../components/forms/TimeSlotSelector';
import BatchSelector from '../../../../../components/forms/BatchSelector';
import DepartmentSelector from '../../../../../components/forms/DepartmentSelector';
import SubjectSelector from '../../../../../components/forms/SubjectSelector';
import TeacherSelector from '../../../../../components/forms/TeacherSelector';
import { useGetBillingRatesQuery } from '../../controlPanel/services/billingRateApi';

const AdminAddTeacherClass = () => {
  const [resetKey, setResetKey] = useState(0);
  const [postAttendance, { isLoading }] = usePostTeacherAttendanceMutation();

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      classDate: '',
      teacherId: '',
      teacherName: '',
      phone: '',
      department: '',
      subject: '',
      batch: '',
      classTime: '',
      classQuantity: 1,
      classFee: 0,
      secRate: 0,
      userType: 'teacher',
      selectedRateCategory: '',
    },
  });

  // Watch fields
  const teacherId = watch('teacherId');
  const classQuantity = watch('classQuantity');
  const classFee = watch('classFee');
  const selectedRateCategory = watch('selectedRateCategory');

  // Sob billing rates fetch korci (jodi backend e query parameter support na kore)
  const { data: billingResponse, isLoading: isBilling } =
    useGetBillingRatesQuery({ teacherId }, { skip: !teacherId });

  // Selected teacher-er specific billing rates ber korar logic
  const ratesList = useMemo(() => {
    if (!billingResponse?.data || !teacherId) return [];

    const allBillingRecords = Array.isArray(billingResponse.data)
      ? billingResponse.data
      : billingResponse.data.rates || [];

    // Jekhane billing record-er `user` ba `user._id` amader selected `teacherId` er sathe match korbe
    const teacherBillingRecord = allBillingRecords.find((item) => {
      const recordUserId =
        typeof item.user === 'object' ? item.user?._id : item.user;

      return recordUserId === teacherId;
    });

    return teacherBillingRecord?.rates || [];
  }, [billingResponse, teacherId]);

  // Total Fee Calculation
  const totalFee = useMemo(() => {
    return Number(classQuantity || 0) * Number(classFee || 0);
  }, [classQuantity, classFee]);

  // Teacher-er billing data ashar por default rate select kora
  useEffect(() => {
    if (ratesList.length > 0) {
      const regularRate =
        ratesList.find((r) => r.category === 'regular') || ratesList[0];
      if (regularRate) {
        setValue('classFee', regularRate.hourlyRate || 0);
        setValue('secRate', regularRate.secRate || 0);
        setValue('selectedRateCategory', regularRate.category || '');
      }
    } else {
      setValue('classFee', 0);
      setValue('secRate', 0);
      setValue('selectedRateCategory', '');
    }
  }, [ratesList, setValue]);

  // Rate select korle form-e value set kora
  const handleRateSelect = (rateObj) => {
    setValue('classFee', rateObj.hourlyRate || 0);
    setValue('secRate', rateObj.secRate || 0);
    setValue('selectedRateCategory', rateObj.category || '');
  };

  // Form Reset
  const handleReset = () => {
    reset();
    setResetKey((p) => p + 1);
    setValue('classFee', 0);
    setValue('secRate', 0);
    setValue('selectedRateCategory', '');
    toast.success('Form cleared');
  };

  const onSubmit = async (data) => {
    if (!data.teacherId) {
      return toast.error('Please select a teacher first!');
    }
    if (!data.classFee || data.classFee <= 0) {
      return toast.error('Please select a valid billing rate!');
    }

    try {
      const payload = {
        ...data,
        classQuantity: Number(data.classQuantity),
        classFee: Number(data.classFee),
        secRate: Number(data.secRate),
        totalFee: totalFee,
      };

      await postAttendance(payload).unwrap();
      toast.success('Class recorded successfully!');
      // handleReset();
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  const inputBase =
    'w-full px-3 py-2 text-[14px] bg-[#f7f7f5] border border-transparent rounded-md focus:outline-none focus:bg-white focus:border-[#2383e2] transition-all placeholder:text-gray-400 text-gray-800 shadow-sm';
  const labelBase = 'text-[12px] font-medium text-gray-500 mb-1 block';

  const categoryColors = {
    regular: 'bg-blue-100 text-blue-700',
    private: 'bg-purple-100 text-purple-700',
    examDuty: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-2 max-w-screen-2xl">
          <div className="flex items-center gap-2 overflow-hidden">
            <BreadCrumbMenu />
          </div>
        </div>
      </header>

      <main className="px-4 py-10 lg:py-16">
        <div className="mb-12">
          <h1 className="flex items-center gap-4 text-base font-bold tracking-tighter text-gray-900 md:text-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-2xl">
              <Zap className="text-blue-600 w-7 h-7" />
            </div>
            Class Registry
          </h1>
          <p className="max-w-2xl mt-4 text-xs text-gray-500">
            Select a teacher to automatically load their specific billing rates
            and submit class details.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* LEFT COLUMN: Teacher & Billing Summary */}
            <div className="space-y-8 lg:col-span-3">
              <TeacherSelector
                key={resetKey}
                onSelect={(teacher) => {
                  setValue('teacherId', teacher?._id || '');
                  setValue('teacherName', teacher?.userName || '');
                  setValue('phone', teacher?.phone || '');
                  setValue('classFee', 0);
                  setValue('secRate', 0);
                  setValue('selectedRateCategory', '');
                }}
                labelBase={labelBase}
                inputBase={inputBase}
              />

              {/* BILLING SUMMARY CARD */}
              <section className="w-full p-6 text-white border shadow-xl bg-slate-900 rounded-xl border-slate-800">
                <div className="flex justify-between mb-4">
                  <span className="text-xs font-bold tracking-widest uppercase opacity-60">
                    Billing Summary
                  </span>
                  <Wallet size={20} className="text-blue-400" />
                </div>

                <div className="flex justify-between mb-3 text-xs">
                  <span className="opacity-80">Rate / Hour</span>
                  <span className="font-sans font-bold">
                    {Number(classFee || 0).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'BDT',
                    })}
                  </span>
                </div>

                <div className="flex justify-between pt-3 text-lg font-bold text-green-400 border-t border-slate-800">
                  <span>Total Fee</span>
                  <span className="font-sans">
                    {totalFee.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'BDT',
                    })}
                  </span>
                </div>
              </section>
            </div>

            {/* MIDDLE COLUMN: RATES TABLE FOR SELECTED TEACHER */}
            <div className="p-5 rounded-2xl lg:col-span-3">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-[#37352F] flex items-center gap-2">
                  <span className="p-1 bg-white rounded shadow-sm">🎓</span>
                  Teacher Billing Rates
                </h3>
              </div>

              {!teacherId ? (
                <div className="p-6 text-center bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500">
                    Please select a teacher first to view rates.
                  </p>
                </div>
              ) : isBilling ? (
                <div className="flex items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
                  <Loader2 className="text-blue-600 animate-spin" size={24} />
                </div>
              ) : (
                <div className="overflow-auto bg-white border border-gray-200 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-wider text-[#787774] font-bold">
                        <th className="px-3 py-2 w-10"></th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ratesList.length > 0 ? (
                        ratesList.map((rate, index) => (
                          <tr
                            key={index}
                            onClick={() => handleRateSelect(rate)}
                            className={`group cursor-pointer transition-colors ${
                              selectedRateCategory === rate?.category
                                ? 'bg-blue-50/50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="px-3 py-3">
                              <input
                                type="radio"
                                name="rateSelect"
                                checked={
                                  selectedRateCategory === rate?.category
                                }
                                onChange={() => handleRateSelect(rate)}
                                className="w-4 h-4 text-blue-600 border-gray-300 cursor-pointer focus:ring-0"
                              />
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold capitalize ${categoryColors[rate?.category] || 'bg-gray-100 text-gray-600'}`}
                              >
                                {rate?.category}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right font-sans text-xs font-bold text-[#37352F]">
                              {rate?.hourlyRate?.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'BDT',
                              })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-3 py-6 text-center text-xs text-gray-500"
                          >
                            No billing rates found for this teacher.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* LIVE PREVIEW BLOCK */}
                  <div className="px-4 pb-4 mt-4">
                    <div className="p-3 border rounded-lg bg-emerald-50 border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase">
                        Calculation Preview
                      </p>
                      <p className="mt-1 text-xs text-emerald-600">
                        {classQuantity || 0} Hour(s) ×{' '}
                        {Number(classFee || 0).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'BDT',
                        })}
                        {'/hr'} ={' '}
                        <span className="font-bold">
                          {totalFee.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'BDT',
                          })}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: CLASS DETAILS FORM FIELDS */}
            <div className="bg-white border border-gray-100 shadow-sm lg:col-span-6 rounded-xl">
              <div className="flex items-center justify-between gap-2 p-6 border-b border-gray-50">
                <div className="flex items-center gap-2 text-[#37352F]">
                  <BookOpen size={20} />
                  <h2 className="text-sm font-bold tracking-tight uppercase">
                    Class Details
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 text-xs font-bold text-blue-600 transition-colors hover:text-blue-700"
                >
                  <RotateCcw size={14} />
                  Reset Form
                </button>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-2">
                {/* DATE */}
                <Controller
                  control={control}
                  name="classDate"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div>
                      <label className={labelBase}>CLASS DATE</label>
                      <div className="relative mt-1">
                        <Calendar
                          size={16}
                          className="absolute text-gray-400 left-3 top-2.5 z-10"
                        />
                        <input
                          type="date"
                          required
                          {...field}
                          className={`${inputBase} pl-10`}
                        />
                      </div>
                    </div>
                  )}
                />

                {/* TIME SLOT */}
                <TimeSlotSelector
                  resetKey={resetKey}
                  onSelect={(val) => setValue('classTime', val)}
                  labelBase={labelBase}
                  inputBase={inputBase}
                />

                {/* BATCH */}
                <Controller
                  control={control}
                  name="batch"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <BatchSelector
                      key={resetKey}
                      value={field.value}
                      multiple={false}
                      onSelect={(val) => field.onChange(val)}
                      labelBase={labelBase}
                      inputBase={inputBase}
                    />
                  )}
                />

                {/* DURATION */}
                <Controller
                  control={control}
                  name="classQuantity"
                  render={({ field }) => (
                    <div>
                      <label className={labelBase}>DURATION (HOURS)</label>
                      <div className="relative mt-1">
                        <Timer
                          size={16}
                          className="absolute text-gray-400 left-3 top-2.5 z-10"
                        />
                        <input
                          type="number"
                          required
                          step="0.5"
                          min="0.5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className={`${inputBase} pl-10`}
                        />
                      </div>
                    </div>
                  )}
                />

                {/* DEPARTMENT */}
                <DepartmentSelector
                  resetKey={resetKey}
                  onSelect={(val) => setValue('department', val)}
                  labelBase={labelBase}
                  inputBase={inputBase}
                />

                {/* SUBJECT */}
                <SubjectSelector
                  resetKey={resetKey}
                  onChange={(val) => setValue('subject', val)}
                  labelBase={labelBase}
                  inputBase={inputBase}
                />

                {/* SUBMIT BUTTON */}
                <div className="pt-4 md:col-span-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto group flex items-center justify-center gap-3 rounded-lg
                    bg-[#0075DE] px-10 py-3 text-sm font-bold text-white
                    transition-all hover:bg-[#005BAB] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    Confirm & Save Class
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminAddTeacherClass;

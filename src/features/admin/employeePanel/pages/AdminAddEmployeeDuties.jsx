import { useMemo, useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  Calendar,
  Loader2,
  Zap,
  UserCircle,
  CheckCircle,
  Workflow,
  Wallet,
} from 'lucide-react';

import {
  useFetchAllEmployeesQuery,
  usePostEmployeeAttendanceMutation,
} from '../../../../../redux/features/staff/employeeApi';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import { useGetBillingRatesQuery } from '../../controlPanel/services/billingRateApi';

const AdminAddEmployeeDuties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const containerRef = useRef(null);

  const { register, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      workDetails: '',
      dutyStartTime: '',
      dutyEndTime: '',
      hourlyRate: 0,
      selectedRateCategory: '',
    },
  });

  // Watch fields for calculations
  const startTime = watch('dutyStartTime');
  const endTime = watch('dutyEndTime');
  const currentHourlyRate = watch('hourlyRate');
  const selectedRateCategory = watch('selectedRateCategory');

  const teacherId = selectedEmployee?._id;

  const { data: billingResponse, isLoading: isBilling } =
    useGetBillingRatesQuery({ teacherId }, { skip: !teacherId });

  const [postEmployeeAttendance, { isLoading: isSubmitting }] =
    usePostEmployeeAttendanceMutation();

  const { data: employeesData } = useFetchAllEmployeesQuery({
    searchQuery,
    page: 1,
    limit: 10,
  });

  const employees = useMemo(() => employeesData?.data || [], [employeesData]);

  const ratesList = useMemo(() => {
    if (!billingResponse?.data || !teacherId) return [];

    const allBillingRecords = Array.isArray(billingResponse.data)
      ? billingResponse.data
      : billingResponse.data.rates || [];

    const employeeBillingRecord = allBillingRecords.find((item) => {
      const recordUserId =
        typeof item.user === 'object' ? item.user?._id : item.user;
      return recordUserId === teacherId;
    });

    return employeeBillingRecord?.rates || [];
  }, [billingResponse, teacherId]);

  useEffect(() => {
    if (ratesList.length > 0) {
      const regularRate =
        ratesList.find((r) => r.category === 'regular') || ratesList[0];
      if (regularRate) {
        setValue('hourlyRate', Number(regularRate.hourlyRate || 0));
        setValue('selectedRateCategory', regularRate.category || '');
      }
    } else {
      setValue('hourlyRate', 0);
      setValue('selectedRateCategory', '');
    }
  }, [ratesList, setValue]);

  const calculated = useMemo(() => {
    if (!startTime || !endTime || !currentHourlyRate) {
      return { duration: '00:00:00', fee: 0, diffSec: 0 };
    }

    const start = new Date(`1970-01-01T${startTime}`);
    let end = new Date(`1970-01-01T${endTime}`);

    // যদি নাইট শিফট হয় (রাত ১২টার পর শেষ হয়)
    if (end < start) end.setDate(end.getDate() + 1);

    const diffSec = Math.floor((end - start) / 1000);
    const h = Math.floor(diffSec / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((diffSec % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (diffSec % 60).toString().padStart(2, '0');

    // ফি ক্যালকুলেশন
    const totalFee = (diffSec / 3600) * Number(currentHourlyRate);

    return {
      duration: `${h}:${m}:${s}`,
      fee: parseFloat(totalFee.toFixed(2)),
      diffSec: diffSec,
    };
  }, [startTime, endTime, currentHourlyRate]);

  const handleRateSelect = (rateObj) => {
    setValue('hourlyRate', Number(rateObj.hourlyRate || 0));
    setValue('selectedRateCategory', rateObj.category || '');
  };

  const onFormSubmit = async (data) => {
    if (!selectedEmployee) return toast.error('Please select an employee');
    if (!data.hourlyRate || data.hourlyRate <= 0)
      return toast.error('Please select a valid billing rate!');
    if (calculated.fee <= 0)
      return toast.error('Invalid duty duration or rate');

    try {
      const response = await postEmployeeAttendance({
        ...data,
        hourlyRate: Number(data.hourlyRate),
        totalDutyTime: calculated.duration,
        totalDutyFee: calculated.fee,
        everyHourFee: Number(data.hourlyRate),
        employeeId: selectedEmployee._id,
        employeeName: selectedEmployee.userName,
        phone: selectedEmployee.phone,
        userType: 'employee',
      });

      if (response?.data) {
        toast.success('Duty added successfully');
        reset({
          date: new Date().toISOString().split('T')[0],
          workDetails: '',
          dutyStartTime: '',
          dutyEndTime: '',
          hourlyRate: 0,
          selectedRateCategory: '',
        });
        setSelectedEmployee(null);
        setSearchQuery('');
      } else if (response?.error) {
        toast.error(
          response.error?.data?.message || 'Server rejected the request',
        );
      }
    } catch (err) {
      toast.error(err);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const inputStyle =
    'w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white border border-transparent focus:border-blue-500 outline-none transition-all text-sm';
  const labelStyle =
    'text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block';

  const categoryColors = {
    regular: 'bg-blue-100 text-blue-700',
    private: 'bg-purple-100 text-purple-700',
    examDuty: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl">
          <BreadCrumbMenu />
        </div>
      </header>

      <main className="max-w-6xl px-4 py-10 lg:py-16">
        <div className="mb-12">
          <h1 className="flex items-center gap-4 text-xl font-bold tracking-tighter text-gray-900 md:text-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-2xl">
              <Zap className="text-blue-600 w-7 h-7" />
            </div>
            Employee Duty Registry
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="grid grid-cols-1 gap-12 lg:grid-cols-12"
        >
          {/* LEFT COLUMN: Employee Selection & Billing Table */}
          <div className="space-y-8 lg:col-span-5">
            <div>
              <label className={labelStyle}>Select Nursing Member</label>
              <div className="relative" ref={containerRef}>
                <Search
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  className={inputStyle}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                />
                {isDropdownOpen && (
                  <div className="absolute z-30 w-full mt-2 overflow-auto bg-white border border-gray-100 shadow-2xl h-80 rounded-xl">
                    {employees?.map((emp) => (
                      <div
                        key={emp?._id}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setIsDropdownOpen(false);
                          setSearchQuery(emp?.userName);
                          setValue('hourlyRate', 0);
                          setValue('selectedRateCategory', '');
                        }}
                        className="flex items-center w-full gap-3 px-4 py-3 border-b cursor-pointer hover:bg-blue-50 border-gray-50 last:border-0"
                      >
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-blue-700 bg-blue-100 rounded-full">
                          {emp.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 capitalize">
                            {emp.userName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {emp.phone}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selection Preview */}
            <AnimatePresence mode="wait">
              {selectedEmployee && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-4 border border-blue-100 bg-blue-50/30 rounded-xl"
                >
                  <UserCircle className="w-10 h-10 text-blue-600" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 capitalize">
                      {selectedEmployee.userName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {selectedEmployee.phone}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* BILLING RATES TABLE */}
            <div className="p-5 border border-gray-100 bg-gray-50 rounded-2xl">
              <h3 className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-400 uppercase">
                <Wallet size={14} /> Select Billing Rate
              </h3>

              {!teacherId ? (
                <div className="p-6 text-center bg-white border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500">
                    Please select an employee first to view rates.
                  </p>
                </div>
              ) : isBilling ? (
                <div className="flex items-center justify-center p-8 bg-white border border-gray-200 rounded-xl">
                  <Loader2 className="text-blue-600 animate-spin" size={24} />
                </div>
              ) : (
                <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="w-10 px-4 py-2"></th>
                        <th className="px-4 py-2 font-bold text-gray-500">
                          Category
                        </th>
                        <th className="px-4 py-2 font-bold text-right text-gray-500">
                          Rate/Hr
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ratesList.length > 0 ? (
                        ratesList.map((rate, idx) => (
                          <tr
                            key={idx}
                            onClick={() => handleRateSelect(rate)}
                            className={`cursor-pointer transition-colors ${selectedRateCategory === rate.category ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="radio"
                                name="employeeRateSelect"
                                checked={selectedRateCategory === rate.category}
                                onChange={() => handleRateSelect(rate)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${categoryColors[rate.category] || 'bg-gray-100 text-gray-700'}`}
                              >
                                {rate.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-right text-gray-700">
                              {rate.hourlyRate?.toLocaleString('en-US', {
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
                            className="px-4 py-6 text-center text-xs text-gray-500"
                          >
                            No billing rates found for this employee.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Work Details & Live Billing */}
          <div className="space-y-6 lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelStyle}>Duty Date</label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    {...register('date')}
                    className={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className={labelStyle}>Work Details</label>
                <div className="relative">
                  <Workflow
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="e.g. Ward Duty"
                    {...register('workDetails')}
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelStyle}>Start Time</label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="time"
                    {...register('dutyStartTime')}
                    className={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className={labelStyle}>End Time</label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="time"
                    {...register('dutyEndTime')}
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* LIVE BILLING CARD */}
            <div className="relative p-8 overflow-hidden text-white shadow-xl bg-slate-900 rounded-3xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet size={120} />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mb-1">
                      Billing Analytics
                    </p>
                    <p className="text-sm font-medium text-blue-400">
                      Rate Applied:{' '}
                      {Number(currentHourlyRate)?.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'BDT',
                      })}
                      /hr
                    </p>
                  </div>
                  <div className="bg-slate-800 px-3 py-1 rounded-full text-[10px] font-bold text-slate-300 border border-slate-700">
                    LIVE TRACKING
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase text-slate-500">
                      Duration
                    </p>
                    <p className="font-mono text-3xl font-black tracking-tighter text-slate-100">
                      {calculated?.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mb-2 text-xs font-bold uppercase text-slate-500">
                      Net Payable
                    </p>
                    <p className="text-4xl font-black tracking-tight text-emerald-400">
                      {calculated?.fee?.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'BDT',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting || !selectedEmployee || calculated.fee <= 0
              }
              className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                !selectedEmployee || calculated.fee <= 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <CheckCircle size={20} />
                  Confirm & Submit Duty
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminAddEmployeeDuties;

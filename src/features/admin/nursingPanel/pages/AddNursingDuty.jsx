// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import toast from 'react-hot-toast';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   UserCircle,
//   Search,
//   LoaderCircle,
//   Calendar,
//   Phone,
//   Zap,
//   Clock,
//   Plus,
//   X,
//   Wallet,
// } from 'lucide-react';

// // API Hooks
// import {
//   useGetallNursingUserQuery,
//   usePostNursingAttendanceMutation,
// } from '../../../../../redux/features/Nursing/NursingApi';
// import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
// import MessSelector from '../../../../../components/forms/MessSelector';
// import { useGetBillingRatesQuery } from '../../controlPanel/services/billingRateApi';

// const getBangladeshDateString = () => {
//   const options = { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' };
//   const formatter = new Intl.DateTimeFormat('en-CA', options);
//   return formatter.format(new Date());
// };

// export default function AddNursingDuty() {
//   const [search, setSearch] = useState('');
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [selectedStaff, setSelectedStaff] = useState(null);

//   const containerRef = useRef(null);

//   // 1. Fetch Billing Rates & Data
//   const { data: billingData } = useGetBillingRatesQuery('nursing');
//   const { data: nursingData } = useGetallNursingUserQuery({ search });
//   const [postNursingData, { isLoading: isSubmitting }] = usePostNursingAttendanceMutation();

//   // 2. React Hook Form Setup
//   const { register, handleSubmit, setValue, reset, watch } = useForm({
//     defaultValues: {
//       date: getBangladeshDateString(),
//       employeeName: '',
//       phone: '',
//       nursingId: '',
//       userType: 'nursing',
//       messName: '',
//       dutyStartTime: '',
//       dutyEndTime: '',
//       hourlyRate: 0,
//       selectedRateCategory: 'regular',
//     },
//   });

//   // 3. Watch Fields
//   const startTime = watch('dutyStartTime');
//   const endTime = watch('dutyEndTime');
//   const currentHourlyRate = watch('hourlyRate');
//   const selectedRateCategory = watch('selectedRateCategory');

//   // 4. Set Default Billing Rate (Regular)
//   useEffect(() => {
//     if (billingData?.data?.rates) {
//       const regularRate = billingData.data.rates.find((r) => r.category === 'regular');
//       if (regularRate) {
//         setValue('hourlyRate', regularRate.hourlyRate);
//         setValue('selectedRateCategory', 'regular');
//       }
//     }
//   }, [billingData, setValue]);

//   const calculated = useMemo(() => {
//     if (!startTime || !endTime || !currentHourlyRate) {
//       return { duration: '00:00:00', fee: 0, seconds: 0 };
//     }

//     const start = new Date(`1970-01-01T${startTime}:00+06:00`);
//     let end = new Date(`1970-01-01T${endTime}:00+06:00`);

//     if (end < start) end.setDate(end.getDate() + 1); // ওভারনাইট/নাইট ডিউটি হ্যান্ডলিং

//     const seconds = Math.floor((end - start) / 1000);
//     const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
//     const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
//     const s = String(seconds % 60).padStart(2, '0');

//     const totalFee = (seconds / 3600) * currentHourlyRate;

//     return {
//       duration: `${h}:${m}:${s}`,
//       fee: Math.round(totalFee),
//       seconds: seconds,
//     };
//   }, [startTime, endTime, currentHourlyRate]);

//   // 6. Handlers
//   const handleRateSelect = (rateObj) => {
//     setValue('hourlyRate', rateObj.hourlyRate);
//     setValue('selectedRateCategory', rateObj.category);
//   };

//   const handleStaffSelect = (staff) => {
//     setSelectedStaff(staff);
//     setValue('nursingId', staff._id);
//     setValue('employeeName', staff.userName);
//     setValue('phone', staff.phone);
//     setSearch(staff.userName);
//     setIsDropdownOpen(false);
//   };

//   const onFormSubmit = async (data) => {
//     if (!selectedStaff) return toast.error('Please select a nursing member');
//     if (calculated.fee <= 0) return toast.error('Invalid duty duration');

//     try {
//       const payload = {
//         date: new Date(data.date).toISOString(), // "2025-02-01T00:00:00.000Z" ISO format
//         nursingId: data.nursingId,
//         employeeName: data.employeeName,
//         phone: data.phone,
//         messName: data.messName,
//         dutyStartTime: data.dutyStartTime,
//         dutyEndTime: data.dutyEndTime,
//         totalDutyTime: String(calculated.seconds),
//         totalAmount: calculated.fee,
//       };

//       await postNursingData(payload).unwrap();
//       toast.success('Duty recorded successfully');

//       reset({
//         date: getBangladeshDateString(),
//         dutyStartTime: '',
//         dutyEndTime: '',
//         employeeName: '',
//         phone: '',
//         nursingId: '',
//         messName: '',
//       });
//       setSelectedStaff(null);
//       setSearch('');
//     } catch (err) {
//       toast.error(err?.data?.message || 'Submission failed');
//     }
//   };

//   useEffect(() => {
//     const handler = (e) => {
//       if (containerRef.current && !containerRef.current.contains(e.target))
//         setIsDropdownOpen(false);
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   // UI Styles
//   const inputStyle =
//     'w-full pl-10 pr-4 py-2.5 bg-[#f7f7f5] border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 transition-all text-sm shadow-sm';
//   const labelStyle = 'text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block';

//   const categoryColors = {
//     regular: 'bg-blue-100 text-blue-700',
//     private: 'bg-purple-100 text-purple-700',
//     examDuty: 'bg-orange-100 text-orange-700',
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans">
//       <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 backdrop-blur-md">
//         <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl">
//           <BreadCrumbMenu />
//         </div>
//       </header>

//       <main className="max-w-6xl px-4 py-10 lg:py-16">
//         <div className="mb-10">
//           <h1 className="flex items-center gap-4 text-xl font-bold tracking-tighter text-gray-900 md:text-2xl">
//             <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-2xl">
//               <Zap className="text-blue-600 w-7 h-7" />
//             </div>
//             Nursing Duty Registry
//           </h1>
//         </div>

//         <form
//           onSubmit={handleSubmit(onFormSubmit)}
//           className="grid grid-cols-1 gap-12 lg:grid-cols-12"
//         >
//           {/* LEFT: STAFF & RATES */}
//           <div className="space-y-8 lg:col-span-5">
//             <div>
//               <label className={labelStyle}>SELECT NURSING MEMBER</label>
//               <div ref={containerRef} className="relative">
//                 <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
//                 <input
//                   type="text"
//                   value={search}
//                   onChange={(e) => {
//                     setSearch(e.target.value);
//                     setIsDropdownOpen(true);
//                   }}
//                   onFocus={() => setIsDropdownOpen(true)}
//                   placeholder="Search by name or phone..."
//                   className={inputStyle}
//                 />
//                 <AnimatePresence>
//                   {isDropdownOpen && nursingData?.data?.length > 0 && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 5 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: 5 }}
//                       className="absolute z-30 w-full mt-2 overflow-auto bg-white border border-gray-200 shadow-2xl rounded-xl h-60"
//                     >
//                       {nursingData?.data?.map((staff) => (
//                         <div
//                           key={staff._id}
//                           onClick={() => handleStaffSelect(staff)}
//                           className="flex items-center gap-3 px-4 py-3 transition-colors border-b cursor-pointer hover:bg-blue-50 border-gray-50 last:border-0"
//                         >
//                           <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-blue-700 bg-blue-100 rounded-full">
//                             {staff.userName?.charAt(0).toUpperCase()}
//                           </div>
//                           <div>
//                             <p className="text-sm font-semibold text-gray-800 capitalize">
//                               {staff.userName}
//                             </p>
//                             <p className="text-[11px] text-gray-500">{staff.phone}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>

//             {selectedStaff && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="flex items-center gap-4 p-4 border border-blue-100 bg-blue-50/30 rounded-xl"
//               >
//                 <UserCircle className="w-10 h-10 text-blue-600" />
//                 <div className="flex-1">
//                   <h4 className="font-bold text-gray-900 capitalize">{selectedStaff.userName}</h4>
//                   <p className="flex items-center gap-1 text-xs text-gray-500">
//                     <Phone size={12} /> {selectedStaff.phone}
//                   </p>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSelectedStaff(null);
//                     setSearch('');
//                   }}
//                   className="text-gray-400 hover:text-red-500"
//                 >
//                   <X size={18} />
//                 </button>
//               </motion.div>
//             )}

//             {/* BILLING RATES TABLE */}
//             <div className="p-5 border border-gray-100 bg-gray-50 rounded-2xl">
//               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
//                 <Wallet size={14} /> SELECT BILLING RATE
//               </h3>
//               <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
//                 <table className="w-full text-xs text-left">
//                   <thead className="text-gray-500 border-b border-gray-200 bg-gray-50">
//                     <tr>
//                       <th className="w-10 px-4 py-2"></th>
//                       <th className="px-4 py-2">Category</th>
//                       <th className="px-4 py-2 text-right">Rate/Hr</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {billingData?.data?.rates?.map((rate, idx) => (
//                       <tr
//                         key={idx}
//                         onClick={() => handleRateSelect(rate)}
//                         className={`cursor-pointer transition-colors ${selectedRateCategory === rate.category ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
//                       >
//                         <td className="px-4 py-3">
//                           <input
//                             type="radio"
//                             checked={selectedRateCategory === rate.category}
//                             readOnly
//                             className="w-4 h-4 text-blue-600 focus:ring-0"
//                           />
//                         </td>
//                         <td className="px-4 py-3">
//                           <span
//                             className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${categoryColors[rate.category] || 'bg-gray-100 text-gray-600'}`}
//                           >
//                             {rate?.category}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 font-mono font-bold text-right text-gray-700">
//                           {rate.hourlyRate?.toLocaleString('en-US', {
//                             style: 'currency',
//                             currency: 'BDT',
//                           })}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT: DETAILS & LIVE BILLING */}
//           <div className="space-y-6 lg:col-span-7">
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               <div>
//                 <label className={labelStyle}>DUTY DATE</label>
//                 <div className="relative">
//                   <Calendar
//                     className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
//                     size={16}
//                   />
//                   <input type="date" {...register('date')} className={inputStyle} />
//                 </div>
//               </div>
//               <MessSelector
//                 labelBase={labelStyle}
//                 inputBase={inputStyle}
//                 value={watch('messName')}
//                 onSelect={(mess) => setValue('messName', mess?.name)}
//               />
//             </div>

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               <div>
//                 <label className={labelStyle}>START TIME</label>
//                 <div className="relative">
//                   <Clock
//                     className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
//                     size={16}
//                   />
//                   <input type="time" {...register('dutyStartTime')} className={inputStyle} />
//                 </div>
//               </div>
//               <div>
//                 <label className={labelStyle}>END TIME</label>
//                 <div className="relative">
//                   <Clock
//                     className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
//                     size={16}
//                   />
//                   <input type="time" {...register('dutyEndTime')} className={inputStyle} />
//                 </div>
//               </div>
//             </div>

//             {/* LIVE BILLING SUMMARY (Dark Mode Style) */}
//             <div className="relative p-8 overflow-hidden text-white shadow-2xl bg-slate-900 rounded-3xl group">
//               <div className="absolute top-0 right-0 p-4 transition-opacity opacity-5 group-hover:opacity-10">
//                 <Wallet size={140} />
//               </div>
//               <div className="relative z-10">
//                 <div className="flex items-center justify-between mb-10">
//                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[3px]">
//                     Financial Summary
//                   </span>
//                   <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400">
//                     LIVE CALCULATION (BD TIME)
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-8">
//                   <div>
//                     <p className="mb-2 text-xs font-bold uppercase text-slate-500">Duration</p>
//                     <p className="font-mono text-3xl font-black tracking-tighter text-slate-100">
//                       {calculated.duration}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="mb-2 text-xs font-bold uppercase text-slate-500">Net Fee</p>
//                     <p className="text-4xl font-black tracking-tight text-emerald-400">
//                       {calculated.fee.toLocaleString('en-US', {
//                         style: 'currency',
//                         currency: 'BDT',
//                       })}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-800">
//                   <span className="text-[11px] text-slate-400 font-medium italic">
//                     Applied Rate: ৳{currentHourlyRate}/hr
//                   </span>
//                   <span className="text-[11px] text-slate-500">
//                     Auto-calculated based on BD Time
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={isSubmitting || !selectedStaff || calculated.fee <= 0}
//               className={`w-full h-14 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 ${
//                 !selectedStaff || calculated.fee <= 0
//                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                   : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 active:scale-[0.98]'
//               }`}
//             >
//               {isSubmitting ? (
//                 <LoaderCircle className="animate-spin" size={24} />
//               ) : (
//                 <>
//                   <Plus size={20} />
//                   Confirm & Submit Duty
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </main>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircle,
  Search,
  LoaderCircle,
  Calendar,
  Phone,
  Zap,
  Clock,
  Plus,
  X,
  Wallet,
  Loader2,
} from 'lucide-react';

// API Hooks
import {
  useGetallNursingUserQuery,
  usePostNursingAttendanceMutation,
} from '../../../../../redux/features/Nursing/NursingApi';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import MessSelector from '../../../../../components/forms/MessSelector';
import { useGetBillingRatesQuery } from '../../controlPanel/services/billingRateApi';

const getBangladeshDateString = () => {
  const options = {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  return formatter.format(new Date());
};

export default function AddNursingDuty() {
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const containerRef = useRef(null);

  // 1. React Hook Form Setup
  const { register, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: {
      date: getBangladeshDateString(),
      employeeName: '',
      phone: '',
      nursingId: '',
      userType: 'nursing',
      messName: '',
      dutyStartTime: '',
      dutyEndTime: '',
      hourlyRate: 0,
      selectedRateCategory: '',
    },
  });

  // 3. Watch Fields
  const startTime = watch('dutyStartTime');
  const endTime = watch('dutyEndTime');
  const currentHourlyRate = watch('hourlyRate');
  const selectedRateCategory = watch('selectedRateCategory');
  const nursingId = watch('nursingId');

  // 2. Fetch Nursing Users & Billing Rates for Specific Nursing User
  const { data: nursingData } = useGetallNursingUserQuery({ search });

  const teacherId = nursingId;

  const { data: billingResponse, isLoading: isBilling } =
    useGetBillingRatesQuery({ teacherId }, { skip: !nursingId });

  const [postNursingData, { isLoading: isSubmitting }] =
    usePostNursingAttendanceMutation();

  const ratesList = useMemo(() => {
    if (!billingResponse?.data || !nursingId) return [];

    const allBillingRecords = Array.isArray(billingResponse?.data)
      ? billingResponse?.data
      : billingResponse?.data.rates || [];

    const nursingBillingRecord = allBillingRecords?.find((item) => {
      const recordUserId =
        typeof item.user === 'object' ? item.user?._id : item.user;

      return recordUserId === nursingId;
    });

    return nursingBillingRecord?.rates || [];
  }, [billingResponse, nursingId]);

  useEffect(() => {
    if (ratesList?.length > 0) {
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
      return { duration: '00:00:00', fee: 0, seconds: 0 };
    }

    const start = new Date(`1970-01-01T${startTime}:00+06:00`);
    let end = new Date(`1970-01-01T${endTime}:00+06:00`);

    if (end < start) end.setDate(end.getDate() + 1); // ওভারনাইট/নাইট ডিউটি হ্যান্ডলিং

    const seconds = Math.floor((end - start) / 1000);
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');

    const totalFee = (seconds / 3600) * Number(currentHourlyRate);

    return {
      duration: `${h}:${m}:${s}`,
      fee: Math.round(totalFee),
      seconds: seconds,
    };
  }, [startTime, endTime, currentHourlyRate]);

  // 6. Handlers
  const handleRateSelect = (rateObj) => {
    setValue('hourlyRate', Number(rateObj.hourlyRate || 0));
    setValue('selectedRateCategory', rateObj.category || '');
  };

  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    setValue('nursingId', staff._id);
    setValue('employeeName', staff.userName);
    setValue('phone', staff.phone);
    setValue('hourlyRate', 0);
    setValue('selectedRateCategory', '');
    setSearch(staff.userName);
    setIsDropdownOpen(false);
  };

  const onFormSubmit = async (data) => {
    if (!selectedStaff) return toast.error('Please select a nursing member');
    if (!data.hourlyRate || data.hourlyRate <= 0)
      return toast.error('Please select a valid billing rate!');
    if (calculated.fee <= 0) return toast.error('Invalid duty duration');

    try {
      const payload = {
        date: new Date(data.date).toISOString(), // "2025-02-01T00:00:00.000Z" ISO format
        nursingId: data.nursingId,
        employeeName: data.employeeName,
        phone: data.phone,
        messName: data.messName,
        dutyStartTime: data.dutyStartTime,
        dutyEndTime: data.dutyEndTime,
        totalDutyTime: String(calculated.seconds),
        totalAmount: calculated.fee,
      };

      await postNursingData(payload).unwrap();
      toast.success('Duty recorded successfully');

      reset({
        date: getBangladeshDateString(),
        dutyStartTime: '',
        dutyEndTime: '',
        employeeName: '',
        phone: '',
        nursingId: '',
        messName: '',
        hourlyRate: 0,
        selectedRateCategory: '',
      });
      setSelectedStaff(null);
      setSearch('');
    } catch (err) {
      toast.error(err?.data?.message || 'Submission failed');
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

  // UI Styles
  const inputStyle =
    'w-full pl-10 pr-4 py-2.5 bg-[#f7f7f5] border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 transition-all text-sm shadow-sm';
  const labelStyle =
    'text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block';

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
        <div className="mb-10">
          <h1 className="flex items-center gap-4 text-xl font-bold tracking-tighter text-gray-900 md:text-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-2xl">
              <Zap className="text-blue-600 w-7 h-7" />
            </div>
            Nursing Duty Registry
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="grid grid-cols-1 gap-12 lg:grid-cols-12"
        >
          {/* LEFT: STAFF & RATES */}
          <div className="space-y-8 lg:col-span-5">
            <div>
              <label className={labelStyle}>SELECT NURSING MEMBER</label>
              <div ref={containerRef} className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search by name or phone..."
                  className={inputStyle}
                />
                <AnimatePresence>
                  {isDropdownOpen && nursingData?.data?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute z-30 w-full mt-2 overflow-auto bg-white border border-gray-200 shadow-2xl rounded-xl h-60"
                    >
                      {nursingData?.data?.map((staff) => (
                        <div
                          key={staff._id}
                          onClick={() => handleStaffSelect(staff)}
                          className="flex items-center gap-3 px-4 py-3 transition-colors border-b cursor-pointer hover:bg-blue-50 border-gray-50 last:border-0"
                        >
                          <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-blue-700 bg-blue-100 rounded-full">
                            {staff.userName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 capitalize">
                              {staff.userName}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {staff.phone}
                            </p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {selectedStaff && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 p-4 border border-blue-100 bg-blue-50/30 rounded-xl"
              >
                <UserCircle className="w-10 h-10 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 capitalize">
                    {selectedStaff.userName}
                  </h4>
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone size={12} /> {selectedStaff.phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStaff(null);
                    setSearch('');
                    setValue('nursingId', '');
                    setValue('employeeName', '');
                    setValue('phone', '');
                    setValue('hourlyRate', 0);
                    setValue('selectedRateCategory', '');
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              </motion.div>
            )}

            {/* BILLING RATES TABLE */}
            <div className="p-5 border border-gray-100 bg-gray-50 rounded-2xl">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Wallet size={14} /> SELECT BILLING RATE
              </h3>

              {!nursingId ? (
                <div className="p-6 text-center bg-white border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500">
                    Please select a nursing member first to view rates.
                  </p>
                </div>
              ) : isBilling ? (
                <div className="flex items-center justify-center p-8 bg-white border border-gray-200 rounded-xl">
                  <Loader2 className="text-blue-600 animate-spin" size={24} />
                </div>
              ) : (
                <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="text-gray-500 border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="w-10 px-4 py-2"></th>
                        <th className="px-4 py-2">Category</th>
                        <th className="px-4 py-2 text-right">Rate/Hr</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ratesList?.length > 0 ? (
                        ratesList?.map((rate, idx) => (
                          <tr
                            key={idx}
                            onClick={() => handleRateSelect(rate)}
                            className={`cursor-pointer transition-colors ${selectedRateCategory === rate.category ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="radio"
                                name="nursingRateSelect"
                                checked={selectedRateCategory === rate.category}
                                onChange={() => handleRateSelect(rate)}
                                className="w-4 h-4 text-blue-600 focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${categoryColors[rate.category] || 'bg-gray-100 text-gray-600'}`}
                              >
                                {rate?.category}
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
                            No billing rates found for this nursing member.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DETAILS & LIVE BILLING */}
          <div className="space-y-6 lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelStyle}>DUTY DATE</label>
                <div className="relative">
                  <Calendar
                    className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
                    size={16}
                  />
                  <input
                    type="date"
                    {...register('date')}
                    className={inputStyle}
                  />
                </div>
              </div>
              <MessSelector
                labelBase={labelStyle}
                inputBase={inputStyle}
                value={watch('messName')}
                onSelect={(mess) => setValue('messName', mess?.name)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelStyle}>START TIME</label>
                <div className="relative">
                  <Clock
                    className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
                    size={16}
                  />
                  <input
                    type="time"
                    {...register('dutyStartTime')}
                    className={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className={labelStyle}>END TIME</label>
                <div className="relative">
                  <Clock
                    className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
                    size={16}
                  />
                  <input
                    type="time"
                    {...register('dutyEndTime')}
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* LIVE BILLING SUMMARY (Dark Mode Style) */}
            <div className="relative p-8 overflow-hidden text-white shadow-2xl bg-slate-900 rounded-3xl group">
              <div className="absolute top-0 right-0 p-4 transition-opacity opacity-5 group-hover:opacity-10">
                <Wallet size={140} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[3px]">
                    Financial Summary
                  </span>
                  <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400">
                    LIVE CALCULATION (BD TIME)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase text-slate-500">
                      Duration
                    </p>
                    <p className="font-mono text-3xl font-black tracking-tighter text-slate-100">
                      {calculated.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mb-2 text-xs font-bold uppercase text-slate-500">
                      Net Fee
                    </p>
                    <p className="text-4xl font-black tracking-tight text-emerald-400">
                      {calculated.fee.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'BDT',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium italic">
                    Applied Rate: ৳{currentHourlyRate}/hr
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Auto-calculated based on BD Time
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedStaff || calculated.fee <= 0}
              className={`w-full h-14 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 ${
                !selectedStaff || calculated.fee <= 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" size={24} />
              ) : (
                <>
                  <Plus size={20} />
                  Confirm & Submit Duty
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

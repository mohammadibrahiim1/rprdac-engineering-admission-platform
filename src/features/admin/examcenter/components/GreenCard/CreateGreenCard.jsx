// @ts-ignore
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import {
  Camera,
  Upload,
  X,
  User,
  IdCard,
  School,
  GraduationCap,
  CalendarDays,
  Phone,
  Wallet,
  Layers,
  Percent,
  Loader2,
  ArrowRight,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGreenCardForm } from '../../hooks/useGreenCardForm';

// @ts-ignore
const CreateGreenCard = (props) => {
  const {
    view,
    setView,
    currentSession,
    sessionOptions,
    departmentsData,
    isCreating,
  } = props;

  const {
    register,
    handleSubmit,
    onSubmit,
    // @ts-ignore
    errors,
    paymentMethod,
    totalPayable,
    dueAmount,
    photo,
    setPhoto,
    useCamera,
    setUseCamera,
    isOpen,
    setIsOpen,
    selectedIns,
    setSelectedIns,
    search,
    setSearchIns,
    webcamRef,
    filteredInstitutes,
    // @ts-ignore
    processImage,
  } = useGreenCardForm(props);

  // Conditions for Payment Fields
  const showAccountNumber = [
    'bkash',
    'nagad',
    'rocket',
    'bank transfer',
  ].includes(paymentMethod);
  const showTransactionId = ['bkash', 'nagad', 'rocket'].includes(
    paymentMethod,
  );

  if (view !== 'create') return null;

  return (
    <motion.div
      key="create"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-6xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden"
    >
      {/* Header - Notion Style Minimalist */}
      <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Green Card
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Register new student and map financial.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN: Registration (7 spans) */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
              <User size={16} /> Student Details
            </h3>

            {/* Photo Upload Section */}
            <div className="p-5 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="flex gap-4 items-center">
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setUseCamera(false)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${!useCamera ? 'bg-slate-900 text-white shadow-md border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Upload size={14} className="inline mr-1.5" /> Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCamera(true)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${useCamera ? 'bg-slate-900 text-white shadow-md border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Camera size={14} className="inline mr-1.5" /> Camera
                  </button>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  {!useCamera ? (
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 cursor-pointer w-full"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        // @ts-ignore
                        if (file && file.size <= 100 * 1024) setPhoto(file);
                        else {
                          toast.error('Max 100KB allowed');
                          e.target.value = '';
                        }
                      }}
                    />
                  ) : (
                    <div className="relative rounded-lg overflow-hidden w-[200px] aspect-video bg-black">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-[10px] font-bold rounded-md"
                        onClick={async () => {
                          // @ts-ignore
                          const imageSrc = webcamRef.current?.getScreenshot();
                          if (imageSrc) {
                            const res = await fetch(imageSrc);
                            const blob = await res.blob();
                            // @ts-ignore
                            setPhoto(
                              new File([blob], 'webcam.jpg', {
                                type: 'image/jpeg',
                              }),
                            );
                            setUseCamera(false);
                          }
                        }}
                      >
                        Capture
                      </button>
                    </div>
                  )}
                </div>

                {photo && (
                  <div className="relative shrink-0">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="Preview"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* General Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <User size={14} /> Full Name
                </label>
                <input
                  {...register(
                    // @ts-ignore
                    'studentName',
                    { required: true },
                  )}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="JOHN DOE"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <IdCard size={14} /> Student ID / Roll
                </label>
                <input
                  {...register(
                    // @ts-ignore
                    'studentId',
                    { required: true },
                  )}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="1001"
                />
              </div>

              {/* Custom Searchable Select for Institute */}
              <div className="relative space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <School size={14} /> Polytechnic Name
                </label>
                <div
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg cursor-pointer flex justify-between items-center"
                >
                  <span
                    className={
                      selectedIns ? 'text-slate-900' : 'text-slate-400'
                    }
                  >
                    {selectedIns || 'Select institute...'}
                  </span>
                  <span className="text-xs text-slate-400">▼</span>
                </div>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearchIns(e.target.value)}
                      className="w-full p-3 border-b border-slate-100 outline-none text-sm bg-slate-50"
                    />
                    <div className="max-h-48 overflow-y-auto">
                      {filteredInstitutes?.map(
                        // @ts-ignore
                        (inst) => (
                          <div
                            key={inst._id}
                            onClick={() => {
                              setSelectedIns(inst.name);
                              setIsOpen(false);
                            }}
                            className="px-4 py-2.5 text-sm hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                          >
                            {inst.name}{' '}
                            {selectedIns === inst.name && (
                              <CheckCircle2
                                size={14}
                                className="text-emerald-500"
                              />
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <GraduationCap size={14} /> Department
                </label>
                <select
                  {...register(
                    // @ts-ignore
                    'department',
                    { required: true },
                  )}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="">Select Dept</option>
                  {departmentsData?.data?.map(
                    // @ts-ignore
                    (dept) => (
                      <option key={dept._id} value={dept.name}>
                        {dept.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Phone size={14} /> Mobile Number
                </label>
                <input
                  {...register(
                    // @ts-ignore
                    'studentPhone',
                    { required: true, pattern: /^01[3-9]\d{8}$/ },
                  )}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <CalendarDays size={14} /> Session
                </label>
                <select
                  {...register(
                    // @ts-ignore
                    'academicYear',
                    { required: true },
                  )}
                  defaultValue={currentSession}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  {sessionOptions?.map(
                    // @ts-ignore
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <CalendarDays size={14} /> Exam Type
                </label>
                <select
                  {...register(
                    // @ts-ignore
                    'examType',
                    { required: true },
                  )}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="Short">Short</option>
                  <option value="Long">Long</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Financial Ledger (5 spans) - Notion Style */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 shadow-sm h-full flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
                <Wallet size={16} /> Financial
              </h3>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Layers size={14} /> Amount
                    </label>
                    <input
                      type="number"
                      {...register('amount', { valueAsNumber: true, min: 0 })}
                      className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Wallet size={14} /> Method
                    </label>
                    <select
                      {...register('payment.method')}
                      className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                    >
                      <option value="cash">Cash</option>
                      <option value="free">Free</option>
                      <option value="bkash">Bkash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                      <option value="bank transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                {/* Conditional Payment Fields with Framer Motion */}
                <AnimatePresence mode="popLayout">
                  {(showAccountNumber || showTransactionId) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="grid grid-cols-1 gap-4 pt-2 overflow-hidden"
                    >
                      {showAccountNumber && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600">
                            Account Number
                          </label>
                          <input
                            {...register('payment.accountNumber', {
                              required: showAccountNumber,
                            })}
                            className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            placeholder="e.g., 017XXXXXXXX"
                          />
                        </div>
                      )}
                      {showTransactionId && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600">
                            Transaction ID
                          </label>
                          <input
                            {...register('payment.transactionId', {
                              required: showTransactionId,
                            })}
                            className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase"
                            placeholder="e.g., 8NJYXYZ"
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Totals Summary */}
              <div className="mt-6 p-4 bg-slate-900 rounded-xl text-white shadow-inner">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-slate-400">Total Payable</span>
                  <span className="font-mono font-semibold">
                    ৳ {totalPayable}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setView('list')}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2"
          >
            <Ban size={16} /> Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-md disabled:opacity-70 flex items-center gap-2 transition-all"
          >
            {isCreating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Please wait...
              </>
            ) : (
              <>
                Submit <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateGreenCard;

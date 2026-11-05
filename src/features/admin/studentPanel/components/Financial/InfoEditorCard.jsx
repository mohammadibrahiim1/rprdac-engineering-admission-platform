import { useEffect, useRef, useState } from 'react';
import { useUpdateStudentInformationMutation } from '../../../../../../redux/features/student/studentApi';
import { Controller, useForm } from 'react-hook-form';
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  DoorOpen,
  FileText,
  GraduationCap,
  Info,
  Loader2,
  Save,
  Search,
  Settings,
  User,
  X,
  XCircle,
} from 'lucide-react';
import BatchSelector from '../../../../../../components/forms/BatchSelector';
import { motion } from 'framer-motion';
import { useGetMessesQuery } from '../../../../../../redux/features/mess/messApi';

const STATUS_CONFIG = {
  approved: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Approved',
  },
  active: {
    icon: CheckCircle2,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
    label: 'Active',
  },
  pending: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  draft: {
    icon: FileText,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    label: 'Draft',
  },
  rejected: {
    icon: XCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    label: 'Rejected',
  },
  dropped: {
    icon: XCircle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    label: 'Dropped',
  },
  graduated: {
    icon: GraduationCap,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    label: 'Graduated',
  },
};

const STATUS_OPTIONS = [
  'draft',
  'pending',
  'approved',
  'rejected',
  'active',
  'dropped',
  'graduated',
];

const DEPARTMENT_OPTIONS = [
  'ARCH',
  'CE',
  'CHE',
  'CSE',
  'EEE',
  'FE',
  'ME / IPE / MME',
  'TE',
];
const DEFAULT_COURSE_FEE = 18000;

const inputBase =
  'w-full px-3 py-2 text-md bg-slate-50/60 border border-slate-200/80 rounded-md focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all placeholder:text-slate-400 text-slate-800 shadow-xs';

const labelBase =
  'text-[14px] font-semibold text-slate-600 mb-1 block tracking-wide';

const Field = ({ icon: Icon, label, children, hint }) => (
  <div className="space-y-0.5">
    <label className={labelBase}>{label}</label>
    <div className="relative flex items-center">
      {Icon && (
        <Icon
          size={14}
          className="absolute z-10 pointer-events-none left-3 text-slate-500"
        />
      )}
      {children}
    </div>
    {hint && <p className="text-[12px] text-slate-500 mt-0.5">{hint}</p>}
  </div>
);

/* Alert — transient feedback message */
function Alert({ type, message }) {
  if (!message) return null;
  const s = {
    success: {
      bg: 'bg-emerald-50/90 border-emerald-200/80',
      text: 'text-emerald-800',
      Icon: CheckCircle,
    },
    error: {
      bg: 'bg-rose-50/90 border-rose-200/80',
      text: 'text-rose-800',
      Icon: AlertCircle,
    },
    info: {
      bg: 'bg-indigo-50/90 border-indigo-200/80',
      text: 'text-indigo-800',
      Icon: Info,
    },
  }[type] || {
    bg: 'bg-indigo-50/90 border-indigo-200/80',
    text: 'text-indigo-800',
    Icon: Info,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2 p-2.5 rounded-md border text-md font-medium shadow-xs ${s.bg} ${s.text}`}
    >
      <s.Icon size={14} className="flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </motion.div>
  );
}

// ─── INFO EDITOR CARD ─────────────────────────────────────────────────────────
export default function InfoEditorCard({
  student,
  onUpdateSuccess,
  sessionOptions,
}) {
  const [updateStudentInformation] = useUpdateStudentInformationMutation();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Mess search states
  const [searchTerm, setSearchTerm] = useState(student?.mess || '');
  const [debouncedSearch, setDebouncedSearch] = useState(student?.mess || '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const { register, handleSubmit, watch, setValue, control } = useForm({
    defaultValues: {
      courseFee: student?.courseFee || DEFAULT_COURSE_FEE,
      admissionFee: student?.admissionFee || 0,
      studentPaid: student?.studentPaid || 0,
      admissionStatus: student?.admissionStatus || 'pending',
      batch: student?.batch || '',
      department: student?.department || '',
      session: student?.session || '',
      studentId: student?.studentId || '',
      mess: student?.mess || '',
      room: student?.room || '',
    },
  });

  const currentMess = watch('mess');
  const selectedDept = watch('department');
  const watchedStatus = watch('admissionStatus');
  const statusCfg =
    STATUS_CONFIG[watchedStatus?.toLowerCase()] || STATUS_CONFIG.pending;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sync searchTerm when form value changes (e.g. reset)
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(currentMess || '');
    }
  }, [currentMess, isOpen]);

  const {
    data: messData,
    isLoading: isMessesLoading,
    isError: isMessesError,
    error: messesError,
  } = useGetMessesQuery({ search: debouncedSearch }, { skip: !isOpen });

  const messes = messData?.messes ?? messData?.messes ?? [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm(currentMess || '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [currentMess]);

  const handleSelect = (mess) => {
    setValue('mess', mess.name, { shouldValidate: true, shouldDirty: true });
    setSearchTerm(mess.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setValue('mess', '', { shouldValidate: true, shouldDirty: true });
    setSearchTerm('');
    setDebouncedSearch('');
    inputRef.current?.focus();
  };

  const flash = (type, text, ms = 4000) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), ms);
  };

  // Sync Student ID prefix based on selected department
  useEffect(() => {
    if (selectedDept) {
      const currentVal = watch('studentId') || '';
      const actualIdPart = currentVal.includes('-')
        ? currentVal.split('-')[1]
        : currentVal;
      const newId = `${selectedDept}-${actualIdPart || ''}`;
      if (currentVal !== newId) {
        setValue('studentId', newId, { shouldDirty: true });
      }
    }
  }, [selectedDept, setValue, watch]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const updatedData = {};
      if (Number(data.courseFee) !== Number(student?.courseFee))
        updatedData.courseFee = Number(data.courseFee);
      if (Number(data.admissionFee) !== Number(student?.admissionFee))
        updatedData.admissionFee = Number(data.admissionFee);
      if (Number(data.studentPaid) !== Number(student?.studentPaid))
        updatedData.studentPaid = Number(data.studentPaid);
      if (data.admissionStatus !== student?.admissionStatus)
        updatedData.admissionStatus = data.admissionStatus;
      if (data.department !== student?.department)
        updatedData.department = data.department;
      if (data.session !== student?.session) updatedData.session = data.session;
      if (data.studentId !== student?.studentId)
        updatedData.studentId = data.studentId;
      if (data.batch !== student?.batch) updatedData.batch = data.batch;
      if (data.mess !== student?.mess) updatedData.mess = data.mess;
      if (data.room !== student?.room) updatedData.room = data.room;

      if (Object.keys(updatedData).length > 0) {
        await updateStudentInformation({
          id: student?._id,
          data: updatedData,
        }).unwrap();
        flash('success', 'Student record updated successfully.');
        onUpdateSuccess?.();
      } else {
        flash('info', 'No changes detected.');
      }
    } catch (err) {
      flash('error', err?.data?.message || 'Failed to update record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden bg-white border rounded-md border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] font-sans">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-900 text-white shadow-xs">
              <Settings size={14} className="text-indigo-300" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                System Record
              </p>
              <h2 className="text-base font-bold text-slate-800">
                Edit Student Information
              </h2>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] tracking-wider font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
            ID: {student?.studentId || 'N/A'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3.5">
        {/* Batch Selector */}
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

        {/* Department & Session */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Department" icon={GraduationCap}>
            <select
              {...register('department')}
              className={`${inputBase} pl-8 pr-7 appearance-none cursor-pointer`}
            >
              <option value="">Select Department</option>
              {DEPARTMENT_OPTIONS?.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute pointer-events-none right-2.5 text-slate-400"
            />
          </Field>

          <Field label="Academic Session" icon={Calendar}>
            <select
              {...register('session')}
              className={`${inputBase} pl-8 pr-7 appearance-none cursor-pointer`}
            >
              <option value="">Select Session</option>
              {sessionOptions?.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute pointer-events-none right-2.5 text-slate-400"
            />
          </Field>
        </div>

        {/* Student ID */}
        <Field
          label="Student ID"
          icon={User}
          hint="Format: DEPT-ID (e.g., CSE-1024)"
        >
          <input
            type="text"
            {...register('studentId')}
            placeholder={
              selectedDept ? `${selectedDept}-XXXX` : 'e.g., CSE-1024'
            }
            className={`${inputBase} pl-8 font-mono text-md`}
          />
        </Field>

        {/* Mess & Room */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Mess Name / Hostel - Live Search */}
          <Field
            label="Mess Name / Hostel"
            icon={Building2}
            hint="e.g., South Hall Mess"
          >
            <div ref={containerRef} className="relative w-full">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => setIsOpen(true)}
                  placeholder="Search mess / hostel..."
                  className={`${inputBase} pl-9 pr-9`}
                  autoComplete="off"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {isOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
                  {isMessesLoading && (
                    <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </div>
                  )}

                  {isMessesError && (
                    <div className="px-3 py-3 text-sm text-rose-600">
                      Failed to load messes.{' '}
                      {messesError?.data?.message || 'Please try again.'}
                    </div>
                  )}

                  {!isMessesLoading &&
                    !isMessesError &&
                    messes.length === 0 && (
                      <div className="px-3 py-3 text-sm text-slate-500">
                        No mess found for “{debouncedSearch}”
                      </div>
                    )}

                  {!isMessesLoading &&
                    !isMessesError &&
                    messes?.map((mess) => {
                      const isSelected = mess.name === currentMess;
                      return (
                        <button
                          key={mess.id || mess._id || mess.name}
                          type="button"
                          onClick={() => handleSelect(mess)}
                          className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-slate-800'
                          }`}
                        >
                          <span className="truncate">{mess.name}</span>
                          {isSelected && <Check className="h-4 w-4 shrink-0" />}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </Field>

          {/* Room Number */}
          <Field label="Room No." icon={DoorOpen} hint="e.g., 302-B">
            <input
              type="text"
              {...register('room')}
              placeholder="Enter room number"
              className={`${inputBase} pl-8`}
            />
          </Field>
        </div>

        {/* Admission Status */}
        <Field label="Admission Status">
          <div
            className={`absolute z-10 left-3 w-2 h-2 rounded-full ${statusCfg.dot}`}
          />
          <select
            {...register('admissionStatus')}
            className={`${inputBase} pl-7 pr-7 appearance-none cursor-pointer capitalize`}
          >
            {STATUS_OPTIONS?.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="absolute pointer-events-none right-2.5 text-slate-400"
          />
        </Field>

        {/* Alert */}
        <Alert type={msg.type} message={msg.text} />

        {/* Save Button */}
        <div className="pt-1">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.005 }}
            whileTap={{ scale: loading ? 1 : 0.985 }}
            className={`w-full py-2.5 px-4 rounded-md text-md font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-sm ${
              loading
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin text-indigo-300" />
                <span>Saving Metadata...</span>
              </>
            ) : (
              <>
                <Save size={13} className="text-slate-300" />
                <span>Save Changes</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

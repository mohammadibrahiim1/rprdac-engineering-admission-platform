import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Camera,
  CheckCircle,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  X,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';
import CapturePhoto from '../../../../components/CapturePhoto';
import BloodGroupSelector from '../../../../components/forms/BloodGroupSelector';
import { FeatureGuard } from '../components/FeatureGuard';
import { useStudentUpdateProfile } from '../hooks/useStudentUpdateProfile';

function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, search]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSelect = (opt) => {
    onChange(opt);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm bg-white/90 border border-slate-200/80 rounded-md outline-none transition-all duration-200 shadow-sm
          ${
            disabled
              ? 'bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200'
              : 'hover:border-slate-300 focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 text-slate-800'
          }`}
      >
        <span className={`truncate ${!value ? 'text-slate-400' : ''}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-[100] mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400"
              />
            </div>
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400 text-center">
                No results
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 transition-colors
                      ${
                        opt === value
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-slate-700'
                      }`}
                  >
                    {opt}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

const inputBase =
  'w-full px-3.5 py-2.5 text-sm bg-white/90 border border-slate-200/80 rounded-md outline-none ' +
  'focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all duration-200 ' +
  'placeholder:text-slate-400 text-slate-800 shadow-sm hover:border-slate-300';

const disabledInput =
  'w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md outline-none ' +
  'text-slate-500 cursor-not-allowed font-medium select-none';

const labelCls =
  'block text-[12.5px] font-semibold text-slate-600 mb-1.5 tracking-tight';
const errorCls =
  'text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1';

export default function StudentUpdateProfile() {
  const {
    studentId,
    studentResponse,
    isAdminLocked,
    unlockDateTime,
    lockMessage,
    isSuccess,
    isPageLoading,
    hasError,
    isUpdating,
    locksError,
    control,
    register,
    errors,
    hookFormSubmit,
    onSubmit,
    sameAsPhone,
    sameAsGuardianPhone,
    sameAsPermanent,
    isDragging,
    displayPhotoUrl,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removePhoto,
    handleCapture,
    sessionOptions,
    years,
    insts,
    sscGroups,
    sscBoards,
    diplomaGroups,
    diplomaBoards,
    RELATION_OPTIONS,
    districtNames,
    permanentUpazilaOptions,
    presentUpazilaOptions,
    handlePermanentZillaChange,
    handlePresentZillaChange,
  } = useStudentUpdateProfile();

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="h-11 w-11 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Please wait...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 w-full max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-800">
                Unable to Load Profile
              </h3>
              <p className="text-xs text-red-600 mt-1">
                {locksError
                  ? 'Failed to verify system lock status.'
                  : 'Failed to fetch student data.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-xs font-medium text-red-700 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FeatureGuard>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="min-h-screen bg-white antialiased"
      >
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link
              to={`/student/dashboard/account/setting/${studentId}`}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors group"
            >
              <ArrowLeft
                size={15}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              <span className="font-medium">Back</span>
            </Link>

            <div className="absolute left-1/2 -translate-x-1/2 hidden sm:block">
              <h1 className="text-sm font-semibold text-slate-800 tracking-tight">
                Update Profile
              </h1>
            </div>

            <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
              {studentResponse?.data?.studentId || studentId}
            </span>
          </div>
        </header>

        <div className="max-w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="sm:hidden mb-5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Update Profile
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit only what you need to change
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isAdminLocked ? (
              <motion.div
                key="locked"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-md flex items-start gap-3"
              >
                <div className="p-1.5 bg-red-100 rounded-md shrink-0">
                  <Lock size={16} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-red-900">
                    Profile Locked
                  </h4>
                  <p className="text-xs text-red-700 mt-0.5">{lockMessage}</p>
                  {unlockDateTime && unlockDateTime !== 'unknown' && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-800">
                      <Calendar size={12} />
                      <span>
                        Unlock: <strong>{unlockDateTime}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-3.5 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100/60 rounded-md flex items-center gap-3"
              >
                <div className="p-1.5 bg-indigo-100 rounded-md shrink-0">
                  <Sparkles size={16} className="text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-indigo-900">
                    Portal Open
                  </h4>
                  <p className="text-xs text-indigo-700">
                    Previous data loaded. Change only the fields you need.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-3.5 bg-emerald-50 border border-emerald-100 rounded-md flex items-center gap-3"
              >
                <div className="p-1.5 bg-emerald-100 rounded-md">
                  <CheckCircle size={16} className="text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-900">
                    Updated Successfully
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Your changes have been saved.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={hookFormSubmit(onSubmit)} className="space-y-5">
            {/* Photo + Personal + Guardian */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-md border border-slate-200/80 shadow-sm overflow-visible"
            >
              <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 border-b border-slate-100 flex items-center gap-2.5 rounded-t-md">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                  <User size={16} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Student Profile
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Photo & personal details
                  </p>
                </div>
              </div>

              <div className="p-5 grid gap-6 lg:grid-cols-[220px_1fr]">
                <div className="space-y-3">
                  <label className={labelCls}>
                    Profile Photo <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative transition-all rounded-md border ${
                      isDragging
                        ? 'border-indigo-400 bg-indigo-50/40'
                        : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300'
                    }`}
                  >
                    <div className="p-4 flex flex-col items-center justify-center min-h-[180px]">
                      {displayPhotoUrl ? (
                        <div className="relative">
                          <img
                            src={displayPhotoUrl}
                            alt="Preview"
                            className="w-44 h-36 object-cover rounded-md shadow-md"
                          />
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute -top-2 -right-2 p-1 bg-white border border-slate-200 text-slate-500 hover:text-red-500 rounded-full shadow-sm"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Camera
                            size={28}
                            className="text-slate-300 mb-2"
                            strokeWidth={1.5}
                          />
                          <p className="text-[11px] text-slate-500 text-center">
                            Drop or click · max 100KB
                          </p>
                        </>
                      )}
                      <label className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 w-44 hover:border-indigo-300 text-slate-700 text-[11px] font-medium rounded-md cursor-pointer shadow-sm">
                        <Upload size={12} />
                        Choose
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept="image/*"
                          disabled={isAdminLocked}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <CapturePhoto
                      onCapture={handleCapture}
                      disabled={isAdminLocked}
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Personal */}
                  <div className="bg-white rounded-md border border-slate-200/80 shadow-sm overflow-visible">
                    <div className="px-4 py-3 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/40 border-b border-slate-100 flex items-center gap-2.5 rounded-t-md">
                      <div className="p-1.5 bg-emerald-50 rounded-md">
                        <ShieldCheck size={15} className="text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">
                          Personal Information
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          My legal information
                        </p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>
                            Name (English){' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <Controller
                            name="name"
                            control={control}
                            rules={{ required: 'Required' }}
                            render={({ field }) => (
                              <input
                                {...field}
                                disabled={isAdminLocked}
                                placeholder="Mohammad Rahman"
                                className={inputBase}
                              />
                            )}
                          />
                          {errors.name && (
                            <span className={errorCls}>
                              <AlertCircle size={11} />
                              {errors.name.message}
                            </span>
                          )}
                        </div>
                        <div>
                          <label className={labelCls}>
                            Name (Bangla){' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <Controller
                            name="nameInBangla"
                            control={control}
                            rules={{ required: 'আবশ্যক' }}
                            render={({ field }) => (
                              <input
                                {...field}
                                disabled={isAdminLocked}
                                placeholder="আপনার নাম"
                                className={inputBase}
                              />
                            )}
                          />
                          {errors.nameInBangla && (
                            <span className={errorCls}>
                              <AlertCircle size={11} />
                              {errors.nameInBangla.message}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <Controller
                            name="phone"
                            control={control}
                            rules={{ required: 'Required' }}
                            render={({ field }) => (
                              <input
                                {...field}
                                disabled={isAdminLocked}
                                placeholder="017xxxxxxxx"
                                className={inputBase}
                              />
                            )}
                          />
                          {errors.phone && (
                            <span className={errorCls}>
                              <AlertCircle size={11} />
                              {errors.phone.message}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[12.5px] font-semibold text-slate-600 tracking-tight">
                              WhatsApp <span className="text-red-500">*</span>
                            </label>
                            <label className="flex items-center gap-1.5 text-[10.5px] text-slate-500 cursor-pointer">
                              <input
                                type="checkbox"
                                {...register('sameAsPhone')}
                                disabled={isAdminLocked}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              Same as phone
                            </label>
                          </div>
                          <Controller
                            name="studentWhatsAppNum"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                disabled={isAdminLocked || sameAsPhone}
                                placeholder="WhatsApp number"
                                className={
                                  sameAsPhone || isAdminLocked
                                    ? disabledInput
                                    : inputBase
                                }
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelCls}>
                          Session <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name="session"
                          control={control}
                          rules={{ required: 'Required' }}
                          render={({ field }) => (
                            <SearchableSelect
                              value={field.value}
                              onChange={field.onChange}
                              options={sessionOptions}
                              placeholder="Select Session"
                              disabled={isAdminLocked}
                            />
                          )}
                        />
                        {errors.session && (
                          <span className={errorCls}>
                            <AlertCircle size={11} />
                            {errors.session.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className={labelCls}>Blood Group</label>
                        <Controller
                          name="bloodGroup"
                          control={control}
                          render={({ field }) => (
                            <BloodGroupSelector
                              value={field.value}
                              onSelect={field.onChange}
                              disabled={isAdminLocked}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guardian */}
                  <div className="bg-white rounded-md border border-slate-200/80 shadow-sm overflow-visible">
                    <div className="px-4 py-3 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/40 border-b border-slate-100 flex items-center gap-2.5 rounded-t-md">
                      <div className="p-1.5 bg-emerald-50 rounded-md">
                        <ShieldCheck size={15} className="text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">
                          Guardian
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Parent / legal guardian
                        </p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3.5">
                      <div>
                        <label className={labelCls}>Guardian Name</label>
                        <Controller
                          name="guardianName"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              disabled={isAdminLocked}
                              placeholder="Full name"
                              className={inputBase}
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>Relation</label>
                        <Controller
                          name="relationWithGuardian"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect
                              value={field.value}
                              onChange={field.onChange}
                              options={RELATION_OPTIONS}
                              placeholder="Select relation"
                              disabled={isAdminLocked}
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>Guardian Phone</label>
                        <Controller
                          name="guardianPhone"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              disabled={isAdminLocked}
                              placeholder="01xxxxxxxxx"
                              className={inputBase}
                            />
                          )}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[12.5px] font-semibold text-slate-600 tracking-tight">
                            Guardian WhatsApp
                          </label>
                          <label className="flex items-center gap-1.5 text-[10.5px] text-slate-500 cursor-pointer">
                            <input
                              type="checkbox"
                              {...register('sameAsGuardianPhone')}
                              disabled={isAdminLocked}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            Same as phone
                          </label>
                        </div>
                        <Controller
                          name="guardianWhatsAppNum"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              disabled={isAdminLocked || sameAsGuardianPhone}
                              placeholder="01xxxxxxxxx"
                              className={
                                sameAsGuardianPhone || isAdminLocked
                                  ? disabledInput
                                  : inputBase
                              }
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Academic */}
            <div className="grid gap-5 md:grid-cols-2">
              <motion.div
                variants={cardVariants}
                className="bg-white rounded-md border border-slate-200/80 shadow-sm overflow-visible"
              >
                <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/40 border-b border-slate-100 flex items-center gap-2.5 rounded-t-md">
                  <div className="p-1.5 bg-blue-50 rounded-md">
                    <GraduationCap size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      SSC / Equivalent
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Secondary education
                    </p>
                  </div>
                </div>
                <div className="p-5 space-y-3.5">
                  <div>
                    <label className={labelCls}>Group</label>
                    <Controller
                      name="sscGroup"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={sscGroups}
                          placeholder="Select group"
                          disabled={isAdminLocked}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Board</label>
                    <Controller
                      name="sscBoard"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={sscBoards}
                          placeholder="Select board"
                          disabled={isAdminLocked}
                        />
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Passing Year</label>
                      <Controller
                        name="sscYear"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value}
                            onChange={field.onChange}
                            options={years}
                            placeholder="Year"
                            disabled={isAdminLocked}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>GPA</label>
                      <Controller
                        name="sscGpa"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            max="5"
                            placeholder="5.00"
                            disabled={isAdminLocked}
                            className={inputBase}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? ''
                                  : e.target.valueAsNumber,
                              )
                            }
                            value={field.value ?? ''}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="bg-white rounded-md border border-slate-200/80 shadow-sm overflow-visible"
              >
                <div className="px-5 py-3.5 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/40 border-b border-slate-100 flex items-center gap-2.5 rounded-t-md">
                  <div className="p-1.5 bg-amber-50 rounded-md">
                    <GraduationCap size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Diploma / Institute
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Higher secondary / diploma
                    </p>
                  </div>
                </div>
                <div className="p-5 space-y-3.5">
                  <div>
                    <label className={labelCls}>Institute</label>
                    <Controller
                      name="instituteName"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={insts}
                          placeholder="Select institute"
                          disabled={isAdminLocked}
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>
                        Technology / Department
                      </label>
                      <Controller
                        name="diplomaGroup"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value}
                            onChange={field.onChange}
                            options={diplomaGroups}
                            placeholder="Select technology"
                            disabled={isAdminLocked}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Department (optional)</label>
                      <Controller
                        name="department"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            disabled={isAdminLocked}
                            placeholder="e.g. Computer"
                            className={inputBase}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Board</label>
                    <Controller
                      name="diplomaBoard"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={diplomaBoards}
                          placeholder="Select board"
                          disabled={isAdminLocked}
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Passing Year</label>
                      <Controller
                        name="diplomaYear"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value}
                            onChange={field.onChange}
                            options={years}
                            placeholder="Year"
                            disabled={isAdminLocked}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>CGPA</label>
                      <Controller
                        name="diplomaGpa"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            max="4"
                            placeholder="4.00"
                            disabled={isAdminLocked}
                            className={inputBase}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? ''
                                  : e.target.valueAsNumber,
                              )
                            }
                            value={field.value ?? ''}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Address — searchable dropdowns */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-md border border-slate-200/80 shadow-sm overflow-visible"
            >
              <div className="px-5 py-3.5 bg-gradient-to-r from-orange-50/80 via-white to-rose-50/40 border-b border-slate-100 flex items-center gap-2.5 rounded-t-md">
                <div className="p-1.5 bg-orange-50 rounded-md">
                  <MapPin size={16} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Address
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Permanent & present
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                    Permanent Address
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Zilla / District</label>
                      <Controller
                        name="permanentZilla"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value}
                            onChange={handlePermanentZillaChange}
                            options={districtNames}
                            placeholder="Select district"
                            disabled={isAdminLocked}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Upazilla / Thana</label>
                      <Controller
                        name="permanentUpozilla"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value}
                            onChange={field.onChange}
                            options={permanentUpazilaOptions}
                            placeholder={
                              permanentUpazilaOptions.length
                                ? 'Select upazila'
                                : 'Select district first'
                            }
                            disabled={
                              isAdminLocked || !permanentUpazilaOptions.length
                            }
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Village / Area</label>
                      <Controller
                        name="permanentVillage"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            disabled={isAdminLocked}
                            placeholder="Village or area"
                            className={inputBase}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Postcode</label>
                      <Controller
                        name="permanentPostcode"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            disabled={isAdminLocked}
                            placeholder="e.g. 1216"
                            className={inputBase}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Present Address
                    </h4>
                    <label className="flex items-center gap-1.5 text-[10.5px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('sameAsPermanent')}
                        disabled={isAdminLocked}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Same as permanent
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Zilla / District</label>
                      <Controller
                        name="presentZilla"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value}
                            onChange={handlePresentZillaChange}
                            options={districtNames}
                            placeholder="Select district"
                            disabled={isAdminLocked || sameAsPermanent}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Upazilla / Thana</label>
                      <Controller
                        name="presentUpozilla"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value}
                            onChange={field.onChange}
                            options={presentUpazilaOptions}
                            placeholder={
                              presentUpazilaOptions.length
                                ? 'Select upazila'
                                : 'Select district first'
                            }
                            disabled={
                              isAdminLocked ||
                              sameAsPermanent ||
                              !presentUpazilaOptions.length
                            }
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Village / Area</label>
                      <Controller
                        name="presentVillage"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            disabled={isAdminLocked || sameAsPermanent}
                            placeholder="Village or area"
                            className={
                              sameAsPermanent || isAdminLocked
                                ? disabledInput
                                : inputBase
                            }
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Postcode</label>
                      <Controller
                        name="presentPostcode"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            disabled={isAdminLocked || sameAsPermanent}
                            placeholder="e.g. 1216"
                            className={
                              sameAsPermanent || isAdminLocked
                                ? disabledInput
                                : inputBase
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Remarks + Submit */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-md border border-slate-200/80 shadow-sm overflow-visible"
            >
              <div className="p-5 space-y-4">
                <div>
                  <label className={labelCls}>Additional Remarks</label>
                  <Controller
                    name="comment"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={2}
                        disabled={isAdminLocked}
                        placeholder="Any extra notes…"
                        className={`${inputBase} resize-y min-h-[72px]`}
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-50 rounded-md">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Ready to save?
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Only changed fields will be updated
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAdminLocked || isUpdating}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-w-[180px]
                      bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700
                      text-white text-sm font-semibold rounded-md shadow-md shadow-indigo-500/20
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 active:scale-[0.98]"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        Update Profile
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </FeatureGuard>
  );
}

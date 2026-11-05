import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CalendarDays, LockKeyhole, X } from 'lucide-react';
import { Controller } from 'react-hook-form';

import { useSystemLockForm } from '../hooks/useSystemLockForm';
import { LOCK_SCOPES } from '../constants/lockScopes';
import { validateLockForm } from '../utils/validateLock';
import { SystemLockBatchSelector } from './SystemLockBatchSelector';
import { SystemLockScopeSelector } from './SystemLockScopeSelector';
import { generateDynamicSessions } from '../utils/generateDynamicSessions';

export const SystemLockModal = ({
  isOpen,
  onClose,
  selectedLock,
  handleCreate,
  handleUpdate,
  actionError,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useSystemLockForm(selectedLock);

  const scope = watch('scope');
  const isActive = watch('isActive');
  const isEditMode = Boolean(selectedLock?._id);

  // Memoize dynamic sessions list so it computes once on load
  const sessionOptions = useMemo(() => generateDynamicSessions(), []);

  const onSubmit = async (formData) => {
    const { isValid, errors: validationErrors } = validateLockForm(formData);

    if (!isValid) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field, {
          type: 'manual',
          message,
        });
      });
      return;
    }

    // Base payload
    const payload = {
      scope: formData.scope,
      isActive: Boolean(formData.isActive),
    };

    // Include dates ONLY if it's NOT a session lock
    if (formData.scope !== LOCK_SCOPES.SESSION_LOCK) {
      payload.startDate = formData.startDate
        ? new Date(formData.startDate).toISOString()
        : null;
      payload.endDate = formData.endDate
        ? new Date(formData.endDate).toISOString()
        : null;
    }

    if (formData.scope === LOCK_SCOPES.STUDENT_UPDATE) {
      payload.batchName = formData.batchName?.trim() || '';
    }

    if (formData.scope === LOCK_SCOPES.SESSION_LOCK) {
      payload.session = formData.session?.trim() || '';
    }

    if (isEditMode) {
      if (typeof handleUpdate === 'function') {
        await handleUpdate(payload, selectedLock, onClose);
      }
      return;
    }

    if (typeof handleCreate === 'function') {
      await handleCreate(payload, selectedLock, onClose);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-[2px] sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="system-lock-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="my-auto flex w-full max-w-xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <header className="relative border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3 pr-8">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <LockKeyhole className="h-4.5 w-4.5" strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h2
                    id="system-lock-title"
                    className="text-sm font-bold tracking-tight text-gray-900 sm:text-base"
                  >
                    {isEditMode ? 'Edit System Lock' : 'Create System Lock'}
                  </h2>

                  <p className="mt-0.5 text-[11px] leading-4 text-gray-500 sm:text-xs">
                    Configure the access restriction settings.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </header>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-h-[calc(100vh-8rem)] overflow-y-auto"
            >
              <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
                {/* Scope */}
                <section>
                  <div className="mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700">
                      Lock Scope
                    </h3>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      Select which area this restriction should apply to.
                    </p>
                  </div>

                  <Controller
                    name="scope"
                    control={control}
                    render={({ field }) => (
                      <SystemLockScopeSelector
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          if (value !== LOCK_SCOPES.STUDENT_UPDATE)
                            setValue('batchName', '');
                          if (value !== LOCK_SCOPES.SESSION_LOCK)
                            setValue('session', '');
                        }}
                      />
                    )}
                  />
                </section>

                {/* Batch Selector */}
                {scope === LOCK_SCOPES.STUDENT_UPDATE && (
                  <section className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
                    <Controller
                      name="batchName"
                      control={control}
                      render={({ field }) => (
                        <SystemLockBatchSelector
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.batchName?.message}
                        />
                      )}
                    />
                  </section>
                )}

                {/* Dynamic Session Dropdown Field */}
                {scope === LOCK_SCOPES.SESSION_LOCK && (
                  <section className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
                    <label
                      htmlFor="session"
                      className="mb-1.5 block text-xs font-semibold text-gray-700"
                    >
                      Select Academic Session
                    </label>
                    <select
                      id="session"
                      {...register('session', {
                        required: 'Academic session is required',
                      })}
                      className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-xs text-gray-800 outline-none transition cursor-pointer sm:text-sm ${
                        errors.session
                          ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                          : 'border-gray-200 hover:border-gray-300 focus:border-[#143F6B] focus:ring-2 focus:ring-[#143F6B]/10'
                      }`}
                    >
                      <option value="">-- Choose Session --</option>
                      {sessionOptions.map((sessionStr) => (
                        <option key={sessionStr} value={sessionStr}>
                          {sessionStr}
                        </option>
                      ))}
                    </select>
                    {errors.session?.message && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-600">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors.session.message}
                      </p>
                    )}
                  </section>
                )}

                {/* Schedule - Hidden if Session Lock */}
                {scope !== LOCK_SCOPES.SESSION_LOCK && (
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#143F6B]" />
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700">
                          Access Schedule
                        </h3>
                        <p className="text-[11px] text-gray-400">
                          Define when the lock starts and ends.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="startDate"
                          className="mb-1.5 block text-xs font-semibold text-gray-600"
                        >
                          Start date & time
                        </label>
                        <input
                          id="startDate"
                          type="datetime-local"
                          {...register('startDate')}
                          className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-800 outline-none transition hover:border-gray-300 focus:border-[#143F6B] focus:ring-2 focus:ring-[#143F6B]/10 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="endDate"
                          className="mb-1.5 block text-xs font-semibold text-gray-600"
                        >
                          End date & time
                        </label>
                        <input
                          id="endDate"
                          type="datetime-local"
                          {...register('endDate')}
                          className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-800 outline-none transition hover:border-gray-300 focus:border-[#143F6B] focus:ring-2 focus:ring-[#143F6B]/10 sm:text-sm"
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* Status Toggle */}
                <section className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50/70 px-4 py-3.5">
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-gray-800 sm:text-sm">
                      Lock Status
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-4 text-gray-500">
                      {isActive
                        ? 'This lock is currently enabled.'
                        : 'This lock is currently disabled.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(isActive)}
                    aria-label="Toggle lock status"
                    onClick={() =>
                      setValue('isActive', !isActive, {
                        shouldDirty: true,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#143F6B]/20 ${
                      isActive ? 'bg-[#143F6B]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        isActive ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </section>

                {/* API / Action Error */}
                {actionError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <div>
                      <p className="font-semibold">Unable to save changes</p>
                      <p className="mt-0.5 leading-4 text-red-600">
                        {actionError}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <footer className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50/70 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#143F6B] px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#143F6B]/90 focus:outline-none focus:ring-2 focus:ring-[#143F6B]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEditMode ? (
                    'Update Lock'
                  ) : (
                    'Create Lock'
                  )}
                </button>
              </footer>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

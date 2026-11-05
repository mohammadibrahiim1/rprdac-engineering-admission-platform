import React from 'react';
import {
  Plus,
  Trash2,
  Loader2,
  Calendar,
  BookOpen,
  Hash,
  Trophy,
  Eraser,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
    <Icon size={16} className="text-slate-400" />
    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
      {title}
    </span>
  </div>
);

const AdmitCardFormFields = ({
  register,
  fields,
  isLoading,
  addPrizeRow,
  removePrizeRow,
  handleClear,
  handleSubmit,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm font-sans">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create Bulk Admit Cards
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure automation variables using React Hook Form.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 font-sans">
        {/* Basic Info */}
        <div>
          <SectionTitle icon={BookOpen} title="Basic Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group relative">
              <label className="text-xs font-medium text-slate-500 block mb-1.5">
                Exam Topics
              </label>
              <input
                required
                placeholder="Physics, Math, English..."
                {...register('topics')}
                className="w-full px-3 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-sm text-slate-800"
              />
            </div>
            <div className="group relative">
              <label className="text-xs font-medium text-slate-500 block mb-1.5">
                Exam Type
              </label>
              <select
                {...register('examType')}
                className="w-full px-3 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-sm text-slate-800 cursor-pointer"
              >
                <option value="written+mcq">Written + MCQ</option>
                <option value="written">Written Only</option>
                <option value="mcq">MCQ Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Schedule & Venue */}
        <div>
          <SectionTitle icon={Calendar} title="Schedule & Venue" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                {...register('date')}
                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">
                Time
              </label>
              <input
                type="time"
                required
                {...register('time')}
                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">
                Department
              </label>
              <input
                required
                placeholder="EEE, CSE, Civil..."
                {...register('department')}
                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-sm text-slate-800 uppercase"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 mt-5">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">
                Venue
              </label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  placeholder="RPR DUET Admission Care"
                  {...register('venue')}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-sm text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Participant Range */}
        <div>
          <SectionTitle icon={Hash} title="Participant Allocation" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Start ID (4 Digit)
              </label>
              <input
                type="number"
                required
                placeholder="1001"
                {...register('startId')}
                className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                End ID (4 Digit)
              </label>
              <input
                type="number"
                required
                placeholder="1100"
                {...register('endId')}
                className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Total Prize Winners
              </label>
              <input
                type="number"
                {...register('totalPrizeWinners')}
                className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-sm text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Prizes */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Prize Configuration
              </span>
            </div>
            <button
              type="button"
              onClick={addPrizeRow}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-all"
            >
              <Plus size={14} /> Add Reward
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            <AnimatePresence initial={false}>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center justify-center w-7 h-7 text-xs font-bold bg-slate-900 text-white rounded-md">
                    {field.position}
                  </div>
                  <input
                    placeholder="Enter reward description (e.g. Smart Watch)"
                    {...register(`prizes.${index}.prizeName`)}
                    className="flex-1 py-1 text-sm text-slate-700 outline-none placeholder:text-slate-300"
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrizeRow(index)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-slate-950 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-all shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Please wait...' : 'Generate Admit Cards'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmitCardFormFields;

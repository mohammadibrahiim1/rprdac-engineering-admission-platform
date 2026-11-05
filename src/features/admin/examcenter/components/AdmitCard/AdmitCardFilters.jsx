import React from 'react';
import { RotateCcw } from 'lucide-react';

const AdmitCardFilters = ({
  searchTerm,
  filter,
  handleInputChange,
  handleLimitChange,
  handleReset,
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm sticky top-28">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="text-sm font-semibold text-slate-800 tracking-wide">
          Filters
        </h3>
      </div>

      {/* Date Input */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Select Date
        </label>
        <input
          type="date"
          name="date"
          value={searchTerm.date}
          onChange={handleInputChange}
          className="w-full h-10 px-3 text-sm border rounded-lg bg-slate-50 border-slate-200 outline-none transition-all focus:border-slate-900"
        />
      </div>

      {/* Exam Type Select */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Exam Type
        </label>
        <select
          name="examType"
          value={searchTerm.examType}
          onChange={handleInputChange}
          className="w-full h-10 px-3 text-sm border rounded-lg bg-slate-50 border-slate-200 outline-none cursor-pointer transition-all focus:border-slate-900"
        >
          <option value="">All Types</option>
          <option value="written">Written</option>
          <option value="mcq">MCQ</option>
          <option value="written+mcq">Written + MCQ</option>
        </select>
      </div>

      {/* Department Input */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Department
        </label>
        <input
          name="department"
          value={searchTerm.department}
          placeholder="e.g. CSE"
          onChange={handleInputChange}
          className="w-full h-10 px-3 text-sm border rounded-lg bg-slate-50 border-slate-200 outline-none transition-all focus:border-slate-900"
        />
      </div>

      {/* Grid Range Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Start ID
          </label>
          <input
            name="startId"
            type="number"
            value={searchTerm.startId}
            placeholder="1000"
            onChange={handleInputChange}
            className="w-full h-10 px-3 text-sm border rounded-lg bg-slate-50 border-slate-200 outline-none transition-all focus:border-slate-900"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            End ID
          </label>
          <input
            name="endId"
            type="number"
            value={searchTerm.endId}
            placeholder="2000"
            onChange={handleInputChange}
            className="w-full h-10 px-3 text-sm border rounded-lg bg-slate-50 border-slate-200 outline-none transition-all focus:border-slate-900"
          />
        </div>
      </div>

      {/* Show Limit */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Show Limit
        </label>
        <input
          type="number"
          value={filter.limit}
          onChange={handleLimitChange}
          placeholder="10"
          className="w-full h-10 px-3 text-sm border rounded-lg bg-slate-50 border-slate-200 outline-none transition-all focus:border-slate-900"
        />
      </div>

      {/* Reset Action */}
      <button
        onClick={handleReset}
        className="flex items-center justify-center w-full h-10 gap-2 text-xs font-semibold uppercase tracking-wider transition-all bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 mt-2"
      >
        <RotateCcw size={14} />
        Reset Filters
      </button>
    </div>
  );
};

export default AdmitCardFilters;

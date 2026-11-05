import { Search, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface Batch {
  _id: string;
  title: string;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  selectedSession: string;
  onSessionChange: (v: string) => void;
  selectedBatch: string;
  onBatchSelect: (title: string) => void;
  onClearBatch: () => void;
  batches: Batch[];
  batchQuery: string;
  onBatchQueryChange: (v: string) => void;
  isBatchDropdownOpen: boolean;
  onBatchDropdownToggle: (open: boolean) => void;
  sessions: string[];
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export const StudentFilterBar = ({
  search,
  onSearchChange,
  selectedSession,
  onSessionChange,
  selectedBatch,
  onBatchSelect,
  onClearBatch,
  batches,
  batchQuery,
  onBatchQueryChange,
  isBatchDropdownOpen,
  onBatchDropdownToggle,
  sessions,
  hasActiveFilters,
  onClearAll,
}: FilterBarProps) => {
  const batchDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        batchDropdownRef.current &&
        !batchDropdownRef.current.contains(e.target as Node)
      ) {
        onBatchDropdownToggle(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBatchDropdownToggle]);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
      {/* Search Student */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by Student Name, Roll No., Admit ID or Mobile..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Dropdowns Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Session Select */}
        <Select
          value={selectedSession}
          onChange={onSessionChange}
          options={['All Sessions', ...sessions]}
          placeholder="All Sessions"
        />

        {/* Batch Search & Selector Dropdown */}
        <div className="relative min-w-[180px]" ref={batchDropdownRef}>
          <div className="relative flex items-center">
            <input
              type="text"
              value={
                selectedBatch && !isBatchDropdownOpen
                  ? selectedBatch
                  : batchQuery
              }
              onFocus={() => {
                onBatchDropdownToggle(true);
                if (!batchQuery && selectedBatch) {
                  onBatchQueryChange('');
                }
              }}
              onChange={(e) => {
                onBatchQueryChange(e.target.value);
                onBatchDropdownToggle(true);
                if (!e.target.value) {
                  onClearBatch();
                }
              }}
              placeholder="Search Batch..."
              className="w-full pl-3 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-slate-700 placeholder:text-slate-400"
            />
            {selectedBatch ? (
              <button
                type="button"
                onClick={() => {
                  onClearBatch();
                  onBatchQueryChange('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            )}
          </div>

          <AnimatePresence>
            {isBatchDropdownOpen && (
              <motion.ul
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 mt-1.5 max-h-52 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
              >
                {batches.length > 0 ? (
                  batches.map((batch) => (
                    <li
                      key={batch._id}
                      onClick={() => {
                        onBatchSelect(batch.title);
                        onBatchDropdownToggle(false);
                      }}
                      className={`cursor-pointer px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedBatch === batch.title
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {batch.title}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-slate-400 text-center">
                    No matching batch
                  </li>
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Clear All Filters Button */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Select = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) =>
        onChange(e.target.value === placeholder ? '' : e.target.value)
      }
      className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-slate-700 cursor-pointer min-w-[140px]"
    >
      {options.map((opt) => (
        <option key={opt} value={opt === placeholder ? '' : opt}>
          {opt}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
  </div>
);

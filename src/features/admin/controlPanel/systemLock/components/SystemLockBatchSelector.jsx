import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useSystemLockBatchSearch } from '../hooks/useSystemLockBatchSearch';

export const SystemLockBatchSelector = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { batchQuery, setBatchQuery, batches } = useSystemLockBatchSearch();

  useEffect(() => {
    if (value) setBatchQuery(value);
  }, [value, setBatchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (batchTitle) => {
    onChange(batchTitle);
    setBatchQuery(batchTitle);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setBatchQuery('');
  };

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        Select Batch
      </label>
      <div className="relative" ref={dropdownRef}>
        <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search batch..."
          value={batchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setBatchQuery(e.target.value);
            onChange(e.target.value);
          }}
          className={`w-full pl-10 pr-8 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#143F6B] focus:ring-1 focus:ring-[#143F6B] transition-all ${
            error ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-52"
            >
              {batches?.length > 0 ? (
                batches?.map((batch) => (
                  <li
                    key={batch?._id}
                    onClick={() => handleSelect(batch?.title)}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {batch?.title}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm text-gray-400">
                  No batches found
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

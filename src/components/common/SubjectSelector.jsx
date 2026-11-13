import { useState, useRef, useEffect, useMemo } from 'react';
import { BookText, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetSubjectsQuery } from '../../redux/features/subject/subjectApi';

const SubjectSelector = ({
  value,
  onChange,
  resetKey,
  labelBase,
  inputBase,
}) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);

  // API subject fetch
  const { data: subjectsData } = useGetSubjectsQuery();

  useEffect(() => {
    if (value) {
      if (typeof value === 'object') {
        setSearch(value.title || '');
      } else if (typeof value === 'string') {
        setSearch(value);
      }
    }
  }, [value]);

  const subjects = useMemo(() => {
    const data = subjectsData?.data || [];
    return data.flatMap((sub) => (sub.options ? sub.options : sub));
  }, [subjectsData]);

  // close outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSubjects = subjects?.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (!value) {
      setSearch('');
      return;
    }

    if (typeof value === 'string') {
      setSearch(value);
    } else if (typeof value === 'object') {
      setSearch(value?.title || value?.name || '');
    }
  }, [value, resetKey]);

  const handleSelect = (subject) => {
    onChange?.(subject);
    setSearch(subject);
    setIsOpen(false);
  };

  return (
    <div className="relative z-30 space-y-2" ref={dropdownRef}>
      <label className={labelBase}>SUBJECT</label>

      {/* Input */}
      <div className="relative">
        <BookText className="absolute left-3 top-3 text-zinc-400" size={14} />

        <input
          type="text"
          placeholder="Select subject..."
          required
          value={search}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputBase} pl-10`}
        />
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute w-full mt-2 overflow-y-auto bg-white border shadow-xl rounded-xl max-h-40 border-zinc-200"
          >
            {filteredSubjects?.map((subject) => (
              <div
                key={subject}
                onClick={() => handleSelect(subject)}
                className="px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-blue-50"
              >
                {subject}
              </div>
            ))}

            {filteredSubjects?.length === 0 && (
              <div className="px-4 py-2 text-xs text-zinc-400">
                No subject found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubjectSelector;

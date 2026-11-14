import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const departments = [
  'ARCH',
  'CE',
  'CHE',
  'CSE',
  'EEE',
  'FE',
  'ME / IPE / MME',
  'TE',
];

const DepartmentSelector = ({
  onSelect,
  resetKey,
  value,
  labelBase,
  inputBase,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value) {
      if (typeof value === 'object') {
        setQuery(value.title || '');
      } else if (typeof value === 'string') {
        setQuery(value);
      }
    }
  }, [value]);

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

  const filteredDepartments = departments?.filter((d) =>
    d.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (!value) {
      setQuery('');
      return;
    }

    if (typeof value === 'string') {
      setQuery(value);
    } else if (typeof value === 'object') {
      setQuery(value?.title || value?.name || '');
    }
  }, [value, resetKey]);

  const handleSelect = (dept) => {
    setSelected(dept);
    setQuery?.(dept);
    setIsOpen(false);
    onSelect?.(dept);
  };

  return (
    <div className="relative space-y-2" ref={dropdownRef}>
      <label className={labelBase}>Department</label>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-zinc-400" size={14} />

        <input
          type="text"
          placeholder="Select department..."
          required
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          className={`${inputBase} pl-10`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 w-full mt-2 overflow-y-auto bg-white border shadow-lg rounded-xl max-h-40"
          >
            {filteredDepartments?.map((dept) => (
              <div
                key={dept}
                onClick={() => handleSelect(dept)}
                className="px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-blue-50"
              >
                {dept}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DepartmentSelector;

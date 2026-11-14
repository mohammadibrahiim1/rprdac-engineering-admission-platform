import { useEffect, useRef, useState } from 'react';
import { Clock, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const timeSlots = [
  { id: 1, slot: '09:30 AM - 11:00 AM' },
  { id: 2, slot: '11:00 AM - 12:30 PM' },
  { id: 3, slot: '09:30 AM - 12:30 PM' },
  { id: 4, slot: '02:30 PM - 04:00 PM' },
  { id: 5, slot: '04:00 PM - 05:30 PM' },
  { id: 6, slot: '02:30 PM - 05:30 PM' },
  { id: 7, slot: '06:30 PM - 08:00 PM' },
  { id: 8, slot: '08:00 PM - 09:30 PM' },
  { id: 9, slot: '06:30 PM - 09:30 PM' },
];

const TimeSlotSelector = ({
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSlots = timeSlots?.filter((slot) =>
    slot.slot.toLowerCase().includes(query.toLowerCase()),
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

  const handleSelect = (slot) => {
    setSelected(slot.slot);
    setQuery?.(slot.slot);
    setIsOpen(false);
    onSelect(slot.slot);
  };

  return (
    <div className="relative z-20 space-y-2" ref={dropdownRef}>
      <label className={labelBase}>TIME SLOT</label>

      <div className="relative">
        <Clock className="absolute left-3 top-3 text-zinc-400" size={14} />

        <input
          type="text"
          placeholder="Select time slot..."
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
            className="absolute z-50 w-full mt-2 overflow-y-auto bg-white border shadow-lg rounded-xl max-h-28"
          >
            {filteredSlots.map((slot) => (
              <div
                key={slot.id}
                onClick={() => handleSelect(slot)}
                className="px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-blue-50"
              >
                {slot.slot}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeSlotSelector;

import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, MouseEvent as ReactMouseEvent } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionSelectorProps {
  onSelect?: (session: string) => void;
  resetKey?: string | number;
  value?: string;
  labelBase?: string;
  inputBase?: string;
  disabled?: boolean;
}

const generateSessions = (): string[] => {
  const currentYear = new Date().getFullYear();
  const sessions: string[] = [];

  for (let i = -10; i <= 10; i++) {
    const startYear = currentYear + i;
    sessions.push(`${startYear}-${startYear + 1}`);
  }

  return sessions.reverse();
};

const SESSIONS: string[] = generateSessions();

const SessionSelector = ({
  onSelect,
  resetKey,
  value = '',
  labelBase = '',
  inputBase = '',
  disabled = false,
}: SessionSelectorProps) => {
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setQuery('');
      return;
    }

    setQuery(value);
  }, [value, resetKey]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredSessions = SESSIONS.filter((session) =>
    session.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (session: string): void => {
    setQuery(session);
    setIsOpen(false);
    onSelect?.(session);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (
    event: ReactMouseEvent<HTMLDivElement>,
    session: string,
  ): void => {
    event.preventDefault();
    handleSelect(session);
  };

  return (
    <div className={`relative space-y-1 ${labelBase}`} ref={dropdownRef}>
      <div className="relative">
        <Search
          className="absolute left-3 top-3 text-zinc-400"
          size={14}
          aria-hidden="true"
        />

        <input
          type="text"
          placeholder="Select session..."
          disabled={disabled}
          value={query}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen && !disabled}
          aria-controls="session-options"
          aria-autocomplete="list"
          onFocus={() => setIsOpen(true)}
          onChange={handleChange}
          className={`${inputBase} pl-10`}
        />
      </div>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg"
          >
            <div id="session-options" role="listbox">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <div
                    key={session}
                    role="option"
                    aria-selected={value === session}
                    onMouseDown={(event) => handleOptionClick(event, session)}
                    className="cursor-pointer px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-blue-50"
                  >
                    {session}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-xs text-zinc-400">
                  No matching session
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionSelector;

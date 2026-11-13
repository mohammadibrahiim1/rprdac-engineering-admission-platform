import React, { useEffect, useRef, useState, FC } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMessesQuery } from "@/redux/features/mess/messApi";

// ==================== INTERFACES & TYPES ====================
export interface Mess {
  _id: string | number;
  name?: string;
  title?: string;
  [key: string]: any;
}

export interface MessSelectorProps {
  onSelect?: (mess: Mess) => void;
  value?: string | Mess | null;
  resetKey?: any;
  labelBase?: string;
  inputBase?: string;
  placeholder?: string;
}

const MessSelector: FC<MessSelectorProps> = ({
  onSelect,
  value,
  resetKey,
  labelBase = "",
  inputBase = "",
  placeholder = "Select mess...",
}) => {
  const [query, setQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // API call with proper typing support
  const { data: messData, isLoading } = useGetMessesQuery({
    search: query,
  }) as { data: { messes?: Mess[] } | undefined; isLoading: boolean };

  const messes: Mess[] = messData?.messes || [];

  // Sync value from parent
  useEffect(() => {
    if (!value) {
      setQuery("");
      return;
    }

    if (typeof value === "string") {
      setQuery(value);
    } else if (typeof value === "object" && value !== null) {
      setQuery(value?.name || value?.title || "");
    }
  }, [value, resetKey]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (mess: Mess) => {
    setQuery(mess?.name || "");
    setIsOpen(false);
    onSelect?.(mess);
  };

  return (
    <div className="relative space-y-2" ref={dropdownRef}>
      <label className={labelBase}>MESS / LOCATION</label>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-zinc-400" size={14} />

        <input
          type="text"
          placeholder={placeholder}
          value={query}
          required
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className={`${inputBase} pl-10`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 w-full mt-2 overflow-y-auto bg-white border shadow-lg rounded-xl max-h-48"
          >
            {isLoading && (
              <div className="flex items-center justify-center py-3 text-gray-500">
                <Loader2 size={16} className="animate-spin" />
              </div>
            )}

            {!isLoading && messes.length === 0 && (
              <div className="px-4 py-3 text-xs text-gray-500">
                No mess found
              </div>
            )}

            {!isLoading &&
              messes.map((mess) => (
                <div
                  key={mess._id}
                  onClick={() => handleSelect(mess)}
                  className="px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-blue-50"
                >
                  {mess?.name}
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessSelector;

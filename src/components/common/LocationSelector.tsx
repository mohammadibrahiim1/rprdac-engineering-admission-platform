import React, { useEffect, useRef, useState, FC } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ==================== INTERFACES & TYPES ====================
export interface LocationItem {
  id?: string | number;
  _id?: string | number;
  name: string;
  [key: string]: any;
}

export interface LocationSelectorProps {
  label: string;
  options?: LocationItem[];
  value?: string | null;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: any; // react-hook-form এর error অবজেক্টের জন্য
}

const LocationSelector: FC<LocationSelectorProps> = ({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  placeholder = "Select...",
}) => {
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // =========================
  // sync external value -> input
  // =========================
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // =========================
  // close dropdown on outside click
  // =========================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================
  // FILTER OPTIONS
  // =========================
  const filtered: LocationItem[] = options.filter((item) =>
    item?.name?.toLowerCase().includes(query.toLowerCase()),
  );

  // =========================
  // SELECT ITEM
  // =========================
  const handleSelect = (item: LocationItem) => {
    setQuery(item.name);
    setOpen(false);
    onChange?.(item.name);
  };

  return (
    <div ref={ref} className="relative w-full space-y-2">
      {/* LABEL */}
      <label className="text-xs font-medium text-zinc-600">{label}</label>

      {/* INPUT */}
      <div className="relative">
        <Search
          size={14}
          className="absolute -translate-y-1/2 left-3 top-1/2 text-zinc-400"
        />

        <input
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => !disabled && setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (e.target.value === "") {
              onChange?.("");
            }
          }}
          className="w-full py-2 text-sm border rounded-md outline-none border-zinc-200 px-9 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 disabled:bg-zinc-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* DROPDOWN */}
      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 w-full mt-1 overflow-y-auto bg-white border rounded-md shadow-lg max-h-56"
          >
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.id ?? item._id ?? item.name}
                  onClick={() => handleSelect(item)}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-zinc-50"
                >
                  {item.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-zinc-400">
                No results found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSelector;

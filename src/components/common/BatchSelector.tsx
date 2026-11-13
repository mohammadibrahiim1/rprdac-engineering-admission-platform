import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent as ReactMouseEvent } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetBatchesQuery } from "@/features/control-panel/control-panel-services/batch/batchApi";

interface Batch {
  _id: string;
  title: string;
}

interface BatchSelectorProps {
  onSelect?: (value: string | string[]) => void;
  resetKey?: string | number;
  value?: string | string[];
  inputBase?: string;
  labelBase?: string;
  multiple?: boolean;
  disabled?: boolean;
}

const BatchSelector = ({
  onSelect,
  resetKey,
  value,
  inputBase = "",
  labelBase = "",
  multiple = false,
}: BatchSelectorProps) => {
  const [batchQuery, setBatchQuery] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: batchesData } = useGetBatchesQuery(searchTerm);

  const batches: Batch[] = batchesData?.data ?? [];

  // Debounced search
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchTerm(batchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [batchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync selected values with props
  useEffect(() => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      setSelectedBatches([]);
      setBatchQuery("");
      return;
    }

    if (multiple) {
      if (Array.isArray(value)) {
        setSelectedBatches(value);
      } else {
        setSelectedBatches([value]);
      }
    } else {
      const selectedValue = Array.isArray(value) ? (value[0] ?? "") : value;

      setSelectedBatches(selectedValue ? [selectedValue] : []);
      setBatchQuery(selectedValue);
    }
  }, [value, multiple, resetKey]);

  // Filter batches
  const filteredBatches = batchQuery.trim()
    ? batches.filter((batch) =>
        batch.title.toLowerCase().includes(batchQuery.trim().toLowerCase()),
      )
    : batches;

  // Select a batch
  const handleSelect = (batch: Batch): void => {
    if (multiple) {
      if (selectedBatches.includes(batch.title)) {
        return;
      }

      const updated = [...selectedBatches, batch.title];

      setSelectedBatches(updated);
      onSelect?.(updated);
    } else {
      setSelectedBatches([batch.title]);
      setBatchQuery(batch.title);
      setIsOpen(false);
      onSelect?.(batch.title);
    }
  };

  // Remove a selected batch
  const removeBatch = (title: string): void => {
    const updated = selectedBatches.filter((batch) => batch !== title);

    setSelectedBatches(updated);

    if (multiple) {
      onSelect?.(updated);
    } else {
      setBatchQuery("");
      onSelect?.("");
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setBatchQuery(event.target.value);
    setIsOpen(true);
  };

  const handleOptionMouseDown = (
    event: ReactMouseEvent<HTMLLIElement>,
    batch: Batch,
  ): void => {
    event.preventDefault();
    handleSelect(batch);
  };

  return (
    <div className="space-y-2">
      <label className={labelBase}>Select Batch</label>

      <div className="relative" ref={dropdownRef}>
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />

        <input
          type="text"
          placeholder="Find batch..."
          required
          autoComplete="off"
          value={batchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={handleInputChange}
          className={`${inputBase} pl-10`}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="batch-options"
          aria-autocomplete="list"
        />

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              id="batch-options"
              role="listbox"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-2 max-h-52 w-full overflow-auto rounded-md border bg-white p-1 shadow-lg"
            >
              {filteredBatches.length > 0 ? (
                filteredBatches.map((batch) => (
                  <li
                    key={batch._id}
                    role="option"
                    aria-selected={selectedBatches.includes(batch.title)}
                    onMouseDown={(event) => handleOptionMouseDown(event, batch)}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-zinc-100"
                  >
                    {batch.title}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm text-zinc-400">
                  No matching batch
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Selected batches */}
      {selectedBatches.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedBatches.map((batch) => (
            <span
              key={batch}
              className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
            >
              {batch}

              {multiple && (
                <button
                  type="button"
                  onClick={() => removeBatch(batch)}
                  aria-label={`Remove ${batch}`}
                  className="rounded hover:bg-blue-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BatchSelector;

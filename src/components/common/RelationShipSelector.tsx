import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RelationshipSelectorProps {
  onSelect?: (relationship: string) => void;
  resetKey?: string | number;
  value?: string;
  inputBase?: string;
  disabled?: boolean;
}

const RELATIONS: string[] = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Uncle",
  "Aunt",
  "Grandfather",
  "Grandmother",
  "Other",
];

const RelationshipSelector = ({
  onSelect,
  resetKey,
  value = "",
  inputBase = "",
  disabled = false,
}: RelationshipSelectorProps) => {
  const [query, setQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setQuery("");
      return;
    }

    setQuery(value);
  }, [value, resetKey]);

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

  const filteredRelations = RELATIONS.filter((relationship) =>
    relationship.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (relationship: string): void => {
    setQuery(relationship);
    setIsOpen(false);
    onSelect?.(relationship);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
    setIsOpen(true);
  };

  return (
    <div className="relative space-y-1" ref={dropdownRef}>
      <div className="relative">
        <Search
          className="absolute left-3 top-3 text-zinc-400"
          size={14}
          aria-hidden="true"
        />

        <input
          type="text"
          placeholder="Select relationship..."
          disabled={disabled}
          value={query}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen && !disabled}
          aria-controls="relationship-options"
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
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 max-h-48 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg"
          >
            <div id="relationship-options" role="listbox">
              {filteredRelations.length > 0 ? (
                filteredRelations.map((relationship) => (
                  <div
                    key={relationship}
                    role="option"
                    aria-selected={value === relationship}
                    key-data={undefined}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSelect(relationship);
                    }}
                    className="cursor-pointer px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-blue-50"
                  >
                    {relationship}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-xs text-zinc-400">
                  No matching relationship
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RelationshipSelector;

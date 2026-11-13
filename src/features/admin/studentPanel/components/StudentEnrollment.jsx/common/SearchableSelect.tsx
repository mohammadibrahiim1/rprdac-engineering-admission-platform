import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

export interface SearchableSelectProps {
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options?: string[];
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const SearchableSelect: FC<SearchableSelectProps> = ({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Search and select...",
  isLoading = false,
  disabled = false,
  required = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    String(opt).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate dropdown position relative to trigger
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    const maxDropdownH = 240;
    const shouldOpenUp =
      spaceBelow < maxDropdownH + 16 && spaceAbove > spaceBelow;

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      ...(shouldOpenUp
        ? {
            bottom: viewportH - rect.top + 6,
            maxHeight: Math.min(spaceAbove - 16, maxDropdownH),
          }
        : {
            top: rect.bottom + 6,
            maxHeight: Math.min(spaceBelow - 16, maxDropdownH),
          }),
    });
  }, []);

  // Update position on scroll / resize
  useEffect(() => {
    if (!isOpen) return;
    const update = () => calculatePosition();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, calculatePosition]);

  // Close on outside click (aware of portal)
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent | Event) => {
      const target = e.target as Node;
      const inTrigger = containerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inTrigger && !inDropdown) {
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) item.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const handleOpen = () => {
    if (disabled || isLoading) return;
    calculatePosition();
    setIsOpen(true);
    setSearchQuery("");
    setHighlightedIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (option: string) => {
    onChange({ target: { name, value: option } });
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(-1);
  };

  const handleClear = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    onChange({ target: { name, value: "" } });
    setSearchQuery("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        handleOpen();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((p) =>
          p < filteredOptions.length - 1 ? p + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((p) =>
          p > 0 ? p - 1 : filteredOptions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // List section height = total maxHeight - search bar height
  const maxHeightNum =
    typeof dropdownStyle.maxHeight === "number" ? dropdownStyle.maxHeight : 240;
  const listMaxH = Math.max(80, maxHeightNum - 52);

  const dropdownPortal =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-white rounded-md border border-[#e3e2de] shadow-[0_8px_32px_rgba(0,0,0,0.16),0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden font-sans"
          >
            {/* Search bar */}
            <div className="p-2 border-b border-[#f1f0ee]">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#f7f7f5] rounded-md">
                <Search className="w-3.5 h-3.5 text-[#9b9a97] flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  placeholder="Search..."
                  className="flex-1 bg-transparent text-[13px] text-[#37352f] placeholder-[#9b9a97] outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      setSearchQuery("");
                      setHighlightedIndex(-1);
                      inputRef.current?.focus();
                    }}
                    className="text-[#9b9a97] hover:text-[#37352f] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Options */}
            <div
              ref={listRef}
              className="py-1 overflow-y-auto"
              style={{ maxHeight: listMaxH }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-5 text-center text-[12.5px] text-[#9b9a97]">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      handleSelect(option);
                    }}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] font-sans transition-colors
                      ${index === highlightedIndex ? "bg-[#f1f0ee]" : "hover:bg-[#f7f7f5]"}
                      ${value === option ? "text-[#2383e2] font-medium" : "text-[#37352f]"}
                    `}
                  >
                    <span className="flex-1 truncate">{option}</span>
                    {value === option && (
                      <Check className="w-3.5 h-3.5 text-[#2383e2] flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        disabled={disabled || isLoading}
        className={`
          w-full flex items-center gap-2 px-3.5 py-2.5 rounded-md border text-left
          transition-all duration-150 text-[13.5px] font-normal
          ${
            disabled || isLoading
              ? "bg-[#f7f7f5] border-[#e3e2de] text-[#b5b3aa] cursor-not-allowed"
              : "bg-white border-[#e3e2de] text-[#37352f] cursor-pointer hover:border-[#b5b3aa] hover:bg-[#fafaf9]"
          }
          ${isOpen ? "border-[#2383e2] ring-2 ring-[#2383e2]/20 bg-white" : ""}
          ${!value ? "text-[#9b9a97]" : "text-[#37352f]"}
        `}
      >
        {isLoading ? (
          <span className="flex items-center gap-2 text-[#9b9a97]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading...</span>
          </span>
        ) : (
          <>
            <span className="flex-1 truncate">{value || placeholder}</span>
            <span className="flex items-center gap-0.5 flex-shrink-0">
              {value && !disabled && (
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={handleClear}
                  className="p-0.5 rounded hover:bg-[#e9e8e3] text-[#9b9a97] hover:text-[#37352f] transition-colors"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#9b9a97] transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </span>
          </>
        )}
      </button>

      {dropdownPortal}
    </div>
  );
};

export default SearchableSelect;

import React, { useState, useRef, useEffect, FC } from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import {
  ChevronDown,
  Check,
  Award,
  GraduationCap,
  BookOpen,
  Sparkles,
  Hash,
} from 'lucide-react';

// ==================== INTERFACES & TYPES ====================
export type OptionItem =
  | string
  | {
      name?: string;
      year?: string | number;
      title?: string;
      [key: string]: any;
    };

export interface EditAcademicSelectorProps {
  label?: string;
  options?: OptionItem[];
  value?: any;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: { message?: string };
  disabled?: boolean;
}

export interface EditStudentAcademicSectionProps {
  student?: any;
  register?: any;
  control: Control<any>;
  errors: FieldErrors<any>;
  isEditMode: boolean;
  academicData?: {
    sscInformation?: {
      groups?: OptionItem[];
      boards?: OptionItem[];
    };
    diplomaInformation?: {
      groups?: OptionItem[];
    };
  };
  institutes?: OptionItem[];
}

// ==================== 1. SELECTOR SUB-COMPONENT ====================
const EditAcademicSelector: FC<EditAcademicSelectorProps> = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  error,
  disabled = false,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [dropUp, setDropUp] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Smart positioning: check if dropdown fits below, otherwise open upwards
  const handleToggle = () => {
    if (disabled) return;
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Estimated dropdown height is ~210px (max-h-52)
      if (spaceBelow < 220 && rect.top > 220) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
    setOpen((prev) => !prev);
  };

  // Format option display text safely
  const getOptionLabel = (option: OptionItem): string => {
    if (typeof option === 'object' && option !== null) {
      return String(option.name || option.year || option.title || '');
    }
    return String(option ?? '');
  };

  const selectedLabel = getOptionLabel(value);

  return (
    <div ref={ref} className="relative w-full space-y-1.5">
      {label && (
        <label className="text-xs font-semibold tracking-tight text-zinc-700">
          {label}
        </label>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`flex items-center justify-between w-full px-3.5 h-10 text-xs bg-white border rounded-md outline-none transition-all duration-200 ${
          error
            ? 'border-red-500 ring-2 ring-red-100'
            : open
              ? 'border-indigo-500 ring-2 ring-indigo-100'
              : 'border-zinc-200 hover:border-zinc-300'
        } ${disabled ? 'bg-zinc-100 cursor-not-allowed text-zinc-400' : 'text-zinc-900 font-medium'}`}
      >
        <span
          className={
            selectedLabel
              ? 'text-zinc-900 font-medium'
              : 'text-zinc-400 font-normal'
          }
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`text-zinc-400 transition-transform duration-200 ${
            open ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {/* Options Dropdown Panel (Smart Dynamic Positioning) */}
      {open && !disabled && (
        <div
          className={`absolute z-50 left-0 right-0 overflow-y-auto bg-white border rounded-md shadow-xl max-h-52 border-zinc-200/80 py-1.5 focus:outline-none ${
            dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {options?.length > 0 ? (
            options.map((option, idx) => {
              const itemLabel = getOptionLabel(option);
              const isSelected = itemLabel === selectedLabel;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    onChange(itemLabel);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <span>{itemLabel}</span>
                  {isSelected && (
                    <Check size={14} className="text-indigo-600" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-3.5 py-4 text-xs text-center text-zinc-400">
              No options available
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error?.message && (
        <p className="text-xs text-red-500 mt-1 font-medium">{error.message}</p>
      )}
    </div>
  );
};

// ==================== UTILITY FUNCTION ====================
const generatePassingYears = (
  pastCount: number = 10,
  futureCount: number = 5,
): string[] => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let i = currentYear + futureCount; i >= currentYear - pastCount; i--) {
    years.push(String(i));
  }
  return years;
};

// ==================== 2. MAIN COMPONENT ====================
export default function EditStudentAcademicSection({
  control,
  errors,
  isEditMode,
  academicData,
  institutes,
}: EditStudentAcademicSectionProps) {
  // Dynamic Options from API / State
  const sscInfo = academicData?.sscInformation || {};
  const diplomaInfo = academicData?.diplomaInformation || {};
  const sscGroups = sscInfo.groups || [];
  const sscBoards = sscInfo.boards || [];
  const diplomaGroups = diplomaInfo.groups || [];
  const diplomaInstitutes = institutes || [];

  // Dynamic Years Generator
  const passingYears = generatePassingYears(10, 5);

  return (
    <div className="space-y-6 p-5">
      {/* Section Main Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-md shadow-xs">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
              Academic Qualifications
            </h2>
            <p className="text-xs text-zinc-500">
              Manage educational details for SSC and Diploma programs
            </p>
          </div>
        </div>
        <Sparkles size={18} className="text-indigo-400 hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
        {/* 1. SSC INFORMATION CARD */}
        <div className="p-5 sm:p-6 border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/10 rounded-md shadow-xs space-y-4 hover:shadow-sm transition-all relative">
          <div className="flex items-center gap-2.5 pb-3 border-b border-indigo-50 text-indigo-900">
            <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-600">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                SSC Information
              </h3>
              <p className="text-[11px] text-zinc-500">
                Secondary school qualification details
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <Controller
              name="sscGroup"
              control={control}
              render={({ field }) => (
                <EditAcademicSelector
                  label="Group"
                  placeholder="Select Group (e.g. Science)"
                  options={sscGroups}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors?.sscGroup}
                  disabled={!isEditMode}
                />
              )}
            />

            <Controller
              name="sscBoard"
              control={control}
              render={({ field }) => (
                <EditAcademicSelector
                  label="Board"
                  placeholder="Select Board (e.g. Dhaka)"
                  options={sscBoards}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors?.sscBoard}
                  disabled={!isEditMode}
                />
              )}
            />

            <Controller
              name="sscPassingYear"
              control={control}
              render={({ field }) => (
                <EditAcademicSelector
                  label="Passing Year"
                  placeholder="Select Year"
                  options={passingYears}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors?.sscPassingYear}
                  disabled={!isEditMode}
                />
              )}
            />
          </div>
        </div>

        {/* 2. DIPLOMA INFORMATION CARD */}
        <div className="p-5 sm:p-6 border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/10 rounded-md shadow-xs space-y-4 hover:shadow-sm transition-all relative">
          <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-50 text-emerald-900">
            <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-600">
              <GraduationCap size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                Diploma Information
              </h3>
              <p className="text-[11px] text-zinc-500">
                Polytechnic diploma qualification details
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <Controller
              name="instituteName"
              control={control}
              render={({ field }) => (
                <EditAcademicSelector
                  label="Institute"
                  placeholder="Select Polytechnic Institute"
                  options={diplomaInstitutes}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors?.diplomaInstitute}
                  disabled={!isEditMode}
                />
              )}
            />

            <Controller
              name="diplomaGroup"
              control={control}
              render={({ field }) => (
                <EditAcademicSelector
                  label="Group / Technology"
                  placeholder="Select Technology (e.g. Computer)"
                  options={diplomaGroups}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors?.diplomaGroup}
                  disabled={!isEditMode}
                />
              )}
            />

            <Controller
              name="diplomaBoard"
              control={control}
              defaultValue="BTEB"
              render={({ field }) => (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-tight text-zinc-700">
                    Board
                  </label>
                  <input
                    {...field}
                    type="text"
                    value="BTEB"
                    readOnly
                    disabled
                    className="w-full h-10 px-3.5 text-xs bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-md cursor-not-allowed outline-none select-none font-medium"
                  />
                </div>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Controller
                name="diplomaPassingYear"
                control={control}
                render={({ field }) => (
                  <EditAcademicSelector
                    label="Passing Year"
                    placeholder="Select Year"
                    options={passingYears}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors?.diplomaPassingYear}
                    disabled={!isEditMode}
                  />
                )}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-tight text-zinc-700 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-emerald-600" /> GPA
                </label>
                <Controller
                  name="diplomaGpa"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="4.00"
                      disabled={!isEditMode}
                      className={`w-full h-10 px-3.5 text-xs bg-white border rounded-md outline-none transition-all ${
                        errors?.diplomaGpa
                          ? 'border-red-500 ring-2 ring-red-100'
                          : 'border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                      } ${
                        !isEditMode
                          ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                          : 'text-zinc-900 font-medium'
                      }`}
                    />
                  )}
                />
                {errors?.diplomaGpa?.message && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {String(errors.diplomaGpa.message)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

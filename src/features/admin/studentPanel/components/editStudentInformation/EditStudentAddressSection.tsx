import React, { useEffect, useMemo, useState, useRef, FC } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  MapPin,
  Home,
  Building2,
  Sparkles,
  Receipt,
  Hash,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  Controller,
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

import MessSelector from '../../../../../../components/forms/MessSelector';

// ==================== INTERFACES & TYPES ====================
export interface StudentAddressData {
  permanentZilla?: string;
  permanentUpozilla?: string;
  permanentVillage?: string;
  permanentPostcode?: string;
  presentZilla?: string;
  presentUpozilla?: string;
  presentVillage?: string;
  presentPostcode?: string;
  [key: string]: any;
}

export interface District {
  id: number | string;
  name: string;
}

export interface Upazila {
  id: number | string;
  district_id: number | string;
  name: string;
}

export interface AddressTableRecord {
  field: string;
  permanent: string;
  present: string;
}

export interface OptionItem {
  id?: string | number;
  name?: string;
  [key: string]: any;
}

export interface LocationSelectorProps {
  label?: string;
  options?: OptionItem[] | string[];
  value?: any;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: { message?: string };
  disabled?: boolean;
}

export interface EditStudentAddressSectionProps {
  messes?: any[];
  student?: StudentAddressData | null;
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  isEditMode: boolean;
}

export interface AddressFormProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  districts: District[];
  upazilas: Upazila[];
  addressLoading: boolean;
  register: UseFormRegister<any>;
  messes?: any[];
}

const columnHelper = createColumnHelper<AddressTableRecord>();

// ==================== SMART SELECTOR SUB-COMPONENT ====================
const LocationSelector: FC<LocationSelectorProps> = ({
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

  const getOptionLabel = (option: any): string => {
    if (typeof option === 'object' && option !== null) {
      return String(option.name || option.title || '');
    }
    return String(option ?? '');
  };

  const selectedLabel =
    typeof value === 'object' ? getOptionLabel(value) : String(value || '');

  return (
    <div ref={ref} className="relative w-full space-y-1.5 text-left">
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

// ==================== 1. TABLE COMPONENT ====================
interface EditStudentAddressTableProps {
  student?: StudentAddressData | null;
}

const EditStudentAddressTable: React.FC<EditStudentAddressTableProps> = ({
  student,
}) => {
  const tableData = useMemo<AddressTableRecord[]>(() => {
    if (!student) return [];
    return [
      {
        field: 'District / Zilla',
        permanent: student.permanentZilla || '—',
        present: student.presentZilla || '—',
      },
      {
        field: 'Upazila / Sub-district',
        permanent: student.permanentUpozilla || '—',
        present: student.presentUpozilla || '—',
      },
      {
        field: 'Village / Area',
        permanent: student.permanentVillage || '—',
        present: student.presentVillage || '—',
      },
      {
        field: 'Postcode',
        permanent: student.permanentPostcode || '—',
        present: student.presentPostcode || '—',
      },
    ];
  }, [student]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('field', {
        header: 'Address Field',
        cell: (info) => (
          <span className="font-semibold text-zinc-800">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('permanent', {
        header: 'Permanent Address',
        cell: (info) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('present', {
        header: 'Present Address',
        cell: (info) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
            {info.getValue()}
          </span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border border-zinc-200/80 bg-white overflow-hidden shadow-xs w-full transition-all hover:shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 via-indigo-50/20 to-zinc-50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-600">
            <MapPin className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
            Saved Address Overview
          </h3>
        </div>
        <Sparkles className="w-4 h-4 text-indigo-400" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-zinc-200/60 bg-zinc-50/70"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-3 font-semibold text-zinc-500 uppercase tracking-wider text-[11px]"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-indigo-50/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==================== 2. PERMANENT ADDRESS FORM ====================
const EditStudentPermanentAddress: React.FC<AddressFormProps> = ({
  control,
  errors,
  districts,
  upazilas,
  addressLoading,
  register,
}) => {
  return (
    <div className="rounded-md border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/10 p-5 space-y-4 shadow-xs relative">
      <div className="flex items-center gap-2.5 pb-3 border-b border-indigo-50 text-indigo-900">
        <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-600">
          <Home className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider">
          Permanent Address
        </h4>
      </div>

      <div className="space-y-3.5">
        <Controller
          name="permanentZilla"
          control={control}
          render={({ field }) => (
            <LocationSelector
              label="District"
              placeholder={addressLoading ? 'Loading...' : 'Select District'}
              options={districts}
              value={field.value}
              onChange={field.onChange}
              disabled={addressLoading}
              error={errors.permanentZilla}
            />
          )}
        />

        <Controller
          name="permanentUpozilla"
          control={control}
          render={({ field }) => (
            <LocationSelector
              label="Upazila / Sub-district"
              placeholder="Select Upazila"
              options={upazilas}
              value={field.value}
              onChange={field.onChange}
              disabled={!upazilas.length}
              error={errors.permanentUpozilla}
            />
          )}
        />

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold tracking-tight text-zinc-700">
            Village / House / Area
          </label>
          <input
            {...register('permanentVillage')}
            placeholder="e.g. House 12, Road 4"
            className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold tracking-tight text-zinc-700">
            Post Code
          </label>
          <input
            {...register('permanentPostcode')}
            placeholder="e.g. 1207"
            className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

// ==================== 3. PRESENT ADDRESS FORM ====================
const EditStudentPresentAddress: React.FC<AddressFormProps> = ({
  control,
  errors,
  districts,
  upazilas,
  addressLoading,
  register,
}) => {
  return (
    <div className="rounded-md border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/10 p-5 space-y-4 shadow-xs relative">
      <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-50 text-emerald-900">
        <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-600">
          <Building2 className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider">
          Present Address & Details
        </h4>
      </div>

      <div className="space-y-3.5">
        <Controller
          name="presentZilla"
          control={control}
          render={({ field }) => (
            <LocationSelector
              label="District"
              placeholder={addressLoading ? 'Loading...' : 'Select District'}
              options={districts}
              value={field.value}
              onChange={field.onChange}
              disabled={addressLoading}
              error={errors.presentZilla}
            />
          )}
        />

        <Controller
          name="presentUpozilla"
          control={control}
          render={({ field }) => (
            <LocationSelector
              label="Upazila / Sub-district"
              placeholder="Select Upazila"
              options={upazilas}
              value={field.value}
              onChange={field.onChange}
              disabled={!upazilas.length}
              error={errors.presentUpozilla}
            />
          )}
        />

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold tracking-tight text-zinc-700">
            Village / House / Area
          </label>
          <input
            {...register('presentVillage')}
            placeholder="e.g. Flat 3B, Lake Road"
            className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold tracking-tight text-zinc-700">
            Post Code
          </label>
          <input
            {...register('presentPostcode')}
            placeholder="e.g. 1000"
            className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>

        <Controller
          name="mess"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <MessSelector
              labelBase="text-xs font-semibold tracking-tight text-zinc-700"
              inputBase="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
              placeholder="Search & select mess..."
              value={field.value}
              onSelect={(selectedMess: any) => {
                field.onChange(selectedMess?.name || selectedMess);
              }}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold tracking-tight text-zinc-700 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Receipt No
            </label>
            <input
              {...register('receiptNo')}
              placeholder="e.g. #9821"
              className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold tracking-tight text-zinc-700 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-emerald-600" /> Service Charge
            </label>
            <input
              {...register('messServiceCharge')}
              placeholder="e.g. 100"
              className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== 4. MAIN CONTAINER COMPONENT ====================
const EditStudentAddressSection: React.FC<EditStudentAddressSectionProps> = ({
  messes,
  student,
  register,
  control,
  errors,
  watch,
  isEditMode,
}) => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [upazilas, setUpazilas] = useState<Upazila[]>([]);
  const [permanentUpazilas, setPermanentUpazilas] = useState<Upazila[]>([]);
  const [presentUpazilas, setPresentUpazilas] = useState<Upazila[]>([]);
  const [addressLoading, setAddressLoading] = useState<boolean>(false);

  const permanentZilla = watch('permanentZilla');
  const presentZilla = watch('presentZilla');

  /* Fetch Districts & Upazilas */
  useEffect(() => {
    const fetchAddressData = async () => {
      setAddressLoading(true);
      try {
        const [distRes, upaRes] = await Promise.all([
          axios.get('https://bdaddressapi.vercel.app/api/v1/districts/all'),
          axios.get('https://bdaddressapi.vercel.app/api/v1/sub-districts/all'),
        ]);
        setDistricts(distRes?.data?.data || []);
        setUpazilas(upaRes?.data?.data || []);
      } catch {
        toast.error('Failed to load address data');
      } finally {
        setAddressLoading(false);
      }
    };
    fetchAddressData();
  }, []);

  /* Filter Permanent Upazilas */
  useEffect(() => {
    if (permanentZilla && districts.length && upazilas.length) {
      const matchedDistrict = districts.find(
        (d) =>
          d.name?.toLowerCase().trim() === permanentZilla?.toLowerCase().trim(),
      );
      if (matchedDistrict) {
        const filtered = upazilas.filter(
          (u) => Number(u.district_id) === Number(matchedDistrict.id),
        );
        setPermanentUpazilas(filtered);
      } else {
        setPermanentUpazilas([]);
      }
    } else {
      setPermanentUpazilas([]);
    }
  }, [permanentZilla, districts, upazilas]);

  /* Filter Present Upazilas */
  useEffect(() => {
    if (presentZilla && districts.length && upazilas.length) {
      const matchedDistrict = districts.find(
        (d) =>
          d.name?.toLowerCase().trim() === presentZilla?.toLowerCase().trim(),
      );
      if (matchedDistrict) {
        const filtered = upazilas.filter(
          (u) => Number(u.district_id) === Number(matchedDistrict.id),
        );
        setPresentUpazilas(filtered);
      } else {
        setPresentUpazilas([]);
      }
    } else {
      setPresentUpazilas([]);
    }
  }, [presentZilla, districts, upazilas]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="space-y-6 p-5"
    >
      {/* Top Saved Summary Overview (Notion Table) */}
      <EditStudentAddressTable student={student} />

      {/* Edit Form Fields */}
      {isEditMode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <EditStudentPermanentAddress
            control={control}
            errors={errors}
            districts={districts}
            upazilas={permanentUpazilas}
            addressLoading={addressLoading}
            register={register}
          />
          <EditStudentPresentAddress
            control={control}
            messes={messes}
            errors={errors}
            districts={districts}
            upazilas={presentUpazilas}
            addressLoading={addressLoading}
            register={register}
          />
        </div>
      )}
    </motion.div>
  );
};

export default EditStudentAddressSection;

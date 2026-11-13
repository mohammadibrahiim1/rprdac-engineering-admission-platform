import React, { useEffect, useState, useRef, FC } from "react";
import {
  MapPin,
  Home,
  Building2,
  Sparkles,
  Receipt,
  Hash,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  Controller,
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

import MessSelector from "@/components/common/MessSelector";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import LocationSelector from "@/components/common/LocationSelector";

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
  [key: string]: unknown;
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
  title?: string;
  [key: string]: unknown;
}

export interface LocationSelectorProps {
  label?: string;
  options?: OptionItem[] | string[];
  value?: unknown;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: { message?: string };
  disabled?: boolean;
}

export interface EditStudentAddressSectionProps {
  messes?: unknown[];
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
  messes?: unknown[];
}

// ==================== 1. SHADCN TABLE COMPONENT (WITHOUT TANSTACK) ====================
interface EditStudentAddressTableProps {
  student?: StudentAddressData | null;
}

const EditStudentAddressTable: React.FC<EditStudentAddressTableProps> = ({
  student,
}) => {
  const tableData: AddressTableRecord[] = [
    {
      field: "District / Zilla",
      permanent: student?.permanentZilla || "—",
      present: student?.presentZilla || "—",
    },
    {
      field: "Upazila / Sub-district",
      permanent: student?.permanentUpozilla || "—",
      present: student?.presentUpozilla || "—",
    },
    {
      field: "Village / Area",
      permanent: student?.permanentVillage || "—",
      present: student?.presentVillage || "—",
    },
    {
      field: "Postcode",
      permanent: student?.permanentPostcode || "—",
      present: student?.presentPostcode || "—",
    },
  ];

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
        <Table className="w-full text-left text-xs">
          <TableHeader>
            <TableRow className="border-b border-zinc-200/60 bg-zinc-50/70 hover:bg-zinc-50/70">
              <TableHead className="px-5 py-3 font-semibold text-zinc-500 uppercase tracking-wider text-[11px]">
                Address Field
              </TableHead>
              <TableHead className="px-5 py-3 font-semibold text-zinc-500 uppercase tracking-wider text-[11px]">
                Permanent Address
              </TableHead>
              <TableHead className="px-5 py-3 font-semibold text-zinc-500 uppercase tracking-wider text-[11px]">
                Present Address
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-100">
            {tableData.map((row, idx) => (
              <TableRow
                key={idx}
                className="hover:bg-indigo-50/30 transition-colors"
              >
                <TableCell className="px-5 py-3.5 font-semibold text-zinc-800">
                  {row.field}
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                    {row.permanent}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                    {row.present}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
              placeholder={addressLoading ? "Loading..." : "Select District"}
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
            {...register("permanentVillage")}
            placeholder="e.g. House 12, Road 4"
            className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold tracking-tight text-zinc-700">
            Post Code
          </label>
          <input
            {...register("permanentPostcode")}
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
              placeholder={addressLoading ? "Loading..." : "Select District"}
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
            {...register("presentVillage")}
            placeholder="e.g. Flat 3B, Lake Road"
            className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold tracking-tight text-zinc-700">
            Post Code
          </label>
          <input
            {...register("presentPostcode")}
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
              onSelect={(selectedMess: unknown) => {
                const messObj = selectedMess as OptionItem;
                field.onChange(messObj?.name || selectedMess);
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
              {...register("receiptNo")}
              placeholder="e.g. #9821"
              className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold tracking-tight text-zinc-700 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-emerald-600" /> Service Charge
            </label>
            <input
              {...register("messServiceCharge")}
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

  const permanentZilla = watch("permanentZilla");
  const presentZilla = watch("presentZilla");

  /* Fetch Districts & Upazilas */
  useEffect(() => {
    const fetchAddressData = async () => {
      setAddressLoading(true);
      try {
        const [distRes, upaRes] = await Promise.all([
          axios.get("https://bdaddressapi.vercel.app/api/v1/districts/all"),
          axios.get("https://bdaddressapi.vercel.app/api/v1/sub-districts/all"),
        ]);
        setDistricts(distRes?.data?.data || []);
        setUpazilas(upaRes?.data?.data || []);
      } catch {
        toast.error("Failed to load address data");
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
      {/* Top Saved Summary Overview (Shadcn Table) */}
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

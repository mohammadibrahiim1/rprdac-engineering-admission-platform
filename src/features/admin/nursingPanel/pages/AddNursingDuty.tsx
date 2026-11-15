import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LoaderCircle,
  Calendar,
  Phone,
  Clock,
  Plus,
  X,
  Wallet,
  Loader2,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Building2,
} from "lucide-react";

// Shadcn UI Components
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// API Hooks & Common Components
import {
  useGetallNursingUserQuery,
  usePostNursingAttendanceMutation,
} from "@/redux/features/Nursing/NursingApi";
import { useGetBillingRatesQuery } from "../../controlPanel/services/billingRateApi";
import MessSelector from "@/components/common/MessSelector";

// --- TypeScript Interfaces ---
interface NursingStaff {
  _id: string;
  userName: string;
  phone: string;
}

interface BillingRate {
  category: string;
  hourlyRate: number;
}

interface BillingRecord {
  user: string | { _id?: string };
  rates?: BillingRate[];
}

interface DutyFormValues {
  date: string;
  employeeName: string;
  phone: string;
  nursingId: string;
  userType: string;
  messName: string;
  dutyStartTime: string;
  dutyEndTime: string;
  hourlyRate: number;
  selectedRateCategory: string;
}

interface CalculatedDuty {
  duration: string;
  fee: number;
  seconds: number;
}

interface RootState {
  auth?: {
    user?: {
      name?: string;
      userName?: string;
      fullName?: string;
      role?: string;
    };
  };
}

const getBangladeshDateString = (): string => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return new Intl.DateTimeFormat("en-CA", options).format(new Date());
};

export default function AddNursingDuty() {
  const [search, setSearch] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<NursingStaff | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Logged-in user from Redux store
  const currentUser = useSelector((state: RootState) => state?.auth?.user);
  const loggedInName =
    currentUser?.userName ||
    currentUser?.fullName ||
    currentUser?.name ||
    "Duty Coordinator";
  const loggedInRole = currentUser?.role || "Admin Portal";

  // 1. React Hook Form Setup
  const { register, handleSubmit, setValue, reset, watch } =
    useForm<DutyFormValues>({
      defaultValues: {
        date: getBangladeshDateString(),
        employeeName: "",
        phone: "",
        nursingId: "",
        userType: "nursing",
        messName: "",
        dutyStartTime: "",
        dutyEndTime: "",
        hourlyRate: 0,
        selectedRateCategory: "",
      },
    });

  // 2. Watch Fields
  const startTime = watch("dutyStartTime");
  const endTime = watch("dutyEndTime");
  const currentHourlyRate = watch("hourlyRate");
  const selectedRateCategory = watch("selectedRateCategory");
  const nursingId = watch("nursingId");
  const messName = watch("messName");

  // 3. API Queries & Mutations
  const { data: nursingData, isFetching: isSearchingStaff } =
    useGetallNursingUserQuery({ search });

  const { data: billingResponse, isLoading: isBilling } =
    useGetBillingRatesQuery({ teacherId: nursingId }, { skip: !nursingId });

  const [postNursingData, { isLoading: isSubmitting }] =
    usePostNursingAttendanceMutation();

  // 4. Extract & Normalize Billing Rates
  const ratesList: BillingRate[] = useMemo(() => {
    if (!billingResponse?.data || !nursingId) return [];

    const responseData = billingResponse.data as any;

    const allBillingRecords: BillingRecord[] = Array.isArray(responseData)
      ? responseData
      : responseData?.rates || [];

    const nursingBillingRecord = allBillingRecords.find((item) => {
      const recordUserId =
        typeof item.user === "object" ? item.user?._id : item.user;
      return recordUserId === nursingId;
    });

    return nursingBillingRecord?.rates || [];
  }, [billingResponse, nursingId]);

  useEffect(() => {
    if (ratesList.length > 0) {
      const regularRate =
        ratesList.find((r) => r.category === "regular") || ratesList[0];
      if (regularRate) {
        setValue("hourlyRate", Number(regularRate.hourlyRate || 0));
        setValue("selectedRateCategory", regularRate.category || "");
      }
    } else {
      setValue("hourlyRate", 0);
      setValue("selectedRateCategory", "");
    }
  }, [ratesList, setValue]);

  // 5. Real-time Duration & Fee Calculation
  const calculated: CalculatedDuty = useMemo(() => {
    if (!startTime || !endTime || !currentHourlyRate) {
      return { duration: "00:00:00", fee: 0, seconds: 0 };
    }

    const start = new Date(`1970-01-01T${startTime}:00+06:00`);
    const end = new Date(`1970-01-01T${endTime}:00+06:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { duration: "00:00:00", fee: 0, seconds: 0 };
    }

    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");

    const totalFee = (seconds / 3600) * Number(currentHourlyRate);

    return {
      duration: `${h}:${m}:${s}`,
      fee: Math.round(totalFee),
      seconds,
    };
  }, [startTime, endTime, currentHourlyRate]);

  // 6. Handlers
  const handleRateSelect = (rateObj: BillingRate) => {
    setValue("hourlyRate", Number(rateObj.hourlyRate || 0));
    setValue("selectedRateCategory", rateObj.category || "");
  };

  const handleStaffSelect = (staff: NursingStaff) => {
    setSelectedStaff(staff);
    setValue("nursingId", staff._id);
    setValue("employeeName", staff.userName);
    setValue("phone", staff.phone);
    setValue("hourlyRate", 0);
    setValue("selectedRateCategory", "");
    setSearch(staff.userName);
    setIsDropdownOpen(false);
  };

  const handleClearStaff = () => {
    setSelectedStaff(null);
    setSearch("");
    setValue("nursingId", "");
    setValue("employeeName", "");
    setValue("phone", "");
    setValue("hourlyRate", 0);
    setValue("selectedRateCategory", "");
  };

  const onFormSubmit = async (data: DutyFormValues) => {
    if (!selectedStaff) {
      toast.error("Please select a nursing member");
      return;
    }
    if (!data.hourlyRate || data.hourlyRate <= 0) {
      toast.error("Please select a valid billing rate!");
      return;
    }
    if (calculated.fee <= 0) {
      toast.error("Invalid duty duration");
      return;
    }

    try {
      const payload = {
        date: new Date(data.date).toISOString(),
        nursingId: data.nursingId,
        employeeName: data.employeeName,
        phone: data.phone,
        messName: data.messName,
        dutyStartTime: data.dutyStartTime,
        dutyEndTime: data.dutyEndTime,
        totalDutyTime: String(calculated.seconds),
        totalAmount: calculated.fee,
      };

      await postNursingData(payload).unwrap();
      toast.success("Nursing duty recorded successfully");

      reset({
        date: getBangladeshDateString(),
        dutyStartTime: "",
        dutyEndTime: "",
        employeeName: "",
        phone: "",
        nursingId: "",
        userType: "nursing",
        messName: "",
        hourlyRate: 0,
        selectedRateCategory: "",
      });
      setSelectedStaff(null);
      setSearch("");
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      toast.error(apiError?.data?.message || "Submission failed");
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const categoryBadgeStyles: Record<string, string> = {
    regular: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
    private:
      "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
    examDuty: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-teal-50/30 font-sans text-slate-900">
      {/* Sticky Glassmorphic Top Header */}
      <header className="sticky top-0 z-30 border-b border-sky-100/80 bg-white/75 backdrop-blur-xl">
        <div className="gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto">
            <Breadcrumb />
          </div>

          {/* Logged-In User Pill */}
          <div className="flex shrink-0 items-center gap-3 rounded-full border border-sky-100 bg-gradient-to-r from-sky-50/90 to-teal-50/90 py-1 pl-1.5 pr-3.5 shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-xs font-bold text-white shadow-xs">
              {loggedInName?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-none text-slate-800 capitalize">
                {loggedInName}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-teal-700">
                <ShieldCheck className="h-3 w-3" />
                {loggedInRole}
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-800 sm:hidden capitalize">
              {loggedInName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Page Hero Banner */}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-sky-100/80 bg-gradient-to-r from-white via-sky-50/60 to-teal-50/50 p-6 shadow-xs sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-md shadow-sky-200/60">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Nursing Duty Registry
                </h1>
                <Badge
                  variant="secondary"
                  className="hidden border-sky-200 bg-sky-100/70 text-[10px] font-semibold text-sky-700 sm:inline-flex"
                >
                  Asia/Dhaka (UTC+6)
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Assign nursing shifts, select hourly billing tiers, and record
                verified attendance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-teal-100 bg-white/80 px-3.5 py-2 text-xs font-medium text-slate-600 shadow-2xs sm:self-auto">
            <Sparkles className="h-4 w-4 text-teal-500" />
            <span>Auto-calculates overnight shifts</span>
          </div>
        </div>

        {/* Form Grid */}
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
        >
          {/* LEFT COLUMN: Staff Search & Billing Rate Selector */}
          <div className="space-y-6 lg:col-span-5">
            <Card className="border-sky-100/80 bg-white/90 shadow-sm backdrop-blur-xs overflow-visible">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-base font-semibold text-slate-800">
                  <span>1. Nursing Staff & Rate</span>
                  {selectedStaff && (
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Selected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Search a staff member by name or mobile number to load rates.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Staff Search Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="staff-search"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    Nursing Member
                  </Label>
                  <div ref={containerRef} className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="staff-search"
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Type name or phone..."
                      className="h-10 border-slate-200 bg-slate-50/60 pl-9 pr-9 text-sm transition-colors focus-visible:border-sky-400 focus-visible:bg-white focus-visible:ring-sky-200"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={handleClearStaff}
                        aria-label="Clear search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Search Autocomplete Dropdown */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50 mt-1.5 max-h-40 w-full overflow-auto rounded-xl border border-sky-100 bg-white p-1 shadow-2xl"
                        >
                          {isSearchingStaff ? (
                            <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500">
                              <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                              <span>Searching...</span>
                            </div>
                          ) : nursingData?.data?.length > 0 ? (
                            nursingData.data.map((staff: NursingStaff) => (
                              <button
                                type="button"
                                key={staff._id}
                                onClick={() => handleStaffSelect(staff)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-sky-50/80"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-teal-100 text-xs font-bold text-sky-700">
                                  {staff.userName?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium capitalize text-slate-800">
                                    {staff.userName}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {staff.phone}
                                  </p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="py-6 text-center text-xs text-slate-400">
                              No nursing members found.
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Selected Staff Card */}
                <AnimatePresence>
                  {selectedStaff && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-sky-200/70 bg-gradient-to-r from-sky-50/80 to-teal-50/60 p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-sky-600 shadow-2xs">
                          {selectedStaff.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold capitalize text-slate-900">
                            {selectedStaff.userName}
                          </h4>
                          <p className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="h-3 w-3 text-teal-600" />
                            {selectedStaff.phone}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleClearStaff}
                        className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Separator className="bg-slate-100" />

                {/* Billing Rates Selection Block */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <Wallet className="h-3.5 w-3.5 text-sky-600" />
                      Billing Rate Tier
                    </Label>
                    {currentHourlyRate > 0 && (
                      <span className="text-xs font-semibold text-teal-600">
                        ৳{currentHourlyRate}/hr active
                      </span>
                    )}
                  </div>

                  {!nursingId ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
                      <p className="text-xs text-slate-500">
                        Select a nursing member above to view assigned hourly
                        rates.
                      </p>
                    </div>
                  ) : isBilling ? (
                    <div className="flex items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-8">
                      <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
                    </div>
                  ) : ratesList.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase text-slate-500">
                          <tr>
                            <th className="w-10 px-3.5 py-2.5"></th>
                            <th className="px-3.5 py-2.5">Category</th>
                            <th className="px-3.5 py-2.5 text-right">
                              Rate / Hr
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ratesList.map((rate, idx) => {
                            const isSelected =
                              selectedRateCategory === rate.category;
                            return (
                              <tr
                                key={`${rate.category}-${idx}`}
                                onClick={() => handleRateSelect(rate)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-sky-50/80"
                                    : "hover:bg-slate-50/80"
                                }`}
                              >
                                <td className="px-3.5 py-3">
                                  <input
                                    type="radio"
                                    name="nursingRateSelect"
                                    checked={isSelected}
                                    onChange={() => handleRateSelect(rate)}
                                    className="h-4 w-4 cursor-pointer accent-sky-600"
                                  />
                                </td>
                                <td className="px-3.5 py-3">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] font-bold uppercase ${
                                      categoryBadgeStyles[rate.category] ||
                                      "border-slate-200 bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {rate.category}
                                  </Badge>
                                </td>
                                <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-800">
                                  {Number(rate.hourlyRate || 0).toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "BDT",
                                    },
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-5 text-center text-xs text-amber-800">
                      No billing rates configured for this nursing member.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Schedule Details, Lightweight Gradient Summary & Submit */}
          <div className="space-y-6 lg:col-span-7">
            <Card className="border-sky-100/80 bg-white/90 shadow-sm backdrop-blur-xs overflow-visible">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-slate-800">
                  2. Shift Schedule & Location
                </CardTitle>
                <CardDescription className="text-xs">
                  Specify the duty date, assigned mess/unit, and exact shift
                  window.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Date & Mess Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="duty-date"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Duty Date
                    </Label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="duty-date"
                        type="date"
                        {...register("date")}
                        className="h-10 border-slate-200 bg-slate-50/60 pl-9 text-sm focus-visible:border-sky-400 focus-visible:bg-white focus-visible:ring-sky-200"
                      />
                    </div>
                  </div>

                  <div>
                    <MessSelector
                      labelBase="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block"
                      inputBase="w-full h-10 pl-10 pr-4 bg-slate-50/60 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-sky-400 transition-all text-sm"
                      value={messName}
                      onSelect={(mess: { name?: string } | null) =>
                        setValue("messName", mess?.name || "")
                      }
                    />
                  </div>
                </div>

                {/* Start & End Time Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="start-time"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Start Time
                    </Label>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="start-time"
                        type="time"
                        {...register("dutyStartTime")}
                        className="h-10 border-slate-200 bg-slate-50/60 pl-9 text-sm focus-visible:border-sky-400 focus-visible:bg-white focus-visible:ring-sky-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="end-time"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      End Time
                    </Label>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="end-time"
                        type="time"
                        {...register("dutyEndTime")}
                        className="h-10 border-slate-200 bg-slate-50/60 pl-9 text-sm focus-visible:border-sky-400 focus-visible:bg-white focus-visible:ring-sky-200"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lightweight Pastel Gradient Live Billing Summary Card */}
            <Card className="relative overflow-hidden border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-teal-50/90 shadow-sm">
              <div className="pointer-events-none absolute -right-6 -top-6 opacity-[0.06] text-sky-700">
                <Wallet className="h-44 w-44" />
              </div>

              <CardContent className="relative z-10 p-6 sm:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[2.5px] text-slate-500">
                    Live Billing Summary
                  </span>
                  <Badge className="border border-teal-200 bg-teal-50/90 text-[10px] font-semibold text-teal-700 hover:bg-teal-50">
                    BD TIMEZONE SYNCED
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:items-end">
                  <div className="rounded-xl border border-sky-100 bg-white/80 p-4 shadow-2xs">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Total Duration
                    </p>
                    <p className="font-mono text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
                      {calculated.duration}
                    </p>
                  </div>

                  <div className="rounded-xl border border-teal-100 bg-gradient-to-r from-sky-500/10 to-teal-500/10 p-4 sm:text-right">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-teal-700">
                      Net Payable Fee
                    </p>
                    <p className="bg-gradient-to-r from-sky-700 to-teal-600 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
                      {calculated.fee.toLocaleString("en-US", {
                        style: "currency",
                        currency: "BDT",
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-sky-100 pt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Building2 className="h-3.5 w-3.5 text-sky-600" />
                    Applied Rate:{" "}
                    <strong className="text-sky-700">
                      ৳{currentHourlyRate}/hr
                    </strong>
                    {selectedRateCategory && (
                      <span className="capitalize text-slate-400">
                        ({selectedRateCategory})
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Rounded to nearest BDT
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Primary Submit Action */}
            <Button
              type="submit"
              disabled={isSubmitting || !selectedStaff || calculated.fee <= 0}
              className="h-13 w-full rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-base font-semibold text-white shadow-md shadow-sky-200/70 transition-all hover:from-sky-700 hover:to-teal-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  Recording Duty...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Confirm & Submit Nursing Duty
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

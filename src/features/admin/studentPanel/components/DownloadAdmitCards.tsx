import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  ReactElement,
} from "react";
import { useReactToPrint } from "react-to-print";
import {
  Printer,
  Search,
  Filter,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Users,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

import logo from "../../../../../assets/img/log-rpr.png";
import signature from "../../../../../assets/img/rpr-director-sign.png";

// Hook Import
import useStudentManager from "../hooks/useStudentManager";

const SERVER: string = import.meta.env.VITE_SERVER_BASE_URL || "";

// ─── Interfaces ───
export interface StudentRecord {
  _id?: string;
  studentId?: string;
  name?: string;
  department?: string;
  batch?: string;
  phone?: string;
  paymentStatus?: string;
  studentPhoto?: string;
  [key: string]: unknown;
}

export interface BatchItem {
  _id?: string;
  title?: string;
  [key: string]: unknown;
}

/**************** Utility: Chunk Helper ****************/
const chunk = <T,>(arr: T[] = [], size: number = 8): T[][] => {
  if (!Array.isArray(arr)) return [];
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
};

export default function AdmitCardRegistryPage(): ReactElement {
  const printRef = useRef<HTMLDivElement | null>(null);

  // ─── Local State for Manual Multi-Card Selection ───
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  // ─── Destructuring from useStudentManager Hook ───
  const {
    students,
    meta,
    filteredBatches,
    isLoading,
    isFetching,
    currentPage,
    setCurrentPage,
    limit,
    searchTerm,
    setSearchTerm,
    selectedBatch,
    hasActiveFilters,
    handleBatchSelect,
    handleClearBatch,
    handleClearAll,
    handleLimitChange,
    refetch,
  } = useStudentManager({ initialLimit: "all" }) as {
    students: StudentRecord[];
    meta: { page?: number; totalPages?: number; totalItems?: number };
    filteredBatches: BatchItem[];
    isLoading: boolean;
    isFetching: boolean;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    limit: number | string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedBatch: string;
    hasActiveFilters: boolean;
    handleBatchSelect: (batch: string) => void;
    handleClearBatch: () => void;
    handleClearAll: () => void;
    handleLimitChange: (lim: number | string) => void;
    refetch: () => void;
  };

  useEffect(() => {
    handleLimitChange("all");
  }, [handleLimitChange]);

  // ─── Filter Paid Students Only ───
  const paidStudents: StudentRecord[] = useMemo(() => {
    return students.filter((stu) => {
      const isPaid = stu.paymentStatus === "paid";
      return isPaid;
    });
  }, [students]);

  // ─── Target Cards for Printing ───
  const printList: StudentRecord[] = useMemo(() => {
    if (selectedCardIds.length === 0) return paidStudents;
    return paidStudents.filter((stu) =>
      selectedCardIds.includes(stu._id || stu.studentId || ""),
    );
  }, [paidStudents, selectedCardIds]);

  // ─── Chunking for Screen and Print Separately ───
  const screenPages: StudentRecord[][] = useMemo(
    () => chunk(paidStudents, 8),
    [paidStudents],
  );

  const printPages: StudentRecord[][] = useMemo(
    () => chunk(printList, 8),
    [printList],
  );

  // ─── React-To-Print Integration ───
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `RPR_Green_Cards_Page_${currentPage}_${new Date().toISOString().slice(0, 8)}`,
  });

  const triggerPrint = (): void => {
    if (!printRef.current || printList.length === 0) {
      alert("প্রিন্ট করার মতো কোনো পেইড স্টুডেন্টের কার্ড পাওয়া যায়নি!");
      return;
    }
    handlePrint();
  };

  // ─── Card Selection Handlers ───
  const handleToggleSelectAllCards = (): void => {
    const currentPaidIds = paidStudents.map((s) => s?._id || s.studentId || "");
    const isAllCurrentSelected = currentPaidIds.every((id) =>
      selectedCardIds.includes(id),
    );
    if (isAllCurrentSelected) {
      setSelectedCardIds((prev) =>
        prev.filter((id) => !currentPaidIds.includes(id)),
      );
    } else {
      setSelectedCardIds((prev) =>
        Array.from(new Set([...prev, ...currentPaidIds])),
      );
    }
  };

  const toggleSelectCard = useCallback((id: string): void => {
    if (!id) return;
    setSelectedCardIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const onClearFilters = (): void => {
    handleClearAll();
    setSelectedCardIds([]);
  };

  const currentDateTime: string = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="min-h-screen font-sans text-slate-800 selection:bg-indigo-500 selection:text-white">
      {/* ─── Control Header Bar (Hidden on Print) ─── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                Student Green Card Registry
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Paid students registry • Pixel Perfect A4 Print Matrix (8 Cards
                / Page)
              </p>
            </div>

            {/* Actions: Refresh & Print */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refetch}
                title="Refresh Data"
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-all cursor-pointer"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isFetching ? "animate-spin text-emerald-600" : ""}`}
                />
              </button>

              <button
                type="button"
                onClick={triggerPrint}
                disabled={printList?.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm uppercase tracking-wider rounded-md shadow-lg shadow-emerald-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>
                  Print{" "}
                  {selectedCardIds?.length > 0
                    ? `Selected (${selectedCardIds?.length})`
                    : `All Paid (${printList?.length})`}
                </span>
              </button>
            </div>
          </div>

          {/* ─── Filters Bar ─── */}
          <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              {/* Search */}
              <div className="sm:col-span-4 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Name, ID, Mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Batch */}
              <div className="sm:col-span-3 relative">
                <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedBatch}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) handleClearBatch();
                    else handleBatchSelect(val);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="">All Batches</option>
                  {filteredBatches?.map((b) => (
                    <option key={b._id || b.title} value={b.title}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Limit */}
              <div className="sm:col-span-2">
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value={8}>8 cards</option>
                  <option value={16}>16 cards</option>
                  <option value={24}>24 cards</option>
                  <option value={32}>32 cards</option>
                  <option value={40}>40 cards</option>
                  <option value={"all"}>All cards</option>
                </select>
              </div>

              {/* Select All Cards Toggle */}
              <div className="sm:col-span-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelectAllCards}
                  disabled={paidStudents.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {selectedCardIds?.length === paidStudents?.length &&
                  paidStudents?.length > 0 ? (
                    <>
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                      <span>Deselect</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 text-slate-400" />
                      <span>Select cards ({paidStudents?.length})</span>
                    </>
                  )}
                </button>

                {(hasActiveFilters || selectedCardIds.length > 0) && (
                  <button
                    type="button"
                    onClick={onClearFilters}
                    title="Clear All Filters & Selection"
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-md text-sm font-bold flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-md text-sm">
              <div className="flex items-center gap-2 font-medium text-slate-600">
                <span>
                  Page <strong>{meta.page || currentPage}</strong> of{" "}
                  <strong>{meta.totalPages || 1}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Total Items: <strong>{meta.totalItems || 0}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || isFetching}
                  onClick={() =>
                    setCurrentPage((prev: number) => Math.max(prev - 1, 1))
                  }
                  className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <button
                  type="button"
                  disabled={currentPage >= (meta.totalPages || 1) || isFetching}
                  onClick={() => setCurrentPage((prev: number) => prev + 1)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Cards Display Area ─── */}
      <div className="max-w-7xl mx-auto p-4 sm:p-8 print:p-0">
        <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm font-semibold text-slate-500 print:hidden">
          <div className="flex items-center gap-2">
            {isFetching && (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            )}
            <span>Showing {paidStudents.length} paid cards on this page</span>
          </div>
          {selectedCardIds?.length > 0 && (
            <span className="text-emerald-600 font-bold">
              {selectedCardIds.length} cards selected manually
            </span>
          )}
        </div>

        {/* SCREEN DISPLAY */}
        <div className="flex flex-col gap-10 items-center w-full print:hidden">
          {isLoading ? (
            <div className="py-20 text-center w-full max-w-md my-10">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600">Please wait...</p>
            </div>
          ) : screenPages.length > 0 ? (
            screenPages.map((grp, idx) => (
              <A4Page key={idx}>
                <div className="grid grid-cols-2 content-start gap-[3mm] h-full w-full box-border">
                  {grp?.map((stu) => {
                    const stId = stu._id || stu.studentId || "";
                    const isChecked = selectedCardIds.includes(stId);

                    return (
                      <div key={stId} className="relative group h-full w-full">
                        {/* Checkbox Overlay */}
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                          <button
                            type="button"
                            onClick={() => toggleSelectCard(stId)}
                            className="text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>

                        {/* Card UI */}
                        <div
                          className={`${
                            selectedCardIds.length > 0 && !isChecked
                              ? "opacity-40 grayscale"
                              : ""
                          } transition-all h-full w-full`}
                        >
                          <AdmitCard student={stu} />
                        </div>
                      </div>
                    );
                  })}

                  {/* Filler Cards */}
                  {Array.from({ length: 8 - grp.length }).map((_, i) => (
                    <div
                      key={i}
                      className="border border-dashed border-slate-200 rounded-md bg-slate-50/50"
                    />
                  ))}
                </div>
              </A4Page>
            ))
          ) : (
            <div className="py-20 text-center w-full max-w-2xl my-10 shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                No Paid Cards Found
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Try clearing filters or changing batch.
              </p>
            </div>
          )}
        </div>

        {/* DEDICATED PRINT CONTAINER */}
        <div className="hidden print:block">
          <div ref={printRef} className="flex flex-col items-center w-full">
            {printPages.map((grp, idx) => (
              <A4Page key={idx}>
                <div className="grid grid-cols-2 content-start gap-[3mm] h-full w-full box-border">
                  {grp?.map((stu) => {
                    const stId = stu._id || stu.studentId || "";
                    return (
                      <div key={stId} className="h-full w-full">
                        <AdmitCard student={stu} />
                      </div>
                    );
                  })}
                </div>

                {/* Print Footer Metadata */}
                <div className="hidden print:flex justify-between items-center text-[8.5px] text-neutral-400 font-semibold font-sans-print w-full border-t border-dashed border-neutral-300 pt-1 mt-1 absolute bottom-[3mm] left-0 px-[6mm] box-border">
                  <span>RPR DUET Admission Care</span>
                  <span>Printed: {currentDateTime}</span>
                  <span className="font-bold text-neutral-600">
                    Page {idx + 1} of {printPages.length}
                  </span>
                </div>
              </A4Page>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Print Engine CSS ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@500;600;700&family=Inter:wght@500;600;700;800;900&display=swap');

        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }
          html, body {
            background-color: #ffffff !important;
            margin: 0mm !important;
            padding: 0mm !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .a4-page-break {
            page-break-after: always !important;
            page-break-inside: avoid !important;
            break-after: page !important;
          }

          .font-sans-print { font-family: 'Inter', sans-serif !important; }
          .font-sans-print { font-family: 'Hind Siliguri', 'Nikosh', 'Kalpurush', sans-serif !important; }

          .force-gradient {
            background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .force-bg-green {
            background-color: #059669 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .force-bg-dark {
            background-color: #064e3b !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        .font-sans-print { font-family: 'Inter', sans-serif; }
        .font-sans-print { font-family: 'Hind Siliguri', sans-serif; }
        .force-gradient { background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%); }
        .force-bg-green { background-color: #059669; }
        .force-bg-dark { background-color: #064e3b; }
      `}</style>
    </div>
  );
}

/**************** A4 PAGE CONTAINER ****************/
interface A4PageProps {
  children: React.ReactNode;
}

const A4Page: React.FC<A4PageProps> = ({ children }) => (
  <div
    className="a4-page-break relative flex flex-col justify-between shadow-xl border border-slate-200 bg-white print:shadow-none print:border-none p-[6mm] pb-[8mm] box-border my-4 print:my-0"
    style={{
      width: "210mm",
      height: "297mm",
      boxSizing: "border-box",
    }}
  >
    {children}
  </div>
);

/**************** PIXEL PERFECT ADMIT CARD ITEM ****************/
interface AdmitCardProps {
  student: StudentRecord;
}

const AdmitCard: React.FC<AdmitCardProps> = ({ student }) => {
  return (
    <div className="force-gradient flex flex-col justify-between border-[1.5px] border-emerald-600 rounded-md overflow-hidden p-3 relative shadow-xs print:shadow-none font-sans-print h-full w-full box-border bg-white">
      {/* 1. Header Area */}
      <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200">
        <div className="flex items-center gap-1.5">
          <img
            src={logo}
            alt="rpr logo"
            className="object-contain h-8 w-8 shrink-0"
          />
          <div className="flex leading-none">
            <span className="text-[14px] uppercase font-black tracking-tight text-emerald-800">
              RPR DUET ADMISSION CARE
            </span>
          </div>
        </div>

        <span className="force-bg-green px-2 py-0.5 text-[12px] font-black tracking-wider text-white rounded">
          GREEN CARD
        </span>
      </div>

      {/* 2. Middle Identity Section */}
      <div className="grid grid-cols-12 gap-2 items-center my-auto py-1">
        <div className="col-span-8 space-y-1.5">
          {/* Student Name */}
          <div className="flex flex-col">
            <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-700">
              STUDENT NAME
            </span>
            <span className="text-[12px] font-extrabold text-slate-900 capitalize truncate border-b border-slate-300 pb-0.5">
              {student?.name || "—"}
            </span>
          </div>

          {/* Department & ID */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-700">
                DEPARTMENT
              </span>
              <span className="text-[11px] font-extrabold text-slate-900 uppercase truncate border-b border-slate-300 pb-0.5">
                {student?.department || "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-700">
                STUDENT ID
              </span>
              <span className="text-[11px] font-extrabold text-slate-900 truncate border-b border-slate-300 pb-0.5">
                {student?.studentId || "—"}
              </span>
            </div>
          </div>

          {/* Batch & Mobile */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-700">
                BATCH
              </span>
              <span className="text-[11px] font-extrabold text-slate-900 truncate border-b border-slate-300 pb-0.5">
                {student?.batch || "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-700">
                MOBILE NO
              </span>
              <span className="text-[11px] font-extrabold text-slate-900 truncate border-b border-slate-300 pb-0.5">
                {student?.phone || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Photo Box */}
        <div className="flex justify-end col-span-4">
          <div className="w-[78px] h-[90px] border-2 border-emerald-600 rounded bg-white p-0.5 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
            {student?.studentPhoto ? (
              <img
                src={`${SERVER}${student?.studentPhoto}`}
                alt={student?.name || "Student Photo"}
                className="object-cover w-full h-full rounded-xs"
              />
            ) : (
              <span className="text-[9px] text-slate-400 font-extrabold tracking-wider">
                PHOTO
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Footer Area */}
      <div className="grid items-end grid-cols-12 gap-2 pt-1 border-t border-emerald-200">
        <div className="col-span-9 p-1 text-center rounded select-none force-bg-dark font-sans-print">
          <p className="text-[12px] font-normal leading-snug text-white">
            একজনের গ্রীন কার্ড দিয়ে অন্যজন পরীক্ষায় অংশগ্রহণ করতে পারবে না।
          </p>
          <p className="text-[11px] font-medium tracking-wide font-sans text-emerald-200 mt-0.5">
            Call or WhatsApp: +880 1742-590128
          </p>
        </div>

        <div className="relative flex flex-col items-center justify-end col-span-3 bottom-0.5">
          {signature && (
            <img
              src={signature}
              alt="Director_Sign"
              className="absolute z-10 object-contain w-16 h-auto pointer-events-none select-none bottom-2.5"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          )}
          <div className="w-full text-center border-t border-emerald-700 text-[8px] font-black text-emerald-800 whitespace-nowrap uppercase tracking-tighter pt-0.5">
            DIRECTOR SIGN
          </div>
        </div>
      </div>
    </div>
  );
};

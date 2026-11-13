import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  IdCard,
  Receipt,
  Building2,
  Calendar,
} from "lucide-react";

interface Props {
  student: any;
}

export const EditStudentHeader = ({ student }: Props) => {
  const photoUrl = student?.studentPhoto
    ? `${import.meta.env.VITE_SERVER_BASE_URL}${student.studentPhoto}`
    : null;

  return (
    <div className="capitalize font-sans">
      {/* Top bar */}
      <div className="px-5 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/admin/student/all"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Student Registry
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium border border-sky-100">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Editing Mode Active • Last modified 14 mins ago by Pobitra Kumar
          </span>
        </div>
      </div>

      {/* Student summary */}
      <div className="px-4 sm:px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 border-white shadow-md bg-slate-100 shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={student?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xl font-bold">
                  {student?.name?.[0]?.toUpperCase() || "S"}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {student.name || "—"}
                </h1>
                {student?.nameInBangla && (
                  <span className="text-slate-500 text-lg font-serifbn">
                    | {student?.nameInBangla}
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Admission Confirmed
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <IdCard className="w-3.5 h-3.5" />
                  ID: {student.studentId || "—"}
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Receipt className="w-3.5 h-3.5" />
                  Receipt: {student.receiptNo || "—"}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {student.department || "—"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Session {student.session || "—"} ({student.batch || "—"})
                </span>
              </div>
            </div>
          </div>

          {/* Right stats */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-md bg-sky-50 border border-sky-100 min-w-[120px]">
              <p className="text-[11px] font-semibold text-sky-600 uppercase tracking-wide">
                Attendance
              </p>
              <p className="text-xl font-bold text-sky-700 mt-0.5">96.4%</p>
              <p className="text-[11px] text-sky-600/80">52 of 54 lectures</p>
            </div>
            <div className="px-4 py-3 rounded-md bg-emerald-50 border border-emerald-100 min-w-[120px]">
              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">
                Fee Clearance
              </p>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">
                ৳{(student.studentPaid || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-600/80">
                100% Fully Cleared
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

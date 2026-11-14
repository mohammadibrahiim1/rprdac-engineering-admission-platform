import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Edit3,
  FileText,
  Loader2,
  Trash2,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Student } from "../../types/allStudents.types";

const SERVER = import.meta.env.VITE_SERVER_BASE_URL || "";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  selectedIds: string[];
  onSelectId: (id: string) => void;
  onSelectAll: () => void;
  onDelete?: (ids: string[]) => void;
  isDeleting: boolean;
  currentPage: number;
  totalPages: number;
  limit: number | string;
  setCurrentPage: (p: number | ((prev: number) => number)) => void;
  onLimitChange: (v: string) => void;
  meta: { totalItems: number };
}

const Avatar = ({ src, name }: { src?: string; name?: string }) => {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "??";

  return (
    <div className="relative w-9 h-9 flex-shrink-0">
      {src ? (
        <img
          src={`${SERVER}${src}`}
          alt={name}
          className="w-full h-full rounded-full object-cover ring-2 ring-white shadow-sm"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling?.classList.remove("hidden");
          }}
        />
      ) : null}
      <div
        className={`absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-slate-100 text-indigo-700 text-xs font-bold ring-2 ring-white ${
          src ? "hidden" : ""
        }`}
      >
        {initials}
      </div>
    </div>
  );
};

type FeeBadgeProps = {
  paymentStatus?: string;
  dueAmount?: number;
  admissionFeeDue?: number;
  updatedDueAmount?: number;
};

const FeeBadge = ({
  paymentStatus,
  dueAmount,
  admissionFeeDue,
  updatedDueAmount,
}: FeeBadgeProps) => {
  const status = paymentStatus?.toLowerCase();
  const due = updatedDueAmount ?? dueAmount ?? admissionFeeDue ?? 0;

  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Fully Cleared
      </span>
    );
  }

  if (due > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Due ৳{due.toLocaleString("en-BD")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Pending
    </span>
  );
};

const DeptBadge = ({ dept }: { dept?: string }) => {
  if (!dept) return <span className="text-slate-400">—</span>;
  const colors: Record<string, string> = {
    CSE: "bg-violet-50 text-violet-700 border-violet-200",
    EEE: "bg-sky-50 text-sky-700 border-sky-200",
    ME: "bg-amber-50 text-amber-700 border-amber-200",
    CE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  const key =
    Object.keys(colors).find((k) => dept.toUpperCase().includes(k)) ||
    "default";
  const cls = colors[key] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cls}`}
    >
      {dept}
    </span>
  );
};

export default function StudentTable({
  students,
  isLoading,
  isFetching,
  error,
  selectedIds,
  onSelectId,
  onSelectAll,
  onDelete,
  isDeleting,
  currentPage,
  totalPages,
  setCurrentPage,
  meta,
  limit,
  onLimitChange,
}: StudentTableProps) {
  const allSelected =
    students.length > 0 && selectedIds.length === students.length;

  if (isLoading || isFetching) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500">Please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-rose-600">
        <AlertCircle className="w-10 h-10" />
        <p className="font-semibold">Failed to load data</p>
        <p className="text-sm text-rose-500/80">
          {error?.data?.message || "Please try again"}
        </p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
          <Users className="w-7 h-7 text-slate-400" />
        </div>
        <p className="font-semibold text-slate-700">No students found</p>
        <p className="text-sm text-slate-500">Try adjusting your filters</p>
      </div>
    );
  }

  const page = Number(currentPage) || 1;
  const perPage = typeof limit === "number" ? limit : Number(limit) || 10;
  const totalItems = Number(meta?.totalItems) || 0;
  const totalPagesSafe = Number(totalPages) || 1;

  const startItem = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, totalItems);

  return (
    <div className="w-full">
      {/* Shadcn UI Table Container */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full caption-bottom text-sm text-left">
          <thead className="[&_tr]:border-b bg-slate-50/70 border-b border-slate-200">
            <tr className="border-b transition-colors">
              <th className="h-12 px-4 align-middle font-medium text-slate-500 w-[40px]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                />
              </th>
              <th className="h-12 px-4 align-middle text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                STUDENT PROFILE
              </th>
              <th className="h-12 px-4 align-middle text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                ROLL / REGISTRY ID
              </th>
              <th className="h-12 px-4 align-middle text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                SESSION & BATCH
              </th>
              <th className="h-12 px-4 align-middle text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                DEPARTMENT
              </th>
              <th className="h-12 px-4 align-middle text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                CONTACT & GUARDIAN
              </th>
              <th className="h-12 px-4 align-middle text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Payment Status
              </th>
              <th className="h-12 px-4 align-middle text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Status
              </th>
              <th className="h-12 px-4 align-middle text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                QUICK ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white [&_tr:last-child]:border-0">
            <AnimatePresence mode="popLayout">
              {students.map((student, i) => {
                const isSelected = selectedIds.includes(student._id);
                const admissionStatus = student.admissionStatus?.toLowerCase();

                const statusStyles: Record<string, string> = {
                  pending: "bg-amber-100 text-amber-700 border-amber-200",
                  approved:
                    "bg-emerald-100 text-emerald-700 border-emerald-200",
                  rejected: "bg-red-100 text-red-700 border-red-200",
                };

                return (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.15,
                      delay: Math.min(i * 0.02, 0.15),
                    }}
                    className={`border-b transition-colors hover:bg-slate-50/70 ${
                      isSelected ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-4 align-middle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectId(student._id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                    </td>

                    {/* Student Profile */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <Avatar
                          src={student.studentPhoto}
                          name={student.name}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate capitalize">
                            {student.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {student.instituteName || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Roll / Registry ID */}
                    <td className="p-4 align-middle">
                      <div className="text-sm">
                        <p className="font-medium text-slate-800">
                          {student.studentId || student.rollNo || "—"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {student.registryId || ""}
                        </p>
                      </div>
                    </td>

                    {/* Session & Batch */}
                    <td className="p-4 align-middle">
                      <div className="text-sm">
                        <p className="font-medium text-slate-800">
                          {student.session || "—"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {student.batch || "—"}
                        </p>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-4 align-middle">
                      <DeptBadge dept={student.department} />
                    </td>

                    {/* Contact & Guardian */}
                    <td className="p-4 align-middle">
                      <div className="text-sm min-w-[140px]">
                        <p className="font-medium text-slate-800">
                          {student.phone || student.mobile || "—"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {student.fatherName ||
                          student.guardianName ||
                          student.motherName
                            ? `F: ${
                                student.fatherName ||
                                student.guardianName ||
                                student.motherName
                              }`
                            : "—"}
                        </p>
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="p-4 align-middle">
                      <FeeBadge
                        paymentStatus={student.paymentStatus}
                        dueAmount={student.dueAmount}
                        admissionFeeDue={student.admissionFeeDue}
                        updatedDueAmount={student.updatedDueAmount}
                      />
                    </td>

                    {/* Admission Status */}
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium capitalize ${
                          statusStyles[admissionStatus || ""] ||
                          "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {student.admissionStatus || "—"}
                      </span>
                    </td>

                    {/* Quick Actions */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/dashboard/student/details/${student._id}`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/dashboard/admin/edit/student/${student._id}`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete([student._id])}
                            disabled={isDeleting}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition-colors"
                          title="More actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {!isLoading && !error && students.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <span>
              Showing {startItem}–{endItem} of {totalItems.toLocaleString()}
            </span>

            <select
              value={limit}
              onChange={(e) => onLimitChange(e.target.value)}
              className="border border-slate-200 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
              <option value="all">View All</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, Number(p) - 1))}
              className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              Prev
            </button>

            <span className="px-3 py-1.5 text-xs font-medium text-slate-600">
              Page {page} of {totalPagesSafe}
            </span>

            <button
              type="button"
              disabled={page >= totalPagesSafe}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPagesSafe, Number(p) + 1))
              }
              className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

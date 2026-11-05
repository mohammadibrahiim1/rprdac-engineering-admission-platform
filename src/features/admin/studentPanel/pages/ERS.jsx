import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  GraduationCap,
  X,
  ChevronRight,
  Receipt,
  Clock,
  XCircle,
  Loader2,
  Phone,
  BookOpen,
  Shield,
  Hash,
  User,
  ArrowLeft,
  FileText,
  CreditCard,
  Building2,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import useStudentManager from '../hooks/useStudentManager';
import { StudentBillingContainer } from '../components/Financial/StudentBillingContainer';
import InfoEditorCard from '../components/Financial/InfoEditorCard';
import PaymentHistory from '../components/PaymentHistory';
import { Link } from 'react-router-dom';

// ─── CONSTANTS ─────────────────────────────────────────────────────
const SERVER = import.meta.env.VITE_SERVER_BASE_URL || '';

const STATUS_CONFIG = {
  approved: {
    icon: Receipt,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Approved',
  },
  active: {
    icon: Receipt,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
    label: 'Active',
  },
  pending: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  draft: {
    icon: Receipt,
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    label: 'Draft',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    label: 'Rejected',
  },
  dropped: {
    icon: XCircle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    label: 'Dropped',
  },
  graduated: {
    icon: GraduationCap,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
    label: 'Graduated',
  },
};

// ─── FORMATTERS ────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', {
    currency: 'BDT',
    style: 'currency',
  });

const fmtBDT = (n) => `${fmt(n)}`;

// ─── STATUS PILL ──────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── STUDENT DETAIL VIEW ──────────────────────────────────────────
function StudentDetail({
  student,
  onUpdateSuccess,
  currentUser,
  sessionOptions,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Profile Header */}
      <div className="overflow-hidden bg-white border rounded shadow-sm border-slate-100 px-4">
        <div className="relative h-24 bg-gradient-to-r from-slate-800 via-slate-700 to-indigo-900 rounded-md">
          <div
            className="absolute inset-0 opacity-[0.07] "
            style={{
              backgroundImage:
                'radial-gradient(circle at 20px 20px, white 1.5px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded w-7 h-7 bg-white/15">
                <GraduationCap size={14} className="text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">
                Student Profile
              </span>
            </div>
            {currentUser && (
              <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1">
                <User size={10} className="text-white/70" />
                <span className="text-[11px] text-white/80 font-medium">
                  {currentUser}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="relative px-6 pb-5 -mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative flex-shrink-0">
              {student?.studentPhoto && student?.studentPhoto !== 'n/a' ? (
                <img
                  src={`${SERVER}${student?.studentPhoto}`}
                  alt={student?.name}
                  className="object-cover w-20 h-20 rounded shadow-xl ring-4 ring-white"
                />
              ) : (
                <div className="flex items-center justify-center w-20 h-20 text-2xl font-black text-white rounded shadow-xl bg-gradient-to-br from-slate-700 to-indigo-900 ring-4 ring-white">
                  {student.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                  STATUS_CONFIG[student?.admissionStatus?.toLowerCase()]?.dot ||
                  'bg-slate-400'
                }`}
              />
            </div>
            <div className="flex-1 pt-2">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h2 className="text-lg font-bold text-white capitalize">
                  {student.name || '—'}
                </h2>
                <StatusPill status={student?.admissionStatus} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {student?.studentId && (
                  <span className="flex items-center gap-1 px-2 bg-cyan-500 rounded font-sans font-medium text-white">
                    <Hash size={9} /> {student.studentId}
                  </span>
                )}
                {student.phone && (
                  <span className="flex items-center gap-1 px-2  bg-purple-500 rounded font-medium text-white">
                    <Phone size={9} /> {student.phone}
                  </span>
                )}
                {student.batch && (
                  <span className="flex items-center gap-1 px-2  bg-emerald-600 rounded font-medium text-white capitalize">
                    <BookOpen size={9} /> Batch : {student.batch}
                  </span>
                )}
                <span className="px-4 py-3 text-center">
                  <Link
                    to={`/dashboard/student/details/${student?._id}`}
                    className="hover:text-white flex items-center gap-1 px-2 py-0.5 bg-rose-600 rounded font-medium text-white capitalize"
                  >
                    <FileText className="w-4 h-4 mx-auto" /> admission Form
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid items-start grid-cols-1 gap-5 xl:grid-cols-3 px-5">
        <InfoEditorCard
          student={student}
          onUpdateSuccess={onUpdateSuccess}
          sessionOptions={sessionOptions}
        />
        <div className="space-y-5 xl:col-span-2">
          <StudentBillingContainer studentId={student?._id} />
          <PaymentHistory />

          {/* Audit Trail */}
          {student?.audit && (
            <div className="overflow-hidden bg-white border rounded shadow-sm border-slate-100">
              <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50/80 border-b border-slate-100">
                <Shield size={13} className="text-violet-500" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                  Audit Trail
                </span>
              </div>
              {[
                {
                  label: 'Submitted By',
                  value: student.audit.submittedBy?.name,
                },
                { label: 'Approved By', value: student.audit.approvedBy?.name },
                {
                  label: 'Last Updated By',
                  value: student.audit.lastUpdatedBy?.name,
                },
                {
                  label: 'Last Updated At',
                  value: student.audit.lastUpdatedAt
                    ? new Date(student.audit.lastUpdatedAt).toLocaleString(
                        'en-BD',
                      )
                    : null,
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0"
                >
                  <span className="w-36 text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex-shrink-0">
                    {r.label}
                  </span>
                  <span className="text-xs text-slate-700">
                    {r.value || '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── STUDENT SEARCH CARD ──────────────────────────────────────────
function StudentCard({ s, index, onClick }) {
  const cfg =
    STATUS_CONFIG[
      s.admissionStatus?.toLowerCase() || s.status?.toLowerCase()
    ] || STATUS_CONFIG.pending;
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className="flex items-center w-full gap-4 px-4 py-3.5 text-left bg-white border border-slate-100 rounded hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/60 group transition-all"
    >
      <div className="relative flex-shrink-0">
        {s.studentPhoto && s.studentPhoto !== 'n/a' ? (
          <img
            src={`${SERVER}${s.studentPhoto}`}
            alt={s.name}
            className="object-cover w-10 h-10 rounded-md ring-1 ring-slate-200"
          />
        ) : (
          <div className="flex items-center justify-center w-10 h-10 font-bold capitalize text-slate-500 bg-gradient-to-br from-slate-100 to-slate-200 rounded-md">
            {s.name?.[0] || '?'}
          </div>
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${cfg.dot}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold capitalize text-slate-900">
          {s.name}
        </p>
        <p className="text-[11px] text-slate-400 font-sans truncate">
          {s.studentId}
          {s.phone && ` · ${s.phone}`}
          {s.batch && ` · Batch ${s.batch}`}
        </p>
      </div>
      <div className="flex items-center flex-shrink-0 gap-2">
        <StatusPill status={s.admissionStatus || s.status} />
        {(s.dueAmount || 0) > 0 && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 font-sans font-bold">
            Due {fmtBDT(s.dueAmount)}
          </span>
        )}
        <div className="flex items-center justify-center w-6 h-6 transition-colors rounded-full bg-slate-100 group-hover:bg-indigo-100">
          <ChevronRight
            size={11}
            className="text-slate-400 group-hover:text-indigo-500"
          />
        </div>
      </div>
    </motion.button>
  );
}

// ─── MAIN ERS PAGE ────────────────────────────────────────────────
export default function ERS() {
  const {
    students,
    isLoading,
    isFetching,
    searchTerm,
    setSearchTerm,
    refetch,
    searchParams,
    setSearchParams,
  } = useStudentManager();

  const [selected, setSelected] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loading = isLoading || isFetching;
  const showResults = searchTerm?.trim()?.length > 0;

  const currentUser = useSelector(
    (s) => s?.auth?.user?.name || s?.auth?.user?.email || null,
  );

  const sessionOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const sessions = [];
    for (let i = currentYear - 4; i <= currentYear + 2; i++)
      sessions.push(`${i}-${i + 1}`);
    return sessions;
  }, []);

  // Restore selected student from URL on mount or when student list changes
  const studentId = searchParams.get('studentId');

  useEffect(() => {
    if (!studentId || !students?.length) return;
    const student = students.find((s) => String(s._id) === String(studentId));
    if (student) {
      setSelected(student);
    }
  }, [studentId, students]);

  // Mark initial load as done
  useEffect(() => {
    if (!loading && isInitialLoad) setIsInitialLoad(false);
  }, [loading, isInitialLoad]);

  // Keep selected up to date if its data changes
  useEffect(() => {
    if (!selected) return;
    const fresh = students.find(
      (s) => s._id === selected._id || s.studentId === selected.studentId,
    );
    if (fresh && JSON.stringify(fresh) !== JSON.stringify(selected))
      setSelected(fresh);
  }, [students, selected]);

  const handleUpdateSuccess = useCallback(() => refetch(), [refetch]);

  const handleSelectStudent = (s) => {
    setSelected(s);
    // Preserve current phone param, add/update studentId
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('studentId', s._id);
      if (searchTerm) newParams.set('phone', searchTerm);
      return newParams;
    });
  };

  const handleClearStudent = () => {
    setSelected(null);
    // Remove only studentId, keep phone for search
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('studentId');
      return newParams;
    });
  };

  return (
    <div className="font-sans">
      <div className="w-full bg-[#FAFAFA] font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
        {/* Financial Header */}
        <header className="sticky top-9 z-10 border-b border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)] backdrop-blur-md">
          <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500" />
          <div className="px-5 py-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 flex-shrink-0">
                <div className="relative flex items-center justify-center w-11 h-11 rounded-md bg-slate-900 text-white shadow-md shadow-indigo-950/10 ring-1 ring-white/20">
                  <GraduationCap className="w-5 h-5 text-indigo-300" />
                  <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-0.5 text-white">
                    <CreditCard className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">
                      Student Payment Record
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                      <Building2 className="w-2.5 h-2.5" /> Ledger
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Query real-time tuition balances, billing histories &
                    receipt IDs
                  </p>
                </div>
              </div>

              <div className="flex flex-1 items-center justify-end gap-3 max-w-2xl">
                {/* Search Bar */}
                <div className="relative w-full max-w-sm">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    {loading ? (
                      <Loader2
                        size={14}
                        className="text-indigo-600 animate-spin"
                      />
                    ) : (
                      <Search size={14} className="text-slate-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by phone number..."
                    className="w-full py-2 pl-9 pr-8 text-xs font-medium text-slate-900 transition-all border border-slate-200/90 rounded-md bg-slate-50/80 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white shadow-inner font-mono"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-md hover:bg-slate-200/60 transition-colors"
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Selected Student Pill */}
                {selected && searchTerm && (
                  <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-900 text-white rounded-md shadow-sm text-xs transition-all animate-in fade-in slide-in-from-right-2">
                    <button
                      onClick={handleClearStudent}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                      title="Return to search"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <span className="text-slate-600">|</span>
                    <span className="font-semibold truncate capitalize  text-slate-100">
                      {selected?.name}
                    </span>
                    <button
                      onClick={handleClearStudent}
                      className="ml-1 text-slate-400 hover:text-rose-300 p-0.5 rounded transition-colors"
                      title="Clear selection"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="px-2 py-6 mx-auto space-y-5">
        <AnimatePresence>
          {!showResults && !selected && !loading && !isInitialLoad && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-36"
            >
              <div className="flex items-center justify-center w-20 h-20 mb-5 shadow-inner rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                <Search size={28} className="text-slate-300" />
              </div>
              <h2 className="mb-2 text-base font-bold text-slate-600">
                Find a Student
              </h2>
              <p className="max-w-2xl text-xs leading-relaxed text-slate-400">
                Enter a student ID or phone number above to view financial
                records and manage payments.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && isInitialLoad && !selected && (
          <div className="flex flex-col items-center justify-center py-36">
            <Loader2 size={28} className="mb-4 text-indigo-400 animate-spin" />
            <p className="text-xs text-slate-400">Please wait...</p>
          </div>
        )}

        <AnimatePresence>
          {showResults && !selected && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!loading && students?.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest px-1 mb-3">
                    {students?.length} result{students?.length !== 1 ? 's' : ''}
                  </p>
                  {students?.map((s, i) => (
                    <StudentCard
                      key={s._id || s.studentId}
                      s={s}
                      index={i}
                      onClick={() => handleSelectStudent(s)}
                    />
                  ))}
                </div>
              ) : !loading ? (
                <div className="py-16 text-xs text-center text-slate-400">
                  No students found for "{searchTerm}"
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selected && (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StudentDetail
                student={selected}
                onUpdateSuccess={handleUpdateSuccess}
                currentUser={currentUser}
                sessionOptions={sessionOptions}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

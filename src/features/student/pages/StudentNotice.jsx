import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  Loader2,
  FileText,
  Download,
  Sparkles,
  AlertCircle,
  Users,
  GraduationCap,
  Inbox,
  Search,
  RotateCcw,
  FileQuestion,
  Calendar,
  X,
  Bell,
  Tag,
  BookOpen,
  ClipboardList,
  CreditCard,
  Megaphone,
  Zap,
} from 'lucide-react';
import {
  useGetAnnouncementsQuery,
  useGetStudentAnnouncementsQuery,
} from '../../../../redux/features/announcement/announcementApi';
import BreadCrumbMenu from '../../../../components/BreadCrumbMenu';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const announcementOptions = [
  { id: 1, label: 'Class', value: 'class' },
  { id: 2, label: 'Exam', value: 'exam' },
  { id: 3, label: 'Result', value: 'result' },
  { id: 4, label: 'Event', value: 'event' },
  { id: 5, label: 'General', value: 'general' },
  { id: 6, label: 'Admission', value: 'admission' },
  { id: 7, label: 'Holiday', value: 'holiday' },
  { id: 8, label: 'Meeting', value: 'meeting' },
  { id: 9, label: 'Routine', value: 'routine' },
  { id: 10, label: 'Notice', value: 'notice' },
  { id: 11, label: 'Admit Card', value: 'admit_card' },
  { id: 12, label: 'Fees', value: 'fees' },
  { id: 13, label: 'Urgent', value: 'urgent' },
];

const TYPE_CONFIG = {
  result: {
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#065f46',
    icon: GraduationCap,
  },
  class: {
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1e40af',
    icon: Users,
  },
  exam: {
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    text: '#92400e',
    icon: BookOpen,
  },
  general: {
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    text: '#4c1d95',
    icon: Sparkles,
  },
  event: {
    color: '#db2777',
    bg: '#fdf2f8',
    border: '#fbcfe8',
    text: '#831843',
    icon: Calendar,
  },
  admission: {
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
    text: '#164e63',
    icon: FileText,
  },
  holiday: {
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    text: '#14532d',
    icon: Sparkles,
  },
  meeting: {
    color: '#9333ea',
    bg: '#faf5ff',
    border: '#e9d5ff',
    text: '#581c87',
    icon: Users,
  },
  routine: {
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    text: '#0c4a6e',
    icon: ClipboardList,
  },
  notice: {
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#7f1d1d',
    icon: Megaphone,
  },
  admit_card: {
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    text: '#4c1d95',
    icon: CreditCard,
  },
  fees: {
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    text: '#78350f',
    icon: Tag,
  },
  urgent: {
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#7f1d1d',
    icon: Zap,
  },
};

const getCfg = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.general;

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

/* ─────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────── */

/** Single notice row in the list */
const NoticeRow = ({ item, isActive, onClick }) => {
  const { color, bg, border, text, icon: Icon } = getCfg(item.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`relative group px-4 py-3.5 cursor-pointer border-b select-none transition-colors ${
        isActive
          ? 'bg-[#F7F6F3] border-slate-100'
          : 'bg-white hover:bg-[#FAFAF9] border-slate-100/80'
      }`}
    >
      {/* Active left bar */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            layoutId="activeBar"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-slate-800"
          />
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3">
        {/* Icon badge */}
        <div
          className="mt-0.5 p-1.5 rounded-md flex-shrink-0"
          style={{ background: bg, border: `1px solid ${border}` }}
        >
          <Icon size={12} style={{ color }} strokeWidth={2.2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: text }}
            >
              {item.type?.replace('_', ' ')}
            </span>
            <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0 tabular-nums">
              {fmtDate(item?.createdAt)}
            </span>
          </div>
          <h4
            className={`text-[13px] font-semibold truncate leading-snug transition-colors ${
              isActive ? '' : 'text-slate-700 group-hover:text-slate-900'
            }`}
            style={isActive ? { color: text } : undefined}
          >
            {item?.title}
          </h4>
          <p className="text-[11.5px] text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">
            {item?.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/** Full notice detail pane */
const NoticeDetail = ({ notice }) => {
  if (!notice) return null;
  const { color, bg, border, text, icon: Icon } = getCfg(notice.type);

  return (
    <motion.div
      key={notice._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="h-full overflow-y-auto notice-scroll"
    >
      <div className="px-4 py-10 max-w-7xl sm:py-12">
        {/* Type + date row */}
        <div className="flex flex-wrap items-center gap-2.5 mb-7">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider"
            style={{
              background: bg,
              border: `1px solid ${border}`,
              color: text,
            }}
          >
            <Icon size={11} style={{ color }} strokeWidth={2.4} />
            {notice?.type?.replace('_', ' ')}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
            <span>Program Date : </span>
            <Calendar size={12} className="text-slate-400" strokeWidth={1.8} />
            <span>{fmtDate(notice?.date)}</span>
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-[22px] sm:text-[22px] font-bold text-slate-900 leading-[1.25] tracking-tight mb-6"
          style={{ color: text }}
        >
          {notice?.title}
        </h1>

        {/* Thin divider */}
        <div className="h-px mb-2 bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />

        {/* Body text */}
        <div className="text-[14.5px] sm:text-[15px] text-slate-600 leading-[1.85] whitespace-pre-line">
          {notice.content}
        </div>

        {/* Attachment */}
        {notice.attachment && (
          <div className="pt-8 mt-10 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-4">
              Attachments
            </p>
            <div className="flex items-center justify-between gap-3 p-4 transition-all bg-white border border-slate-200 rounded-xl hover:border-slate-300 group/att">
              <div className="flex items-center min-w-0 gap-3">
                <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg flex-shrink-0">
                  <FileText
                    size={16}
                    className="text-blue-600"
                    strokeWidth={1.8}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">
                    {notice.attachment}
                  </p>
                  <p className="text-[10.5px] text-slate-400 uppercase tracking-wider mt-0.5">
                    PDF Document
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  window.open(
                    `${SERVER}/api/student/download/${notice.attachment}`,
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white text-[12px] font-semibold rounded-lg hover:bg-black active:scale-95 transition-all flex-shrink-0"
              >
                <Download size={12} strokeWidth={2.2} />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/** Empty states */
const EmptyList = () => (
  <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
    <div className="flex items-center justify-center w-12 h-12 mb-4 border bg-slate-50 rounded-2xl border-slate-100">
      <FileQuestion size={20} className="text-slate-300" strokeWidth={1.5} />
    </div>
    <p className="text-[13px] font-semibold text-slate-400">No notices found</p>
    <p className="text-[11.5px] text-slate-300 mt-1">
      Try adjusting your filters
    </p>
  </div>
);

const EmptyDetail = () => (
  <div className="flex flex-col items-center justify-center h-full px-8 text-center">
    <div className="w-14 h-14 bg-[#F7F6F3] rounded-2xl flex items-center justify-center mb-5 border border-slate-100">
      <Inbox size={22} className="text-slate-300" strokeWidth={1.5} />
    </div>
    <p className="text-[14px] font-semibold text-slate-400">Nothing selected</p>
    <p className="text-[12px] text-slate-300 mt-1.5 max-w-[180px] leading-relaxed">
      Pick a notice from the list to read it here
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
const StudentNotice = () => {
  const { student } = useSelector((state) => state?.studentAuth);

  // ── State ────────────────────────────────────────────
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );
  const [query, setQuery] = useState({
    page: 1,
    limit: 50,
    type: '',
    date: '',
    batch: '',
  });

  // ── API ──────────────────────────────────────────────
  const { data: announcementsData, isLoading } =
    useGetStudentAnnouncementsQuery(query);
  const announcements = useMemo(
    () => announcementsData?.data || [],
    [announcementsData?.data],
  );

  // ── Client-side search filter ────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return announcements;
    return announcements.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.content?.toLowerCase().includes(q),
    );
  }, [announcements, searchQuery]);

  // ── Responsive detection ─────────────────────────────
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Auto-select first notice on desktop ──────────────
  useEffect(() => {
    if (!isMobile && filtered.length > 0 && !selectedNotice) {
      setSelectedNotice(filtered[0]);
    }
  }, [filtered, isMobile, selectedNotice]);

  // Reset selection when switching to mobile
  useEffect(() => {
    if (isMobile) setModalOpen(false);
  }, [isMobile]);

  // ── Handlers ─────────────────────────────────────────
  const handleSelect = (notice) => {
    setSelectedNotice(notice);
    if (isMobile) setModalOpen(true);
  };

  const resetFilters = () => {
    setQuery({ page: 1, limit: 50, type: '', date: '', batch: '' });
    setSearchQuery('');
  };

  const hasFilter = !!(query.type || query.date || searchQuery.trim());

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white font-sans text-slate-900">
      <header className="z-30 flex items-center justify-between flex-shrink-0 px-4 bg-white border-b border-slate-200/80 h-11">
        <BreadCrumbMenu />
      </header>

      <div className="flex-shrink-0 px-4 pt-5 pb-3 bg-white border-b border-slate-100 sm:px-5">
        {/* Title row */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5 mb-4"
        >
          <div className="p-1.5 bg-slate-100 rounded-lg">
            <Bell size={14} className="text-slate-600" strokeWidth={2} />
          </div>
          <h1 className="text-base font-bold tracking-tight text-slate-900">
            Notice Board
          </h1>
          <motion.span
            key={filtered.length}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200"
          >
            {filtered?.length}
          </motion.span>
          {student?.name && (
            <span className="hidden sm:inline text-[12px] text-slate-400 ml-1">
              — {student.name}{' '}
              {student?.batch && (
                <span className="text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {student.batch}
                </span>
              )}
            </span>
          )}
        </motion.div>

        {/* ── FILTER ROW ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="flex items-center gap-2"
        >
          {/* Search input */}
          <div className="relative flex-shrink-0">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              strokeWidth={2.2}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="h-8 pl-8 pr-3 text-[12px] bg-[#F7F6F3] border border-transparent focus:border-slate-300 focus:bg-white rounded-lg outline-none transition-all w-28 sm:w-44"
            />
          </div>

          {/* Type filter chips – horizontal scroll */}
          <div className="space-y-1.5">
            <select
              value={query.type}
              onChange={(e) =>
                setQuery((p) => ({ ...p, type: e.target.value }))
              }
              className="h-8 pl-2 pr-2 text-[12px] bg-[#F7F6F3] border border-transparent focus:border-slate-300 focus:bg-white rounded-lg outline-none transition-all w-36 sm:w-40"
            >
              {/* Default */}
              <option value="">All Types</option>

              {/* 🔥 Dynamic Options */}
              {announcementOptions?.map((item) => (
                <option key={item.id} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date picker */}
          <div className="relative flex-shrink-0">
            <Calendar
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              strokeWidth={2}
            />
            <input
              type="date"
              value={query.date}
              onChange={(e) =>
                setQuery((p) => ({ ...p, date: e.target.value }))
              }
              className="h-8 pl-8 pr-2 text-[12px] bg-[#F7F6F3] border border-transparent focus:border-slate-300 focus:bg-white rounded-lg outline-none transition-all w-36 sm:w-40"
            />
          </div>

          {/* Reset button */}
          <AnimatePresence>
            {hasFilter && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85, x: 6 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85, x: 6 }}
                whileTap={{ scale: 0.94 }}
                onClick={resetFilters}
                className="flex-shrink-0 flex items-center gap-1.5 h-8 px-3 text-[11.5px] font-semibold text-red-400 bg-white border border-red-100 hover:border-red-200 hover:bg-red-50/50 rounded-lg transition-all"
              >
                <RotateCcw size={11} strokeWidth={2.5} />
                <span className="hidden sm:inline">Reset</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════
          MAIN BODY
      ════════════════════════════════════════════════ */}
      <div className="flex flex-1 px-4 overflow-hidden">
        {/* ── LEFT / FULL-WIDTH: NOTICE LIST ─────────────
            Mobile  : w-full (full screen)
            Tablet+ : w-[320px] fixed width
        ──────────────────────────────────────────────── */}
        <aside
          className="
          flex flex-col bg-white border-r border-slate-100 overflow-hidden flex-shrink-0
          w-full
          md:w-[280px]
          lg:w-[360px]
        "
        >
          {/* List header */}
          <div className="flex items-center justify-between h-10 px-4 border-b border-slate-100/80 bg-[#FAFAF9] flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <Inbox size={13} className="text-slate-400" strokeWidth={2} />
              <span className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
                Notices
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 tabular-nums">
              {filtered?.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto notice-scroll">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 gap-2">
                <Loader2 size={16} className="animate-spin text-slate-300" />
                <span className="text-[12px] text-slate-300 font-cocon">
                  Pleas wait...
                </span>
              </div>
            ) : filtered?.length === 0 ? (
              <EmptyList />
            ) : (
              <AnimatePresence initial={false}>
                {filtered?.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.025, 0.3) }}
                  >
                    <NoticeRow
                      item={item}
                      isActive={!isMobile && selectedNotice?._id === item._id}
                      onClick={() => handleSelect(item)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </aside>

        {/* ── RIGHT: DETAIL PANE (tablet / desktop only) ─
            Hidden on mobile – replaced by bottom-sheet modal
        ──────────────────────────────────────────────── */}
        <section className="hidden md:flex flex-1 flex-col bg-[#FAFAF9] overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedNotice ? (
              <NoticeDetail key={selectedNotice._id} notice={selectedNotice} />
            ) : (
              <motion.div
                key="empty-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center flex-1"
              >
                <EmptyDetail />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* ════════════════════════════════════════════════
          MOBILE BOTTOM-SHEET MODAL
          Visible only on mobile (< 768px)
      ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isMobile && modalOpen && selectedNotice && (
          <>
            {/* Scrim backdrop */}
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 z-40 bg-black/25 md:hidden"
              style={{
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              }}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 320,
                mass: 0.85,
              }}
              className="fixed bottom-0 left-0 right-0 z-50 flex flex-col overflow-hidden bg-white shadow-2xl rounded-t-2xl md:hidden"
              style={{ maxHeight: '90dvh', minHeight: '40dvh' }}
            >
              {/* Drag handle */}
              <div className="flex justify-center flex-shrink-0 pt-3 pb-1">
                <div className="h-1 rounded-full w-9 bg-slate-200" />
              </div>

              {/* Sheet header */}
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
                {(() => {
                  const cfg = getCfg(selectedNotice.type);
                  const Icon = cfg.icon;
                  return (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="p-1.5 rounded-lg flex-shrink-0"
                        style={{
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                        }}
                      >
                        <Icon
                          size={13}
                          style={{ color: cfg.color }}
                          strokeWidth={2.2}
                        />
                      </div>
                      <span className="text-[13px] font-semibold text-slate-800 truncate">
                        {selectedNotice.title}
                      </span>
                    </div>
                  );
                })()}
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={15} className="text-slate-500" strokeWidth={2} />
                </button>
              </div>

              {/* Sheet content */}
              <div className="flex-1 overflow-y-auto notice-scroll">
                <NoticeDetail notice={selectedNotice} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Global styles ──────────────────────────────── */}
      <style>{`
        .notice-scroll::-webkit-scrollbar { width: 3px; }
        .notice-scroll::-webkit-scrollbar-track { background: transparent; }
        .notice-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .notice-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

        .filter-chips::-webkit-scrollbar { display: none; }
        .filter-chips { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StudentNotice;

import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Mail,
  Phone,
  BookOpen,
  Calendar,
  User,
  GraduationCap,
  MapPin,
  CreditCard,
  Home,
  Hash,
  Heart,
  School,
  Percent,
  Shield,
  Building2,
  Clock,
  BadgeCheck,
  Settings,
  ShieldCheck,
  Wifi,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetStudentByIdQuery } from '../../../../redux/features/student/studentApi';
import { Link, useParams } from 'react-router-dom';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

/* ── Badge & Tag Color Palette ────────────────────────────────────── */
const TAGS = {
  mint: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  sky: 'bg-sky-50 text-sky-700 border border-sky-200/60',
  violet: 'bg-purple-50 text-[#55004B] border border-purple-200/60',
  amber: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  rose: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  slate: 'bg-slate-100 text-slate-700 border border-slate-200/60',
};

const TAB_META = [
  { id: 'personal', label: 'Personal', icon: User, color: TAGS.sky },
  { id: 'academic', label: 'Academic', icon: BookOpen, color: TAGS.violet },
  { id: 'financial', label: 'Financial', icon: CreditCard, color: TAGS.mint },
  { id: 'address', label: 'Address', icon: MapPin, color: TAGS.amber },
];

/* ── Clean Property Row Component ────────────────────────────────── */
const Row = ({ icon: Icon, label, value, tag, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay }}
    className="flex items-center justify-between py-2.5 px-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/80 rounded-md transition-colors"
  >
    <div className="flex items-center gap-2.5 w-[42%] shrink-0">
      {Icon && <Icon size={14} className="text-slate-400 shrink-0" />}
      <span className="text-xs text-slate-500 font-medium truncate">
        {label}
      </span>
    </div>
    <div className="flex-1 text-right sm:text-left text-xs font-semibold truncate">
      {tag ? (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${tag}`}
        >
          {value || '—'}
        </span>
      ) : (
        <span className="text-slate-800 font-medium">
          {value || <span className="font-normal text-slate-300">—</span>}
        </span>
      )}
    </div>
  </motion.div>
);

/* ── Card Block Container Component ──────────────────────────────── */
const Block = ({
  title,
  icon: Icon,
  accent = TAGS.slate,
  children,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="bg-white rounded-md border border-slate-200/80 shadow-sm overflow-hidden"
  >
    <div className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-50/50 border-b border-slate-100">
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs ${accent}`}
      >
        <Icon size={14} />
      </span>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
        {title}
      </h3>
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════════ */
const StudentAccount = () => {
  const { id } = useParams();
  const { data, error } = useGetStudentByIdQuery(id);
  const studentInfo = data?.data;
  const [activeTab, setActiveTab] = useState('personal');

  // Calculations
  const admissionPaid = studentInfo?.admissionFeePaid || 0;
  const messPaid = studentInfo?.messServiceChargePaid || 0;
  const totalPaid = admissionPaid + messPaid;
  const totalPayable = studentInfo?.totalAfterDiscount || 0;
  const dueAmount = studentInfo?.dueAmount || 0;

  // Percentage calculation
  const paidPct =
    totalPayable > 0
      ? Math.min(Math.round((totalPaid / totalPayable) * 100), 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 text-[#37352f] font-sans antialiased pb-12 capitalize">
      {/* ── PIXEL-PERFECT MODERN HEADER (Student Account Setting style) ── */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-[1350px] px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-md bg-gradient-to-tr from-[#55004B] to-[#9c188b] flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
                <Settings size={22} />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  {studentInfo?.name
                    ? `${studentInfo.name}'s Profile`
                    : 'Student Account'}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-[#55004B] border border-purple-100">
                    Active Portal
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Manage your personal records, academic credentials, and
                  financial ledger status.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                <ShieldCheck size={14} /> Securely Verified
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ──────────────────────────────── */}
      <main className="px-4 sm:px-6 pt-6">
        <div className="grid items-start grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ── LEFT SIDEBAR: PROFILE CARD & FEE PROGRESS (Span 4) ── */}
          <motion.aside
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 lg:col-span-4"
          >
            {/* Identity Card */}
            <div className="bg-white rounded-md border border-slate-200/80 shadow-sm overflow-hidden">
              {/* Cover Banner */}
              <div className="relative h-24 bg-gradient-to-br from-[#55004B] via-[#6a0060] to-[#800075] p-4">
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-bold backdrop-blur-md border border-white/20">
                    <BadgeCheck size={12} className="text-emerald-400" />{' '}
                    Verified
                  </span>

                  <Link
                    to={`/student/dashboard/update/${studentInfo?._id}`}
                    className="px-2 py-1 rounded bg-[#34C47C] text-white text-[10px] font-medium hover:bg-[#2da96b] transition-colors"
                  >
                    Update
                  </Link>
                </div>
              </div>

              {/* Avatar & Info */}
              <div className="px-5 pb-5">
                <div className="relative inline-block mb-3 -mt-10">
                  <div className="w-20 h-20 rounded-md border-4 border-white shadow-md overflow-hidden bg-slate-100">
                    {studentInfo?.studentPhoto ? (
                      <img
                        src={`${SERVER}${studentInfo.studentPhoto}`}
                        alt={studentInfo?.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-50 text-[#55004B] font-bold text-xl">
                        {studentInfo?.name?.charAt(0) || 'S'}
                      </div>
                    )}
                  </div>
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                </div>

                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  {studentInfo?.name || 'Student Name'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 capitalize font-medium">
                  {studentInfo?.department || 'Department N/A'}
                </p>

                {/* ID & Batch Tags */}
                <div className="flex flex-wrap gap-2 mt-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${TAGS.violet}`}
                  >
                    <Hash size={11} /> {studentInfo?.studentId || 'N/A'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold capitalize ${TAGS.sky}`}
                  >
                    <GraduationCap size={11} /> {studentInfo?.batch || 'N/A'}
                  </span>
                </div>

                <div className="my-4 border-t border-slate-100" />

                {/* Quick Stats Rows */}
                <div className="space-y-1">
                  {[
                    {
                      icon: Calendar,
                      label: 'Session',
                      val: studentInfo?.session || '—',
                    },
                    {
                      icon: Clock,
                      label: 'Joined',
                      val: studentInfo?.createdAt
                        ? new Date(studentInfo.createdAt).toLocaleDateString(
                            'en-GB',
                            {
                              month: 'short',
                              year: 'numeric',
                            },
                          )
                        : '—',
                    },
                    {
                      icon: Shield,
                      label: 'Status',
                      val: 'Active',
                      tag: TAGS.mint,
                    },
                  ]?.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 text-slate-400 font-medium">
                        <s.icon size={13} /> {s.label}
                      </div>
                      {s.tag ? (
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${s.tag}`}
                        >
                          {s.val}
                        </span>
                      ) : (
                        <span className="font-bold text-slate-700">
                          {s.val}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fee Progress Mini-Card */}
            <div className="relative w-full mx-auto bg-gradient-to-br from-[#55004B] via-[#7b116d] to-emerald-800 rounded-2xl shadow-xl p-6 text-white overflow-hidden border border-white/10">
              {/* Decorative background glow circles for Bank/Debit Card look */}
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Card Top Header */}
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <CreditCard className="text-emerald-400" size={24} />
                  <span className="text-xs font-semibold tracking-wider uppercase text-emerald-200">
                    RPRDAC Payment Card
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="text-white/70 rotate-90" size={18} />
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      paidPct >= 100
                        ? 'bg-emerald-500/30 text-emerald-300'
                        : 'bg-amber-500/30 text-amber-200'
                    }`}
                  >
                    {paidPct}% Paid
                  </span>
                </div>
              </div>

              {/* EMV Chip & Card Holder Name */}
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="w-10 h-8 bg-gradient-to-tr from-amber-200 to-amber-400 rounded-md shadow-inner flex items-center justify-center opacity-90 border border-amber-300/40">
                  <div className="w-full border-t border-b border-amber-600/30 h-2" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/60 uppercase tracking-widest">
                    Student ID
                  </p>
                  <p className="text-xs font-mono tracking-wider font-semibold text-emerald-200">
                    {studentInfo?.studentId || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Card Name / Holder */}
              <div className="relative z-10 mb-4">
                <p className="text-[10px] text-white/60 uppercase tracking-widest">
                  Card Holder
                </p>
                <p className="text-sm font-medium tracking-wide uppercase truncate">
                  {studentInfo?.name || 'Valued Student'}
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="relative z-10 w-full h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${paidPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full"
                />
              </div>

              {/* Summary Breakdowns (Debit Card Footer) */}
              <div className="relative z-10 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-white/70 uppercase">
                    Paid Summary:
                  </p>
                  <p className="text-emerald-300 font-semibold">
                    Admission:{' '}
                    {admissionPaid.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'BDT',
                    })}
                  </p>
                  <p className="text-emerald-300 font-semibold">
                    Mess:{' '}
                    {messPaid.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'BDT',
                    })}
                  </p>
                  <p className="text-white font-bold mt-0.5">
                    Total Paid:{' '}
                    {totalPaid.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'BDT',
                    })}
                  </p>
                </div>

                <div className="text-right flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-rose-300 uppercase">
                      Due Amount:
                    </p>
                    <p className="text-rose-400 font-bold text-sm">
                      {dueAmount.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'BDT',
                      })}
                    </p>
                  </div>
                  <div className="text-[9px] text-white/50 tracking-widest uppercase">
                    Verified Account
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* ── RIGHT CONTENT AREA: TABS & DATA PANELS (Span 8) ─────── */}
          <div className="space-y-5 lg:col-span-8">
            {/* Navigation Tab Bar */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 overflow-x-auto">
              {TAB_META?.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      active
                        ? 'text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-[#55004B]"
                        transition={{
                          type: 'spring',
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    <tab.icon size={15} className="relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-md bg-rose-50 border border-rose-100 text-xs text-center text-rose-600 font-medium">
                {error?.data?.message || 'Failed to fetch student data.'}
              </div>
            )}

            {/* ── TAB PANELS CONTENT ─────────────────────────────── */}
            <AnimatePresence mode="wait">
              {/* 1. PERSONAL TAB */}
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 gap-5 md:grid-cols-2"
                >
                  <Block
                    title="Personal Information"
                    icon={User}
                    accent={TAGS.sky}
                  >
                    <Row
                      icon={User}
                      label="Full Name"
                      value={studentInfo?.name}
                      delay={0.02}
                    />
                    {/* <Row
                      icon={Mail}
                      label="Email Address"
                      value={studentInfo?.email}
                      delay={0.04}
                    /> */}
                    <Row
                      icon={Phone}
                      label="Phone Number"
                      value={studentInfo?.phone}
                      delay={0.06}
                    />
                    <Row
                      icon={Heart}
                      label="Blood Group"
                      value={studentInfo?.bloodGroup}
                      tag={TAGS.rose}
                      delay={0.08}
                    />
                    <Row
                      icon={Phone}
                      label="WhatsApp"
                      value={studentInfo?.studentWhatsAppNum}
                      delay={0.1}
                    />
                  </Block>

                  <Block
                    title="Guardian Information"
                    icon={Shield}
                    accent={TAGS.violet}
                    delay={0.04}
                  >
                    <Row
                      icon={User}
                      label="Guardian Name"
                      value={studentInfo?.guardianName}
                      delay={0.02}
                    />
                    <Row
                      icon={Phone}
                      label="Guardian Phone"
                      value={studentInfo?.guardianPhone}
                      delay={0.04}
                    />
                    <Row
                      icon={Phone}
                      label="Guardian WhatsApp"
                      value={studentInfo?.guardianWhatsAppNum}
                      delay={0.06}
                    />
                    <Row
                      icon={Heart}
                      label="Relationship"
                      value={studentInfo?.relationWithGuardian}
                      tag={TAGS.amber}
                      delay={0.08}
                    />
                  </Block>
                </motion.div>
              )}

              {/* 2. ACADEMIC TAB */}
              {activeTab === 'academic' && (
                <motion.div
                  key="academic"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 gap-5 md:grid-cols-2"
                >
                  <Block
                    title="Academic Credentials"
                    icon={GraduationCap}
                    accent={TAGS.violet}
                  >
                    <Row
                      icon={Hash}
                      label="Student ID"
                      value={studentInfo?.studentId}
                      tag={TAGS.violet}
                      delay={0.02}
                    />
                    <Row
                      icon={Building2}
                      label="Department"
                      value={studentInfo?.department}
                      delay={0.04}
                    />
                    <Row
                      icon={GraduationCap}
                      label="Batch"
                      value={studentInfo?.batch}
                      tag={TAGS.sky}
                      delay={0.06}
                    />
                    <Row
                      icon={Calendar}
                      label="Session"
                      value={studentInfo?.session}
                      delay={0.08}
                    />
                    <Row
                      icon={Clock}
                      label="Admission Date"
                      value={
                        studentInfo?.createdAt
                          ? new Date(studentInfo.createdAt).toLocaleDateString(
                              'en-GB',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              },
                            )
                          : '—'
                      }
                      delay={0.1}
                    />
                  </Block>

                  <Block
                    title="Educational Background"
                    icon={School}
                    accent={TAGS.mint}
                    delay={0.04}
                  >
                    <Row
                      icon={School}
                      label="SSC Board"
                      value={studentInfo?.sscBoard}
                      delay={0.02}
                    />
                    <Row
                      icon={Percent}
                      label="SSC GPA"
                      value={studentInfo?.sscGpa}
                      tag={TAGS.mint}
                      delay={0.04}
                    />
                    <Row
                      icon={BookOpen}
                      label="SSC Group"
                      value={studentInfo?.sscGroup}
                      delay={0.06}
                    />
                    <Row
                      icon={Calendar}
                      label="SSC Passing Year"
                      value={studentInfo?.sscPassingYear}
                      delay={0.08}
                    />
                    <Row
                      icon={School}
                      label="Diploma Board"
                      value={studentInfo?.diplomaBoard}
                      delay={0.1}
                    />
                    <Row
                      icon={BookOpen}
                      label="Diploma Group"
                      value={studentInfo?.diplomaGroup}
                      delay={0.12}
                    />
                    <Row
                      icon={Building2}
                      label="Institute"
                      value={studentInfo?.instituteName}
                      delay={0.14}
                    />
                    <Row
                      icon={Calendar}
                      label="Diploma Passing Yr"
                      value={studentInfo?.diplomaPassingYear}
                      delay={0.16}
                    />
                  </Block>
                </motion.div>
              )}

              {/* 3. FINANCIAL TAB */}
              {activeTab === 'financial' && (
                <motion.div
                  key="financial"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  {/* Financial Quick Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        label: 'Total Fee',
                        val:
                          studentInfo?.admissionFee?.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'BDT',
                          }) || '৳0',
                        tag: TAGS.slate,
                      },
                      {
                        label: 'Paid Amount',
                        val:
                          studentInfo?.studentPaid?.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'BDT',
                          }) || '৳0',
                        tag: TAGS.mint,
                      },
                      {
                        label: 'Due Amount',
                        val:
                          studentInfo?.dueAmount?.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'BDT',
                          }) || '৳0',
                        tag: TAGS.rose,
                      },
                      {
                        label: 'Cash Back',
                        val:
                          studentInfo?.cashback?.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'BDT',
                          }) || '৳0',
                        tag: TAGS.amber,
                      },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-md border border-slate-200/80 p-3.5 shadow-xs"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          {s.label}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${s.tag}`}
                        >
                          {s.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Block
                      title="Payment Overview"
                      icon={CreditCard}
                      accent={TAGS.mint}
                    >
                      <Row
                        icon={CreditCard}
                        label="Course Fee"
                        value={studentInfo?.courseFee?.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'BDT',
                        })}
                        delay={0.04}
                      />
                      <Row
                        icon={CreditCard}
                        label="Admission Fee"
                        value={studentInfo?.admissionFee?.toLocaleString(
                          'en-US',
                          {
                            style: 'currency',
                            currency: 'BDT',
                          },
                        )}
                        delay={0.02}
                      />

                      <Row
                        icon={CreditCard}
                        label="Mess Service Charge"
                        value={studentInfo?.messServiceCharge?.toLocaleString(
                          'en-US',
                          {
                            style: 'currency',
                            currency: 'BDT',
                          },
                        )}
                        delay={0.04}
                      />

                      {/* <Row
                        icon={CreditCard}
                        label="Student Paid"
                        value={studentInfo?.studentPaid?.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'BDT',
                        })}
                        tag={TAGS.mint}
                        delay={0.06}
                      /> */}
                      <Row
                        icon={CreditCard}
                        label="Due Amount"
                        value={studentInfo?.dueAmount?.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'BDT',
                        })}
                        tag={TAGS.rose}
                        delay={0.08}
                      />
                      <Row
                        icon={CreditCard}
                        label="Cash Back"
                        value={studentInfo?.cashback?.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'BDT',
                        })}
                        tag={TAGS.amber}
                        delay={0.1}
                      />
                    </Block>

                    <Block
                      title="Discount & Subsidies"
                      icon={Percent}
                      accent={TAGS.amber}
                      delay={0.04}
                    >
                      <Row
                        icon={Hash}
                        label="Receipt No"
                        value={studentInfo?.receiptNo}
                        delay={0.02}
                      />
                      <Row
                        icon={Percent}
                        label="CGPA Discount"
                        value={studentInfo?.cgpaDiscount?.toLocaleString(
                          'en-US',
                          {
                            style: 'currency',
                            currency: 'BDT',
                          },
                        )}
                        tag={TAGS.sky}
                        delay={0.04}
                      />
                      <Row
                        icon={Percent}
                        label="CGPA"
                        value={studentInfo?.cgpa}
                        tag={TAGS.violet}
                        delay={0.06}
                      />
                      <Row
                        icon={Percent}
                        label="Reference Discount"
                        value={studentInfo?.referenceDiscount?.toLocaleString(
                          'en-US',
                          {
                            style: 'currency',
                            currency: 'BDT',
                          },
                        )}
                        delay={0.08}
                      />
                      <Row
                        icon={Percent}
                        label="Deduct Money"
                        value={studentInfo?.deductMoney?.toLocaleString(
                          'en-US',
                          {
                            style: 'currency',
                            currency: 'BDT',
                          },
                        )}
                        delay={0.1}
                      />
                      <Row
                        icon={CreditCard}
                        label="Total After Discount"
                        value={studentInfo?.totalAfterDiscount?.toLocaleString(
                          'en-US',
                          {
                            style: 'currency',
                            currency: 'BDT',
                          },
                        )}
                        tag={TAGS.mint}
                        delay={0.12}
                      />
                    </Block>
                  </div>
                </motion.div>
              )}

              {/* 4. ADDRESS TAB */}
              {activeTab === 'address' && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 gap-5 md:grid-cols-2"
                >
                  <Block
                    title="Permanent Address"
                    icon={Home}
                    accent={TAGS.sky}
                  >
                    <Row
                      icon={MapPin}
                      label="District"
                      value={studentInfo?.permanentZilla}
                      delay={0.02}
                    />
                    <Row
                      icon={MapPin}
                      label="Sub-District"
                      value={studentInfo?.permanentUpozilla}
                      delay={0.04}
                    />
                    <Row
                      icon={MapPin}
                      label="Village"
                      value={studentInfo?.permanentVillage}
                      delay={0.06}
                    />
                    <Row
                      icon={Hash}
                      label="Post Code"
                      value={studentInfo?.permanentPostcode}
                      tag={TAGS.slate}
                      delay={0.08}
                    />
                    <Row
                      icon={Hash}
                      label="Ward No"
                      value={studentInfo?.wardNo}
                      tag={TAGS.slate}
                      delay={0.1}
                    />
                  </Block>

                  <Block
                    title="Present Address"
                    icon={MapPin}
                    accent={TAGS.violet}
                    delay={0.04}
                  >
                    <Row
                      icon={MapPin}
                      label="District"
                      value={studentInfo?.presentZilla}
                      delay={0.02}
                    />
                    <Row
                      icon={MapPin}
                      label="Sub-District"
                      value={studentInfo?.presentUpozilla}
                      delay={0.04}
                    />
                    <Row
                      icon={MapPin}
                      label="Village"
                      value={studentInfo?.presentVillage}
                      delay={0.06}
                    />
                    <Row
                      icon={Building2}
                      label="Mess / Housing"
                      value={studentInfo?.mess}
                      delay={0.08}
                    />
                    <Row
                      icon={Hash}
                      label="Room No"
                      value={studentInfo?.room}
                      tag={TAGS.slate}
                      delay={0.1}
                    />
                  </Block>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentAccount;

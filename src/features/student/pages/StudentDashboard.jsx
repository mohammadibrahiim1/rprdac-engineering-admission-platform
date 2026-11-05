import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  BookOpen,
  Bell,
  Users,
} from 'lucide-react';
import { useGetStudentByIdQuery } from '../../../../redux/features/student/studentApi';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFetchStudentRoutinesQuery } from '../../../../redux/features/routine/routineApi';
import { formatDateDMY } from '../../../../constants/dateFormat';
import { useGetStudentAnnouncementsQuery } from '../../../../redux/features/announcement/announcementApi';

const StudentDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
  const { id } = useParams();

  // Redux Selectors
  const { student } = useSelector((state) => state?.studentAuth);

  // API Queries
  const { data: studentData } = useGetStudentByIdQuery(id);

  const studentInfo = studentData?.data;

  const { data: announcementsResponse } = useGetStudentAnnouncementsQuery({
    batch: student?.batch,
    page: 1,
    limit: 15,
    type: '',
    date: '',
  });

  const { data: routinesResponse } = useFetchStudentRoutinesQuery({
    batch: student?.batch,
    startDate: '',
    endDate: '',
  });

  const announcements = useMemo(
    () => announcementsResponse?.data || [],
    [announcementsResponse],
  );

  const allRoutines = useMemo(() => routinesResponse || [], [routinesResponse]);

  console.log('routines', allRoutines);

  // Filter routines for the selected date
  const selectedDateRoutines = useMemo(() => {
    return allRoutines?.routines?.filter((routine) => {
      const rDate = new Date(routine.date);
      return rDate.toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, allRoutines]);

  // Calendar Logic
  const getCalendarGrid = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), currentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }
    // Fill remaining slots to make 6 rows (42 days)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false });
    }
    return days;
  };

  const handlePrevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const handleNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  // 1. Total Financial Calculations (Admission Fee + Mess Service Charge)
  const totalAdmissionFee = studentInfo?.admissionFee || 0;
  const totalMessCharge = studentInfo?.messServiceCharge || 0;
  const grandTotalFee = totalAdmissionFee + totalMessCharge;

  // 2. Total Paid Calculations (Admission Paid + Mess Service Charge Paid)
  const admissionPaid = studentInfo?.admissionFeePaid || 0;
  const messPaid = studentInfo?.messServiceChargePaid || 0;
  const grandTotalPaid = admissionPaid + messPaid;

  // 3. Total Due Calculations
  const admissionDue = studentInfo?.admissionFeeDue || 0;
  const messDue = studentInfo?.messServiceChargeDue || 0;
  const grandTotalDue = admissionDue + messDue || studentInfo?.dueAmount || 0;

  // 4. Overall Progress Percentage
  const progress =
    grandTotalFee > 0
      ? Math.min(Math.round((grandTotalPaid / grandTotalFee) * 100), 100)
      : 0;

  return (
    <div className="min-h-screen pb-12 text-slate-900">
      {/* Header */}
      <header className="w-full relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 shadow-xl rounded-b-3xl md:rounded-b-[2.5rem] text-white">
        {}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

        {}
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-5 py-6 md:py-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            {}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex-1 text-center lg:text-left space-y-3 w-full"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium tracking-wide shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{student.grade || 'Active Scholar'}</span>
                <span className="text-white/40">•</span>
                <span className="text-purple-200">Session Active</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-sans">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-white bg-clip-text text-transparent">
                  {student?.name || 'Explorer'}
                </span>
                ! ✨
              </h1>

              <p className="text-purple-100 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                &ldquo;Success is the sum of small efforts, repeated
                daily.&rdquo; Ready to smash your learning goals today?
              </p>

              {}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner text-xs sm:text-sm font-semibold"
                >
                  <span className="text-amber-300 text-base">🔥</span>
                  <span>{student.streakDays || 7} Day Streak!</span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner text-xs sm:text-sm font-semibold"
                >
                  <span className="text-yellow-300 text-base">⚡</span>
                  <span>{student.xpPoints || 1200} XP Earned</span>
                </motion.div>
              </div>
            </motion.div>

            {}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="flex items-center justify-center lg:justify-end gap-6 w-full lg:w-auto"
            >
              {/* Animated SVG illustration representing studying / student explorer */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full bg-white/10 animate-ping opacity-25 duration-1000" />

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: 'easeInOut',
                  }}
                  className="relative z-10 w-full h-full flex items-center justify-center filter drop-shadow-xl"
                >
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Floating Books Stack */}
                    <path
                      d="M40 130L100 110L160 130L100 150L40 130Z"
                      fill="#C4B5FD"
                    />
                    <path
                      d="M40 140L100 120L160 140L100 160L40 140Z"
                      fill="#8B5CF6"
                    />
                    <path
                      d="M40 150L100 130L160 150L100 170L40 150Z"
                      fill="#6D28D9"
                    />

                    {/* Glowing Graduation Cap / Icon Representation */}
                    <motion.path
                      animate={{ rotate: [-2, 2, -2] }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: 'easeInOut',
                      }}
                      d="M100 50L150 70L100 90L50 70L100 50Z"
                      fill="#FBBF24"
                    />
                    <path
                      d="M135 82.5V105C135 115 118 120 100 120C82 120 65 115 65 105V82.5"
                      stroke="#FBBF24"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M148 76V112"
                      stroke="#F59E0B"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx="148" cy="115" r="4" fill="#F59E0B" />

                    {/* Floating Sparkles */}
                    <circle cx="35" cy="70" r="4" fill="#FEF08A" />
                    <circle cx="165" cy="50" r="3" fill="#E9D5FF" />
                    <circle cx="170" cy="120" r="5" fill="#FEF08A" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Masonry Layout */}
      <main className="gap-6 px-4 mt-6 space-y-6 columns-1 md:columns-2 xl:columns-3">
        {/* Payment Card */}
        <motion.div className="p-5 transition bg-white border shadow-sm break-inside-avoid rounded-2xl hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <CreditCard className="text-teal-600" size={20} />
            <span className="text-xs text-slate-400 font-medium">
              Financial Overview
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Total Payable (Fee + Mess)
          </p>
          <h2 className="text-2xl font-semibold text-slate-800">
            ৳ {grandTotalFee.toLocaleString()}
          </h2>

          <div className="mt-4">
            <div className="flex justify-between mb-1 text-xs font-medium">
              <span className="text-teal-600">
                Paid: ৳ {grandTotalPaid.toLocaleString()}
              </span>
              <span className="text-rose-500">
                Due: ৳ {grandTotalDue.toLocaleString()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                className="h-full bg-teal-500 rounded-full"
              />
            </div>

            {/* Detailed Breakdowns */}
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Admission (Paid / Due):</span>
                <span className="font-medium text-slate-700">
                  ৳ {admissionPaid.toLocaleString()} / ৳{' '}
                  {admissionDue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mess Service (Paid / Due):</span>
                <span className="font-medium text-slate-700">
                  ৳ {messPaid.toLocaleString()} / ৳ {messDue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upcoming */}
        <div className="p-5 transition bg-white border shadow-sm break-inside-avoid rounded-2xl hover:shadow-md">
          <h3 className="flex items-center gap-2 mb-4 text-sm font-semibold">
            <Clock size={16} /> Upcoming
          </h3>

          <div className="space-y-4">
            {allRoutines?.routines
              ?.filter((r) => new Date(r.date) >= new Date())
              ?.sort((a, b) => new Date(a.date) - new Date(b.date))
              ?.slice(0, 4)
              ?.map((r, i) => (
                <div key={i}>
                  <p className="text-xs text-teal-600">
                    {formatDateDMY(r.date)}
                  </p>
                  <p className="text-sm font-medium">
                    {r.subjects?.[0] || 'Class'}
                  </p>
                  <p className="text-xs text-slate-400">{r.time}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="p-5 bg-white border shadow-sm break-inside-avoid rounded-2xl">
          <div className="flex justify-between mb-4">
            <h3 className="text-sm font-semibold">
              {currentDate?.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>

            <div className="flex gap-2">
              <button onClick={handlePrevMonth}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={handleNextMonth}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getCalendarGrid(currentDate)?.map((day, i) => {
              const isSelected =
                day.date.toDateString() === selectedDate.toDateString();

              const isToday =
                day.date.toDateString() === new Date().toDateString();

              const hasClass = allRoutines?.routines?.some(
                (r) =>
                  new Date(r.date).toDateString() === day.date.toDateString(),
              );

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day?.date)}
                  className={`
        relative text-xs rounded-full w-9 h-9 p-2 transition-all
        ${isSelected ? 'bg-teal-600 text-white scale-105' : ''}
        ${!isSelected && 'hover:bg-slate-100'}
        ${isToday && !isSelected ? 'ring-2 ring-teal-500' : ''}
      `}
                >
                  {day.date.getDate()}

                  {/* ✅ Class indicator dot */}
                  {hasClass && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Announcements */}
        <motion.div className="p-5 bg-white border shadow-sm break-inside-avoid rounded-2xl">
          <div className="flex justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Bell size={16} /> Announcements
            </h2>
          </div>

          <div className="space-y-3">
            {announcements?.length > 0 ? (
              announcements?.slice(0, 3).map((ann, i) => (
                <div key={i} className="p-3 rounded-xl hover:bg-slate-50">
                  <p className="text-xs text-teal-600 uppercase">{ann.type}</p>
                  <p className="text-sm font-medium">{ann.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {ann.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">
                No announcements available
              </p>
            )}
          </div>
        </motion.div>

        {/* Class Details */}
        <div className="break-inside-avoid p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition min-h-[320px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                📘 My Classes
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-slate-100">
              <CalendarIcon size={16} />
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {selectedDateRoutines?.length > 0 ? (
              <motion.div
                key={selectedDate.toDateString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {selectedDateRoutines?.map((routine, idx) => (
                  <div
                    key={idx}
                    className="p-4 transition border rounded-xl border-slate-200 bg-slate-50 hover:bg-white"
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-teal-600">
                        {formatDateDMY(routine?.date)}
                      </span>
                      <span className="text-xs text-slate-400">
                        Session {idx + 1}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-slate-800">
                      {routine?.subjects?.join(', ') || 'General Class'}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-teal-600" />
                        {routine.time}
                      </span>

                      <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-rose-500" />
                        Room {routine.room}
                      </span>

                      <span className="flex items-center gap-1">
                        <Users size={14} className="text-indigo-500" />
                        {routine.batch}
                      </span>
                    </div>

                    {/* Subjects tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {routine?.subjects?.map((sub, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-[10px] font-medium bg-white border border-slate-200 rounded-full"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <BookOpen className="mb-3 text-slate-300" size={32} />
                <p className="text-sm font-medium text-slate-500">
                  No classes scheduled
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Select another date to view routines
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

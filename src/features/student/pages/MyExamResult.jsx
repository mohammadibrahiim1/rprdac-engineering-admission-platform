import React from 'react';
import { motion } from 'framer-motion';
import { useStudentPortalData } from '../hooks/studentPortalData';
import Loader from '../../../../components/Loader';
import { formatDateDMY } from '../../../../constants/dateFormat';
import { Award, Calendar, User } from 'lucide-react';

// ফ্রেমার মোশন অ্যানিমেশন কনফিগ
const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const MyExamResult = () => {
  const { studentInfo, examData, getResultLoading, getResultError } =
    useStudentPortalData();

  const records = examData?.data || [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen text-gray-900 font-sans selection:bg-blue-100"
    >
      {/*— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — 
          HEADER & BREADCRUMB SECTION (Notion minimal style)
         — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — */}
      <header>
        {/* ── Pixel Perfect Modern Premium Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative mb-8 p-6 sm:p-7 bg-gradient-to-br from-[#55004B] via-[#6a0060] to-[#800075] text-white shadow-xl overflow-hidden border border-purple-500/10"
        >
          <div className="absolute top-0 right-0 w-80 h-80 transform translate-x-20 -translate-y-20 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center text-2xl font-bold text-white border shadow-inner shrink-0 w-14 h-14 rounded-md bg-white/10 backdrop-blur-md border-white/20 select-none">
                🎓
              </div>

              <div>
                <span className="inline-flex items-center text-[10px] font-semibold tracking-wider text-purple-100 uppercase bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/5">
                  See Your Result
                </span>
                <h1 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl capitalize">
                  Result & Merit, {studentInfo?.name || 'Student'}!
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-purple-100/90">
                  <span className="flex items-center gap-1 bg-black/15 px-2.5 py-1 rounded-md border border-white/5">
                    <User size={12} className="text-purple-300" />
                    UID:{' '}
                    <span className="text-white font-medium">
                      {studentInfo?.studentUniqueId ||
                        studentInfo?.userId ||
                        'N/A'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 bg-black/15 px-2.5 py-1 rounded-md border border-white/5">
                    <Award size={12} className="text-purple-300" />
                    Batch:{' '}
                    <span className="text-white font-medium">
                      {studentInfo?.batch || 'N/A'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center self-start lg:self-center px-4 py-2 border shadow-sm bg-white/10 backdrop-blur-md border-white/10 rounded-md">
              <Calendar size={14} className="text-purple-200 mr-2" />
              <span className="text-xs font-bold text-white">
                {new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </motion.div>
      </header>

      {/*— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — 
          MAIN CONTENT SECTION (Table / Empty State)
         — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — */}
      {records.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center p-12 rounded-md text-center shadow-xs"
        >
          <span className="text-4xl mb-3">📂</span>
          <p className="text-base font-semibold text-gray-700">
            No records found.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Your exam results haven&apos;t been published or uploaded by the
            administrator yet.
          </p>
        </motion.div>
      ) : (
        /* Responsive Card-Grid for Mobile, Table for Desktop */
        <motion.div
          variants={itemVariants}
          className="bg-white border border-gray-200/80 rounded-md shadow-xs overflow-hidden"
        >
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="text-xs font-semibold text-gray-400 uppercase bg-[#FBFBFB] border-b border-gray-200/60 tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-[25%]">Student Profile</th>
                  <th className="px-6 py-4 w-[30%]">Exam Information</th>
                  <th className="px-6 py-4 w-[30%]">Dynamic Score Matrix</th>
                  <th className="px-6 py-4 w-[15%] text-right">
                    Published Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-normal">
                {records?.map((record) => {
                  const exam = record.examInfo;

                  return (
                    <motion.tr
                      whileHover={{ backgroundColor: '#FAFAFA' }}
                      key={record._id}
                      className="transition-colors group"
                    >
                      {/* Student Info */}
                      <td className="px-6 py-5 align-top">
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {record.studentName}
                        </div>
                        <div className="text-xs font-mono text-gray-400 mt-1 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded w-max">
                          ID: {record.studentId}
                        </div>
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shadow-xs">
                            Row #{record.rowNumber}
                          </span>
                        </div>
                      </td>

                      {/* Exam Details (Joined Data) */}
                      <td className="px-6 py-5 align-top">
                        {exam ? (
                          <div className="space-y-2">
                            <div className="font-semibold text-gray-800 text-[15px] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              {exam.model}{' '}
                              <span className="text-gray-400 font-normal text-xs">
                                ({exam.examType})
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 space-y-0.5 pl-3 border-l-2 border-gray-200">
                              <div>
                                <span className="font-medium text-gray-700">
                                  Exam Date:
                                </span>{' '}
                                <span>{formatDateDMY(exam?.examDate)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Dept:
                                </span>{' '}
                                {exam.departmentId}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Semester:
                                </span>{' '}
                                {exam.semester}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Total Marks:
                                </span>{' '}
                                <span className="font-semibold text-gray-900">
                                  {exam.totalMarks}
                                </span>
                              </div>
                            </div>
                            <div className="pt-1 pl-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide border
                                ${
                                  exam.status === 'Published'
                                    ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50/80 text-amber-700 border-amber-200'
                                }`}
                              >
                                {exam.status}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-rose-500 italic bg-rose-50 border border-rose-100 px-3 py-2 rounded-md w-max">
                            <span>⚠️</span> Exam data unlinked or draft status
                          </div>
                        )}
                      </td>

                      {/* Dynamic Scorecard Data */}
                      <td className="px-6 py-5 align-top">
                        <div className="grid grid-cols-2 gap-2 max-w-sm">
                          {record.data &&
                            Object.entries(record.data).map(([key, val]) => {
                              if (key === 'roll_no' || key === 'roll')
                                return null;

                              let bgClass =
                                'bg-gray-50 text-gray-700 border-gray-200/60';
                              const cleanKey = key.toLowerCase();

                              if (
                                cleanKey.includes('mark') ||
                                cleanKey.includes('score') ||
                                cleanKey.includes('total')
                              ) {
                                bgClass =
                                  'bg-blue-50/60 text-blue-800 border-blue-200/40';
                              } else if (
                                cleanKey.includes('grade') ||
                                cleanKey.includes('gpa') ||
                                cleanKey.includes('lg')
                              ) {
                                bgClass =
                                  'bg-purple-50/70 text-purple-800 border-purple-200/40';
                              } else if (
                                cleanKey.includes('status') ||
                                cleanKey.includes('remarks') ||
                                cleanKey.includes('pass')
                              ) {
                                bgClass =
                                  'bg-teal-50/60 text-teal-800 border-teal-200/40';
                              }

                              return (
                                <div
                                  key={key}
                                  className={`flex flex-col p-2 rounded-md border text-xs transition-transform hover:scale-[1.01] ${bgClass}`}
                                >
                                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                                    {key.replace('_', ' ')}
                                  </span>
                                  <span className="font-bold text-[13px]">
                                    {String(val)}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-5 align-top text-right text-xs text-gray-400 font-mono">
                        {new Date(record.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card Layout View */}
          <div className="block lg:hidden divide-y divide-gray-100">
            {records.map((record) => {
              const exam = record.examInfo;
              return (
                <div
                  key={record._id}
                  className="p-5 space-y-4 bg-white hover:bg-gray-50/40 transition-colors"
                >
                  {/* Mob Info Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        {record.studentName}
                      </h3>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">
                        ID: {record.studentId}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-gray-400">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Mob Info Badges */}
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Row #{record.rowNumber}
                    </span>
                  </div>

                  {/* Mob Exam Info Card */}
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200/60 text-xs space-y-1.5">
                    {exam ? (
                      <>
                        <div className="font-bold text-blue-800 flex justify-between items-center text-sm">
                          <span>
                            {exam.model} ({exam.examType})
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${exam.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                          >
                            {exam.status}
                          </span>
                        </div>
                        <div className="text-gray-500 grid grid-cols-2 gap-y-1 pt-1 border-t border-gray-200/60 mt-1">
                          <div>
                            <span className="font-medium text-gray-600">
                              Dept:
                            </span>{' '}
                            {exam.departmentId}
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Sem:
                            </span>{' '}
                            {exam.semester}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium text-gray-600">
                              Total Marks:
                            </span>{' '}
                            {exam.totalMarks}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-rose-500 italic">
                        ⚠️ Exam data unlinked or draft status
                      </p>
                    )}
                  </div>

                  {/* Mob Score Fields */}
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                      Scores & Remarks
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {record.data &&
                        Object.entries(record.data).map(([key, val]) => {
                          if (key === 'roll_no' || key === 'roll') return null;
                          return (
                            <div
                              key={key}
                              className="p-2 bg-gray-50 rounded border border-gray-200/60 flex flex-col"
                            >
                              <span className="text-[9px] text-gray-400 uppercase font-medium">
                                {key.replace('_', ' ')}
                              </span>
                              <span className="font-bold text-gray-800 text-xs mt-0.5">
                                {String(val)}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MyExamResult;

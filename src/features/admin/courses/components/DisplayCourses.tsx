import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Zap,
  FileText,
  PlayCircle,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Lock,
  Clock,
  Eye,
  BookOpen,
  X,
  ArrowRight,
  Layers,
  BookMarked,
  Video,
} from 'lucide-react';
import type {
  ICourse,
  ITopic,
  CourseType,
  DisplayCoursesProps,
} from '../types/course.types';

const cardThemes = [
  {
    border: 'border-sky-200 dark:border-sky-800/60',
    headerBg: 'bg-sky-50 dark:bg-sky-950/40',
    headerText: 'text-sky-800 dark:text-sky-200',
    iconBg: 'bg-sky-600',
    price: 'text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
    button: 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/20',
  },
  {
    border: 'border-emerald-200 dark:border-emerald-800/60',
    headerBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    headerText: 'text-emerald-800 dark:text-emerald-200',
    iconBg: 'bg-emerald-600',
    price: 'text-emerald-700 dark:text-emerald-300',
    badge:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    button: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20',
  },
  {
    border: 'border-violet-200 dark:border-violet-800/60',
    headerBg: 'bg-violet-50 dark:bg-violet-950/40',
    headerText: 'text-violet-800 dark:text-violet-200',
    iconBg: 'bg-violet-600',
    price: 'text-violet-700 dark:text-violet-300',
    badge:
      'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    button: 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/20',
  },
];

const formatPrice = (price?: number | null) =>
  price != null ? `৳ ${price.toLocaleString('en-BD')}` : '৳ 0';

const getCourseTypeLabel = (type: CourseType) => {
  switch (type) {
    case 'departmental':
      return 'Departmental';
    case 'non_departmental':
      return 'Non Departmental';
    case 'combo_package':
      return 'Combo Package';
    default:
      return 'Course';
  }
};

export default function DisplayCourses({
  courses,
  isLoading,
  searchQuery,
  searchTarget,
  selectedCourse,
  setSelectedCourse,
  expandedTopics,
  expandedChapters,
  toggleTopic,
  toggleChapter,
  handleBuyFullCourse,
  handleBuyTopic,
}: DisplayCoursesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-[380px] rounded-2xl bg-slate-200/60 dark:bg-slate-800/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!courses?.length) {
    return (
      <div className="text-center py-24">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
          No courses or topics found
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Try changing your search or filter options
        </p>
      </div>
    );
  }

  const showFullCoursePrice = searchTarget !== 'topic';
  const isTopicMode =
    searchTarget === 'topic' ||
    (searchQuery.trim().length > 0 && searchTarget === 'all');

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {courses?.map((course, index) => {
          const theme = cardThemes[index % cardThemes.length];

          const displayedTopics = searchQuery
            ? course.topics?.filter((t) =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase()),
              )
            : course.topics;

          if (
            searchQuery &&
            searchTarget === 'topic' &&
            (!displayedTopics || displayedTopics.length === 0)
          ) {
            return null;
          }

          return (
            <motion.div
              key={course?._id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className={`group relative rounded-2xl border ${theme.border} bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col`}
            >
              <div
                className={`${theme.headerBg} px-5 py-3.5 flex items-center justify-between`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg ${theme.iconBg} text-white flex items-center justify-center shadow-sm`}
                  >
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-semibold ${theme.headerText}`}>
                    {getCourseTypeLabel(course.courseType)}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${theme.badge}`}
                >
                  {course.code}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <h2 className="text-[17px] font-bold text-slate-800 dark:text-white leading-snug mb-1">
                    {course.title}
                  </h2>

                  {showFullCoursePrice && !isTopicMode && (
                    <div className="flex items-end justify-between gap-2 mt-3">
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Full Course
                        </p>
                        <p className={`text-xl font-extrabold ${theme.price}`}>
                          {formatPrice(course.discountPrice || course.price)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 py-2.5 text-center border border-slate-100 dark:border-slate-700/50">
                    <Layers className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {course.topicCount}
                    </p>
                    <p className="text-[10px] text-slate-500">Topics</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 py-2.5 text-center border border-slate-100 dark:border-slate-700/50">
                    <BookMarked className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {course.chapterCount}
                    </p>
                    <p className="text-[10px] text-slate-500">Chapters</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 py-2.5 text-center border border-slate-100 dark:border-slate-700/50">
                    <Video className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {course.lessonCount}
                    </p>
                    <p className="text-[10px] text-slate-500">Lessons</p>
                  </div>
                </div>

                {/* Topics List: Jodi topic search kora hoy, tahobe kebol 1-ti matching topic dekhabe */}
                <div className="space-y-2 mb-5 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {isTopicMode ? 'Matching Topic' : 'Topics'}
                    </p>
                    {!isTopicMode &&
                      displayedTopics &&
                      displayedTopics.length > 1 && (
                        <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                          +{displayedTopics.length - 1} more
                        </span>
                      )}
                  </div>

                  {(isTopicMode
                    ? displayedTopics
                    : displayedTopics?.slice(0, 1)
                  )?.map((topic, i) => (
                    <div
                      key={topic._id}
                      className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {topic.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatPrice(topic.discountPrice || topic.price)}
                        </span>
                        <button
                          onClick={() => handleBuyTopic(course, topic)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-500 transition-all"
                        >
                          Buy Topic
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Details
                  </button>

                  {showFullCoursePrice && !isTopicMode && (
                    <button
                      onClick={() => handleBuyFullCourse(course)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-md active:scale-[0.98] transition-all ${theme.button}`}
                    >
                      <ShoppingCart className="w-4 h-4" /> Buy Full
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ==================== DETAILS MODAL ==================== */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setSelectedCourse(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 sticky top-0 z-10">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                      {selectedCourse.title}
                    </h2>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300 font-semibold">
                      {selectedCourse.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedCourse.topicCount} Topics ·{' '}
                    {selectedCourse.chapterCount} Chapters ·{' '}
                    {selectedCourse.lessonCount} Lessons
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {showFullCoursePrice && !isTopicMode && (
                    <button
                      onClick={() => handleBuyFullCourse(selectedCourse)}
                      className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Buy Full (
                      {formatPrice(
                        selectedCourse.discountPrice || selectedCourse.price,
                      )}
                      )
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Jodi topic search kora hoy, tahole kebol oi topic-er details-i dekhabe */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800/40 px-4 py-2.5 rounded-xl">
                  <span className="text-sky-600 dark:text-sky-400">Course</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Topic
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="text-violet-600 dark:text-violet-400">
                    Chapter
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="text-amber-600 dark:text-amber-400">
                    Lesson
                  </span>
                </div>

                {(searchQuery && isTopicMode
                  ? selectedCourse.topics?.filter((t) =>
                      t.title.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                  : selectedCourse.topics
                )?.map((topic) => {
                  const isTopicOpen = expandedTopics[topic._id] !== false;

                  return (
                    <div
                      key={topic._id}
                      className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900/80 overflow-hidden"
                    >
                      <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-emerald-100">
                              {topic.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {topic.chapterCount} Chapters ·{' '}
                              {topic.lessonCount} Lessons ·{' '}
                              <span className="font-bold text-emerald-600">
                                {formatPrice(
                                  topic.discountPrice || topic.price,
                                )}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleBuyTopic(selectedCourse, topic)
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Buy Topic
                          </button>
                          <button
                            onClick={() => toggleTopic(topic._id)}
                            className="p-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 transition-colors"
                          >
                            {isTopicOpen ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Chapters & Lessons */}
                      <AnimatePresence>
                        {isTopicOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
                              {topic.chapters?.length === 0 ? (
                                <p className="text-sm text-slate-400 italic text-center py-3">
                                  No chapters available in this topic
                                </p>
                              ) : (
                                topic.chapters.map((chapter) => {
                                  const isChapterOpen =
                                    !!expandedChapters[chapter._id];

                                  return (
                                    <div
                                      key={chapter._id}
                                      className="rounded-xl border border-violet-200 dark:border-violet-900/40 bg-white dark:bg-slate-900 overflow-hidden"
                                    >
                                      <div className="p-3.5 flex items-center justify-between gap-2 bg-violet-50/60 dark:bg-violet-950/20">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-violet-100 truncate">
                                              {chapter.title}
                                            </h4>
                                            <p className="text-[11px] text-violet-600 dark:text-violet-300">
                                              {chapter.lessonCount} Lessons
                                            </p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() =>
                                            toggleChapter(chapter._id)
                                          }
                                          className="text-xs font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                                        >
                                          {isChapterOpen ? 'Hide' : 'Show'}
                                          {isChapterOpen ? (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                          ) : (
                                            <ChevronRight className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      </div>

                                      <AnimatePresence>
                                        {isChapterOpen && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                              height: 'auto',
                                              opacity: 1,
                                            }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="p-3 space-y-2">
                                              {chapter.lessons?.length === 0 ? (
                                                <p className="text-xs text-slate-400 italic py-2 text-center">
                                                  No lessons yet
                                                </p>
                                              ) : (
                                                chapter.lessons.map(
                                                  (lesson) => (
                                                    <div
                                                      key={lesson._id}
                                                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 text-xs"
                                                    >
                                                      <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-7 h-7 rounded-md bg-sky-600 text-white flex items-center justify-center flex-shrink-0">
                                                          <PlayCircle className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                                          {lesson.order}.{' '}
                                                          {lesson.title}
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center gap-2 flex-shrink-0">
                                                        {lesson.duration && (
                                                          <span className="flex items-center gap-0.5 text-[11px] text-slate-500">
                                                            <Clock className="w-3 h-3" />{' '}
                                                            {lesson.duration}s
                                                          </span>
                                                        )}
                                                        {lesson.isFreePreview ? (
                                                          <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                                                            <Eye className="w-2.5 h-2.5" />{' '}
                                                            Free
                                                          </span>
                                                        ) : (
                                                          <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                                                            <Lock className="w-2.5 h-2.5" />{' '}
                                                            Locked
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                  ),
                                                )
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

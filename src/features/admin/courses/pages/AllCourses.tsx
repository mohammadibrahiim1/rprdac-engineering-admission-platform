import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, GraduationCap } from 'lucide-react';
import DisplayCourses from '../components/DisplayCourses';
import { useCourses } from '../hooks/useCourses';

export default function AllCourses() {
  const {
    search,
    setSearch,
    courseType,
    setCourseType,
    searchTarget,
    setSearchTarget,
    courses,
    isLoading,
    isError,
    selectedCourse,
    setSelectedCourse,
    expandedTopics,
    expandedChapters,
    toggleTopic,
    toggleChapter,
    handleBuyFullCourse,
    handleBuyTopic,
  } = useCourses();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Available Courses & Topics
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                Explore full courses or individual topics and start learning
                securely
              </p>
            </div>
          </motion.div>
        </div>

        {/* Search + Filters + Target Selector */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-3"
        >
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course title, code or topic name (e.g. Vector, Fluid...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 text-sm"
            />
          </div>

          {/* Search Target Selector (All / Course / Topic) */}
          <div className="relative min-w-[160px]">
            <select
              value={searchTarget}
              onChange={(e) => setSearchTarget(e.target.value as any)}
              className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40 text-sm cursor-pointer font-medium"
            >
              <option value="all">Select Course</option>
              <option value="course">Full Course</option>
              <option value="topic">Topic</option>
            </select>
          </div>

          {/* Course Type Filter */}
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value as any)}
              className="w-full appearance-none pl-10 pr-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40 text-sm cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="departmental">Departmental</option>
              <option value="non_departmental">Non Departmental</option>
              <option value="combo_package">Combo Package</option>
            </select>
          </div>
        </motion.div>

        {isError && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-center text-sm">
            Failed to load courses. Please try again later.
          </div>
        )}

        <DisplayCourses
          courses={courses}
          isLoading={isLoading}
          searchQuery={search}
          searchTarget={searchTarget}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          expandedTopics={expandedTopics}
          expandedChapters={expandedChapters}
          toggleTopic={toggleTopic}
          toggleChapter={toggleChapter}
          handleBuyFullCourse={handleBuyFullCourse}
          handleBuyTopic={handleBuyTopic}
        />
      </section>
    </div>
  );
}

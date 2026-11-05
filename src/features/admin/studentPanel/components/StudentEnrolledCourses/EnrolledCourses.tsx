import React from 'react';
import { BookOpen, PlayCircle, Award, ChevronRight } from 'lucide-react';

type Course = {
  _id: string;
  title: string;
  thumbnail: string;
  totalSubjects: number;
  progress: number;
};

type Props = {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
};

export default function EnrolledCourses({ courses, onSelectCourse }: Props) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          My Enrolled Courses
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Continue your learning journey and achieve your goals.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            onClick={() => onSelectCourse(course._id)}
            className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition hover:border-violet-500/50 hover:bg-slate-900 shadow-xl"
          >
            <div className="relative h-48 w-full overflow-hidden bg-slate-800">
              <img
                src={course.thumbnail || '/placeholder-course.jpg'}
                alt={course.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>

            <div className="p-5 space-y-4">
              <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition">
                {course.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-violet-400" />
                  {course.totalSubjects} Subjects
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-400" />
                  {course.progress}% Completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>

              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600/15 py-2.5 text-sm font-semibold text-violet-300 transition group-hover:bg-violet-600 group-hover:text-white">
                <PlayCircle className="h-4 w-4" />
                Start Learning
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

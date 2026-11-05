import React from 'react';
import { BookOpen, Layers, ChevronRight, ArrowLeft } from 'lucide-react';

type Subject = {
  _id: string;
  label: string;
  code: string;
  totalLessons: number;
};

type Props = {
  courseTitle: string;
  subjects: Subject[];
  onBack: () => void;
  onSelectSubject: (subjectId: string) => void;
};

export default function CourseSubjects({
  courseTitle,
  subjects,
  onBack,
  onSelectSubject,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </button>

      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {courseTitle}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Select a subject to view available classes and lessons.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div
            key={subject._id}
            onClick={() => onSelectSubject(subject._id)}
            className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-violet-500/50 hover:bg-slate-900 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 mb-4 group-hover:scale-110 transition">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition">
                {subject.label}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Code: {subject.code}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Layers className="h-4 w-4 text-violet-400" />
                {subject.totalLessons} Lessons
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-violet-400 group-hover:translate-x-1 transition">
                Explore <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

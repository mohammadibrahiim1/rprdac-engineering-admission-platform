import React from 'react';
import { PlayCircle, Lock, CheckCircle2, ArrowLeft, Clock } from 'lucide-react';

type Lesson = {
  _id: string;
  title: string;
  duration: string;
  order: number;
  videoUrl: string;
};

type Props = {
  subjectTitle: string;
  lessons: Lesson[];
  completedLessons: string[];
  onBack: () => void;
  onSelectLesson: (lesson: Lesson) => void;
};

export default function SubjectLessons({
  subjectTitle,
  lessons,
  completedLessons,
  onBack,
  onSelectLesson,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Subjects
      </button>

      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {subjectTitle}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Complete lessons sequentially to unlock the next classes.
        </p>
      </header>

      <div className="space-y-4 max-w-4xl">
        {lessons.map((lesson, index) => {
          // 💡 Sequential Lock Logic: 1st lesson is always unlocked, or previous lesson must be completed
          const isUnlocked =
            index === 0 || completedLessons.includes(lessons[index - 1]._id);
          const isCompleted = completedLessons.includes(lesson._id);

          return (
            <div
              key={lesson._id}
              onClick={() => isUnlocked && onSelectLesson(lesson)}
              className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition ${
                isUnlocked
                  ? 'bg-slate-900/80 border-slate-800 cursor-pointer hover:border-violet-500/50 hover:bg-slate-900'
                  : 'bg-slate-950 border-slate-900 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isUnlocked
                        ? 'bg-violet-600/20 text-violet-400'
                        : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : isUnlocked ? (
                    <PlayCircle className="h-6 w-6" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                    Lesson {index + 1}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {lesson.title}
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <Clock className="h-3.5 w-3.5" />{' '}
                    {lesson.duration || '10:00 mins'}
                  </span>
                </div>
              </div>

              <div>
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                    Completed
                  </span>
                ) : isUnlocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/2 fakta px-3 py-1 text-xs font-semibold text-violet-300">
                    Watch Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-500">
                    Locked 🔒
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

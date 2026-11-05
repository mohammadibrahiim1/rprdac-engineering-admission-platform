import React from 'react';
import StudentProgress from './EnrollmentProgress';

export default function EnrollmentSidebar({
  sections,
  activeSection,
  setActiveSection,
  progressPct,
}) {
  return (
    <div className="w-full bg-white border-r border-slate-100 flex flex-col justify-between h-auto">
      <div className="p-5">
        {/* Sidebar Header Label */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-1.5">
          Form Section
        </p>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {sections?.map((section, index) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2 rounded-md text-left
                  transition-all duration-200 group relative select-none
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20
                  ${
                    isActive
                      ? 'bg-[#0d1b3e] text-white shadow-md shadow-slate-900/10'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }
                `}
              >
                {/* Icon Container */}
                <div
                  className={`
                    w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Label Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">
                    {section.label}
                  </p>
                </div>

                {/* Step Status Counter */}
                <span
                  className={`text-xs font-bold flex-shrink-0 tabular-nums transition-colors ${
                    isActive
                      ? 'text-indigo-300'
                      : 'text-slate-400 group-hover:text-slate-500'
                  }`}
                >
                  {index + 1}/{sections?.length}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Progress Block */}
      <StudentProgress progressPct={progressPct} />
    </div>
  );
}

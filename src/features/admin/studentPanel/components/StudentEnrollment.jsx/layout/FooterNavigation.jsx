import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function FooterNavigation({
  sections,
  activeSection,
  setActiveSection,
}) {
  const currentIndex = sections.findIndex((s) => s.id === activeSection);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  return (
    <div className="flex items-center justify-start gap-5 px-5 py-4 lg:px-5 mt-3 border-t border-[#f1f0ee] bg-white">
      {/* Previous Button */}
      <button
        type="button"
        onClick={handlePrevious}
        disabled={activeSection === 'personal' || currentIndex === 0}
        className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#e3e2de] text-[12.5px] font-medium text-[#6b6a68] bg-white hover:bg-[#fafaf8] hover:border-[#b5b3aa] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Previous
      </button>

      {/* Dot indicators */}
      <div className="flex items-center gap-1.5">
        {sections.map((s) => (
          <button
            key={s?._id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`h-1.5 rounded-full transition-all duration-200 
              ${
                s.id === activeSection
                  ? 'bg-[#0d1b3e] w-4'
                  : 'bg-[#d1d0cb] hover:bg-[#9b9a97] w-1.5'
              }`}
          />
        ))}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={
          activeSection === 'payment' || currentIndex === sections.length - 1
        }
        className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0d1b3e] text-[12.5px] font-medium text-white hover:bg-[#1a2f5e] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
      >
        Next
        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
      </button>
    </div>
  );
}

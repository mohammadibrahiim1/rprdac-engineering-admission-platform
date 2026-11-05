import { useState, useEffect } from 'react';
import { ENROLLMENT_SECTIONS } from '../constants/sections';

export const useEnrollmentNavigation = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const currentSectionIndex = ENROLLMENT_SECTIONS.findIndex(
    (s) => s.id === activeSection,
  );
  const progressPct =
    ((currentSectionIndex + 1) / ENROLLMENT_SECTIONS.length) * 100;

  return {
    activeSection,
    setActiveSection,
    mounted,
    progressPct,
    sections: ENROLLMENT_SECTIONS,
  };
};

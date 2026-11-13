import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { ENROLLMENT_SECTIONS } from "../constants/sections";

export interface EnrollmentSection {
  id: string;
  [key: string]: unknown;
}

export interface UseEnrollmentNavigationReturn {
  activeSection: string;
  setActiveSection: Dispatch<SetStateAction<string>>;
  mounted: boolean;
  progressPct: number;
  sections: EnrollmentSection[];
}

export const useEnrollmentNavigation = (): UseEnrollmentNavigationReturn => {
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const sections: EnrollmentSection[] = ENROLLMENT_SECTIONS;

  const currentSectionIndex = sections.findIndex((s) => s.id === activeSection);

  const progressPct =
    (((currentSectionIndex >= 0 ? currentSectionIndex : 0) + 1) /
      sections.length) *
    100;

  return {
    activeSection,
    setActiveSection,
    mounted,
    progressPct,
    sections,
  };
};

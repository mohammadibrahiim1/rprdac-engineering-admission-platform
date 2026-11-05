import { DISPLAY_MODE } from '../constants/timeline.constants';

export const pickActiveContent = (timeline) => {
  if (!timeline) return null;

  // Check nested active flags
  if (timeline.application?.isActive) {
    return {
      displayMode: DISPLAY_MODE.APPLICATION,
      title: timeline.title,
      description: timeline.description,
      application: timeline.application,
    };
  }

  if (timeline.admissionTest?.isActive) {
    return {
      displayMode: DISPLAY_MODE.ADMISSION_TEST,
      title: timeline.title,
      description: timeline.description,
      admissionTest: timeline.admissionTest,
    };
  }

  if (timeline.officeHour?.isActive) {
    return {
      displayMode: DISPLAY_MODE.OFFICE_HOUR,
      title: timeline.title,
      description: timeline.description,
      officeHour: timeline.officeHour,
    };
  }

  return null;
};

export const generateDynamicSessions = () => {
  const currentYear = new Date().getFullYear();
  const sessions = [];

  // Generate 4 years before and 4 years after the current year
  for (let i = -4; i <= 4; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    sessions.push(`${startYear}-${endYear}`);
  }

  return sessions;
};

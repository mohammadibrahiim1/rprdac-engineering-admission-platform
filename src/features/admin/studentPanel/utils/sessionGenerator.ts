export const generateSessionOptions = (): string[] => {
  const currentYear = new Date().getFullYear();
  const sessions: string[] = [];

  for (let i = -2; i <= 3; i++) {
    const year = currentYear + i;
    sessions.push(`${year}-${year + 1}`);
  }

  return sessions;
};

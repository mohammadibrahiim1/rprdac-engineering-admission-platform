export const generateSessionOptions = () => {
  const currentYear = new Date().getFullYear();
  const sessions = [];
  for (let i = -2; i <= 3; i++) {
    const year = currentYear + i;
    sessions.push(`${year}-${year + 1}`);
  }
  return sessions;
};

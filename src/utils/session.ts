/**
 * Returns the current academic session.
 *
 * Example:
 * 2026 -> 2026-2027
 */
export const getCurrentSession = (): string => {
  const currentYear = new Date().getFullYear();

  return `${currentYear}-${currentYear + 1}`;
};

/**
 * Generates 11 academic sessions:
 * 5 previous + current + 5 future.
 */
export const getSessionOptions = (): string[] => {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: 11 }, (_, index) => {
    const startYear = currentYear - 5 + index;

    return `${startYear}-${startYear + 1}`;
  });
};

/**
 * Local date formatter.
 * Avoids UTC date shifting.
 */
export const getLocalDate = (): string => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

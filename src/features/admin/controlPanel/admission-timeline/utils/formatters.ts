export type DateInputType = string | number | Date | null | undefined;
export type AnyValueType = unknown;

/**
 * Formats a date into a readable string (e.g., "12 Nov 2026, 08:30 pm").
 */
export const formatDateTime = (date: DateInputType): string => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(parsedDate);
};

/**
 * Formats a date into a readable date-only string (e.g., "12 Nov 2026").
 */
export const formatDate = (date: DateInputType): string => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

/**
 * Normalizes and returns a time string.
 */
export const formatTime = (time: string | null | undefined): string => {
  if (!time) return "-";
  return time;
};

/**
 * Checks if a value is null, undefined, empty string, or empty array.
 */
export const isEmpty = (value: AnyValueType): boolean => {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
};

/**
 * Truncates a string to a specified max length and appends an ellipsis.
 */
export const truncate = (
  text: string | null | undefined,
  length: number = 50,
): string => {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length)}...` : text;
};

/**
 * Asynchronous sleep utility for delays.
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

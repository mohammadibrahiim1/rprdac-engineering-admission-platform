export type DateInputType = string | number | Date | null | undefined;

export const formatDate = (date: DateInputType): string => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  // Check for invalid date
  if (isNaN(parsedDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

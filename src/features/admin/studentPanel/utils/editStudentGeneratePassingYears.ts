export const editStudentGeneratePassingYears = (
  pastYears: number = 10,
  futureYears: number = 5,
): string[] => {
  const currentYear: number = new Date().getFullYear();
  const years: string[] = [];

  for (let y = currentYear - pastYears; y <= currentYear + futureYears; y++) {
    years.push(y.toString());
  }

  return years.reverse();
};

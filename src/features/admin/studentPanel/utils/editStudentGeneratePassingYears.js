export const editStudentGeneratePassingYears = (
  pastYears = 10,
  futureYears = 5,
) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - pastYears; y <= currentYear + futureYears; y++) {
    years.push(y.toString());
  }
  return years.reverse();
};

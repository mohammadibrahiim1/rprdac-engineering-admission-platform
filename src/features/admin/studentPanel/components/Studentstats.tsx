export interface StudentStatsItem {
  dueAmount?: number | string;
  [key: string]: unknown;
}

export interface ComputedStudentStats {
  paidCount: number;
  dueCount: number;
  payRate: number;
  totalItems: number;
}

/**
 * Page-level display stats — calculates quick counts from current page students.
 * Full dataset stats should use the backend statistics field.
 *
 * @param students - current page students
 * @param totalItems - backend total count
 * @returns ComputedStudentStats object containing paidCount, dueCount, payRate, totalItems
 */
export const computeStudentStats = (
  students: StudentStatsItem[] = [],
  totalItems: number = 0,
): ComputedStudentStats => {
  const paidCount = students.filter((s) => Number(s.dueAmount) === 0).length;
  const dueCount = students.length - paidCount;
  const payRate = students.length
    ? Math.round((paidCount / students.length) * 100)
    : 0;

  return { paidCount, dueCount, payRate, totalItems };
};

export interface StatItem {
  _id?: string;
  count: number;
  [key: string]: unknown;
}

/**
 * Backend statistics array → easy-to-use object.
 * [{ _id: "active", count: 12 }] → { active: 12 }
 *
 * @param statsArray - array of backend statistics objects
 * @returns Record mapping string IDs to their respective counts
 */
export const normalizeStats = (
  statsArray: StatItem[] = [],
): Record<string, number> =>
  statsArray.reduce<Record<string, number>>((acc, { _id, count }) => {
    if (_id) {
      acc[_id] = count;
    }
    return acc;
  }, {});

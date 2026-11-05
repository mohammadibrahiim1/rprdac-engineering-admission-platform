/**
 * Page-level display stats — page-এ দেখানো students থেকে quick counts বের করে।
 * Full dataset stats এর জন্য backend statistics field ব্যবহার করো।
 *
 * @param {Array}  students    - current page students
 * @param {number} totalItems  - backend total count
 * @returns {{ paidCount, dueCount, payRate, totalItems }}
 */
export const computeStudentStats = (students = [], totalItems = 0) => {
  const paidCount = students.filter((s) => Number(s.dueAmount) === 0).length;
  const dueCount = students.length - paidCount;
  const payRate = students.length
    ? Math.round((paidCount / students.length) * 100)
    : 0;

  return { paidCount, dueCount, payRate, totalItems };
};

/**
 * Backend statistics array → easy-to-use object.
 * [{ _id: "active", count: 12 }] → { active: 12 }
 *
 * @param {Array} statsArray
 * @returns {Object}
 */
export const normalizeStats = (statsArray = []) =>
  statsArray.reduce((acc, { _id, count }) => {
    if (_id) acc[_id] = count;
    return acc;
  }, {});

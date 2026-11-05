export const getLockData = (lockObj) => {
  if (!lockObj) return {};
  const source = lockObj.payload || lockObj;

  // Determine a unified readable target label dynamically
  let targetDisplay = null;
  if (source.batchName) {
    targetDisplay = `Batch: ${source.batchName}`;
  } else if (source.session) {
    targetDisplay = `Session: ${source.session}`;
  }

  return {
    batchName: source.batchName || null,
    session: source.session || null,
    targetDisplay: targetDisplay, // Dynamic display helper
    startDate: source.startDate || null,
    endDate: source.endDate || null,
    isActive: source.isActive ?? true,
  };
};

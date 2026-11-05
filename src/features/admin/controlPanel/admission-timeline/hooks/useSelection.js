import { useMemo, useState } from 'react';

export const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectAll = (ids) => {
    setSelectedIds(ids);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return useMemo(() => {
    const isSelected = (id) => selectedIds.includes(id);

    return {
      selectedIds,
      toggleSelection,
      selectAll,
      clearSelection,
      isSelected,
    };
  }, [selectedIds]);
};

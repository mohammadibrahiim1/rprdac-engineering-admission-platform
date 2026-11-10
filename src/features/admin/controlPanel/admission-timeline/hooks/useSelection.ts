import { useState, useCallback, useMemo } from 'react';

export interface UseSelectionReturn<T = string> {
  selectedIds: T[];
  toggleSelection: (id: T) => void;
  selectAll: (ids: T[]) => void;
  clearSelection: () => void;
  isSelected: (id: T) => boolean;
}

export const useSelection = <T = string>(): UseSelectionReturn<T> => {
  const [selectedIds, setSelectedIds] = useState<T[]>([]);

  const toggleSelection = useCallback((id: T) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const selectAll = useCallback((ids: T[]) => {
    setSelectedIds(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback(
    (id: T): boolean => selectedIds.includes(id),
    [selectedIds],
  );

  return useMemo(
    () => ({
      selectedIds,
      toggleSelection,
      selectAll,
      clearSelection,
      isSelected,
    }),
    [selectedIds, toggleSelection, selectAll, clearSelection, isSelected],
  );
};
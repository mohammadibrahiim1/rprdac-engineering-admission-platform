import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export const useAdmitCardFilters = () => {
  const [searchTerm, setSearchTerm] = useState({
    date: '',
    examType: '',
    department: '',
    startId: '',
    endId: '',
  });

  const [filter, setFilter] = useState({
    page: 1,
    limit: 10,
    examType: '',
    department: '',
    startId: '',
    endId: '',
    date: '',
  });

  const debouncedFilter = useDebounce(searchTerm, 500);

  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      ...debouncedFilter,
      page: 1,
    }));
  }, [debouncedFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchTerm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10) || 10;
    setFilter((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handlePageChange = (newPage, totalPages) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilter((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setSearchTerm({
      examType: '',
      department: '',
      startId: '',
      endId: '',
      date: '',
    });
    setFilter({
      page: 1,
      limit: 10,
      examType: '',
      department: '',
      startId: '',
      endId: '',
      date: '',
    });
  };

  return {
    searchTerm,
    filter,
    handleInputChange,
    handleLimitChange,
    handlePageChange,
    handleReset,
  };
};

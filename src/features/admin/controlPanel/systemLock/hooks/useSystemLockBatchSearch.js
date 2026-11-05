import { useState, useEffect } from 'react';
import { useGetBatchesQuery } from '../../../../../../redux/features/batch/batchApi';

export const useSystemLockBatchSearch = () => {
  const [batchQuery, setBatchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(batchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [batchQuery]);

  const { data: batchesData, isLoading } = useGetBatchesQuery(searchTerm);
  const batches = batchesData?.data || [];

  return {
    batchQuery,
    setBatchQuery,
    batches,
    isLoading,
  };
};

import { useState, useEffect } from 'react';
import { useGetBatchesQuery } from '../../../../../redux/features/batch/batchApi';
import { useGetAcademicInfosQuery } from '../../../../../redux/features/academic/academicApi';
import { useGetInstitutesQuery } from '../../../../../redux/features/institute/instituteApi';
import { useGetMessesQuery } from '../../../../../redux/features/mess/messApi';

export const useStudentData = (student) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: batches,
    isLoading: isBatchesLoading,
    isError: isBatchesError,
    error: batchesError,
  } = useGetBatchesQuery('');

  const {
    data: academicData,
    isLoading: isAcademicLoading,
    isError: isAcademicError,
    error: academicError,
  } = useGetAcademicInfosQuery();

  const {
    data: institutesData,
    isLoading: isInstitutesLoading,
    isError: isInstitutesError,
    error: institutesError,
  } = useGetInstitutesQuery({
    search: debouncedSearch,
    limit: 100,
    page: 1,
  });

  const {
    data: messData,
    isLoading: isMessesLoading,
    isError: isMessesError,
    error: messesError,
  } = useGetMessesQuery({
    search: debouncedSearch,
  });

  const messSelected = Boolean(student?.mess && student.mess.trim() !== '');

  return {
    // Search State Handlers
    searchTerm,
    setSearchTerm,

    // Data Arrays
    allBatches: batches?.data || [],
    sscInformation: academicData?.data?.sscInformation || [],
    diplomaInformation: academicData?.data?.diplomaInformation || [],
    institutes: institutesData?.data || [],
    messes: messData?.messes || [],
    academicData: academicData?.data || {},
    messSelected,
    // Individual Loaders
    isBatchesLoading,
    isAcademicLoading,
    isInstitutesLoading,
    isMessesLoading,

    // Individual Error Indicators & Messages
    isBatchesError,
    batchesError,
    isAcademicError,
    academicError,
    isInstitutesError,
    institutesError,
    isMessesError,
    messesError,
  };
};

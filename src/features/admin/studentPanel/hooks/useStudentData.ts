import { useGetBatchesQuery } from "@/features/control-panel/control-panel-services/batch/batchApi";
import { useGetAcademicInfosQuery } from "@/redux/features/academic/academicApi";
import { useGetInstitutesQuery } from "@/redux/features/institute/instituteApi";
import { useGetMessesQuery } from "@/redux/features/mess/messApi";
import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

export interface StudentDataInput {
  mess?: string | null;
  [key: string]: unknown;
}

export interface UseStudentDataReturn {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  allBatches: unknown[];
  sscInformation: string[];
  diplomaInformation: string[];
  institutes: unknown[];
  messes: unknown[];
  academicData: Record<string, unknown>;
  messSelected: boolean;
  isBatchesLoading: boolean;
  isAcademicLoading: boolean;
  isInstitutesLoading: boolean;
  isMessesLoading: boolean;
  isBatchesError: boolean;
  batchesError: unknown;
  isAcademicError: boolean;
  academicError: unknown;
  isInstitutesError: boolean;
  institutesError: unknown;
  isMessesError: boolean;
  messesError: unknown;
}

export const useStudentData = (
  student?: StudentDataInput | null,
): UseStudentDataReturn => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: batches,
    isLoading: isBatchesLoading,
    isError: isBatchesError,
    error: batchesError,
  } = useGetBatchesQuery("");

  const {
    data: academicDataResponse,
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

  const messSelected = Boolean(student?.mess && student.mess.trim() !== "");

  const academicData = academicDataResponse?.data || {};

  return {
    // Search State Handlers
    searchTerm,
    setSearchTerm,

    // Data Arrays
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allBatches: (batches as any)?.data || [],
    sscInformation: academicData?.sscInformation || [],
    diplomaInformation: academicData?.diplomaInformation || [],
    institutes: institutesData?.data || [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messes: (messData as any)?.messes || [],
    academicData,
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

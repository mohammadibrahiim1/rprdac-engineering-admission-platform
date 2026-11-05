import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetAllSystemLocksQuery } from '../../admin/controlPanel/systemLock/api/systemLockApi';
import { useGetAcademicInfosQuery } from '../../../../redux/features/academic/academicApi';
import { useGetInstitutesQuery } from '../../../../redux/features/institute/instituteApi';
import { useGetMessesQuery } from '../../../../redux/features/mess/messApi';
import {
  useGetStudentByIdQuery,
  useUpdateStudentInfoByOwnMutation,
} from '../../../../redux/features/student/studentApi';
import { useAddressApi } from '../../../global-admission/hooks/useAddressApi';

const isLockActive = (lock) => {
  if (!lock?.isActive) return false;
  const now = new Date();
  const start = lock.startDate ? new Date(lock.startDate) : null;
  const end = lock.endDate ? new Date(lock.endDate) : null;
  if (start && end) return now >= start && now <= end;
  return true;
};

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 31 }, (_, i) => String(currentYear - i));
};

const RELATION_OPTIONS = [
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Uncle',
  'Aunt',
  'Grandfather',
  'Grandmother',
  'Guardian',
  'Other',
];

const DEFAULT_VALUES = {
  name: '',
  nameInBangla: '',
  phone: '',
  studentWhatsAppNum: '',
  bloodGroup: '',
  session: '',
  instituteName: '',
  department: '',
  sscGroup: '',
  sscBoard: '',
  sscYear: '',
  sscGpa: '',
  diplomaGroup: '',
  diplomaBoard: '',
  diplomaYear: '',
  diplomaGpa: '',
  guardianName: '',
  guardianPhone: '',
  guardianWhatsAppNum: '',
  relationWithGuardian: '',
  permanentZilla: '',
  permanentUpozilla: '',
  permanentVillage: '',
  permanentPostcode: '',
  presentZilla: '',
  presentUpozilla: '',
  presentVillage: '',
  presentPostcode: '',
  comment: '',
  sameAsPhone: false,
  sameAsGuardianPhone: false,
  sameAsPermanent: false,
};

export function useStudentUpdateProfile() {
  const { id: studentId } = useParams();

  const {
    control,
    handleSubmit: hookFormSubmit,
    setValue,
    watch,
    register,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const [isAdminLocked, setIsAdminLocked] = useState(false);
  const [unlockDateTime, setUnlockDateTime] = useState('');
  const [lockMessage, setLockMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState('');

  const sameAsPhone = watch('sameAsPhone');
  const phoneValue = watch('phone');
  const sameAsGuardianPhone = watch('sameAsGuardianPhone');
  const guardianPhoneValue = watch('guardianPhone');
  const sameAsPermanent = watch('sameAsPermanent');
  const permanentZilla = watch('permanentZilla');
  const permanentUpozilla = watch('permanentUpozilla');
  const permanentVillage = watch('permanentVillage');
  const permanentPostcode = watch('permanentPostcode');
  const presentZilla = watch('presentZilla');

  // Auto-fill WhatsApp
  useEffect(() => {
    if (sameAsPhone && phoneValue) {
      setValue('studentWhatsAppNum', phoneValue);
    }
  }, [sameAsPhone, phoneValue, setValue]);

  useEffect(() => {
    if (sameAsGuardianPhone && guardianPhoneValue) {
      setValue('guardianWhatsAppNum', guardianPhoneValue);
    }
  }, [sameAsGuardianPhone, guardianPhoneValue, setValue]);

  // Auto-fill present address from permanent
  useEffect(() => {
    if (!sameAsPermanent) return;
    setValue('presentZilla', permanentZilla || '');
    setValue('presentUpozilla', permanentUpozilla || '');
    setValue('presentVillage', permanentVillage || '');
    setValue('presentPostcode', permanentPostcode || '');
  }, [
    sameAsPermanent,
    permanentZilla,
    permanentUpozilla,
    permanentVillage,
    permanentPostcode,
    setValue,
  ]);

  // Address data (districts + upazilas)
  const { districts = [] } = useAddressApi();

  const districtNames = useMemo(
    () => districts.map((d) => d.name).filter(Boolean),
    [districts],
  );

  const permanentUpazilaOptions = useMemo(() => {
    if (!permanentZilla) return [];
    const match = districts.find(
      (d) => d.name?.toLowerCase() === permanentZilla.toLowerCase(),
    );
    return match?.upazilas || [];
  }, [districts, permanentZilla]);

  const presentUpazilaOptions = useMemo(() => {
    if (!presentZilla) return [];
    const match = districts.find(
      (d) => d.name?.toLowerCase() === presentZilla.toLowerCase(),
    );
    return match?.upazilas || [];
  }, [districts, presentZilla]);

  // When permanent district changes, clear permanent upazila if it no longer exists
  const handlePermanentZillaChange = useCallback(
    (value) => {
      setValue('permanentZilla', value);
      const match = districts.find(
        (d) => d.name?.toLowerCase() === value?.toLowerCase(),
      );
      const list = match?.upazilas || [];
      if (permanentUpozilla && !list.includes(permanentUpozilla)) {
        setValue('permanentUpozilla', '');
      }
    },
    [districts, permanentUpozilla, setValue],
  );

  const handlePresentZillaChange = useCallback(
    (value) => {
      if (sameAsPermanent) return;
      setValue('presentZilla', value);
      const currentUpozilla = watch('presentUpozilla');
      const match = districts.find(
        (d) => d.name?.toLowerCase() === value?.toLowerCase(),
      );
      const list = match?.upazilas || [];
      if (currentUpozilla && !list.includes(currentUpozilla)) {
        setValue('presentUpozilla', '');
      }
    },
    [districts, sameAsPermanent, setValue, watch],
  );

  // Queries
  const {
    data: locksResponse,
    isLoading: locksLoading,
    isError: locksError,
  } = useGetAllSystemLocksQuery();

  const {
    data: studentResponse,
    isLoading: studentLoading,
    isError: studentError,
  } = useGetStudentByIdQuery(studentId);

  const { data: academicData } = useGetAcademicInfosQuery();
  const { data: institutesData } = useGetInstitutesQuery({
    search: '',
    limit: 100,
    page: 1,
  });
  const { data: messData } = useGetMessesQuery({ search: '' });

  const [updateStudentInfoByOwn, { isLoading: isUpdating }] =
    useUpdateStudentInfoByOwnMutation();

  // Derived options
  const sessionOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 3;
    return Array.from({ length: 5 }, (_, i) => {
      const y = startYear + i;
      return `${y}-${y + 1}`;
    });
  }, []);

  const years = useMemo(() => generateYears(), []);
  const messes = messData?.messes || [];
  const institutes = useMemo(
    () => institutesData?.data || [],
    [institutesData?.data],
  );
  const insts = useMemo(
    () => institutes.map((ins) => ins?.name).filter(Boolean),
    [institutes],
  );

  const sscInformation = useMemo(
    () => academicData?.data?.sscInformation || {},
    [academicData?.data?.sscInformation],
  );
  const diplomaInformation = useMemo(
    () => academicData?.data?.diplomaInformation || {},
    [academicData?.data?.diplomaInformation],
  );

  const sscGroups = useMemo(
    () => sscInformation.groups?.map((g) => g?.name).filter(Boolean) || [],
    [sscInformation],
  );
  const sscBoards = useMemo(
    () => sscInformation.boards?.map((b) => b?.name).filter(Boolean) || [],
    [sscInformation],
  );
  const diplomaGroups = useMemo(
    () => diplomaInformation?.groups?.map((g) => g?.name).filter(Boolean) || [],
    [diplomaInformation],
  );
  const diplomaBoards = useMemo(
    () => diplomaInformation?.boards?.map((b) => b?.name).filter(Boolean) || [],
    [diplomaInformation],
  );

  // Load student data
  useEffect(() => {
    if (!studentResponse?.data) return;
    const s = studentResponse.data;
    reset({
      name: s.name || '',
      nameInBangla: s.nameInBangla || '',
      phone: s.phone || '',
      studentWhatsAppNum: s.studentWhatsAppNum || '',
      bloodGroup: s.bloodGroup || '',
      session: s.session || '',
      instituteName: s.instituteName || '',
      department: s.department || '',
      sscGroup: s.sscGroup || '',
      sscBoard: s.sscBoard || '',
      sscYear: s.sscPassingYear ? String(s.sscPassingYear) : '',
      sscGpa: s.sscGpa ?? '',
      diplomaGroup: s.diplomaGroup || '',
      diplomaBoard: s.diplomaBoard || '',
      diplomaYear: s.diplomaPassingYear ? String(s.diplomaPassingYear) : '',
      diplomaGpa: s.diplomaGpa ?? '',
      guardianName: s.guardianName || '',
      guardianPhone: s.guardianPhone || '',
      guardianWhatsAppNum: s.guardianWhatsAppNum || '',
      relationWithGuardian: s.relationWithGuardian || '',
      permanentZilla: s.permanentZilla || '',
      permanentUpozilla: s.permanentUpozilla || '',
      permanentVillage: s.permanentVillage || '',
      permanentPostcode: s.permanentPostcode || '',
      presentZilla: s.presentZilla || '',
      presentUpozilla: s.presentUpozilla || '',
      presentVillage: s.presentVillage || '',
      presentPostcode: s.presentPostcode || '',
      comment: s.comment || '',
      sameAsPhone: false,
      sameAsGuardianPhone: false,
      sameAsPermanent: false,
    });
    if (s.studentPhoto) setOriginalPhotoUrl(s.studentPhoto);
  }, [studentResponse, reset]);

  // System lock
  useEffect(() => {
    if (
      studentLoading ||
      locksLoading ||
      !studentResponse?.data ||
      !locksResponse?.data
    ) {
      return;
    }

    const studentBatch = studentResponse.data.batch;
    if (!studentBatch) {
      setIsAdminLocked(false);
      setLockMessage('');
      setUnlockDateTime('');
      return;
    }

    const matching = locksResponse.data.filter(
      (lock) =>
        lock.scope === 'STUDENT_UPDATE' &&
        lock.batchName === studentBatch &&
        isLockActive(lock),
    );

    if (matching.length === 0) {
      setIsAdminLocked(false);
      setLockMessage('');
      setUnlockDateTime('');
      return;
    }

    const activeLock = matching.reduce((latest, curr) => {
      const currEnd = curr.endDate ? new Date(curr.endDate) : null;
      const latestEnd = latest.endDate ? new Date(latest.endDate) : null;
      if (!latestEnd) return curr;
      if (!currEnd) return latest;
      return currEnd > latestEnd ? curr : latest;
    }, matching[0]);

    setIsAdminLocked(true);
    setLockMessage(
      activeLock.lockReason ||
        "This student's batch is currently locked by the administrator.",
    );
    setUnlockDateTime(
      activeLock.endDate
        ? new Date(activeLock.endDate).toLocaleString()
        : 'unknown',
    );
  }, [studentLoading, locksLoading, studentResponse, locksResponse]);

  // File handlers
  const handleFileChange = useCallback((e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 100 * 1024) {
      alert('File size must be less than 100KB');
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    if (dropped.size > 100 * 1024) {
      alert('File size must be less than 100KB');
      return;
    }
    setFile(dropped);
    setPreviewUrl(URL.createObjectURL(dropped));
  }, []);

  const removePhoto = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setOriginalPhotoUrl('');
  }, []);

  const handleCapture = useCallback((photo) => {
    setFile(photo);
    setPreviewUrl(URL.createObjectURL(photo));
  }, []);

  // Submit — FormData only; backend takes student id from auth token
  const onSubmit = async (data) => {
    if (isAdminLocked) return;

    try {
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (
          key === 'sameAsPhone' ||
          key === 'sameAsGuardianPhone' ||
          key === 'sameAsPermanent' ||
          key === 'studentPhoto'
        ) {
          return;
        }
        if (data[key] !== '' && data[key] != null) {
          formData.append(key, data[key]);
        }
      });

      if (data.sscYear) formData.set('sscPassingYear', Number(data.sscYear));
      if (data.diplomaYear) {
        formData.set('diplomaPassingYear', Number(data.diplomaYear));
      }
      if (data.sscGpa !== '' && data.sscGpa != null) {
        formData.set('sscGpa', Number(data.sscGpa));
      }
      if (data.diplomaGpa !== '' && data.diplomaGpa != null) {
        formData.set('diplomaGpa', Number(data.diplomaGpa));
      }

      formData.delete('sscYear');
      formData.delete('diplomaYear');

      if (file) formData.append('studentPhoto', file);

      await updateStudentInfoByOwn(formData).unwrap();

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4500);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert(
        error?.data?.message || 'Failed to update profile. Please try again.',
      );
    }
  };

  const isPageLoading = studentLoading || locksLoading;
  const hasError = locksError || studentError;
  const displayPhotoUrl = previewUrl || originalPhotoUrl;

  return {
    studentId,
    studentResponse,
    isAdminLocked,
    unlockDateTime,
    lockMessage,
    isSuccess,
    isPageLoading,
    hasError,
    isUpdating,
    locksError,
    studentError,

    control,
    register,
    setValue,
    errors,
    hookFormSubmit,
    onSubmit,

    sameAsPhone,
    sameAsGuardianPhone,
    sameAsPermanent,

    isDragging,
    displayPhotoUrl,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removePhoto,
    handleCapture,

    sessionOptions,
    years,
    insts,
    sscGroups,
    sscBoards,
    diplomaGroups,
    diplomaBoards,
    RELATION_OPTIONS,
    messes,

    // Address dropdowns
    districtNames,
    permanentUpazilaOptions,
    presentUpazilaOptions,
    handlePermanentZillaChange,
    handlePresentZillaChange,
  };
}

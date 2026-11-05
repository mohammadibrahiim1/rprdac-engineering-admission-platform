import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  useGetStudentByIdQuery,
  useUpdateStudentInformationMutation,
} from '../../../../../redux/features/student/studentApi';
import { useStudentData } from './useStudentData';

export const useEditStudentInformation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal');
  const [photoFile, setPhotoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);

  const [updateStudentInformation] = useUpdateStudentInformationMutation();
  const { data: studentData, isLoading: isStudentLoading } =
    useGetStudentByIdQuery(id);

  const student = useMemo(() => studentData?.data, [studentData]);

  const {
    allBatches: batchesData,
    institutes,
    messes,
    academicData,
  } = useStudentData();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: student || {},
    mode: 'onChange',
  });

  /* ── Reset form when student data loads ────────────────── */
  useEffect(() => {
    if (student) {
      reset(student);
      setPhotoFile(null);
      setActiveTab('personal');
    }
  }, [student, reset]);

  /* ── Submit handler ────────────────────────────────────── */
  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (
          k !== '_id' &&
          k !== 'studentPhoto' &&
          v !== undefined &&
          v !== null
        ) {
          formData.append(k, v);
        }
      });

      if (photoFile instanceof File) {
        formData.append('studentPhoto', photoFile);
      }

      await updateStudentInformation({
        id: student._id,
        data: formData,
      }).unwrap();

      toast.success('Student updated successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/admin/student/all');
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  return {
    navigate,
    student,
    isStudentLoading,
    activeTab,
    setActiveTab,
    photoFile,
    setPhotoFile,
    isSaving,
    isEditMode,
    setIsEditMode,
    toggleEditMode,
    batchesData,
    institutes,
    messes,
    academicData,
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    errors,
    isDirty,
    onSubmit,
    handleCancel,
  };
};

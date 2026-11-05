import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { resetForm } from '../../../../../redux/features/student/studentSlice';
import { usePostStudentMutation } from '../../../../../redux/features/student/studentApi';
import { buildStudentFormData } from '../utils/buildStudentFormData';

export const useStudentSubmit = (student, file, resetLocalStates) => {
  const dispatch = useDispatch();
  const [postStudent] = usePostStudentMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = useCallback(
    async (e) => {
      e?.preventDefault();

      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        // Reusing helper function for clean code
        const formData = buildStudentFormData(student, file);
        await postStudent(formData).unwrap();

        resetLocalStates?.();
        toast.success('Student enrolled successfully!');
      } catch (err) {
        toast.error(
          err?.data?.message || err?.message || 'Failed to enroll student.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, student, file, postStudent, resetLocalStates],
  );

  const handleFormReset = useCallback(() => {
    dispatch(resetForm());
    resetLocalStates?.();
    toast.success('Form reset successfully');
  }, [dispatch, resetLocalStates]);

  return {
    isSubmitting,
    handleFormSubmit,
    handleFormReset,
  };
};

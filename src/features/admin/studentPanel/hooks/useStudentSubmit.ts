import { useCallback, useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { usePostStudentMutation } from "../services/api/studentApi";
import { buildStudentFormData } from "../utils/buildStudentFormData";
import { toast } from "sonner";
import { resetForm } from "@/redux/features/student/studentSlice";

export interface UseStudentSubmitReturn {
  isSubmitting: boolean;
  handleFormSubmit: (e?: FormEvent) => Promise<void>;
  handleFormReset: () => void;
}

export const useStudentSubmit = (
  student: Record<string, unknown>,
  file: File | null | undefined,
  resetLocalStates?: () => void,
): UseStudentSubmitReturn => {
  const dispatch = useDispatch();
  const [postStudent] = usePostStudentMutation();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFormSubmit = useCallback(
    async (e?: FormEvent): Promise<void> => {
      e?.preventDefault();

      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        // Reusing helper function for clean code
        const formData = buildStudentFormData(student, file);
        await postStudent(formData).unwrap();

        resetLocalStates?.();
        toast.success("Student enrolled successfully!");
      } catch (err: unknown) {
        const errorObj = err as {
          data?: { message?: string };
          message?: string;
        };
        toast.error(
          errorObj?.data?.message ||
            errorObj?.message ||
            "Failed to enroll student.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, student, file, postStudent, resetLocalStates],
  );

  const handleFormReset = useCallback((): void => {
    dispatch(resetForm());
    resetLocalStates?.();
    toast.success("Form reset successfully");
  }, [dispatch, resetLocalStates]);

  return {
    isSubmitting,
    handleFormSubmit,
    handleFormReset,
  };
};

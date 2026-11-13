import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, UseFormReturn, SubmitHandler } from "react-hook-form";

import { toast } from "sonner";
import {
  useGetStudentByIdQuery,
  useUpdateStudentInformationMutation,
} from "../services/api/studentApi";
import { useStudentData } from "./useStudentData";

/* ── TypeScript Interfaces ──────────────────────────────── */
export interface StudentRecord {
  _id: string;
  id: string;
  studentPhoto?: string;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  data?: {
    message?: string;
  };
  message?: string;
}

export interface UseEditStudentInformationReturn {
  navigate: ReturnType<typeof useNavigate>;
  student: StudentRecord | undefined;
  isStudentLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  photoFile: File | null;
  setPhotoFile: React.Dispatch<React.SetStateAction<File | null>>;
  isSaving: boolean;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleEditMode: () => void;
  batchesData: unknown;
  institutes: unknown;
  messes: unknown;
  academicData: unknown;
  register: UseFormReturn<StudentRecord>["register"];
  handleSubmit: UseFormReturn<StudentRecord>["handleSubmit"];
  control: UseFormReturn<StudentRecord>["control"];
  watch: UseFormReturn<StudentRecord>["watch"];
  setValue: UseFormReturn<StudentRecord>["setValue"];
  errors: UseFormReturn<StudentRecord>["formState"]["errors"];
  isDirty: boolean;
  onSubmit: SubmitHandler<StudentRecord>;
  handleCancel: () => void;
}

/* ══════════════════════════════════════════════════════════ */
export const useEditStudentInformation =
  (): UseEditStudentInformationReturn => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<string>("personal");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(true);

    const [updateStudentInformation] = useUpdateStudentInformationMutation();
    const { data: studentData, isLoading: isStudentLoading } =
      useGetStudentByIdQuery(id, { skip: !id });

    // Safely extract student record from API response
    const student = useMemo<StudentRecord | undefined>(() => {
      return (studentData as { data?: StudentRecord })?.data;
    }, [studentData]);

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
    } = useForm<StudentRecord>({
      defaultValues: student || {},
      mode: "onChange",
    });

    /* ── Reset form when student data loads ────────────────── */
    useEffect(() => {
      if (student) {
        reset(student);
        setPhotoFile(null);
        setActiveTab("personal");
      }
    }, [student, reset]);

    /* ── Submit handler ────────────────────────────────────── */
    const onSubmit: SubmitHandler<StudentRecord> = async (data) => {
      if (!student?._id) {
        toast.error("Student ID is missing");
        return;
      }

      setIsSaving(true);
      try {
        const formData = new FormData();

        // Append form fields securely
        Object.entries(data).forEach(([k, v]) => {
          if (
            k !== "_id" &&
            k !== "studentPhoto" &&
            v !== undefined &&
            v !== null
          ) {
            formData.append(
              k,
              typeof v === "object" ? JSON.stringify(v) : String(v),
            );
          }
        });

        // Append photo file if selected
        if (photoFile instanceof File) {
          formData.append("studentPhoto", photoFile);
        }

        await updateStudentInformation({
          id: student._id,
          data: formData,
        }).unwrap();

        toast.success("Student updated successfully!");
      } catch (err: unknown) {
        const error = err as ApiErrorResponse;
        const errorMessage =
          error?.data?.message || error?.message || "Failed to update student";
        toast.error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    };

    const handleCancel = (): void => {
      navigate("/dashboard/admin/student/all");
    };

    const toggleEditMode = (): void => {
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

export default useEditStudentInformation;

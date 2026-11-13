import { STUDENT_FIELDS } from "../config/studentFields";

export const buildStudentFormData = (
  student: Record<string, unknown>,
  file: File | null | undefined,
): FormData => {
  const formData = new FormData();

  STUDENT_FIELDS?.forEach((field: string) => {
    const value = student[field];

    if (value !== undefined && value !== null && value !== "") {
      if (value instanceof Blob || value instanceof File) {
        formData.append(field, value);
      } else {
        formData.append(field, String(value));
      }
    }
  });

  if (file instanceof File) {
    formData.append("studentPhoto", file, file.name || "student_photo.jpg");
  } else {
    console.warn("No file provided!");
  }

  return formData;
};

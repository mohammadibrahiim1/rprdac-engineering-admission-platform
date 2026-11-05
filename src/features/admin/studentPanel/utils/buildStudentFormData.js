import { STUDENT_FIELDS } from '../config/studentFields';

export const buildStudentFormData = (student, file) => {
  const formData = new FormData();

  STUDENT_FIELDS.forEach((field) => {
    const value = student[field];

    if (value !== undefined && value !== null && value !== '') {
      formData.append(field, value);
    }
  });

  if (file instanceof File) {
    formData.append('studentPhoto', file, file.name || 'student_photo.jpg');
  } else {
    console.warn('No file provided!');
  }

  return formData;
};

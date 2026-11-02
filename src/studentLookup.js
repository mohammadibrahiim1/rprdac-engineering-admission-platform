// RPR DUET ADMISSION CARE
// Student ID Lookup System

const EXCEL_KEY = "rpr-external-students-demo-v1";

// Normalize Student ID
function normalizeId(id) {
  return String(id ?? "").trim().toUpperCase();
}

// Load students from uploaded Excel files
export function getExcelStudents() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(EXCEL_KEY) || "null"
    );

    if (!saved) return [];

    // Old Excel import format
    if (Array.isArray(saved)) {
      return saved;
    }

    // Multiple Excel file format
    if (Array.isArray(saved.files)) {
      return saved.files.flatMap(
        file => file.students || []
      );
    }

    return [];
  } catch (error) {
    console.error("Excel Student Error:", error);
    return [];
  }
}

// Search student by ID
export function findStudentById(studentId, websiteStudents = []) {

  const id = normalizeId(studentId);

  if (!id) return null;

  // Priority 1: Website Database
  const websiteStudent = websiteStudents.find(
    student => normalizeId(student.id) === id
  );

  if (websiteStudent) {
    return {
      ...websiteStudent,
      source: "Website Student",
      isExternal: false
    };
  }

  // Priority 2: Uploaded Excel
  const excelStudents = getExcelStudents();

  const excelStudent = excelStudents.find(
    student => normalizeId(student.id) === id
  );

  if (excelStudent) {
    return {
      ...excelStudent,
      source: "External Student",
      isExternal: true
    };
  }

  // Student not found
  return null;
}
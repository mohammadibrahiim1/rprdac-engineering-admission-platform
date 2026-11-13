import ExcelJS from "exceljs";

export type StudentExportRecord = Record<string, unknown>;

export interface ExportResult {
  success: boolean;
  message?: string;
}

const EXCLUDED_KEYS = new Set<string>([
  "_id",
  "createdAt",
  "updatedAt",
  "__v",
  "studentPhoto",
]);

const MAX_CELL_LEN = 32_000;

const PRIORITY_KEYS: readonly string[] = [
  "name",
  "studentId",
  "phone",
  "batch",
  "session",
  "status",
];

const sanitizeCellValue = (val: unknown): string => {
  if (val === undefined || val === null || val === "") return "—";
  let str: string;
  if (typeof val === "object") {
    try {
      str = JSON.stringify(val);
    } catch {
      str = String(val);
    }
  } else {
    str = String(val);
  }
  return str.length > MAX_CELL_LEN ? `${str.slice(0, MAX_CELL_LEN)}…` : str;
};

export const getAllExportableFields = (
  students: StudentExportRecord[] = [],
): string[] => {
  if (!Array.isArray(students) || students.length === 0) return [];
  return Array.from(
    new Set(
      students.flatMap((s) =>
        s && typeof s === "object" ? Object.keys(s) : [],
      ),
    ),
  ).filter((k) => !EXCLUDED_KEYS.has(k));
};

export const exportStudentsToExcel = async (
  students: StudentExportRecord[] = [],
  filename: string = "students",
  selectedKeys: string[] = [],
): Promise<ExportResult> => {
  if (!Array.isArray(students) || students.length === 0) {
    return { success: false, message: "No data to export" };
  }

  // Extract all valid keys present in the student records
  const allAvailableKeys = getAllExportableFields(students);

  // Use user-selected fields if provided, otherwise fall back to all available fields
  const baseKeysToUse =
    selectedKeys.length > 0 ? selectedKeys : allAvailableKeys;

  // Order columns so priority keys appear first
  const keys: string[] = [
    ...PRIORITY_KEYS.filter((k) => baseKeysToUse.includes(k)),
    ...baseKeysToUse.filter((k) => !PRIORITY_KEYS.includes(k)),
  ];

  // Format headers (camelCase to Title Case)
  const headers: string[] = keys.map((k) =>
    k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
  );

  try {
    // 1. Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    // 2. Add header row and bold it
    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true };

    // 3. Add sanitized data rows
    students.forEach((student) => {
      const rowValues = keys.map((k) => sanitizeCellValue(student[k]));
      worksheet.addRow(rowValues);
    });

    // 4. Configure column widths using sanitized lengths (handles nested objects properly)
    worksheet.columns = keys.map((k, index) => {
      const headerLen = headers[index]?.length ?? k.length;
      const maxDataLen = students.reduce((max, s) => {
        const len = sanitizeCellValue(s[k]).length;
        return len > max ? len : max;
      }, 0);

      return {
        width: Math.min(Math.max(headerLen + 4, maxDataLen) + 2, 50),
      };
    });

    // 5. Generate buffer and trigger browser download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const date = new Date().toISOString().slice(0, 10);
    const fullFileName = `${filename}_${date}.xlsx`;

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fullFileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to export Excel file.";
    return {
      success: false,
      message,
    };
  }
};

import ExcelJS from 'exceljs';

export const exportStudentsToExcel = async (
  students = [],
  filename = 'students',
  selectedKeys = [],
) => {
  if (!students?.length) {
    return { success: false, message: 'No data to export' };
  }

  const EXCLUDED_KEYS = new Set([
    '_id',
    'createdAt',
    'updatedAt',
    '__v',
    'studentPhoto',
  ]);

  const MAX_CELL_LEN = 32_000;
  const PRIORITY_KEYS = [
    'name',
    'studentId',
    'phone',
    'batch',
    'session',
    'status',
  ];

  // ডাটাবেজে থাকা সমস্ত ভ্যালিড কি (Keys) বের করা
  const allAvailableKeys = Array.from(
    new Set(students.flatMap((s) => Object.keys(s))),
  ).filter((k) => !EXCLUDED_KEYS.has(k));

  // ইউজার যদি ফিল্ড সিলেক্ট করে থাকে তবে সেটি ব্যবহার হবে, নয়তো সব ফিল্ড (Fallback)
  const baseKeysToUse =
    selectedKeys.length > 0 ? selectedKeys : allAvailableKeys;

  // সর্টিং/অর্ডারিং ঠিক করা (Priority Keys আগে আসবে)
  const keys = [
    ...PRIORITY_KEYS.filter((k) => baseKeysToUse.includes(k)),
    ...baseKeysToUse.filter((k) => !PRIORITY_KEYS.includes(k)),
  ];

  // হেডার ফরম্যাটিং (camelCase to Title Case)
  const headers = keys.map((k) =>
    k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
  );

  const sanitize = (val) => {
    if (val === undefined || val === null || val === '') return '—';
    if (typeof val === 'object') return JSON.stringify(val);
    const str = String(val);
    return str.length > MAX_CELL_LEN ? str.slice(0, MAX_CELL_LEN) + '…' : str;
  };

  // ১. ওয়ার্কবুক ও ওয়ার্কশিট তৈরি
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');

  // ২. হেডার রো অ্যাড করা এবং বোল্ড করা
  worksheet.addRow(headers);
  worksheet.getRow(1).font = { bold: true };

  // ৩. ডেটা রো গুলো যোগ করা
  students.forEach((s) => {
    const rowValues = keys.map((k) => sanitize(s[k]));
    worksheet.addRow(rowValues);
  });

  // ৪. কলাম উইডথ সেটআপ (আপনার আগের লজিক অনুযায়ী)
  worksheet.columns = keys.map((k) => ({
    width: Math.min(
      Math.max(
        k.length + 4,
        ...students.map((s) => String(s[k] ?? '').length),
      ) + 2,
      50,
    ),
  }));

  try {
    // ৫. বাফার জেনারেট এবং ব্রাউজারে ফাইল ডাউনলোড ট্রিগার করা
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const date = new Date().toISOString().slice(0, 10);
    const fullFileName = `${filename}_${date}.xlsx`;

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fullFileName;
    anchor.click();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error?.message || 'Failed to export Excel file.',
    };
  }
};

export const getAllExportableFields = (students = []) => {
  const EXCLUDED_KEYS = new Set([
    '_id',
    'createdAt',
    'updatedAt',
    '__v',
    'studentPhoto',
  ]);
  return Array.from(new Set(students.flatMap((s) => Object.keys(s)))).filter(
    (k) => !EXCLUDED_KEYS.has(k),
  );
};

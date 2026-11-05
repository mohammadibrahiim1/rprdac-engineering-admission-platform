import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import watermarklogo from '../../../../../assets/img/log-rpr.png';
import headerLogo from '../../../../../assets/img/rpr-attendance-logo.jpeg';

// ======================================================
// Types
// ======================================================
export interface StudentPDFItem {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  studentName?: string;
  [key: string]: unknown;
}

export interface AttendancePDFOptions {
  /** Optional PNG/JPEG data URL for the header logo. */
  logoBase64?: string;
  /** Optional PNG/JPEG data URL for the watermark logo. */
  watermarkBase64?: string;
  fileName?: string;
  /** Number of attendance columns after the Name column. */
  attendanceColumns?: number;
  /** Maximum number of students per page. */
  studentsPerPage?: number;
}

// ======================================================
// Constants
// ======================================================
const COLORS = {
  headerBg: [239, 229, 199] as [number, number, number],
  text: [20, 20, 20] as [number, number, number],
  border: [35, 35, 35] as [number, number, number],
};

const DEFAULT_ATTENDANCE_COLUMNS = 10;
const DEFAULT_STUDENTS_PER_PAGE = 30;
const MARGIN_X = 4;
const TABLE_START_Y = 31;
const HEADER_ROW_HEIGHT = 7;
const MIN_BODY_ROW_HEIGHT = 5.5;

// ======================================================
// Image Types
// ======================================================
type ImageFormat = 'PNG' | 'JPEG';

// ======================================================
// Utility Functions
// ======================================================
function safeFileName(value: string): string {
  return (
    value
      .trim()
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/[\s\S]/g, (char) => (char.charCodeAt(0) < 32 ? '_' : char))
      .replace(/\s+/g, '_')
      .slice(0, 80) || 'All'
  );
}

function capitalizeWords(str: string): string {
  return str
    .toLowerCase()
    .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
}

function getStudentName(student: StudentPDFItem): string {
  const value = student.name ?? student.fullName ?? student.studentName ?? '';
  return String(capitalizeWords(value).trim());
}

function getImageFormat(dataUrl: string): ImageFormat {
  const normalized = dataUrl.slice(0, 100).toLowerCase();
  if (
    normalized.startsWith('data:image/jpeg') ||
    normalized.startsWith('data:image/jpg')
  ) {
    return 'JPEG';
  }
  if (normalized.startsWith('data:image/png')) {
    return 'PNG';
  }
  throw new Error('Invalid image. Please provide a PNG or JPEG data URL.');
}

// ======================================================
// Convert any image URL / data-URL to a data-URL
// ======================================================
function createImageDataUrl(imageUrl: string, opacity = 1): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Could not create canvas.'));
          return;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = Math.max(0, Math.min(1, opacity));
        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => {
      reject(new Error('Failed to load the image.'));
    };
    image.src = imageUrl;
  });
}

// ======================================================
// Header Logo
// ======================================================
function drawHeader(
  doc: jsPDF,
  sessionName: string,
  batchName: string,
  logoDataUrl: string,
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  try {
    const format = getImageFormat(logoDataUrl);
    const imageProperties = doc.getImageProperties(logoDataUrl);

    const maxWidth = 100;
    const maxHeight = 15;
    const scale = Math.min(
      maxWidth / imageProperties.width,
      maxHeight / imageProperties.height,
    );
    const imageWidth = imageProperties.width * scale;
    const imageHeight = imageProperties.height * scale;

    doc.addImage(
      logoDataUrl,
      format,
      centerX - imageWidth / 2,
      2 + (maxHeight - imageHeight) / 2,
      imageWidth,
      imageHeight,
    );
  } catch {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(20, 75, 105);
    doc.text('RPR', centerX, 11, { align: 'center' });
  }

  // Horizontal divider
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.4);
  doc.line(MARGIN_X, 19.5, pageWidth - MARGIN_X, 19.5);

  // Attendance sheet title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.text(
    `Attendance Sheet (Session: ${capitalizeWords(sessionName.trim()) || 'N/A'})`,
    centerX,
    24.5,
    {
      align: 'center',
    },
  );

  // Batch name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    `Batch: ${capitalizeWords(batchName.trim()) || 'All Batches'}`,
    centerX,
    29,
    {
      align: 'center',
    },
  );
}

// ======================================================
// Center Watermark
// ======================================================
function drawWatermark(doc: jsPDF, watermarkDataUrl: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  try {
    const imageProperties = doc.getImageProperties(watermarkDataUrl);

    const maxWidth = 105;
    const maxHeight = 75;
    const scale = Math.min(
      maxWidth / imageProperties.width,
      maxHeight / imageProperties.height,
    );
    const imageWidth = imageProperties.width * scale;
    const imageHeight = imageProperties.height * scale;

    const x = (pageWidth - imageWidth) / 2;
    const y = (pageHeight - imageHeight) / 2;

    doc.addImage(watermarkDataUrl, 'PNG', x, y, imageWidth, imageHeight);
  } catch (error) {
    console.error('Could not render attendance watermark:', error);
  }
}

// ======================================================
// Generate Attendance Sheet PDF
// ======================================================

export async function generateAttendanceSheetPDF(
  students: StudentPDFItem[] = [],
  batchName = '',
  sessionName = '',
  options: AttendancePDFOptions = {},
): Promise<void> {
  if (!Array.isArray(students)) {
    throw new TypeError('Students must be an array.');
  }

  const attendanceColumns = Math.floor(
    options.attendanceColumns ?? DEFAULT_ATTENDANCE_COLUMNS,
  );
  const studentsPerPage = Math.floor(
    options.studentsPerPage ?? DEFAULT_STUDENTS_PER_PAGE,
  );

  if (
    !Number.isFinite(attendanceColumns) ||
    attendanceColumns < 1 ||
    attendanceColumns > 30
  ) {
    throw new RangeError('Attendance columns must be between 1 and 30.');
  }
  if (
    !Number.isFinite(studentsPerPage) ||
    studentsPerPage < 1 ||
    studentsPerPage > 100
  ) {
    throw new RangeError('Students per page must be between 1 and 100.');
  }

  // Separate header logo & watermark
  const sourceLogo = options.logoBase64 || headerLogo;
  const sourceWatermark = options.watermarkBase64 || watermarklogo;

  const [logoDataUrl, watermarkDataUrl] = await Promise.all([
    createImageDataUrl(sourceLogo, 1),
    createImageDataUrl(sourceWatermark, 0.18),
  ]);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - MARGIN_X * 2;

  // ========== COLUMN WIDTHS (BALANCED FOR SIGNING) ==========
  const slWidth = 10; // SL – very narrow
  const nameWidth = Math.min(42, usableWidth * 0.15); // Name – reduced again
  const attendanceWidth =
    (usableWidth - slWidth - nameWidth) / attendanceColumns; // Sign columns get more space

  const availableBodyHeight =
    pageHeight - TABLE_START_Y - 8 - HEADER_ROW_HEIGHT;
  const rowHeight = Math.max(
    4.5,
    Math.min(MIN_BODY_ROW_HEIGHT, availableBodyHeight / studentsPerPage),
  );

  const pageCount = Math.max(1, Math.ceil(students.length / studentsPerPage));

  // ====================================================
  // Page Loop
  // ====================================================
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    if (pageIndex > 0) {
      doc.addPage('a4', 'landscape');
    }

    // Header logo
    drawHeader(doc, sessionName, batchName, logoDataUrl);

    // Center watermark
    drawWatermark(doc, watermarkDataUrl);

    const startIndex = pageIndex * studentsPerPage;
    const pageStudents = students.slice(
      startIndex,
      startIndex + studentsPerPage,
    );

    const rows: (string | number)[][] =
      pageStudents.length > 0
        ? pageStudents.map((student, index) => [
            startIndex + index + 1,
            getStudentName(student),
            ...Array<string>(attendanceColumns).fill(''),
          ])
        : [['', '', ...Array<string>(attendanceColumns).fill('')]];

    const head = [
      ['SL', 'Name', ...Array.from({ length: attendanceColumns }, () => '')],
    ];

    autoTable(doc, {
      startY: TABLE_START_Y,
      margin: {
        left: MARGIN_X,
        right: MARGIN_X,
        bottom: 8,
        top: TABLE_START_Y,
      },
      head,
      body: rows,
      theme: 'grid',
      tableWidth: usableWidth,
      showHead: 'everyPage',
      pageBreak: 'avoid',
      rowPageBreak: 'avoid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        textColor: COLORS.text,
        lineColor: COLORS.border,
        lineWidth: 0.2,
        cellPadding: {
          top: 1,
          right: 1.1,
          bottom: 1,
          left: 1.1,
        },
        valign: 'middle',
        minCellHeight: rowHeight,
        overflow: 'linebreak',
        fillColor: false,
      },
      headStyles: {
        fillColor: COLORS.headerBg,
        textColor: COLORS.text,
        fontStyle: 'bold',
        fontSize: 7.5,
        minCellHeight: HEADER_ROW_HEIGHT,
        halign: 'left',
        valign: 'middle',
      },
      bodyStyles: {
        fillColor: false,
      },
      columnStyles: {
        0: {
          cellWidth: slWidth,
          halign: 'center',
        },
        1: {
          cellWidth: nameWidth,
          halign: 'left',
        },
      },
      didParseCell: (data) => {
        // Force every attendance / sign column to the same larger width
        if (data.column.index >= 2) {
          data.cell.styles.cellWidth = attendanceWidth;
          data.cell.styles.halign = 'center';
        }

        // Center the SL header cell
        if (data.section === 'head' && data.column.index === 0) {
          data.cell.styles.halign = 'center';
        }
      },
      didDrawPage: () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Page ${pageIndex + 1} of ${pageCount}`,
          pageWidth - MARGIN_X,
          pageHeight - 3,
          { align: 'right' },
        );
      },
    });
  }

  // ====================================================
  // Save PDF
  // ====================================================
  const safeBatch = safeFileName(batchName || 'All');
  const safeSession = safeFileName(sessionName || 'Session');
  const fileName =
    options.fileName?.trim() ||
    `Attendance_Sheet_${safeBatch}_${safeSession}.pdf`;

  doc.save(
    fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`,
  );
}

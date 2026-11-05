import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import watermarklogo from '../../../../../assets/img/log-rpr.png';
import headerLogo from '../../../../../assets/img/rpr-attendance-logo.jpeg';

// ======================================================
// Types
// ======================================================
export interface PhoneSheetStudent {
  _id?: string;
  id?: string;
  name?: string | null;
  fullName?: string | null;
  studentName?: string | null;
  userName?: string | null;
  phone?: string | number | null;
  mobile?: string | number | null;
  phoneNumber?: string | number | null;
  [key: string]: unknown;
}

export interface PhoneSheetOptions {
  /** Optional logo URL or data-URL for header. If omitted, the default logo is used. */
  logoUrl?: string;
  /** Optional watermark logo URL or data-URL. If omitted, the imported watermarklogo is used. */
  watermarkUrl?: string;
  fileName?: string;
  rowsPerPage?: number;
}

// ======================================================
// Constants
// ======================================================

const SETTINGS = {
  marginX: 12,
  logoTop: 3,
  logoMaxWidth: 75,
  logoMaxHeight: 13,
  dividerY: 22,
  titleY: 28,
  batchY: 34,
  tableY: 39,
  watermarkWidth: 105,
  watermarkMaxHeight: 90,
  watermarkOpacity: 0.075,

  headerColor: [239, 230, 201] as [number, number, number],
  borderColor: [40, 40, 40] as [number, number, number],
  textColor: [25, 25, 25] as [number, number, number],
};

// ======================================================
// Utility Functions
// ======================================================
function capitalizeWords(str: string): string {
  return str
    .toLowerCase()
    .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
}

function getStudentName(student: PhoneSheetStudent): string {
  const candidates = [
    student.name,
    student.fullName,
    student.studentName,
    student.userName,
  ];
  const value = candidates.find(
    (item) => typeof item === 'string' && item.trim() !== '',
  );
  return typeof value === 'string' ? capitalizeWords(value.trim()) : '';
}

function getPhoneNumber(student: PhoneSheetStudent): string {
  const candidates = [student.phone, student.mobile, student.phoneNumber];
  const value = candidates.find(
    (item) => item !== null && item !== undefined && String(item).trim() !== '',
  );
  return value === undefined ? '' : String(value).trim();
}

function makeSafeFileName(value: string): string {
  const result = value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/[. ]+$/g, '')
    .slice(0, 120);

  return result || 'Phone_Number_Sheet';
}

/**
 * Convert any image URL / data-URL into a clean PNG data-URL.
 * opacity = 1 → normal logo, opacity < 1 → faint watermark.
 */
function createImageDataUrl(imageUrl: string, opacity = 1): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not create canvas.'));
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
        ctx.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };

    image.onerror = () => {
      reject(new Error(`Unable to load logo image: ${imageUrl}`));
    };

    image.src = imageUrl;
  });
}

// ======================================================
// Header
// ======================================================
function drawHeader(
  doc: jsPDF,
  logoDataUrl: string,
  sessionName: string,
  batchName: string,
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  try {
    const props = doc.getImageProperties(logoDataUrl);
    const scale = Math.min(
      SETTINGS.logoMaxWidth / props.width,
      SETTINGS.logoMaxHeight / props.height,
    );
    const logoWidth = props.width * scale;
    const logoHeight = props.height * scale;

    doc.addImage(
      logoDataUrl,
      'PNG',
      centerX - logoWidth / 2,
      SETTINGS.logoTop,
      logoWidth,
      logoHeight,
    );
  } catch (error) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(20, 75, 105);
    doc.text('RPR', centerX, 12, { align: 'center' });
  }

  // Divider line
  doc.setDrawColor(...SETTINGS.borderColor);
  doc.setLineWidth(0.4);
  doc.line(
    SETTINGS.marginX,
    SETTINGS.dividerY,
    pageWidth - SETTINGS.marginX,
    SETTINGS.dividerY,
  );

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Phone Number Sheet (Session: ${capitalizeWords(sessionName.trim() || 'N/A')})`,
    centerX,
    SETTINGS.titleY,
    { align: 'center' },
  );

  // Batch
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Batch: ${capitalizeWords(batchName.trim() || 'All Batches')}`,
    centerX,
    SETTINGS.batchY,
    {
      align: 'center',
    },
  );
}

// ======================================================
// Watermark
// ======================================================
function drawWatermark(doc: jsPDF, watermarkDataUrl: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  try {
    const props = doc.getImageProperties(watermarkDataUrl);
    const scale = Math.min(
      SETTINGS.watermarkWidth / props.width,
      SETTINGS.watermarkMaxHeight / props.height,
    );
    const width = props.width * scale;
    const height = props.height * scale;

    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;

    doc.addImage(watermarkDataUrl, 'PNG', x, y, width, height);
  } catch (error) {
    console.error('Could not render phone-sheet watermark:', error);
  }
}

// ======================================================
// Main Generator
// ======================================================
export async function generatePhoneSheetPDF(
  students: PhoneSheetStudent[] = [],
  batchName = '',
  sessionName = '',
  options: PhoneSheetOptions = {},
): Promise<void> {
  if (!Array.isArray(students)) {
    throw new TypeError('Students must be an array.');
  }

  const rowsPerPage = options.rowsPerPage ?? 25;
  if (!Number.isInteger(rowsPerPage) || rowsPerPage < 1 || rowsPerPage > 60) {
    throw new RangeError('rowsPerPage must be an integer between 1 and 60.');
  }

  // Header লোগোর জন্য headerLogo এবং Watermark লোগোর জন্য watermarklogo ব্যবহার করা হয়েছে
  const sourceLogo = options.logoUrl ?? headerLogo;
  const sourceWatermark = options.watermarkUrl ?? watermarklogo;

  const [logoDataUrl, watermarkDataUrl] = await Promise.all([
    createImageDataUrl(sourceLogo, 1),
    createImageDataUrl(sourceWatermark, SETTINGS.watermarkOpacity),
  ]);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - SETTINGS.marginX * 2;

  const availableHeight = pageHeight - SETTINGS.tableY - 12;
  const rowHeight = Math.min(
    12,
    Math.max(5, availableHeight / (rowsPerPage + 1)),
  );

  const pageCount = Math.max(1, Math.ceil(students.length / rowsPerPage));

  // ====================================================
  // Page Loop
  // ====================================================
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    if (pageIndex > 0) {
      doc.addPage('a4', 'portrait');
    }

    drawHeader(doc, logoDataUrl, sessionName, batchName);
    drawWatermark(doc, watermarkDataUrl);

    const startIndex = pageIndex * rowsPerPage;
    const pageStudents = students.slice(startIndex, startIndex + rowsPerPage);

    // 15 columns total structure: [SL, Name, Phone Number, Extra 1 ... Extra 12]
    const body: string[][] = Array.from(
      { length: rowsPerPage },
      (_, rowIndex) => {
        const student = pageStudents[rowIndex];
        const rowData: string[] = [
          student ? String(startIndex + rowIndex + 1) : '',
          student ? getStudentName(student) : '',
          student ? getPhoneNumber(student) : '',
        ];

        // Fill remaining 12 empty columns to bring total columns to 15
        for (let i = 3; i < 15; i++) {
          rowData.push('');
        }

        return rowData;
      },
    );

    const headRow = [
      'SL',
      'Name',
      'Phone Number',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ];

    autoTable(doc, {
      startY: SETTINGS.tableY,
      margin: {
        left: SETTINGS.marginX,
        right: SETTINGS.marginX,
        top: SETTINGS.tableY,
        bottom: 12,
      },
      head: [headRow],
      body,
      theme: 'grid',
      tableWidth: usableWidth,
      showHead: 'everyPage',
      pageBreak: 'avoid',
      rowPageBreak: 'avoid',

      styles: {
        font: 'helvetica',
        fontSize: 9, // Smaller font to fit 15 columns nicely on A4 portrait width
        textColor: SETTINGS.textColor,
        lineColor: SETTINGS.borderColor,
        lineWidth: 0.25,
        cellPadding: 1.5,
        valign: 'middle',
        overflow: 'linebreak',
        minCellHeight: rowHeight,
        fillColor: false,
      },

      headStyles: {
        fillColor: SETTINGS.headerColor,
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 7.5,
        minCellHeight: 7,
        valign: 'middle',
        halign: 'center',
      },

      bodyStyles: {
        fillColor: false,
      },

      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // SL
        1: { cellWidth: 42, halign: 'left' }, // Name
        2: { cellWidth: 28, halign: 'center' }, // Phone Number
        // Remaining 12 columns share the remaining available width equally
        3: { cellWidth: 'auto', halign: 'center' },
        4: { cellWidth: 'auto', halign: 'center' },
        5: { cellWidth: 'auto', halign: 'center' },
        6: { cellWidth: 'auto', halign: 'center' },
        7: { cellWidth: 'auto', halign: 'center' },
        8: { cellWidth: 'auto', halign: 'center' },
        9: { cellWidth: 'auto', halign: 'center' },
        10: { cellWidth: 'auto', halign: 'center' },
        11: { cellWidth: 'auto', halign: 'center' },
        12: { cellWidth: 'auto', halign: 'center' },
        13: { cellWidth: 'auto', halign: 'center' },
        14: { cellWidth: 'auto', halign: 'center' },
      },

      didDrawPage: () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text(
          `Page ${pageIndex + 1} of ${pageCount}`,
          pageWidth - SETTINGS.marginX,
          pageHeight - 5,
          { align: 'right' },
        );
      },
    });
  }

  // ====================================================
  // Save
  // ====================================================
  const filename = makeSafeFileName(
    options.fileName ??
      `Phone_Sheet_${batchName || 'All'}_${sessionName || 'Session'}`,
  );

  doc.save(
    filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`,
  );
}

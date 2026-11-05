import { useCallback, useState } from 'react';
import ExcelJS from 'exceljs';

export const useMeritParser = () => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileDetails, setFileDetails] = useState({ name: '', size: '' });

  const [meta, setMeta] = useState({
    exam: '',
    date: '',
    session: '',
    fullMarks: '',
    departmentId: '',
    model: 'Model-1',
  });

  const [stats, setStats] = useState({
    highest: 0,
    lowest: 0,
  });

  const parseExcel = useCallback(async (file) => {
    try {
      setLoading(true);
      setError('');

      const sizeInMB = file.size / (1024 * 1024);
      const formattedSize =
        sizeInMB < 1
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${sizeInMB.toFixed(2)} MB`;

      setFileDetails({ name: file.name, size: formattedSize });

      // ১. ExcelJS ব্যবহার করে ফাইল বাফার লোড করা
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('Excel file is empty.');
      }

      // ২. SheetJS
      const sheetData = [];
      const maxColumns = worksheet.columnCount || 1;

      worksheet.eachRow({ includeEmpty: true }, (row) => {
        const rowData = [];
        for (let colNumber = 1; colNumber <= maxColumns; colNumber++) {
          const cell = row.getCell(colNumber);
          let val = cell.value;

          if (val === null || val === undefined) {
            rowData.push('');
          } else if (typeof val === 'object') {
            if (val instanceof Date) {
              rowData.push(val.toISOString().slice(0, 10));
            } else if (val.result !== undefined) {
              rowData.push(val.result ?? '');
            } else if (val.text !== undefined) {
              rowData.push(val.text);
            } else {
              rowData.push(String(val));
            }
          } else {
            rowData.push(val);
          }
        }
        sheetData.push(rowData);
      });

      if (!sheetData.length) {
        throw new Error('Excel file is empty.');
      }

      const metadata = {
        exam: '',
        date: '',
        session: '',
        fullMarks: '',
        departmentId: '',
        model: 'Model-1',
      };

      let headerIndex = 0;

      //-----------------------------------------------------
      // Metadata Extraction Phase (Regex Parsing)
      //-----------------------------------------------------
      for (let i = 0; i < sheetData.length; i++) {
        const rowText = sheetData[i]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (!rowText) continue;

        if (/sl\.?\s*no|roll\s*no|name/i.test(rowText)) {
          headerIndex = i;
          break;
        }

        const fullMarksMatch = rowText.match(/Full\s*Marks\s*:?\s*([\d.]+)/i);
        if (fullMarksMatch) {
          metadata.fullMarks = fullMarksMatch[1];
        }

        const deptMatch = rowText.match(/Dept\s*:?\s*([A-Za-z0-9]+)/i);
        if (deptMatch) {
          metadata.departmentId = deptMatch[1].trim().toUpperCase();
        }

        const modelRegex = /Merit\s+list\s+of\s+([A-Za-z0-9-]+)/i;
        const modelMatch = rowText.match(modelRegex);
        if (modelMatch && modelMatch[1]) {
          metadata.model = modelMatch[1].trim();
        } else {
          const backupModelMatch = rowText.match(/(Model[- ]\d+)/i);
          if (backupModelMatch) {
            metadata.model = backupModelMatch[1].replace(' ', '-').trim();
          }
        }

        const sessionMatch = rowText.match(/Session\s*:?\s*([0-9-]+)/i);
        if (sessionMatch) {
          metadata.session = sessionMatch[1].trim();
        }

        const examMatch = rowText.match(/Exam\s*:?\s*([^]+?)(?=Date:|$)/i);
        if (examMatch) {
          metadata.exam = examMatch[1].replace(/\n/g, ' ').trim();
        }

        const dateMatch = rowText.match(
          /Date\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
        );
        if (dateMatch) {
          metadata.date = dateMatch[1];
        }
      }

      setMeta(metadata);

      //-----------------------------------------------------
      // Columns Header Mapping Phase
      //-----------------------------------------------------
      const rawHeaders = sheetData[headerIndex] || [];
      const dynamicColumns = rawHeaders
        .map((header, index) => {
          const title = String(header).trim();
          return {
            id:
              title.toLowerCase().replace(/[^a-z0-9]/g, '_') ||
              `column_${index}`,
            accessorKey:
              title.toLowerCase().replace(/[^a-z0-9]/g, '_') ||
              `column_${index}`,
            header: title,
            originalIndex: index,
          };
        })
        .filter((col) => col.header !== '');

      // score
      let scoreColumn = dynamicColumns.find((col) =>
        col.header.toLowerCase().includes('obtained'),
      );
      if (!scoreColumn)
        scoreColumn = dynamicColumns.find((col) =>
          col.header.toLowerCase().includes('total'),
        );
      if (!scoreColumn) scoreColumn = dynamicColumns[dynamicColumns.length - 1];

      //-----------------------------------------------------
      // Student Rows Dataset Parsing Phase
      //-----------------------------------------------------
      const parsedRows = [];
      let highest = -Infinity;
      let lowest = Infinity;

      for (let i = headerIndex + 1; i < sheetData.length; i++) {
        const excelRow = sheetData[i];

        if (!excelRow) continue;
        if (excelRow.every((cell) => String(cell).trim() === '')) continue;

        const obj = {};
        dynamicColumns.forEach((col) => {
          const value = excelRow[col.originalIndex];

          if (value === '' || value === undefined || value === null) {
            obj[col.accessorKey] = '';
          } else {
            const number = Number(value);
            obj[col.accessorKey] = Number.isNaN(number)
              ? String(value).trim()
              : number;
          }
        });

        parsedRows.push(obj);

        const score = scoreColumn ? obj[scoreColumn.accessorKey] : undefined;
        if (typeof score === 'number') {
          if (score > highest) highest = score;
          if (score < lowest) lowest = score;
        }
      }

      setRows(parsedRows);
      setColumns(dynamicColumns);
      setStats({
        highest: highest === -Infinity ? 0 : highest,
        lowest: lowest === Infinity ? 0 : lowest,
      });
    } catch (err) {
      setError(err?.message || 'Failed to parse Excel.');
      setFileDetails({ name: '', size: '' });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    rows,
    columns,
    stats,
    meta,
    fileDetails,
    parseExcel,
  };
};

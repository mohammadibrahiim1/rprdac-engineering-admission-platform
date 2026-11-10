import { useCallback, useState } from "react";
import ExcelJS from "exceljs";

export interface FileDetails {
  name: string;
  size: string;
}

export interface MeritParserMeta {
  exam: string;
  date: string;
  session: string;
  fullMarks: string;
  departmentId: string;
  model: string;
}

export interface MeritParserStats {
  highest: number;
  lowest: number;
}

export interface DynamicColumn {
  id: string;
  accessorKey: string;
  header: string;
  originalIndex: number;
}

export type MeritRowData = Record<string, string | number>;

export interface UseMeritParserReturn {
  loading: boolean;
  error: string;
  rows: MeritRowData[];
  columns: DynamicColumn[];
  stats: MeritParserStats;
  meta: MeritParserMeta;
  fileDetails: FileDetails;
  parseExcel: (file: File) => Promise<void>;
}

export const useMeritParser = (): UseMeritParserReturn => {
  const [rows, setRows] = useState<MeritRowData[]>([]);
  const [columns, setColumns] = useState<DynamicColumn[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [fileDetails, setFileDetails] = useState<FileDetails>({
    name: "",
    size: "",
  });

  const [meta, setMeta] = useState<MeritParserMeta>({
    exam: "",
    date: "",
    session: "",
    fullMarks: "",
    departmentId: "",
    model: "Model-1",
  });

  const [stats, setStats] = useState<MeritParserStats>({
    highest: 0,
    lowest: 0,
  });

  const parseExcel = useCallback(async (file: File): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const sizeInMB = file.size / (1024 * 1024);
      const formattedSize =
        sizeInMB < 1
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${sizeInMB.toFixed(2)} MB`;

      setFileDetails({ name: file.name, size: formattedSize });

      // 1. Load Excel buffer via ExcelJS
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error("Excel file is empty.");
      }

      // 2. Extract worksheet rows into 2D array
      const sheetData: (string | number | Date | null)[][] = [];
      const maxColumns = worksheet.columnCount || 1;

      worksheet.eachRow({ includeEmpty: true }, (row) => {
        const rowData: (string | number | Date | null)[] = [];
        for (let colNumber = 1; colNumber <= maxColumns; colNumber++) {
          const cell = row.getCell(colNumber);
          const val = cell.value;

          if (val === null || val === undefined) {
            rowData.push("");
          } else if (typeof val === "object") {
            if (val instanceof Date) {
              rowData.push(val.toISOString().slice(0, 10));
            } else if (
              "result" in val &&
              val.result !== undefined &&
              val.result !== null
            ) {
              rowData.push(
                typeof val.result === "object"
                  ? String(val.result)
                  : (val.result as string | number),
              );
            } else if (
              "text" in val &&
              val.text !== undefined &&
              val.text !== null
            ) {
              rowData.push(String(val.text));
            } else {
              rowData.push(String(val));
            }
          } else {
            rowData.push(val as string | number);
          }
        }
        sheetData.push(rowData);
      });

      if (!sheetData.length) {
        throw new Error("Excel file is empty.");
      }

      const metadata: MeritParserMeta = {
        exam: "",
        date: "",
        session: "",
        fullMarks: "",
        departmentId: "",
        model: "Model-1",
      };

      let headerIndex = 0;

      //-----------------------------------------------------
      // Metadata Extraction Phase (Regex Parsing)
      //-----------------------------------------------------
      for (let i = 0; i < sheetData.length; i++) {
        const rowText = (sheetData[i] || [])
          .filter(Boolean)
          .map(String)
          .join(" ")
          .replace(/\s+/g, " ")
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
          // Fixed broken regex syntax
          const backupModelMatch = rowText.match(/(Model[\s-]\d+)/i);
          if (backupModelMatch) {
            metadata.model = backupModelMatch[1].replace(" ", "-").trim();
          }
        }

        const sessionMatch = rowText.match(/Session\s*:?\s*([0-9-]+)/i);
        if (sessionMatch) {
          metadata.session = sessionMatch[1].trim();
        }

        const examMatch = rowText.match(/Exam\s*:?\s*([^]+?)(?=Date:|$)/i);
        if (examMatch) {
          metadata.exam = examMatch[1].replace(/\n/g, " ").trim();
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
      const dynamicColumns: DynamicColumn[] = rawHeaders
        .map((header, index) => {
          const title = String(header ?? "").trim();
          const cleanKey =
            title.toLowerCase().replace(/[^a-z0-9]/g, "_") || `column_${index}`;
          return {
            id: cleanKey,
            accessorKey: cleanKey,
            header: title,
            originalIndex: index,
          };
        })
        .filter((col) => col.header !== "");

      let scoreColumn = dynamicColumns.find((col) =>
        col.header.toLowerCase().includes("obtained"),
      );
      if (!scoreColumn) {
        scoreColumn = dynamicColumns.find((col) =>
          col.header.toLowerCase().includes("total"),
        );
      }
      if (!scoreColumn && dynamicColumns.length > 0) {
        scoreColumn = dynamicColumns[dynamicColumns.length - 1];
      }

      //-----------------------------------------------------
      // Student Rows Dataset Parsing Phase
      //-----------------------------------------------------
      const parsedRows: MeritRowData[] = [];
      let highest = -Infinity;
      let lowest = Infinity;

      for (let i = headerIndex + 1; i < sheetData.length; i++) {
        const excelRow = sheetData[i];

        if (!excelRow) continue;
        if (excelRow.every((cell) => String(cell ?? "").trim() === ""))
          continue;

        const obj: MeritRowData = {};
        dynamicColumns.forEach((col) => {
          const value = excelRow[col.originalIndex];

          if (value === "" || value === undefined || value === null) {
            obj[col.accessorKey] = "";
          } else if (value instanceof Date) {
            obj[col.accessorKey] = value.toISOString().slice(0, 10);
          } else {
            const num = Number(value);
            obj[col.accessorKey] = Number.isNaN(num)
              ? String(value).trim()
              : num;
          }
        });

        parsedRows.push(obj);

        if (scoreColumn) {
          const score = obj[scoreColumn.accessorKey];
          if (typeof score === "number") {
            if (score > highest) highest = score;
            if (score < lowest) lowest = score;
          }
        }
      }

      setRows(parsedRows);
      setColumns(dynamicColumns);
      setStats({
        highest: highest === -Infinity ? 0 : highest,
        lowest: lowest === Infinity ? 0 : lowest,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to parse Excel.";
      setError(errorMessage);
      setFileDetails({ name: "", size: "" });
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

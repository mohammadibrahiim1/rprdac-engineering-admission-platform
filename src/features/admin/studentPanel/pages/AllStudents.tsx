import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExcelJS from 'exceljs';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  RefreshCw,
  UserPlus,
  Trash2,
  Loader2,
  FileText,
  Printer,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useStudentManager from '../hooks/useStudentManager';
import { generatePhoneSheetPDF } from '../utils/generatePhoneSheetPDF';
import StudentTable from '../components/AllStudents/StudentTable';
import { StudentStatCard } from '../components/AllStudents/StudentStatCard';
import { StudentSessionCard } from '../components/AllStudents/StudentSessionCard';
import { StudentFilterBar } from '../components/AllStudents/StudentFilterBar';
import toast from 'react-hot-toast';
import { generateAttendanceSheetPDF } from '../utils/generateAttendanceSheetPDF';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Grouped and sorted Export Columns
const EXPORT_COLUMNS = [
  // --- Student Information ---
  { key: 'serial', label: 'Serial' },
  { key: 'studentId', label: 'Student Id' },
  { key: 'sid', label: 'Sid' },
  { key: 'userType', label: 'User Type' },
  { key: 'admissionStatus', label: 'Admission Status' },
  { key: 'trackingId', label: 'Tracking Id' },
  { key: 'admissionSource', label: 'Admission Source' },
  { key: 'name', label: 'Name' },
  { key: 'nameInBangla', label: 'Name In Bangla' },
  { key: 'phone', label: 'Phone' },
  { key: 'studentWhatsAppNum', label: 'Student Whats App Num' },
  { key: 'bloodGroup', label: 'Blood Group' },
  { key: 'instituteName', label: 'Institute Name' },
  { key: 'session', label: 'Session' },
  { key: 'batch', label: 'Batch' },
  { key: 'newBatch', label: 'New Batch' },
  { key: 'oldBatch', label: 'Old Batch' },
  { key: 'department', label: 'Department' },
  { key: 'sscBoard', label: 'Ssc Board' },
  { key: 'sscGpa', label: 'Ssc Gpa' },
  { key: 'sscGroup', label: 'Ssc Group' },
  { key: 'sscPassingYear', label: 'Ssc Passing Year' },
  { key: 'diplomaBoard', label: 'Diploma Board' },
  { key: 'diplomaGpa', label: 'Diploma Gpa' },
  { key: 'diplomaGroup', label: 'Diploma Group' },
  { key: 'diplomaPassingYear', label: 'Diploma Passing Year' },
  { key: 'cgpa', label: 'Cgpa' },

  // --- Guardian Information ---
  { key: 'guardianName', label: 'Guardian Name' },
  { key: 'relationWithGuardian', label: 'Relation With Guardian' },
  { key: 'guardianPhone', label: 'Guardian Phone' },
  { key: 'guardianWhatsAppNum', label: 'Guardian Whats App Num' },

  // --- Address Information ---
  { key: 'permanentZilla', label: 'Permanent Zilla' },
  { key: 'permanentUpozilla', label: 'Permanent Upozilla' },
  { key: 'permanentVillage', label: 'Permanent Village' },
  { key: 'permanentPostcode', label: 'Permanent Postcode' },
  { key: 'presentZilla', label: 'Present Zilla' },
  { key: 'presentUpozilla', label: 'Present Upozilla' },
  { key: 'presentVillage', label: 'Present Village' },
  { key: 'presentPostcode', label: 'Present Postcode' },

  // --- Payment & Financial Information ---
  { key: 'paymentStatus', label: 'Payment Status' },
  { key: 'receiptNo', label: 'Receipt No' },
  { key: 'invoiceNo', label: 'Invoice No' },
  { key: 'amount', label: 'Amount' },
  { key: 'paymentType', label: 'Payment Type' },
  { key: 'paymentMethod', label: 'Payment Method' },
  { key: 'transactionId', label: 'Transaction Id' },
  { key: 'accountNumber', label: 'Account Number' },
  { key: 'paymentDate', label: 'Payment Date' },
  { key: 'courseFee', label: 'Course Fee' },
  { key: 'admissionFee', label: 'Admission Fee' },
  { key: 'referenceDiscount', label: 'Reference Discount' },
  { key: 'cgpaDiscount', label: 'Cgpa Discount' },
  { key: 'netDiscount', label: 'Net Discount' },
  { key: 'totalAfterDiscount', label: 'Total After Discount' },
  { key: 'studentPaid', label: 'Student Paid' },
  { key: 'admissionFeePaid', label: 'Admission Fee Paid' },
  { key: 'dueAmount', label: 'Due Amount' },
  { key: 'admissionFeeDue', label: 'Admission Fee Due' },
  { key: 'previousDueAmount', label: 'Previous Due Amount' },
  { key: 'updatedDueAmount', label: 'Updated Due Amount' },
  { key: 'studentReturnAmount', label: 'Student Return Amount' },
  { key: 'deductMoney', label: 'Deduct Money' },
  { key: 'cashback', label: 'Cashback' },
  { key: 'messServiceCharge', label: 'Mess Service Charge' },
  { key: 'messServiceChargePaid', label: 'Mess Service Charge Paid' },
  { key: 'messServiceChargeDue', label: 'Mess Service Charge Due' },
  { key: 'paymentHistory', label: 'Payment History' },

  // --- Payment Audit Details ---
  { key: 'paymentAudit_receivedAt', label: 'Payment Audit Received At' },
  { key: 'paymentAudit_receivedBy_name', label: 'Payment Received By Name' },
  { key: 'paymentAudit_receivedBy_phone', label: 'Payment Received By Phone' },
  { key: 'paymentAudit_receivedBy_role', label: 'Payment Received By Role' },
  {
    key: 'paymentAudit_receivedBy_userId',
    label: 'Payment Received By User ID',
  },

  { key: 'paymentAudit_submittedAt', label: 'Payment Audit Submitted At' },
  { key: 'paymentAudit_submittedBy_name', label: 'Payment Submitted By Name' },
  {
    key: 'paymentAudit_submittedBy_phone',
    label: 'Payment Submitted By Phone',
  },
  { key: 'paymentAudit_submittedBy_role', label: 'Payment Submitted By Role' },
  {
    key: 'paymentAudit_submittedBy_userId',
    label: 'Payment Submitted By User ID',
  },

  { key: 'paymentAudit_lastUpdatedAt', label: 'Payment Audit Last Updated At' },
  {
    key: 'paymentAudit_lastUpdatedBy_name',
    label: 'Payment Last Updated By Name',
  },
  {
    key: 'paymentAudit_lastUpdatedBy_phone',
    label: 'Payment Last Updated By Phone',
  },
  {
    key: 'paymentAudit_lastUpdatedBy_role',
    label: 'Payment Last Updated By Role',
  },
  {
    key: 'paymentAudit_lastUpdatedBy_userId',
    label: 'Payment Last Updated By User ID',
  },

  // --- Other & System Details ---
  { key: 'mess', label: 'Mess' },
  { key: 'room', label: 'Room' },
  { key: 'comment', label: 'Comment' },
  { key: 'note', label: 'Note' },
  { key: 'activityLogs', label: 'Activity Logs' },
  { key: 'notifications', label: 'Notifications' },

  // --- General Audit Details ---
  { key: 'audit_submittedBy', label: 'Audit Submitted By' },
  { key: 'audit_submittedAt', label: 'Audit Submitted At' },
  { key: 'audit_lastUpdatedBy', label: 'Audit Last Updated By' },
  { key: 'audit_lastUpdatedAt', label: 'Audit Last Updated At' },
];

const AllStudents = () => {
  const {
    students,
    meta,
    stats,
    folders,
    isLoading,
    isFetching,
    error,
    isDeleting,
    currentPage,
    setCurrentPage,
    limit,
    selectedSession,
    setSelectedSession,
    selectedBatch,
    filteredBatches,
    batchQuery,
    setBatchQuery,
    isBatchDropdownOpen,
    setIsBatchDropdownOpen,
    handleBatchSelect,
    handleClearBatch,
    hasActiveFilters,
    selectedIds,
    handleSelectId,
    handleSelectAll,
    debouncedSearch,
    setDebouncedSearch,
    handleClearAll,
    handleLimitChange,
    handleDeleteSelected,
    // handleDeleteOne,
    refetch,
  } = useStudentManager();

  // Excel Modal State
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(
    EXPORT_COLUMNS?.map((col) => col.key),
  );

  const sessionCards = useMemo(() => {
    if (!folders || !Array.isArray(folders)) return [];

    return folders.map((item: any) => {
      let badge = 'Active';
      let badgeColor: 'purple' | 'blue' | 'sky' | 'amber' = 'blue';
      let subtitle = 'Regular Academic Session';

      const sessionName = item.session || '';

      if (sessionName.toLowerCase().includes('crash')) {
        badge = 'Crash Batch';
        badgeColor = 'amber';
        subtitle = 'High-Intensity Problem Solving Sprint';
      } else if (
        sessionName.startsWith('2029') ||
        sessionName.startsWith('2030')
      ) {
        badge = 'Pre-Registration';
        badgeColor = 'purple';
        subtitle = 'Foundational Diploma Bridge Intake';
      } else if (sessionName.startsWith('2025')) {
        badge = 'Model Tests';
        badgeColor = 'sky';
        subtitle = 'Graduating Batch Revision & Mock Exam';
      }

      return {
        id: item.session,
        title: `Session ${item.session}`,
        subtitle,
        badge,
        badgeColor,
        progressLabel: 'Enrolled Students',
        progressValue: item.totalStudents || 0,
        progressMax: Math.max((item.totalStudents || 0) + 100, 100),
        footerLeft: `${item.paidStudents || 0} Paid • ${item.dueStudents || 0} Due`,
      };
    });
  }, [folders]);

  const handleDownloadPhoneSheet = () => {
    if (!students.length) {
      toast.error('No students available for the selected batch!');
      return;
    }
    generatePhoneSheetPDF(
      students,
      selectedBatch || 'All_Batches',
      selectedSession || '2026-2027',
    );
  };

  // download student attendance sheet
  const handleDownloadAttendanceSheet = () => {
    if (!students.length) {
      toast.error('No students available for the selected batch!');
      return;
    }
    generateAttendanceSheetPDF(
      students,
      selectedBatch || 'All_Batches',
      selectedSession || '2026-2027',
    );
  };

  const handleToggleColumn = (key: string) => {
    setSelectedColumnKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleToggleAllColumns = () => {
    if (selectedColumnKeys.length === EXPORT_COLUMNS?.length) {
      setSelectedColumnKeys([]);
    } else {
      setSelectedColumnKeys(EXPORT_COLUMNS?.map((c) => c.key));
    }
  };

  // Excel Export Handler using exceljs
  const handleExportExcel = async () => {
    if (!students.length) {
      toast.error('No students available to export!');
      return;
    }
    if (selectedColumnKeys.length === 0) {
      toast.error('Please select at least one column to export!');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Students Report');

      // Row 1: Title
      worksheet.mergeCells('A1:E1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'RPR DUET Admission Care';
      titleCell.font = {
        name: 'Arial',
        size: 16,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }, // Indigo-600
      };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 30;

      // Row 2: Subtitle
      worksheet.mergeCells('A2:E2');
      const subCell1 = worksheet.getCell('A2');
      subCell1.value = 'Phone: +880 1700-000000 | Address: Dhaka, Bangladesh';
      subCell1.font = {
        name: 'Arial',
        size: 10,
        italic: true,
        color: { argb: 'FF334155' },
      };
      subCell1.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(2).height = 20;

      // Row 3: Session & Batch
      worksheet.mergeCells('A3:E3');
      const sessionText = selectedSession
        ? `Session: ${selectedSession}`
        : 'All Sessions';
      const batchText = selectedBatch
        ? `Batch: ${selectedBatch}`
        : 'All Batches';
      const subCell2 = worksheet.getCell('A3');
      subCell2.value = `${sessionText}  |  ${batchText}`;
      subCell2.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FF0F172A' },
      };
      subCell2.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(3).height = 20;

      // Blank Row spacer
      worksheet.addRow([]);

      // Filter active columns based on user selection
      const activeColumns = EXPORT_COLUMNS?.filter((col) =>
        selectedColumnKeys.includes(col.key),
      );

      // Table Header Row
      const headerRow = worksheet.addRow(activeColumns.map((col) => col.label));
      headerRow.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }, // Slate-800
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.height = 24;

      // Table Data Rows
      students.forEach((student: any, index: number) => {
        const rowData = activeColumns.map((col) => {
          if (col.key === 'serial') return index + 1;

          // Handle paymentAudit nested objects (e.g., paymentAudit_receivedBy_name)
          if (col.key.startsWith('paymentAudit_')) {
            const parts = col.key.replace('paymentAudit_', '').split('_');
            if (parts.length === 1) {
              const part = parts[0];
              if (part !== undefined) {
                const val = student.paymentAudit?.[part];
                return val !== undefined && val !== null ? String(val) : '';
              }
              return '';
            } else if (parts.length === 2) {
              const [parentKey, childKey] = parts;
              if (parentKey !== undefined && childKey !== undefined) {
                const val = student.paymentAudit?.[parentKey]?.[childKey];
                return val !== undefined && val !== null ? String(val) : '';
              }
            }
          }

          // Handle general audit nested objects
          if (col.key.startsWith('audit_')) {
            const subKey = col.key.replace('audit_', '');
            const val = student.audit?.[subKey];
            return val !== undefined && val !== null ? String(val) : '';
          }

          // Direct property or fallback
          const directVal = student[col.key];
          if (Array.isArray(directVal)) {
            return JSON.stringify(directVal);
          }

          return directVal !== undefined && directVal !== null
            ? String(directVal)
            : '';
        });

        const dataRow = worksheet.addRow(rowData);
        dataRow.font = { name: 'Arial', size: 9, color: { argb: 'FF1E293B' } };
        dataRow.alignment = { horizontal: 'left', vertical: 'middle' };
        dataRow.height = 20;
      });

      // Borders for data cells
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber >= 5) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            };
          });
        }
      });

      // Auto-fit column widths
      worksheet.columns.forEach((column) => {
        let maxLength = 10;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const columnValue = cell.value ? String(cell.value) : '';
          if (columnValue.length > maxLength) {
            maxLength = columnValue.length;
          }
        });
        column.width = Math.min(Math.max(maxLength + 3, 12), 35);
      });

      // Write and Download File
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Students_Report_${selectedBatch || 'All_Batches'}_${selectedSession || 'All_Sessions'}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);

      setIsExcelModalOpen(false);
      toast.success('Excel sheet exported successfully!');
    } catch (err) {
      toast.error('Failed to export Excel sheet.');
    }
  };

  const totalPages = meta?.totalPages || 1;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="min-h-screen font-sans"
    >
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white"
      >
        <div className="relative px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-200 text-xs font-medium mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                Live Registry Database
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-sky-100 to-sky-300">
                Students Registry
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                View and update verified candidates, monitor department seat
                quotas, and track installments.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <StudentStatCard
                icon={Users}
                value={(
                  meta?.totalItems ??
                  stats?.totalEnrolled ??
                  0
                ).toLocaleString()}
                label="Total Enrolled"
                subLabel="+14.2% YoY Int"
                accent="blue"
              />
              <StudentStatCard
                icon={CheckCircle2}
                value={(stats?.paidCount ?? 0).toLocaleString()}
                label="Paid & Verified"
                subLabel="83% Cleared"
                accent="emerald"
              />
              <StudentStatCard
                icon={AlertCircle}
                value={(stats?.dueCount ?? 0).toLocaleString()}
                label="Fees Due"
                subLabel="Urgent Notice"
                accent="rose"
              />
              <StudentStatCard
                icon={TrendingUp}
                value={`${stats?.payRate ?? 94.8}%`}
                label="Pass Rate"
                subLabel="DUET Success Index"
                accent="indigo"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <div className="px-4 sm:px-5 lg:px-5 py-6 space-y-6 mx-auto">
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Academic Sessions
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {folders?.length} Active Directories
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {sessionCards?.map((card) => (
              <StudentSessionCard
                key={card?.id}
                {...card}
                isActive={
                  selectedSession === card?.id ||
                  selectedSession === card?.title
                }
                onClick={() => setSelectedSession(card?.id)}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Student Master Registry
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time candidate dossiers across engineering intakes.
              </p>
            </div>
          </div>

          <div className="px-5 py-4 border-b border-slate-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/dashboard/student-enrollment"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Enroll New Student
                </Link>

                {/* Export Excel Modal Button */}
                <button
                  type="button"
                  onClick={() => setIsExcelModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  Export Excel
                </button>

                {/* Phone Sheet PDF Button */}
                <button
                  type="button"
                  onClick={handleDownloadPhoneSheet}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Phone Sheet PDF
                </button>

                {/* Attendance Sheet PDF Button */}
                <button
                  type="button"
                  onClick={handleDownloadAttendanceSheet}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Attendance PDF
                </button>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              {selectedIds?.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedIds.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Delete Selected
                  </button>
                </div>
              )}
            </div>

            <StudentFilterBar
              search={debouncedSearch}
              onSearchChange={setDebouncedSearch}
              selectedSession={selectedSession}
              onSessionChange={setSelectedSession}
              selectedBatch={selectedBatch}
              onBatchSelect={handleBatchSelect}
              onClearBatch={handleClearBatch}
              batches={filteredBatches}
              batchQuery={batchQuery}
              onBatchQueryChange={setBatchQuery}
              isBatchDropdownOpen={isBatchDropdownOpen}
              onBatchDropdownToggle={setIsBatchDropdownOpen}
              sessions={sessionCards?.map((c) => c.id)}
              hasActiveFilters={hasActiveFilters}
              onClearAll={handleClearAll}
            />
          </div>

          <div className="p-5">
            <StudentTable
              students={students}
              isLoading={isLoading}
              isFetching={isFetching}
              error={error}
              selectedIds={selectedIds}
              onSelectId={handleSelectId}
              onSelectAll={handleSelectAll}
              // onDelete={handleDeleteOne}
              isDeleting={isDeleting}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              meta={meta || { totalItems: 0 }}
              limit={limit}
              onLimitChange={handleLimitChange}
            />
          </div>
        </motion.section>
      </div>

      {/* Excel Column Selection Modal */}
      <AnimatePresence>
        {isExcelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Export Students To Excel
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Isolate columns fields layout or trigger comprehensive
                    configuration build out
                  </p>
                </div>
                <button
                  onClick={() => setIsExcelModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Select All Bar */}
              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={
                      selectedColumnKeys?.length === EXPORT_COLUMNS?.length
                    }
                    onChange={handleToggleAllColumns}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Select All Columns
                  </span>
                </label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {selectedColumnKeys.length} / {EXPORT_COLUMNS.length}
                </span>
              </div>

              {/* Scrollable Checkbox Grid */}
              <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPORT_COLUMNS?.map((col) => {
                  const isChecked = selectedColumnKeys.includes(col.key);
                  return (
                    <label
                      key={col.key}
                      onClick={() => handleToggleColumn(col.key)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'border-indigo-200 bg-indigo-50/30 text-indigo-950 font-medium'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-xs">{col.label}</span>
                    </label>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsExcelModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Data Structure
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AllStudents;

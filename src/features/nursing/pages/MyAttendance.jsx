import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
// import PropTypes from "prop-types";
import {
  CalendarIcon,
  DollarSignIcon,
  DownloadIcon,
  FilterIcon,
  UserCircleIcon,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Timer,
  Building,
  BadgeDollarSign,
  RefreshCw,
  AlertCircle,
  TrendingUpIcon,
  Calendar,
} from 'lucide-react';
import { useGetSingleNurseAttendancesQuery } from '../../../../redux/features/Nursing/NursingApi';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import autoTable from 'jspdf-autotable';

// Animation configurations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

// Style configurations
const statusConfig = {
  approve: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle,
    label: 'Approved',
  },
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
    label: 'Pending',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: AlertCircle,
    label: 'Rejected',
  },
};

const paymentStatusConfig = {
  paid: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: CheckCircle,
    label: 'Paid',
  },
  unpaid: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: Clock,
    label: 'Unpaid',
  },
  processing: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: RefreshCw,
    label: 'Processing',
  },
};

const StatusBadge = ({ statusKey, config }) => {
  const status = config[statusKey];
  if (!status) return null;

  const Icon = status.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {status.label}
    </div>
  );
};
const MyAttendance = () => {
  const auth = useSelector((state) => state?.auth?.user);
  // const [isFilterOpen, setIsFilterOpen] = useState(false);
  // const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef();

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    selectedYear: '',
    selectedMonth: '',
    selectedStatus: '',
    selectedPaymentStatus: '',
  });

  // Data fetching
  const { data: nursingData, isLoading } = useGetSingleNurseAttendancesQuery({
    nursingId: auth?._id,
    ...filters,
  });

  // Flatten the duties data
  const flattenDuties = (statements) => {
    if (!statements) return [];
    return statements.flatMap((yearData) =>
      yearData.months.flatMap((monthData) =>
        (monthData.details?.nursingDuties || []).map((duty) => ({
          ...duty,
          year: yearData.year,
          month: monthData.month,
        })),
      ),
    );
  };

  const statements = nursingData?.statements || [];
  const duties = flattenDuties(statements);

  // Get available years and months
  // const availableYears = [...new Set(statements.map((s) => s.year))].sort(
  //   (a, b) => b - a
  // );

  const monthOrder = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  // Pagination
  const totalPages = Math.ceil(duties?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDuties = duties?.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const totalAmount = duties.reduce(
    (sum, item) =>
      item.status === 'approve' ? sum + (item.totalAmount || 0) : sum,
    0,
  );

  // const approvedCount = duties.filter((d) => d.status === "approve").length;

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      selectedYear: '',
      selectedMonth: '',
      selectedStatus: '',
      selectedPaymentStatus: '',
    });

    setCurrentPage(1);
  };

  // Time formatting
  const formatTimeToHMS = (seconds) => {
    if (seconds === undefined || seconds === null || isNaN(seconds))
      return '0h 0m';
    const totalSeconds = Math.floor(Number(seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // duty statement
  const downloadPDF = () => {
    // Capture generation time once
    const generatedTime = new Date().toLocaleString();

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const rowHeight = 6;
      const maxRowsPerPage = 20;
      let cursorY = margin + 20;

      const capitalize = (str) =>
        str
          ?.toLowerCase()
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') || 'N/A';

      const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0 second';

        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        const parts = [];
        if (h) parts.push(`${h} hour${h > 1 ? 's' : ''}`);
        if (m) parts.push(`${m} minute${m > 1 ? 's' : ''}`);
        if (s) parts.push(`${s} second${s > 1 ? 's' : ''}`);

        return parts.join(' ') || '0 second';
      };

      const convertToAmPm = (timeStr) => {
        if (!timeStr || !timeStr.includes(':')) return 'N/A';
        const [hourStr, minuteStr] = timeStr.split(':');
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
      };

      const drawHeader = () => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('RPR DUET ADMISSION CARE', pageWidth / 2, margin + 5, {
          align: 'center',
        });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(
          'M.A. Samad Villa-2 In front of DUET Campus Gazipur, Bangladesh | +880 1742 590 128 | rpr.group2013@gmail.com',
          pageWidth / 2,
          margin + 11,
          { align: 'center' },
        );

        doc.setLineWidth(0.5);
        doc.line(margin, margin + 15, pageWidth - margin, margin + 15);

        cursorY = margin + 20;
      };

      // NEW FOOTER FUNCTION WITH PAGE NUMBERS
      const drawFooter = (currentPage, totalPages) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`Generated: ${generatedTime}`, margin, pageHeight - 5);
        doc.text(
          `Page ${currentPage} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 5,
          {
            align: 'right',
          },
        );
      };

      const drawSignature = () => {
        const signLineY = cursorY + 10;
        doc.setLineWidth(0.3);
        doc.line(
          pageWidth - margin - 65,
          signLineY,
          pageWidth - margin - 15,
          signLineY,
        );
        doc.setFontSize(10);
        doc.text(
          'Authorized Signature',
          pageWidth - margin - 40,
          signLineY + 5,
          {
            align: 'center',
          },
        );
        cursorY = signLineY + 12;
      };

      const getUserInfo = () => {
        for (const statement of statements) {
          for (const month of statement.months) {
            if (month.details?.nursingDuties?.length > 0) {
              const duty = month.details.nursingDuties[0];
              return {
                userName: duty.employeeName,
                phone: duty.phone,
                nursingId: duty?.nursing,
              };
            }
          }
        }
        return null;
      };

      const user = getUserInfo();

      // Group all duties by month
      const dutiesByMonth = {};
      statements.forEach((yearData) => {
        yearData.months.forEach((monthData) => {
          const key = `${monthData.month}, ${yearData.year}`;
          if (!dutiesByMonth[key]) dutiesByMonth[key] = [];
          dutiesByMonth[key].push(...monthData.details.nursingDuties);
        });
      });

      const monthKeys = Object.keys(dutiesByMonth).sort((a, b) => {
        const [monthA, yearA] = a.split(', ');
        const [monthB, yearB] = b.split(', ');
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA - dateB;
      });

      const drawTable = (rows, monthLabel) => {
        if (cursorY + rows.length * rowHeight + 25 > pageHeight - 20) {
          doc.addPage();

          drawHeader();
          cursorY += 3;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(monthLabel, margin, cursorY);
        cursorY += 3;

        const tableData = rows.map((duty) => [
          duty.date?.slice(0, 10) || 'N/A',
          capitalize(duty.employeeName),
          capitalize(duty.messName),
          `${convertToAmPm(duty.dutyStartTime)} - ${convertToAmPm(duty.dutyEndTime)}`,
          formatTime(duty.totalDutyTime),
          `BDT ${(duty.totalAmount || 0).toFixed(2)}`,
          capitalize(duty.status),
          capitalize(duty.paymentStatus || 'N/A'),
        ]);

        autoTable(doc, {
          startY: cursorY,
          head: [
            [
              'Date',
              'Name',
              'Work',
              'Duty Time',
              'Total time',
              'Amount',
              'Status',
              'Payment Status',
            ],
          ],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: 0,
            fontStyle: 'bold',
            fontSize: 10,
            lineColor: [0, 0, 0],
            lineWidth: 0.3,
          },
          styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 2,
            minCellHeight: rowHeight,
            fillColor: [255, 255, 255],
            textColor: 0,
            fontStyle: 'normal',
            lineColor: [0, 0, 0],
            lineWidth: 0.3,
          },
          margin: {
            top: margin + 23,
            left: margin,
            right: margin,
          },
          didDrawPage: (data) => {
            if (data.pageNumber > 1) {
              drawHeader();
            }
          },
        });

        cursorY = doc.lastAutoTable.finalY + 6;
      };

      // === Start PDF generation ===
      drawHeader();

      // First page: User Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Nursing Duty Statement`, pageWidth / 2, cursorY + 5, {
        align: 'center',
      });
      cursorY += 13;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${capitalize(user?.userName) || 'N/A'}`, margin, cursorY);
      doc.text(
        `Phone: ${capitalize(user?.phone) || 'N/A'}`,
        pageWidth - margin,
        cursorY,
        {
          align: 'right',
        },
      );
      cursorY += 6;

      const periodText = `Period: ${filters.startDate || 'All'} to ${filters.endDate || 'All'}`;
      doc.text(periodText, margin, cursorY);
      cursorY += 10;

      // Render each month
      for (const monthKey of monthKeys) {
        const duties = dutiesByMonth[monthKey];

        for (let i = 0; i < duties.length; i += maxRowsPerPage) {
          const chunk = duties.slice(i, i + maxRowsPerPage);
          drawTable(chunk, monthKey);
        }
      }

      // === SUMMARY CALCULATION ===
      let totalAmount = 0;
      let paidAmount = 0;
      let dueAmount = 0;

      monthKeys.forEach((monthKey) => {
        dutiesByMonth[monthKey].forEach((duty) => {
          const amount = duty?.totalAmount || 0;
          totalAmount += amount;
          if (duty.paymentStatus?.toLowerCase() === 'paid') {
            paidAmount += amount;
          } else {
            dueAmount += amount;
          }
        });
      });

      // Add new page for summary if needed
      if (cursorY + 30 > pageHeight - 20) {
        doc.addPage();

        drawHeader();
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      cursorY += 8;
      doc.text('Summary', margin, cursorY);
      cursorY += 3;

      autoTable(doc, {
        startY: cursorY,
        head: [['Total Amount', 'Paid', 'Due']],
        body: [
          [
            `BDT ${totalAmount.toFixed(2)}`,
            `BDT ${paidAmount.toFixed(2)}`,
            `BDT ${dueAmount.toFixed(2)}`,
          ],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: 0,
          fontStyle: 'bold',
          fontSize: 10,
          lineColor: [0, 0, 0],
          lineWidth: 0.3,
        },
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 3,
          fillColor: [255, 255, 255],
          textColor: 0,
          fontStyle: 'normal',
          lineColor: [0, 0, 0],
          lineWidth: 0.3,
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          if (data.pageNumber > 1) {
            drawHeader();
          }
        },
      });

      cursorY = doc.lastAutoTable.finalY + 10;
      drawSignature();

      // ADD FOOTERS TO ALL PAGES
      const totalPages = doc.internal.getNumberOfPages();
      const originalPage = doc.internal.getCurrentPageInfo().pageNumber;

      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(i, totalPages);
      }

      // Restore original page
      doc.setPage(originalPage);

      doc.save(`Nursing_Statement_${user?.userName || 'user'}.pdf`);
      // setIsGeneratingPDF(false);
      toast.success('PDF generated successfully!');
    } catch (err) {
      toast.error('Failed to generate PDF.');
      // setIsGeneratingPDF(false);
    }
  };

  const formatTimeToAMPM = (timeStr) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')} ${ampm}`;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen capitalize bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="p-6 mb-6 bg-white border shadow-sm rounded-2xl border-slate-200/60 md:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* User Info Section */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 shadow-lg rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <span className="text-xl font-bold text-white">
                  {auth?.userName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="absolute flex items-center justify-center w-6 h-6 bg-green-500 border-white rounded-full -bottom-1 -right-1 border-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-slate-800">
                  {auth?.userName}
                </h1>
                <div className="px-3 py-1 border border-indigo-200 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50">
                  <span className="text-sm font-medium text-indigo-700 capitalize">
                    {auth?.userType === 'staff' ? 'Employee' : auth?.userType}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-2">
                  <UserCircleIcon className="w-4 h-4 text-slate-500" />
                  <span className="font-medium capitalize text-slate-700">
                    {auth?.userName}
                  </span>
                </div>
                <div className="hidden w-1 h-1 rounded-full sm:block bg-slate-300"></div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">{auth?.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-slate-600">
                    Total Records:{' '}
                    <span className="font-semibold text-slate-800">
                      {duties.length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    Total Earned:{' '}
                    <span className="font-bold text-emerald-600">
                      {totalAmount?.toFixed(2)} BDT
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <button
              onClick={downloadPDF}
              disabled={!duties.length}
              className="flex items-center gap-3 px-6 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <DownloadIcon className="w-5 h-5 transition-transform group-hover:translate-y-[-1px]" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filter Section */}
      <div className="p-6 mb-6 bg-white shadow-xl rounded-2xl">
        <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
          <div>
            <p className="mt-1 text-sm text-gray-500">
              Filter and analyze nursing records
            </p>
          </div>

          <div className="flex w-full gap-3 md:w-auto">
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg h-11 hover:bg-red-700 whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Date Range Picker */}
          <div className="flex-1 min-w-[200px] md:max-w-[320px] relative">
            <label className="block px-1 mb-1 text-sm font-medium text-gray-700">
              Date Range
            </label>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full h-11 px-4 flex items-center justify-between gap-2 bg-white border ${
                filters.startDate ? 'border-blue-500' : 'border-gray-200'
              } rounded-lg text-gray-950 hover:bg-gray-50 transition-colors`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {filters.startDate ? (
                  <span className="text-sm truncate">
                    {filters.startDate} - {filters.endDate || filters.startDate}
                  </span>
                ) : (
                  <span className="text-gray-500">Select Date Range</span>
                )}
              </div>
              {filters.startDate && (
                <X
                  className="w-4 h-4 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters((prev) => ({
                      ...prev,
                      startDate: '',
                      endDate: '',
                    }));
                  }}
                />
              )}
            </button>

            {isOpen && (
              <div
                ref={popoverRef}
                className="absolute z-40 w-full max-w-lg p-4 mt-1 space-y-4 bg-white border border-gray-200 shadow-xl rounded-xl"
              >
                <div className="flex flex-col gap-4">
                  <div className="w-full">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>

                  <div className="w-full">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reuse this template below for each Select input */}
          {[
            {
              label: 'Year',
              value: filters.selectedYear,
              onChange: (v) =>
                setFilters((prev) => ({ ...prev, selectedYear: v })),
              options: [
                { label: 'All Years', value: '' },
                ...statements.map((s) => ({ label: s.year, value: s.year })),
              ],
              disabled: filters.startDate || filters.endDate,
            },
            {
              label: 'Month',
              value: filters.selectedMonth,
              onChange: (v) =>
                setFilters((prev) => ({ ...prev, selectedMonth: v })),
              options: [
                { label: 'All Months', value: '' },
                ...statements
                  .flatMap((s) => s.months)
                  .sort((a, b) => monthOrder[a.month] - monthOrder[b.month])
                  .map((m) => ({ label: m.month, value: m.month })),
              ],
              disabled: filters.startDate || filters.endDate,
            },
            {
              label: 'Status',
              value: filters.selectedStatus,
              onChange: (v) =>
                setFilters((prev) => ({ ...prev, selectedStatus: v })),
              options: [
                { label: 'All Status', value: '' },
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approve' },
              ],
            },
            {
              label: 'Payment Status',
              value: filters.selectedPaymentStatus,
              onChange: (v) =>
                setFilters((prev) => ({ ...prev, selectedPaymentStatus: v })),
              options: [
                { label: 'Payment Status', value: '' },
                { label: 'Paid', value: 'paid' },
                { label: 'Unpaid', value: 'unpaid' },
              ],
            },
          ].map(
            ({ label, value, onChange, options, disabled = false }, idx) => (
              <div key={idx} className="flex-1 min-w-[140px] relative">
                <label className="block px-1 mb-1 text-sm font-medium text-gray-700">
                  {label}
                </label>
                <select
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className={`w-full h-11 px-4 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 appearance-none bg-no-repeat bg-[center_right_1rem] ${
                    disabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-950'
                  }`}
                  style={{
                    backgroundImage:
                      'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiA5TDEyIDE1TDE4IDkiIHN0cm9rZT0iIzRFNEU0RSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=")',
                  }}
                >
                  {options.map(({ label, value }, i) => (
                    <option key={i} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Data Table */}
      <motion.div
        variants={itemVariants}
        className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-2xl"
      >
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Attendance Records
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Showing {paginatedDuties?.length} of {duties?.length} records
              </p>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
              <tr>
                {[
                  { label: 'Date', icon: CalendarIcon, width: 'w-24' },
                  { label: 'Employee', icon: UserCircleIcon, width: 'w-32' },
                  { label: 'Mess', icon: Building, width: 'w-32' },
                  { label: 'Start', icon: Clock, width: 'w-16' },
                  { label: 'End', icon: Clock, width: 'w-16' },
                  { label: 'Duration', icon: Timer, width: 'w-24' },
                  { label: 'Amount', icon: DollarSignIcon, width: 'w-32' },
                  {
                    label: 'Payment Status',
                    icon: BadgeDollarSign,
                    width: 'w-32',
                  },
                  { label: 'Status', icon: CheckCircle, width: 'w-32' },
                ].map((header) => (
                  <th
                    key={header.label}
                    className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${header.width}`}
                  >
                    <div className="flex items-center gap-2">
                      <header.icon className="w-4 h-4 text-gray-500" />
                      {header.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {paginatedDuties?.map((item, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50"
                >
                  {/* Date */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item?.date}
                    </div>
                  </td>

                  {/* Employee */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {item?.employeeName}
                    </div>
                  </td>

                  {/* Mess */}
                  <td className="px-6 py-4">
                    <div
                      className="text-sm font-medium text-gray-900 capitalize tooltip"
                      data-tip={item?.messName}
                    >
                      {item?.messName?.slice(0, 10)}...
                    </div>
                  </td>

                  {/* Start Time */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {formatTimeToAMPM(item?.dutyStartTime)}
                    </span>
                  </td>

                  {/* End Time */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {formatTimeToAMPM(item?.dutyEndTime)}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {formatTimeToHMS(item?.totalDutyTime)}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">
                      {item?.totalAmount?.toFixed(2)} BDT
                    </div>
                  </td>
                  {/* Amount */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">
                      <StatusBadge
                        statusKey={item.paymentStatus}
                        config={paymentStatusConfig}
                      />
                    </div>
                  </td>
                  {/* Amount */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">
                      <StatusBadge
                        statusKey={item.status}
                        config={statusConfig}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {!paginatedDuties?.length && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-16 text-center"
            >
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl">
                <FilterIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-700">
                No Records Found
              </h3>
              <p className="max-w-md mx-auto mb-6 text-gray-500">
                No attendance records match your current search and filter
                criteria. Try adjusting your filters or search terms.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClearFilters}
                className="px-6 py-3 font-medium text-white transition-all bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-16 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin" />
              <p className="text-gray-600">Loading attendance records...</p>
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{' '}
                {Math.min(startIndex + itemsPerPage, duties?.length)} of{' '}
                {duties?.length} results
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 transition-all border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 transition-all border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MyAttendance;

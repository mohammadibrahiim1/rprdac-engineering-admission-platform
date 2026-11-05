import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Filter,
  Clock,
  CheckCircle,
  X,
  BookOpen,
  Search,
  Phone,
  AlertCircle,
  RefreshCw,
  Wallet,
  Grid3X3,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  Banknote,
} from 'lucide-react';
import BreadCrumbMenu from '../../../../components/BreadCrumbMenu';
import { useGetTeacherClassesQuery } from '../../../../redux/features/teacher/teacherApi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────
   Global styles
───────────────────────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

  :root {
    --page-bg  : #f7f7f5;
    --surface  : #ffffff;
    --border   : #e8e8e6;
    --border-2 : #f0f0ee;
    --text-1   : #1a1a1a;
    --text-2   : #4b4b4b;
    --text-3   : #8f8f8f;
    --text-4   : #b5b5b5;
    --r        : 6px;
    --r-lg     : 10px;
  }

  *, *::before, *::after {
    font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
    box-sizing: border-box;
  }

  .nt { width: 100%; border-collapse: collapse; }
  .nt thead th {
    padding: 8px 14px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--text-3);
    background: #fafafa;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
    user-select: none;
  }
  .nt tbody td {
    padding: 9px 14px;
    font-size: 13px;
    color: var(--text-2);
    border-bottom: 1px solid var(--border-2);
    vertical-align: middle;
  }
  .nt tbody tr:last-child td { border-bottom: none; }
  .nt tbody tr:hover td { background: #fafafa; }

  .ns::-webkit-scrollbar { width: 4px; height: 4px; }
  .ns::-webkit-scrollbar-track { background: transparent; }
  .ns::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 99px; }

  .nsel {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2.2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 9px center;
    padding-right: 26px !important;
  }
`;

/* ─────────────────────────────────────────────
   Small reusable components
───────────────────────────────────────────── */
const Badge = ({ variant = 'gray', children }) => {
  const styles = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    gray: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  const dots = {
    green: 'bg-emerald-500',
    amber: 'bg-amber-400',
    blue: 'bg-blue-500',
    gray: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${styles[variant]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[variant]}`}
      />
      {children}
    </span>
  );
};

const SortIcon = ({ col, sortConfig }) => {
  if (sortConfig.key !== col) {
    return <ArrowUpDown className="flex-shrink-0 w-3 h-3 opacity-25" />;
  }
  return sortConfig.direction === 'ascending' ? (
    <ArrowUp className="flex-shrink-0 w-3 h-3 text-slate-700" />
  ) : (
    <ArrowDown className="flex-shrink-0 w-3 h-3 text-slate-700" />
  );
};

const FilterField = ({ label, name, options, isObj, value, onChange }) => (
  <div className="space-y-1">
    <label className="block text-[10.5px] font-semibold text-[var(--text-3)] uppercase tracking-widest">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      className="nsel w-full px-2.5 py-[7px] text-[14px] bg-white border border-[var(--border)] rounded-[var(--r)] focus:outline-none focus:ring-1 focus:ring-slate-400 text-[var(--text-2)] transition-all"
    >
      <option value="">All</option>
      {options?.map((o) =>
        isObj ? (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ) : (
          <option key={o} value={o}>
            {o}
          </option>
        ),
      )}
    </select>
  </div>
);

/* ─────────────────────────────────────────────
   Helper functions (pure)
───────────────────────────────────────────── */
const capitalize = (str) =>
  str
    ?.toLowerCase()
    .split(' ')
    .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ') || 'N/A';

const formatDate = (date) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const MyClasses = () => {
  const user = useSelector((state) => state?.auth?.user);

  // ── State ──
  const [filters, setFilters] = useState({
    year: '',
    month: '',
    batch: '',
    paymentStatus: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [groupedData, setGroupedData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  // ── API ──
  const {
    data: teacherData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTeacherClassesQuery(
    { teacherId: user?._id },
    { skip: user?.userType !== 'teacher' },
  );

  // ── Filter + Sort Logic ──
  useEffect(() => {
    if (!teacherData) return;

    let filtered = (teacherData?.statements || []).flatMap((yearData) =>
      yearData.months.flatMap((month) =>
        (month.details?.classes || [])
          .filter((item) => {
            const classDate = new Date(item.classDate);
            const start = filters.startDate
              ? new Date(filters.startDate)
              : null;
            const end = filters.endDate ? new Date(filters.endDate) : null;
            const query = searchQuery.toLowerCase();

            const matchYear = !filters.year || yearData.year === filters.year;
            const matchMonth = !filters.month || month.month === filters.month;
            const matchBatch =
              !filters.batch ||
              item.batch?.toLowerCase() === filters.batch.toLowerCase();
            const matchPayment =
              !filters.paymentStatus ||
              item.paymentStatus?.toLowerCase() ===
                filters.paymentStatus.toLowerCase();
            const matchStatus =
              !filters.status ||
              item.status?.toLowerCase() === filters.status.toLowerCase();
            const matchDate =
              !start || !end || (classDate >= start && classDate <= end);
            const matchSearch =
              !query ||
              [
                item.batch,
                item.className,
                item.teacher?.userName,
                item.department,
                item.subject,
              ].some((field) => field?.toLowerCase().includes(query));

            return (
              matchYear &&
              matchMonth &&
              matchBatch &&
              matchPayment &&
              matchStatus &&
              matchDate &&
              matchSearch
            );
          })
          .map((item) => ({
            ...item,
            _year: yearData.year,
            _month: month.month,
          })),
      ),
    );

    // Sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (['totalFee', 'totalDutyFee'].includes(sortConfig.key)) {
          return sortConfig.direction === 'ascending'
            ? (aVal || 0) - (bVal || 0)
            : (bVal || 0) - (aVal || 0);
        }

        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    // Group by month-year
    const grouped = filtered.reduce((acc, item) => {
      const key = `${item._month}-${item._year}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    setGroupedData(grouped);
    setCurrentPage(1);
  }, [teacherData, filters, searchQuery, sortConfig]);

  // ── Handlers ──
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));
  }, []);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      year: '',
      month: '',
      batch: '',
      paymentStatus: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setSearchQuery('');
    setSortConfig({ key: null, direction: 'ascending' });
    setCurrentPage(1);
  }, []);

  // ── Derived data ──
  const getYears = () => [
    ...new Set(teacherData?.statements?.map((i) => i.year) || []),
  ];
  const getMonths = () => [
    ...new Set(
      teacherData?.statements?.flatMap((i) => i.months.map((m) => m.month)) ||
        [],
    ),
  ];
  const getBatches = () =>
    [
      ...new Set(
        teacherData?.statements?.flatMap((i) =>
          i.months.flatMap(
            (m) => m.details?.classes?.map((c) => c.batch) || [],
          ),
        ) || [],
      ),
    ].filter(Boolean);

  const tableData = Object.values(groupedData).flat();
  const recordCountLabel = `${tableData.length} record${tableData.length !== 1 ? 's' : ''}`;
  const totalPages = Math.max(1, Math.ceil(tableData.length / ROWS_PER_PAGE));
  const paginatedData = tableData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const stats = useMemo(() => {
    const all = Object.values(groupedData).flat();
    return {
      total: all.length,
      approved: all.filter((i) => i.status === 'approve').length,
      pending: all.filter((i) => i.status !== 'approve').length,
      earnings: all.reduce(
        (sum, i) => sum + (i.totalDutyFee || i.totalFee || 0),
        0,
      ),
    };
  }, [groupedData]);

  const pageButtons = useMemo(() => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  }, [totalPages, currentPage]);

  const filterGroups = [
    { name: 'year', label: 'Year', options: getYears(), isObj: false },
    { name: 'month', label: 'Month', options: getMonths(), isObj: false },
    { name: 'batch', label: 'Batch', options: getBatches(), isObj: false },
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'approve', label: 'Approved' },
        { value: 'pending', label: 'Pending' },
      ],
      isObj: true,
    },
    {
      name: 'paymentStatus',
      label: 'Payment',
      options: [
        { value: 'paid', label: 'Paid' },
        { value: 'unpaid', label: 'Unpaid' },
      ],
      isObj: true,
    },
  ];

  // ── PDF Export (now inside component) ──
  const downloadPDF = useCallback(() => {
    if (!teacherData?.statements?.length) {
      toast.error('No data available to export');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = margin + 20;

      const tableOptions = {
        theme: 'grid',
        showHead: 'firstPage',
        headStyles: {
          fillColor: false,
          textColor: 0,
          lineColor: [0, 0, 0],
          lineWidth: 0.4,
        },
        styles: {
          fillColor: false,
          textColor: 0,
          lineColor: [0, 0, 0],
          lineWidth: 0.4,
        },
        margin: { left: margin, right: margin },
      };

      const addHeader = () => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('RPR DUET ADMISSION CARE', pageWidth / 2, margin + 5, {
          align: 'center',
        });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(
          'M.A. Samad Villa In front of DUET Campus Gazipur | +880 1742 590 128 | rpr.group2013@gmail.com',
          pageWidth / 2,
          margin + 11,
          { align: 'center' },
        );

        doc.setLineWidth(0.5);
        doc.line(margin, margin + 15, pageWidth - margin, margin + 15);
        currentY = margin + 20;
      };

      const addFooter = (pageNum, totalPages) => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Generated: ${new Date().toLocaleString()}`,
          margin,
          pageHeight - 6,
        );
        doc.text(
          `Page ${pageNum} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 6,
          {
            align: 'right',
          },
        );
      };

      // Group data
      const dutiesByMonth = {};
      const loansByMonth = {};

      teacherData.statements.forEach((yearData) => {
        yearData?.months?.forEach((monthData) => {
          const key = `${monthData.month}, ${yearData.year}`;
          if (!dutiesByMonth[key]) dutiesByMonth[key] = [];
          if (!loansByMonth[key]) loansByMonth[key] = [];

          dutiesByMonth[key].push(...(monthData?.details?.classes || []));
          loansByMonth[key].push(...(monthData?.details?.loans || []));
        });
      });

      const monthKeys = Object.keys(dutiesByMonth).sort((a, b) => {
        const [monthA, yearA] = a.split(', ');
        const [monthB, yearB] = b.split(', ');
        return (
          new Date(`${monthA} 1 ${yearA}`) - new Date(`${monthB} 1 ${yearB}`)
        );
      });

      // Content
      addHeader();

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Teacher Class Statement', pageWidth / 2, currentY + 5, {
        align: 'center',
      });
      currentY += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${capitalize(user?.userName)}`, margin, currentY);
      doc.text(`Phone: ${user?.phone || 'N/A'}`, pageWidth - margin, currentY, {
        align: 'right',
      });
      currentY += 6;

      doc.text(
        `Period: ${filters.startDate || 'All'} → ${filters.endDate || 'All'}`,
        margin,
        currentY,
      );
      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        pageWidth - margin,
        currentY,
        {
          align: 'right',
        },
      );
      currentY += 10;

      let totalAmount = 0;
      let totalPaid = 0;
      let totalDue = 0;
      let totalLoan = 0;

      monthKeys.forEach((monthKey) => {
        const classes = dutiesByMonth[monthKey] || [];
        const loans = loansByMonth[monthKey] || [];

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(monthKey, margin, currentY);
        currentY += 4;

        // Classes table
        if (classes.length > 0) {
          autoTable(doc, {
            ...tableOptions,
            startY: currentY,
            head: [
              [
                'Date',
                'Name',
                'Batch',
                'Dept',
                'Subject',
                'Time',
                'Amount',
                'Status',
                'Payment',
              ],
            ],
            body: classes.map((item) => {
              const amount = item.totalFee || 0;
              totalAmount += amount;

              if (item.paymentStatus?.toLowerCase() === 'paid') {
                totalPaid += amount;
              } else {
                totalDue += amount;
              }

              return [
                item?.classDate?.slice(0, 10) || 'N/A',
                capitalize(item?.userName),
                capitalize(item.batch),
                item.department || 'N/A',
                item.subject || 'N/A',
                `${item.classTime}-${item.classQuantity || 'N/A'}H`,
                `${amount.toFixed(2)} BDT`,
                capitalize(item.status),
                capitalize(item.paymentStatus || 'N/A'),
              ];
            }),
          });
          currentY = doc.lastAutoTable.finalY + 5;
        }

        // Loans table
        if (loans.length > 0) {
          autoTable(doc, {
            ...tableOptions,
            startY: currentY,
            head: [['Date', 'Name', 'Loan Amt', 'Status', 'Payment']],
            body: loans.map((loan) => {
              const amount = loan.amount || 0;
              totalLoan += amount;

              return [
                loan?.date?.slice(0, 10) || 'N/A',
                capitalize(loan?.userDetails?.userName),
                `${amount.toFixed(2)} BDT`,
                capitalize(loan?.status),
                loan?.isPaid ? 'Paid' : 'Unpaid',
              ];
            }),
          });
          currentY = doc.lastAutoTable.finalY + 5;
        }

        // Month totals
        const monthClassTotal = classes.reduce(
          (sum, i) => sum + (i.totalFee || 0),
          0,
        );
        const monthLoanTotal = loans.reduce(
          (sum, l) => sum + (l.amount || 0),
          0,
        );

        autoTable(doc, {
          ...tableOptions,
          startY: currentY,
          head: [[`${monthKey} Class Total`, `${monthKey} Loan Total`]],
          body: [
            [
              `BDT ${monthClassTotal.toFixed(2)}`,
              `BDT ${monthLoanTotal.toFixed(2)}`,
            ],
          ],
        });
        currentY = doc.lastAutoTable.finalY + 8;
      });

      // Summary
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', margin, currentY);
      currentY += 4;

      autoTable(doc, {
        ...tableOptions,
        startY: currentY,
        head: [['Total', 'Paid', 'Due', 'Loan', 'Due After Loan']],
        body: [
          [
            `BDT ${totalAmount.toFixed(2)}`,
            `BDT ${totalPaid.toFixed(2)}`,
            `BDT ${totalDue.toFixed(2)}`,
            `BDT ${totalLoan.toFixed(2)}`,
            `BDT ${(totalDue - totalLoan).toFixed(2)}`,
          ],
        ],
      });

      // Footers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(i, totalPages);
      }

      // Save
      const fileName = `Teacher_Statement_${user?.userName || 'user'}.pdf`;
      doc.save(fileName);
      toast.success('PDF generated successfully!');
    } catch (err) {
      toast.error('PDF generation failed.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [teacherData, user, filters]);

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f7f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 rounded-full border-slate-200 border-t-slate-600 animate-spin" />
          <span className="text-[12.5px] text-slate-400 font-medium tracking-wide">
            Please wait...
          </span>
        </div>
      </div>
    );
  }

  // ── Render ──
  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div className="min-h-screen bg-[#f7f7f5]">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-[#f7f7f5]/90 backdrop-blur-md border-b border-[var(--border)]">
          <div className="flex items-center px-4 py-2.5">
            <BreadCrumbMenu />
          </div>
        </header>

        <div className="px-4">
          {/* Page Title */}
          <header className="my-10 space-y-2">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2.5 mb-4"
            >
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <Banknote
                  size={14}
                  className="text-slate-600"
                  strokeWidth={2}
                />
              </div>
              <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-slate-900">
                Class Registry
              </h1>
              <motion.span
                key={paginatedData?.length}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200"
              >
                {paginatedData?.length}
              </motion.span>
              {user?.userName && (
                <span className="hidden sm:inline text-[12px] text-slate-400 ml-1">
                  — {user.userName}
                  {user?.batch && (
                    <span className="text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 ml-1">
                      {user.batch}
                    </span>
                  )}
                </span>
              )}
            </motion.div>
            <div className="flex items-center gap-1.5">
              <Info size={14} className="text-slate-400" />
              <span className="hidden sm:inline text-[12px] text-slate-400">
                Manage and audit all your institutional class records.
              </span>
            </div>
          </header>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-1.5 mb-6">
            {[
              {
                icon: <Grid3X3 className="w-3 h-3" />,
                label: 'Total',
                value: stats.total,
                color: 'text-slate-500',
              },
              {
                icon: <CheckCircle className="w-3 h-3" />,
                label: 'Approved',
                value: stats.approved,
                color: 'text-emerald-600',
              },
              {
                icon: <AlertCircle className="w-3 h-3" />,
                label: 'Pending',
                value: stats.pending,
                color: 'text-amber-500',
              },
              {
                icon: <Wallet className="w-3 h-3" />,
                label: 'Earnings',
                value: stats.earnings.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'BDT',
                }),
                color: 'text-blue-600',
              },
            ].map(({ icon, label, value, color }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-2.5 py-[5px] bg-white border border-[var(--border)] rounded-[var(--r)] text-[11.5px] font-medium select-none"
              >
                <span className={color}>{icon}</span>
                <span className="text-slate-400">{label}</span>
                <span className={`${color} font-semibold`}>{value}</span>
              </span>
            ))}
          </div>

          {/* Main Layout */}
          <div className="flex items-start gap-5">
            {/* Left Sidebar Filters (Desktop) */}
            <aside className="hidden lg:flex flex-col flex-shrink-0 w-[210px] sticky top-[56px]">
              <div className="bg-white border border-[var(--border)] rounded-[var(--r-lg)] overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--border)]">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[14px] font-semibold text-slate-600">
                      Filters
                    </span>
                    {activeFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-slate-900 text-white rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-[11px] text-slate-400 hover:text-slate-700 font-medium transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="p-3.5 space-y-3.5 ns overflow-y-auto">
                  {filterGroups.map((group) => (
                    <FilterField
                      key={group.name}
                      name={group.name}
                      label={group.label}
                      options={group.options}
                      isObj={group.isObj}
                      value={filters[group.name]}
                      onChange={handleFilterChange}
                    />
                  ))}

                  <div className="space-y-1">
                    <label
                      htmlFor="my-classes-start-date"
                      className="block text-[10.5px] font-semibold text-[var(--text-3)] uppercase tracking-widest"
                    >
                      Date Range
                    </label>
                    <input
                      id="my-classes-start-date"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        handleFilterChange('startDate', e.target.value)
                      }
                      className="w-full px-2.5 py-[7px] text-[12px] bg-white border border-[var(--border)] rounded-[var(--r)] focus:outline-none focus:ring-1 focus:ring-slate-400 text-[var(--text-2)]"
                    />
                    <label htmlFor="my-classes-end-date" className="sr-only">
                      End date
                    </label>
                    <input
                      id="my-classes-end-date"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        handleFilterChange('endDate', e.target.value)
                      }
                      className="w-full px-2.5 py-[7px] text-[12px] bg-white border border-[var(--border)] rounded-[var(--r)] focus:outline-none focus:ring-1 focus:ring-slate-400 text-[var(--text-2)] mt-1.5"
                    />
                  </div>

                  <AnimatePresence>
                    {activeFilterCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-1 overflow-hidden"
                      >
                        <p className="text-[10.5px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
                          Active
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(filters).map(
                            ([key, value]) =>
                              value && (
                                <span
                                  key={key}
                                  className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-slate-100 text-slate-600 rounded text-[10.5px] font-medium"
                                >
                                  {value}
                                  <button
                                    type="button"
                                    onClick={() => handleFilterChange(key, '')}
                                    className="w-3.5 h-3.5 flex items-center justify-center rounded hover:bg-slate-200"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                              ),
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </aside>

            {/* Right Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search batch, subject, teacher…"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-[7px] text-[12.5px] bg-white border border-[var(--border)] rounded-[var(--r)] focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder-slate-300 text-slate-700"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(true)}
                    className={`lg:hidden inline-flex items-center gap-1.5 px-3 py-[7px] text-[12px] font-medium rounded-[var(--r)] border transition-all ${
                      activeFilterCount > 0
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-[var(--border)] hover:border-slate-300'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </button>

                  <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    title="Refresh"
                    className="inline-flex items-center justify-center w-8 h-8 bg-white border border-[var(--border)] rounded-[var(--r)] hover:border-slate-300 disabled:opacity-40"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 text-slate-500 ${isFetching ? 'animate-spin' : ''}`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={downloadPDF}
                    disabled={
                      isGeneratingPDF || !teacherData?.statements?.length
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-[7px] text-[12px] font-semibold bg-slate-900 text-white rounded-[var(--r)] hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isGeneratingPDF ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>Export PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Active Filters */}
              <AnimatePresence>
                {activeFilterCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-1.5 mb-3 overflow-hidden lg:hidden"
                  >
                    {Object.entries(filters).map(
                      ([key, value]) =>
                        value && (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[var(--border)] text-[11px] text-slate-600 rounded-full font-medium"
                          >
                            <span className="text-slate-400">{key}:</span>{' '}
                            {value}
                            <button
                              type="button"
                              onClick={() => handleFilterChange(key, '')}
                              className="ml-0.5 hover:text-slate-900"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ),
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Table Card */}
              <div className="bg-white border border-[var(--border)] rounded-[var(--r-lg)] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-2)] bg-[#fafafa]">
                  <span className="text-[11.5px] text-slate-400 font-medium">
                    {tableData.length > 0
                      ? `${recordCountLabel}${searchQuery ? ' · filtered' : ''}`
                      : 'No records'}
                  </span>
                  {totalPages > 1 && (
                    <span className="text-[11px] text-slate-300">
                      Page {currentPage} / {totalPages}
                    </span>
                  )}
                </div>

                {error && (
                  <div className="flex flex-col items-center justify-center gap-3 py-20">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-[13px] text-slate-500">
                      {error?.data?.message || 'Failed to load data'}
                    </p>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="px-3.5 py-1.5 text-[12px] font-semibold bg-slate-900 text-white rounded-[var(--r)] hover:bg-slate-800"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!error && paginatedData.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-20">
                    <span className="text-3xl">📂</span>
                    <p className="text-[13.5px] font-semibold text-slate-700">
                      No classes found
                    </p>
                    <p className="text-[12px] text-slate-400">
                      {activeFilterCount || searchQuery
                        ? 'Try adjusting your filters or search'
                        : 'No classes scheduled yet'}
                    </p>
                    {(activeFilterCount > 0 || searchQuery) && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-1 px-3 py-1.5 text-[11.5px] font-medium bg-slate-100 text-slate-600 rounded-[var(--r)] hover:bg-slate-200"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}

                {!error && paginatedData.length > 0 && (
                  <>
                    <div className="overflow-x-auto ns">
                      <table className="nt">
                        <thead>
                          <tr>
                            <th>
                              <button
                                type="button"
                                onClick={() => handleSort('classDate')}
                                className="inline-flex items-center gap-1 hover:text-slate-700"
                              >
                                DATE{' '}
                                <SortIcon
                                  col="classDate"
                                  sortConfig={sortConfig}
                                />
                              </button>
                            </th>
                            <th>Teacher</th>
                            <th>Batch</th>
                            <th>
                              <button
                                type="button"
                                onClick={() => handleSort('subject')}
                                className="inline-flex items-center gap-1 hover:text-slate-700"
                              >
                                SUBJECT{' '}
                                <SortIcon
                                  col="subject"
                                  sortConfig={sortConfig}
                                />
                              </button>
                            </th>
                            <th>Duration</th>
                            <th>
                              <button
                                type="button"
                                onClick={() => handleSort('totalFee')}
                                className="inline-flex items-center gap-1 hover:text-slate-700"
                              >
                                FEE{' '}
                                <SortIcon
                                  col="totalFee"
                                  sortConfig={sortConfig}
                                />
                              </button>
                            </th>
                            <th>Payment</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map((item, idx) => (
                            <motion.tr
                              key={item._id || idx}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.012 }}
                            >
                              <td className="whitespace-nowrap text-[12.5px] text-slate-500">
                                {formatDate(item?.classDate)}
                              </td>
                              <td>
                                <p className="text-sm font-medium leading-tight capitalize text-slate-800 whitespace-nowrap">
                                  {item.teacherInfo?.userName || '—'}
                                </p>
                                {item.teacherInfo?.phone && (
                                  <p className="flex items-center gap-0.5 text-[12px] text-slate-400 mt-0.5">
                                    <Phone className="w-2.5 h-2.5 flex-shrink-0" />
                                    {item.teacherInfo.phone}
                                  </p>
                                )}
                              </td>
                              <td>
                                <Badge variant="blue">
                                  {item.batch || '—'}
                                </Badge>
                              </td>
                              <td className="max-w-[140px]">
                                <span className="block text-[12.5px] text-slate-600">
                                  {item.subject || '—'}
                                </span>
                              </td>
                              <td className="whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 text-[12px] text-slate-500">
                                  <Clock className="flex-shrink-0 w-3 h-3 text-slate-300" />
                                  {item.period ? `${item.period}h` : '—'}
                                </span>
                              </td>
                              <td className="whitespace-nowrap">
                                <span className="text-[13px] font-semibold text-slate-800">
                                  {item.totalFee
                                    ? Number(item.totalFee).toLocaleString(
                                        'en-US',
                                        {
                                          style: 'currency',
                                          currency: 'BDT',
                                        },
                                      )
                                    : '—'}
                                </span>
                              </td>
                              <td>
                                <Badge
                                  variant={
                                    item.paymentStatus === 'paid'
                                      ? 'green'
                                      : 'amber'
                                  }
                                >
                                  {item.paymentStatus === 'paid'
                                    ? 'Paid'
                                    : 'Unpaid'}
                                </Badge>
                              </td>
                              <td>
                                <Badge
                                  variant={
                                    item.status === 'approve' ? 'green' : 'gray'
                                  }
                                >
                                  {item.status === 'approve'
                                    ? 'Approved'
                                    : 'Pending'}
                                </Badge>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--border-2)] bg-[#fafafa]">
                        <span className="text-[11.5px] text-slate-400">
                          {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                          {Math.min(
                            currentPage * ROWS_PER_PAGE,
                            tableData.length,
                          )}{' '}
                          of {tableData.length}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className="inline-flex items-center justify-center w-7 h-7 bg-white border border-[var(--border)] rounded-[var(--r)] hover:bg-slate-50 disabled:opacity-30"
                          >
                            <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                          </button>

                          {pageButtons.map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-[var(--r)] text-[12px] font-medium border ${
                                currentPage === page
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white border-[var(--border)] text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center justify-center w-7 h-7 bg-white border border-[var(--border)] rounded-[var(--r)] hover:bg-slate-50 disabled:opacity-30"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 260 }}
              className="fixed top-0 right-0 z-50 h-full w-[260px] bg-white border-l border-[var(--border)] shadow-xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[#fafafa]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[13px] font-semibold text-slate-700">
                    Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-slate-900 text-white rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-md hover:bg-slate-100"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto ns">
                {filterGroups.map((group) => (
                  <FilterField
                    key={group.name}
                    name={group.name}
                    label={group.label}
                    options={group.options}
                    isObj={group.isObj}
                    value={filters[group.name]}
                    onChange={(name, value) => {
                      handleFilterChange(name, value);
                      setIsMobileFilterOpen(false);
                    }}
                  />
                ))}

                <div className="space-y-1">
                  <label className="block text-[10.5px] font-semibold text-[var(--text-3)] uppercase tracking-widest">
                    Date Range
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange('startDate', e.target.value)
                    }
                    className="w-full px-2.5 py-[7px] text-[12px] bg-white border border-[var(--border)] rounded-[var(--r)] focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange('endDate', e.target.value)
                    }
                    className="w-full px-2.5 py-[7px] text-[12px] bg-white border border-[var(--border)] rounded-[var(--r)] focus:outline-none focus:ring-1 focus:ring-slate-400 mt-1.5"
                  />
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-full py-2 text-[12px] font-medium text-slate-500 hover:text-slate-800 border border-dashed border-slate-200 rounded-[var(--r)] hover:border-slate-300"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MyClasses;

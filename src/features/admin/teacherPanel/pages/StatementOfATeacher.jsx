import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import {
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Calendar,
  BarChart3,
  CreditCard,
  BookOpen,
  Users,
  Banknote,
  Zap,
  User,
} from 'lucide-react';
import { useGetTeacherFinancialStatementQuery } from '../../../../../redux/features/teacher/teacherApi';
import { useSelector } from 'react-redux';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import TeacherFilterSidebar from '../components/TeacherFilterSidebar';
import { formatDateDMY } from '../../../../../constants/dateFormat';

const StatementOfATeacher = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('classes');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const batchFilters = useSelector((state) => state?.filters?.filters);
  const selectedBatch = batchFilters?.batch?.title || '';

  const [summaryStats, setSummaryStats] = useState({
    totalClasses: 0,
    totalAmount: 0,
    totalLoanAmount: 0,
    pendingClasses: 0,
    approvedClasses: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    year: '',
    month: '',
    batch: [],
    status: '',
    paymentStatus: '',
    department: '',
    subject: '',
    startDate: startDate,
    endDate: endDate,
  });

  useEffect(() => {
    if (selectedBatch) {
      setFilters((prev) => ({
        ...prev,
        batch: selectedBatch,
      }));
    }
  }, [selectedBatch]);

  const { data, isLoading, isError, error, refetch } =
    useGetTeacherFinancialStatementQuery({
      teacherId: id,
      ...filters,
    });

  const statements = useMemo(() => data?.statements || [], [data]);

  // Get user data
  const firstClass = statements?.[0]?.months?.[0]?.details?.classes?.[0];

  const user = firstClass
    ? {
        userName: firstClass.userName || 'Teacher',
        phone: firstClass.phone || 'N/A',
        userType: firstClass.userType || 'N/A',
      }
    : {
        userName: 'Teacher',
        phone: 'N/A',
        userType: 'N/A',
      };

  // Calculate summary statistics
  useEffect(() => {
    if (statements?.length > 0) {
      const totalClasses = statements.reduce(
        (acc, statement) => acc + (statement.yearlySummary?.totalClasses || 0),
        0,
      );
      const totalAmount = statements?.reduce(
        (acc, statement) => acc + (statement.yearlySummary?.totalAmount || 0),
        0,
      );
      const totalLoanAmount = statements?.reduce(
        (acc, statement) =>
          acc + (statement?.yearlySummary?.totalApprovedLoanAmount || 0),
        0,
      );
      const pendingClasses = statements?.reduce(
        (acc, statement) =>
          acc + (statement?.yearlySummary?.totalPendingClasses || 0),
        0,
      );
      const approvedClasses = statements?.reduce(
        (acc, statement) =>
          acc + (statement?.yearlySummary?.totalApprovedClasses || 0),
        0,
      );

      setSummaryStats({
        totalClasses,
        totalAmount,
        totalLoanAmount,
        pendingClasses,
        approvedClasses,
      });
    }
  }, [statements]);

  // ✅ Automatically handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsFilterOpen(true);
      } else {
        setIsFilterOpen(false);
      }
    };

    handleResize(); // initialize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle month expansion
  const toggleMonthExpansion = (monthKey) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      year: '',
      month: '',
      status: '',
      paymentStatus: '',
      department: '',
      subject: '',
      startDate: '',
      endDate: '',
    });
  };

  const generatePDFStatement = () => {
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
      const primaryFont = 'times';
      let cursorY = margin + 20;

      const capitalize = (str) =>
        str
          ?.toLowerCase()
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') || 'N/A';

      /* ---------------- HEADER ---------------- */

      const drawHeader = () => {
        doc.setFont(primaryFont, 'bold');
        doc.setFontSize(16);

        doc.text('RPR DUET ADMISSION CARE', pageWidth / 2, margin + 5, {
          align: 'center',
        });

        doc.setFont(primaryFont, 'normal');
        doc.setFontSize(9);

        doc.text(
          'M.A. Samad Villa In front of DUET Campus Gazipur, Bangladesh | +880 1742 590 128 | rpr.group2013@gmail.com',
          pageWidth / 2,
          margin + 11,
          { align: 'center' },
        );

        doc.setLineWidth(0.5);
        doc.line(margin, margin + 15, pageWidth - margin, margin + 15);

        cursorY = margin + 20;
      };

      /* ---------------- FOOTER (PAGE NUMBER FIX) ---------------- */

      const drawFooter = (pageNo, totalPages) => {
        doc.setFontSize(8);
        doc.setFont(primaryFont, 'normal');

        doc.text(
          `Generated: ${new Date().toLocaleString()}`,
          margin,
          pageHeight - 6,
        );

        doc.text(
          `Page ${pageNo} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 6,
          {
            align: 'right',
          },
        );
      };

      /* ---------------- SIGNATURE ---------------- */

      const drawSignature = () => {
        const signY = cursorY + 12;

        doc.line(pageWidth - 70, signY, pageWidth - 20, signY);

        doc.setFontSize(10);
        doc.text('Authorized Signature', pageWidth - 45, signY + 5, {
          align: 'center',
        });

        cursorY = signY + 15;
      };

      /* ---------------- GROUP DATA ---------------- */

      const dutiesByMonth = {};
      const loansByMonth = {};

      statements?.forEach((yearData) => {
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

      drawHeader();

      /* ---------------- USER INFO ---------------- */

      doc.setFontSize(10);
      doc.setFont(primaryFont, 'bold');

      doc.text('Teacher Class Statement', pageWidth / 2, cursorY + 5, {
        align: 'center',
      });

      cursorY += 15;

      doc.setFontSize(10);
      doc.setFont(primaryFont, 'normal');

      doc.text(`Name: ${capitalize(user?.userName)}`, margin, cursorY);

      doc.text(`Phone: ${user?.phone || 'N/A'}`, pageWidth - margin, cursorY, {
        align: 'right',
      });

      cursorY += 6;

      doc.text(
        `Period: ${filters.startDate || 'All'} to ${filters.endDate || 'All'}`,
        margin,
        cursorY,
      );

      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        pageWidth - margin,
        cursorY,
        {
          align: 'right',
        },
      );

      cursorY += 10;

      /* ---------------- TOTAL CALC ---------------- */

      let totalClassAmount = 0;
      let totalPaid = 0;
      let totalDue = 0;
      let totalLoan = 0;

      /* ---------------- MONTH LOOP ---------------- */

      for (const monthKey of monthKeys) {
        const classes = dutiesByMonth[monthKey] || [];
        const loans = loansByMonth[monthKey] || [];

        doc.setFont(primaryFont, 'bold');
        doc.setFontSize(10);

        doc.text(monthKey, margin, cursorY);
        cursorY += 4;

        /* ---------- CLASS TABLE ---------- */

        if (classes?.length) {
          const body = classes.map((d) => {
            const amount = d.totalFee || 0;

            totalClassAmount += amount;

            if (d.paymentStatus?.toLowerCase() === 'paid') totalPaid += amount;
            else totalDue += amount;

            return [
              formatDateDMY(d?.classDate?.slice(0, 10)) || 'N/A',
              capitalize(d?.userName),
              capitalize(d.batch),
              d.department || 'N/A',
              d.subject || 'N/A',
              `${d.classTime} - ${d.classQuantity || 'N/A'} H`,
              `${amount.toFixed(2)} BDT`,
              capitalize(d.status),
              capitalize(d.paymentStatus || 'N/A'),
            ];
          });

          autoTable(doc, {
            startY: cursorY,

            head: [
              [
                'Date',
                'Name',
                'Batch',
                'Department',
                'Subject',
                'Total Time',
                'Amount',
                'Status',
                'Payment Status',
              ],
            ],

            body,

            theme: 'grid',

            showHead: 'firstPage',

            headStyles: {
              fillColor: [240, 240, 240],
              textColor: 0,
              fontStyle: 'bold',
              lineWidth: 0.1,
            },

            styles: {
              font: primaryFont,
              fontSize: 9,
              lineColor: [40, 40, 40],
              lineWidth: 0.1, // Single border effect
              textColor: 0,
            },

            margin: { left: margin, right: margin },
          });

          cursorY = doc.lastAutoTable.finalY + 5;
        }

        /* ---------- LOAN TABLE ---------- */

        if (loans?.length) {
          const body = loans.map((l) => {
            const amount = l.amount || 0;

            totalLoan += amount;

            return [
              l?.date?.slice(0, 10) || 'N/A',
              capitalize(l?.userDetails?.userName),
              `${amount.toFixed(2)} BDT`,
              capitalize(l?.status),
              capitalize(l?.isPaid === true ? 'Paid' : 'Unpaid' || 'N/A'),
            ];
          });

          autoTable(doc, {
            startY: cursorY,

            head: [['Date', 'Name', 'Loan Amount', 'Status', 'Payment Status']],

            body,

            theme: 'grid',

            showHead: 'firstPage',

            headStyles: {
              fillColor: [240, 240, 240],
              textColor: 0,
              fontStyle: 'bold',
              lineWidth: 0.1,
            },

            styles: {
              font: primaryFont,
              fontSize: 9,
              lineColor: [40, 40, 40],
              lineWidth: 0.1, // Single border effect
              textColor: 0,
            },

            margin: { left: margin, right: margin },
          });

          cursorY = doc.lastAutoTable.finalY + 5;
        }

        /* ---------- MONTH TOTAL ---------- */

        const monthClassTotal = classes.reduce(
          (s, d) => s + (d.totalFee || 0),
          0,
        );

        const monthLoanTotal = loans.reduce((s, l) => s + (l.amount || 0), 0);

        autoTable(doc, {
          startY: cursorY,

          head: [[`${monthKey} Class Total`, `${monthKey} Loan Total`]],

          body: [
            [
              `BDT ${monthClassTotal.toFixed(2)}`,
              `BDT ${monthLoanTotal.toFixed(2)}`,
            ],
          ],

          theme: 'grid',

          showHead: 'firstPage',

          headStyles: {
            fillColor: [240, 240, 240],
            textColor: 0,
            fontStyle: 'bold',
            lineWidth: 0.1,
          },

          styles: {
            font: primaryFont,
            fontSize: 9,
            lineColor: [40, 40, 40],
            lineWidth: 0.1, // Single border effect
            textColor: 0,
          },

          margin: { left: margin, right: margin },
        });

        cursorY = doc.lastAutoTable.finalY + 8;
      }

      /* ---------------- SUMMARY ---------------- */

      const dueAfterLoan = totalDue - totalLoan;

      doc.setFontSize(10);
      doc.setFont(primaryFont, 'bold');

      doc.text('Summary', margin, cursorY);
      cursorY += 4;

      autoTable(doc, {
        startY: cursorY,

        head: [['Total Amount', 'Paid', 'Due', 'Total Loan', 'Due After Loan']],

        body: [
          [
            `BDT ${totalClassAmount.toFixed(2)}`,
            `BDT ${totalPaid.toFixed(2)}`,
            `BDT ${totalDue.toFixed(2)}`,
            `BDT ${totalLoan.toFixed(2)}`,
            `BDT ${dueAfterLoan.toFixed(2)}`,
          ],
        ],

        theme: 'grid',

        headStyles: {
          fillColor: [240, 240, 240],
          textColor: 0,
          fontStyle: 'bold',
          lineWidth: 0.1,
        },

        styles: {
          font: primaryFont,
          fontSize: 9,
          lineColor: [40, 40, 40],
          lineWidth: 0.1, // Single border effect
          textColor: 0,
        },

        margin: { left: margin, right: margin },
      });

      cursorY = doc.lastAutoTable.finalY + 10;

      drawSignature();

      /* ---------------- PAGE NUMBERS FIX ---------------- */

      const totalPages = doc.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(i, totalPages);
      }

      doc.save(`Teacher_Statement_${user?.userName || 'user'}.pdf`);

      setIsGeneratingPDF(false);
      toast.success('PDF generated successfully!');
    } catch (err) {
      toast.error('Failed to generate PDF.');
      setIsGeneratingPDF(false);
    }
  };

  // Calculate class statistics for each month
  const calculateClassStats = (classes) => {
    const approvedClasses = classes.filter((c) => c.status === 'approve');
    const paidClasses = classes.filter((c) => c.paymentStatus === 'paid');
    const unpaidClasses = classes.filter(
      (c) => c.paymentStatus === 'unpaid' || !c.paymentStatus,
    );

    return {
      approved: approvedClasses.length,
      paid: paidClasses.length,
      unpaid: unpaidClasses.length,
      approvedAmount: approvedClasses.reduce(
        (sum, c) => sum + (c.totalFee || 0),
        0,
      ),
      paidAmount: paidClasses.reduce((sum, c) => sum + (c.totalFee || 0), 0),
      unpaidAmount: unpaidClasses.reduce(
        (sum, c) => sum + (c.totalFee || 0),
        0,
      ),
    };
  };

  const stats = [
    {
      label: 'Classes',
      value: summaryStats?.totalClasses || 0,
      iconColor: 'bg-blue-500/20 text-blue-400',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      label: 'Earnings',
      value: `${summaryStats?.totalAmount?.toLocaleString() || 0}`,
      iconColor: 'bg-emerald-500/20 text-emerald-400',
      icon: <Banknote className="w-5 h-5" />,
    },
    {
      label: 'Loans',
      value: `${summaryStats?.totalLoanAmount?.toLocaleString() || 0}`,
      iconColor: 'bg-rose-500/20 text-rose-400',
      icon: <CreditCard className="w-5 h-5" />,
    },
  ];

  // Month color mapping
  const monthColors = {
    January: 'bg-blue-500 text-white',
    February: 'bg-pink-500 text-white',
    March: 'bg-green-500 text-white',
    April: 'bg-yellow-500 text-black',
    May: 'bg-teal-500 text-white',
    June: 'bg-red-500 text-white',
    July: 'bg-purple-500 text-white',
    August: 'bg-orange-500 text-black',
    September: 'bg-blue-700 text-white',
    October: 'bg-red-700 text-white',
    November: 'bg-teal-800 text-white',
    December: 'bg-cyan-500 text-white',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <span className="ml-3 text-lg">Loading teacher records...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl p-8 mx-auto mt-10 text-center rounded bg-red-50">
        <p className="mt-2 mb-4 text-red-600">
          {error?.data?.message || 'Failed to load teacher records'}
        </p>
        <button
          className="px-4 py-2 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
          onClick={refetch}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3 max-w-screen-2xl sm:px-12">
          <div className="flex items-center gap-2 overflow-hidden">
            <BreadCrumbMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-10 lg:ps-12 lg:py-16">
        <div className="relative flex flex-col gap-6 pb-8 mb-12 border-b border-gray-100 md:flex-row md:items-end md:justify-between">
          {/* Left Side: Branding & Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 bg-[#E6F3FE] rounded-2xl ring-1 ring-[#0075DE]/10 shadow-sm">
                <Zap className="text-[#0075DE] w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#37352F] md:text-2xl">
                  Teacher's Statement Registry
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0075DE]">
                    Live Monitoring Active
                  </span>
                </div>
              </div>
            </div>

            <p className="max-w-xl mt-5 text-[13px] leading-relaxed text-[#73726E] italic border-l-2 border-[#E6F3FE] pl-4">
              “Monitor, track, and update nursing duty records in real-time with
              our precision-engineered monitoring suite.”
            </p>
          </div>

          {/* Right Side: Glowing User Identity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative self-start capitalize group md:self-end"
          >
            {/* The Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0075DE] to-cyan-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative flex items-center gap-3 px-4 py-2 bg-white border border-[#E9E9E7] rounded-full shadow-sm">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-semibold text-[#A4A29E] uppercase tracking-tighter">
                  Active User
                </span>
                <span className="text-sm font-bold text-[#37352F] tracking-tight">
                  {user?.userName || 'Anonymous User'}
                </span>
              </div>

              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#E6F3FE] border border-[#0075DE]/20 text-[#0075DE]">
                <User size={18} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        </div>
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          {/* Left Column - Filters */}
          <TeacherFilterSidebar filters={filters} setFilters={setFilters} />
          {/* Right Column - Summary Tables */}
          <div className="relative grid items-start justify-between grid-cols-1 lg:col-span-3">
            {/* summary card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto min-w-[320px] md:min-w-[500px]"
            >
              {stats?.map((item, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="flex items-center gap-4 p-4 transition-colors bg-black border border-black rounded-2xl backdrop-blur-md hover:bg-black"
                >
                  <div className={`p-3 rounded-xl ${item.iconColor} shrink-0`}>
                    {item?.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-white">
                      {item?.label}
                    </span>
                    <span className="text-lg font-bold leading-tight text-white">
                      {item?.value}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <div className="grid items-start justify-between grid-cols-1 gap-5 mt-5 md:grid-cols-2">
              {/* Yearly Summary Card */}
              <motion.div
                className="overflow-hidden bg-white border border-gray-200 rounded shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="px-5 py-2 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-black" />
                    <h2 className="text-base font-semibold text-black">
                      Yearly Summary
                    </h2>
                  </div>
                  <p className="text-xs text-gray-600">
                    Annual overview of your teaching activities
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#3C6666]">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase border-b">
                          Year
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right text-white uppercase border-b">
                          Classes
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right text-white uppercase border-b">
                          Amount (৳)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {statements?.map((statement, index) => (
                        <motion.tr
                          key={index}
                          className="transition-colors duration-200 hover:bg-gray-50"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className="inline-flex items-center rounded-full text-xs font-medium  text-[#001861]">
                              {statement?.year}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right whitespace-nowrap">
                            <h3 className="text-xs font-semibold text-[#001861]">
                              {statement?.yearlySummary?.totalClasses || 0}
                            </h3>
                            <div className="text-xs text-[#001861]">
                              {statement?.yearlySummary?.totalApprovedClasses ||
                                0}{' '}
                              Approved
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right whitespace-nowrap">
                            <span className="text-xs font-bold text-[#001861]">
                              {statement?.yearlySummary?.totalAmount?.toFixed(
                                2,
                              ) || 0}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Monthly Summary Card */}
              <motion.div
                className="overflow-hidden bg-white border border-gray-200 rounded shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="px-5 py-2 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-black" />
                    <h2 className="text-base font-semibold text-black">
                      Monthly Summary
                    </h2>
                  </div>
                  <p className="text-xs text-gray-600">
                    Monthly breakdown of teaching activities
                  </p>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full">
                    <thead className="bg-[#3C6666] sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase border-b">
                          Month
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right text-white uppercase border-b">
                          Classes
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-right text-white uppercase border-b">
                          Amount (৳)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {statements?.flatMap((statement, sIndex) =>
                        statement?.months?.map((month, mIndex) => (
                          <motion.tr
                            key={`${sIndex}-${mIndex}`}
                            className="transition-colors duration-200 hover:bg-gray-50"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (sIndex + mIndex) * 0.1 }}
                          >
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span className="inline-flex items-center text-xs font-medium  text-[#55004B]">
                                {month?.month} {statement?.year}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right whitespace-nowrap">
                              <div className="text-xs font-semibold text-[#55004B]">
                                {month?.monthSummary?.totalClasses || 0}
                              </div>
                              <div className="text-xs text-[#55004B]">
                                {month?.monthSummary?.totalApprovedClasses || 0}{' '}
                                Approved
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <span className="text-xs font-bold text-[#55004B]">
                                {month?.monthSummary?.totalAmount?.toFixed(2) ||
                                  0}
                              </span>
                            </td>
                          </motion.tr>
                        )),
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>

            {/* Detailed Classes & Loans Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <button
                onClick={generatePDFStatement}
                disabled={isGeneratingPDF || statements.length === 0}
                className="group flex items-center gap-2 rounded
                bg-[#0075DE] px-6 py-2 mt-5 text-sm font-semibold text-[#FFFFFF]
                transition-all hover:bg-[#005BAB]"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Print Statement</span>
                  </>
                )}
              </button>
              <div className="mt-5 overflow-hidden bg-white">
                {/* Header Section */}
                <div className="px-4 py-4 bg-gradient-to-r from-blue-400/10 via-cyan-400/10 to-emerald-400/10 sm:px-6">
                  <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex-1">
                      <h2 className="flex items-center gap-2 text-lg font-bold text-black sm:text-xl">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs uppercase sm:text-sm">
                          Classes & Loans Details
                        </span>
                      </h2>
                      <p className="text-[12px] text-gray-600 brightness-75">
                        Comprehensive breakdown of your teaching activities and
                        financial records
                      </p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                    ></motion.div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-0">
                  <AnimatePresence>
                    {statements?.flatMap((statement, sIndex) =>
                      statement?.months?.map((month, mIndex) => {
                        const monthKey = `${sIndex}-${mIndex}`;
                        const isExpanded = expandedMonths[monthKey];
                        const classStats = calculateClassStats(
                          month?.details?.classes || [],
                        );

                        return (
                          <motion.div
                            key={monthKey}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="border-b border-gray-200 last:border-b-0"
                          >
                            {/* Month Header */}
                            <div
                              className="flex items-center justify-between p-3 transition-all duration-200 cursor-pointer sm:p-3 hover:bg-gray-50"
                              onClick={() => toggleMonthExpansion(monthKey)}
                            >
                              <div className="flex items-center gap-3 sm:gap-4">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                    monthColors[month?.month] ||
                                    'bg-gray-500 text-white'
                                  } shadow`}
                                >
                                  {month?.month} {statement.year}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 sm:gap-4">
                                {/* Stats Summary */}
                                <div className="items-center hidden gap-3 text-sm sm:flex">
                                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded">
                                    <BookOpen className="w-4 h-4 text-[#55004B]" />
                                    <span className="font-semibold text-[#55004B]">
                                      {month?.monthSummary?.totalClasses || 0}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded">
                                    <CreditCard className="w-4 h-4 text-[#55004B]" />
                                    <span className="font-semibold text-[#55004B]">
                                      {month?.monthSummary?.totalLoanRequest ||
                                        0}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded">
                                    <span className="font-bold text-green-800">
                                      ৳{' '}
                                      {month?.monthSummary?.totalAmount?.toFixed(
                                        2,
                                      ) || 0}
                                    </span>
                                  </div>
                                </div>

                                {/* Mobile Stats Summary */}
                                <div className="flex items-center gap-2 sm:hidden">
                                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50">
                                    <BookOpen className="w-3 h-3 text-[#55004B]" />
                                    <span className="font-semibold text-[#55004B] text-xs">
                                      {month?.monthSummary?.totalClasses || 0}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-purple-50">
                                    <CreditCard className="w-3 h-3 text-[#55004B]" />
                                    <span className="font-semibold text-[#55004B] text-xs">
                                      {month?.monthSummary?.totalLoanRequest ||
                                        0}
                                    </span>
                                  </div>
                                </div>

                                {/* Expand/Collapse Icon */}
                                <div
                                  className={`p-2 rounded-full transition-all duration-300 ${
                                    isExpanded
                                      ? 'bg-[#001861] text-white'
                                      : 'bg-[#55004B] text-white'
                                  }`}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.4 }}
                                  className="overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
                                >
                                  <div className="p-4 sm:p-6">
                                    {/* Tab Navigation */}
                                    <div className="flex mb-4 border-b border-gray-200">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveTab('classes');
                                        }}
                                        className={`flex items-center gap-2 px-2 py-1 font-medium text-[12px] uppercase transition-all duration-200 border-b-2 ${
                                          activeTab === 'classes'
                                            ? 'border-[#001861] text-[#001861] bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        <BookOpen className="w-4 h-4" />
                                        Classes
                                        <span className="bg-blue-100 text-[#001861] px-2 py-0.5 rounded-full text-[12px] font-medium">
                                          {month?.monthSummary?.totalClasses ||
                                            0}
                                        </span>
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveTab('loans');
                                        }}
                                        className={`flex items-center gap-2 px-4 py-1 font-medium text-xs uppercase transition-all duration-200 border-b-2 ${
                                          activeTab === 'loans'
                                            ? 'border-[#001861] text-[#001861] bg-purple-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        <CreditCard className="w-4 h-4" />
                                        Loans
                                        <span className="bg-[#001861]/10 text-[#001861] px-2 py-0.5 rounded-full text-xs font-medium">
                                          {month?.monthSummary
                                            ?.totalLoanRequest || 0}
                                        </span>
                                      </button>
                                    </div>

                                    {/* Tab Content */}
                                    <AnimatePresence mode="wait">
                                      {activeTab === 'classes' && (
                                        <motion.div
                                          key="classes"
                                          initial={{ opacity: 0, x: 20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: -20 }}
                                          transition={{ duration: 0.3 }}
                                        >
                                          {/* Classes Header */}
                                          <div className="flex flex-col justify-between gap-3 mb-4 sm:flex-row sm:items-center">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 uppercase">
                                              <div className="p-2 bg-blue-500 rounded">
                                                <BookOpen className="w-3 h-3 text-white" />
                                              </div>
                                              Classes Overview
                                            </h3>
                                            <div className="flex items-center gap-3">
                                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs uppercase font-semibold  text-[#55004B]">
                                                {month?.monthSummary
                                                  ?.totalClasses || 0}{' '}
                                                total
                                              </span>
                                              <span className="inline-flex items-center px-2.5 py-1 text-xs uppercase font-semibold  text-green-800">
                                                {classStats?.approved} Approved
                                              </span>
                                            </div>
                                          </div>

                                          {/* Classes Table */}
                                          <div className="overflow-hidden bg-white">
                                            <div className="overflow-x-auto">
                                              <table className="w-full">
                                                <thead className="bg-blue-50 text-[#001861]">
                                                  <tr>
                                                    <th className="px-3 py-3 text-xs font-semibold text-left uppercase border-b rounded">
                                                      #
                                                    </th>
                                                    <th className="px-3 py-3 text-xs font-semibold text-left uppercase border-b rounded">
                                                      Date
                                                    </th>
                                                    <th className="px-3 py-3 text-xs font-semibold text-left uppercase border-b rounded">
                                                      Time & Period
                                                    </th>
                                                    <th className="px-3 py-3 text-xs font-semibold text-left uppercase border-b rounded">
                                                      Batch & Dept
                                                    </th>
                                                    <th className="px-3 py-3 text-xs font-semibold text-left uppercase border-b rounded">
                                                      Subject
                                                    </th>
                                                    <th className="px-3 py-3 text-xs font-semibold text-left uppercase border-b rounded">
                                                      Amount
                                                    </th>
                                                    <th className="px-3 py-3 text-xs font-semibold text-left uppercase border-b rounded">
                                                      Status
                                                    </th>
                                                    <th className="px-3 py-3 text-xs font-semibold text-left uppercase border-b rounded">
                                                      Payment
                                                    </th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-300">
                                                  {month?.details?.classes
                                                    ?.length > 0 ? (
                                                    month?.details?.classes?.map(
                                                      (cls, i) => {
                                                        const isTop = i === 0;
                                                        const bg = isTop
                                                          ? 'bg-[#3C6666] text-white'
                                                          : i % 2 === 0
                                                            ? 'bg-white text-[#3C6666]'
                                                            : 'bg-[#f9f9f9] text-[#3C6666]';
                                                        return (
                                                          <tr
                                                            key={cls?._id || i}
                                                            className={`${bg}  transition-colors`}
                                                          >
                                                            <td className="px-3 py-3 text-xs ">
                                                              {i + 1}
                                                            </td>
                                                            <td className="px-3 py-3 text-xs">
                                                              {cls?.classDate ||
                                                                'N/A'}
                                                            </td>
                                                            <td className="px-3 py-3 text-xs ">
                                                              <div>
                                                                {cls?.classTime ||
                                                                  'N/A'}
                                                              </div>
                                                              <div className="text-xs">
                                                                period :{' '}
                                                                {cls?.period} •
                                                                Hours :{' '}
                                                                {
                                                                  cls?.classQuantity
                                                                }
                                                              </div>
                                                            </td>
                                                            <td className="px-3 py-3 text-xs ">
                                                              <div>
                                                                {cls?.batch ||
                                                                  '-'}
                                                              </div>
                                                              <div className="text-xs ">
                                                                Dept. :{' '}
                                                                {cls?.department ||
                                                                  '-'}
                                                              </div>
                                                            </td>
                                                            <td className="px-3 py-3 text-xs ">
                                                              {cls?.subject ||
                                                                '-'}
                                                            </td>
                                                            <td className="px-3 py-3 text-xs font-bold text-left">
                                                              ৳{' '}
                                                              {cls?.totalFee?.toFixed(
                                                                2,
                                                              ) || 0}
                                                            </td>
                                                            <td className="px-3 py-3">
                                                              <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                  cls?.status ===
                                                                  'approve'
                                                                    ? 'bg-white text-green-700'
                                                                    : ' text-yellow-500 capitalize'
                                                                }`}
                                                              >
                                                                {cls?.status ===
                                                                'approve'
                                                                  ? 'Approved'
                                                                  : cls?.status ||
                                                                    'N/A'}
                                                              </span>
                                                            </td>
                                                            <td className="px-3 py-3">
                                                              <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                  cls?.paymentStatus ===
                                                                  'paid'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}
                                                              >
                                                                {cls?.paymentStatus ||
                                                                  'unpaid'}
                                                              </span>
                                                            </td>
                                                          </tr>
                                                        );
                                                      },
                                                    )
                                                  ) : (
                                                    <tr>
                                                      <td
                                                        colSpan={8}
                                                        className="px-4 py-6 text-center text-gray-500"
                                                      >
                                                        <div className="flex flex-col items-center gap-2">
                                                          <BookOpen className="w-8 h-8 text-gray-400" />
                                                          <span>
                                                            No classes found for
                                                            this month
                                                          </span>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  )}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}

                                      {activeTab === 'loans' && (
                                        <motion.div
                                          key="loans"
                                          initial={{ opacity: 0, x: 20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: -20 }}
                                          transition={{ duration: 0.3 }}
                                        >
                                          {/* Loans Header */}
                                          <div className="flex flex-col justify-between gap-3 mb-4 sm:flex-row sm:items-center">
                                            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 uppercase">
                                              <div className="p-2 bg-purple-500 rounded">
                                                <CreditCard className="w-3 h-3 text-white" />
                                              </div>
                                              Loans Overview
                                            </h3>
                                            <span className="inline-flex items-center text-xs font-semibold  text-[#55004B] uppercase">
                                              {month.monthSummary
                                                ?.totalLoanRequest || 0}{' '}
                                              total
                                            </span>
                                          </div>

                                          {/* Loans Table */}
                                          <div className="overflow-hidden bg-white">
                                            <div className="overflow-x-auto">
                                              <table className="w-full">
                                                <thead className="bg-blue-50 text-[#55004B]">
                                                  <tr>
                                                    <th className="px-3 py-3 text-xs font-semibold text-left uppercase border-b rounded">
                                                      Date
                                                    </th>
                                                    <th className="px-3 py-3 text-xs font-semibold text-left uppercase border-b rounded">
                                                      Name
                                                    </th>
                                                    <th className="px-3 py-3 text-xs font-semibold text-left uppercase border-b rounded">
                                                      Amount
                                                    </th>
                                                    <th className="px-3 py-3 text-xs text-center uppercase border-b rounded">
                                                      Status
                                                    </th>
                                                    <th className="px-3 py-3 text-xs text-center uppercase border-b rounded">
                                                      Payment Status
                                                    </th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-300">
                                                  {month?.details?.loans
                                                    ?.length > 0 ? (
                                                    month?.details?.loans?.map(
                                                      (loan, i) => {
                                                        const isTop = i === 0;
                                                        const bg = isTop
                                                          ? 'bg-[#001861] text-white'
                                                          : i % 2 === 0
                                                            ? 'bg-white text-[#55004B]'
                                                            : 'bg-[#f9f9f9] text-[#001861]';

                                                        return (
                                                          <tr
                                                            key={loan._id || i}
                                                            className={`${bg} transition-colors`}
                                                          >
                                                            <td className="px-3 py-3 text-xs ">
                                                              {loan?.date?.slice(
                                                                0,
                                                                10,
                                                              ) || 'N/A'}
                                                            </td>
                                                            <td className="px-3 py-3 text-xs capitalize">
                                                              {loan.userDetails
                                                                ?.userName ||
                                                                'N/A'}
                                                            </td>
                                                            <td className="px-3 py-3 text-xs font-bold text-left">
                                                              ৳{' '}
                                                              {loan.amount || 0}
                                                            </td>
                                                            <td className="px-3 py-3 text-center">
                                                              <span
                                                                className={`inline-flex items-center text-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                  loan.status ===
                                                                  'approve'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800 capitalize'
                                                                }`}
                                                              >
                                                                {loan.status ===
                                                                'approve'
                                                                  ? 'Approved'
                                                                  : loan.status ||
                                                                    'N/A'}
                                                              </span>
                                                            </td>
                                                            <td className="px-3 py-3 text-center">
                                                              <span
                                                                className={`inline-flex items-center text-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                  loan?.isPaid ===
                                                                  true
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800 capitalize'
                                                                }`}
                                                              >
                                                                {loan?.isPaid ===
                                                                true
                                                                  ? 'Paid'
                                                                  : 'Unpaid'}
                                                              </span>
                                                            </td>
                                                          </tr>
                                                        );
                                                      },
                                                    )
                                                  ) : (
                                                    <tr>
                                                      <td
                                                        colSpan={12}
                                                        className="px-4 py-6 text-center text-red-400"
                                                      >
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                          <CreditCard className="w-8 h-8 text-red-400" />
                                                          <span>
                                                            No loans found for
                                                            this month
                                                          </span>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  )}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Collapse Button */}
                                    <div className="flex justify-end mt-6">
                                      <button
                                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 transition-all duration-200 bg-gray-200 rounded-lg hover:bg-gray-300"
                                        onClick={() =>
                                          toggleMonthExpansion(monthKey)
                                        }
                                      >
                                        <ChevronUp className="w-4 h-4" />
                                        Collapse
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      }),
                    )}

                    {/* Empty State */}
                    {statements?.flatMap((s) => s.months).length === 0 && (
                      <div className="py-12 text-center">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col items-center gap-4"
                        >
                          <div className="p-3 bg-gray-100 rounded-full">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="mb-2 text-lg font-bold text-gray-800">
                              No results found
                            </h3>
                            <p className="mb-4 text-base text-gray-600">
                              Try adjusting your filters to find what you're
                              looking for.
                            </p>
                            <button
                              className="px-5 py-2.5 bg-[#6667AB] text-white rounded-lg font-medium hover:bg-[#5a5b9a] transition-all duration-200 shadow text-sm"
                              onClick={handleClearFilters}
                            >
                              Reset Filters
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Teacher Advice Section */}
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="px-6 py-6 text-center rounded bg-gradient-to-r from-green-50 via-white to-blue-50">
          <p className="text-lg italic font-medium leading-relaxed text-gray-700">
            "A great teacher inspires curiosity, builds confidence, and lights
            the path to lifelong learning."
          </p>
          <p className="mt-2 text-sm text-gray-500">
            – Your dedication shapes the future.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatementOfATeacher;

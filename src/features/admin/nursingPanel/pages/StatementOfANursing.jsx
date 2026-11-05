import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetSingleNurseAttendancesQuery } from '../../../../../redux/features/Nursing/NursingApi';
import toast from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FileText,
  Loader2,
  X,
  Filter,
  Download,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  BookOpen,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Zap,
  SearchX,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import UpdateNursingPopover from '../../../../../components/Popover/UpdateNursingPopover';
import NursingFilterSidebar from '../components/NursingFilterSidebar';
import { format } from 'date-fns';
import { formatDateDMY } from '../../../../../constants/dateFormat';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import { formatTimeAMPM } from '../../../../../constants/timeFormat';
import { formatDutyTime } from '../../../../../constants/formateDutyTime';

const StatementOfANursing = () => {
  const { id } = useParams();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [popoverData, setPopoverData] = useState(null);
  const [expandedYears, setExpandedYears] = useState(new Set());
  const [expandedMonths, setExpandedMonths] = useState(new Set());

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    startDate: '',
    endDate: '',
    month: '',
    year: '',
    status: '',
    paymentStatus: '',
  });

  const { data, isLoading, isError, error, refetch } =
    useGetSingleNurseAttendancesQuery({
      nursingId: id,
      ...filters,
    });

  const statements = data?.statements || [];
  const grandTotal = data?.grandTotalAmount || 0;
  const loan = data?.totalLoanAmount || 0;
  const paid = data?.totalPaidAmount || 0;
  const payableTotal = Math.max(grandTotal - loan - paid, 0);

  // Toggle year expansion
  const toggleYear = (year) => {
    setExpandedYears((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  // Toggle month expansion
  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey);
      } else {
        newSet.add(monthKey);
      }
      return newSet;
    });
  };

  // Format total seconds to readable string
  const formatTime = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds)) return 'N/A';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return [
      hours > 0 ? `${hours}h` : '',
      minutes > 0 ? `${minutes}m` : '',
      seconds > 0 ? `${seconds}s` : '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time to AM/PM
  const formatToAmPm = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return 'N/A';
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  // Options for filters
  const statusOptions = useMemo(
    () => [
      { value: '', label: 'All Status' },
      { value: 'pending', label: 'Pending' },
      { value: 'approve', label: 'Approved' },
    ],
    [],
  );

  const paymentStatusOptions = useMemo(
    () => [
      { value: '', label: 'All Payments' },
      { value: 'paid', label: 'Paid' },
      { value: 'unpaid', label: 'Unpaid' },
    ],
    [],
  );

  const monthOptions = useMemo(
    () => [
      { value: '', label: 'All Months' },
      ...Array.from({ length: 12 }, (_, i) => {
        const date = new Date(0, i);
        return {
          value: format(date, 'MMMM'),
          label: format(date, 'MMMM'),
        };
      }),
    ],
    [],
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      { value: '', label: 'All Years' },
      ...Array.from({ length: 5 }, (_, i) => ({
        value: (currentYear - i).toString(),
        label: (currentYear - i).toString(),
      })),
    ];
  }, []);

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      startDate: '',
      endDate: '',
      month: '',
      year: '',
      status: '',
      paymentStatus: '',
    });
  };

  // Generate PDF statement
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
      let userInfo = {};

      statements?.forEach((yearData) => {
        yearData?.months?.forEach((monthData) => {
          const key = `${monthData.month}, ${yearData.year}`;
          if (!dutiesByMonth[key]) dutiesByMonth[key] = [];
          if (!loansByMonth[key]) loansByMonth[key] = [];

          const dts = monthData?.details?.nursingDuties || [];
          const lns = monthData?.details?.loans || [];

          dutiesByMonth[key].push(...dts);
          loansByMonth[key].push(...lns);

          if (!userInfo && dts.length > 0) {
            userInfo = { userName: dts[0].employeeName, phone: dts[0].phone };
          }
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

      doc.text('Nursing Duty Statement', pageWidth / 2, cursorY + 5, {
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

      let totalDutyAmount = 0;
      let totalPaid = 0;
      let totalDue = 0;
      let totalLoan = 0;

      /* ---------------- MONTH LOOP ---------------- */

      for (const monthKey of monthKeys) {
        const duties = dutiesByMonth[monthKey] || [];
        const loans = loansByMonth[monthKey] || [];

        doc.setFont(primaryFont, 'bold');
        doc.setFontSize(10);

        doc.text(monthKey, margin, cursorY);
        cursorY += 4;

        /* ---------- DUTY TABLE ---------- */

        if (duties?.length) {
          const body = duties?.map((d) => {
            const amount = d.totalAmount || 0;

            totalDutyAmount += amount;

            if (d.paymentStatus?.toLowerCase() === 'paid') totalPaid += amount;
            else totalDue += amount;

            return [
              formatDate(d.date) || 'N/A',
              capitalize(d.employeeName),
              capitalize(d.messName),
              `${formatTimeAMPM(d.dutyStartTime)} - ${formatTimeAMPM(d.dutyEndTime)}`,
              formatDutyTime(d.totalDutyTime) || 'N/A',
              amount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'BDT',
              }),
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
                'Work/Mess',
                'Duty Start-End Time',
                'Duration',
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

        const monthClassTotal = duties.reduce(
          (s, d) => s + (d.totalFee || 0),
          0,
        );

        const monthLoanTotal = loans.reduce((s, l) => s + (l.amount || 0), 0);

        autoTable(doc, {
          startY: cursorY,

          head: [[`${monthKey} Duty Total`, `${monthKey} Loan Total`]],

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
            `BDT ${totalDutyAmount.toFixed(2)}`,
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

      doc.save(`statement_of_${user?.userName || 'user'}.pdf`);

      setIsGeneratingPDF(false);
      toast.success('PDF generated successfully!');
    } catch (err) {
      toast.error('Failed to generate PDF.');
      setIsGeneratingPDF(false);
    }
  };

  // Generate PDF statement
  // const generatePDFStatement = () => {
  //   setIsGeneratingPDF(true);

  //   try {
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "mm",
  //       format: "a4",
  //     });

  //     const margin = 15;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const fontPrimary = "times"; // Times New Roman
  //     let cursorY = margin;

  //     // Helper: Page break logic
  //     const checkPageBreak = (addedHeight) => {
  //       if (cursorY + addedHeight > pageHeight - 25) {
  //         doc.addPage();
  //         drawHeader();
  //         return true;
  //       }
  //       return false;
  //     };

  //     // Safe Capitalize Function to prevent 'match' error
  //     const capitalize = (str) => {
  //       if (!str || typeof str !== "string") return "N/A";
  //       return str
  //         .toLowerCase()
  //         .split(" ")
  //         .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  //         .join(" ");
  //     };

  //     /* ---------------- HEADER ---------------- */
  //     const drawHeader = () => {
  //       doc.setTextColor(0, 0, 0);
  //       doc.setFont(fontPrimary, "bold");
  //       doc.setFontSize(16);
  //       doc.text("RPR DUET ADMISSION CARE", pageWidth / 2, margin + 5, {
  //         align: "center",
  //       });

  //       doc.setFont(fontPrimary, "normal");
  //       doc.setFontSize(9);
  //       doc.text(
  //         "M.A. Samad Villa In front of DUET Campus | Gazipur, Bangladesh | +880 1742 590 128 | rpr.group2013@gmail.com",
  //         pageWidth / 2,
  //         margin + 11,
  //         { align: "center" },
  //       );

  //       doc.setDrawColor(0, 0, 0);
  //       doc.setLineWidth(0.5);
  //       doc.line(margin, margin + 15, pageWidth - margin, margin + 15);
  //       cursorY = margin + 22;
  //     };

  //     /* ---------------- FOOTER ---------------- */
  //     const drawFooter = (pageNo, totalPages) => {
  //       doc.setTextColor(0, 0, 0);
  //       doc.setFontSize(8);
  //       doc.setFont(fontPrimary, "normal");
  //       doc.text(
  //         `Generated: ${new Date().toLocaleString()}`,
  //         margin,
  //         pageHeight - 6,
  //       );
  //       doc.text(
  //         `Page ${pageNo} of ${totalPages}`,
  //         pageWidth - margin,
  //         pageHeight - 6,
  //         {
  //           align: "right",
  //         },
  //       );
  //     };

  //     /* ---------------- SIGNATURE ---------------- */
  //     const drawSignature = () => {
  //       checkPageBreak(30);
  //       const signY = cursorY + 15;
  //       doc.setDrawColor(0, 0, 0);
  //       doc.line(pageWidth - 70, signY, pageWidth - 20, signY);
  //       doc.setFont(fontPrimary, "bold");
  //       doc.setFontSize(10);
  //       doc.text("Authorized Signature", pageWidth - 45, signY + 5, {
  //         align: "center",
  //       });
  //       cursorY = signY + 15;
  //     };

  //     /* ---------------- DATA PROCESSING ---------------- */
  //     const dutiesByMonth = {};
  //     const loansByMonth = {};
  //     let userInfo = null;

  //     // Corrected Data extraction based on your request
  //     statements?.forEach((yearData) => {
  //       yearData?.months?.forEach((monthData) => {
  //         const key = `${monthData.month}, ${yearData.year}`;
  //         if (!dutiesByMonth[key]) dutiesByMonth[key] = [];
  //         if (!loansByMonth[key]) loansByMonth[key] = [];

  //         const dts = monthData?.details?.duties || []; // Updated from nursingDuties
  //         const lns = monthData?.details?.loans || [];

  //         dutiesByMonth[key].push(...dts);
  //         loansByMonth[key].push(...lns);

  //         if (!userInfo && dts.length > 0) {
  //           userInfo = { userName: dts[0].employeeName, phone: dts[0].phone };
  //         }
  //       });
  //     });

  //     const monthKeys = Object.keys(dutiesByMonth).sort((a, b) => {
  //       const [mA, yA] = a.split(", ");
  //       const [mB, yB] = b.split(", ");
  //       return new Date(`${mA} 1, ${yA}`) - new Date(`${mB} 1, ${yB}`);
  //     });

  //     drawHeader();

  //     /* ---------------- INFO SECTION ---------------- */
  //     doc.setFont(fontPrimary, "bold");
  //     doc.setFontSize(14);
  //     doc.text("Employee Duty & Loan Statement", pageWidth / 2, cursorY, {
  //       align: "center",
  //     });
  //     cursorY += 10;

  //     doc.setFontSize(10);
  //     doc.setFont(fontPrimary, "normal");
  //     doc.text(`Name: ${capitalize(userInfo?.userName)}`, margin, cursorY);
  //     doc.text(
  //       `Phone: ${userInfo?.phone || "N/A"}`,
  //       pageWidth - margin,
  //       cursorY,
  //       { align: "right" },
  //     );
  //     cursorY += 6;

  //     doc.text(
  //       `Period: ${filters.startDate || "All"} to ${filters.endDate || "All"}`,
  //       margin,
  //       cursorY,
  //     );
  //     doc.text(
  //       `Date: ${new Date().toLocaleDateString()}`,
  //       pageWidth - margin,
  //       cursorY,
  //       { align: "right" },
  //     );
  //     cursorY += 12;

  //     /* ---------------- TABLES ---------------- */
  //     let totalDutyAmt = 0,
  //       totalPaid = 0,
  //       totalDue = 0,
  //       totalLoan = 0;

  //     const commonTableConfig = {
  //       theme: "grid",
  //       styles: {
  //         font: fontPrimary,
  //         fontSize: 8,
  //         textColor: [0, 0, 0],
  //         lineColor: [0, 0, 0],
  //         lineWidth: 0.1,
  //       },
  //       headStyles: {
  //         fillColor: [245, 245, 245],
  //         textColor: [0, 0, 0],
  //         fontStyle: "bold",
  //         lineWidth: 0.1,
  //       },
  //       margin: { left: margin, right: margin },
  //     };

  //     for (const monthKey of monthKeys) {
  //       const duties = dutiesByMonth[monthKey] || [];
  //       const loans = loansByMonth[monthKey] || [];

  //       checkPageBreak(20);
  //       doc.setFont(fontPrimary, "bold").setFontSize(11);
  //       doc.text(monthKey, margin, cursorY);
  //       cursorY += 4;

  //       if (duties.length) {
  //         autoTable(doc, {
  //           ...commonTableConfig,
  //           startY: cursorY,
  //           head: [
  //             [
  //               "Date",
  //               "Work Details",
  //               "Duty Time",
  //               "Duration",
  //               "Amount",
  //               "Status",
  //               "Payment",
  //             ],
  //           ],
  //           body: duties.map((d) => {
  //             const amt = Number(d.totalDutyFee || 0); // Corrected to totalDutyFee based on your model
  //             totalDutyAmt += amt;
  //             if (d.paymentStatus === "paid" || d.paid === true)
  //               totalPaid += amt;
  //             else if (d.status === "approve") totalDue += amt;

  //             return [
  //               d.date || "N/A",
  //               capitalize(d.workDetails || "Duty"),
  //               `${d.dutyStartTime || ""} - ${d.dutyEndTime || ""}`,
  //               formatDutyTime(d.totalDutyTime) || "N/A",
  //               amt.toFixed(2),
  //               capitalize(d.status),
  //               capitalize(d.paymentStatus),
  //             ];
  //           }),
  //         });
  //         cursorY = doc.lastAutoTable.finalY + 5;
  //       }

  //       if (loans.length) {
  //         checkPageBreak(15);
  //         autoTable(doc, {
  //           ...commonTableConfig,
  //           startY: cursorY,
  //           head: [
  //             [
  //               "Date",
  //               "Description",
  //               "Loan Amount",
  //               "Status",
  //               "Payment Status",
  //             ],
  //           ],
  //           body: loans.map((l) => {
  //             const lAmt = Number(l.amount || 0);
  //             totalLoan += lAmt;
  //             return [
  //               l.date || "N/A",
  //               "Advance Loan",
  //               lAmt.toFixed(2),
  //               capitalize(l.status),
  //               l.isPaid ? "Paid" : "Unpaid",
  //             ];
  //           }),
  //         });
  //         cursorY = doc.lastAutoTable.finalY + 5;
  //       }

  //       // Monthly Short Summary
  //       checkPageBreak(15);
  //       autoTable(doc, {
  //         ...commonTableConfig,
  //         startY: cursorY,
  //         body: [
  //           [
  //             {
  //               content: `${monthKey} Total:Total Amount BDT ${duties.reduce((s, d) => s + (d.totalDutyFee || 0), 0).toFixed(2)} | Loan BDT ${loans.reduce((s, l) => s + (l.amount || 0), 0).toFixed(2)}`,
  //               colSpan: 5,
  //               styles: { halign: "right", fontStyle: "bold" },
  //             },
  //           ],
  //         ],
  //       });
  //       cursorY = doc.lastAutoTable.finalY + 10;
  //     }

  //     /* ---------------- FINAL OVERALL SUMMARY ---------------- */
  //     const net = Math.max(totalDue - totalLoan, 0);
  //     checkPageBreak(40);
  //     doc.setFont(fontPrimary, "bold").setFontSize(12);
  //     doc.text("Overall Summary Report", margin, cursorY);
  //     cursorY += 5;

  //     autoTable(doc, {
  //       ...commonTableConfig,
  //       startY: cursorY,
  //       head: [
  //         [
  //           "Total Amount",
  //           "Total Paid",
  //           "Total Due",
  //           "Total Loan",
  //           "Net Payable",
  //         ],
  //       ],
  //       body: [
  //         [
  //           totalDutyAmt.toFixed(2),
  //           totalPaid.toFixed(2),
  //           totalDue.toFixed(2),
  //           totalLoan.toFixed(2),
  //           net.toFixed(2),
  //         ],
  //       ],
  //       styles: {
  //         ...commonTableConfig.styles,
  //         fontStyle: "bold",
  //         halign: "center",
  //       },
  //     });

  //     cursorY = doc.lastAutoTable.finalY;
  //     drawSignature();

  //     const totalPages = doc.internal.getNumberOfPages();
  //     for (let i = 1; i <= totalPages; i++) {
  //       doc.setPage(i);
  //       drawFooter(i, totalPages);
  //     }

  //     doc.save(`Statement_${userInfo?.userName || "Employee"}.pdf`);
  //     setIsGeneratingPDF(false);
  //     toast.success("PDF Generated Successfully!");
  //   } catch (err) {

  //     setIsGeneratingPDF(false);
  //     toast.error("Failed to generate PDF. Check console for details.");
  //   }
  // };

  const monthColors = {
    January: 'bg-blue-100 text-blue-800 border-blue-200',
    February: 'bg-pink-100 text-pink-800 border-pink-200',
    March: 'bg-green-100 text-green-800 border-green-200',
    April: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    May: 'bg-teal-100 text-teal-800 border-teal-200',
    June: 'bg-red-100 text-red-800 border-red-200',
    July: 'bg-purple-100 text-purple-800 border-purple-200',
    August: 'bg-orange-100 text-orange-800 border-orange-200',
    September: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    October: 'bg-amber-100 text-amber-800 border-amber-200',
    November: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    December: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  };

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  // Handle data loading states
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 mb-4 text-blue-500 animate-spin" />
        <span className="text-lg text-gray-600">Please wait...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl p-6 mx-auto mt-8 text-center bg-red-50 rounded-xl">
        <h3 className="mb-3 text-xl font-medium text-red-800">
          Error Loading Data
        </h3>
        <p className="mb-5 text-red-600">
          {error?.data?.message || 'Failed to load nursing records'}
        </p>
        <button
          className="px-6 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          onClick={refetch}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Find first available user
  let user = null;
  for (const statement of statements) {
    for (const month of statement.months) {
      for (const duty of month.details.nursingDuties) {
        user = {
          userName: duty.employeeName,
          phone: duty.phone,
          userType: duty.userType,
          nursingId: duty?.nursing,
        };
        break;
      }
      if (user) break;
    }
    if (user) break;
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
      <div className="px-6 py-10 lg:ps-12 lg:pe-6 lg:py-16">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="flex items-center gap-4 text-xl font-bold tracking-tighter text-gray-900 md:text-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-2xl">
              <Zap className="text-blue-600 w-7 h-7" />
            </div>
            Nursing&apos;s Statement Registry
          </h1>
          <p className="max-w-2xl mt-4 text-xs text-gray-500">
            “Monitor, track, and update nursing duty records in real-time with
            our precision-engineered monitoring suite.”
          </p>
        </div>
        {/* Main Content Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-between gap-4 lg:items-start lg:flex-row"
        >
          {/* Left Column - Filters */}
          <div className="space-y-6 xl:col-span-2">
            <NursingFilterSidebar
              filters={filters}
              setFilters={setFilters}
              statusOptions={statusOptions}
              paymentStatusOptions={paymentStatusOptions}
              monthOptions={monthOptions}
              yearOptions={yearOptions}
              handleClearFilters={handleClearFilters}
            />
          </div>

          {/* Right Column - Data */}
          <div className="w-full space-y-2 xl:col-span-4">
            {/* Summary Cards */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-2"
            >
              <button
                onClick={generatePDFStatement}
                disabled={isGeneratingPDF || statements.length === 0}
                className="text-white  bg-blue-600  hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Print Statement
                  </>
                )}
              </button>
              <button
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border`}
              >
                Total Duties (
                {statements?.reduce(
                  (acc, s) => acc + (s.yearlySummary?.totalAttendances || 0),
                  0,
                )}
                )
              </button>
              <button
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border`}
              >
                Total Amount (
                {grandTotal.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'BDT',
                })}
                )
              </button>
              <button
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border`}
              >
                Loan Amount (
                {loan?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'BDT',
                })}
                )
              </button>
              <button
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border`}
              >
                Paid Amount (
                {paid?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'BDT',
                })}
                )
              </button>
              <button
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border`}
              >
                Net Payable (
                {payableTotal?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'BDT',
                })}
                )
              </button>
            </motion.div>

            {/* Yearly Summary */}
            <motion.div
              variants={itemVariants}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm "
            >
              <h3 className="mb-4 text-[12px] font-semibold">Yearly Summary</h3>
              <div className="overflow-x-auto">
                {statements?.length > 0 ? (
                  <table className="w-full text-[12px]">
                    <thead className="text-[12px] bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Year</th>
                        <th className="px-4 py-2 text-center">Duties</th>
                        <th className="px-4 py-2 text-center">Approved</th>
                        <th className="px-4 py-2 text-center">Pending</th>
                        <th className="px-4 py-2 text-center">Loans</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {statements?.map((statement) => (
                        <React.Fragment key={statement?.year}>
                          <tr
                            className="cursor-pointer hover:bg-gray-50 text-[12px]"
                            onClick={() => toggleYear(statement?.year)}
                          >
                            <td className="px-4 py-3 font-medium">
                              <div className="flex items-center gap-2">
                                {expandedYears?.has(statement?.year) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                                {statement?.year}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {statement.yearlySummary?.totalAttendances || 0}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {statement.yearlySummary
                                ?.totalApprovedAttendances || 0}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {statement.yearlySummary
                                ?.totalPendingAttendances || 0}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {statement.yearlySummary?.totalLoanRequest || 0}
                            </td>
                            <td className="px-4 py-3 font-semibold text-right text-blue-600">
                              ৳
                              {(
                                statement.yearlySummary?.totalApprovedAmount ||
                                0
                              ).toFixed(2)}
                            </td>
                          </tr>

                          {/* Expanded Year - Months */}
                          <AnimatePresence>
                            {expandedYears?.has(statement.year) && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <td colSpan={6} className="p-0">
                                  <div className="p-4 bg-gray-50">
                                    <div className="space-y-2">
                                      {[...(statement?.months || [])]
                                        ?.sort(
                                          (a, b) =>
                                            monthOrder[a.month] -
                                            monthOrder[b.month],
                                        )
                                        ?.map((month) => (
                                          <div
                                            key={`${statement.year}-${month.month}`}
                                            className="overflow-hidden border border-gray-200 rounded-lg text-[12px]"
                                          >
                                            <div
                                              className="flex items-center justify-between p-3 bg-white cursor-pointer hover:bg-gray-50"
                                              onClick={() =>
                                                toggleMonth(
                                                  `${statement.year}-${month.month}`,
                                                )
                                              }
                                            >
                                              <div className="flex items-center gap-3">
                                                {expandedMonths.has(
                                                  `${statement.year}-${month.month}`,
                                                ) ? (
                                                  <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                  <ChevronDown className="w-4 h-4" />
                                                )}
                                                <span
                                                  className={`px-3 py-1 rounded-full text-xs font-medium ${monthColors[month.month] || 'bg-gray-100 text-gray-800'}`}
                                                >
                                                  {month.month}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-4 text-[12px]">
                                                <span>
                                                  Duties:{' '}
                                                  {month.monthSummary
                                                    ?.totalAttendances || 0}
                                                </span>
                                                <span>
                                                  Loans:{' '}
                                                  {month.monthSummary
                                                    ?.totalLoanRequest || 0}
                                                </span>
                                                <span className="font-semibold">
                                                  Total :{' '}
                                                  {(
                                                    month.monthSummary
                                                      ?.totalApprovedAmount || 0
                                                  ).toLocaleString('en-US', {
                                                    style: 'currency',
                                                    currency: 'BDT',
                                                  })}
                                                </span>
                                                <span className="font-semibold">
                                                  Loan :{' '}
                                                  {(
                                                    month.monthSummary
                                                      ?.totalApprovedLoanAmount ||
                                                    0
                                                  ).toLocaleString('en-US', {
                                                    style: 'currency',
                                                    currency: 'BDT',
                                                  })}
                                                </span>
                                              </div>
                                            </div>

                                            {/* Expanded Month - Details */}
                                            <AnimatePresence>
                                              {expandedMonths.has(
                                                `${statement.year}-${month.month}`,
                                              ) && (
                                                <motion.div
                                                  initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                  }}
                                                  animate={{
                                                    opacity: 1,
                                                    height: 'auto',
                                                  }}
                                                  exit={{
                                                    opacity: 0,
                                                    height: 0,
                                                  }}
                                                  className="border-t border-gray-200"
                                                >
                                                  {/* Duties */}
                                                  {month?.details?.nursingDuties
                                                    ?.length > 0 && (
                                                    <div className="p-3 bg-white">
                                                      <h4 className="mb-2 text-[12px] font-semibold text-blue-600">
                                                        Duties
                                                      </h4>
                                                      <div className="overflow-x-auto">
                                                        <table className="w-full text-xs">
                                                          <thead className="bg-gray-100">
                                                            <tr className="text-[13px]">
                                                              <th className="px-2 py-2 text-left">
                                                                #
                                                              </th>
                                                              <th className="px-2 py-2 text-left">
                                                                Date
                                                              </th>
                                                              <th className="px-2 py-2 text-left">
                                                                Work/Mess
                                                              </th>
                                                              <th className="px-2 py-2 text-left">
                                                                Duty Start-End
                                                                Time
                                                              </th>
                                                              <th className="px-2 py-2 text-left">
                                                                Duration
                                                              </th>
                                                              <th className="px-2 py-2 text-right">
                                                                Amount
                                                              </th>
                                                              <th className="px-2 py-2 text-center">
                                                                Status
                                                              </th>
                                                              <th className="px-2 py-2 text-center">
                                                                Payment Status
                                                              </th>
                                                            </tr>
                                                          </thead>
                                                          <tbody>
                                                            {month?.details?.nursingDuties?.map(
                                                              (duty, i) => (
                                                                <tr
                                                                  key={duty._id}
                                                                  className="border-b border-gray-100 text-[13px] capitalize"
                                                                >
                                                                  <td className="px-2 py-2">
                                                                    {i + 1}
                                                                  </td>
                                                                  <td className="px-2 py-2">
                                                                    {formatDateDMY(
                                                                      duty.date,
                                                                    )}
                                                                  </td>
                                                                  <td className="px-2 py-2">
                                                                    {
                                                                      duty.messName
                                                                    }
                                                                  </td>
                                                                  <td className="px-2 py-2">
                                                                    {formatTimeAMPM(
                                                                      duty.dutyStartTime,
                                                                    )}
                                                                    -{' '}
                                                                    {formatTimeAMPM(
                                                                      duty.dutyEndTime,
                                                                    )}
                                                                  </td>
                                                                  <td className="px-2 py-2">
                                                                    {formatDutyTime(
                                                                      duty.totalDutyTime,
                                                                    )}
                                                                  </td>
                                                                  <td className="px-2 py-2 text-right">
                                                                    ৳
                                                                    {(
                                                                      duty.totalAmount ||
                                                                      0
                                                                    ).toFixed(
                                                                      2,
                                                                    )}
                                                                  </td>
                                                                  <td className="px-2 py-2 text-center">
                                                                    <span
                                                                      className={`px-2 py-0.5 rounded-full capitalize text-xs font-medium ${
                                                                        duty.status ===
                                                                        'approve'
                                                                          ? 'bg-green-100 text-green-800'
                                                                          : 'bg-yellow-100 text-yellow-800'
                                                                      }`}
                                                                    >
                                                                      {
                                                                        duty?.status
                                                                      }
                                                                    </span>
                                                                  </td>
                                                                  <td className="px-2 py-2 text-center">
                                                                    <span
                                                                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                                        duty.paymentStatus ===
                                                                        'paid'
                                                                          ? 'bg-blue-100 text-blue-800'
                                                                          : 'bg-red-100 text-red-800'
                                                                      }`}
                                                                    >
                                                                      {duty.paymentStatus ||
                                                                        'unpaid'}
                                                                    </span>
                                                                  </td>
                                                                </tr>
                                                              ),
                                                            )}
                                                          </tbody>
                                                        </table>
                                                      </div>
                                                    </div>
                                                  )}

                                                  {/* Loans */}
                                                  {month.details?.loans
                                                    ?.length > 0 && (
                                                    <div className="p-3 bg-white border-t border-gray-200">
                                                      <h4 className="mb-2 text-[12px] font-semibold text-purple-600">
                                                        Loans
                                                      </h4>
                                                      <div className="overflow-x-auto">
                                                        <table className="w-full text-xs">
                                                          <thead className="bg-gray-100">
                                                            <tr>
                                                              <th className="px-2 py-2 text-left">
                                                                #
                                                              </th>
                                                              <th className="px-2 py-2 text-left">
                                                                Date
                                                              </th>
                                                              <th className="px-2 py-2 text-right">
                                                                Amount
                                                              </th>
                                                              <th className="px-2 py-2 text-center">
                                                                Status
                                                              </th>
                                                              <th className="px-2 py-2 text-center">
                                                                Payment Status
                                                              </th>
                                                            </tr>
                                                          </thead>
                                                          <tbody>
                                                            {month.details.loans.map(
                                                              (loan, i) => (
                                                                <tr
                                                                  key={loan._id}
                                                                  className="border-b border-gray-100"
                                                                >
                                                                  <td className="px-2 py-2">
                                                                    {i + 1}
                                                                  </td>
                                                                  <td className="px-2 py-2">
                                                                    {formatDateDMY(
                                                                      loan.date,
                                                                    )}
                                                                  </td>
                                                                  <td className="px-2 py-2 text-right">
                                                                    ৳
                                                                    {(
                                                                      loan.amount ||
                                                                      0
                                                                    ).toFixed(
                                                                      2,
                                                                    )}
                                                                  </td>
                                                                  <td className="px-2 py-2 text-center">
                                                                    <span
                                                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                        loan.status ===
                                                                        'approve'
                                                                          ? 'bg-green-100 text-green-800'
                                                                          : 'bg-yellow-100 text-yellow-800'
                                                                      }`}
                                                                    >
                                                                      {
                                                                        loan.status
                                                                      }
                                                                    </span>
                                                                  </td>
                                                                  <td className="px-2 py-2 text-center">
                                                                    <span
                                                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                        loan.isPaid
                                                                          ? 'bg-blue-100 text-blue-800'
                                                                          : 'bg-red-100 text-red-800'
                                                                      }`}
                                                                    >
                                                                      {loan.isPaid
                                                                        ? 'Paid'
                                                                        : 'Unpaid'}
                                                                    </span>
                                                                  </td>
                                                                </tr>
                                                              ),
                                                            )}
                                                          </tbody>
                                                        </table>
                                                      </div>
                                                    </div>
                                                  )}
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <td className="flex flex-col items-center w-full px-4 py-12">
                    <div className="p-3 mb-4 bg-white rounded-full shadow-sm">
                      <SearchX className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      No records found
                    </h3>
                    <p className="mt-1 text-sm text-center text-gray-500">
                      We couldn't find any data matching your selected filters
                      or search criteria.
                    </p>
                    <button
                      onClick={handleClearFilters} // আপনার ফিল্টার রিসেট করার ফাংশন
                      className="mt-4 text-sm font-medium text-blue-600 underline hover:text-blue-700 underline-offset-4"
                    >
                      Clear all filters
                    </button>
                  </td>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <UpdateNursingPopover
        openPopover={openPopover}
        onClose={() => setOpenPopover(false)}
        popoverData={popoverData}
      />

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default StatementOfANursing;

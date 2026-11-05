import { useState, useRef, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import {
  PiMagnifyingGlass,
  PiTrash,
  PiX,
  PiFileText,
  PiChartBar,
  PiReceipt,
  PiClock,
  PiCheckCircle,
  PiPhone,
  PiEnvelope,
  PiMapPin,
  PiEye,
  PiPrinter,
} from 'react-icons/pi';
import { useDeleteUserInvoiceMutation } from '../../../../../redux/features/invoice/userInvoiceApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import { Zap } from 'lucide-react';
import rprLogo from '../../../../../assets/img/log-rpr.png';

const DownloadInvoice = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [invoicesData] = useState(useLoaderData()?.data || []);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const printRef = useRef();
  const modalRef = useRef();

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closePreview();
      }
    };

    if (isPreviewOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPreviewOpen]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const filteredInvoices = invoicesData.filter(
    (invoice) =>
      invoice?.invoiceNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      invoice?.userDetails?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      invoice?.paymentDetails?.paymentMonthYear
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const [deleteUserInvoice] = useDeleteUserInvoiceMutation();

  const handleDeleteInvoice = async (invoiceId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this invoice?',
    );
    if (!confirmed) return;

    try {
      await deleteUserInvoice(invoiceId).unwrap();
      toast.success('Invoice deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete invoice. Please try again.');
    }
  };

  const openPreview = (invoice) => {
    setPreviewInvoice(invoice);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setTimeout(() => setPreviewInvoice(null), 300);
  };

  // Format currency values
  const formatCurrency = (value) => {
    return (
      new Intl.NumberFormat('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value || 0) + ' BDT'
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Generate PDF with proper A4 formatting
  const generatePDF = () => {
    if (!previewInvoice) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [210, 148], // Half A4
    });

    const margin = 12;
    const pageWidth = 210;
    let y = 12;

    // COMPANY TITLE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);

    doc.text('RPR DUET ADMISSION CARE', margin, y);

    y += 6;

    doc.setFontSize(8);
    doc.setTextColor(100);

    doc.text(
      'M.A Samad Villa, In front of DUET Campus, Gazipur, Bangladesh',
      margin,
      y,
    );

    y += 4;

    doc.text(
      'Phone: +8801742590128 | Email: rpr.group2013@gmail.com',
      margin,
      y,
    );

    // INVOICE TITLE
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);

    doc.text('INVOICE', pageWidth - margin, 20, { align: 'right' });

    doc.setFontSize(9);
    doc.text(`#${previewInvoice.invoiceNumber}`, pageWidth - margin, 25, {
      align: 'right',
    });

    doc.text(
      `Date: ${new Date(previewInvoice.paidAt).toLocaleDateString()}`,
      pageWidth - margin,
      30,
      { align: 'right' },
    );

    y = 36;

    // DIVIDER
    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);

    y += 6;

    // BILL TO
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Bill To:', margin, y);

    doc.setFont('helvetica', 'normal');

    y += 5;

    doc.text(previewInvoice.userDetails?.fullName || '-', margin, y);

    y += 4;

    doc.text(`Phone: ${previewInvoice.userDetails?.phone || '-'}`, margin, y);

    y += 4;

    doc.text(
      `User Type: ${previewInvoice.userDetails?.userType || '-'}`,
      margin,
      y,
    );

    // RIGHT SIDE DETAILS

    let rightY = 42;

    doc.text(
      `Month: ${previewInvoice.paymentDetails?.paymentMonthYear}`,
      120,
      rightY,
    );

    rightY += 4;

    doc.text(
      `Duties: ${previewInvoice.paymentDetails?.numberOfDutiesPaid}`,
      120,
      rightY,
    );

    rightY += 4;

    doc.text(
      `Loans: ${previewInvoice.paymentDetails?.numberOfLoansPaid}`,
      120,
      rightY,
    );

    y = 58;

    // DUTY TABLE
    if (previewInvoice.paymentDetails?.dutyAmountBreakdown?.length) {
      autoTable(doc, {
        startY: y,
        head: [['Duty Date', 'Amount', 'Status']],
        body: previewInvoice.paymentDetails.dutyAmountBreakdown.map((d) => [
          new Date(d.date).toLocaleDateString(),
          `${d.amount} BDT`,
          d.status || 'Paid',
        ]),
        theme: 'grid',
        styles: {
          fontSize: 8,
        },
        headStyles: {
          fillColor: [37, 99, 235],
        },
        margin: { left: margin, right: margin },
      });

      y = doc.lastAutoTable.finalY + 4;
    }

    // LOAN TABLE
    if (previewInvoice.paymentDetails?.loanBreakdown?.length) {
      autoTable(doc, {
        startY: y,
        head: [['Loan Date', 'Amount', 'Status']],
        body: previewInvoice.paymentDetails.loanBreakdown.map((l) => [
          new Date(l.date).toLocaleDateString(),
          `${l.amount} BDT`,
          l.status || 'Paid',
        ]),
        theme: 'grid',
        styles: {
          fontSize: 8,
        },
        headStyles: {
          fillColor: [220, 38, 38],
        },
        margin: { left: margin, right: margin },
      });

      y = doc.lastAutoTable.finalY + 6;
    }

    // SUMMARY BOX

    const summaryX = pageWidth - 80;

    doc.setFillColor(248, 250, 252);
    doc.rect(summaryX, y, 68, 32, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    doc.text('SUMMARY', summaryX + 3, y + 5);

    doc.setFont('helvetica', 'normal');

    const summary = [
      ['Due', previewInvoice.paymentDetails?.selectedDue],
      ['Loan Deduct', previewInvoice.paymentDetails?.deductLoanAmount],
      ['Paid', previewInvoice.paymentDetails?.amountPaid],
    ];

    let sY = y + 11;

    summary.forEach((s) => {
      doc.text(s[0], summaryX + 3, sY);
      doc.text(`${s[1]} BDT`, summaryX + 65, sY, { align: 'right' });
      sY += 6;
    });

    // FOOTER

    doc.setFontSize(7);
    doc.setTextColor(120);

    doc.text('This is a computer generated invoice', pageWidth / 2, 140, {
      align: 'center',
    });

    doc.save(`Invoice-${previewInvoice.invoiceNumber}.pdf`);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${previewInvoice?.invoiceNumber}`,
    pageStyle: `
    @page {
      size: A4;
      margin: 20mm;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }
    }
  `,
  });

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  // Calculate totals
  const totalAmount = filteredInvoices.reduce(
    (sum, invoice) => sum + (invoice.amount || invoice.totalAmount || 0),
    0,
  );

  // Status badge component
  const StatusBadge = ({ status = 'paid' }) => {
    const statusConfig = {
      paid: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: PiCheckCircle,
      },
      pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: PiClock,
      },
      overdue: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: PiClock,
      },
    };

    const config = statusConfig[status] || statusConfig.paid;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Invoice SVG Icon Component
  const InvoiceIcon = () => (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="8"
        y="8"
        width="48"
        height="48"
        rx="8"
        className="fill-blue-100"
      />
      <rect
        x="16"
        y="16"
        width="32"
        height="4"
        rx="2"
        className="fill-blue-300"
      />
      <rect
        x="16"
        y="24"
        width="24"
        height="4"
        rx="2"
        className="fill-blue-200"
      />
      <rect
        x="16"
        y="32"
        width="28"
        height="4"
        rx="2"
        className="fill-blue-200"
      />
      <rect
        x="16"
        y="40"
        width="20"
        height="4"
        rx="2"
        className="fill-blue-200"
      />
      <circle cx="44" cy="36" r="6" className="fill-blue-500" />
      <path d="M44 34L46 38H42L44 34Z" className="fill-white" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* breadcrumb header */}
      <header className="sticky top-0 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3 max-w-screen-2xl sm:px-12">
          <div className="flex items-center gap-2 overflow-hidden">
            <BreadCrumbMenu />
          </div>
        </div>
      </header>
      {/* Header - Hidden when printing */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-xl border-slate-200 print:hidden">
        <div className="px-6 py-10 lg:px-12 max-w-7xl lg:py-16">
          {/* Header Content */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-4 text-xl font-bold tracking-tighter text-gray-900 tracing-tight md:text-2xl">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-2xl">
                  <Zap className="text-blue-600 w-7 h-7" />
                </div>
                Invoices Registry
              </h1>
              <p className="max-w-2xl mt-4 text-xs text-gray-500">
                &quot;A comprehensive overview of all financial records.
                Monitor, review, and manage payroll invoices for teachers,
                employees, and nursing staff in one central hub.&quot;
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3">
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border rounded-xl border-slate-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50">
                    <PiFileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold sm:text-2xl text-slate-900">
                      {filteredInvoices?.length}
                    </p>
                    <p className="text-xs text-slate-600">Total</p>
                  </div>
                </div>
              </div>

              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border rounded-xl border-slate-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50">
                    <PiChartBar className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold sm:text-2xl text-slate-900">
                      {formatCurrency(totalAmount).split(' ')[0]}
                    </p>
                    <p className="text-xs text-slate-600">Value</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Hidden when printing */}
      <div className="px-6 py-6 lg:px-12 sm:py-8 max-w-10xl print:hidden">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <PiMagnifyingGlass className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice #, customer, or month..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Invoices Table */}
        {filteredInvoices?.length > 0 ? (
          <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 text-slate-600">
                      Invoice
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 text-slate-600">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 text-slate-600">
                      Period
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 text-slate-600">
                      Details
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase sm:px-6 text-slate-600">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-center uppercase sm:px-6 text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="capitalize divide-y divide-slate-200">
                  {filteredInvoices?.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50">
                            <PiReceipt className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {invoice?.invoiceNumber}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(invoice?.paidAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white uppercase rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                            {invoice.userDetails?.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {invoice.userDetails?.fullName || 'Unknown'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {invoice.userDetails?.phone || 'No phone'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 sm:px-6">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-900">
                            {invoice?.paymentDetails?.paymentMonthYear}
                          </p>
                          <p className="text-xs text-slate-500">
                            {invoice?.paymentDetails?.numberOfDutiesPaid} duties
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4 sm:px-6">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600">
                            Loans:{' '}
                            {invoice?.paymentDetails?.numberOfLoansPaid || 0}
                          </p>
                          <p className="text-xs text-slate-600">
                            New Balance:{' '}
                            {formatCurrency(
                              invoice.paymentDetails?.newBalance || 0,
                            )}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right sm:px-6">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(
                            invoice.amount || invoice.totalAmount,
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openPreview(invoice)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Invoice"
                          >
                            <PiEye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                            title="Delete Invoice"
                          >
                            <PiTrash className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white border rounded-xl border-slate-200">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <PiFileText className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No invoices found
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {searchQuery
                ? 'No invoices match your search criteria'
                : 'Get started by creating your first invoice'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 mt-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Invoice Preview Modal - A4 Sized */}
      <AnimatePresence>
        {isPreviewOpen && previewInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              ref={modalRef}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col font-times"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b sm:px-6 border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <PiFileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold sm:text-lg text-slate-900">
                      Invoice Preview
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {previewInvoice?.invoiceNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closePreview}
                  className="p-2 transition-colors rounded-lg hover:bg-slate-100"
                >
                  <PiX className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Invoice Content - A4 Format */}
              <div className="flex-1 px-6 overflow-y-auto bg-white">
                <div
                  ref={printRef}
                  className="mx-auto bg-white shadow-sm"
                  style={{
                    width: '210mm',
                    minHeight: '148.5mm', // Half A4 Height
                    maxHeight: '148.5mm',
                    padding: '8mm',
                    boxSizing: 'border-box',
                    fontFamily: "'Times New Roman', Times, serif",
                    backgroundColor: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Header */}
                  <div className="flex flex-col items-start justify-between pb-2 mb-2 border-b sm:flex-row border-slate-200">
                    <div className="mb-4 sm:mb-0">
                      <h1 className="font-semibold text-[13px] text-slate-900">
                        RPR DUET ADMISSION CARE
                      </h1>
                      <div className="mt-1 space-y-1 text-[11px] text-slate-600">
                        <p className="flex items-center gap-2">
                          <PiMapPin className="flex-shrink-0 w-4 h-4 text-slate-400" />
                          <span>
                            M.A. Samad Villa, In front of DUET Campus, Gazipur
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <PiPhone className="flex-shrink-0 w-4 h-4 text-slate-400" />
                          <span>+880 1742 590 128</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <PiEnvelope className="flex-shrink-0 w-4 h-4 text-slate-400" />
                          <span>rpr.group2013@gmail.com</span>
                        </p>
                      </div>
                    </div>
                    <div className="w-16 h-12">
                      <img src={rprLogo} alt="rpr-logo" srcSet="" />
                    </div>
                    <div className="text-right">
                      <h2 className="text-[14px] font-bold text-blue-600">
                        INVOICE
                      </h2>
                      <p className="text-[12px] text-slate-500">
                        #{previewInvoice.invoiceNumber}
                      </p>
                    </div>
                  </div>

                  {/* Bill To & Invoice Details */}
                  <div className="grid grid-cols-1 gap-6 mb-2 sm:grid-cols-2 sm:gap-8">
                    <div>
                      <h3 className="text-[13px] font-semibold tracking-wider uppercase text-slate-900">
                        Bill To
                      </h3>
                      <div className="p-2 space-y-1 rounded-lg bg-slate-50">
                        <p className="font-medium capitalize text-slate-900">
                          {previewInvoice.userDetails?.fullName} (
                          {previewInvoice.userDetails?.phone})
                        </p>
                        <p className="text-[12px] text-slate-600 capitalize">
                          User Type:{' '}
                          {previewInvoice.userDetails?.userType === 'staff'
                            ? 'employee'
                            : previewInvoice.userDetails?.userType}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className=" text-[13px] font-semibold tracking-wider uppercase text-slate-900">
                        Invoice Details
                      </h3>
                      <div className="p-4 space-y-2 rounded-lg bg-slate-50">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-600">Date</span>
                          <span className="font-medium text-slate-900">
                            {formatDate(previewInvoice.paidAt)} (
                            {formatDate(previewInvoice.startDate)} -{' '}
                            {formatDate(previewInvoice.endDate)})
                          </span>
                        </div>

                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-600">Month</span>
                          <span className="font-medium text-slate-900">
                            {previewInvoice.paymentDetails?.paymentMonthYear
                              ? previewInvoice.paymentDetails.paymentMonthYear
                                  .split(',')
                                  .map((m) =>
                                    new Date(m.trim()).toLocaleString('en-US', {
                                      month: 'long',
                                    }),
                                  )
                                  .join(' & ')
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid justify-center grid-cols-2 gap-2">
                    {' '}
                    {/* Duty Breakdown Table */}
                    {previewInvoice?.paymentDetails?.dutyAmountBreakdown
                      ?.length > 0 && (
                      <div className="mb-2">
                        <h3 className="text-[13px] font-semibold tracking-wider uppercase text-slate-900">
                          Class Details
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-[13px]">
                            <thead>
                              <tr className="border-y border-slate-200 bg-slate-50">
                                <th className="py-1 font-semibold text-left text-slate-600">
                                  Total Duties
                                </th>
                                <th className="py-1 font-semibold text-right text-slate-600">
                                  Amount
                                </th>
                                <th className="py-1 font-semibold text-center text-slate-600">
                                  Paid At
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-200">
                                <td className="py-1 text-slate-900">
                                  {
                                    previewInvoice?.paymentDetails
                                      ?.numberOfDutiesPaid
                                  }{' '}
                                  duties
                                </td>
                                <td className="py-1 font-semibold text-right text-slate-900">
                                  {previewInvoice?.paymentDetails?.selectedDue?.toLocaleString(
                                    'en-US',
                                    { style: 'currency', currency: 'BDT' },
                                  )}
                                </td>
                                <td className="py-1 text-center">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded text-emerald-700 bg-emerald-50">
                                    <PiCheckCircle className="w-3 h-3" />
                                    {previewInvoice?.paidAt}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {/* Loan Breakdown Table */}
                    {previewInvoice?.paymentDetails?.loanBreakdown?.length >
                      0 && (
                      <div className="mb-2">
                        <h3 className="text-[13px] font-semibold tracking-wider uppercase text-slate-900">
                          Loan Details
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-[13px]">
                            <thead>
                              <tr className="border-y border-slate-200 bg-slate-50">
                                <th className="py-1 font-semibold text-left text-slate-600">
                                  Total Loans
                                </th>
                                <th className="py-1 font-semibold text-right text-slate-600">
                                  Amount
                                </th>
                                <th className="py-1 font-semibold text-center text-slate-600">
                                  Deduct At
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-200">
                                <td className="py-1 text-slate-900">
                                  {
                                    previewInvoice?.paymentDetails
                                      ?.numberOfLoansPaid
                                  }
                                </td>
                                <td className="py-1 font-medium text-right text-rose-600">
                                  {previewInvoice?.paymentDetails?.deductLoanAmount?.toLocaleString(
                                    'en-US',
                                    { style: 'currency', currency: 'BDT' },
                                  )}
                                </td>
                                <td className="py-1 text-center">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded text-emerald-700 bg-emerald-50">
                                    <PiCheckCircle className="w-3 h-3" />
                                    {previewInvoice?.paidAt}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="flex justify-center w-full">
                    <div className="w-full">
                      <h1 className="text-[13px] text-center">
                        Calculated in ( {formatDate(previewInvoice.startDate)} -{' '}
                        {formatDate(previewInvoice.endDate)})
                      </h1>
                      <table className="w-full text-[13px] overflow-hidden border rounded-lg border-slate-200">
                        <tbody>
                          <tr className="border-b border-slate-200">
                            <td className="px-4 text-slate-600 bg-slate-50">
                              Due Amount
                            </td>

                            <td className="px-4 font-medium text-right text-amber-600">
                              {previewInvoice.paymentDetails?.selectedDue?.toLocaleString(
                                'en-US',
                                {
                                  style: 'currency',
                                  currency: 'BDT',
                                },
                              )}
                            </td>
                          </tr>

                          <tr className="border-b border-slate-200">
                            <td className="px-4 text-slate-600 bg-slate-50">
                              Loan Deduct
                            </td>

                            <td className="px-4 font-medium text-right text-amber-600">
                              {previewInvoice.paymentDetails?.deductLoanAmount?.toLocaleString(
                                'en-US',
                                { style: 'currency', currency: 'BDT' },
                              )}
                            </td>
                          </tr>

                          <tr className="bg-slate-50">
                            <td className="px-4 font-semibold text-slate-700">
                              Payable Amount
                            </td>

                            <td className="px-4 font-semibold text-right text-emerald-600">
                              {previewInvoice?.amount?.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'BDT',
                              })}
                            </td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="px-4 font-semibold text-slate-700">
                              Amount Paid
                            </td>

                            <td className="px-4 font-semibold text-right text-emerald-600">
                              {previewInvoice.paymentDetails?.amountPaid?.toLocaleString(
                                'en-US',
                                {
                                  style: 'currency',
                                  currency: 'BDT',
                                },
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-2 mt-2 text-center border-t border-slate-200">
                    <p className="text-[12px] text-slate-600">
                      Thank you for your business!
                    </p>
                    <p className="mt-1 text-[12px] text-slate-500">
                      This is a computer generated invoice - no signature
                      required
                    </p>
                    <p className="mt-2 text-[12px] text-slate-400">
                      Generated on {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col items-center justify-end gap-3 px-4 py-4 border-t sm:flex-row sm:px-6 border-slate-200 bg-slate-50">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
                >
                  <PiPrinter className="w-4 h-4" />
                  Print Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DownloadInvoice;

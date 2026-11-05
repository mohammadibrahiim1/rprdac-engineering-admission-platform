import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  Download,
  Package,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  TrendingUp,
  X,
  XCircle,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Printer,
  RefreshCw,
  AlertCircle,
  Check,
  ArrowUpRight,
  Receipt,
  User,
  CreditCard,
  Tag,
  Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import PostCardModal from '../components/PostCardModal';
import {
  useDeleteOrderMutation,
  useGetOrdersQuery,
} from '../../../../../redux/features/order/orderApi';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import OrderUpdateModal from '../components/OrderUpdateModal';
import PostCardPrint from '../components/PostCardPrint';

/* ─── HELPERS ───────────────────────────────────────────────── */
const isSameDate = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

/* ─── STATUS CONFIG ─────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-800 ring-amber-200',
    label: 'Pending',
  },
  approved: {
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    label: 'Approved',
  },
  processing: {
    dot: 'bg-blue-400',
    badge: 'bg-blue-50 text-blue-800 ring-blue-200',
    label: 'Processing',
  },
  shipping: {
    dot: 'bg-violet-400',
    badge: 'bg-violet-50 text-violet-800 ring-violet-200',
    label: 'Shipping',
  },
  delivered: {
    dot: 'bg-teal-500',
    badge: 'bg-teal-50 text-teal-800 ring-teal-200',
    label: 'Delivered',
  },
  cancelled: {
    dot: 'bg-red-400',
    badge: 'bg-red-50 text-red-700 ring-red-200',
    label: 'Cancelled',
  },
  refunded: {
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-600 ring-gray-200',
    label: 'Refunded',
  },
  rejected: {
    dot: 'bg-rose-400',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    label: 'Rejected',
  },
};

/* ─── STATUS BADGE ──────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ${cfg.badge} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      {cfg.label}
    </span>
  );
};

/* ─── STAT CARD ─────────────────────────────────────────────── */
const StatCard = ({
  icon: Icon,
  label,
  value,
  iconClassName,
  bgClassName,
  onClick,
  active,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left w-full
      ${
        active
          ? 'bg-blue-50 border-blue-200 shadow-sm'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }
      ${onClick ? 'cursor-pointer' : 'cursor-default'}
    `}
  >
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bgClassName}`}
    >
      <Icon size={15} className={iconClassName} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5 truncate">
        {label}
      </p>
      <p className="text-xl font-bold leading-none text-gray-900">
        {value ?? 0}
      </p>
    </div>
  </button>
);

/* ─── MAIN ORDERS PAGE ──────────────────────────────────────── */
const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const searchRef = useRef(null);

  const {
    data: queryData,
    error,
    refetch,
    isFetching,
  } = useGetOrdersQuery({
    page,
    limit,
    searchQuery,
    status: selectedStatus === 'all' ? '' : selectedStatus,
  });

  const [deleteOrder] = useDeleteOrderMutation();

  const orders = useMemo(() => queryData?.orders ?? [], [queryData]);
  const totalPages = queryData?.totalPages ?? 1;
  const totalOrders = queryData?.totalOrders ?? 0;

  const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const todayOrders = useMemo(() => {
    const today = new Date();
    return orders.filter((o) =>
      isSameDate(new Date(o.orderDate || o.createdAt), today),
    ).length;
  }, [orders]);

  useEffect(() => {
    const onClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };
  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setIsFilterOpen(false);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await deleteOrder(id).unwrap();
      toast.success('Order deleted');
      await refetch();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete order');
    }
  };

  const clearFilters = () => {
    setSelectedStatus('');
    setSearchQuery('');
    setPage(1);
    setIsFilterOpen(false);
  };
  const hasActiveFilters =
    (selectedStatus && selectedStatus !== 'all') || searchQuery;

  /* ── PDF Generator ──────────────────────────────────────── */
  const generateReceiptPDF = (order) => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 50;
      let y = 55;

      // SAFE TEXT
      const T = (v) => (v === null || v === undefined ? '' : String(v));

      // NOTO SERIF BENGALI FONT SETUP (VFS placeholder or standard fallback)
      // Note: jsPDF e bangla text er jonno Base64 string use korte hoy.
      // Jodi base64 string thake tahole niche add korte paren:
      // doc.addFileVFS('NotoSerifBengali.ttf', 'YOUR_BASE64_STRING');
      // doc.addFont('NotoSerifBengali.ttf', 'NotoSerifBengali', 'normal');

      const setFont = (text = '', bold = false) => {
        const isBangla = /[\u0980-\u09FF]/.test(T(text));
        doc.setFont(
          isBangla ? 'helvetica' : 'helvetica',
          bold ? 'bold' : 'normal',
        );
        // Safe fallback to helvetica or custom registered font if base64 is provided
      };

      const drawLine = (yPos) => {
        doc.setDrawColor(220);
        doc.setLineWidth(0.6);
        doc.line(margin, yPos, pageWidth - margin, yPos);
      };

      // =========================
      // HEADER (NOTION STYLE)
      // =========================
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('RPR DUET ADMISSION CARE', margin, y);

      y += 14;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        'M.A. Samad Villa, DUET Campus | 01742590128 | rpr.group2013@gmail.com',
        margin,
        y,
      );

      y += 18;
      drawLine(y);
      y += 25;

      // =========================
      // TITLE + STATUS
      // =========================
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20);
      doc.text('Invoice', margin, y);

      const payStatus = T(order?.payment?.status || 'Paid');

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(payStatus, pageWidth - margin, y, { align: 'right' });

      y += 28;

      // =========================
      // META (LEFT + RIGHT)
      // =========================
      const orderDate = order?.orderDate
        ? new Date(order.orderDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '';

      const leftMeta = [
        ['Order ID', `#${T(order?.orderId)}`],
        ['Date', orderDate],
        ['Session', T(order?.session)],
      ];

      const rightMeta = [
        ['SL No', T(order?.sl_no)],
        ['Payment', T(order?.payment?.method || 'N/A')],
        ['Status', payStatus],
      ];

      let leftY = y;
      let rightY = y;

      leftMeta.forEach(([k, v]) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120);
        doc.text(k, margin, leftY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30);
        doc.text(v, margin + 80, leftY);

        leftY += 14;
      });

      rightMeta.forEach(([k, v]) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120);
        doc.text(k, pageWidth - margin - 150, rightY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30);
        doc.text(v, pageWidth - margin, rightY, { align: 'right' });

        rightY += 14;
      });

      y = Math.max(leftY, rightY) + 25;

      drawLine(y);
      y += 20;

      // =========================
      // BILLING + ADMISSION
      // =========================
      const billing = order?.billingAddress || {};

      const fullName = T(
        order?.name ||
          `${billing.firstName || ''} ${billing.lastName || ''}`.trim(),
      );

      const phone = T(order?.phone || billing.phone);
      const address = T(billing.street);

      const sectionGap = 240;

      // LEFT BLOCK
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text('Billing Information', margin, y);

      y += 14;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30);
      doc.text(fullName, margin, y);

      y += 14;
      doc.setTextColor(110);
      doc.text(phone, margin, y);

      y += 14;
      doc.text(doc.splitTextToSize(address, 200), margin, y);

      // RIGHT BLOCK
      let ry = y - 42;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(90);
      doc.text('Admission Details', margin + sectionGap, ry);

      ry += 14;

      const adm = [
        ['Institute', order?.institute],
        ['Department', order?.department],
        ['Session', order?.session],
      ];

      adm.forEach(([k, v]) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120);
        doc.text(k, margin + sectionGap, ry);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30);
        doc.text(T(v), margin + sectionGap + 80, ry);

        ry += 14;
      });

      y += 60;

      drawLine(y);
      y += 20;

      // =========================
      // TABLE (NOTION STYLE)
      // =========================
      const rows = (order?.items || []).map((item) => [
        T(item?.title),
        T(item?.sl_no),
        T(item?.quantity || 1),
        `${T(item?.eachItemPrice?.toFixed?.(2) || '0.00')}`,
        `${T(item?.totalAmount?.toFixed?.(2) || '0.00')}`,
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Item', 'SL', 'Qty', 'Unit', 'Total']],
        body: rows,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 6,
          textColor: [30, 30, 30],
        },
        headStyles: {
          textColor: [120, 120, 120],
          fontStyle: 'bold',
        },
        columnStyles: {
          2: { halign: 'center' },
          3: { halign: 'right' },
          4: { halign: 'right' },
        },
        margin: { left: margin, right: margin },
      });

      y = doc.lastAutoTable.finalY + 25;

      // =========================
      // SUMMARY
      // =========================
      const discountObj = order?.discounts?.[0] || {};

      const summary = [
        ['Subtotal', order?.subtotal],
        ['Delivery', order?.payment?.deliveryCharge],
        ['Discount', `- ${discountObj?.amount || 0}`],
      ];

      const sx = pageWidth - margin - 180;

      summary.forEach(([k, v]) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120);
        doc.text(k, sx, y);

        doc.setTextColor(30);
        doc.text(`${T(v || 0)} BDT`, pageWidth - margin, y, {
          align: 'right',
        });

        y += 16;
      });

      y += 6;

      drawLine(y);
      y += 16;

      const totalPaid = T(order?.payment?.amountPaid || order?.totalAmount);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Total Paid', sx, y);
      doc.text(`${totalPaid} BDT`, pageWidth - margin, y, {
        align: 'right',
      });

      // =========================
      // FOOTER
      // =========================
      const footerY = pageHeight - 30;

      doc.setFontSize(9);
      doc.setTextColor(130);

      doc.text('Thanks for your business', margin, footerY);
      doc.text(
        `Printed: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        footerY,
        {
          align: 'center',
        },
      );

      doc.text('Page 1', pageWidth - margin, footerY, {
        align: 'right',
      });

      // SAVE
      doc.save(`invoice_${T(order?.orderId)}.pdf`);
    } catch (err) {
      toast.error('PDF failed');
    }
  };

  /* ── Excel Export ───────────────────────────────────────── */

  const handleDownloadExcel = async () => {
    if (!orders?.length) {
      toast.error('No orders to export!');
      return;
    }

    try {
      // ১. ওয়ার্কবুক ও ওয়ার্কশিট তৈরি
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Orders');

      // ২. হেডার এবং ব্রান্ডিং রো যোগ করা
      ws.addRow(['', 'RPR DUET Admission Care']);
      ws.addRow([
        '',
        'M.A. Samad Villa In front of DUET Campus, Gazipur, Bangladesh | +880 1742 590 128 | rpr.group2013@gmail.com',
      ]);
      ws.addRow(['', 'Orders Sheet']);
      ws.addRow([
        'SL',
        'Order ID',
        'Name',
        'Phone',
        'Institute',
        'Department',
        'Session',
        'Payment Method',
        'Amount Paid',
        'Payment Status',
        'Txn ID',
        'Items',
        'Sl No',
        'Quantity',
        'Unit Price',
        'Sub Total',
        'Delivery Charge',
        'Discount',
        'Total Payable',
      ]);

      // স্টাইলিং
      ws.getRow(1).font = { bold: true, size: 14 };
      ws.getRow(2).font = { italic: true, size: 10, color: { argb: '555555' } };
      ws.getRow(3).font = { bold: true, size: 11, color: { argb: '0047AB' } };
      ws.getRow(4).font = { bold: true };

      // ৩. অর্ডার ডেটা ম্যাপ করা
      const data = orders.map((order, i) => {
        const itemTitles =
          order.items?.map((item) => item?.title || '').join(', ') || '—';
        const itemSL =
          order.items?.map((item) => item?.sl_no || '').join(', ') || '—';
        const itemQuantities =
          order.items?.map((item) => item?.quantity || '').join(', ') || '—';
        const itemPrices =
          order.items?.map((item) => item?.eachItemPrice || '').join(', ') ||
          '—';
        const discounts =
          order.discounts?.map((item) => item?.amount || '').join(', ') || '—';

        return [
          i + 1,
          order.orderId || 'N/A',
          order.name || '—',
          order.phone || '—',
          order.institute || '—',
          order.department || '—',
          order.session || '—',
          order.payment?.method || '—',
          order.payment?.amountPaid ? `৳${order.payment.amountPaid}` : '—',
          order.payment?.status || '—',
          order.payment?.transactionId || '—',
          itemTitles,
          itemSL,
          itemQuantities,
          itemPrices,
          order.subtotal || '—',
          order.payment?.deliveryCharge || '—',
          discounts,
          order.totalAmount || '—',
        ];
      });

      ws.addRows(data);

      // ৪. কলাম উইডথ সেটআপ
      ws.columns = [
        { width: 5 }, // SL
        { width: 15 }, // Order ID
        { width: 20 }, // Name
        { width: 15 }, // Phone
        { width: 20 }, // Institute
        { width: 15 }, // Department
        { width: 10 }, // Session
        { width: 15 }, // Payment Method
        { width: 12 }, // Amount Paid
        { width: 10 }, // Payment Status
        { width: 18 }, // Txn ID
        { width: 25 }, // Items
        { width: 12 }, // Sl No
        { width: 12 }, // Quantity
        { width: 12 }, // Unit Price
        { width: 15 }, // Sub Total
        { width: 10 }, // Delivery Charge
        { width: 15 }, // Discount
        { width: 15 }, // Total Payable
      ];

      // ৫. বাফার তৈরি এবং ব্রাউজারের নেটিভ পদ্ধতিতে ডাউনলোড ট্রিগার করা
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Orders_RPR_DUET.xlsx';
      anchor.click();
      window.URL.revokeObjectURL(url);

      toast.success('Excel exported!');
    } catch (error) {
      toast.error('Failed to export orders. Please try again.');
    }
  };

  /* ── Pagination helpers ─────────────────────────────────── */
  const getPageNumbers = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[Inter,ui-sans-serif,system-ui,sans-serif]">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <BreadCrumbMenu />
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* ── Page Title ── */}
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none mt-0.5">🛍️</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Orders
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage and track all customer orders in one place.
            </p>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            icon={ShoppingBag}
            label="Total"
            value={totalOrders?.toLocaleString()}
            iconClassName="text-gray-500"
            bgClassName="bg-gray-100"
          />
          <StatCard
            icon={TrendingUp}
            label="Today"
            value={todayOrders}
            iconClassName="text-blue-500"
            bgClassName="bg-blue-50"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={queryData?.statusStats?.pending || 0}
            iconClassName="text-amber-500"
            bgClassName="bg-amber-50"
            onClick={() => handleStatusChange('pending')}
            active={selectedStatus === 'pending'}
          />
          <StatCard
            icon={Package}
            label="Processing"
            value={queryData?.statusStats?.processing || 0}
            iconClassName="text-blue-500"
            bgClassName="bg-blue-50"
            onClick={() => handleStatusChange('processing')}
            active={selectedStatus === 'processing'}
          />
          <StatCard
            icon={CheckCircle2}
            label="Delivered"
            value={queryData?.statusStats?.delivered || 0}
            iconClassName="text-emerald-500"
            bgClassName="bg-emerald-50"
            onClick={() => handleStatusChange('delivered')}
            active={selectedStatus === 'delivered'}
          />
          <StatCard
            icon={XCircle}
            label="Cancelled"
            value={queryData?.statusStats?.cancelled || 0}
            iconClassName="text-red-500"
            bgClassName="bg-red-50"
            onClick={() => handleStatusChange('cancelled')}
            active={selectedStatus === 'cancelled'}
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="flex items-center w-56 gap-2 px-3 py-2 transition-all bg-white border border-gray-200 rounded-lg focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-all
                  ${
                    isFilterOpen || (selectedStatus && selectedStatus !== 'all')
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
              >
                <Filter size={12} />
                <span>
                  {selectedStatus && selectedStatus !== 'all'
                    ? STATUS_CONFIG[selectedStatus]?.label || selectedStatus
                    : 'Filter'}
                </span>
                <ChevronDown
                  size={11}
                  className={`transition-transform duration-150 ${isFilterOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.1 }}
                    className="absolute top-[calc(100%+6px)] left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[180px] overflow-hidden"
                  >
                    {statusOptions.map((opt) => {
                      const isActive =
                        selectedStatus === opt.value ||
                        (!selectedStatus && opt.value === 'all');
                      return (
                        <div
                          key={opt.value}
                          onClick={() => handleStatusChange(opt.value)}
                          className={`flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer transition-colors
                            ${isActive ? 'text-blue-700 font-medium bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center gap-2">
                            {opt.value !== 'all' &&
                              STATUS_CONFIG[opt.value] && (
                                <span
                                  className={`w-2 h-2 rounded-full ${STATUS_CONFIG[opt.value].dot}`}
                                />
                              )}
                            {opt.label}
                          </div>
                          {isActive && (
                            <Check size={13} className="text-blue-500" />
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
              >
                <X size={12} />
                Clear filters
              </button>
            )}
          </div>

          <button
            onClick={handleDownloadExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all"
          >
            <Download size={13} />
            <span>Export Excel</span>
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0" />
            {error?.data?.error || 'Failed to load orders. Please try again.'}
          </div>
        )}

        {/* ── Count bar ── */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            {isFetching
              ? 'Loading...'
              : `${totalOrders?.toLocaleString()} order${totalOrders !== 1 ? 's' : ''}`}
          </span>
          {isFetching && (
            <RefreshCw size={11} className="text-gray-400 animate-spin" />
          )}
        </div>

        {/* ── Empty state ── */}
        {!isFetching && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-2xl">
              <ShoppingCart size={24} className="text-gray-400" />
            </div>
            <p className="mb-1 text-base font-semibold text-gray-700">
              No orders found
            </p>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* ── Order Cards ── */}
        <div className="space-y-3">
          <AnimatePresence>
            {orders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.15,
                  delay: Math.min(idx * 0.03, 0.3),
                }}
              >
                <OrderCard
                  order={order}
                  onDelete={handleDelete}
                  onDownload={generateReceiptPDF}
                  onRefetch={refetch}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Showing{' '}
              <strong className="text-gray-800">
                {(page - 1) * limit + 1}–{Math.min(page * limit, totalOrders)}
              </strong>{' '}
              of <strong className="text-gray-800">{totalOrders}</strong> orders
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-xs text-gray-500">Rows:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-md outline-none cursor-pointer focus:border-blue-400"
                >
                  {[5, 10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center justify-center w-8 h-8 text-gray-600 transition-all bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>

              {getPageNumbers().map((pn) => (
                <button
                  key={pn}
                  onClick={() => setPage(pn)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border transition-all
                    ${
                      page === pn
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {pn}
                </button>
              ))}

              {totalPages > 5 && (
                <span className="text-xs text-gray-400">…</span>
              )}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center justify-center w-8 h-8 text-gray-600 transition-all bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── ORDER CARD ────────────────────────────────────────────── */
const OrderCard = ({ order, onDelete, onDownload, onRefetch }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target))
        setShowActions(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const createdStr = new Date(
    order?.orderDate || order?.createdAt,
  ).toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotal =
    order.items?.reduce((s, it) => s + (it.totalAmount || 0), 0) ?? 0;
  const discount =
    order.discounts?.reduce((s, d) => s + (d?.amount || 0), 0) ?? 0;
  const delivery = order.payment?.deliveryCharge ?? 0;

  return (
    <div className="transition-all duration-150 bg-white border border-gray-200 shadow-sm rounded-md hover:shadow-md hover:border-gray-300">
      {/* ── Collapsed Row ── */}
      <div
        className="flex items-center gap-2 px-3 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <ChevronRight
          size={14}
          className={`text-gray-400 shrink-0 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
        />

        {/* Order ID */}
        <span className="hidden font-mono text-xs text-gray-500 whitespace-nowrap shrink-0 sm:block">
          #{order?.orderId}
        </span>

        {/* Status */}
        <div className="shrink-0">
          <StatusBadge status={order?.status} />
        </div>

        {/* Name */}
        <span className="flex-1 min-w-0 text-sm font-semibold text-gray-900 truncate">
          {order?.name || '—'}
        </span>

        {/* Phone — hidden on mobile */}
        <span className="text-xs text-gray-500 whitespace-nowrap shrink-0 hidden md:block w-[100px]">
          {order?.phone || '—'}
        </span>

        {/* Institute — hidden on smaller screens */}
        <span className="text-xs text-gray-500 whitespace-nowrap shrink-0 hidden lg:block w-[100px] truncate">
          {order?.institute || '—'}
        </span>

        {/* Items count */}
        <span className="hidden text-xs text-gray-400 whitespace-nowrap shrink-0 sm:block">
          {order?.items?.length ?? 0} item
          {order?.items?.length !== 1 ? 's' : ''}
        </span>

        {/* Total */}
        <span className="text-sm font-bold text-gray-900 whitespace-nowrap shrink-0 min-w-[68px] text-right">
          ৳{(order?.totalAmount || 0).toLocaleString()}
        </span>

        {/* Date — hidden on smaller screens */}
        <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0 hidden xl:block w-[130px] text-right">
          {createdStr}
        </span>

        {/* Actions — stop row click propagation */}
        <div
          className="flex items-center gap-1 ml-auto shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onDownload(order)}
            title="Download Invoice"
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Download size={13} />
          </button>
          <button
            onClick={() => setSelectedOrder(order)}
            title="Print Postcard"
            className="p-1.5 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all hidden sm:flex"
          >
            <Printer size={13} />
          </button>

          {/* More menu */}
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setShowActions((v) => !v)}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <MoreHorizontal size={13} />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-[calc(100%+4px)] z-50 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[170px] overflow-hidden"
                >
                  <ActionMenuItem
                    icon={FileText}
                    label="Update order"
                    onClick={() => {
                      setShowModal(true);
                      setShowActions(false);
                    }}
                  />
                  <ActionMenuItem
                    icon={Download}
                    label="Download PDF"
                    onClick={() => {
                      onDownload(order);
                      setShowActions(false);
                    }}
                  />
                  <ActionMenuItem
                    icon={Printer}
                    label="Print postcard"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowActions(false);
                    }}
                  />
                  <div className="h-px my-1 bg-gray-100" />
                  <ActionMenuItem
                    icon={Trash2}
                    label="Delete order"
                    onClick={() => {
                      onDelete(order._id);
                      setShowActions(false);
                    }}
                    danger
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Expanded Detail ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-gray-100" />

            <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-3">
              {/* ── Customer Info Table ── */}
              <section>
                <SectionHeader
                  icon={User}
                  label="Customer Info"
                  color="text-blue-600"
                  bg="bg-blue-50"
                />
                <table className="w-full mt-2 overflow-hidden text-sm border border-gray-200 rounded-lg">
                  <tbody>
                    <TableRow label="Name" value={order.name} />
                    <TableRow label="Phone" value={order.phone} />
                    <TableRow label="Institute" value={order.institute} />
                    <TableRow label="Department" value={order.department} />
                    <TableRow label="Session" value={order.session} last />
                  </tbody>
                </table>
              </section>

              {/* ── Payment Info Table ── */}
              <section>
                <SectionHeader
                  icon={CreditCard}
                  label="Payment Info"
                  color="text-emerald-600"
                  bg="bg-emerald-50"
                />
                <table className="w-full mt-2 overflow-hidden text-sm border border-gray-200 rounded-lg">
                  <tbody>
                    <TableRow label="Method" value={order.payment?.method} />
                    <TableRow
                      label="Amount Paid"
                      value={
                        order.payment?.amountPaid
                          ? `${order.payment.amountPaid?.toLocaleString('en-US', { style: 'currency', currency: 'BDT' })}`
                          : '—'
                      }
                    />
                    <TableRow
                      label="Status"
                      value={
                        <span
                          className={
                            order.payment?.status === 'paid'
                              ? 'text-emerald-600 font-semibold'
                              : 'text-gray-700'
                          }
                        >
                          {order.payment?.status || '—'}
                        </span>
                      }
                    />
                    <TableRow
                      label="Txn ID"
                      value={order.payment?.transactionId || '—'}
                      mono
                    />
                    <TableRow
                      label="Delivery"
                      value={`${delivery?.toLocaleString('en-US', { style: 'currency', currency: 'BDT' })}`}
                    />
                    <TableRow
                      label="Discount"
                      value={
                        discount > 0
                          ? `−${discount?.toLocaleString('en-US', { style: 'currency', currency: 'BDT' })}`
                          : '—'
                      }
                      valueClass="text-red-500"
                      last
                    />
                  </tbody>
                </table>
              </section>

              {/* ── Shipping Info Table ── */}
              <section>
                <SectionHeader
                  icon={Truck}
                  label="Shipping Info"
                  color="text-violet-600"
                  bg="bg-violet-50"
                />
                <table className="w-full mt-2 overflow-hidden text-sm border border-gray-200 rounded-lg">
                  <tbody>
                    <TableRow
                      label="Method"
                      value={order.shipping?.method || '—'}
                    />
                    <TableRow
                      label="Tracking"
                      value={order.shipping?.trackingNumber || '—'}
                      mono
                    />
                    <TableRow
                      label="Delivered"
                      value={
                        order.shipping?.deliveredAt
                          ? new Date(
                              order.shipping.deliveredAt,
                            ).toLocaleDateString('en-GB')
                          : '—'
                      }
                      last
                    />
                  </tbody>
                </table>
              </section>
            </div>

            {/* ── Order Items Table ── */}
            <div className="px-4 pb-4 sm:px-5">
              <SectionHeader
                icon={Receipt}
                label={`Order Items (${order.items?.length ?? 0})`}
                color="text-amber-600"
                bg="bg-amber-50"
              />
              <div className="mt-2 overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 border-b border-gray-200">
                        #
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 border-b border-gray-200">
                        Item
                      </th>
                      <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 border-b border-gray-200">
                        SL No
                      </th>
                      <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 border-b border-gray-200">
                        Qty
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 border-b border-gray-200">
                        Unit Price
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 border-b border-gray-200">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items?.map((item, i) => (
                      <tr
                        key={item.productId || i}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-3 py-2.5 text-xs text-gray-400">
                          {i + 1}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-gray-800 max-w-[200px]">
                          <span className="block truncate">
                            {item.title || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-500">
                          {item.sl_no || (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-600">
                          ×{item.quantity ?? 1}
                        </td>
                        <td className="px-3 py-2.5 text-right text-gray-600">
                          {(item.eachItemPrice ?? 0)?.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'BDT',
                          })}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-gray-800">
                          {(item.totalAmount ?? 0).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'BDT',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-gray-200 bg-gray-50">
                    <tr className="border-t border-gray-100">
                      <td
                        colSpan={5}
                        className="px-3 py-2 text-xs text-right text-gray-500"
                      >
                        Subtotal
                      </td>
                      <td className="px-3 py-2 text-sm font-semibold text-right text-gray-700">
                        {subtotal?.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'BDT',
                        })}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td
                        colSpan={5}
                        className="px-3 py-2 text-xs text-right text-gray-500"
                      >
                        Delivery Charge
                      </td>
                      <td className="px-3 py-2 text-sm font-semibold text-right text-gray-700">
                        {delivery?.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'BDT',
                        })}
                      </td>
                    </tr>
                    {discount > 0 && (
                      <tr className="border-t border-gray-100">
                        <td
                          colSpan={5}
                          className="px-3 py-2 text-xs text-right text-red-500"
                        >
                          Discount
                          {order.discounts?.[0]?.description
                            ? ` (${order.discounts[0].description})`
                            : ''}
                        </td>
                        <td className="px-3 py-2 text-sm font-semibold text-right text-red-500">
                          −
                          {discount?.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'BDT',
                          })}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-100 border-t-2 border-gray-300">
                      <td
                        colSpan={5}
                        className="px-3 py-2.5 text-sm font-bold text-gray-900 text-right"
                      >
                        Total Payable
                      </td>
                      <td className="px-3 py-2.5 text-right text-base font-bold text-gray-900">
                        {(order?.totalAmount ?? 0).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'BDT',
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* ── Inline Action Bar ── */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-gray-100 sm:px-5 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all"
              >
                <FileText size={12} /> Update Order
              </button>
              <button
                onClick={() => setSelectedOrder(order)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-all"
              >
                <Printer size={12} /> Postcard
              </button>
              <button
                onClick={() => onDownload(order)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all"
              >
                <Download size={12} /> Invoice PDF
              </button>
              <button
                onClick={() => onDelete(order._id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all ml-auto"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Parent Component er Bhitore --- */}
      {selectedOrder && (
        <div>
          <PostCardPrint
            order={selectedOrder}
            onAfterPrint={() => setSelectedOrder(null)}
          />
        </div>
      )}

      {showModal && (
        <OrderUpdateModal
          order={order}
          onClose={() => setShowModal(false)}
          onUpdate={() => {
            onRefetch();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

/* ─── ACTION MENU ITEM ──────────────────────────────────────── */
const ActionMenuItem = ({ icon: Icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left
      ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}
  >
    <Icon size={13} className="shrink-0" />
    {label}
  </button>
);

/* ─── SECTION HEADER ────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, label, color, bg }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-6 h-6 rounded-md flex items-center justify-center ${bg}`}
    >
      <Icon size={13} className={color} />
    </div>
    <h4 className="text-xs font-bold tracking-wider text-gray-600 uppercase">
      {label}
    </h4>
  </div>
);

/* ─── TABLE ROW (for Customer / Payment / Shipping tables) ── */
const TableRow = ({
  label,
  value,
  mono = false,
  last = false,
  valueClass = '',
}) => (
  <tr className={!last ? 'border border-gray-200' : ''}>
    <td className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 w-[40%] whitespace-nowrap border border-gray-200">
      {label}
    </td>
    <td
      className={`px-3 py-2 text-xs text-gray-800 break-all ${mono ? 'font-mono' : ''} ${valueClass}`}
    >
      {value ?? '—'}
    </td>
  </tr>
);

export default Orders;

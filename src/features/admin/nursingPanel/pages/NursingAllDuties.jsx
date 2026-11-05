import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Edit3,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
  Zap,
  Download,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useDeleteNursingDutyMutation,
  useGetNursingAllDutiesQuery,
  useUpdateNursingAttendanceStatusMutation,
  useUpdateNursingDutyMutation,
} from '../../../../../redux/features/Nursing/NursingApi';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';
import { formatDateDMY } from '../../../../../constants/dateFormat';
import toast from 'react-hot-toast';
import NursingFilterSidebar from '../components/NursingFilterSidebar';
import UpdateNursingDutyModal from '../components/UpdateNursingDutyModal';

const NursingAllDuties = () => {
  // State for filters
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState(null);

  // RTK Query hook
  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetNursingAllDutiesQuery(filters, {
    skip: false,
    refetchOnMountOrArgChange: true,
  });

  const [updateNursingDuty, { isLoading: isUpdating }] =
    useUpdateNursingDutyMutation();

  const [updateNursingAttendanceStatus, { isLoading: isUpdateStatus }] =
    useUpdateNursingAttendanceStatusMutation();

  const [deleteNursingDuty, { isLoading: isDeleting }] =
    useDeleteNursingDutyMutation();

  // Handle scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: debouncedSearch,
        page: 1,
      }));
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

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

  // Limit options with "All"
  const limitOptions = useMemo(
    () => [
      { value: 5, label: '5' },
      { value: 10, label: '10' },
      { value: 25, label: '25' },
      { value: 50, label: '50' },
      { value: 'all', label: 'All' },
    ],
    [],
  );

  // Calculate stats
  const stats = useMemo(() => {
    if (!rawData?.data) {
      return {
        total: 0,
        approved: 0,
        pending: 0,
        paid: 0,
      };
    }

    return {
      total: rawData?.summary?.totalDuties || 0,
      approved: rawData?.summary.approvedDuties,
      pending: rawData?.summary.pendingDuties,
      paid: rawData?.summary.paidDuties,
    };
  }, [rawData]);

  const handleEditClick = useCallback((item) => {
    setSelectedDuty(item);
    setIsModalOpen(true);
  }, []);

  const handleUpdateNursingDuty = useCallback(
    async (formData) => {
      if (!selectedDuty?._id) {
        toast.error('No duty selected for update');
        return;
      }

      try {
        const res = await updateNursingDuty({
          id: selectedDuty._id,
          ...formData,
        }).unwrap();

        setIsModalOpen(false);
        setSelectedDuty(null);
        toast.success(res?.message || 'Duty updated successfully!');
        refetch(); // Refresh the data
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to update duty.');
      }
    },
    [selectedDuty, updateNursingDuty, refetch],
  );

  const handleApprove = async (id) => {
    try {
      setActiveId(id);

      const res = await updateNursingAttendanceStatus({
        nursingId: id,
        status: 'approve', // "approve" / "reject"
      }).unwrap();
      toast.success(res?.message);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message);
    } finally {
      setActiveId(null);
    }
  };

  const handleDeleteNursingDuty = async (id) => {
    // 1. Confirm before deleting (Good UX)
    if (!window.confirm('Are you sure you want to delete this duty?')) {
      return;
    }

    try {
      // 2. Perform the API call
      const res = await deleteNursingDuty({ nursingId: id });
      // 3. Handle success
      // Replace 'toast' with your preferred notification method (e.g., alert, console)
      toast.success(res?.message || 'Deleted successful!');

      refetch();
      // 4. Trigger a re-fetch or state update here
      // e.g., refetch(); or setDuties(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      // 5. Handle errors
      const errorMessage =
        error?.data?.message || 'Failed to delete duty. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Handler functions
  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      let finalValue = value;

      // যদি limit পরিবর্তন করা হয় এবং সেটি ০ বা "0" হয়, তবে "all" সেট হবে
      if (name === 'limit') {
        finalValue = value === 0 || value === '0' ? 'all' : Number(value);
      }

      return {
        ...prev,
        [name]: finalValue,
        page: name === 'limit' ? 1 : prev.page, // লিমিট বদলালে পেজ ১ এ রিসেট হবে
      };
    });
  };

  const handleClearFilters = useCallback(() => {
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
    setDebouncedSearch('');
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Notion-style Status Colors
  const getStatusStyles = useCallback((status) => {
    const styles = {
      pending: 'bg-orange-50 text-orange-700 border-orange-200',
      approve: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      styles[status?.toLowerCase()] ||
      'bg-gray-50 text-gray-700 border-gray-200'
    );
  }, []);

  const getPaymentStyles = useCallback((status) => {
    return status?.toLowerCase() === 'paid'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-slate-50 text-slate-700 border-slate-200';
  }, []);

  const formatTo12Hour = useCallback((time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  }, []);

  const formatDuration = useCallback((totalSeconds) => {
    if (!totalSeconds) return '0m';
    const seconds = parseInt(totalSeconds, 10);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  }, []);

  // Save duty PDF
  const generatePDFStatement = useCallback(() => {
    if (!rawData?.data?.length) {
      toast.error('No data to generate PDF');
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
      let cursorY = margin;

      // Helper functions
      const capitalize = (str) =>
        str
          ?.toLowerCase()
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') || 'N/A';

      const drawHeader = () => {
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('RPR DUET ADMISSION CARE', pageWidth / 2, margin + 5, {
          align: 'center',
        });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(
          'M.A. Samad Villa, In front of DUET Campus, Gazipur | +880 1742 590 128',
          pageWidth / 2,
          margin + 11,
          { align: 'center' },
        );

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(margin, margin + 15, pageWidth - margin, margin + 15);
        return margin + 25;
      };

      const drawFooter = (pageNum) => {
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const now = new Date().toLocaleString();
        doc.text(`Generated: ${now}`, margin, pageHeight - 10);
        doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 10, {
          align: 'right',
        });
      };

      const nursingData = rawData?.data || [];

      // Group data by month and year
      const dutiesByMonth = {};
      nursingData.forEach((item) => {
        if (item.date) {
          const date = parseISO(item.date);
          const key = `${format(date, 'MMMM yyyy')}`;
          if (!dutiesByMonth[key]) dutiesByMonth[key] = [];
          dutiesByMonth[key].push(item);
        }
      });

      const monthKeys = Object.keys(dutiesByMonth);

      // Draw header
      cursorY = drawHeader();

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Nursing Duty Statement', pageWidth / 2, cursorY, {
        align: 'center',
      });
      cursorY += 6;

      // Date range info
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      const dateRangeText =
        filters?.startDate && filters?.endDate
          ? `Date Range: ${formatDateDMY(filters.startDate)} to ${formatDateDMY(filters.endDate)}`
          : 'Date Range: All Time';

      doc.text(dateRangeText, pageWidth / 2, cursorY, {
        align: 'center',
      });
      cursorY += 10;

      // Summary info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Total Records: ${nursingData.length}`, margin, cursorY);
      cursorY += 6;

      // Tables per month
      monthKeys.forEach((monthKey) => {
        const monthData = dutiesByMonth[monthKey];

        // Check if we need a new page
        if (cursorY > pageHeight - 40) {
          doc.addPage();
          cursorY = margin + 20;
          drawHeader();
        }

        // Month header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(monthKey, margin, cursorY);
        cursorY += 5;

        const tableRows = monthData.map((item) => [
          item.date ? formatDateDMY(item.date.split('T')[0]) : 'N/A',
          capitalize(item.employeeName || ''),
          item.phone || 'N/A',
          item.messName || 'N/A',
          `${item.dutyStartTime || 'N/A'} - ${item.dutyEndTime || 'N/A'}`,
          formatDuration(item.totalDutyTime),
          `${(item.totalAmount || 0).toFixed(2)} BDT`,
          capitalize(item.status || ''),
          capitalize(item.paymentStatus || ''),
        ]);

        autoTable(doc, {
          startY: cursorY,
          head: [
            [
              'Date',
              'Nurse Name',
              'Phone',
              'Mess Name',
              'Duty Time',
              'Duration',
              'Amount',
              'Status',
              'Payment',
            ],
          ],
          body: tableRows,
          theme: 'grid',
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
            halign: 'center',
          },
          styles: {
            fontSize: 8,
            halign: 'center',
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
          },
          columnStyles: {
            6: { fontStyle: 'bold' }, // Amount column
          },
          margin: { left: margin, right: margin },
          didDrawPage: (data) => {
            drawFooter(doc.internal.getNumberOfPages());
          },
        });

        cursorY = doc.lastAutoTable.finalY + 10;
      });

      // Summary Calculations
      let total = 0,
        paid = 0,
        unpaid = 0;

      nursingData.forEach((d) => {
        total += d.totalAmount || 0;
        if (d.paymentStatus?.toLowerCase() === 'paid')
          paid += d.totalAmount || 0;
        else unpaid += d.totalAmount || 0;
      });

      // Account Summary
      if (cursorY + 40 > pageHeight) {
        doc.addPage();
        cursorY = margin + 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('ACCOUNT SUMMARY', margin, cursorY);
      cursorY += 4;

      autoTable(doc, {
        startY: cursorY,
        head: [
          [
            'Total Payable Amount',
            'Total Paid Amount',
            'Total Due/Unpaid Amount',
          ],
        ],
        body: [
          [
            `${total.toFixed(2)} BDT`,
            `${paid.toFixed(2)} BDT`,
            `${unpaid.toFixed(2)} BDT`,
          ],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
        },
        styles: {
          fontSize: 10,
          halign: 'center',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          cellPadding: 4,
        },
        margin: { left: margin, right: margin },
      });

      // Signature
      cursorY = doc.lastAutoTable.finalY + 30;
      doc.setDrawColor(0, 0, 0);
      doc.line(pageWidth - margin - 60, cursorY, pageWidth - margin, cursorY);
      doc.setFontSize(10);
      doc.text('Authorized Signature', pageWidth - margin - 30, cursorY + 5, {
        align: 'center',
      });

      // Save with appropriate filename
      const fileName = `Nursing_Duties_${format(new Date(), 'ddMMyyyy_HHmm')}.pdf`;
      doc.save(fileName);

      toast.success('PDF Downloaded Successfully!');
    } catch (err) {
      toast.error('Error generating PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [rawData, filters, formatDuration]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-6 text-blue-600 animate-spin" />
          <h2 className="mb-2 text-xs font-semibold text-gray-900">
            Please wait...
          </h2>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            Something went wrong!
          </h2>
          <p className="mb-4 text-gray-600">
            {error?.data?.message || 'Failed to fetch nursing duties'}
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 shadow-lg rounded-xl hover:bg-blue-700 hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NOTION STYLE HEADER */}
      <header className="sticky top-0 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3 max-w-screen-2xl sm:px-12">
          <div className="flex items-center gap-2 overflow-hidden">
            <BreadCrumbMenu />
          </div>
        </div>
      </header>

      {/* Header */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`sticky top-0  w-full transition-all duration-200 border-b ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-gray-200/80 shadow-sm'
            : 'bg-white border-transparent'
        }`}
      >
        <div className="relative z-10 px-6 py-6 mx-auto lg:py-10 lg:ps-12 lg:pe-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            {/* Title Section */}
            <div>
              <h1 className="flex items-center gap-3 text-xl font-bold tracking-tighter text-gray-900 md:text-2xl">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl md:w-12 md:h-12 md:rounded-2xl">
                  <Zap className="w-5 h-5 text-blue-600 md:w-7 md:h-7" />
                </div>
                Nursing&apos;s Duty Registry
              </h1>
              <p className="max-w-2xl mt-2 text-xs text-gray-500 md:mt-3">
                Monitor, track, and update nursing duty records in real-time
                with our precision-engineered monitoring suite.
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6 lg:ps-12 lg:pe-6">
        {/* Main Layout: Sidebar + Table */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filter Sidebar */}
          <NursingFilterSidebar
            filters={filters}
            setFilters={setFilters}
            statusOptions={statusOptions}
            paymentStatusOptions={paymentStatusOptions}
            monthOptions={monthOptions}
            handleClearFilters={handleClearFilters}
          />

          {/* Table Section */}
          <main className="w-full">
            {/* Action Section */}
            <div className="flex flex-wrap items-center self-start justify-between gap-2 pb-1 md:self-end">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
                {[
                  {
                    label: 'Total Duties',
                    value: stats.total,
                    icon: Calendar,
                    color: 'blue',
                  },
                  {
                    label: 'Approved Duties',
                    value: stats.approved,
                    icon: CheckCircle,
                    color: 'emerald',
                  },
                  {
                    label: 'Pending Duties',
                    value: stats.pending,
                    icon: Clock,
                    color: 'amber',
                  },
                  {
                    label: 'Paid Duties',
                    value: stats?.paid,
                    icon: DollarSign,
                    color: 'green',
                  },
                ]?.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-gray-500 capitalize">
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-gray-900">
                      {stat.value.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <select
                  // filters.limit যদি সংখ্যা হয় তবে string এ কনভার্ট করে মেলাবে, নয়তো 'all' মেলাবে
                  value={filters.limit.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters((prev) => ({
                      ...prev,
                      page: 1, // নতুন লিমিট মানেই প্রথম পেজে ফেরত যাওয়া
                      limit: val === 'all' ? 'all' : Number(val), // 'all' থাকলে string, নয়তো Number
                    }));
                  }}
                  className="text-black bg-white disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all border border-gray-300 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer"
                >
                  {[5, 10, 20, 50].map((num) => (
                    <option key={num} value={num.toString()}>
                      {num} per page
                    </option>
                  ))}
                  <option value="all">Show All</option>
                </select>
                <button
                  onClick={handleRefresh}
                  disabled={isFetching}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 group"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 transition-transform duration-500 ${
                      isFetching
                        ? 'animate-spin text-blue-500'
                        : 'group-hover:rotate-180'
                    }`}
                  />
                  <span>{isFetching ? 'Updating...' : 'Refresh'}</span>
                </button>
                <button
                  onClick={generatePDFStatement}
                  disabled={isGeneratingPDF || !rawData?.data?.length}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                  </span>
                </button>
              </div>
            </div>
            {/* Table */}
            <div className="relative overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Refetch Indicator Overlay */}
              {isFetching && !isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[12px] font-semibold text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="w-10 px-4 py-3 text-center md:px-6">#</th>
                      <th className="px-4 py-3 md:px-6">Nurse</th>
                      <th className="px-4 py-3 md:px-6">Schedule</th>
                      <th className="px-4 py-3 md:px-6">Duty Info</th>
                      <th className="px-4 py-3 md:px-6">Status</th>
                      <th className="px-4 py-3 md:px-6">Payment</th>
                      <th className="px-4 py-3 text-right md:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rawData?.data?.length > 0 ? (
                      <AnimatePresence mode="popLayout">
                        {rawData.data.map((duty, index) => (
                          <motion.tr
                            key={duty._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="transition-colors hover:bg-gray-50/80"
                          >
                            <td className="px-4 py-3 font-mono text-xs text-center text-gray-400 md:px-6 md:py-4">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 md:px-6 md:py-4">
                              <div className="font-medium text-gray-900 capitalize">
                                {duty?.employeeName || 'N/A'}
                              </div>
                              <div className="text-[12px] text-gray-500">
                                {duty?.phone || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs whitespace-nowrap md:px-6 md:py-4">
                              <div className="font-medium text-gray-700">
                                {duty?.date ? formatDateDMY(duty?.date) : 'N/A'}
                              </div>
                              <div className="text-gray-500 text-[12px]">
                                {formatTo12Hour(duty?.dutyStartTime)} -{' '}
                                {formatTo12Hour(duty?.dutyEndTime)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-medium text-gray-700 md:px-6 md:py-4">
                              {duty?.messName || 'N/A'}
                            </td>
                            <td className="px-4 py-3 md:px-6 md:py-4">
                              <span
                                className={`inline-block px-2 py-1 rounded text-[12px] font-bold capitalize border ${getStatusStyles(
                                  duty?.status,
                                )}`}
                              >
                                {duty?.status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3 md:px-6 md:py-4">
                              <div className="font-semibold text-gray-900">
                                ৳ {(duty?.totalAmount || 0).toFixed(2)}
                              </div>
                              <span
                                className={`inline-block px-2 py-0.5 text-[10px] font-medium uppercase rounded ${getPaymentStyles(
                                  duty?.paymentStatus,
                                )}`}
                              >
                                {duty?.paymentStatus || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() =>
                                  handleApprove(duty?._id, 'approve')
                                }
                                disabled={
                                  duty.status === 'approve' ||
                                  activeId === duty?._id
                                }
                                className={`text-[10px] font-bold uppercase tracking-tight text-center rounded btn btn-xs btn-success text-white ${
                                  duty.status === 'approve'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }`}
                              >
                                {activeId === duty?._id
                                  ? 'Updating...'
                                  : 'Approve'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right md:px-6 md:py-4">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => handleEditClick(duty)}
                                  className="p-1.5 text-gray-400 transition-colors rounded-md hover:text-blue-600 hover:bg-blue-50"
                                  title="Edit duty"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteNursingDuty(duty?._id)
                                  }
                                  className="p-1.5 text-gray-400 transition-colors rounded-md hover:text-red-600 hover:bg-red-50"
                                  title="Delete duty"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-12 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Search className="w-8 h-8 text-gray-300" />
                            <p>No results found for your filters.</p>
                            <button
                              onClick={handleClearFilters}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Clear all filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {rawData?.data?.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-600">
                    {/* চেক করছি limit 'all' কি না অথবা ০ কি না */}
                    {filters?.limit === 'all' || filters.limit === 0 ? (
                      <>
                        Showing all{' '}
                        <span className="font-medium">
                          {rawData.pagination.totalDocuments}
                        </span>{' '}
                        results
                      </>
                    ) : (
                      <>
                        Showing{' '}
                        <span className="font-medium">
                          {(filters.page - 1) * Number(filters.limit) + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(
                            filters.page * Number(filters.limit),
                            rawData.pagination.totalDocuments,
                          )}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">
                          {rawData.pagination.totalDocuments}
                        </span>{' '}
                        results
                      </>
                    )}
                  </span>
                </div>

                {filters?.limit !== 'all' && filters.limit !== 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className="p-1.5 border rounded-md disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs">
                      Page {filters.page} of {rawData.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page >= rawData.pagination.totalPages}
                      className="p-1.5 border rounded-md disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Update Modal */}
      <UpdateNursingDutyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDuty(null);
        }}
        dutyData={selectedDuty}
        onUpdate={handleUpdateNursingDuty}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default NursingAllDuties;

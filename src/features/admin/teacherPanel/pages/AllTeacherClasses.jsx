import React, { useState } from 'react';
// import { useGetClassesQuery, useUpdateClassMutation } from "./classApi";
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import {
  Search,
  Download,
  Edit2,
  Save,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Home,
  Calendar,
  Clock,
  Users,
  Zap,
  Trash2,
} from 'lucide-react';
import {
  useDeleteTeacherClassMutation,
  useGetTeacherClassListQuery,
  useUpdateClassMutation,
  useUpdateCourseStatusMutation,
} from '../../../../../redux/features/teacher/teacherApi';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import EditClassModal from '../components/EditClassModal';
import TeacherFilterSidebar from '../components/TeacherFilterSidebar';
import { formatDateDMY } from '../../../../../constants/dateFormat';

const AllTeacherClasses = () => {
  // States
  const [filters, setFilters] = useState({
    search: '',
    batch: [],
    status: '',
    paymentStatus: '',
    year: '',
    month: '',
    startDate: '',
    endDate: '',
    department: '',
    subject: '',
    page: 1,
    limit: 10,
  });

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);

  // RTK Query
  const { data, isLoading, isError, error, isFetching, refetch } =
    useGetTeacherClassListQuery(filters);

  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();

  const [updateCourseStatus, { isLoading: isStatusUpdating }] =
    useUpdateCourseStatusMutation();

  const [deleteTeacherClass, { isLoading: isDeletingClass }] =
    useDeleteTeacherClassMutation();

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
      let cursorY = margin;

      // --- Helper functions ---
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
        cursorY = margin + 25;
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

      const rawData = data?.data || [];
      const dutiesByMonth = {};

      rawData?.forEach((item) => {
        const key = `${item.monthName}, ${item.yearName}`;
        if (!dutiesByMonth[key]) dutiesByMonth[key] = [];
        dutiesByMonth[key].push(item);
      });

      const monthKeys = Object.keys(dutiesByMonth);

      drawHeader();

      const teacher = rawData[0]?.teacher;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Teacher Class Statement', pageWidth / 2, cursorY, {
        align: 'center',
      });
      cursorY += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      const dateRangeText =
        filters?.startDate && filters?.endDate
          ? `Date Range: ${formatDateDMY(filters?.startDate)} to ${formatDateDMY(filters?.endDate)}`
          : 'Date Range: All';

      doc.text(dateRangeText, pageWidth / 2, cursorY, {
        align: 'center',
      });

      cursorY += 10;

      // --- Main Tables per Month ---
      monthKeys.forEach((monthKey) => {
        const monthData = dutiesByMonth[monthKey];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(monthKey, margin, cursorY);
        cursorY += 3;

        const tableRows = monthData?.map((item) => [
          formatDateDMY(item.classDate)
            ? formatDateDMY(item.classDate.split('T')[0])
            : 'N/A',
          capitalize(item.teacher?.userName),
          item?.batch || 'N/A',
          item?.subject || 'N/A',
          item?.department || 'N/A',
          `${item.classTime || 'N/A'} | ${item.classQuantity} H | ${item.period || 'N/A'}`,
          `${(item.totalFee || 0).toFixed(2)} BDT`,
          capitalize(item.status),
          capitalize(item.paymentStatus),
        ]);

        autoTable(doc, {
          startY: cursorY,
          head: [
            [
              'Date',
              'Name',
              'Batch',
              'Subject',
              'Department',
              'Class Schedule',
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
            2: { cellWidth: 'auto' },
            6: { fontStyle: 'bold' },
          },
          margin: { left: margin, right: margin },
          didDrawPage: (data) => {
            drawFooter(doc.internal.getNumberOfPages());
          },
        });

        cursorY = doc.lastAutoTable.finalY + 12;
      });

      // --- Summary Calculations ---
      let total = 0,
        paid = 0,
        unpaid = 0;
      rawData.forEach((d) => {
        total += d.totalFee || 0;
        if (d.paymentStatus?.toLowerCase() === 'paid') paid += d.totalFee || 0;
        else unpaid += d.totalFee || 0;
      });

      // --- Account Summary Table (Full Width) ---
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
          fillColor: [240, 240, 240], // Light Gray Header
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
        margin: { left: margin, right: margin }, // Full Width
      });

      // --- Signature ---
      cursorY = doc.lastAutoTable.finalY + 30;
      doc.setDrawColor(0, 0, 0);
      doc.line(pageWidth - margin - 60, cursorY, pageWidth - margin, cursorY);
      doc.setFontSize(10);
      doc.text('Authorized Signature', pageWidth - margin - 30, cursorY + 5, {
        align: 'center',
      });

      doc.save(`Statement_${teacher?.userName || 'Teacher'}.pdf`);
      setIsGeneratingPDF(false);
      toast.success('PDF Downloaded Successfully!');
    } catch (err) {
      toast.error('Error generating PDF');
      setIsGeneratingPDF(false);
    }
  };

  const handleEditClick = (item) => {
    setEditFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleApprove = async (id) => {
    try {
      setActiveId(id);

      const res = await updateCourseStatus({
        classId: id,
        status: 'approve',
      }).unwrap();
      toast.success(res?.message);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message);
    } finally {
      setActiveId(null);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await updateClass({
        id: editingId,
        ...editFormData,
      }).unwrap();
      setEditingId(null);
      toast.success(res?.message || 'Updated successful!');
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed!');
    }
  };

  const handleDeleteClass = async (courseId) => {
    try {
      const res = await deleteTeacherClass({ courseId }).unwrap();
      toast.success(res?.message || 'Successfully delete class!');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete class');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="sticky top-0 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3 max-w-screen-2xl sm:px-12">
          <div className="flex items-center gap-2 overflow-hidden">
            <BreadCrumbMenu />
          </div>
        </div>
      </header>

      <div className="relative z-10 px-4 py-10 mx-auto">
        <div className="mb-12">
          <h1 className="flex items-center gap-4 text-xl font-bold tracking-tighter text-gray-900 md:text-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-2xl">
              <Zap className="text-blue-600 w-7 h-7" />
            </div>
            Teacher&apos;s Class Registry
          </h1>
          <p className="max-w-2xl mt-4 text-xs text-gray-500">
            “Monitor, track, and update teacher class records in real-time with
            our precision-engineered monitoring suite.”
          </p>
        </div>

        <div className="flex flex-col gap-3 mx-auto lg:flex-row">
          {/* --- Left Side: Filters (Sticky on Desktop) --- */}
          <TeacherFilterSidebar filters={filters} setFilters={setFilters} />

          {/* --- Right Side: Main Table Content --- */}
          <main className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h1 className="text-[12px] font-semibold text-slate-800">
                Total {data?.data?.length}{' '}
                {data?.data?.length === 1 ? 'Class' : 'Classes'} Found
              </h1>
              {/* actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0px 0px 20px rgba(45,212,191,0.35)',
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={generatePDFStatement}
                  className="group flex items-center gap-2 rounded
                bg-[#0075DE] px-6 py-2 text-[12px] font-semibold text-[#FFFFFF]
                transition-all hover:bg-[#005BAB]"
                >
                  <Download
                    size={18}
                    className="transition-transform group-hover:-translate-y-0.5"
                  />
                  {isGeneratingPDF ? 'Please wait...' : 'Save Statement'}
                </motion.button>
              </div>
            </div>
            <div className="relative overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl">
              {/* Loader Overlay */}
              {isFetching && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="text-blue-600 animate-spin" size={40} />
                    <span className="text-[12px] font-medium text-slate-600">
                      Please wait...
                    </span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b bg-slate-50/80 border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        #
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Teacher Profile
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Subject & Schedule
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Batch Info
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Finance
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-left">
                        update
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" className="py-20 text-center">
                          <Loader2
                            className="mx-auto animate-spin text-slate-300"
                            size={40}
                          />
                        </td>
                      </tr>
                    ) : isError ? (
                      <tr>
                        <td colSpan="12" className="py-20 text-center">
                          <h3 className="text-base font-semibold text-red-500">
                            {error?.data?.message || 'Internal server error!'}
                          </h3>
                        </td>
                      </tr>
                    ) : data?.data?.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="py-32 ">
                          <div className="flex flex-col items-center justify-center">
                            <Search size={32} className="mb-4" />
                            <h3 className="text-base font-semibold text-red-500">
                              No Classes Found
                            </h3>
                            <p className="text-[12px]">
                              Try adjusting your filters or search terms
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {data?.data?.map((item, i) => (
                          <motion.tr
                            key={item?._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="transition-colors group hover:bg-slate-50/50"
                          >
                            <td className="px-6 py-4 font-sans">
                              <span className="font-mono text-xs font-medium text-slate-400">
                                {i + 1}
                              </span>
                            </td>
                            {/* Teacher Profile */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center text-[12px] font-bold text-blue-700 bg-blue-100 rounded-full h-9 w-9">
                                  {item?.teacher?.userName
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-[12px] font-semibold leading-tight capitalize text-slate-900">
                                    {item?.teacher?.userName}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    ID: {item?.teacher?.userId} •{' '}
                                    {item?.teacher?.phone}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Subject & Schedule */}
                            <td className="px-6 py-4">
                              <div className="space-y-1.5">
                                <div className="text-[12px] font-semibold leading-tight text-slate-800">
                                  {item?.subject}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <Calendar size={12} /> {item?.classDate}
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <Clock size={12} /> {item?.classTime} (
                                    {item?.period}{' '}
                                    {item?.period > 1 ? 'Periods' : 'Period'})
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Batch Info */}
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                                  <Users size={12} /> {item?.batch} (
                                  {item?.batchCount}{' '}
                                  {item?.batchCount > 1 ? 'Batches' : 'Batch'})
                                </div>
                                <div className="text-[10px] text-slate-500 pl-1">
                                  {item?.department} • {item?.classQuantity}{' '}
                                  Hours
                                </div>
                              </div>
                            </td>

                            {/* Finance */}
                            <td className="px-6 py-4">
                              <div className="text-[12px] font-bold text-slate-900">
                                {item.totalFee?.toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'BDT',
                                })}
                              </div>
                              <div
                                className={`text-[10px] font-bold uppercase tracking-tight mt-0.5 ${
                                  item.paymentStatus === 'paid'
                                    ? 'text-[#558A8A]'
                                    : 'text-amber-600'
                                }`}
                              >
                                {item?.paymentStatus}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                              {editingId === item._id ? (
                                <select
                                  className="text-xs p-1.5 border border-slate-200 rounded-md bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                  value={editFormData.status}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      status: e.target.value,
                                    })
                                  }
                                >
                                  <option value="approve">Approve</option>
                                  <option value="pending">Pending</option>
                                  <option value="cancel">Cancel</option>
                                </select>
                              ) : (
                                <span
                                  className={`rounded text-[10px] font-bold uppercase tracking-wider ${
                                    item.status === 'approve'
                                      ? 'bg-emerald-50 text-[#558A8A] border border-emerald-100 btn btn-xs disabled'
                                      : 'btn btn-xs btn-soft btn-warning'
                                  }`}
                                >
                                  {item?.status === 'approve'
                                    ? 'approved'
                                    : item?.status}
                                </span>
                              )}
                            </td>

                            {/* status update */}
                            <td className="px-6 py-4">
                              <button
                                onClick={() =>
                                  handleApprove(item?._id, 'approve')
                                }
                                disabled={
                                  item.status === 'approve' ||
                                  activeId === item?._id
                                }
                                className={`text-[10px] font-bold uppercase tracking-tight text-center rounded btn btn-xs btn-success text-white ${
                                  item.status === 'approve'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }`}
                              >
                                {activeId === item?._id
                                  ? 'Updating...'
                                  : 'Approve'}
                              </button>
                            </td>
                            {/* <td className="px-6 py-4">
                              <div
                              disabled={item.status === "approve"}
                              onClick={()=>handleApprove(item?._id)}
                                className={`text-[10px] font-bold uppercase tracking-tight text-center rounded btn btn-xs btn-success text-white`}
                              >
                                {isStatusUpdating ? "Updating..." : "Approve"}
                              </div>
                            </td> */}

                            {/* Actions */}
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2 transition-opacity">
                                {editingId === item._id ? (
                                  <>
                                    <button
                                      disabled={isDeletingClass}
                                      onClick={handleUpdate}
                                      className="p-2 text-white transition-all bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
                                    >
                                      {isUpdating ? (
                                        'Updating...'
                                      ) : (
                                        <save size={16} />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className="p-2 transition-all rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditClick(item)}
                                      className="p-2 transition-all rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                    >
                                      <Edit2 size={16} />
                                    </button>{' '}
                                    |
                                    <button
                                      onClick={() =>
                                        handleDeleteClass(item?._id)
                                      }
                                      disabled={isDeletingClass}
                                      className="p-2 transition-all rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                      {isDeletingClass ? (
                                        'Deleting...'
                                      ) : (
                                        <Trash2 size={16} />
                                      )}
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>

              {/* --- Pagination Footer --- */}
              <div className="flex flex-col items-center justify-between gap-4 p-5 border-t sm:flex-row bg-slate-50/50 border-slate-200">
                <span className="text-xs font-medium text-slate-500">
                  Showing Page{' '}
                  <span className="text-slate-900">{filters?.page}</span> of{' '}
                  <span className="text-slate-900">
                    {data?.totalPages || 1}
                  </span>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={filters.page === 1}
                    onClick={() =>
                      setFilters({ ...filters, page: filters.page - 1 })
                    }
                    className="flex items-center gap-1 px-4 py-2 text-xs font-semibold transition-all bg-white border rounded-lg border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    disabled={filters?.page >= data?.totalPages}
                    onClick={() =>
                      setFilters({ ...filters, page: filters?.page + 1 })
                    }
                    className="flex items-center gap-1 px-4 py-2 text-xs font-semibold transition-all bg-white border rounded-lg border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        <EditClassModal
          isModalOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={editFormData}
          onChange={setEditFormData}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
};

export default AllTeacherClasses;

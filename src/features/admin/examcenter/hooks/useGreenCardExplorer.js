// @ts-nocheck
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';

import { useGetInstitutesQuery } from '../../../../../redux/features/institute/instituteApi';
import { useGetDepartmentsQuery } from '../../../../../redux/features/subject/subjectApi';
import {
  useCreateSingleAdmitCardMutation,
  useDeleteSingleAdmitCardMutation,
  useGetSingleAdmitCardQuery,
  useUpdateSingleAdmitGreenCardMutation,
} from '../../../../../redux/features/examCenter/examcenterApi';

import ExcelJS from 'exceljs';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

// Image processing helper (optional: can stay here or be imported)
const processImage = async (imageSrc) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      // Simple background removal (use @mediapipe/selfie_segmentation)
      const { SelfieSegmentation } =
        await import('@mediapipe/selfie_segmentation');
      const segmentation = new SelfieSegmentation({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });
      segmentation.setOptions({ modelSelection: 1 });

      segmentation.onResults((results) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'destination-atop';
        ctx.drawImage(
          results.segmentationMask,
          0,
          0,
          canvas.width,
          canvas.height,
        );
        ctx.globalCompositeOperation = 'source-atop';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
      });
      segmentation.send({ image: img });
    };
  });
};

export const useGreenCardExplorer = () => {
  // ----- AUTH -----
  const { user } = useSelector((state) => state.auth);

  // ----- QUERIES (dropdown data) -----
  const { data: institutesData } = useGetInstitutesQuery({
    page: 1,
    limit: 100,
  });
  const { data: departmentsData } = useGetDepartmentsQuery();

  // ----- LOCAL STATE -----
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [academicYear, setAcademicYear] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [range, setRange] = useState({ startId: '', endId: '' });
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });
  const [formData, setFormData] = useState({});
  const [photo, setPhoto] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState('');
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const webcamRef = useRef(null);

  // Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // ----- MUTATIONS -----
  const [createAdmitCard, { isLoading: isCreating }] =
    useCreateSingleAdmitCardMutation();
  const [deleteSingleAdmitCard, { isLoading: isDeleting }] =
    useDeleteSingleAdmitCardMutation();
  const [updateSingleAdmitGreenCard, { isLoading: isUpdating }] =
    useUpdateSingleAdmitGreenCardMutation();

  // ----- TABLE DATA QUERY -----
  const queryParams = useMemo(
    () => ({
      academicYear,
      search,
      page,
      limit,
      startId: range.startId,
      endId: range.endId,
    }),
    [academicYear, search, page, limit, range.startId, range.endId],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetSingleAdmitCardQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  // ----- DERIVED DATA -----
  const tableData = useMemo(() => response?.admitCards ?? [], [response]);
  const summary = useMemo(() => response?.summary ?? [], [response]);
  const pagination = useMemo(
    () => ({
      total: response?.meta?.totalDocuments || 0,
      currentPage: response?.meta?.currentPage || 1,
      totalPages: response?.meta?.totalPages || 1,
      hasNextPage: response?.meta?.hasNextPage || false,
      hasPrevPage: response?.meta?.hasPrevPage || false,
    }),
    [response],
  );

  // Session options for dropdown
  const currentYear = new Date().getFullYear();
  const sessionOptions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const year = currentYear - 2 + i;
        return `${year}-${year + 1}`;
      }),
    [currentYear],
  );

  // ----- NOTIFICATION HELPERS -----
  const showNotification = useCallback((type, message) => {
    setNotification({ show: true, type, message });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification({ show: false, type: '', message: '' });
  }, []);

  // ----- HANDLERS -----
  useEffect(() => {
    if (selectedCard) {
      setFormData(selectedCard);
      if (selectedCard.studentPhoto) {
        setCurrentPhotoUrl(`${SERVER}${selectedCard.studentPhoto}`);
      }
    }
  }, [selectedCard]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleRangeChange = useCallback((e) => {
    const { name, value } = e.target;
    setRange((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  }, []);

  const handleSetSession = useCallback((session) => {
    setAcademicYear(session);
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setSearch('');
    setAcademicYear('');
    setRange({ startId: '', endId: '' });
    setLimit(10);
    setPage(1);
    setSelectedIds([]);
  }, []);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (!tableData.length) return;
    setSelectedIds((prev) =>
      prev.length === tableData.length ? [] : tableData.map((d) => d._id),
    );
  }, [tableData]);

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedIds.length) {
      showNotification('error', 'Select at least one card');
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} record(s)?`)) return;
    try {
      await deleteSingleAdmitCard({ ids: selectedIds }).unwrap();
      toast.success(`${selectedIds.length} card(s) deleted`);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  }, [selectedIds, deleteSingleAdmitCard, refetch, showNotification]);

  // Export to Excel

  const handleExport = async () => {
    try {
      if (!tableData || tableData.length === 0) {
        toast.error('No data available to export');
        return;
      }

      // ১. নতুন ওয়ার্কবুক তৈরি
      const workbook = new ExcelJS.Workbook();

      const headerInfo = [
        ['RPR DUET Admission Care'],
        [
          'Our Campus: M.A. Samad Villa, In front of DUET Campus, Gazipur, Bangladesh',
        ],
        ['Phone: +880 1742-590128 | +880 1901-852989'],
        ['Email: rpr.group2013@gmail.com'],
        [''],
      ];

      const detailData = tableData.map((card, index) => ({
        '#': index + 1,
        'Student Name': card.studentName || 'N/A',
        'Student ID': card.studentId || 'N/A',
        Phone: card.studentPhone || 'N/A',
        Institute: card.polytechnicName || 'N/A',
        Department: card.department || 'N/A',
        'Exam Type': card.examType || 'N/A',
        AcademicYear: card.academicYear || 'N/A', // মূল কি (Key) ঠিক রাখা হয়েছে
        'Amount (BDT)': card.amount || 0,
        'Seller Name': card.seller?.name || 'N/A',
        'Created At': card.createdAt
          ? new Date(card.createdAt).toLocaleDateString()
          : 'N/A',
      }));

      // শিটের নাম নির্ধারণ (সামারি থাকলে 'Admit Cards', না থাকলে 'Data')
      const mainSheetName =
        summary && summary.length > 0 ? 'Admit Cards' : 'Data';
      const ws = workbook.addWorksheet(mainSheetName);

      // ২. হেডার ইনফো (A1 থেকে A5 পর্যন্ত) যোগ করা
      headerInfo.forEach((row, rowIndex) => {
        ws.addRow(row);
      });

      // হেডারগুলোর স্টাইলিং
      ws.getRow(1).font = { bold: true, size: 14, color: { argb: '003366' } };
      ws.getRow(2).font = { italic: true, size: 10, color: { argb: '555555' } };
      ws.getRow(3).font = { italic: true, size: 10, color: { argb: '555555' } };
      ws.getRow(4).font = { italic: true, size: 10, color: { argb: '555555' } };

      // ৩. টেবিলের হেডার এবং ডেটা যোগ করা (অরিজিনাল কোডের A6 অনুযায়ী)
      if (detailData.length > 0) {
        const keys = Object.keys(detailData[0]);

        // A6 এ টেবিল হেডার বসানো
        const headerRow = ws.addRow(keys);
        headerRow.font = { bold: true };

        // ডেটা রো গুলো যোগ করা
        detailData.forEach((item) => {
          ws.addRow(keys.map((key) => item[key]));
        });

        // কলাম উইডথ সেটআপ (যাতে লেখা কেটে না যায়)
        ws.columns = [
          { width: 6 }, // #
          { width: 22 }, // Student Name
          { width: 15 }, // Student ID
          { width: 15 }, // Phone
          { width: 25 }, // Institute
          { width: 15 }, // Department
          { width: 15 }, // Exam Type
          { width: 15 }, // Academic Year
          { width: 15 }, // Amount (BDT)
          { width: 20 }, // Seller Name
          { width: 15 }, // Created At
        ];
      }

      // ৪. সামারি ডেটা থাকলে দ্বিতীয় শিট তৈরি করা
      if (summary && summary.length > 0) {
        const summaryData = summary.map((s, index) => ({
          '#': index + 1,
          Session: s.session || 'N/A',
          'Total Cards': s.totalCards || 0,
          'Total Revenue (BDT)': s.totalRevenue || 0,
        }));

        const wsSummary = workbook.addWorksheet('Session Summary');
        if (summaryData.length > 0) {
          const summaryKeys = Object.keys(summaryData[0]);

          const summaryHeaderRow = wsSummary.addRow(summaryKeys);
          summaryHeaderRow.font = { bold: true };

          summaryData.forEach((item) => {
            wsSummary.addRow(summaryKeys.map((key) => item[key]));
          });

          wsSummary.columns = [
            { width: 6 }, // #
            { width: 15 }, // Session
            { width: 15 }, // Total Cards
            { width: 22 }, // Total Revenue (BDT)
          ];
        }
      }

      // ৫. ফাইল জেনারেট এবং ব্রাউজারে ডাউনলোড ট্রিগার করা
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const fileName = `Green_Card_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      window.URL.revokeObjectURL(url);

      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export Excel file');
    }
  };

  // Print handling
  const printRef = useRef();
  const handlePrintGreenCard = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Green Cards',
  });

  // Edit modal
  const handleEditClick = useCallback((card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCard(null);
  }, []);

  //green card update
  const handleUpdateCard = async (formDataToSend) => {
    if (!selectedCard?._id) return;

    try {
      const response = await updateSingleAdmitGreenCard({
        id: selectedCard._id,
        data: formDataToSend,
      }).unwrap();

      if (response.success) {
        toast.success('Updated Successfully!');
        refetch();
        closeEditModal();
        setPhoto(null);
      }
    } catch (err) {
      toast.error('Green Card Update Failed!');
    }
  };

  const setPageSafe = useCallback((p) => setPage(Math.max(1, p)), []);

  return {
    // data
    tableData,
    summary,
    pagination,
    isLoading: isLoading || isFetching,
    academicYear,
    isUpdating,

    // dropdowns
    institutesData,
    departmentsData,
    sessionOptions,
    setUseCamera,

    // user
    user,

    // search & filters
    search,
    handleChange,
    formData,
    handleSearchChange,
    handleSetSession,
    handleReset,
    range,
    handleRangeChange,

    // pagination
    limit,
    setLimit,
    page,
    setPage: setPageSafe,

    // selection
    selectedIds,
    toggleSelect,
    toggleSelectAll,

    // actions
    handleDeleteSelected,
    isDeleting,
    handleExport,
    handlePrintGreenCard,
    printRef,

    // creation
    createAdmitCard,
    isCreating,
    refetch,
    processImage,
    setPhoto,

    // edit modal
    isModalOpen,
    closeEditModal,
    selectedCard,
    handleEditClick,
    handleUpdateCard,

    // notifications
    notification,
    showNotification,
    closeNotification,

    // utils
    SERVER,
  };
};

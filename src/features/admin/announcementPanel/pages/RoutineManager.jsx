import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Trash2,
  Plus,
  Edit2,
  Check,
  X,
  Search,
  ChevronDown,
  Loader2,
  LayoutDashboard,
  Table as TableIcon,
  FileText,
  ChevronRight,
  Printer,
  User,
  Eye,
} from 'lucide-react';

// Redux APIs
import {
  useAddRoutineMutation,
  useDeleteRoutineMutation,
  useDuplicateRoutinesMutation,
  useGetRoutinesQuery,
  useUpdateRoutineMutation,
} from '../../../../../redux/features/routine/routineApi';
import { useGetBatchesQuery } from '../../../../../redux/features/batch/batchApi';
import { useGetSubjectsQuery } from '../../../../../redux/features/subject/subjectApi';
import { useGetOnlyTeachersQuery } from '../../../../../redux/features/users/userApi';
import routineImg from '../../../../../assets/img/rpr_class_routine-removebg-preview.png';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import watermark from '../../../../../../src/assets/img/log-rpr.png';

const RoutineManager = () => {
  //  STATE MANAGEMENT
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [originalRowData, setOriginalRowData] = useState({});

  // Pagination states
  const [visibleCount, setVisibleCount] = useState(7);
  const itemsPerPage = 7;

  const isLandscape = true;

  // UI States
  const [viewMode, setViewMode] = useState('live'); // live | pdf
  const [copyAdmitCount, setAdmitCopyCount] = useState(1);

  // Dropdown states
  const [showBatchDrop, setShowBatchDrop] = useState(false);
  const [showSubDrop, setShowSubDrop] = useState(false);
  const [showEditBatchDrop, setShowEditBatchDrop] = useState(false);
  const [showEditSubDrop, setShowEditSubDrop] = useState(false);
  const [showEditTeacherDrop, setShowEditTeacherDrop] = useState(false);
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);

  // Search states for dropdowns
  const [batchSearch, setBatchSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [teacherQuery, setTeacherQuery] = useState('');
  const [editBatchSearch, setEditBatchSearch] = useState('');
  const [editSubjectSearch, setEditSubjectSearch] = useState('');
  const [editTeacherSearch, setEditTeacherSearch] = useState('');

  // Form state (matches backend schema)
  const [formData, setFormData] = useState({
    batch: '',
    session: '',
    date: '',
    time: '',
    subjects: [],
    room: '',
    teachers: [],
    visibility: ['teacher'],
    publishStatus: 'draft',
  });

  // Selected teacher for display
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  //  REFS
  const componentRef = useRef(null);
  const batchRef = useRef(null);
  const teacherDropdownRef = useRef(null);
  const subRef = useRef(null);
  const dateFilterRef = useRef(null);
  const editBatchRef = useRef(null);
  const editSubRef = useRef(null);
  const editTeacherRef = useRef(null);

  // ==================== CONSTANTS ====================
  const currentYear = new Date().getFullYear();
  const currentSession = `${currentYear}-${currentYear + 1}`;
  const sessionOptions = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear - 2 + i;
    return `${year}-${year + 1}`;
  });

  // Visibility options (matches schema: array of strings)
  const visibilityOptions = [
    { value: 'teacher', label: 'Teacher', icon: User },
    { value: 'student', label: 'Student', icon: Eye },
    { value: 'both', label: 'Both', icon: Eye },
  ];

  // Publish status options
  const publishStatusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
  ];

  const getDayName = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const toTitleCase = (str) =>
    str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  // ==================== RTK QUERY HOOKS ====================
  const {
    data: routinesResponse,
    isLoading: isRoutinesLoading,
    refetch,
  } = useGetRoutinesQuery({
    batch: searchTerm,
    startDate,
    endDate,
  });

  const { data: batchesData } = useGetBatchesQuery('');
  const { data: subjectsData } = useGetSubjectsQuery();
  const { data: teachersData, isLoading: isTeachersLoading } =
    useGetOnlyTeachersQuery(teacherQuery, {
      refetchOnMountOrArgChange: true,
    });

  // Mutations
  const [addRoutine, { isLoading: isAdding }] = useAddRoutineMutation();
  const [deleteRoutine, { isLoading: isDeletingRoutine }] =
    useDeleteRoutineMutation();
  const [updateRoutine, { isLoading: isUpdating }] = useUpdateRoutineMutation();
  const [duplicateRoutines, { isLoading: isDuplicating }] =
    useDuplicateRoutinesMutation();

  // ==================== MEMOIZED DATA ====================
  const routines = useMemo(
    () => routinesResponse?.data || [],
    [routinesResponse],
  );
  const batches = useMemo(() => batchesData?.data || [], [batchesData]);
  const teachers = useMemo(() => teachersData?.data || [], [teachersData]);
  const subjects = useMemo(() => {
    const data = subjectsData?.data || [];
    return data.flatMap((sub) => (sub.options ? sub.options : sub));
  }, [subjectsData]);

  const visibleRoutines = useMemo(() => {
    return routines?.slice(0, visibleCount);
  }, [routines, visibleCount]);

  const batchName = searchTerm || 'Search Batch';

  // Filter teachers based on search query for create form
  const filteredTeachers = useMemo(() => {
    if (!teacherQuery) return teachers;
    return teachers?.filter((teacher) =>
      teacher.userName?.toLowerCase().includes(teacherQuery.toLowerCase()),
    );
  }, [teachers, teacherQuery]);

  // FIXED: Filter teachers for edit form - added missing return statement
  const filteredEditTeachers = useMemo(() => {
    if (!editTeacherSearch) return teachers;
    return teachers?.filter((teacher) =>
      teacher.userName?.toLowerCase().includes(editTeacherSearch.toLowerCase()),
    );
  }, [teachers, editTeacherSearch]);

  // Check if all filtered routines are selected
  const isAllFilteredSelected = useMemo(() => {
    if (visibleRoutines?.length === 0) return false;
    return visibleRoutines.every((routine) =>
      selectedIds.includes(routine._id),
    );
  }, [visibleRoutines, selectedIds]);

  // ==================== HANDLERS ====================
  // Master checkbox handler
  const handleMasterCheckboxChange = useCallback(() => {
    if (selectedIds.length === visibleRoutines?.length) {
      setSelectedIds([]);
    } else {
      const allIds = visibleRoutines?.map((routine) => routine._id);
      setSelectedIds(allIds);
    }
  }, [selectedIds.length, visibleRoutines]);

  // Individual checkbox handler
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // View more/less handlers
  const handleViewMore = () => {
    setVisibleCount((prev) => {
      const newCount = prev + itemsPerPage;
      return newCount > routines.length ? routines?.length : newCount;
    });
  };

  const handleViewLess = () => {
    setVisibleCount(itemsPerPage);
  };

  // Time formatter (converts 24h to 12h format)
  const handleTimeChange = (e) => {
    const time24 = e.target.value;
    if (!time24) return;

    let [h, m] = time24.split(':');
    h = Number(h);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const time12 = `${h}:${m} ${ampm}`;

    setFormData({
      ...formData,
      time: time12,
    });
  };

  const to24h = (time12 = '') => {
    const match = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return '';
    let h = parseInt(match[1], 10);
    const m = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  const handleEditTimeChange = (e) => {
    const time24 = e.target.value;
    if (!time24) return;

    let [h, m] = time24.split(':');
    h = Number(h);

    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;

    const time12 = `${h}:${m} ${ampm}`;

    setEditRowData((prev) => ({
      ...prev,
      time: time12,
    }));
  };

  // Subject handler for create form
  const handleAddSubject = (sub) => {
    if (!formData.subjects.includes(sub)) {
      setFormData({ ...formData, subjects: [...formData.subjects, sub] });
    }
    setSubjectSearch('');
    setShowSubDrop(false);
  };

  // Remove subject from create form
  const handleRemoveSubject = (subToRemove) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((s) => s !== subToRemove),
    });
  };

  const handleRemoveTeacher = (id) => {
    setFormData((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== id),
    }));
  };

  // Subject handler for edit form
  const handleAddEditSubject = (sub) => {
    if (!editRowData.subjects?.includes(sub)) {
      setEditRowData({
        ...editRowData,
        subjects: [...(editRowData.subjects || []), sub],
      });
    }
    setEditSubjectSearch('');
    setShowEditSubDrop(false);
  };

  // Remove subject from edit form
  const handleRemoveEditSubject = (subToRemove) => {
    setEditRowData({
      ...editRowData,
      subjects: editRowData?.subjects?.filter((s) => s !== subToRemove) || [],
    });
  };

  // Teacher selection for create form
  const handleTeacherSelect = (teacher) => {
    if (!teacher) return;

    setFormData((prev) => {
      const exists = prev.teachers?.find((t) => t.id === teacher.userId);

      if (exists) return prev;

      return {
        ...prev,
        teachers: [
          ...prev.teachers,
          {
            id: teacher.userId,
            name: teacher.userName,
            phone: teacher.phone,
          },
        ],
      };
    });

    setTeacherQuery('');
    setIsTeacherDropdownOpen(false);
  };
  // Teacher selection for edit form - FIXED: Added proper state updates
  const handleEditTeacherSelect = (teacher) => {
    setEditRowData({
      ...editRowData,
      teacher: {
        id: teacher?.userId || '',
        name: teacher?.userName || '',
        phone: teacher?.phone || '',
      },
    });
    setShowEditTeacherDrop(false);
    setEditTeacherSearch('');
  };

  // Visibility handler for create form (array)
  const handleVisibilityChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      visibility: [value], // Store as array as per schema
    });
  };

  // Visibility handler for edit form (array)
  const handleEditVisibilityChange = (e) => {
    const value = e.target.value;
    setEditRowData({
      ...editRowData,
      visibility: [value],
    });
  };

  // Create routine submit handler
  const handleCreateRoutine = async () => {
    if (!formData.batch || !formData.date) {
      return toast.error('Please fill required fields (Batch and Date)');
    }

    if (!formData?.teachers || formData?.teachers?.length === 0) {
      return toast.error('Please select at least one teacher');
    }

    try {
      await addRoutine(formData).unwrap();
      toast.success('Routine created successfully');

      // Reset form
      setFormData({
        batch: '',
        session: currentSession,
        date: '',
        time: '',
        subjects: [],
        room: '',
        teachers: [],
        visibility: ['teacher'],
        publishStatus: 'draft',
      });
      setTeacherQuery('');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create routine');
    }
  };

  // Update routine handler
  const handleUpdateSubmit = async (id) => {
    try {
      const changedData = {};

      // Compare edit data with original data
      Object.keys(editRowData).forEach((key) => {
        if (
          JSON.stringify(editRowData[key]) !==
          JSON.stringify(originalRowData[key])
        ) {
          changedData[key] = editRowData[key];
        }
      });

      if (Object.keys(changedData)?.length === 0) {
        toast.error('No changes detected');
        return;
      }

      await updateRoutine({ id, data: changedData }).unwrap();
      setEditingId(null);
      setShowEditBatchDrop(false);
      setShowEditSubDrop(false);
      setShowEditTeacherDrop(false);
      toast.success('Routine updated successfully');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  // Delete handler (single or multiple)
  const handleDelete = async (id = null) => {
    try {
      const ids = id || selectedIds;

      if (!ids || (Array.isArray(ids) && ids.length === 0)) {
        return toast.error('Please select routine(s) to delete');
      }

      const confirmMessage = id
        ? 'Are you sure you want to delete this routine?'
        : `Are you sure you want to delete ${selectedIds.length} routine(s)?`;

      if (!window.confirm(confirmMessage)) return;

      await deleteRoutine(ids).unwrap();
      toast.success('Routine(s) deleted successfully');
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  // Duplicate routines handler
  const handleDuplicate = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select routines first');
      return;
    }

    try {
      const res = await duplicateRoutines({ ids: selectedIds }).unwrap();
      toast.success(`${res.insertedCount} routines duplicated successfully!`);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  // Date formatter for PDF view
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  // Clear date filters
  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    setShowDateFilter(false);
  };

  // Apply date filters
  const applyDateFilters = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }
    setShowDateFilter(false);
    toast.success('Date filter applied');
  };

  // PDF download
  const downloadPDF = () => {
    window.print();
    // content: () => componentRef.current,
    `${batchName}_Routine`;
  };

  // Outside click handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (batchRef.current && !batchRef.current.contains(e.target)) {
        setShowBatchDrop(false);
      }
      if (subRef.current && !subRef.current.contains(e.target)) {
        setShowSubDrop(false);
      }
      if (dateFilterRef.current && !dateFilterRef.current.contains(e.target)) {
        setShowDateFilter(false);
      }
      if (editBatchRef.current && !editBatchRef.current.contains(e.target)) {
        setShowEditBatchDrop(false);
      }
      if (editSubRef.current && !editSubRef.current.contains(e.target)) {
        setShowEditSubDrop(false);
      }
      if (
        editTeacherRef.current &&
        !editTeacherRef.current.contains(e.target)
      ) {
        setShowEditTeacherDrop(false);
      }
      if (
        teacherDropdownRef.current &&
        !teacherDropdownRef.current.contains(e.target)
      ) {
        setIsTeacherDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(itemsPerPage);
    setSelectedIds([]);
  }, [searchTerm, startDate, endDate]);

  // Get visibility display text
  const getVisibilityDisplay = (visibility) => {
    if (!visibility || !Array.isArray(visibility)) return 'N/A';
    if (visibility.includes('teacher') && visibility.includes('student')) {
      return 'Both';
    }
    if (visibility.includes('teacher')) return 'Teacher';
    if (visibility.includes('student')) return 'Student';
    return visibility[0] || 'N/A';
  };

  // Get visibility badge color
  const getVisibilityColor = (visibility) => {
    if (!visibility || !Array.isArray(visibility))
      return 'bg-gray-100 text-gray-600';
    if (visibility.includes('teacher') && visibility.includes('student')) {
      return 'bg-purple-100 text-purple-600';
    }
    if (visibility.includes('teacher')) {
      return 'bg-blue-100 text-blue-600';
    }
    if (visibility.includes('student')) {
      return 'bg-green-100 text-green-600';
    }
    return 'bg-gray-100 text-gray-600';
  };

  // Get publish status badge color
  const getPublishStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-600';
      case 'draft':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const groupByRoomAndTime = (routines) => {
    const map = {};

    routines.forEach((r) => {
      const key = `${r.room}_${r.time}`;

      if (!map[key]) {
        map[key] = {
          room: r.room || '—',
          time: r.time || '—',
          batch: new Set(),
          subjects: new Set(),
          teachers: new Set(),
        };
      }

      map[key].batch.add(r.batch || '—');

      (r.subjects || []).forEach((s) => map[key].subjects.add(s));

      (r.teachers || []).forEach((t) =>
        map[key].teachers.add(toTitleCase(t.name || '')),
      );
    });

    return Object.values(map).map((item) => ({
      room: item.room,
      time: item.time,
      batch: Array.from(item.batch).join(' / '),
      subjects: Array.from(item.subjects),
      teachers: Array.from(item.teachers),
    }));
  };

  // GROUP SAME ROOM + TIME
  const groupData = (routines) => {
    const map = {};

    routines.forEach((r) => {
      const key = `${r.room}_${r.time}`;

      if (!map[key]) {
        map[key] = {
          room: r.room || '—',
          time: r.time || '—',
          batch: new Set(),
          subjects: [],
          teachers: [],
        };
      }

      map[key].batch.add(r.batch || '—');

      (r.subjects || []).forEach((s) => {
        if (!map[key].subjects.includes(s)) {
          map[key].subjects.push(s);
        }
      });

      (r.teachers || []).forEach((t) => {
        const name = toTitleCase(t.name || '');
        if (!map[key].teachers.includes(name)) {
          map[key].teachers.push(name);
        }
      });
    });

    return Object.values(map).map((item) => ({
      room: item.room,
      time: item.time,
      batch: Array.from(item.batch).join(' / '),
      subjects: item.subjects,
      teachers: item.teachers,
    }));
  };

  const generateRoutinePDF = (routines, filename) => {
    if (!routines || routines.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const PAGE_W = 210;
    const PAGE_H = 297;
    const MARGIN = 10;
    const CONTENT_W = PAGE_W - MARGIN * 2; // 190mm

    const ROWS_PER_PAGE = 20;
    const TABLE_START_Y = 38;
    const TABLE_END_Y = PAGE_H - MARGIN; // 287mm
    const AVAILABLE_H = TABLE_END_Y - TABLE_START_Y; // 249mm

    // 1 header + 20 body rows = 21 rows total
    const ROW_H = AVAILABLE_H / (ROWS_PER_PAGE + 1); // ~11.86mm
    const HEAD_H = ROW_H;

    // Column widths (must sum to CONTENT_W = 190)
    const COLS = [
      { label: '#', w: 10, align: 'center' },
      { label: 'Room', w: 15, align: 'center' },
      { label: 'Time', w: 18, align: 'center' },
      { label: 'Batch', w: 22, align: 'center' },
      { label: 'Subjects', w: 75, align: 'left' },
      { label: 'Teachers', w: 55, align: 'left' },
    ];

    // ── Helpers ─────────────────────────────────────────────────────────────────

    // x positions of each column
    const colX = (idx) => {
      let x = MARGIN;
      for (let i = 0; i < idx; i++) x += COLS[i].w;
      return x;
    };

    // Draw a single cell (border + clipped text)
    const drawCell = (x, y, w, h, text, align, bold = false, fontSize = 9) => {
      // Border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(x, y, w, h);

      // Text
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(0, 0, 0);

      const padding = 2;
      const textW = w - padding * 2;
      const textX = align === 'center' ? x + w / 2 : x + padding;
      const textY = align === 'center' ? y + h / 2 : x + padding; // vertical centre

      doc.text(String(text ?? ''), textX, textY, {
        align,
        maxWidth: textW,
      });
    };

    // Draw subject/teacher cell with internal sub-row dividers
    const drawMultiCell = (x, y, w, h, lines) => {
      // Outer border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(x, y, w, h);

      const count = lines.length;
      const eachH = h / count;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      lines.forEach((text, i) => {
        const subY = y + eachH * i;
        const textY = subY + eachH / 2;

        doc.text(String(text ?? ''), x + 2, textY, { maxWidth: w - 4 });

        // Inner divider (not after last item)
        if (i < count - 1) {
          doc.setLineWidth(0.1);
          doc.line(x, subY + eachH, x + w, subY + eachH);
        }
      });
    };

    // Draw page header (title + day + date)
    const drawPageHeader = (date) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('RPR DUET Admission Care', PAGE_W / 2, 18, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Day: ${getDayName(date)}`, PAGE_W / 2, 25, { align: 'center' });
      doc.text(`Date: ${formatDate(date)}`, PAGE_W / 2, 31, {
        align: 'center',
      });
    };

    // Draw the table header row
    const drawTableHeader = () => {
      const y = TABLE_START_Y;
      COLS.forEach((col, ci) => {
        drawCell(colX(ci), y, col.w, HEAD_H, col.label, 'center', true, 9);
      });
    };

    // Draw one body row
    const drawBodyRow = (rowData, rowIndex) => {
      const y = TABLE_START_Y + HEAD_H + rowIndex * ROW_H;

      COLS.forEach((col, ci) => {
        const val = rowData[ci];

        if ((ci === 4 || ci === 5) && Array.isArray(val)) {
          drawMultiCell(colX(ci), y, col.w, ROW_H, val);
        } else {
          drawCell(colX(ci), y, col.w, ROW_H, val, col.align, false, 9);
        }
      });
    };

    // ── Watermark ────────────────────────────────────────────────────────────────
    const drawWatermark = () => {
      if (typeof watermark !== 'undefined' && watermark.includes('base64')) {
        doc.addImage(
          watermark,
          'PNG',
          PAGE_W / 2 - 45,
          PAGE_H / 2 - 45,
          90,
          90,
          '',
          'FAST',
        );
      }
    };

    // ── Group & sort data ────────────────────────────────────────────────────────
    const grouped = routines.reduce((acc, r) => {
      const key = r.date || 'unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    }, {});

    const dates = Object.keys(grouped).sort();
    let isFirstPage = true;

    // ── Main render loop ─────────────────────────────────────────────────────────
    dates.forEach((date) => {
      let data =
        typeof groupData === 'function'
          ? groupData(grouped[date])
          : grouped[date];

      data.sort((a, b) => {
        const tA = parseTime(a.time);
        const tB = parseTime(b.time);
        if (tA !== tB) return tA - tB;
        return (parseInt(a.room) || 0) - (parseInt(b.room) || 0);
      });

      // Chunk into pages of 20
      const chunks = [];
      for (let i = 0; i < data.length; i += ROWS_PER_PAGE) {
        chunks.push(data.slice(i, i + ROWS_PER_PAGE));
      }

      chunks.forEach((chunk, chunkIdx) => {
        if (!isFirstPage) doc.addPage();
        isFirstPage = false;

        drawWatermark();
        drawPageHeader(date);
        drawTableHeader();

        const serialOffset = chunkIdx * ROWS_PER_PAGE;

        chunk.forEach((r, i) => {
          const rowData = [
            serialOffset + i + 1,
            r.room,
            r.time,
            r.batch,
            Array.isArray(r.subjects) ? r.subjects : [r.subjects ?? ''],
            Array.isArray(r.teachers) ? r.teachers : [r.teachers ?? ''],
          ];
          drawBodyRow(rowData, i);
        });

        // Fill remaining empty rows to keep the table full-page
        for (let i = chunk.length; i < ROWS_PER_PAGE; i++) {
          drawBodyRow(['', '', '', '', [''], ['']], i);
        }
      });
    });

    const today = new Date().toISOString().slice(0, 10);
    doc.save(filename || `Routine_${today}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 ">
      <div className="">
        {/* HEADER SECTION */}
        <header className="px-4 pb-5 mb-8 border-b md:py-8">
          <nav className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-1.5 transition-colors hover:text-blue-600 cursor-pointer">
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </div>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-semibold text-slate-900">Routine</span>
          </nav>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Routine Management
              </h1>
              <p className="max-w-xl text-[14px] font-semibold leading-relaxed text-slate-500">
                &quot;Manage your class routines efficiently with real-time
                updates and easy scheduling.&quot;
              </p>
            </div>
          </div>
        </header>
        {/* View Toggle */}
        <div className="flex p-1 mx-4 bg-white border border-b shadow-sm rounded-md border-slate-200 w-fit">
          <button
            onClick={() => setViewMode('live')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
              viewMode === 'live'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <TableIcon size={16} /> Live Manager
          </button>
          <button
            onClick={() => setViewMode('pdf')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
              viewMode === 'pdf'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText size={16} /> Print Preview
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 px-4 lg:grid-cols-12 md:py-4">
          {/*  LEFT: CREATE FORM  */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky p-6 bg-white border shadow-sm rounded-md border-slate-200 top-8"
            >
              <h2 className="flex items-center gap-2 mb-6 text-xl font-bold">
                <Plus className="text-blue-600" /> Create Routine
              </h2>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                {/* Batch Dropdown */}
                <div className="relative" ref={batchRef}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => setShowBatchDrop(!showBatchDrop)}
                    className="flex items-center justify-between px-4 py-3 transition-all border cursor-pointer bg-slate-50 border-slate-200 rounded-md hover:border-blue-400"
                  >
                    <span className="text-sm font-medium">
                      {formData?.batch || 'Select Batch'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${showBatchDrop ? 'rotate-180' : ''}`}
                    />
                  </div>

                  <AnimatePresence>
                    {showBatchDrop && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute z-50 w-full mt-2 overflow-hidden bg-white border shadow-xl border-slate-200 rounded-md"
                      >
                        <div className="p-2 border-b bg-slate-50">
                          <input
                            type="text"
                            placeholder="Search batch..."
                            className="w-full px-3 py-2 text-xs border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            value={batchSearch}
                            onChange={(e) => setBatchSearch(e.target.value)}
                          />
                        </div>
                        <div className="overflow-y-auto max-h-48">
                          {batches
                            ?.filter((b) =>
                              b.title
                                ?.toLowerCase()
                                .includes(batchSearch.toLowerCase()),
                            )
                            ?.map((b) => (
                              <div
                                key={b._id}
                                onClick={() => {
                                  setFormData({ ...formData, batch: b.title });
                                  setShowBatchDrop(false);
                                  setBatchSearch('');
                                }}
                                className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm font-medium transition-colors"
                              >
                                {b.title}
                              </div>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Session Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Session
                  </label>
                  <select
                    value={formData.session || currentSession}
                    onChange={(e) =>
                      setFormData({ ...formData, session: e.target.value })
                    }
                    className="w-full px-4 py-3 text-sm border outline-none bg-slate-50 border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {sessionOptions?.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Teacher Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Teacher
                  </label>
                  <div className="relative" ref={teacherDropdownRef}>
                    <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search teacher..."
                      value={teacherQuery}
                      onFocus={() => setIsTeacherDropdownOpen(true)}
                      onChange={(e) => setTeacherQuery(e.target.value)}
                      className="w-full py-3 pr-4 text-sm transition-all border outline-none rounded-md border-slate-200 bg-slate-50 pl-9 focus:ring-2 focus:ring-blue-500"
                    />

                    <AnimatePresence>
                      {isTeacherDropdownOpen && (
                        <motion.ul
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full p-1 mt-2 overflow-auto bg-white border rounded-md shadow-lg max-h-60 border-slate-200"
                        >
                          {filteredTeachers?.length > 0 ? (
                            filteredTeachers?.map((teacher) => (
                              <li
                                key={teacher?.userId}
                                onClick={() => handleTeacherSelect(teacher)}
                                className="flex items-center gap-3 px-3 py-2 text-sm capitalize rounded-sm cursor-pointer hover:bg-blue-50"
                              >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold capitalize text-blue-600">
                                  {teacher.userName?.charAt(0) || '?'}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium">
                                    {teacher.userName}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {teacher.phone}
                                  </span>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="px-3 py-2 text-sm text-slate-500">
                              No teachers found
                            </li>
                          )}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                  {formData?.teachers?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData?.teachers?.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="flex items-center gap-2 px-3 py-1 border border-blue-200 rounded-md bg-blue-50"
                        >
                          <span className="text-xs font-semibold text-blue-800">
                            {teacher.name}
                          </span>
                          <X
                            size={12}
                            className="text-blue-600 cursor-pointer hover:text-red-500"
                            onClick={() => handleRemoveTeacher(teacher?.id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={handleTimeChange}
                    />
                  </div>
                </div>

                {/* Subjects */}
                <div className="relative" ref={subRef}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                    Subjects
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-3 text-slate-300"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Add subjects..."
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      value={subjectSearch}
                      onFocus={() => setShowSubDrop(true)}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData?.subjects?.map((s) => (
                      <span
                        key={s}
                        className="bg-slate-900 text-white px-2 py-1 rounded-md text-[10px] flex items-center gap-1 font-bold uppercase"
                      >
                        {s}
                        <X
                          size={10}
                          className="cursor-pointer hover:text-red-300"
                          onClick={() => handleRemoveSubject(s)}
                        />
                      </span>
                    ))}
                  </div>

                  <AnimatePresence>
                    {showSubDrop && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute z-50 w-full mt-2 overflow-y-auto bg-white border shadow-xl border-slate-200 rounded-md max-h-40"
                      >
                        {subjects
                          .filter((s) =>
                            s
                              .toLowerCase()
                              .includes(subjectSearch.toLowerCase()),
                          )
                          .map((s) => (
                            <div
                              key={s}
                              onClick={() => handleAddSubject(s)}
                              className="px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-blue-50"
                            >
                              {s}
                            </div>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Room */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Room No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 101"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                  />
                </div>

                {/* Visibility */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Visible To
                  </label>
                  <select
                    value={formData.visibility[0] || 'teacher'}
                    onChange={handleVisibilityChange}
                    className="w-full px-4 py-3 text-sm border outline-none bg-slate-50 border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {visibilityOptions?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Publish Status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Publish Status
                  </label>
                  <select
                    value={formData.publishStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publishStatus: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 text-sm border outline-none bg-slate-50 border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {publishStatusOptions?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleCreateRoutine}
                  disabled={isAdding}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-md shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 uppercase text-[11px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      <Plus size={16} /> Publish Routine
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/*  RIGHT: TABLE VIEW  */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
              {/* Table Toolbar */}
              <div className="flex flex-col items-center justify-between gap-4 p-6 border-b border-slate-100 bg-slate-50/30 md:flex-row">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative w-full md:w-72">
                    <Search
                      className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search by batch..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Date Range Filter */}
                  <div className="relative" ref={dateFilterRef}>
                    <button
                      onClick={() => setShowDateFilter(!showDateFilter)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-all"
                    >
                      <Calendar size={16} />
                      Date Range
                      {(startDate || endDate) && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                      )}
                    </button>

                    <AnimatePresence>
                      {showDateFilter && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute z-50 w-64 p-4 mt-2 bg-white border shadow-xl md:right-0 left-50 border-slate-200 rounded-md"
                        >
                          <div className="mb-4 space-y-2">
                            <div>
                              <label className="block mb-1 text-xs font-medium text-slate-500">
                                Start Date
                              </label>
                              <input
                                type="date"
                                className="w-full px-3 py-2 text-sm border rounded-md outline-none border-slate-200 focus:ring-2 focus:ring-blue-500"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block mb-1 text-xs font-medium text-slate-500">
                                End Date
                              </label>
                              <input
                                type="date"
                                className="w-full px-3 py-2 text-sm border rounded-md outline-none border-slate-200 focus:ring-2 focus:ring-blue-500"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={clearDateFilters}
                              className="flex-1 px-3 py-2 text-sm font-medium rounded-md text-slate-600 bg-slate-100 hover:bg-slate-200"
                            >
                              Clear
                            </button>
                            <button
                              onClick={applyDateFilters}
                              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                              Apply
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bulk Actions */}
                  {viewMode === 'live' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDuplicate}
                        disabled={selectedIds?.length === 0 || isDuplicating}
                        className="px-4 py-2.5 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        {isDuplicating ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          'Duplicate Selected'
                        )}
                      </button>
                      <button
                        disabled={isDeletingRoutine || selectedIds.length === 0}
                        onClick={() => handleDelete()}
                        className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        {isDeletingRoutine ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <Trash2 size={16} />
                            Delete ({selectedIds.length})
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <button onClick={() => generateRoutinePDF(routines)}>
                    Download PDF
                  </button>
                </div>

                {/* Print Controls */}
                {viewMode === 'pdf' && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md border-slate-200">
                      <label className="text-sm font-medium text-slate-600">
                        Copies:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={copyAdmitCount}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value >= 1 && value <= 50) {
                            setAdmitCopyCount(value);
                          }
                        }}
                        className="w-16 px-2 py-1 text-sm border rounded-md outline-none border-slate-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={downloadPDF}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-md text-sm font-bold hover:bg-slate-800 transition-all shadow-md"
                    >
                      <Printer size={16} /> Print Routine
                    </button>
                  </div>
                )}
              </div>

              {/* Table Content */}
              <div className="flex-1 overflow-x-auto">
                <AnimatePresence mode="wait">
                  {viewMode === 'live' ? (
                    <div className="w-full">
                      {isRoutinesLoading ? (
                        <div className="flex items-center justify-center py-20">
                          <Loader2
                            size={40}
                            className="text-blue-600 animate-spin"
                          />
                        </div>
                      ) : (
                        <>
                          {/* Table */}
                          <div className="overflow-hidden bg-white">
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead className="border-b bg-slate-50/50 border-slate-200">
                                  <tr className="font-medium text-slate-500">
                                    <th className="h-12 px-2 text-left align-middle w-[50px]">
                                      <input
                                        type="checkbox"
                                        checked={isAllFilteredSelected}
                                        onChange={handleMasterCheckboxChange}
                                        className="w-4 h-4 rounded cursor-pointer border-slate-300 accent-blue-600"
                                      />
                                    </th>
                                    <th className="h-12 px-4 font-medium text-left align-middle">
                                      Batch
                                    </th>
                                    <th className="h-12 px-4 font-medium text-left align-middle">
                                      Session
                                    </th>
                                    <th className="h-12 px-4 font-medium text-left align-middle">
                                      Teacher
                                    </th>
                                    <th className="h-12 px-4 font-medium text-left align-middle">
                                      Schedule
                                    </th>
                                    <th className="hidden h-12 px-4 font-medium text-left align-middle md:table-cell">
                                      Subjects
                                    </th>
                                    <th className="h-12 px-4 font-medium text-left align-middle">
                                      Room
                                    </th>
                                    <th className="h-12 px-4 font-medium text-left align-middle">
                                      Sent To
                                    </th>
                                    <th className="h-12 px-4 font-medium text-left align-middle">
                                      Status
                                    </th>
                                    <th className="h-12 px-4 font-medium text-right align-middle">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                  <AnimatePresence mode="popLayout">
                                    {visibleRoutines?.map((item) => (
                                      <motion.tr
                                        layout
                                        key={item._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`group transition-colors hover:bg-slate-50/50 ${
                                          editingId === item._id
                                            ? 'bg-blue-50/40'
                                            : ''
                                        }`}
                                      >
                                        {/* Checkbox */}
                                        <td className="p-2 align-middle">
                                          <input
                                            type="checkbox"
                                            checked={selectedIds.includes(
                                              item._id,
                                            )}
                                            onChange={() =>
                                              handleCheckboxChange(item._id)
                                            }
                                            className="w-4 h-4 rounded cursor-pointer border-slate-300 accent-blue-600"
                                          />
                                        </td>

                                        {/* Batch */}
                                        <td className="p-2 align-middle">
                                          {editingId === item._id ? (
                                            <div
                                              className="relative"
                                              ref={editBatchRef}
                                            >
                                              <div
                                                onClick={() =>
                                                  setShowEditBatchDrop(
                                                    !showEditBatchDrop,
                                                  )
                                                }
                                                className="flex items-center justify-between px-3 py-2 text-xs transition-all bg-white border rounded-md cursor-pointer border-slate-200 hover:border-blue-400"
                                              >
                                                <span>
                                                  {editRowData?.batch ||
                                                    'Select Batch'}
                                                </span>
                                                <ChevronDown
                                                  size={14}
                                                  className={`transition-transform ${showEditBatchDrop ? 'rotate-180' : ''}`}
                                                />
                                              </div>

                                              <AnimatePresence>
                                                {showEditBatchDrop && (
                                                  <motion.div
                                                    initial={{
                                                      opacity: 0,
                                                      y: 10,
                                                    }}
                                                    animate={{
                                                      opacity: 1,
                                                      y: 0,
                                                    }}
                                                    exit={{ opacity: 0 }}
                                                    className="relative z-20 w-full mt-1 overflow-hidden bg-white border rounded-md shadow-lg border-slate-200"
                                                  >
                                                    <div className="p-1 border-b bg-slate-50">
                                                      <input
                                                        type="text"
                                                        placeholder="Search batch..."
                                                        className="w-full px-2 py-1 text-[11px] border rounded outline-none focus:ring-1 focus:ring-blue-500"
                                                        value={editBatchSearch}
                                                        onChange={(e) =>
                                                          setEditBatchSearch(
                                                            e.target.value,
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                    <div className="overflow-y-hidden max-h-32">
                                                      {batches
                                                        ?.filter((b) =>
                                                          b.title
                                                            ?.toLowerCase()
                                                            .includes(
                                                              editBatchSearch.toLowerCase(),
                                                            ),
                                                        )
                                                        ?.map((b) => (
                                                          <div
                                                            key={b._id}
                                                            onClick={() => {
                                                              setEditRowData({
                                                                ...editRowData,
                                                                batch: b.title,
                                                              });
                                                              setShowEditBatchDrop(
                                                                false,
                                                              );
                                                              setEditBatchSearch(
                                                                '',
                                                              );
                                                            }}
                                                            className="px-3 py-1.5 text-[11px] hover:bg-blue-50 cursor-pointer"
                                                          >
                                                            {b.title}
                                                          </div>
                                                        ))}
                                                    </div>
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>
                                            </div>
                                          ) : (
                                            <div className="inline-flex items-center rounded-full text-left text-[11px] font-bold text-blue-600">
                                              {item?.batch}
                                            </div>
                                          )}
                                        </td>

                                        {/* Session */}
                                        <td className="p-4 align-middle">
                                          {editingId === item._id ? (
                                            <select
                                              value={
                                                editRowData?.session ||
                                                currentSession
                                              }
                                              onChange={(e) =>
                                                setEditRowData({
                                                  ...editRowData,
                                                  session: e.target.value,
                                                })
                                              }
                                              className="w-full h-8 px-2 text-[11px] bg-white border rounded-md outline-none border-slate-200 focus:ring-2 focus:ring-blue-500"
                                            >
                                              {sessionOptions?.map((s) => (
                                                <option key={s} value={s}>
                                                  {s}
                                                </option>
                                              ))}
                                            </select>
                                          ) : (
                                            <div className="inline-flex items-center rounded-full  text-[11px] font-bold text-blue-600">
                                              {item?.session || 'N/A'}
                                            </div>
                                          )}
                                        </td>

                                        {/* Teacher */}
                                        <td className="p-2 align-middle">
                                          {editingId === item._id ? (
                                            <div
                                              className="space-y-2"
                                              ref={editTeacherRef}
                                            >
                                              {/* ===== Selected Teacher Badges ===== */}
                                              {editRowData?.teachers?.length >
                                                0 && (
                                                <div className="flex flex-wrap gap-2 p-2">
                                                  {editRowData?.teachers?.map(
                                                    (teacher) => (
                                                      <span
                                                        key={teacher?.id}
                                                        className="flex items-center gap-1 px-2 py-1 text-[12px] font-medium bg-white rounded-md border-slate-200"
                                                      >
                                                        {teacher?.name}

                                                        <X
                                                          size={12}
                                                          className="cursor-pointer text-slate-500 hover:text-red-500"
                                                          onClick={() =>
                                                            setEditRowData(
                                                              (prev) => ({
                                                                ...prev,
                                                                teachers:
                                                                  prev.teachers.filter(
                                                                    (t) =>
                                                                      t.id !==
                                                                      teacher.id,
                                                                  ),
                                                              }),
                                                            )
                                                          }
                                                        />
                                                      </span>
                                                    ),
                                                  )}
                                                </div>
                                              )}

                                              {/* ===== Dropdown Select ===== */}
                                              <div className="relative">
                                                <div
                                                  onClick={() =>
                                                    setShowEditTeacherDrop(
                                                      !showEditTeacherDrop,
                                                    )
                                                  }
                                                  className="flex items-center justify-between px-3 py-2 text-[11px] transition-all bg-white border rounded-md cursor-pointer border-slate-200 hover:border-blue-400"
                                                >
                                                  <span>Select Teacher</span>

                                                  <ChevronDown
                                                    size={14}
                                                    className={`transition-transform ${
                                                      showEditTeacherDrop
                                                        ? 'rotate-180'
                                                        : ''
                                                    }`}
                                                  />
                                                </div>

                                                <AnimatePresence>
                                                  {showEditTeacherDrop && (
                                                    <motion.div
                                                      initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                      }}
                                                      animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                      }}
                                                      exit={{ opacity: 0 }}
                                                      className="relative z-20 w-full mt-1 overflow-hidden bg-white border rounded-md shadow-lg border-slate-200"
                                                    >
                                                      <div className="p-1 border-b bg-slate-50">
                                                        <input
                                                          type="text"
                                                          placeholder="Search teacher..."
                                                          className="w-full px-2 py-1 text-[11px] border rounded outline-none focus:ring-1 focus:ring-blue-500"
                                                          value={teacherQuery}
                                                          onChange={(e) =>
                                                            setTeacherQuery(
                                                              e.target.value,
                                                            )
                                                          }
                                                        />
                                                      </div>

                                                      <div className="overflow-y-auto max-h-32">
                                                        {filteredEditTeachers?.map(
                                                          (teacher) => (
                                                            <div
                                                              key={teacher._id}
                                                              onClick={() => {
                                                                setEditRowData(
                                                                  (prev) => {
                                                                    const exists =
                                                                      prev.teachers?.find(
                                                                        (t) =>
                                                                          t.id ===
                                                                          teacher.userId,
                                                                      );

                                                                    if (exists)
                                                                      return prev;

                                                                    return {
                                                                      ...prev,
                                                                      teachers:
                                                                        [
                                                                          ...(prev.teachers ||
                                                                            []),
                                                                          {
                                                                            id: teacher.userId,
                                                                            name: teacher.userName,
                                                                            phone:
                                                                              teacher.phone,
                                                                          },
                                                                        ],
                                                                    };
                                                                  },
                                                                );

                                                                setShowEditTeacherDrop(
                                                                  false,
                                                                );
                                                                setEditTeacherSearch(
                                                                  '',
                                                                );
                                                              }}
                                                              className="px-3 py-1.5 text-[11px] flex items-center gap-2 hover:bg-blue-50 cursor-pointer"
                                                            >
                                                              <div>
                                                                <span className="text-xs font-medium">
                                                                  {
                                                                    teacher.userName
                                                                  }
                                                                </span>
                                                                <p className="text-[8px] text-slate-500">
                                                                  {
                                                                    teacher.phone
                                                                  }
                                                                </p>
                                                              </div>
                                                            </div>
                                                          ),
                                                        )}
                                                      </div>
                                                    </motion.div>
                                                  )}
                                                </AnimatePresence>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex flex-wrap gap-2">
                                              {item?.teachers?.map((tc) => (
                                                <div
                                                  key={tc.id}
                                                  className="flex items-center gap-2 capitalize"
                                                >
                                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
                                                    {tc?.name?.charAt(0) || '?'}
                                                  </div>

                                                  <span className="text-[11px] font-medium">
                                                    {tc?.name || 'N/A'}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </td>
                                        {/* Schedule */}
                                        <td className="p-2 align-middle">
                                          {editingId === item._id ? (
                                            <div className="flex flex-col gap-1.5">
                                              <input
                                                type="date"
                                                value={editRowData.date || ''}
                                                onChange={(e) =>
                                                  setEditRowData({
                                                    ...editRowData,
                                                    date: e.target.value,
                                                  })
                                                }
                                                className="h-8 rounded-md border border-slate-200 px-2 text-[11px] outline-none focus:ring-1 focus:ring-blue-500"
                                              />
                                              <input
                                                type="time"
                                                value={
                                                  to24h(editRowData?.time) || ''
                                                }
                                                onChange={handleEditTimeChange}
                                                className="h-8 rounded-md border border-slate-200 px-2 text-[11px] outline-none focus:ring-1 focus:ring-blue-500"
                                              />
                                            </div>
                                          ) : (
                                            <div className="space-y-1">
                                              <p className="text-[11px] font-semibold text-slate-700">
                                                {item.date}
                                              </p>
                                              <div className="flex items-center gap-1.5 text-slate-400">
                                                <Clock size={12} />
                                                <span className="text-[11px] font-medium">
                                                  {item.time}
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </td>

                                        {/* Subjects */}
                                        <td className="hidden p-2 align-middle md:table-cell">
                                          {editingId === item._id ? (
                                            <div className="space-y-2">
                                              <div
                                                className="relative"
                                                ref={editSubRef}
                                              >
                                                <div className="relative">
                                                  <Search
                                                    className="absolute left-2 top-2 text-slate-300"
                                                    size={12}
                                                  />
                                                  <input
                                                    type="text"
                                                    placeholder="Add subjects..."
                                                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={editSubjectSearch}
                                                    onFocus={() =>
                                                      setShowEditSubDrop(true)
                                                    }
                                                    onChange={(e) =>
                                                      setEditSubjectSearch(
                                                        e.target.value,
                                                      )
                                                    }
                                                  />
                                                </div>

                                                <AnimatePresence>
                                                  {showEditSubDrop && (
                                                    <motion.div
                                                      initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                      }}
                                                      animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                      }}
                                                      exit={{ opacity: 0 }}
                                                      className="absolute z-50 w-full mt-1 overflow-y-auto bg-white border rounded-md shadow-lg border-slate-200 max-h-32"
                                                    >
                                                      {subjects
                                                        .filter((s) =>
                                                          s
                                                            .toLowerCase()
                                                            .includes(
                                                              editSubjectSearch.toLowerCase(),
                                                            ),
                                                        )
                                                        .map((s) => (
                                                          <div
                                                            key={s}
                                                            onClick={() =>
                                                              handleAddEditSubject(
                                                                s,
                                                              )
                                                            }
                                                            className="px-3 py-1.5 text-xs cursor-pointer hover:bg-blue-50"
                                                          >
                                                            {s}
                                                          </div>
                                                        ))}
                                                    </motion.div>
                                                  )}
                                                </AnimatePresence>
                                              </div>

                                              <div className="flex flex-wrap gap-1">
                                                {editRowData?.subjects?.map(
                                                  (s) => (
                                                    <span
                                                      key={s}
                                                      className="bg-slate-900 text-white px-1.5 py-0.5 rounded text-[8px] flex items-center gap-1 font-bold uppercase"
                                                    >
                                                      {s}
                                                      <X
                                                        size={8}
                                                        className="cursor-pointer hover:text-red-300"
                                                        onClick={() =>
                                                          handleRemoveEditSubject(
                                                            s,
                                                          )
                                                        }
                                                      />
                                                    </span>
                                                  ),
                                                )}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                              {item?.subjects?.map((s) => (
                                                <span
                                                  key={s}
                                                  className="rounded-md border border-slate-100 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase"
                                                >
                                                  {s}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </td>

                                        {/* Room */}
                                        <td className="p-2 align-middle">
                                          {editingId === item._id ? (
                                            <input
                                              type="text"
                                              value={editRowData.room || ''}
                                              onChange={(e) =>
                                                setEditRowData({
                                                  ...editRowData,
                                                  room: e.target.value,
                                                })
                                              }
                                              className="w-16 h-8 px-2 text-xs border rounded-md outline-none border-slate-200 focus:ring-1 focus:ring-blue-500"
                                            />
                                          ) : (
                                            <span className="px-2 py-1 font-sans text-xs font-bold rounded text-slate-600 bg-slate-100">
                                              {item?.room}
                                            </span>
                                          )}
                                        </td>

                                        {/* Visibility */}
                                        <td className="p-2 align-middle">
                                          {editingId === item._id ? (
                                            <select
                                              value={
                                                editRowData?.visibility?.[0] ||
                                                'teacher'
                                              }
                                              onChange={
                                                handleEditVisibilityChange
                                              }
                                              className="w-full h-8 px-2 text-xs bg-white border rounded-md outline-none border-slate-200 focus:ring-2 focus:ring-blue-500"
                                            >
                                              {visibilityOptions?.map(
                                                (option) => (
                                                  <option
                                                    key={option.value}
                                                    value={option.value}
                                                  >
                                                    {option.label}
                                                  </option>
                                                ),
                                              )}
                                            </select>
                                          ) : (
                                            <div
                                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getVisibilityColor(
                                                item?.visibility,
                                              )}`}
                                            >
                                              {item?.visibility?.includes(
                                                'teacher',
                                              ) && <User size={10} />}
                                              {item?.visibility?.includes(
                                                'student',
                                              ) && <Eye size={10} />}
                                              {getVisibilityDisplay(
                                                item?.visibility,
                                              )}
                                            </div>
                                          )}
                                        </td>

                                        {/* Publish Status */}
                                        <td className="p-2 align-middle">
                                          {editingId === item._id ? (
                                            <select
                                              value={
                                                editRowData?.publishStatus ||
                                                'draft'
                                              }
                                              onChange={(e) =>
                                                setEditRowData({
                                                  ...editRowData,
                                                  publishStatus: e.target.value,
                                                })
                                              }
                                              className="w-full h-8 px-2 text-xs bg-white border rounded-md outline-none border-slate-200 focus:ring-2 focus:ring-blue-500"
                                            >
                                              {publishStatusOptions?.map(
                                                (option) => (
                                                  <option
                                                    key={option.value}
                                                    value={option.value}
                                                  >
                                                    {option.label}
                                                  </option>
                                                ),
                                              )}
                                            </select>
                                          ) : (
                                            <div
                                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getPublishStatusColor(
                                                item?.publishStatus,
                                              )}`}
                                            >
                                              {item?.publishStatus || 'N/A'}
                                            </div>
                                          )}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-2 text-right align-middle">
                                          <div className="flex items-center justify-end gap-2">
                                            {editingId === item._id ? (
                                              <>
                                                <button
                                                  onClick={() =>
                                                    handleUpdateSubmit(item._id)
                                                  }
                                                  disabled={isUpdating}
                                                  className="inline-flex items-center justify-center w-8 h-8 text-white transition-all rounded-md shadow-sm bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
                                                >
                                                  {isUpdating ? (
                                                    <Loader2
                                                      size={14}
                                                      className="animate-spin"
                                                    />
                                                  ) : (
                                                    <Check size={14} />
                                                  )}
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setEditingId(null);
                                                    setShowEditBatchDrop(false);
                                                    setShowEditSubDrop(false);
                                                    setShowEditTeacherDrop(
                                                      false,
                                                    );
                                                  }}
                                                  className="inline-flex items-center justify-center w-8 h-8 bg-white border rounded-md border-slate-200 text-slate-600 hover:bg-slate-50"
                                                >
                                                  <X size={14} />
                                                </button>
                                              </>
                                            ) : (
                                              <>
                                                <button
                                                  onClick={() => {
                                                    setEditingId(item._id);
                                                    setEditRowData({
                                                      ...item,
                                                      subjects:
                                                        item.subjects || [],
                                                    });
                                                    setOriginalRowData(item);
                                                  }}
                                                  className="inline-flex items-center justify-center w-8 h-8 transition-colors rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                                >
                                                  <Edit2 size={14} />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    handleDelete(item._id)
                                                  }
                                                  className="inline-flex items-center justify-center w-8 h-8 transition-colors rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                >
                                                  <Trash2 size={14} />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </td>
                                      </motion.tr>
                                    ))}
                                  </AnimatePresence>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Pagination */}
                          {visibleRoutines?.length > 0 && (
                            <div className="flex flex-col items-center justify-between gap-4 p-4 border-t sm:flex-row border-slate-100">
                              <p className="text-xs font-medium text-slate-500">
                                Showing{' '}
                                <span className="font-bold text-slate-900">
                                  {visibleRoutines?.length}
                                </span>{' '}
                                of{' '}
                                <span className="font-bold text-slate-900">
                                  {routines?.length}
                                </span>{' '}
                                routines
                                {(startDate || endDate) && (
                                  <span className="ml-2 text-blue-600">
                                    (Filtered)
                                  </span>
                                )}
                              </p>

                              <div className="flex items-center gap-2">
                                {visibleCount < routines?.length && (
                                  <button
                                    onClick={handleViewMore}
                                    className="px-4 py-2 text-xs font-medium text-white transition-all rounded-md bg-slate-900 hover:bg-slate-800"
                                  >
                                    Load More (+
                                    {Math.min(
                                      itemsPerPage,
                                      routines.length - visibleCount,
                                    )}
                                    )
                                  </button>
                                )}
                                {visibleCount > itemsPerPage && (
                                  <button
                                    onClick={handleViewLess}
                                    className="px-4 py-2 text-xs font-medium transition-all bg-white border rounded-md text-slate-600 border-slate-200 hover:bg-slate-50"
                                  >
                                    Show Less
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Empty State */}
                          {visibleRoutines?.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                              <Search size={40} className="mb-4 opacity-20" />
                              <p className="text-sm italic">
                                No schedules found matching your criteria.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    /* PDF View */
                    <div>
                      <div id="print-area">
                        <motion.div
                          ref={componentRef}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-white mx-auto"
                        >
                          <div className="print-pages">
                            {Array.from(
                              { length: Math.ceil(copyAdmitCount / 8) },
                              (_, pageIndex) => {
                                const startIndex = pageIndex * 8;
                                const endIndex = Math.min(
                                  startIndex + 8,
                                  copyAdmitCount,
                                );

                                return (
                                  <div key={pageIndex} className="print-page">
                                    <div className="print-grid grid grid-cols-4 gap-3 justify-center items-center p-2">
                                      {Array.from(
                                        { length: endIndex - startIndex },
                                        (_, cardIndex) => {
                                          const idx = startIndex + cardIndex;

                                          return (
                                            <div
                                              key={idx}
                                              className="admit-card border-2 border-black bg-white "
                                            >
                                              <div>
                                                <div className="flex flex-col items-center mb-1">
                                                  <img
                                                    src={routineImg}
                                                    alt="logo"
                                                    className="object-contain h-7"
                                                  />

                                                  <h2 className="text-xs font-bold capitalize mt-0.5">
                                                    Batch: {batchName}
                                                  </h2>
                                                </div>

                                                <table className="w-full text-center border-collapse">
                                                  <thead>
                                                    <tr className="text-white bg-gray-800">
                                                      <th className="text-[10px] border border-black py-0.5 px-1 text-center">
                                                        Date
                                                      </th>

                                                      <th className="text-[10px] border border-black py-0.5 px-1 text-center">
                                                        Time
                                                      </th>

                                                      <th className="text-[10px] border border-black py-0.5 px-1 text-center">
                                                        Subject
                                                      </th>

                                                      <th className="text-[10px] border border-black py-0.5 px-1 text-center">
                                                        Room
                                                      </th>
                                                    </tr>
                                                  </thead>

                                                  <tbody>
                                                    {routines
                                                      ?.slice(0, 7)
                                                      .map((row, i) => (
                                                        <tr key={i}>
                                                          <td className="border-t border-r border-black text-[10px] py-0.5 px-1 text-center align-middle">
                                                            {formatDate(
                                                              row.date,
                                                            )}
                                                          </td>

                                                          <td className="border-t border-r border-black text-[10px] py-0.5 px-1 text-center align-middle">
                                                            {row.time}
                                                          </td>

                                                          <td className="border-t border-black text-[9.5px] text-center align-middle">
                                                            {row.subjects?.map(
                                                              (sub, j) => (
                                                                <div
                                                                  key={j}
                                                                  className={`text-center ${
                                                                    j > 0
                                                                      ? 'border-t border-black pt-0.5 mt-0.5'
                                                                      : ''
                                                                  }`}
                                                                >
                                                                  {sub}
                                                                </div>
                                                              ),
                                                            )}
                                                          </td>

                                                          <td className="border-t border-l border-black text-[9px] py-0.5 px-1 text-center align-middle">
                                                            {row.room}
                                                          </td>
                                                        </tr>
                                                      ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          );
                                        },
                                      )}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </motion.div>
                      </div>

                      <style>{`
  @media print {

    /* ==============================
       A4 LANDSCAPE
       ============================== */

    @page {
      size: A4 landscape;
      margin: 0;
    }


    /* ==============================
       HIDE EVERYTHING
       ============================== */

    body * {
      visibility: hidden;
    }

    #print-area,
    #print-area * {
      visibility: visible;
    }


    /* ==============================
       PRINT AREA

       IMPORTANT:
       NO position:absolute
       ============================== */

    #print-area {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;

      background: white !important;
    }


    /* ==============================
       OUTER PAGES
       ============================== */

    .print-pages {
      width: 100%;
      margin: 0;
      padding: 0;
    }


    /* ==============================
       EACH PHYSICAL A4 PAGE
       ============================== */

    .print-page {
      width: 297mm;
      height: 210mm;

      box-sizing: border-box;

      padding: 5mm;

      margin: 0 auto;

      display: flex;
      align-items: center;
      justify-content: center;

      overflow: hidden;

      break-after: page;
      page-break-after: always;
    }


    /* ==============================
       LAST PAGE
       ============================== */

    .print-page:last-child {
      break-after: auto;
      page-break-after: auto;
    }


    /* ==============================
       4 × 2
       ============================== */

    .print-grid {
      width: 100%;
      display: grid;
      grid-template-columns:
        repeat(4, minmax(0, 1fr));
      grid-template-rows:
        repeat(2, auto);
      column-gap: 4mm;
      row-gap: 5mm;
      align-items: center;
      justify-items: stretch;
    }


    /* ==============================
       CARD
       ============================== */

    .admit-card {
      width: 100%;

      box-sizing: border-box;

      break-inside: avoid;
      page-break-inside: avoid;

      background: white;
    }


    /* ==============================
       TABLE
       ============================== */

    .admit-card table {
      width: 100%;
      border-collapse: collapse;
    }
  }
`}</style>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineManager;

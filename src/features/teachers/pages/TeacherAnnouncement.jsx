import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetBatchesQuery } from '../../../../redux/features/batch/batchApi';
import {
  useDeleteTeacherAnnouncementMutation,
  useGetTeacherAllAnnouncementsQuery,
  usePostTeacherAnnouncementMutation,
  useUpdateTeacherAnnouncementMutation,
} from '../../../../redux/features/teacher/teacherApi';
import { useGetOnlyTeachersQuery } from '../../../../redux/features/users/userApi';
import toast from 'react-hot-toast';
import {
  Plus,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Bell,
  Megaphone,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Clock,
  Users,
  BookOpen,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

// Subject options constant
const SUBJECT_OPTIONS = [
  {
    label: 'Mathematics',
    options: [
      'Algebra (Mathematics)',
      'Trigonometry (Mathematics)',
      'Co-ordinate Geometry (Mathematics)',
      'Differential / Integral Calculus (Mathematics)',
      'Matrix (Mathematics)',
    ],
  },
  {
    label: 'Physics',
    options: [
      'Physical Part (Physics)',
      'Sound (Physics)',
      'Light (Physics)',
      'Heat (Physics)',
      'Atomic Physics (Physics)',
      'Modern Physics (Physics)',
    ],
  },
  {
    label: 'Chemistry',
    options: [
      'Physical Part (Chemistry)',
      'Math Part (Chemistry)',
      'Metal Part (Chemistry)',
      'Organic Part (Chemistry)',
    ],
  },
  {
    label: 'English',
    options: ['English'],
  },
  {
    label: 'ARCH',
    options: [
      'Theory (ARCH)',
      'Basic Drawing (ARCH)',
      'Analytical Drawing (ARCH)',
      'Composition of Forms 1 (ARCH)',
      'Composition of Forms 2 (ARCH)',
      'Human Figure (ARCH)',
      'Perspective (ARCH)',
      'History of Architecture (ARCH)',
      'Construction Process (ARCH)',
      'Estimating & Costing (ARCH)',
      'Surveying (ARCH)',
    ],
  },
  {
    label: 'CE',
    options: [
      'Engineering Materials (CE)',
      'Surveying (CE)',
      'Structural Mechanics (CE)',
      'Strength of Materials (CE)',
      'Hydraulics (CE)',
      'Soil Mechanics (CE)',
      'Reinforced Cement Concrete (CE)',
      'Design of Structure (CE)',
      'Transportation Engineering (CE)',
      'Estimating and Construction Process (CE)',
      'Geotechnical Engineering (CE)',
    ],
  },
  {
    label: 'EEE',
    options: [
      'DC Circuits (EEE)',
      'Electronics (EEE)',
      'AC Circuits (EEE)',
      'AC Machine (EEE)',
      'DC Machine (EEE)',
      'Power System (EEE)',
      'Telecommunication (EEE)',
      'Digital Electronics (EEE)',
    ],
  },
  {
    label: 'ME',
    options: [
      'Engineering Mechanics (ME)',
      'Strength of Materials (ME)',
      'Thermodynamics and Heat Engine (ME)',
      'Hydraulics / Fluid Mechanics and Fluid Machineries (ME)',
      'Basic Electricity and Electronics (ME)',
      'Engineering Drawing (ME)',
      'Theory Part (ME)',
    ],
  },
  {
    label: 'CSE',
    options: [
      'Computer Fundamentals (CSE)',
      'Basic Programming (CSE)',
      'Object Oriented Programming(C++/Phython) (CSE)',
      'Discrete Mathematics (CSE)',
      'Data Structure (CSE)',
      'Database Management (CSE)',
      'Software Development (CSE)',
      'Operating System (CSE)',
      'Microprocessor & Microcomputer (CSE)',
      'Data Communication & Computer Network (CSE)',
      'Computer Graphics (CSE)',
      'Digital Electronics (CSE)',
    ],
  },
  {
    label: 'TE',
    options: [
      'Introduction to Textile Engineering (TE)',
      'Textile Fibres (TE)',
      'Yarn Manufacturing Technology (TE)',
      'Processing Stages of Yarn Manufacturing (TE)',
      'Jute Technology (TE)',
      'Fabric Manufacturing Technology (TE)',
      'Wet Processing Technology (TE)',
      'Garments Manufacturing Technology (TE)',
      'Pattern Making & Garments Design (TE)',
      'Textile Testing (TE)',
      'Fabric Structure and Clothing Analysis (TE)',
      'Engineering Drawing (TE)',
    ],
  },
  {
    label: 'CHE',
    options: [
      'Basic Stoichiometry (ChE)',
      'Unit Operation (ChE)',
      'Energy (ChE)',
      'Chemical Process Industries and Safety (ChE)',
      'Engineering Mechanics (ChE)',
      'Industrial Management (ChE)',
      'Basic Electricity and Electronics (ChE)',
      'Basics of Computer and Programming (ChE)',
    ],
  },
  {
    label: 'FE',
    options: [
      'Food Engineering and Technology (FE)',
      'Food Packaging and Preservation (FE)',
      'Food Chemistry and Nutrition (FE)',
      'Food Microbiology (FE)',
      'Food Safety (FE)',
      'Electrical and Electronic Engineering Fundamentals (FE)',
    ],
  },
];

const TeacherAnnouncement = () => {
  // State management
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [expiringData, setExpiringData] = useState([]);

  // Teacher selection states
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [teacherQuery, setTeacherQuery] = useState('');
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const teacherDropdownRef = useRef(null);

  // Batch selection states
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [batchQuery, setBatchQuery] = useState('');
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
  const batchDropdownRef = useRef(null);

  // Batch filter states
  const [filterBatchQuery, setFilterBatchQuery] = useState('');
  const [isFilterBatchDropdownOpen, setIsFilterBatchDropdownOpen] =
    useState(false);
  const filterBatchDropdownRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    teacher: { id: '', name: '', phone: '' },
    title: '',
    batch: '',
    type: '',
    date: '',
    time: '',
    subject: '',
    roomNumber: '',
    content: '',
  });

  // Constants
  const ANNOUNCEMENT_TYPES = ['class', 'exam', 'event', 'other'];

  // Data fetching
  const { data: teachersData, isLoading: isTeachersLoading } =
    useGetOnlyTeachersQuery({
      search: searchTerm,
    });

  const { data: batches } = useGetBatchesQuery({ search: searchTerm });

  const {
    data = {},
    refetch,
    isLoading: announcementsLoading,
  } = useGetTeacherAllAnnouncementsQuery({
    search: searchTerm,
    page,
    limit,
    date: filterDate || undefined,
    batch: filterBatch || undefined,
  });

  useEffect(() => {
    const fetchUpcomingDeletes = async () => {
      try {
        const res = await axios.get(
          `${SERVER}/api/teacher/announcement/upcoming-delete`,
        );
        setExpiringData(res.data.data || []);
      } catch (error) {
        toast.error(error.data?.message || 'Something went wrong! Try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingDeletes();
  }, []);

  const pagination = data?.pagination || {};
  const allAnnouncements = data?.data || [];

  // Mutations
  const [postTeacherAnnouncement] = usePostTeacherAnnouncementMutation();
  const [updateTeacherAnnouncement] = useUpdateTeacherAnnouncementMutation();
  const [deleteTeacherAnnouncement] = useDeleteTeacherAnnouncementMutation();

  // Memoized data
  const teachers = useMemo(
    () => teachersData?.data || [],
    [teachersData?.data],
  );

  const allBatches = useMemo(() => batches?.data || [], [batches]);

  // Helper functions
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      class: 'bg-blue-50 text-blue-700 border-blue-200',
      exam: 'bg-amber-50 text-amber-700 border-amber-200',
      event: 'bg-purple-50 text-purple-700 border-purple-200',
      other: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[type] || colors.other;
  };

  const getTypeIcon = (type) => {
    const icons = {
      class: BookOpen,
      exam: AlertCircle,
      event: Calendar,
      other: Megaphone,
    };
    return icons[type] || Megaphone;
  };

  // Handlers
  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    setTeacherQuery(teacher?.userName);
    setIsTeacherDropdownOpen(false);

    setFormData((prev) => ({
      ...prev,
      teacher: {
        id: teacher._id || '',
        name: teacher.userName || '',
        phone: teacher.phone || '',
      },
    }));
  };

  const handleBatchSelect = (batchTitle) => {
    setFormData((prev) => ({ ...prev, batch: batchTitle }));
    setBatchQuery(batchTitle);
    setIsBatchDropdownOpen(false);
  };

  const handleFilterBatchSelect = (batchTitle) => {
    setFilterBatch(batchTitle);
    setFilterBatchQuery(batchTitle);
    setIsFilterBatchDropdownOpen(false);
    setPage(1);
  };

  // Filter teachers based on search query
  useEffect(() => {
    if (teacherQuery) {
      const filtered = teachers?.filter((teacher) =>
        teacher.userName.toLowerCase().includes(teacherQuery.toLowerCase()),
      );
      setFilteredTeachers(filtered);
    } else {
      setFilteredTeachers(teachers);
    }
  }, [teacherQuery, teachers]);

  // Filter batches for form
  useEffect(() => {
    if (batchQuery) {
      const filtered = allBatches?.filter((batch) =>
        batch.title.toLowerCase().includes(batchQuery.toLowerCase()),
      );
      setFilteredBatches(filtered);
    } else {
      setFilteredBatches(allBatches);
    }
  }, [batchQuery, allBatches]);

  // Filter batches for filter section
  useEffect(() => {
    if (filterBatchQuery) {
      const filtered = allBatches?.filter((batch) =>
        batch.title.toLowerCase().includes(filterBatchQuery.toLowerCase()),
      );
      setFilteredBatches(filtered);
    } else {
      setFilteredBatches(allBatches);
    }
  }, [filterBatchQuery, allBatches]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        teacherDropdownRef.current &&
        !teacherDropdownRef.current.contains(event.target)
      ) {
        setIsTeacherDropdownOpen(false);
      }
      if (
        batchDropdownRef.current &&
        !batchDropdownRef.current.contains(event.target)
      ) {
        setIsBatchDropdownOpen(false);
      }
      if (
        filterBatchDropdownRef.current &&
        !filterBatchDropdownRef.current.contains(event.target)
      ) {
        setIsFilterBatchDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    try {
      const dateOnly = formData.date ? formData.date.split('T')[0] : '';
      const dataToSend = {
        ...formData,
        date: dateOnly,
        teacherId: formData.teacher.id,
        teacherName: formData.teacher.name,
        phone: formData.teacher.phone,
      };

      if (editingId) {
        await updateTeacherAnnouncement({
          id: editingId,
          updatedData: dataToSend,
        }).unwrap();
      } else {
        await postTeacherAnnouncement(dataToSend).unwrap();
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      refetch();
      setViewMode('list');
      resetForm();
    } catch (error) {
      if (error?.data?.errors) {
        setErrors(error.data.errors);
      } else {
        toast.error(error?.data?.message || 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      teacher: { id: '', name: '', phone: '' },
      title: '',
      batch: '',
      type: '',
      date: '',
      time: '',
      subject: '',
      roomNumber: '',
      content: '',
    });
    setSelectedTeacher(null);
    setTeacherQuery('');
    setBatchQuery('');
    setEditingId(null);
  };

  const handleEditClick = (announcement) => {
    const dateForInput = announcement.date ? `${announcement.date}T00:00` : '';
    setFormData({
      ...announcement,
      date: dateForInput,
      teacher: {
        id: announcement.teacher?._id || announcement.teacher?.id || '',
        name: announcement.teacher?.name || '',
        phone: announcement.teacher?.phone || '',
      },
    });
    setSelectedTeacher(announcement.teacher);
    setTeacherQuery(announcement.teacher?.name || '');
    setBatchQuery(announcement.batch || '');
    setEditingId(announcement._id);
    setViewMode('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteTeacherAnnouncement(id).unwrap();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        refetch();
      } catch (error) {
        toast.error('Failed to delete announcement');
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBatch('');
    setFilterDate('');
    setFilterBatchQuery('');
    setPage(1);
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleNextPage = () => {
    if (page < pagination?.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages || 1;

    pages.push(1);

    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);

    if (startPage > 2) {
      pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
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
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  // Stats data
  const statsData = [
    {
      label: 'Total Announcements',
      value: pagination.total || 0,
      icon: Bell,
      color: 'blue',
    },
    {
      label: 'Active Teachers',
      value: teachers.length,
      icon: Users,
      color: 'green',
    },
    {
      label: 'Upcoming Deletions',
      value: expiringData.length,
      icon: AlertCircle,
      color: 'amber',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.3 }}
            className="fixed z-50 flex items-center px-6 py-4 text-green-800 bg-white border border-green-200 shadow-2xl top-6 right-6 rounded-2xl backdrop-blur-sm"
          >
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
              <div>
                <p className="text-sm font-medium">Success!</p>
                <p className="text-xs text-green-600">
                  Operation completed successfully
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                className="ml-4 text-green-400 hover:text-green-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-8 bg-white/80 backdrop-blur-sm"
      >
        <div className="px-4 py-6 max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <Megaphone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">
                    Teacher Announcements
                  </h1>
                  <p className="text-xs text-slate-600">
                    Manage and publish important announcements for students
                  </p>
                </div>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setViewMode('form')}
            className="inline-flex items-center gap-2 px-6 py-3 mt-5 font-semibold text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
          >
            <Plus className="w-5 h-5" />
            New Announcement
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Stats Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                className="p-6 transition-shadow duration-200 bg-white border shadow-sm rounded-2xl border-slate-200/60 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-800">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters and Upcoming Deletions */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Filters */}
            <motion.div
              variants={cardVariants}
              className="p-6 bg-white border shadow-sm lg:col-span-2 rounded-2xl border-slate-200/60"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Filters
                </h3>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-red-600 transition-colors duration-200 hover:text-red-700"
                >
                  Clear filters
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Batch Filter */}
                <div>
                  <label
                    htmlFor="filter-batch"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Batch
                  </label>
                  <div className="relative" ref={filterBatchDropdownRef}>
                    <div className="w-full px-3 flex items-center py-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200">
                      <Search className="w-4 h-4 mr-2 text-gray-400" />
                      <input
                        id="filter-batch"
                        type="text"
                        value={filterBatchQuery}
                        onChange={(e) => {
                          setFilterBatchQuery(e.target.value);
                          setIsFilterBatchDropdownOpen(true);
                        }}
                        onClick={() => setIsFilterBatchDropdownOpen(true)}
                        placeholder="Search batches..."
                        className="flex-1 text-sm text-gray-900 placeholder-gray-500 bg-transparent focus:outline-none"
                      />
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${
                          isFilterBatchDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {/* Batch Filter Dropdown */}
                    {isFilterBatchDropdownOpen &&
                      filteredBatches?.length > 0 && (
                        <ul className="absolute z-20 w-full py-1 mt-1 overflow-y-auto text-sm bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                          <li
                            onClick={() => handleFilterBatchSelect('')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleFilterBatchSelect('');
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                              filterBatch === ''
                                ? 'bg-blue-50 font-medium text-blue-700'
                                : 'text-gray-700'
                            }`}
                          >
                            All Batches
                          </li>
                          {filteredBatches?.map((batch) => (
                            <li
                              key={batch._id}
                              onClick={() =>
                                handleFilterBatchSelect(batch.title)
                              }
                              className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                                filterBatch === batch.title
                                  ? 'bg-blue-50 font-medium text-blue-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              {batch?.title}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => {
                      setFilterDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 transition-all duration-200 bg-white border rounded border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Upcoming Deletions */}
            <motion.div
              variants={cardVariants}
              className="p-6 border shadow-sm bg-amber-50 border-amber-200 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-100">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-amber-800">
                  Auto-Delete Alerts
                </h3>
              </div>

              {expiringData?.length === 0 ? (
                <p className="text-sm text-amber-700">
                  No announcements scheduled for auto-deletion in the next 24
                  hours.
                </p>
              ) : (
                <div className="space-y-3">
                  {expiringData?.slice(0, 3).map((a, idx) => {
                    const deleteTime = new Date(
                      new Date(a.date).getTime() + 72 * 60 * 60 * 1000,
                    );
                    const timeLeft = formatDistanceToNow(deleteTime, {
                      addSuffix: true,
                    });

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-lg bg-white/50 border-amber-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-amber-800">
                            {a.title}
                          </p>
                          <p className="mt-1 text-xs text-amber-600">
                            {new Date(a.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full text-amber-700 bg-amber-100 whitespace-nowrap">
                          {timeLeft}
                        </span>
                      </div>
                    );
                  })}
                  {expiringData.length > 3 && (
                    <p className="text-xs text-center text-amber-600">
                      +{expiringData.length - 3} more...
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Announcements Table */}
          <motion.div
            variants={itemVariants}
            className="overflow-hidden capitalize bg-white border rounded shadow-sm border-slate-200/60"
          >
            <div className="px-6 py-4 border-b border-slate-200/60 bg-slate-50/50">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  All Announcements{' '}
                  <span className="ml-2 font-normal text-slate-600">
                    ({pagination?.total || 0})
                  </span>
                </h2>

                {/* Search Box */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="block w-full py-2 pl-10 pr-3 transition-all duration-200 border rounded border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                  />
                </div>

                {/* Loading State */}
                {announcementsLoading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-slate-50/80 border-slate-200/60">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500">
                      Announcement
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500">
                      Teacher
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500">
                      Details
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {allAnnouncements?.length > 0 ? (
                    allAnnouncements?.map((announcement, index) => {
                      const TypeIcon = getTypeIcon(announcement?.type);
                      return (
                        <motion.tr
                          key={announcement?._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="transition-colors duration-150 hover:bg-slate-50/50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg ${getTypeColor(announcement?.type)}`}
                              >
                                <TypeIcon className="w-4 h-4" />
                              </div>
                              <div className="">
                                <h3 className="text-sm font-semibold truncate text-slate-800">
                                  {announcement?.title}
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                  {announcement?.content}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                                      announcement?.type,
                                    )}`}
                                  >
                                    <Tag className="w-3 h-3" />
                                    {announcement.type}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {getTimeAgo(announcement?.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-800">
                              {announcement?.teacher?.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {announcement?.teacher?.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-slate-700">
                                <Users className="w-4 h-4 text-slate-400" />
                                {announcement?.batch}
                              </div>
                              <div className="flex items-center gap-2 text-slate-700">
                                <BookOpen className="w-4 h-4 text-slate-400" />
                                {announcement?.subject}
                              </div>
                              {announcement?.roomNumber && (
                                <div className="flex items-center gap-2 text-slate-700">
                                  <MapPin className="w-4 h-4 text-slate-400" />
                                  Room {announcement?.roomNumber}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-slate-700">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {formatDisplayDate(announcement?.date)}
                              </div>
                              {announcement?.time && (
                                <div className="flex items-center gap-2 text-slate-700">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  {new Date(
                                    `1970-01-01T${announcement?.time}:00`,
                                  ).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditClick(announcement)}
                                className="p-2 transition-all duration-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(announcement._id)}
                                className="p-2 transition-all duration-200 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Bell className="w-12 h-12 mb-4 text-slate-400" />
                          <h3 className="mb-1 text-lg font-medium text-slate-900">
                            No announcements found
                          </h3>
                          <p className="max-w-sm text-slate-500">
                            {searchTerm || filterBatch || filterDate
                              ? 'Try adjusting your search or filters'
                              : 'Get started by creating your first announcement'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-between gap-4 p-6 bg-white border shadow-sm sm:flex-row rounded-2xl border-slate-200/60"
            >
              <div className="text-sm text-slate-600">
                Showing{' '}
                <span className="font-semibold text-slate-800">
                  {(page - 1) * limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-800">
                  {Math.min(page * limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-800">
                  {pagination.total}
                </span>{' '}
                entries
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 font-medium transition-all duration-200 border rounded-lg border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </motion.button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {generatePageNumbers().map((pageNum, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() =>
                        typeof pageNum === 'number' && handlePageChange(pageNum)
                      }
                      disabled={pageNum === '...'}
                      className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                        page === pageNum
                          ? 'bg-blue-600 text-white shadow-sm'
                          : pageNum === '...'
                            ? 'text-slate-400 cursor-default'
                            : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextPage}
                  disabled={page === pagination.totalPages}
                  className="flex items-center gap-2 px-4 py-2 font-medium transition-all duration-200 border rounded-lg border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Create/Edit Announcement Form Modal */}
      <AnimatePresence>
        {viewMode === 'form' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200/60 rounded-t-2xl">
                <h2 className="text-xl font-semibold text-slate-800">
                  {editingId ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
                <button
                  onClick={() => {
                    setViewMode('list');
                    resetForm();
                  }}
                  className="p-2 transition-all duration-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Announcement Title *
                    </label>
                    <input
                      type="text"
                      required
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 transition-all duration-200 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter announcement title"
                    />
                  </div>

                  {/* Teacher Selection */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Search Teacher *
                    </label>
                    <div className="relative" ref={teacherDropdownRef}>
                      <div className="flex items-center w-full px-4 py-3 transition-all duration-200 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <Search className="w-4 h-4 mr-2 text-gray-400" />
                        <input
                          type="text"
                          value={teacherQuery}
                          onChange={(e) => setTeacherQuery(e.target.value)}
                          onClick={() => setIsTeacherDropdownOpen(true)}
                          placeholder="Search teacher by name..."
                          className="flex-1 text-sm text-gray-900 placeholder-gray-500 bg-transparent focus:outline-none"
                        />
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${
                            isTeacherDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>

                      {isTeacherDropdownOpen && (
                        <ul className="absolute z-20 w-full py-1 mt-1 overflow-y-auto text-sm capitalize bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                          {isTeachersLoading ? (
                            <li className="flex items-center justify-center px-3 py-2 text-gray-500">
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />{' '}
                              Loading...
                            </li>
                          ) : filteredTeachers?.length > 0 ? (
                            filteredTeachers?.map((teacher) => (
                              <li
                                key={teacher._id}
                                onClick={() => handleTeacherSelect(teacher)}
                                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                                  selectedTeacher?._id === teacher._id
                                    ? 'bg-blue-50 font-medium text-blue-700'
                                    : 'text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-6 h-6 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                                    {teacher.userName?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {teacher.userName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {teacher.phone}
                                    </p>
                                  </div>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="px-3 py-2 text-gray-500">
                              No teachers found
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Batch and Type */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Batch *
                      </label>
                      <div className="relative" ref={batchDropdownRef}>
                        <div className="flex items-center w-full px-4 py-3 transition-all duration-200 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <Search className="w-4 h-4 mr-2 text-gray-400" />
                          <input
                            type="text"
                            value={batchQuery}
                            onChange={(e) => {
                              setBatchQuery(e.target.value);
                              setIsBatchDropdownOpen(true);
                            }}
                            onClick={() => setIsBatchDropdownOpen(true)}
                            placeholder="Search for a batch..."
                            className="flex-1 text-sm text-gray-900 placeholder-gray-500 bg-transparent focus:outline-none"
                          />
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${
                              isBatchDropdownOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </div>

                        {/* Batch Dropdown */}
                        {isBatchDropdownOpen && filteredBatches?.length > 0 && (
                          <ul className="absolute z-20 w-full py-1 mt-1 overflow-y-auto text-sm bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                            {filteredBatches?.map((batch) => (
                              <li
                                key={batch._id}
                                onClick={() => handleBatchSelect(batch.title)}
                                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                                  formData.batch === batch.title
                                    ? 'bg-blue-50 font-medium text-blue-700'
                                    : 'text-gray-700'
                                }`}
                              >
                                {batch?.title}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Announcement Type *
                      </label>
                      <select
                        required
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 transition-all duration-200 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select type</option>
                        {ANNOUNCEMENT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        name="date"
                        value={formData.date.split('T')[0]}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            date: e.target.value
                              ? `${e.target.value}T00:00`
                              : '',
                          }));
                        }}
                        className="w-full px-4 py-3 transition-all duration-200 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Time *
                      </label>
                      <input
                        required
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 transition-all duration-200 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Subject and Room Number */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Subject *
                      </label>
                      <select
                        required
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 transition-all duration-200 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a subject</option>
                        {SUBJECT_OPTIONS?.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map((subject) => (
                              <option key={subject} value={subject}>
                                {subject}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Room Number
                      </label>
                      <input
                        type="text"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 transition-all duration-200 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Room 301, Lab 205"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Announcement Content
                    </label>
                    <textarea
                      rows={4}
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      className="w-full px-4 py-3 transition-all duration-200 bg-white border resize-none border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Provide detailed information about the announcement..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col justify-end gap-3 mt-8 sm:flex-row">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setViewMode('list');
                      resetForm();
                    }}
                    className="px-6 py-3 font-semibold transition-all duration-200 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading && (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{editingId ? 'Updating...' : 'Creating...'}</span>
                      </>
                    )}
                    {!isLoading &&
                      (editingId
                        ? 'Update Announcement'
                        : 'Create Announcement')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherAnnouncement;

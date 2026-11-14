import React, { useEffect, useRef, useState } from "react";

import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  X,
  CheckCircle,
  ArrowLeft,
  Search,
  ChevronDown,
  Bell,
  Clock,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

import { useGetBatchesQuery } from "@/features/control-panel/control-panel-services/batch/batchApi";
import Announcement from "./Announcement";
import { useGetSubjectsQuery } from "@/redux/features/subject/subjectApi";
import { toast } from "sonner";
import {
  useDeleteStudentAnnouncementMutation,
  usePostStudentAnnouncementMutation,
  useUpdateStudentAnnouncementMutation,
} from "../../studentPanel/services/api/studentApi";

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

const ANNOUNCEMENT_TYPES = ["general", "class", "exam", "result"];

const DEPARTMENTS = [
  "ARCH",
  "CE",
  "CHE",
  "CSE",
  "EEE",
  "FE",
  "ME/IPE/MME",
  "TE",
  "Solution Class",
];

const SUBJECTS = [
  {
    id: 1,
    label: "Mathematics",
    options: [
      { id: 101, name: "Algebra (Mathematics)" },
      { id: 102, name: "Trigonometry (Mathematics)" },
      { id: 103, name: "Co-ordinate Geometry (Mathematics)" },
      { id: 104, name: "Differential / Integral Calculus (Mathematics)" },
      { id: 105, name: "Matrix (Mathematics)" },
    ],
  },
  {
    id: 2,
    label: "Physics",
    options: [
      { id: 201, name: "Physical Part (Physics)" },
      { id: 202, name: "Sound (Physics)" },
      { id: 203, name: "Light (Physics)" },
      { id: 204, name: "Heat (Physics)" },
      { id: 205, name: "Atomic Physics (Physics)" },
      { id: 206, name: "Modern Physics (Physics)" },
    ],
  },
  {
    id: 3,
    label: "Chemistry",
    options: [
      { id: 301, name: "Physical Part (Chemistry)" },
      { id: 302, name: "Math Part (Chemistry)" },
      { id: 303, name: "Metal Part (Chemistry)" },
      { id: 304, name: "Organic Part (Chemistry)" },
    ],
  },
  {
    id: 4,
    label: "English",
    options: [{ id: 401, name: "English" }],
  },
  {
    id: 5,
    label: "ARCH",
    options: [
      { id: 501, name: "Theory (ARCH)" },
      { id: 502, name: "Basic Drawing (ARCH)" },
      { id: 503, name: "Analytical Drawing (ARCH)" },
      { id: 504, name: "Composition of Forms 1 (ARCH)" },
      { id: 505, name: "Composition of Forms 2 (ARCH)" },
      { id: 506, name: "Human Figure (ARCH)" },
      { id: 507, name: "Perspective (ARCH)" },
      { id: 508, name: "History of Architecture (ARCH)" },
      { id: 509, name: "Construction Process (ARCH)" },
      { id: 510, name: "Estimating & Costing (ARCH)" },
      { id: 511, name: "Surveying (ARCH)" },
    ],
  },
  {
    id: 6,
    label: "CE",
    options: [
      { id: 601, name: "Engineering Materials (CE)" },
      { id: 602, name: "Surveying (CE)" },
      { id: 603, name: "Structural Mechanics (CE)" },
      { id: 604, name: "Strength of Materials (CE)" },
      { id: 605, name: "Hydraulics (CE)" },
      { id: 606, name: "Soil Mechanics (CE)" },
      { id: 607, name: "Reinforced Cement Concrete (CE)" },
      { id: 608, name: "Design of Structure (CE)" },
      { id: 609, name: "Transportation Engineering (CE)" },
      { id: 610, name: "Estimating and Construction Process (CE)" },
      { id: 611, name: "Geotechnical Engineering (CE)" },
    ],
  },
  {
    id: 7,
    label: "EEE",
    options: [
      { id: 701, name: "DC Circuits (EEE)" },
      { id: 702, name: "Electronics (EEE)" },
      { id: 703, name: "AC Circuits (EEE)" },
      { id: 704, name: "AC Machine (EEE)" },
      { id: 705, name: "DC Machine (EEE)" },
      { id: 706, name: "Power System (EEE)" },
      { id: 707, name: "Telecommunication (EEE)" },
      { id: 708, name: "Digital Electronics (EEE)" },
    ],
  },
  {
    id: 8,
    label: "ME",
    options: [
      { id: 801, name: "Engineering Mechanics (ME)" },
      { id: 802, name: "Strength of Materials (ME)" },
      { id: 803, name: "Thermodynamics and Heat Engine (ME)" },
      {
        id: 804,
        name: "Hydraulics / Fluid Mechanics and Fluid Machineries (ME)",
      },
      { id: 805, name: "Basic Electricity and Electronics (ME)" },
      { id: 806, name: "Engineering Drawing (ME)" },
      { id: 807, name: "Theory Part (ME)" },
    ],
  },
  {
    id: 9,
    label: "CSE",
    options: [
      { id: 901, name: "Computer Fundamentals (CSE)" },
      { id: 902, name: "Basic Programming (CSE)" },
      { id: 903, name: "Object Oriented Programming(C++/Phython) (CSE)" },
      { id: 904, name: "Discrete Mathematics (CSE)" },
      { id: 905, name: "Data Structure (CSE)" },
      { id: 906, name: "Database Management (CSE)" },
      { id: 907, name: "Software Development (CSE)" },
      { id: 908, name: "Operating System (CSE)" },
      { id: 909, name: "Microprocessor & Microcomputer (CSE)" },
      { id: 910, name: "Data Communication & Computer Network (CSE)" },
      { id: 911, name: "Computer Graphics (CSE)" },
      { id: 912, name: "Digital Electronics (CSE)" },
    ],
  },
  {
    id: 10,
    label: "TE",
    options: [
      { id: 1001, name: "Introduction to Textile Engineering (TE)" },
      { id: 1002, name: "Textile Fibres (TE)" },
      { id: 1003, name: "Yarn Manufacturing Technology (TE)" },
      { id: 1004, name: "Processing Stages of Yarn Manufacturing (TE)" },
      { id: 1005, name: "Jute Technology (TE)" },
      { id: 1006, name: "Fabric Manufacturing Technology (TE)" },
      { id: 1007, name: "Wet Processing Technology (TE)" },
      { id: 1008, name: "Garments Manufacturing Technology (TE)" },
      { id: 1009, name: "Pattern Making & Garments Design (TE)" },
      { id: 1010, name: "Textile Testing (TE)" },
      { id: 1011, name: "Fabric Structure and Clothing Analysis (TE)" },
      { id: 1012, name: "Engineering Drawing (TE)" },
    ],
  },
  {
    id: 11,
    label: "CHE",
    options: [
      { id: 1101, name: "Basic Stoichiometry (ChE)" },
      { id: 1102, name: "Unit Operation (ChE)" },
      { id: 1103, name: "Energy (ChE)" },
      { id: 1104, name: "Chemical Process Industries and Safety (ChE)" },
      { id: 1105, name: "Engineering Mechanics (ChE)" },
      { id: 1106, name: "Industrial Management (ChE)" },
      { id: 1107, name: "Basic Electricity and Electronics (ChE)" },
      { id: 1108, name: "Basics of Computer and Programming (ChE)" },
    ],
  },
  {
    id: 12,
    label: "FE",
    options: [
      { id: 1201, name: "Food Engineering and Technology (FE)" },
      { id: 1202, name: "Food Packaging and Preservation (FE)" },
      { id: 1203, name: "Food Chemistry and Nutrition (FE)" },
      { id: 1204, name: "Food Microbiology (FE)" },
      { id: 1205, name: "Food Safety (FE)" },
      {
        id: 1206,
        name: "Electrical and Electronic Engineering Fundamentals (FE)",
      },
    ],
  },
];

const StudentAnnouncement = () => {
  // State Management
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterBatch, setFilterBatch] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Batch selection states
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [batchQuery, setBatchQuery] = useState("");
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
  const batchDropdownRef = useRef(null);

  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    isError: subjectsError,
    error: subjectsErrorData,
    refetch: refetchSubjects,
  } = useGetSubjectsQuery(debouncedSearch);

  // Batch filter states
  const [filterBatchQuery, setFilterBatchQuery] = useState("");
  const [isFilterBatchDropdownOpen, setIsFilterBatchDropdownOpen] =
    useState(false);
  const filterBatchDropdownRef = useRef(null);

  // Fetch auto-delete information
  const [expiringData, setExpiringData] = useState([]);

  // API Queries - FIXED: Remove .data since backend returns data directly
  const { data: batchesData } = useGetBatchesQuery(search);

  const allBatches = batchesData?.data || []; // This should now work with your backend structure

  const handleSelect = (item) => {
    setFilterBatch(item?.title || "all");
    setPage(1);
  };

  useEffect(() => {
    const fetchUpcomingDeletes = async () => {
      try {
        const res = await axios.get(
          `${SERVER}/api/student/announcement/upcoming-delete`,
        );
        setExpiringData(res.data.data || []);
      } catch (error) {
        toast.error(error.data?.message || "Something went wrong! Try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingDeletes();
  }, []);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    teacherName: "",
    title: "",
    type: "",
    content: "",
    batch: "",
    department: "",
    subject: "",
    roomNumber: "",
    publishedBy: { name: "", role: "" },
  });

  const [postStudentAnnouncement, { isLoading: isSubmitting }] =
    usePostStudentAnnouncementMutation();

  const [updateStudentAnnouncement, { isLoading: isUpdating }] =
    useUpdateStudentAnnouncementMutation();

  const [deleteStudentAnnouncement] = useDeleteStudentAnnouncementMutation();

  const {
    data,
    refetch,
    isLoading: isLoadingAnnouncements,
  } = useGetAllAnnouncementsQuery({
    search: searchTerm,
    page,
    limit,
    date: filterDate === "" ? undefined : filterDate,
    batch: filterBatch === "all" ? undefined : filterBatch,
    type: filterType === "all" ? undefined : filterType,
  });

  const announcements = data?.data || [];
  const pagination = data?.pagination || {};

  function timeDifferenceFull(publishedDate) {
    const now = new Date();
    const published = new Date(publishedDate);
    const diffInMs = now - published;

    const diffInSeconds = Math.floor(diffInMs / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < intervals.hour) {
      const minutes = Math.floor(diffInSeconds / intervals.minute);
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    } else if (diffInSeconds < intervals.day) {
      const hours = Math.floor(diffInSeconds / intervals.hour);
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else if (diffInSeconds < intervals.week) {
      const days = Math.floor(diffInSeconds / intervals.day);
      return `${days} day${days === 1 ? "" : "s"} ago`;
    } else if (diffInSeconds < intervals.month) {
      const weeks = Math.floor(diffInSeconds / intervals.week);
      return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    } else if (diffInSeconds < intervals.year) {
      const months = Math.floor(diffInSeconds / intervals.month);
      return `${months} month${months === 1 ? "" : "s"} ago`;
    } else {
      const years = Math.floor(diffInSeconds / intervals.year);
      return `${years} year${years === 1 ? "" : "s"} ago`;
    }
  }

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours, 10);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const getTypeColor = (type) => {
    const colors = {
      result: "bg-emerald-100 text-emerald-800 border-emerald-200",
      class: "bg-blue-100 text-blue-800 border-blue-200",
      exam: "bg-amber-100 text-amber-800 border-amber-200",
      general: "bg-indigo-100 text-indigo-800 border-indigo-200",
    };
    return colors[type] || colors.general;
  };

  const getTypeIcon = (type) => {
    const icons = {
      result: <FileText className="w-4 h-4 mr-1" />,
      class: <Calendar className="w-4 h-4 mr-1" />,
      exam: <AlertCircle className="w-4 h-4 mr-1" />,
      general: <Bell className="w-4 h-4 mr-1" />,
    };
    return icons[type] || icons.general;
  };

  // Event Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("publishedBy.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        publishedBy: { ...prev.publishedBy, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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

  // ✅ Filter batches dynamically on input - FIXED
  useEffect(() => {
    if (allBatches && allBatches.length > 0) {
      if (!batchQuery.trim()) {
        setFilteredBatches(allBatches);
      } else {
        const filtered = allBatches.filter((b) =>
          b.title.toLowerCase().includes(batchQuery.toLowerCase()),
        );
        setFilteredBatches(filtered);
      }
    }
  }, [batchQuery, allBatches]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.date ||
      !formData.title ||
      !formData.type ||
      !formData.batch ||
      !formData.department
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "publishedBy") {
        formPayload.append(key, JSON.stringify(value));
      } else {
        formPayload.append(key, value);
      }
    });

    if (file) formPayload.append("attachment", file);

    try {
      if (editingId) {
        await updateStudentAnnouncement({
          id: editingId,
          updatedData: formPayload,
        }).unwrap();
        toast.success("Announcement updated successfully");
      } else {
        const res = await postStudentAnnouncement(formPayload).unwrap();
        setShowSuccess(res);
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      refetch();
      resetForm();
      setViewMode("list");
    } catch (error) {
      toast.error(error?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setFormData({
      date: "",
      time: "",
      teacherName: "",
      title: "",
      type: "",
      content: "",
      batch: "",
      department: "",
      subject: "",
      roomNumber: "",
      publishedBy: { name: "", role: "" },
    });
    setFile(null);
    setEditingId(null);
    setBatchQuery("");
  };

  const handleEditClick = (announcement) => {
    setFormData({
      date: announcement.date,
      time: announcement.time || "",
      teacherName: announcement.teacherName || "",
      title: announcement.title,
      type: announcement.type,
      content: announcement.content || "",
      batch: announcement.batch,
      department: announcement.department,
      subject: announcement.subject || "",
      roomNumber: announcement.roomNumber || "",
      publishedBy: {
        name: announcement.publishedBy?.name || "",
        role: announcement.publishedBy?.role || "",
      },
    });
    setBatchQuery(announcement.batch);
    setEditingId(announcement._id);
    setViewMode("form");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await deleteStudentAnnouncement(id).unwrap();
        toast.success("Announcement deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete announcement");
      }
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterDate("");
    setFilterBatch("all");
    setPage(1);
  };

  const toggleViewMode = () => {
    resetForm();
    setViewMode(viewMode === "list" ? "form" : "list");
  };

  const getPaginationRange = (currentPage, totalPages, delta = 1) => {
    const range = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);

    if (left > 2) {
      range.push("...");
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < totalPages - 1) {
      range.push("...");
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed z-50 flex items-center px-4 py-3 text-green-700 border border-green-200 rounded-lg shadow-lg top-4 right-4 bg-green-50"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>{showSuccess?.message}</span>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-3 text-green-500 hover:text-green-700"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-indigo-50 to-[#F9FAFB]  py-8 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute w-16 h-16 rounded-full top-4 left-10 bg-blue-200/40 blur-sm"></div>
          <div className="absolute w-20 h-20 rounded-full bottom-4 right-16 bg-indigo-200/30 blur-md"></div>
          <div className="absolute w-12 h-12 rounded-full top-1/2 left-1/3 bg-purple-200/40 blur-sm"></div>
        </div>

        <div className="relative z-10 max-w-7xl ">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                <Bell className="w-4 h-4" />
                <span>Live Updates</span>
              </div>
              <h1 className="text-2xl sm:text-3=2xl lg:text-3xl font-bold text-gray-900">
                Student Announcements
              </h1>

              <p className="max-w-md mx-auto text-sm text-gray-600 sm:text-base lg:mx-0">
                Stay informed with important updates, academic notices, and
                campus events.
              </p>
            </div>

            <div className="flex-shrink-0 hidden w-48 sm:block lg:w-56">
              <svg
                viewBox="0 0 240 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
              >
                <rect
                  x="20"
                  y="20"
                  width="200"
                  height="140"
                  rx="8"
                  fill="#F8FAFC"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                />
                <rect
                  x="35"
                  y="35"
                  width="60"
                  height="40"
                  rx="4"
                  fill="#DBEAFE"
                  stroke="#3B82F6"
                  strokeWidth="1"
                />
                <rect
                  x="110"
                  y="45"
                  width="55"
                  height="35"
                  rx="4"
                  fill="#FEF3C7"
                  stroke="#F59E0B"
                  strokeWidth="1"
                />
                <rect
                  x="180"
                  y="40"
                  width="25"
                  height="30"
                  rx="4"
                  fill="#FECACA"
                  stroke="#EF4444"
                  strokeWidth="1"
                />
                <circle cx="50" cy="40" r="3" fill="#3B82F6" />
                <circle cx="125" cy="50" r="3" fill="#F59E0B" />
                <circle cx="192" cy="45" r="3" fill="#EF4444" />
                <line
                  x1="40"
                  y1="50"
                  x2="85"
                  y2="50"
                  stroke="#60A5FA"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="40"
                  y1="55"
                  x2="80"
                  y2="55"
                  stroke="#60A5FA"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <line
                  x1="40"
                  y1="60"
                  x2="75"
                  y2="60"
                  stroke="#60A5FA"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <line
                  x1="115"
                  y1="60"
                  x2="155"
                  y2="60"
                  stroke="#FBBF24"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="115"
                  y1="65"
                  x2="150"
                  y2="65"
                  stroke="#FBBF24"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <rect
                  x="40"
                  y="90"
                  width="50"
                  height="45"
                  rx="4"
                  fill="#FFFFFF"
                  stroke="#D1D5DB"
                  strokeWidth="1"
                />
                <rect
                  x="40"
                  y="90"
                  width="50"
                  height="12"
                  rx="4"
                  fill="#6366F1"
                />
                <text
                  x="65"
                  y="100"
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                >
                  MAR
                </text>
                <text
                  x="65"
                  y="120"
                  textAnchor="middle"
                  fill="#374151"
                  fontSize="16"
                  fontWeight="bold"
                >
                  15
                </text>
                <g transform="translate(120, 95)">
                  <path
                    d="M5 15 L25 10 L30 20 L30 30 L25 40 L5 35 Z"
                    fill="#6366F1"
                  />
                  <rect
                    x="0"
                    y="20"
                    width="8"
                    height="10"
                    rx="2"
                    fill="#8B5CF6"
                  />
                  <ellipse cx="30" cy="25" rx="8" ry="10" fill="#A5B4FC" />
                  <path
                    d="M38 15 Q45 20 38 25"
                    stroke="#6366F1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M38 25 Q45 30 38 35"
                    stroke="#6366F1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M42 10 Q52 20 42 30"
                    stroke="#8B5CF6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M42 20 Q52 30 42 40"
                    stroke="#8B5CF6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
                <circle
                  cx="180"
                  cy="100"
                  r="12"
                  fill="#F3F4F6"
                  stroke="#9CA3AF"
                  strokeWidth="1"
                />
                <circle cx="180" cy="95" r="4" fill="#6B7280" />
                <path
                  d="M170 108 Q180 105 190 108"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="195" cy="85" r="6" fill="#EF4444" />
                <text
                  x="195"
                  y="88"
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                >
                  3
                </text>
                <circle cx="205" cy="110" r="5" fill="#10B981" />
                <path
                  d="M202 110 L204 112 L208 108"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="60" cy="130" r="2" fill="#C084FC" opacity="0.6" />
                <circle cx="160" cy="130" r="2" fill="#60A5FA" opacity="0.6" />
                <circle cx="200" cy="130" r="2" fill="#34D399" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
        {/* Toggle Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={toggleViewMode}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white transition bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {viewMode === "list" ? (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add New Announcement
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                View Announcements
              </>
            )}
          </button>

          {viewMode === "list" && (
            <div className="text-sm text-gray-500">
              Showing {announcements?.length} of {pagination?.total}{" "}
              announcements
              <div>{deleteInfo ? deleteInfo?.data?.message : ""}</div>
            </div>
          )}
        </div>

        {viewMode === "list" ? (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 pl-10 text-sm bg-white border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setPage(1);
                    }}
                    className="w-full py-2 pl-3 pr-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Types</option>
                    {ANNOUNCEMENT_TYPES?.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => {
                      setFilterDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full py-2 pl-3 pr-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Batch Filter Dropdown */}
                <div className="relative" ref={filterBatchDropdownRef}>
                  <div className="flex items-center w-full px-4 py-2 transition-all duration-200 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <Search className="w-4 h-4 mr-2 text-gray-400" />
                    <input
                      type="text"
                      value={filterBatch === "all" ? "" : filterBatch}
                      onChange={(e) => {
                        setFilterBatchQuery(e.target.value);
                        setIsFilterBatchDropdownOpen(true);
                      }}
                      onClick={() => setIsFilterBatchDropdownOpen(true)}
                      placeholder="Filter by batch..."
                      className="flex-1 text-sm text-gray-900 placeholder-gray-500 bg-transparent focus:outline-none"
                    />
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${
                        isFilterBatchDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Filter Batch Dropdown */}
                  {isFilterBatchDropdownOpen && allBatches?.length > 0 && (
                    <ul className="absolute z-20 w-full py-1 mt-1 overflow-y-auto text-sm bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                      <li
                        onClick={() => handleFilterBatchSelect("all")}
                        className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                          filterBatch === "all"
                            ? "bg-blue-50 font-medium text-blue-700"
                            : "text-gray-700"
                        }`}
                      >
                        All Batches
                      </li>
                      {allBatches
                        ?.filter((batch) =>
                          batch.title
                            .toLowerCase()
                            .includes(filterBatchQuery.toLowerCase()),
                        )
                        ?.map((batch) => (
                          <li
                            key={batch._id}
                            onClick={() => handleFilterBatchSelect(batch.title)}
                            className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                              filterBatch === batch.title
                                ? "bg-blue-50 font-medium text-blue-700"
                                : "text-gray-700"
                            }`}
                          >
                            {batch?.title}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">Show:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="appearance-none pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <ChevronDown className="relative w-4 h-4 -ml-6 text-gray-400 pointer-events-none" />
                </div>

                <button
                  onClick={handleResetFilters}
                  className="flex items-center px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reset Filters
                </button>
              </div>
            </div>

            {/* upcoming auto deletion announcement list */}
            <div className="max-w-lg p-4 mb-5 bg-white border shadow-md rounded-xl">
              <h2 className="mb-3 text-lg font-semibold text-gray-800">
                Upcoming Auto-Deleted Announcements
              </h2>

              {expiringData?.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No announcements are scheduled to be auto-deleted in the next
                  24 hours.
                </p>
              ) : (
                <ul className="space-y-2 text-sm text-gray-700">
                  {expiringData.map((a, idx) => {
                    const deleteTime = new Date(
                      new Date(a.date).getTime() + 72 * 60 * 60 * 1000,
                    );
                    const timeLeft = formatDistanceToNow(deleteTime, {
                      addSuffix: true,
                    });

                    return (
                      <li
                        key={idx}
                        className="flex items-center justify-between pb-2 border-b"
                      >
                        <span>📅 {new Date(a.date).toLocaleString()}</span>
                        <span className="font-medium text-blue-600">
                          {timeLeft}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Announcements List */}
            {isLoadingAnnouncements ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white border border-indigo-100 shadow rounded-xl">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <span className="mt-4 text-gray-600">Please wait...</span>
              </div>
            ) : announcements?.length === 0 ? (
              <div className="py-12 text-center bg-white shadow rounded-xl">
                <div className="mb-4 text-6xl text-indigo-200">📢</div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No announcements found
                </h3>
                <p className="mb-6 text-gray-500">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={toggleViewMode}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Announcement
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
                  {/* Table Header - Desktop */}
                  <div className="hidden grid-cols-12 text-sm font-semibold text-indigo-700 border-b border-gray-200 md:grid bg-indigo-50">
                    <div className="col-span-1 px-4 py-3 border-r border-gray-200">
                      #
                    </div>
                    <div className="col-span-2 px-4 py-3 border-r border-gray-200">
                      Details
                    </div>
                    <div className="col-span-6 px-4 py-3 border-r border-gray-200">
                      Announcement
                    </div>
                    <div className="col-span-2 px-4 py-3 border-r border-gray-200">
                      Date & Time
                    </div>
                    <div className="col-span-1 px-4 py-3 text-center">
                      Actions
                    </div>
                  </div>

                  {/* Announcements List */}
                  <div className="divide-y divide-gray-200">
                    {announcements?.map((announcement, i) => (
                      <motion.div
                        key={announcement._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 text-sm transition md:grid-cols-12 hover:bg-gray-50"
                      >
                        {/* SL - Mobile */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 md:hidden bg-gray-50">
                          <span className="text-gray-500">#{i + 1}</span>
                          <span
                            className={`${getTypeColor(
                              announcement.type,
                            )} px-2 py-1 rounded-full text-xs font-medium capitalize flex items-center w-fit`}
                          >
                            {getTypeIcon(announcement.type)}
                            {announcement.type}
                          </span>
                        </div>

                        {/* SL - Desktop */}
                        <div className="items-center justify-center hidden col-span-1 px-4 py-3 border-r border-gray-200 md:flex">
                          {i + 1}
                        </div>

                        {/* Details - Mobile */}
                        <div className="px-4 py-3 space-y-1 border-b border-gray-200 md:hidden">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">Batch:</span>
                            <span className="font-medium">
                              {announcement.batch || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">Dept:</span>
                            <span className="font-medium">
                              {announcement?.department || "N/A"}
                            </span>
                          </div>
                          {announcement?.subject && (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">Subject:</span>
                              <span className="font-medium">
                                {announcement?.subject}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Details - Desktop */}
                        <div className="flex-col hidden col-span-2 px-4 py-3 border-r border-gray-200 md:flex">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">
                              Batch:
                            </span>
                            <span className="text-xs font-semibold">
                              {announcement?.batch || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Dept:</span>
                            <span className="text-xs font-semibold">
                              {announcement?.department || "N/A"}
                            </span>
                          </div>
                          {announcement?.subject && (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-500">
                                Subject:
                              </span>
                              <span className="text-xs font-semibold">
                                {announcement?.subject}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Announcement Content */}
                        <div className="col-span-1 px-4 py-3 border-b border-gray-200 md:col-span-6 md:border-r">
                          <div className="flex items-start">
                            <div className="hidden mr-3 md:block">
                              <span
                                className={`${getTypeColor(
                                  announcement.type,
                                )} px-2 py-1 rounded-full text-xs font-medium capitalize flex items-center w-fit`}
                              >
                                {getTypeIcon(announcement.type)}
                                {announcement.type}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 capitalize">
                                {announcement.title}
                              </h3>
                              {announcement.content && (
                                <p className="mt-1 text-xs text-justify text-gray-600">
                                  {announcement.content}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                {announcement.teacherName && (
                                  <div className="mt-1 text-xs text-gray-500">
                                    <span>Teacher: </span>
                                    <span className="font-medium">
                                      {announcement.teacherName}
                                    </span>
                                  </div>
                                )}
                                {announcement.roomNumber && (
                                  <div className="mt-1 text-xs text-gray-500">
                                    <span>Room: </span>
                                    <span className="font-medium">
                                      {announcement.roomNumber}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="col-span-1 px-4 py-3 border-b border-gray-200 md:col-span-2 md:border-r">
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 text-xs">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-gray-700">
                                  {formatDisplayDate(announcement?.date)}
                                </span>
                              </div>
                              {announcement?.time && (
                                <div className="flex items-center space-x-1 text-xs">
                                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                                  <span className="text-gray-700">
                                    {formatTime(announcement.time)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {timeDifferenceFull(announcement?.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end col-span-1 px-4 py-3 space-x-2 md:col-span-1 md:justify-center">
                          <button
                            onClick={() => handleEditClick(announcement)}
                            className="p-1 text-gray-500 transition hover:text-indigo-600"
                            aria-label="Edit announcement"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(announcement._id)}
                            className="p-1 text-gray-500 transition hover:text-red-600"
                            aria-label="Delete announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                {pagination?.totalPages > 1 && (
                  <div className="flex flex-col items-center justify-between px-4 py-4 bg-white border border-gray-200 shadow-sm sm:flex-row rounded-xl">
                    <div className="mb-3 text-sm text-gray-500 sm:mb-0">
                      Showing{" "}
                      <span className="font-medium">
                        {(page - 1) * limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(page * limit, pagination.total)}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span>{" "}
                      results
                    </div>

                    <nav className="inline-flex rounded-md shadow-sm">
                      <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className={`px-3 py-1.5 rounded-l-md border ${
                          page === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Previous
                      </button>

                      {getPaginationRange(page, pagination.totalPages).map(
                        (pageNum, idx) =>
                          pageNum === "..." ? (
                            <span
                              key={`dots-${idx}`}
                              className="px-3 py-1.5 border-t border-b border-gray-300 bg-white text-gray-500"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`px-3 py-1.5 border-t border-b ${
                                page === pageNum
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                              }`}
                            >
                              {pageNum}
                            </button>
                          ),
                      )}

                      <button
                        onClick={() =>
                          setPage((p) => Math.min(p + 1, pagination.totalPages))
                        }
                        disabled={page === pagination.totalPages}
                        className={`px-3 py-1.5 rounded-r-md border ${
                          page === pagination.totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Create/Edit Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
              <div className="flex items-center">
                <button
                  onClick={toggleViewMode}
                  className="p-1 mr-3 text-indigo-600 rounded-full hover:text-indigo-800 hover:bg-indigo-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-medium text-indigo-900">
                  {editingId ? "Edit Announcement" : "Create New Announcement"}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Announcement Details Section */}
                <div className="md:col-span-2">
                  <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Announcement Details
                  </h3>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter announcement title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select type</option>
                    {ANNOUNCEMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

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
                          isBatchDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {/* Dropdown */}
                    {isBatchDropdownOpen && filteredBatches?.length > 0 && (
                      <ul className="absolute z-20 w-full py-1 mt-1 overflow-y-auto text-sm bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                        {filteredBatches.map((batch) => (
                          <li
                            key={batch._id}
                            onClick={() => handleBatchSelect(batch.title)}
                            className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                              formData.batch === batch.title
                                ? "bg-blue-50 font-medium text-blue-700"
                                : "text-gray-700"
                            }`}
                          >
                            {batch.title}
                          </li>
                        ))}
                      </ul>
                    )}
                    {isBatchDropdownOpen && filteredBatches?.length === 0 && (
                      <ul className="absolute z-20 w-full py-1 mt-1 text-sm bg-white border border-gray-200 rounded-md shadow-lg">
                        <li className="px-3 py-2 text-gray-500">
                          No batches found
                        </li>
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS?.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select subject</option>
                    {SUBJECTS?.map((group) => (
                      <optgroup key={group.id} label={group.label}>
                        {group?.options?.map((subject) => (
                          <option key={subject?.id} value={subject?.name}>
                            {subject.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Room Number
                  </label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder="Enter room number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Conditional Fields */}
                {(formData.type === "class" || formData.type === "exam") && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}

                {formData.type === "class" && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Teacher Name
                    </label>
                    <input
                      type="text"
                      name="teacherName"
                      value={formData.teacherName}
                      onChange={handleChange}
                      placeholder="Enter teacher name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter announcement content..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {formData.type === "result" && (
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Upload PDF <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      required={formData.type === "result"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      PDF files only (max. 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse mt-8 space-y-3 space-y-reverse sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0">
                <button
                  type="button"
                  onClick={toggleViewMode}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm sm:w-auto hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUpdating}
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm sm:w-auto hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingId ? "Updating..." : "Creating..."}
                    </>
                  ) : editingId ? (
                    "Update Announcement"
                  ) : (
                    "Create Announcement"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>

      <Announcement></Announcement>
    </div>
  );
};

export default StudentAnnouncement;

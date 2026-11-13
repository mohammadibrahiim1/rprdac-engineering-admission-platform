import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Inbox,
  Send,
  FileText,
  Archive,
  Trash2,
  Star,
  Clock,
  Search,
  Plus,
  Menu,
  X,
  ChevronLeft,
  Bell,
  Users,
  Calendar,
  Tag,
  MoreVertical,
  CheckCircle2,
  ChevronDown,
  MapPin,
  AlertTriangle,
  Download,
  Home,
  ChevronRight,
  Megaphone,
  BookOpen,
  Filter,
  RefreshCw,
  Eye,
  Edit3,
  Paperclip,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { useGetOnlyTeachersQuery } from "../../../../../redux/features/users/userApi";
import { useGetBatchesQuery } from "../../../../../redux/features/batch/batchApi";
import {
  useGetDepartmentsQuery,
  useGetSubjectsQuery,
} from "../../../../../redux/features/subject/subjectApi";
import {
  useCreateAnnouncementMutation,
  useDeleteAnnouncementsMutation,
  useGetAnnouncementsQuery,
  useUpdateAnnouncementsMutation,
} from "../../../../../redux/features/announcement/announcementApi";
import { useSelector } from "react-redux";

/* ─────────────────────── CONSTANTS ─────────────────────── */

const initialState = {
  title: "",
  type: "",
  date: "",
  time: "",
  batch: "",
  department: "",
  subject: "",
  roomNumber: "",
  teacher: null,
  sendToStudent: false,
  sendToAllStudent: false,
  sendToTeacher: false,
  sendToAllTeacher: false,
  content: "",
  file: null,
  isUrgent: false,
  status: "published",
};

const announcementTypes = [
  { value: "class", label: "Class", icon: "📚", color: "#3b82f6" },
  { value: "exam", label: "Exam", icon: "📝", color: "#ef4444" },
  { value: "result", label: "Result", icon: "📊", color: "#10b981" },
  { value: "event", label: "Event", icon: "🎉", color: "#8b5cf6" },
  { value: "general", label: "General Notice", icon: "📢", color: "#6b7280" },
  { value: "admission", label: "Admission", icon: "🎓", color: "#6366f1" },
  { value: "holiday", label: "Holiday", icon: "🏖️", color: "#0ea5e9" },
  { value: "meeting", label: "Meeting", icon: "🤝", color: "#f97316" },
  { value: "routine", label: "Class Routine", icon: "📅", color: "#14b8a6" },
  { value: "notice", label: "Official Notice", icon: "📌", color: "#eab308" },
  { value: "admit_card", label: "Admit Card", icon: "🪪", color: "#f43f5e" },
  { value: "fees", label: "Fees Notice", icon: "💰", color: "#059669" },
  { value: "urgent", label: "Urgent Notice", icon: "🚨", color: "#dc2626" },
];

/* ─────────────────────── SMALL COMPONENTS ─────────────────────── */

const NotionDivider = () => (
  <div
    style={{ height: "1px", background: "var(--notion-border)", margin: "0" }}
  />
);

const TypeBadge = ({ type, size = "sm" }) => {
  const t = announcementTypes.find((a) => a.value === type) || {
    label: type,
    icon: "📢",
    color: "#6b7280",
  };
  const pad = size === "sm" ? "2px 8px" : "3px 10px";
  const fs = size === "sm" ? "11px" : "12px";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: pad,
        borderRadius: 4,
        fontSize: fs,
        fontWeight: 500,
        background: t.color + "18",
        color: t.color,
        border: `1px solid ${t.color}30`,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: fs }}>{t.icon}</span>
      {t.label}
    </span>
  );
};

const StatusPill = ({ status }) => {
  const map = {
    published: { bg: "#d1fae5", color: "#065f46", label: "Published" },
    draft: { bg: "#f3f4f6", color: "#374151", label: "Draft" },
    scheduled: { bg: "#ede9fe", color: "#5b21b6", label: "Scheduled" },
  };
  const s = map[status] || map.draft;
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 500,
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
};

/* ─────────────────────── NOTION DROPDOWN ─────────────────────── */

const NotionDropdown = ({
  label,
  required,
  searchTerm,
  setSearchTerm,
  showDropdown,
  setShowDropdown,
  dropdownRef,
  filteredItems,
  onSelect,
  selectedItem,
  clearSelection,
  placeholder,
  renderItem,
  getItemLabel,
  disabled = false,
}) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 6 }}
      ref={dropdownRef}
    >
      <label
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--notion-text-secondary)",
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid var(--notion-border-strong)",
            borderRadius: 6,
            padding: "7px 10px",
            background: disabled ? "var(--notion-hover)" : "var(--notion-bg)",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            transition: "border-color 0.15s",
          }}
          onFocus={() => !disabled && setShowDropdown(true)}
        >
          <Search size={14} color="var(--notion-text-secondary)" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              if (!disabled) {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }
            }}
            onFocus={() => !disabled && setShowDropdown(true)}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13,
              color: "var(--notion-text)",
              minWidth: 0,
            }}
          />
          {selectedItem && (
            <button
              type="button"
              onClick={clearSelection}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                color: "var(--notion-text-secondary)",
              }}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={14} color="var(--notion-text-secondary)" />
        </div>

        <AnimatePresence>
          {showDropdown && filteredItems?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                zIndex: 100,
                background: "var(--notion-bg)",
                border: "1px solid var(--notion-border-strong)",
                borderRadius: 8,
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              {filteredItems.map((item, index) => {
                const itemLabel = getItemLabel
                  ? getItemLabel(item)
                  : item.name ||
                    item.title ||
                    (typeof item === "string" ? item : "");
                return (
                  <div
                    key={item.id || index}
                    onClick={() => {
                      onSelect(item);
                      setShowDropdown(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--notion-border)",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--notion-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {renderItem ? (
                      renderItem(item)
                    ) : (
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--notion-text)",
                          fontWeight: 500,
                        }}
                      >
                        {itemLabel}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─────────────────────── FORM FIELD ─────────────────────── */

const Field = ({ label, required, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: "var(--notion-text-secondary)",
      }}
    >
      {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
    </label>
    {children}
  </div>
);

const notionInputStyle = {
  width: "100%",
  border: "1px solid var(--notion-border-strong)",
  borderRadius: 6,
  padding: "7px 10px",
  fontSize: 13,
  color: "var(--notion-text)",
  background: "var(--notion-bg)",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

/* ─────────────────────── AUDIENCE CARD ─────────────────────── */

const AudienceCard = ({ children, active, accentColor }) => (
  <div
    style={{
      border: `1px solid ${active ? accentColor + "60" : "var(--notion-border-strong)"}`,
      borderRadius: 8,
      padding: 16,
      background: active ? accentColor + "08" : "var(--notion-bg)",
      transition: "all 0.2s",
    }}
  >
    {children}
  </div>
);

const NotionCheckbox = ({
  checked,
  onChange,
  label,
  color = "#3b82f6",
  name,
}) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
      userSelect: "none",
    }}
  >
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        border: `2px solid ${checked ? color : "var(--notion-border-strong)"}`,
        background: checked ? color : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        flexShrink: 0,
        cursor: "pointer",
      }}
      onClick={() =>
        onChange({ target: { name, checked: !checked, type: "checkbox" } })
      }
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4l3 3 5-6"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      style={{ display: "none" }}
    />
    <span
      style={{ fontSize: 13, fontWeight: 500, color: "var(--notion-text)" }}
    >
      {label}
    </span>
  </label>
);

/* ─────────────────────── ANNOUNCEMENT ITEM ─────────────────────── */

const AnnouncementItem = ({
  announcement,
  isSelected,
  isComposing,
  onClick,
  formatDate,
  formatTime,
  getExpiryColor,
}) => {
  const t = announcementTypes.find((a) => a.value === announcement.type) || {
    icon: "📢",
    color: "#6b7280",
  };
  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 16px",
        cursor: "pointer",
        background:
          isSelected && !isComposing ? "var(--notion-selected)" : "transparent",
        borderLeft: `3px solid ${announcement.isUrgent ? "#ef4444" : isSelected && !isComposing ? "#3b82f6" : "transparent"}`,
        transition: "all 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!(isSelected && !isComposing))
          e.currentTarget.style.background = "var(--notion-hover)";
      }}
      onMouseLeave={(e) => {
        if (!(isSelected && !isComposing))
          e.currentTarget.style.background = "transparent";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 6,
          gap: 8,
        }}
      >
        <TypeBadge type={announcement.type} />
        <span
          style={{
            fontSize: 11,
            color: "var(--notion-text-secondary)",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {formatDate(announcement.date)}
        </span>
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--notion-text)",
          marginBottom: 4,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {announcement.title}
      </div>
      {announcement.content && (
        <div
          style={{
            fontSize: 12,
            color: "var(--notion-text-secondary)",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: "1.5",
            marginBottom: 8,
          }}
        >
          {announcement.content}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {announcement.time && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              color: "var(--notion-text-secondary)",
            }}
          >
            <Clock size={11} /> {formatTime(announcement.time)}
          </span>
        )}
        {announcement.roomNumber && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              color: "var(--notion-text-secondary)",
            }}
          >
            <MapPin size={11} /> {announcement.roomNumber}
          </span>
        )}
        {announcement.isUrgent && (
          <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>
            🔴 Urgent
          </span>
        )}
      </div>
      <div
        style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}
      >
        <AlertTriangle size={10} color="#f59e0b" />
        <span
          style={{
            fontSize: 11,
            color: getExpiryColor(announcement?.remainingDays),
            fontWeight: 500,
          }}
        >
          {announcement?.remainingDays}
        </span>
      </div>
    </div>
  );
};

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */

const Announcement = () => {
  const [formData, setFormData] = useState(initialState);
  const [editingId, setEditingId] = useState(null); // null = create mode, id = edit mode
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [batchSearchTerm, setBatchSearchTerm] = useState("");
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [subSearchTerm, setSubSearchTerm] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showSubDropdown, setShowSubDropdown] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const { user } = useSelector((state) => state?.auth);
  const [query] = useState({
    page: 1,
    limit: 50,
    type: "",
    date: "",
    batch: "",
  });

  const [createAnnouncement, { isLoading: isCreating }] =
    useCreateAnnouncementMutation();
  const [deleteAnnouncement, { isLoading: isDeleting }] =
    useDeleteAnnouncementsMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] =
    useUpdateAnnouncementsMutation();

  const {
    data: announcementsData,
    isLoading: isAnnouncementsLoading,
    refetch: refetchAnnouncements,
  } = useGetAnnouncementsQuery(query);

  const { data: teachersData } = useGetOnlyTeachersQuery({
    search: teacherSearchTerm,
  });
  const { data: batchesData } = useGetBatchesQuery(batchSearchTerm);
  const { data: subjectsData } = useGetSubjectsQuery();
  const { data: departmentsData } = useGetDepartmentsQuery();

  const teachers = useMemo(() => teachersData?.data || [], [teachersData]);
  const batches = useMemo(() => batchesData?.data || [], [batchesData]);
  const subjects = useMemo(() => {
    const data = subjectsData?.data || [];
    return data.flatMap((subject) =>
      subject.options ? subject.options : subject,
    );
  }, [subjectsData]);
  const departments = useMemo(
    () => departmentsData?.data || [],
    [departmentsData],
  );
  const allAnnouncements = useMemo(
    () => announcementsData?.data || [],
    [announcementsData],
  );

  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
  const [activeNav, setActiveNav] = useState("All Announcements");

  const teacherDropdownRef = useRef(null);
  const batchDropdownRef = useRef(null);
  const deptDropdownRef = useRef(null);
  const subDropdownRef = useRef(null);

  // derived booleans
  const isEditMode = Boolean(editingId);
  const isMutating = isCreating || isUpdating;

  useEffect(() => {
    if (allAnnouncements.length > 0) {
      setAnnouncements(allAnnouncements);
      if (!selectedAnnouncement) setSelectedAnnouncement(allAnnouncements[0]);
    }
  }, [allAnnouncements, selectedAnnouncement]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
        setIsMobileDetailView(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      [
        { ref: teacherDropdownRef, setter: setShowTeacherDropdown },
        { ref: batchDropdownRef, setter: setShowBatchDropdown },
        { ref: deptDropdownRef, setter: setShowDeptDropdown },
        { ref: subDropdownRef, setter: setShowSubDropdown },
      ].forEach(({ ref, setter }) => {
        if (ref.current && !ref.current.contains(event.target)) setter(false);
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(
      (a) =>
        a?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a?.type?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [announcements, searchQuery]);

  const filteredTeachers = useMemo(() => {
    if (!teacherSearchTerm.trim()) return teachers;
    const term = teacherSearchTerm.toLowerCase();
    return teachers.filter(
      (t) => t?.name?.toLowerCase().includes(term) || t?.phone?.includes(term),
    );
  }, [teacherSearchTerm, teachers]);

  const filteredBatches = useMemo(() => {
    if (!batchSearchTerm.trim()) return batches;
    const term = batchSearchTerm.toLowerCase();
    return batches.filter(
      (b) =>
        b?.title?.toLowerCase().includes(term) ||
        b?.code?.toLowerCase().includes(term),
    );
  }, [batchSearchTerm, batches]);

  const filteredDepts = useMemo(() => {
    if (!deptSearchTerm.trim()) return departments;
    const term = deptSearchTerm.toLowerCase();
    return departments.filter((d) => d?.name?.toLowerCase().includes(term));
  }, [departments, deptSearchTerm]);

  const filteredSubjects = useMemo(() => {
    if (!subSearchTerm.trim()) return subjects;
    const term = subSearchTerm.toLowerCase();
    return subjects.filter((s) => {
      const name = typeof s === "string" ? s : s?.name || s?.title || "";
      return name.toLowerCase().includes(term);
    });
  }, [subSearchTerm, subjects]);

  const formatDate = (ds) => {
    if (!ds) return "";
    return new Date(ds).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const [h, m] = ts.split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const getExpiryColor = (days) => {
    const d = parseInt(days);
    if (d <= 2) return "#ef4444";
    if (d <= 4) return "#f59e0b";
    return "#10b981";
  };

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setEditingId(null);
    setTeacherSearchTerm("");
    setBatchSearchTerm("");
    setDeptSearchTerm("");
    setSubSearchTerm("");
    setSelectedBatch(null);
    setSelectedDept(null);
    setSelectedSubject(null);
    setShowTeacherDropdown(false);
    setShowBatchDropdown(false);
    setShowDeptDropdown(false);
    setShowSubDropdown(false);
  }, []);

  const clearTeacherSelection = () => {
    setFormData((p) => ({ ...p, teacher: null }));
    setTeacherSearchTerm("");
  };
  const clearBatchSelection = () => {
    setSelectedBatch(null);
    setFormData((p) => ({ ...p, batch: "" }));
    setBatchSearchTerm("");
  };
  const clearDeptSelection = () => {
    setSelectedDept(null);
    setFormData((p) => ({ ...p, department: "" }));
    setDeptSearchTerm("");
  };
  const clearSubjectSelection = () => {
    setSelectedSubject(null);
    setFormData((p) => ({ ...p, subject: "" }));
    setSubSearchTerm("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const next = { ...prev };
      if (type === "checkbox") {
        next[name] = checked;
        if (name === "sendToStudent" && !checked) {
          next.sendToAllStudent = false;
          clearBatchSelection();
          clearDeptSelection();
          clearSubjectSelection();
        }
        if (name === "sendToAllStudent" && checked) {
          clearBatchSelection();
          clearDeptSelection();
          clearSubjectSelection();
        }
        if (name === "sendToTeacher" && !checked) {
          next.sendToAllTeacher = false;
          clearTeacherSelection();
        }
        if (name === "sendToAllTeacher" && checked) {
          clearTeacherSelection();
        }
      } else {
        next[name] = value;
        if (name === "type" && value !== "result") next.file = null;
      }
      return next;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData((p) => ({ ...p, file: null }));
      return;
    }
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF, JPG, JPEG, PNG allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB.");
      return;
    }
    setFormData((p) => ({ ...p, file }));
  };

  const handleTeacherSelect = (teacher) => {
    setFormData((p) => ({
      ...p,
      teacher: {
        id: teacher.userId,
        name: teacher.userName,
        phone: teacher.phone,
      },
    }));
    setTeacherSearchTerm(teacher.userName);
    setShowTeacherDropdown(false);
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    setFormData((p) => ({ ...p, batch: batch.title }));
    setBatchSearchTerm(batch.title);
    setShowBatchDropdown(false);
  };

  const handleDeptSelect = (dept) => {
    setSelectedDept(dept);
    setFormData((p) => ({ ...p, department: dept.name }));
    setDeptSearchTerm(dept.name);
    setShowDeptDropdown(false);
  };

  const handleSubjectSelect = (subject) => {
    const name =
      typeof subject === "string"
        ? subject
        : subject?.name || subject?.title || subject;
    setSelectedSubject(name);
    setFormData((p) => ({ ...p, subject: name }));
    setSubSearchTerm(name);
    setShowSubDropdown(false);
  };

  const handleDownload = async (e, attachment) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!attachment?.url) {
      toast.error("File not found!");
      return;
    }
    const SERVER = import.meta.env.VITE_SERVER_BASE_URL;
    let filePath = attachment.url;
    if (attachment.type === "pdf" && !filePath.includes("/pdfs/"))
      filePath = filePath.replace("/uploads/", "/uploads/pdfs/");
    const fullUrl = `${SERVER}${filePath}`;
    try {
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.name || "file");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(fullUrl, "_blank");
    }
  };

  /* ── UNIFIED SUBMIT (create or update) ── */
  const handleSubmit = async (e, overrideStatus) => {
    if (e?.preventDefault) e.preventDefault();

    const status = overrideStatus || formData.status || "draft";

    if (
      !formData.title.trim() ||
      !formData.type ||
      !formData.date ||
      !formData.time
    ) {
      toast.error("Title, Type, Date, and Time are required");
      return;
    }

    const hasStudent = formData.sendToStudent;
    const hasTeacher = formData.sendToTeacher;

    if (!hasStudent && !hasTeacher) {
      toast.error("Select at least one audience (Student or Teacher)");
      return;
    }

    if (hasStudent && !formData.sendToAllStudent) {
      if (!formData.batch || !formData.department) {
        toast.error(
          "Batch and Department are required for students (or check Send to All Students)",
        );
        return;
      }
    }

    if (hasTeacher && !formData.sendToAllTeacher && !formData.teacher?.id) {
      toast.error("Select a teacher or check Send to All Teachers");
      return;
    }

    if (formData.type === "result" && !formData.file && !isEditMode) {
      toast.error("Upload a result file");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("content", formData.content);
      fd.append("type", formData.type);
      fd.append("status", status);
      fd.append("date", formData.date);
      fd.append("time", formData.time);
      fd.append("roomNumber", formData.roomNumber || "");
      fd.append("isUrgent", formData.isUrgent);
      if (formData.file) fd.append("file", formData.file);

      const audienceData = {
        student: {
          enabled: hasStudent,
          sendToAll: formData.sendToAllStudent,
          batch: hasStudent && !formData.sendToAllStudent ? formData.batch : "",
          department:
            hasStudent && !formData.sendToAllStudent ? formData.department : "",
          subject:
            hasStudent && !formData.sendToAllStudent ? formData.subject : "",
        },
        teacher: {
          enabled: hasTeacher,
          sendToAll: formData.sendToAllTeacher,
          teacherId:
            hasTeacher && !formData.sendToAllTeacher
              ? formData.teacher?.id
              : null,
          name:
            hasTeacher && !formData.sendToAllTeacher
              ? formData.teacher?.name
              : "",
          phone:
            hasTeacher && !formData.sendToAllTeacher
              ? formData.teacher?.phone
              : "",
        },
      };

      fd.append("audience", JSON.stringify(audienceData));

      if (isEditMode) {
        // ── UPDATE ──
        const result = await updateAnnouncement({
          id: editingId,
          data: fd,
        }).unwrap();

        if (result.success) {
          await refetchAnnouncements();
          toast.success("Announcement updated!");
          resetForm();
          setIsComposing(false);
          setIsMobileDetailView(false);
        } else {
          toast.error(result.message || "Failed to update");
        }
      } else {
        // ── CREATE ──
        const result = await createAnnouncement(fd).unwrap();
        if (result.success) {
          await refetchAnnouncements();
          toast.success("Announcement created!");
          resetForm();
          setIsComposing(false);
          setIsMobileDetailView(false);
        } else {
          toast.error(result.message || "Failed to create");
        }
      }
    } catch (error) {
      toast.error(
        error?.data?.message ||
          (isEditMode
            ? "Failed to update announcement"
            : "Failed to create announcement"),
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(id).unwrap();
      toast.success("Deleted successfully!");
      const updated = announcements.filter((a) => a._id !== id);
      setAnnouncements(updated);
      if (selectedAnnouncement?._id === id) {
        setSelectedAnnouncement(updated[0] || null);
        if (window.innerWidth < 1024) setIsMobileDetailView(false);
      }
      refetchAnnouncements();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete announcement");
    }
  };

  const startComposing = () => {
    resetForm();
    setIsComposing(true);
    setSidebarOpen(false);
    if (window.innerWidth < 1024) setIsMobileDetailView(true);
  };

  /* ── Open Edit Form pre-filled ── */
  const startEditing = (ann) => {
    setEditingId(ann._id);
    setIsComposing(true);
    setFormData({
      title: ann.title,
      type: ann.type,
      date: ann.date,
      time: ann.time,
      roomNumber: ann.roomNumber || "",
      content: ann.content,
      sendToStudent: ann.audience?.student?.enabled || false,
      sendToAllStudent: ann.audience?.student?.sendToAll || false,
      sendToTeacher: ann.audience?.teacher?.enabled || false,
      sendToAllTeacher: ann.audience?.teacher?.sendToAll || false,
      batch: ann.audience?.student?.batch || "",
      department: ann.audience?.student?.department || "",
      subject: ann.audience?.student?.subject || "",
      teacher: ann.audience?.teacher?.name
        ? {
            id: ann.audience.teacher.teacherId,
            name: ann.audience.teacher.name,
            phone: ann.audience.teacher.phone,
          }
        : null,
      isUrgent: ann.isUrgent || false,
      status: ann.status,
      file: null,
    });
    if (ann.audience?.student?.batch) {
      const b = batches.find((b) => b.title === ann.audience.student.batch);
      if (b) {
        setSelectedBatch(b);
        setBatchSearchTerm(b.title);
      }
    }
    if (ann.audience?.student?.department) {
      const d = departments.find(
        (d) => d.name === ann.audience.student.department,
      );
      if (d) {
        setSelectedDept(d);
        setDeptSearchTerm(d.name);
      }
    }
    if (ann.audience?.student?.subject) {
      setSelectedSubject(ann.audience.student.subject);
      setSubSearchTerm(ann.audience.student.subject);
    }
    if (ann.audience?.teacher?.name) {
      setTeacherSearchTerm(ann.audience.teacher.name);
    }
    if (window.innerWidth < 1024) setIsMobileDetailView(true);
  };

  const handleAnnouncementSelect = (ann) => {
    setSelectedAnnouncement(ann);
    setIsComposing(false);
    if (window.innerWidth < 1024) setIsMobileDetailView(true);
  };

  const handleBackToInbox = () => {
    setIsMobileDetailView(false);
    setIsComposing(false);
  };

  const today = new Date().toISOString().split("T")[0];

  /* ─────────────────────── CSS VARS ─────────────────────── */
  const cssVars = `
    :root {
      --notion-bg: #ffffff;
      --notion-hover: #f7f7f5;
      --notion-selected: #e8f0fe;
      --notion-border: #e9e9e7;
      --notion-border-strong: #d3d3cf;
      --notion-text: #1a1a1a;
      --notion-text-secondary: #6b7280;
      --notion-sidebar: #f7f7f5;
      --notion-sidebar-hover: #eeeeed;
      --notion-accent: #3b82f6;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --notion-hover: #4f4e4e;
        --notion-selected: #1e2d4d;
        --notion-border: #e2e2e2;
        --notion-border-strong: #3a3a3a;
        --notion-text: #656565;
        --notion-text-secondary: #9b9b98;
        --notion-sidebar: #1e1e1e;
        --notion-sidebar-hover: #2a2a2a;
        --notion-accent: #4f8ef7;
      }
    }
    .dark {
      --notion-bg: #191919;
      --notion-hover: #252525;
      --notion-selected: #1e2d4d;
      --notion-border: #2f2f2f;
      --notion-border-strong: #3a3a3a;
      --notion-text: #e8e8e6;
      --notion-text-secondary: #9b9b98;
      --notion-sidebar: #1e1e1e;
      --notion-sidebar-hover: #2a2a2a;
      --notion-accent: #4f8ef7;
    }
    .notion-input:focus { border-color: var(--notion-accent) !important; }
    .notion-select { appearance: none; }
    .notion-textarea { resize: vertical; }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--notion-border-strong); border-radius: 3px; }
    .notion-nav-item:hover { background: var(--notion-sidebar-hover) !important; }
    .nav-active { background: var(--notion-sidebar-hover) !important; color: var(--notion-accent) !important; }
  `;

  /* ─────────────────────── RENDER ─────────────────────── */

  return (
    <>
      <style>{cssVars}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          background: "var(--notion-bg)",
          color: "var(--notion-text)",
          fontFamily: "'Inter', 'Segoe UI', -apple-system, sans-serif",
          fontSize: 14,
          overflow: "hidden",
        }}
      >
        {/* ── BREADCRUMB / TOPBAR ── */}
        <div
          style={{
            height: 48,
            borderBottom: "1px solid var(--notion-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            background: "var(--notion-bg)",
            flexShrink: 0,
            zIndex: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 6,
                borderRadius: 6,
                display: "none",
                color: "var(--notion-text-secondary)",
              }}
              className="lg-hide"
            >
              <Menu size={18} />
            </button>
            {isMobileDetailView && (
              <button
                onClick={handleBackToInbox}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 6,
                  color: "var(--notion-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                color: "var(--notion-text-secondary)",
              }}
            >
              <Home size={14} />
              <ChevronRight size={13} />
              <span>Admin</span>
              <ChevronRight size={13} />
              <span
                style={{
                  color: "var(--notion-text)",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Megaphone size={14} />
                Announcements
              </span>
              {isComposing && (
                <>
                  <ChevronRight size={13} />
                  <span
                    style={{ color: "var(--notion-accent)", fontWeight: 500 }}
                  >
                    {isEditMode ? "Edit" : "New"}
                  </span>
                </>
              )}
              {selectedAnnouncement && !isComposing && (
                <>
                  <ChevronRight size={13} />
                  <span
                    style={{
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--notion-text)",
                    }}
                  >
                    {selectedAnnouncement.title}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── PAGE HEADER ── */}
        <div
          style={{
            padding: "24px 24px 0 24px",
            flexShrink: 0,
            borderBottom: "1px solid var(--notion-border)",
            background: "var(--notion-bg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Megaphone size={18} color="white" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.2,
                  color: "var(--notion-text)",
                }}
              >
                Announcements
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--notion-text-secondary)",
                  margin: "4px 0 0 0",
                }}
              >
                Manage and broadcast announcements to students and teachers
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{ display: "flex", justifyContent: "space-between", gap: 4 }}
          >
            <div className="flex items-center">
              {[
                {
                  label: "All Announcements",
                  icon: Inbox,
                  count: allAnnouncements.length,
                },
                {
                  label: "Published",
                  icon: Send,
                  count: allAnnouncements.filter(
                    (a) => a.status === "published",
                  ).length,
                },
                {
                  label: "Drafts",
                  icon: FileText,
                  count: allAnnouncements.filter((a) => a.status === "draft")
                    .length,
                },
              ]?.map((tab) => (
                <>
                  <button
                    key={tab.label}
                    onClick={() => {
                      setActiveNav(tab.label);
                      if (tab.label === "All Announcements")
                        setAnnouncements(allAnnouncements);
                      else if (tab.label === "Published")
                        setAnnouncements(
                          allAnnouncements.filter(
                            (a) => a.status === "published",
                          ),
                        );
                      else if (tab.label === "Drafts")
                        setAnnouncements(
                          allAnnouncements.filter((a) => a.status === "draft"),
                        );
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      border: "none",
                      borderBottom:
                        activeNav === tab.label
                          ? "2px solid var(--notion-accent)"
                          : "2px solid transparent",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: activeNav === tab.label ? 600 : 400,
                      color:
                        activeNav === tab.label
                          ? "var(--notion-accent)"
                          : "var(--notion-text-secondary)",
                      borderRadius: "0",
                      transition: "all 0.15s",
                      marginBottom: -1,
                    }}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                    <span
                      style={{
                        padding: "1px 6px",
                        borderRadius: 10,
                        fontSize: 11,
                        background:
                          activeNav === tab.label
                            ? "var(--notion-accent)"
                            : "var(--notion-border)",
                        color:
                          activeNav === tab.label
                            ? "white"
                            : "var(--notion-text-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      {tab?.count}
                    </span>
                  </button>
                </>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={startComposing}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: "var(--notion-accent)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <Plus size={14} />
                <span>New</span>
              </button>
              <button
                onClick={refetchAnnouncements}
                style={{
                  background: "none",
                  border: "1px solid var(--notion-border-strong)",
                  borderRadius: 6,
                  padding: "6px 8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "var(--notion-text-secondary)",
                }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN BODY ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* ── LEFT PANEL: Announcement List ── */}
          <div
            style={{
              width: isMobileDetailView ? "0" : "100%",
              maxWidth: isMobileDetailView ? 0 : undefined,
              overflow: isMobileDetailView ? "hidden" : "hidden",
              borderRight: "1px solid var(--notion-border)",
              display: "flex",
              flexDirection: "column",
              background: "var(--notion-bg)",
              transition: "width 0.2s",
            }}
            className="list-panel"
          >
            {/* Search Bar */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--notion-border)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid var(--notion-border-strong)",
                  borderRadius: 6,
                  padding: "7px 10px",
                  background: "var(--notion-hover)",
                }}
              >
                <Search size={14} color="var(--notion-text-secondary)" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 13,
                    color: "var(--notion-text)",
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--notion-text-secondary)",
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Count */}
            <div
              style={{
                padding: "8px 16px 6px",
                fontSize: 11,
                color: "var(--notion-text-secondary)",
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              {filteredAnnouncements?.length} Announcements
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {isAnnouncementsLoading ? (
                <div
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "var(--notion-text-secondary)",
                  }}
                >
                  <RefreshCw
                    size={20}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <div style={{ marginTop: 8, fontSize: 13 }}>Loading...</div>
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "var(--notion-text-secondary)",
                  }}
                >
                  <Inbox
                    size={32}
                    style={{ opacity: 0.4, margin: "0 auto 12px" }}
                  />
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    No announcements
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {searchQuery
                      ? "Try a different search"
                      : "Create one to get started"}
                  </div>
                  {!searchQuery && (
                    <button
                      onClick={startComposing}
                      style={{
                        marginTop: 16,
                        padding: "8px 16px",
                        background: "var(--notion-accent)",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      Create Announcement
                    </button>
                  )}
                </div>
              ) : (
                filteredAnnouncements.map((ann) => (
                  <React.Fragment key={ann._id}>
                    <AnnouncementItem
                      announcement={ann}
                      isSelected={selectedAnnouncement?._id === ann._id}
                      isComposing={isComposing}
                      onClick={() => handleAnnouncementSelect(ann)}
                      formatDate={formatDate}
                      formatTime={formatTime}
                      getExpiryColor={getExpiryColor}
                    />
                    <div
                      style={{
                        height: "1px",
                        background: "var(--notion-border)",
                      }}
                    />
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL: Detail / Compose ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "var(--notion-bg)",
              minWidth: 0,
            }}
          >
            {isComposing ? (
              /* ═══ CREATE / EDIT FORM ═══ */
              <div style={{ flex: 1, overflowY: "auto" }}>
                {/* Form Header */}
                <div
                  style={{
                    padding: "20px 32px 16px",
                    borderBottom: "1px solid var(--notion-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                    background: "var(--notion-bg)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: isEditMode
                          ? "#f97316"
                          : "var(--notion-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Edit3 size={14} color="white" />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "var(--notion-text)",
                        }}
                      >
                        {isEditMode ? "Edit Announcement" : "New Announcement"}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--notion-text-secondary)",
                        }}
                      >
                        {isEditMode
                          ? "Update the details below"
                          : "Fill in the details below"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsComposing(false);
                      setIsMobileDetailView(false);
                      resetForm();
                    }}
                    style={{
                      background: "none",
                      border: "1px solid var(--notion-border-strong)",
                      borderRadius: 6,
                      padding: "5px 10px",
                      cursor: "pointer",
                      fontSize: 13,
                      color: "var(--notion-text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <X size={13} /> Cancel
                  </button>
                </div>

                {/* Form Body */}
                <form
                  onSubmit={handleSubmit}
                  style={{ padding: "24px 32px", maxWidth: 800 }}
                >
                  {/* Title */}
                  <Field label="Title" required>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Announcement title..."
                      className="notion-input"
                      style={{
                        ...notionInputStyle,
                        fontSize: 16,
                        fontWeight: 600,
                        padding: "10px 12px",
                      }}
                      required
                    />
                  </Field>

                  <div
                    style={{
                      marginTop: 20,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <Field label="Type" required>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="notion-input notion-select"
                        style={notionInputStyle}
                        required
                      >
                        <option value="" disabled>
                          Select type...
                        </option>
                        {announcementTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.icon} {t.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Status">
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="notion-input notion-select"
                        style={notionInputStyle}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </Field>
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <Field label="Date" required>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={today}
                        className="notion-input"
                        style={notionInputStyle}
                        required
                      />
                    </Field>
                    <Field label="Time" required>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="notion-input"
                        style={notionInputStyle}
                        required
                      />
                    </Field>
                    <Field label="Room Number">
                      <input
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. A-205"
                        className="notion-input"
                        style={notionInputStyle}
                      />
                    </Field>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <Field label="Content" required>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Write your announcement here..."
                        className="notion-input notion-textarea"
                        style={{
                          ...notionInputStyle,
                          minHeight: 140,
                          lineHeight: 1.6,
                        }}
                        required
                      />
                    </Field>
                  </div>

                  {/* Result File Upload */}
                  {formData.type === "result" && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: 16,
                        border: "1px solid #fbbf24",
                        borderRadius: 8,
                        background: "#fffbeb",
                      }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#92400e",
                          display: "block",
                          marginBottom: 10,
                        }}
                      >
                        <Paperclip size={13} style={{ marginRight: 6 }} />
                        Upload Result File{" "}
                        {!isEditMode && (
                          <span style={{ color: "#ef4444" }}>*</span>
                        )}
                        {isEditMode && (
                          <span style={{ color: "#92400e", fontWeight: 400 }}>
                            {" "}
                            (leave empty to keep existing)
                          </span>
                        )}
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ fontSize: 13 }}
                      />
                      <div
                        style={{ fontSize: 11, color: "#78716c", marginTop: 6 }}
                      >
                        PDF, JPG, JPEG, PNG — max 5MB
                      </div>
                      {formData.file && (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            color: "#059669",
                            fontWeight: 500,
                          }}
                        >
                          ✓ {formData.file.name}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── AUDIENCE SECTION ── */}
                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 20,
                      borderTop: "1px solid var(--notion-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 16,
                      }}
                    >
                      <Users size={16} color="var(--notion-text-secondary)" />
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--notion-text)",
                        }}
                      >
                        Audience
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--notion-text-secondary)",
                        }}
                      >
                        — Select who receives this
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                      }}
                    >
                      {/* ── STUDENT CARD ── */}
                      <AudienceCard
                        active={formData.sendToStudent}
                        accentColor="#3b82f6"
                      >
                        <NotionCheckbox
                          name="sendToStudent"
                          checked={formData.sendToStudent}
                          onChange={handleInputChange}
                          label="Send to Students"
                          color="#3b82f6"
                        />

                        {formData.sendToStudent && (
                          <div
                            style={{
                              marginTop: 12,
                              paddingTop: 12,
                              borderTop: "1px solid var(--notion-border)",
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                            }}
                          >
                            <NotionCheckbox
                              name="sendToAllStudent"
                              checked={formData.sendToAllStudent}
                              onChange={handleInputChange}
                              label="Send to All Students"
                              color="#3b82f6"
                            />

                            {!formData.sendToAllStudent && (
                              <>
                                <NotionDropdown
                                  label="Batch"
                                  required
                                  searchTerm={batchSearchTerm}
                                  setSearchTerm={setBatchSearchTerm}
                                  showDropdown={showBatchDropdown}
                                  setShowDropdown={setShowBatchDropdown}
                                  dropdownRef={batchDropdownRef}
                                  filteredItems={filteredBatches}
                                  onSelect={handleBatchSelect}
                                  selectedItem={selectedBatch}
                                  clearSelection={clearBatchSelection}
                                  placeholder="Search batches..."
                                  getItemLabel={(i) => i.title}
                                  renderItem={(i) => (
                                    <div>
                                      <div
                                        style={{
                                          fontSize: 13,
                                          fontWeight: 500,
                                          color: "var(--notion-text)",
                                        }}
                                      >
                                        {i.title}
                                      </div>
                                      {i.code && (
                                        <div
                                          style={{
                                            fontSize: 11,
                                            color:
                                              "var(--notion-text-secondary)",
                                          }}
                                        >
                                          {i.code}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                />
                                <NotionDropdown
                                  label="Department"
                                  required
                                  searchTerm={deptSearchTerm}
                                  setSearchTerm={setDeptSearchTerm}
                                  showDropdown={showDeptDropdown}
                                  setShowDropdown={setShowDeptDropdown}
                                  dropdownRef={deptDropdownRef}
                                  filteredItems={filteredDepts}
                                  onSelect={handleDeptSelect}
                                  selectedItem={selectedDept}
                                  clearSelection={clearDeptSelection}
                                  placeholder="Search departments..."
                                  getItemLabel={(i) => i.name}
                                />
                                <NotionDropdown
                                  label="Subject"
                                  searchTerm={subSearchTerm}
                                  setSearchTerm={setSubSearchTerm}
                                  showDropdown={showSubDropdown}
                                  setShowDropdown={setShowSubDropdown}
                                  dropdownRef={subDropdownRef}
                                  filteredItems={filteredSubjects}
                                  onSelect={handleSubjectSelect}
                                  selectedItem={selectedSubject}
                                  clearSelection={clearSubjectSelection}
                                  placeholder="Search subjects..."
                                  getItemLabel={(i) =>
                                    typeof i === "string"
                                      ? i
                                      : i?.name || i?.title || ""
                                  }
                                />
                              </>
                            )}
                          </div>
                        )}
                      </AudienceCard>

                      {/* ── TEACHER CARD ── */}
                      <AudienceCard
                        active={formData.sendToTeacher}
                        accentColor="#10b981"
                      >
                        <NotionCheckbox
                          name="sendToTeacher"
                          checked={formData.sendToTeacher}
                          onChange={handleInputChange}
                          label="Send to Teachers"
                          color="#10b981"
                        />

                        {formData.sendToTeacher && (
                          <div
                            style={{
                              marginTop: 12,
                              paddingTop: 12,
                              borderTop: "1px solid var(--notion-border)",
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                            }}
                          >
                            <NotionCheckbox
                              name="sendToAllTeacher"
                              checked={formData.sendToAllTeacher}
                              onChange={handleInputChange}
                              label="Send to All Teachers"
                              color="#10b981"
                            />

                            {!formData.sendToAllTeacher && (
                              <>
                                <NotionDropdown
                                  label="Teacher"
                                  required
                                  searchTerm={teacherSearchTerm}
                                  setSearchTerm={setTeacherSearchTerm}
                                  showDropdown={showTeacherDropdown}
                                  setShowDropdown={setShowTeacherDropdown}
                                  dropdownRef={teacherDropdownRef}
                                  filteredItems={filteredTeachers}
                                  onSelect={handleTeacherSelect}
                                  selectedItem={formData.teacher}
                                  clearSelection={clearTeacherSelection}
                                  placeholder="Search by name or phone..."
                                  getItemLabel={(i) => i.userName}
                                  renderItem={(i) => (
                                    <div>
                                      <div
                                        style={{
                                          fontSize: 13,
                                          fontWeight: 500,
                                          color: "var(--notion-text)",
                                        }}
                                      >
                                        {i.userName}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: 11,
                                          color: "var(--notion-text-secondary)",
                                        }}
                                      >
                                        {i.phone}
                                      </div>
                                    </div>
                                  )}
                                />
                                {formData.teacher && (
                                  <div
                                    style={{
                                      padding: "6px 10px",
                                      borderRadius: 6,
                                      background: "#d1fae5",
                                      fontSize: 12,
                                      color: "#065f46",
                                      fontWeight: 500,
                                    }}
                                  >
                                    ✓ {formData.teacher.name}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </AudienceCard>
                    </div>
                  </div>

                  {/* Urgent */}
                  <div
                    style={{
                      marginTop: 16,
                      padding: "12px 16px",
                      border: "1px solid #fca5a5",
                      borderRadius: 8,
                      background: "#fff5f5",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <NotionCheckbox
                      name="isUrgent"
                      checked={formData.isUrgent}
                      onChange={handleInputChange}
                      label="Mark as Urgent"
                      color="#ef4444"
                    />
                    <span style={{ fontSize: 12, color: "#7f1d1d" }}>
                      Urgent announcements are highlighted with a red indicator
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      marginTop: 28,
                      paddingTop: 20,
                      borderTop: "1px solid var(--notion-border)",
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Primary button: "Save Changes" for edit, "Publish Now" for create */}
                    <button
                      type="submit"
                      disabled={isMutating}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 20px",
                        background: isEditMode
                          ? "#f97316"
                          : "var(--notion-accent)",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: isMutating ? "not-allowed" : "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                        opacity: isMutating ? 0.7 : 1,
                      }}
                    >
                      <CheckCircle2 size={14} />
                      {isEditMode
                        ? isUpdating
                          ? "Saving..."
                          : "Save Changes"
                        : isCreating
                          ? "Publishing..."
                          : "Publish Now"}
                    </button>

                    {/* Save as Draft: hidden in edit mode (already has a status selector) */}
                    {!isEditMode && (
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => handleSubmit(null, "draft")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "9px 16px",
                          background: "transparent",
                          color: "var(--notion-text)",
                          border: "1px solid var(--notion-border-strong)",
                          borderRadius: 6,
                          cursor: isMutating ? "not-allowed" : "pointer",
                          fontSize: 13,
                          fontWeight: 500,
                          opacity: isMutating ? 0.6 : 1,
                        }}
                      >
                        <FileText size={14} />
                        Save as Draft
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsComposing(false);
                        setIsMobileDetailView(false);
                        resetForm();
                      }}
                      disabled={isMutating}
                      style={{
                        padding: "9px 14px",
                        background: "transparent",
                        color: "var(--notion-text-secondary)",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedAnnouncement ? (
              /* ═══ DETAIL VIEW ═══ */
              <div style={{ flex: 1, overflowY: "auto" }}>
                {/* Detail Header */}
                <div
                  style={{
                    padding: "20px 32px 16px",
                    borderBottom: "1px solid var(--notion-border)",
                    background: "var(--notion-bg)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <TypeBadge type={selectedAnnouncement.type} size="md" />
                        <StatusPill status={selectedAnnouncement.status} />
                        {selectedAnnouncement.isUrgent && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "#ef4444",
                              fontWeight: 700,
                              padding: "2px 8px",
                              background: "#fee2e2",
                              borderRadius: 12,
                            }}
                          >
                            🔴 URGENT
                          </span>
                        )}
                      </div>
                      <h2
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: "var(--notion-text)",
                          margin: 0,
                          lineHeight: 1.3,
                        }}
                      >
                        {selectedAnnouncement.title}
                      </h2>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => startEditing(selectedAnnouncement)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 12px",
                          background: "none",
                          border: "1px solid var(--notion-border-strong)",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          color: "var(--notion-text)",
                        }}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(selectedAnnouncement?._id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 12px",
                          background: "none",
                          border: "1px solid #fca5a5",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          color: "#ef4444",
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detail Body */}
                <div style={{ padding: "24px 32px", maxWidth: 800 }}>
                  {/* Meta info */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 20,
                      padding: "14px 16px",
                      border: "1px solid var(--notion-border)",
                      borderRadius: 8,
                      background: "var(--notion-hover)",
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        color: "var(--notion-text-secondary)",
                      }}
                    >
                      <Calendar size={14} />
                      <span
                        style={{ color: "var(--notion-text)", fontWeight: 500 }}
                      >
                        {formatDate(selectedAnnouncement.date)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        color: "var(--notion-text-secondary)",
                      }}
                    >
                      <Clock size={14} />
                      <span
                        style={{ color: "var(--notion-text)", fontWeight: 500 }}
                      >
                        {formatTime(selectedAnnouncement.time)}
                      </span>
                    </div>
                    {selectedAnnouncement.roomNumber && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          color: "var(--notion-text-secondary)",
                        }}
                      >
                        <MapPin size={14} />
                        <span
                          style={{
                            color: "var(--notion-text)",
                            fontWeight: 500,
                          }}
                        >
                          Room {selectedAnnouncement.roomNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expiry Warning */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      border: "1px solid #fde68a",
                      borderRadius: 8,
                      background: "#fffbeb",
                      marginBottom: 24,
                    }}
                  >
                    <AlertTriangle size={14} color="#d97706" />
                    <span style={{ fontSize: 13, color: "#92400e" }}>
                      Auto-deletes in:{" "}
                      <strong>{selectedAnnouncement?.remainingDays}</strong>
                    </span>
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.75,
                      color: "var(--notion-text)",
                      marginBottom: 24,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedAnnouncement?.content}
                  </div>

                  {/* Attachment */}
                  {selectedAnnouncement.attachment && (
                    <div style={{ marginBottom: 24 }}>
                      <button
                        onClick={(e) =>
                          handleDownload(e, selectedAnnouncement.attachment)
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 18px",
                          background: "var(--notion-accent)",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        <Download size={14} />
                        Download{" "}
                        {selectedAnnouncement.attachment.name || "Attachment"}
                      </button>
                    </div>
                  )}

                  {/* Audience */}
                  {(selectedAnnouncement.audience?.student?.enabled ||
                    selectedAnnouncement.audience?.teacher?.enabled) && (
                    <div
                      style={{
                        padding: 16,
                        border: "1px solid var(--notion-border)",
                        borderRadius: 8,
                        background: "var(--notion-hover)",
                        marginBottom: 24,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--notion-text)",
                          marginBottom: 12,
                        }}
                      >
                        <Users size={14} />
                        Sent To
                      </div>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        {selectedAnnouncement.audience?.student?.enabled && (
                          <span
                            style={{
                              padding: "5px 12px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 500,
                              background: "#dbeafe",
                              color: "#1e40af",
                            }}
                          >
                            🎓 Students
                            {selectedAnnouncement.audience.student.sendToAll
                              ? " — All"
                              : selectedAnnouncement.audience.student.batch
                                ? ` — ${selectedAnnouncement.audience.student.batch}`
                                : ""}
                          </span>
                        )}
                        {selectedAnnouncement.audience?.teacher?.enabled && (
                          <span
                            style={{
                              padding: "5px 12px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 500,
                              background: "#d1fae5",
                              color: "#065f46",
                            }}
                          >
                            👨‍🏫 Teachers
                            {selectedAnnouncement.audience.teacher.sendToAll
                              ? " — All"
                              : selectedAnnouncement.audience.teacher.name
                                ? ` — ${selectedAnnouncement.audience.teacher.name}`
                                : ""}
                          </span>
                        )}
                      </div>
                      {selectedAnnouncement.audience?.student?.department && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--notion-text-secondary)",
                            marginTop: 8,
                          }}
                        >
                          Dept:{" "}
                          {selectedAnnouncement.audience.student.department}
                          {selectedAnnouncement.audience?.student?.subject &&
                            ` • Subject: ${selectedAnnouncement.audience.student.subject}`}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Created at */}
                  {selectedAnnouncement.createdAt && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--notion-text-secondary)",
                        paddingTop: 16,
                        borderTop: "1px solid var(--notion-border)",
                      }}
                    >
                      Created {formatDate(selectedAnnouncement.createdAt)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ═══ EMPTY STATE ═══ */
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--notion-text-secondary)",
                  padding: 40,
                  textAlign: "center",
                }}
              >
                <Inbox size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    marginBottom: 6,
                    color: "var(--notion-text)",
                  }}
                >
                  No announcement selected
                </div>
                <div style={{ fontSize: 13 }}>
                  Choose one from the list, or create a new one
                </div>
                <button
                  onClick={startComposing}
                  style={{
                    marginTop: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 18px",
                    background: "var(--notion-accent)",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  <Plus size={14} /> New Announcement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .list-panel { min-width: 320px; max-width: 380px; }
        @media (max-width: 1024px) {
          .list-panel { min-width: unset; max-width: unset; flex: 1; }
          .lg-hide { display: flex !important; }
        }
        @media (min-width: 1024px) {
          .lg-hide { display: none !important; }
        }
        @media (max-width: 640px) {
          .grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
};

export default Announcement;

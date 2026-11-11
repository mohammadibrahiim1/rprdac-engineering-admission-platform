import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Megaphone,
  Plus,
  Search,
  Send,
  Trash2,
  X,
  Edit2,
  Calendar,
  User,
  Tag,
  Clock,
  Eye,
  EyeOff,
  Check,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import {
  useDeleteNoticeMutation,
  useGetAllNoticesQuery,
  usePostNoticeMutation,
  useUpdateNoticeMutation,
} from "../../../../../redux/features/notice/noticeApi";

// Helper function to format time ago
function getTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "Just now";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
}

const Notice = () => {
  const user = useSelector((state) => state?.auth?.user);
  const [viewMode, setViewMode] = useState("inbox"); // 'inbox', 'view', 'add', 'edit'
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 8;
  const [deletingId, setDeletingId] = useState(null);

  // RTK Query hooks
  const [postNotice] = usePostNoticeMutation();
  const [updateNotice] = useUpdateNoticeMutation();
  const [deleteNotice] = useDeleteNoticeMutation();

  const { data, isLoading, error, refetch } = useGetAllNoticesQuery({
    page,
    limit,
    date: selectedDate || null,
    author: selectedAuthor || null,
    search: searchTerm || null,
  });

  // Memoized data
  const notices = useMemo(() => data?.notices || [], [data]);
  const totalPages = useMemo(
    () => Math.ceil(data?.totalItems / limit) || 1,
    [data],
  );
  const uniqueAuthors = useMemo(() => {
    const authors = new Set();
    notices.forEach((notice) => {
      if (notice.author?.name) authors.add(notice.author.name);
    });
    return Array.from(authors);
  }, [notices]);

  // Reset form when switching modes
  useEffect(() => {
    if (viewMode === "add") {
      resetForm();
    }
  }, [viewMode]);

  // Character count effect
  useEffect(() => {
    setCharacterCount(content?.length);
  }, [content]);

  // Reset form function
  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
    setEditingNotice(null);
  };

  // Handle form submission for both add and edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a notice title");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter notice content");
      return;
    }

    setIsSubmitting(true);

    try {
      const noticeData = {
        title,
        content,
        tags,
        authorId: user?._id,
        authorName: user?.userName,
        authorRole: user?.userType,
      };

      if (viewMode === "edit" && editingNotice) {
        await updateNotice({
          id: editingNotice._id,
          ...noticeData,
        }).unwrap();
        toast.success("Notice updated successfully");
        setViewMode("view");
        setSelectedNotice({ ...editingNotice, ...noticeData });
      } else {
        await postNotice(noticeData).unwrap();
        toast.success("Notice created successfully");
        setViewMode("inbox");
      }
      resetForm();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save notice");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete notice handler
  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    setDeletingId(id);
    try {
      await deleteNotice(id).unwrap();
      toast.success("Notice deleted successfully");
      if (selectedNotice?._id === id) {
        setSelectedNotice(null);
        setViewMode("inbox");
      }
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete notice");
    } finally {
      setDeletingId(null);
    }
  };

  // Tag management
  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle notice selection
  const handleSelectNotice = (notice) => {
    setSelectedNotice(notice);
    setViewMode("view");
  };

  // Handle edit notice
  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setTags(notice.tags || []);
    setViewMode("edit");
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedDate("");
    setSelectedAuthor("");
    setPage(1);
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
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const slideIn = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Main Container */}
      <div className="relative z-10 px-6 py-10 mx-auto lg:py-16 lg:ps-12 lg:pe-6">
        {/* Enhanced Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="flex items-center gap-4 text-xl font-bold tracking-tighter text-gray-900 tracing-tight md:text-2xl">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-2xl">
                <Zap className="text-blue-600 w-7 h-7" />
              </div>
              All Notices Registry
            </h1>
            <p className="max-w-2xl mt-4 text-xs text-gray-500">
              “All important notices are listed here. Easily view and stay
              updated with the latest announcements.”
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode("add")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 w-full md:w-auto"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Create Notice</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Left Sidebar - Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Filter size={20} />
                  Filters
                </h2>
              </div>

              <AnimatePresence>
                {
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Search */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Search
                      </label>
                      <div className="relative">
                        <Search
                          className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                          size={18}
                        />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                          }}
                          placeholder="Search notices..."
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Date Filter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                          size={18}
                        />
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setPage(1);
                          }}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Author Filter */}
                    {uniqueAuthors.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Author
                        </label>
                        <select
                          value={selectedAuthor}
                          onChange={(e) => {
                            setSelectedAuthor(e.target.value);
                            setPage(1);
                          }}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Authors</option>
                          {uniqueAuthors?.map((author) => (
                            <option key={author} value={author}>
                              {author}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Clear Filters Button */}
                    {(searchTerm || selectedDate || selectedAuthor) && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={clearAllFilters}
                        className="w-full py-2 text-sm font-medium text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      >
                        Clear All Filters
                      </motion.button>
                    )}
                  </motion.div>
                }
              </AnimatePresence>

              {/* Stats */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <h3 className="mb-3 text-sm font-medium text-gray-700">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <p className="text-xs font-medium text-blue-600">Total</p>
                    <p className="text-xl font-bold text-blue-800">
                      {data?.totalItems || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <p className="text-xs font-medium text-green-600">Today</p>
                    <p className="text-xl font-bold text-green-800">
                      {
                        notices?.filter(
                          (notice) =>
                            new Date(notice?.createdAt).toDateString() ===
                            new Date().toDateString(),
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center - Notice Inbox */}
          <div className="lg:col-span-1">
            <motion.div
              variants={fadeIn}
              className="h-full border border-gray-200"
            >
              {/* Inbox Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notice Inbox
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-gray-600">
                    {data?.totalItems || 0} Notices found
                  </p>
                </div>
                {selectedNotice && (
                  <button
                    onClick={() => setViewMode("view")}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                  >
                    <Eye size={16} />
                    View
                  </button>
                )}
              </div>

              {/* Notices List */}
              <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-red-600 bg-red-100 rounded-full">
                      <X size={24} />
                    </div>
                    <p className="text-red-600">
                      {error?.data?.message || "Error loading notices"}
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Try Again
                    </button>
                  </div>
                ) : notices?.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-gray-400 bg-gray-100 rounded-full">
                      <Megaphone size={24} />
                    </div>
                    <p className="text-gray-500">No notices found</p>
                    {searchTerm || selectedDate || selectedAuthor ? (
                      <button
                        onClick={clearAllFilters}
                        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Clear filters
                      </button>
                    ) : (
                      <button
                        onClick={() => setViewMode("add")}
                        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Create your first notice
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notices?.map((notice) => (
                      <motion.div
                        key={notice._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => handleSelectNotice(notice)}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedNotice?._id === notice._id
                            ? "bg-blue-50 border-r-4 border-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate font-sans">
                              {notice?.title}
                            </h3>
                            <p className="mt-1 text-base text-gray-600 line-clamp-2 font-sans">
                              {notice?.content}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                Admin
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {getTimeAgo(new Date(notice?.createdAt))}
                              </span>
                            </div>
                          </div>
                          {notice?.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 ml-2">
                              {notice?.tags?.slice(0, 2).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="inline-flex items-center justify-center w-8 h-8 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 3) }).map(
                        (_, idx) => {
                          let pageNum;
                          if (totalPages <= 3) {
                            pageNum = idx + 1;
                          } else if (page === 1) {
                            pageNum = idx + 1;
                          } else if (page === totalPages) {
                            pageNum = totalPages - 2 + idx;
                          } else {
                            pageNum = page - 1 + idx;
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => setPage(pageNum)}
                              className={`inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                                page === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={page === totalPages}
                        className="inline-flex items-center justify-center w-8 h-8 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Side - Notice Details/Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* View Mode */}
              {viewMode === "view" && selectedNotice && (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full border border-gray-200"
                >
                  <div className="p-6">
                    {/* Header with Actions */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100">
                            <Megaphone size={20} className="text-blue-600" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            Notice Details
                          </h2>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {getTimeAgo(new Date(selectedNotice?.createdAt))}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditNotice(selectedNotice)}
                          className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                          title="Edit notice"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteNotice(selectedNotice?._id)
                          }
                          disabled={deletingId === selectedNotice._id}
                          className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Delete notice"
                        >
                          {deletingId === selectedNotice._id ? (
                            <div className="w-4 h-4 border-2 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Notice Content */}
                    <div className="space-y-6">
                      <div>
                        <p className="text-xl font-medium text-gray-900 font-sans">
                          {selectedNotice?.title}
                        </p>
                      </div>

                      <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-700 font-sans">
                          বিস্তারিত
                        </h3>
                        <div className="p-4 text-lg rounded-lg bg-gray-50 font-sans">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {selectedNotice?.content}
                          </p>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <h4 className="mb-1 text-sm font-medium text-gray-700">
                            Author
                          </h4>
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="text-gray-900">
                              RPR DUET Admission Care
                              {/* {selectedNotice?.author?.name} */}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium text-gray-700">
                            Role
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {selectedNotice.author?.role}
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      {selectedNotice.tags?.length > 0 && (
                        <div className="pt-4 border-t border-gray-200">
                          <h4 className="mb-2 text-sm font-medium text-gray-700">
                            Tags
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedNotice.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
                              >
                                <Tag size={12} className="mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Add/Edit Form */}
              {(viewMode === "add" || viewMode === "edit") && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full bg-white border border-gray-200"
                >
                  <div className="p-6">
                    {/* Form Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {viewMode === "edit" ? (
                            <Edit2 size={20} className="text-blue-600" />
                          ) : (
                            <Plus size={20} className="text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {viewMode === "edit"
                              ? "Edit Notice"
                              : "Create New Notice"}
                          </h2>
                          <p className="mt-1 text-sm text-gray-600">
                            {viewMode === "edit"
                              ? "Update the notice details"
                              : "Share important information with your community"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedNotice) {
                            setViewMode("view");
                          } else {
                            setViewMode("inbox");
                          }
                          resetForm();
                        }}
                        className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Title */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter notice title"
                          className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          maxLength={100}
                          required
                        />
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            Content <span className="text-red-500">*</span>
                          </label>
                          <span
                            className={`text-sm ${
                              characterCount > 450
                                ? "text-red-600"
                                : "text-gray-500"
                            }`}
                          >
                            {characterCount}/500
                          </span>
                        </div>
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Write your notice content here..."
                          rows={6}
                          className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          maxLength={500}
                          required
                        />
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Tags <span className="text-gray-500">(Optional)</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {tags.map((tag, index) => (
                            <motion.span
                              key={index}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="p-0.5 hover:bg-blue-200 rounded-full"
                              >
                                <X size={14} />
                              </button>
                            </motion.span>
                          ))}
                        </div>
                        <div className="flex">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Add a tag"
                            className="flex-1 px-4 py-2.5 transition-all border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddTag(e)
                            }
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-4 font-medium text-white transition-colors bg-blue-600 rounded-r-lg hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedNotice) {
                                setViewMode("view");
                              } else {
                                setViewMode("inbox");
                              }
                              resetForm();
                            }}
                            className="flex-1 px-4 py-3 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="flex-1 px-4 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                {viewMode === "edit"
                                  ? "Updating..."
                                  : "Publishing..."}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                {viewMode === "edit" ? (
                                  <>
                                    <Check size={18} />
                                    Update Notice
                                  </>
                                ) : (
                                  <>
                                    <Send size={18} />
                                    Publish Notice
                                  </>
                                )}
                              </div>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* Empty State */}
              {viewMode === "inbox" && !selectedNotice && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full p-8 text-center bg-white border border-gray-200"
                >
                  <div className="flex items-center justify-center w-16 h-16 mb-4 text-blue-600 bg-blue-100 rounded-full">
                    <Megaphone size={32} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Select a Notice
                  </h3>
                  <p className="text-gray-600">
                    Choose a notice from the inbox to view details, or create a
                    new notice to get started.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notice;

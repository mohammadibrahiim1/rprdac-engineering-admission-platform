import React, { useRef, useState, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Search,
  X,
} from 'lucide-react';
import {
  useDeleteResultMutation,
  useGetAllResultsQuery,
} from '../../../../../redux/features/result/resultApi';
import Loading from '../../../../../components/Loader';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

/* ------------------------------- component ------------------------------- */
const AddResults = () => {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filterDate, setFilterDate] = useState('');

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);

  const { data, isLoading, error, refetch } = useGetAllResultsQuery({
    page,
    limit,
  });
  const [deleteResult] = useDeleteResultMutation();

  const totalItems = data?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Filter results by date
  const filteredResults = useMemo(() => {
    const results = data?.data || [];
    if (!filterDate) return results;
    return results.filter((item) => {
      const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
      return itemDate === filterDate;
    });
  }, [data, filterDate]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /* ------------------------------ handlers ------------------------------ */
  const onFileSelect = (f) => {
    if (f?.type !== 'application/pdf') {
      toast.error('Only PDF files allowed');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setFile(f);
  };

  const uploadResult = async () => {
    if (!file || !title.trim()) {
      toast.error('File & title required');
      return;
    }

    const fd = new FormData();
    fd.append('pdfFile', file);
    fd.append('title', title);

    setUploading(true);
    setProgress(10);

    const fake = setInterval(
      () => setProgress((p) => Math.min(p + 15, 90)),
      300,
    );

    try {
      await axios.post(`${SERVER}/api/admin/result/upload-result`, fd);
      clearInterval(fake);
      setProgress(100);
      toast.success('Result uploaded successfully');
      setFile(null);
      setTitle('');
      refetch();
      setTimeout(() => setProgress(0), 1000);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const download = async (id, title) => {
    const toastId = toast.loading('Preparing download...');
    try {
      const res = await axios.get(`${SERVER}/api/admin/result/download/${id}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${title || 'result'}.pdf`;
      a.click();
      toast.success('Downloaded successfully', { id: toastId });
    } catch (error) {
      toast.error('Download failed', { id: toastId });
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    const toastId = toast.loading('Deleting...');
    try {
      await deleteResult(id).unwrap();
      toast.success('Result deleted successfully', { id: toastId });
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Delete failed', { id: toastId });
    }
  };

  const clearFilter = () => {
    setFilterDate('');
  };

  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4 text-red-500">Failed to load results</p>
          <button
            onClick={refetch}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  /* ---------------------------------- UI ---------------------------------- */
  return (
    <div className="min-h-screen px-6 py-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 lg:px-12">
      {/* Header  */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <nav className="flex items-center gap-2 text-sm font-medium">
          <div className="flex items-center gap-1.5 transition-colors hover:text-amber-600 cursor-pointer text-slate-600 dark:text-slate-400">
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="font-semibold text-transparent bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text">
            Result Management
          </span>
        </nav>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl blur-3xl" />
          <div className="relative">
            <h1 className="text-2xl font-bold md:text-2xl">
              <span className="text-transparent bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text">
                Result Management
              </span>
            </h1>
            <p className="max-w-2xl text-xs text-slate-600 dark:text-slate-400">
              Upload, publish and manage examination results efficiently
            </p>
          </div>
        </div>
      </motion.div>

      {/*  Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1"
        >
          <div className="sticky overflow-hidden bg-white border shadow-xl dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800 top-24">
            <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <Upload size={20} />
                Upload New Result
              </h3>
            </div>

            <div className="p-6 space-y-5">
              {/* File Upload Area */}
              <div
                onClick={() => fileRef.current.click()}
                className={`p-8 text-center transition-all border-2 border-dashed rounded-xl cursor-pointer
                  ${
                    file
                      ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                      : 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-500'
                  }`}
              >
                <input
                  type="file"
                  hidden
                  ref={fileRef}
                  accept="application/pdf"
                  onChange={(e) => onFileSelect(e.target.files[0])}
                />
                <Upload
                  className={`mx-auto mb-3 w-8 h-8 ${file ? 'text-green-500' : 'text-amber-600'}`}
                />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {file ? file.name : 'Click to upload PDF'}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  PDF only • Max 10MB
                </p>
              </div>

              {/* Title Input */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Result Title
                </label>
                <input
                  className="w-full px-4 py-3 transition-all bg-white border outline-none dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., BBA 4th Year Final Exam 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Progress Bar */}
              <AnimatePresence>
                {uploading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Uploading...
                      </span>
                      <span className="font-medium text-amber-600">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload Button */}
              <button
                onClick={uploadResult}
                disabled={uploading || !file || !title.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-xl
                  hover:from-amber-700 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  shadow-lg shadow-amber-600/25"
              >
                {uploading ? 'Uploading...' : 'Upload Result'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ------------------------- Results Table -------------------------- */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="overflow-hidden bg-white border shadow-xl dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800">
            {/* Table Header with Filter */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-lg font-bold text-transparent bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text">
                    Published Results
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Total {filteredResults?.length}{' '}
                    {filteredResults?.length === 1 ? 'result' : 'results'} found
                  </p>
                </div>

                {/* Date Filter Input */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all min-w-[200px]
                      ${
                        filterDate
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <Calendar
                        className={`w-4 h-4 ${filterDate ? 'text-amber-600' : 'text-slate-400'}`}
                      />
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full text-sm bg-transparent outline-none text-slate-700 dark:text-slate-300
                          [color-scheme:light_dark]"
                      />
                      {filterDate && (
                        <button
                          onClick={clearFilter}
                          className="p-1 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          <X size={14} className="text-slate-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500 dark:text-slate-400">
                      #
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500 dark:text-slate-400">
                      Title
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500 dark:text-slate-400">
                      Upload Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-right uppercase text-slate-500 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <AnimatePresence mode="wait">
                    {filteredResults?.length > 0 ? (
                      filteredResults?.map((r, i) => (
                        <motion.tr
                          key={r._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="transition-colors group hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-sans text-slate-500 dark:text-slate-400">
                              {String(page * limit + i + 1).padStart(2, '0')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg dark:bg-amber-900/30">
                                <FileText
                                  className="text-amber-500 dark:text-amber-400"
                                  size={18}
                                />
                              </div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {r.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {formatDate(r.createdAt)}
                              </span>
                              <span className="text-xs text-slate-500">
                                {timeAgo(r.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => download(r._id, r.title)}
                                className="p-2 transition-all rounded-lg text-amber-600 hover:text-orange-700 hover:bg-amber-50 dark:hover:bg-indigo-950/30"
                                title="Download"
                              >
                                <Download size={18} />
                              </button>
                              <button
                                onClick={() => remove(r._id)}
                                className="p-2 text-red-600 transition-all rounded-lg hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-20">
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="p-4 mb-4 rounded-full bg-slate-100 dark:bg-slate-800">
                              <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="mb-2 text-lg font-medium text-slate-700 dark:text-slate-300">
                              No results found
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {filterDate
                                ? 'No results match the selected date'
                                : 'Upload your first result to get started'}
                            </p>
                            {filterDate && (
                              <button
                                onClick={clearFilter}
                                className="px-4 py-2 mt-4 text-sm text-white transition-all rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600"
                              >
                                Clear Filter
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredResults?.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 p-6 border-t sm:flex-row border-slate-200 dark:border-slate-800">
                <p className="order-2 text-sm text-slate-500 dark:text-slate-400 sm:order-1">
                  Showing {page * limit + 1} to{' '}
                  {Math.min((page + 1) * limit, totalItems)} of {totalItems}{' '}
                  results
                </p>

                <div className="flex items-center order-1 gap-4 sm:order-2">
                  {/* Limit Selector */}
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(0);
                    }}
                    className="px-3 py-1 text-sm bg-white border rounded outline-none dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500"
                  >
                    {[5, 10, 20, 50].map((v) => (
                      <option key={v} value={v}>
                        {v} per page
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1 text-sm transition-colors border rounded border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-white rounded bg-gradient-to-r from-amber-600 to-orange-500">
                      {page + 1}
                    </span>
                    <button
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1 text-sm transition-colors border rounded border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddResults;

import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudUpload,
  FileText,
  Trash2,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Loader2,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";
import {
  useDeleteSolutionCopyMutation,
  useGetAllSolutionCopyQuery,
} from "../services/solutionCopyApi";
import { ISolutionCopy } from "../types/SolutionCopy.types";
import { toast } from "sonner";

const SERVER = import.meta.env.VITE_SERVER_BASE_URL as string;

const UploadSolutionCopy: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data,
    refetch,
    isLoading: isListLoading,
  } = useGetAllSolutionCopyQuery({ page, limit });

  const [deleteSolutionCopy] = useDeleteSolutionCopyMutation();

  const solutions: ISolutionCopy[] = data?.data || [];
  const totalItems: number = data?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // --- Handlers ---
  const downloadSolution = async (
    id: string,
    fileName: string,
  ): Promise<void> => {
    try {
      const res = await axios.get(`${SERVER}/api/solutionCopy/download/${id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName || "solution"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Permanent delete? This action cannot be undone."))
      return;
    setDeletingId(id);
    try {
      await deleteSolutionCopy(id).unwrap();
      toast.success("Document deleted");
      refetch();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileSelection = (selectedFile: File | undefined): void => {
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Only PDF files are accepted");
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!file || !title.trim()) {
      toast.error("Title and File are required");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("pdfFile", file);
    formData.append("title", title);

    try {
      await axios.post(`${SERVER}/api/solutionCopy/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      toast.success("Solution published successfully");
      setTitle("");
      setFile(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-indigo-100">
      <div className="px-4 py-10 max-w-7xl sm:px-6 lg:px-12">
        {/* Header */}
        <header className="pb-5 mb-10 border-b">
          <nav className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-1.5 transition-colors hover:text-blue-600 cursor-pointer">
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </div>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-semibold text-slate-900">Solution</span>
          </nav>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-1"
          >
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Solution Archives
            </h1>
            <p className="text-sm text-slate-500 md:text-base">
              Manage and distribute official solution copies. Professional PDF
              repository.
            </p>
          </motion.div>
        </header>

        <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Upload Form */}
          <aside className="space-y-6 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 text-indigo-600 rounded-lg bg-indigo-50">
                  <FileUp size={20} />
                </div>
                <h2 className="text-lg font-semibold">Upload Document</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTitle(e.target.value)
                    }
                    placeholder="Ex: Physics Semester 1 Solutions"
                    className="w-full px-3 py-2 text-sm transition-all bg-white border rounded-md outline-none border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    disabled={isUploading}
                  />
                </div>

                <div
                  onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFileSelection(e.dataTransfer.files?.[0]);
                  }}
                  className={`relative border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center p-8 text-center cursor-pointer
                    ${
                      isDragging
                        ? "border-indigo-500 bg-indigo-50/50"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }
                    ${file ? "border-emerald-500 bg-emerald-50/30" : ""}`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFileSelection(e.target.files?.[0])
                    }
                    disabled={isUploading}
                  />

                  {file ? (
                    <div className="duration-300 animate-in fade-in zoom-in">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 text-emerald-600">
                        <FileText size={24} />
                      </div>
                      <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-white border rounded-full shadow-sm border-slate-200 text-slate-400">
                        <CloudUpload size={24} />
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        Drag PDF or Click
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Maximum size 10MB
                      </p>
                    </>
                  )}
                </div>

                <AnimatePresence>
                  {isUploading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-600">Uploading...</span>
                        <span className="text-indigo-600">
                          {uploadProgress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-indigo-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleUpload}
                  disabled={!file || !title.trim() || isUploading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium transition-all hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isUploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  Publish Solution
                </button>
              </div>
            </motion.div>
          </aside>

          {/* Right Column: List Table */}
          <main className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-800">Recent Uploads</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-medium">
                  {totalItems} total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-slate-500 text-[13px] uppercase tracking-wider font-semibold border-b border-slate-100">
                      <th className="px-6 py-4 font-semibold">#</th>
                      <th className="px-6 py-4 font-semibold">Title</th>
                      <th className="px-6 py-4 font-semibold">Created At</th>
                      <th className="px-6 py-4 font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isListLoading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-20 text-center text-slate-400"
                        >
                          <Loader2
                            size={30}
                            className="mx-auto mb-2 text-indigo-500 animate-spin"
                          />
                          <p className="text-sm">Fetching repository...</p>
                        </td>
                      </tr>
                    ) : solutions.length > 0 ? (
                      solutions.map((item: ISolutionCopy, i: number) => (
                        <tr
                          key={item._id}
                          className="transition-colors group hover:bg-slate-50/80"
                        >
                          <td className="px-6 py-4">
                            <span className="font-medium text-slate-700">
                              {page * limit + i + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 transition-colors rounded bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                                <FileText size={18} />
                              </div>
                              <span className="font-medium text-slate-700 truncate max-w-[200px]">
                                {item.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  downloadSolution(item._id, item.title)
                                }
                                className="p-2 transition-all rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                title="Download PDF"
                              >
                                <Download size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                disabled={deletingId === item._id}
                                className="p-2 transition-all rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                                title="Delete Document"
                              >
                                {deletingId === item._id ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <div className="max-w-[240px] mx-auto text-slate-400">
                            <AlertCircle
                              size={40}
                              className="mx-auto mb-3 opacity-20"
                            />
                            <p className="text-sm">
                              No solutions found in the archive.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-500">
                    Page {page + 1} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page + 1 >= totalPages}
                      className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UploadSolutionCopy;

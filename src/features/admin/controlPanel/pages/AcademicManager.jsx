import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Building,
  ChevronRight,
  GraduationCap,
  Home,
  House,
  Layers,
  LayoutDashboard,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import {
  useCreateBatchMutation,
  useDeleteBatchMutation,
  useGetBatchesQuery,
} from "../../../../../redux/features/batch/batchApi";

import SubjectManagement from "../components/SubjectManagement";
import InstituteManagement from "../components/InstituteManagement";
import MessManagement from "../components/MessManagement";
import AcademicInfo from "../components/AcademicInfo";

export default function AcademicManager() {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("activeTab") || "batch",
  );
  const [batches, setBatches] = useState([{ title: "", slug: "" }]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  /* API Hooks */
  const { data } = useGetBatchesQuery(search);
  const allBatches = data?.data || [];

  const [createBatch, createState] = useCreateBatchMutation();
  const [deleteBatch] = useDeleteBatchMutation();

  /*   Typing Placeholder Effect  */
  useEffect(() => {
    const texts = ["Search batches...", "Find by batch name..."];
    let textIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const interval = setInterval(() => {
      const current = texts[textIndex];
      setPlaceholder(
        deleting
          ? current.slice(0, charIndex--)
          : current.slice(0, charIndex++),
      );

      if (!deleting && charIndex === current.length + 1) {
        deleting = true;
      }
      if (deleting && charIndex === 0) {
        deleting = false;
        textIndex = (textIndex + 1) % texts.length;
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (i, field, value) => {
    const copy = [...batches];
    copy[i][field] = value;
    setBatches(copy);
  };

  const addBatch = () =>
    setBatches((prev) => [...prev, { title: "", slug: "" }]);

  const removeBatch = (i) =>
    setBatches((prev) => prev.filter((_, index) => index !== i));

  const submitBatch = async (e) => {
    e.preventDefault();
    await createBatch(batches).unwrap();
    setBatches([{ title: "", slug: "" }]);
  };

  /* -------------------------------------------------------
     Tabs
  ------------------------------------------------------- */
  const tabs = [
    { key: "batch", label: "Batch", icon: Users },
    { key: "subject", label: "Subject", icon: BookOpen },
    { key: "institute", label: "Institute", icon: Building },
    { key: "mess", label: "Mess", icon: House },
    { key: "academic", label: "Academic", icon: GraduationCap },
  ];

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-white">
      {/*  Header  */}
      <header className="px-8 py-10 ">
        <nav className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-500">
          <div className="flex items-center gap-1.5 transition-colors hover:text-blue-600 cursor-pointer">
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </div>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="font-semibold text-slate-900">Academic</span>
        </nav>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Academic Management
          </h1>
          <p className="text-sm text-slate-500 md:text-base">
            Manage academic information.
          </p>
        </motion.div>
      </header>

      {/* Tabs */}
      <div className="sticky top-0 z-20 ml-5 border-b border-gray-200/50 bg-white/70 backdrop-blur-md">
        <div className="px-5">
          <nav className="relative flex items-center gap-1 py-3 overflow-x-auto no-scrollbar">
            {tabs.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 whitespace-nowrap
                  ${isActive ? "text-white" : "text-gray-500 hover:text-gray-900"}
                `}
                >
                  {/* The Animated Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 z-0 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20"
                      style={{ borderRadius: 9999 }}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}

                  {/* Content - Z-index keeps it above the pill */}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon
                      className={`w-4 h-4 transition-transform ${
                        isActive ? "scale-110" : "opacity-70"
                      }`}
                    />
                    {label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="px-5 py-10">
        {/* -------- Batch Management -------- */}
        {activeTab === "batch" && (
          <div className="w-full px-4 py-8 duration-500 md:px-8 max-w-7xl animate-in fade-in">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Form Section (5 Columns wide on LG) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-5"
              >
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                      Add Batches
                    </h2>
                    <p className="text-sm text-gray-500 text-muted-foreground">
                      Create multiple batch entries at once.
                    </p>
                  </div>

                  <form onSubmit={submitBatch} className="space-y-4">
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      <AnimatePresence mode="popLayout">
                        {batches?.map((b, i) => (
                          <motion.div
                            key={i}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative p-6 bg-white border border-gray-200 shadow-sm rounded-xl group"
                          >
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Batch Title
                                </label>
                                <input
                                  className="flex w-full h-10 px-3 py-2 text-sm transition-all bg-white border border-gray-200 rounded-md ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="e.g. Winter Morning 2024"
                                  value={b.title}
                                  onChange={(e) =>
                                    handleChange(i, "title", e.target.value)
                                  }
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                  Batch Slug
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-gray-400 text-xs">
                                    /
                                  </span>
                                  <input
                                    className="flex w-full h-10 py-2 pl-6 pr-3 text-sm transition-all bg-white border border-gray-200 rounded-md placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                                    placeholder="winter-morning-2024"
                                    value={b.slug}
                                    onChange={(e) =>
                                      handleChange(i, "slug", e.target.value)
                                    }
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {batches?.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeBatch(i)}
                                className="absolute p-2 text-gray-400 transition-colors top-2 right-2 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                      <button
                        type="button"
                        onClick={addBatch}
                        className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium transition-colors bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add More
                      </button>

                      <motion.button
                        type="submit"
                        disabled={createState.isLoading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
        relative inline-flex items-center justify-center h-11 px-8 py-2
        text-sm font-medium transition-all duration-200 rounded-lg shadow-sm
        ${
          createState.isLoading
            ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            : "bg-slate-900 text-white hover:bg-slate-800 border border-transparent shadow-md shadow-slate-200"
        }
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
        disabled:opacity-70 overflow-hidden
      `}
                      >
                        <AnimatePresence mode="wait">
                          {createState.isLoading ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2"
                            >
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Processing...</span>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="idle"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2"
                            >
                              Save Batches
                              <ChevronRight className="w-4 h-4 transition-transform opacity-70 group-hover:translate-x-1" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Subtle Background Shine Effect */}
                        {!createState.isLoading && (
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:animate-[shimmer_2s_infinite]" />
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>

              {/* Right Column: Table Section (7 Columns wide on LG) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-7"
              >
                <div className="flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden max-h-[80vh]">
                  {/* Search Header */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={placeholder || "Search batches..."}
                        className="flex w-full h-10 py-2 pl-10 pr-3 text-sm bg-white border border-gray-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                      />
                    </div>
                  </div>

                  {/* Table Area */}
                  <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 font-medium text-gray-500 uppercase text-[10px] tracking-wider">
                            #
                          </th>
                          <th className="px-4 py-3 font-medium text-gray-500 uppercase text-[10px] tracking-wider">
                            Batch Name
                          </th>
                          <th className="px-4 py-3 font-medium text-gray-500 uppercase text-[10px] tracking-wider">
                            Slug
                          </th>
                          <th className="px-4 py-3 font-medium text-center text-gray-500 uppercase text-[10px] tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {allBatches?.map((b, i) => (
                          <tr
                            key={b._id}
                            className="transition-colors hover:bg-gray-50/50 group"
                          >
                            <td className="px-4 py-4 font-mono text-xs text-gray-400">
                              {i + 1}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-emerald-500 opacity-70" />
                                <span className="font-medium text-gray-900">
                                  {b.title}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <code className="px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                                {b.slug}
                              </code>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button
                                onClick={() => deleteBatch({ id: b._id })}
                                className="p-2 text-gray-400 transition-colors rounded-lg hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {allBatches?.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-3 mb-3 bg-gray-100 rounded-full">
                          <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500">
                          No batches found matching your search.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === "subject" && <SubjectManagement />}
        {activeTab === "institute" && <InstituteManagement />}
        {activeTab === "mess" && <MessManagement />}
        {activeTab === "academic" && <AcademicInfo />}
      </main>
    </div>
  );
}

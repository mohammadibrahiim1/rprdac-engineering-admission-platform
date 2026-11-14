import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CourseForm from "../components/CourseForm";
import TopicForm from "../components/TopicForm";
import ChapterForm from "../components/ChapterForm";
import HierarchicalTable from "../components/HierarchicalTable";

type Tab = "course" | "topic" | "chapter" | "view";

export default function AdminCoursePage() {
  const [activeTab, setActiveTab] = useState<Tab>("course");
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs: { id: Tab; label: string }[] = [
    { id: "course", label: "1. Create Course" },
    { id: "topic", label: "2. Create Topic" },
    { id: "chapter", label: "3. Create Chapter" },
    { id: "view", label: "View All Data" },
  ];

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    // Optionally auto switch to view tab
    // setActiveTab("view");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Course Management
        </h1>

        {/* Toggle Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Forms / Table */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "course" && <CourseForm onSuccess={handleSuccess} />}
            {activeTab === "topic" && <TopicForm onSuccess={handleSuccess} />}
            {activeTab === "chapter" && (
              <ChapterForm onSuccess={handleSuccess} />
            )}
            {activeTab === "view" && <HierarchicalTable key={refreshKey} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

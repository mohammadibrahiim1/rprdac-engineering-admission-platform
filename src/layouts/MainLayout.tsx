import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "../components/common/Sidebar";
import TopBar from "../components/common/TopBar";

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const location = useLocation();

  // Close mobile drawer whenever route changes.
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling while mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = isMobileSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="h-dvh w-full overflow-hidden bg-slate-50 text-slate-800">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          onClose={() => setIsSidebarOpen(false)}
        />
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-70 bg-white shadow-2xl lg:hidden"
            >
              <Sidebar
                isOpen={true}
                isMobile={true}
                onToggle={() => setIsMobileSidebarOpen(false)}
                onClose={() => setIsMobileSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div
        className={`
          flex h-full min-w-0 flex-col transition-[margin] duration-300 ease-in-out
          ${isSidebarOpen ? "lg:ml-67.5" : "lg:ml-20"}
        `}
      >
        {/* TOP BAR */}
        <TopBar
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* PAGE CONTENT */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto min-h-full w-full max-w-[1600px] p-4 sm:p-5 lg:p-7 xl:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="min-h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

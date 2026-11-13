import { type FC } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RotateCcw, UserPlus, GraduationCap as Student } from "lucide-react";

export interface UserData {
  userName?: string;
  [key: string]: unknown;
}

export interface EnrollmentHeaderProps {
  user?: UserData | null;
  mounted: boolean;
  handleReset: () => void;
}

export const EnrollmentHeader: FC<EnrollmentHeaderProps> = ({
  user,
  mounted,
  handleReset,
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full">
      {/* ─── Top Banner ─── */}
      <div className="relative w-full h-44 bg-gradient-to-r from-slate-100 via-slate-200/70 to-zinc-100 border-b border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute right-24 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent blur-2xl"></div>
      </div>

      {/* ─── Header Body with Gradient Title ─── */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        transition={{ duration: 0.5 }}
        className="border-b border-[#E8E8E5] px-5 sm:px-5 py-6 sm:py-8 bg-[#FDFDFD]"
      >
        <div className="flex flex-col gap-6 -mt-20 relative z-10 lg:flex-row lg:items-end lg:justify-between">
          {/* Left Side: Logo/Icon, Title & Description */}
          <div className="flex flex-col sm:items-start gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.05,
                type: "spring",
                stiffness: 200,
                damping: 18,
              }}
              className="inline-flex items-center justify-center w-24 h-24 rounded bg-white border border-slate-200/80 shadow-md p-5 text-4xl select-none"
            >
              <Student className="w-auto h-auto sm:w-auto sm:h-auto text-[#122054]" />
            </motion.div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-[#122054] to-[#2C2484] bg-clip-text text-transparent">
                  Student Enrollment
                </span>
              </h1>

              {/* Meta Tags */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7A7A75] font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                  Enroll new student
                </span>
                <span className="hidden sm:inline text-[#E8E8E5]">|</span>
                <span className="flex items-center gap-1">
                  Academic Records & StudyCycle
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-[#8A8A80] max-w-xl leading-relaxed pt-0.5">
                Effortlessly create student profiles, verify registration
                details, and track fee payments in real-time. With intuitive
                filters for classes and batches, managing your entire student
                body from one centralized hub has never been easier.
              </p>
            </div>
          </div>

          {/* Right Side: Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center flex-wrap justify-end gap-2 py-3"
          >
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white/8 border border-white/12 text-slate-700 hover:bg-white/14 hover:text-black transition-all text-[12px] font-medium backdrop-blur-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <Link
              to="/dashboard/admin/student/all"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white border border-slate-200 text-[#0d1b3e] hover:bg-white/90 transition-all text-[12px] font-semibold shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              All Students
            </Link>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white border border-slate-200 text-[#0d1b3e] hover:bg-white/90 transition-all text-[12px] font-semibold shadow-sm capitalize"
            >
              Submitted by : {user?.userName && <span>{user.userName}</span>}
            </button>
          </motion.div>
        </div>
      </motion.header>
    </div>
  );
};

export default EnrollmentHeader;

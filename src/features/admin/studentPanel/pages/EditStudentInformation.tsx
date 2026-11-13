import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2 } from "lucide-react";
import type {
  UseFormRegister,
  Control,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
  SubmitHandler,
} from "react-hook-form";

import EditStudentAddressSection from "../components/editStudentInformation/EditStudentAddressSection";
import EditStudentAcademicSection from "../components/editStudentInformation/EditStudentAcademicSection";
import { EditStudentHeader } from "../components/editStudentInformation/EditStudentHeader";
import EditStudentPersonalDetails from "../components/editStudentInformation/EditStudentPersonalDetails";
import useEditStudentInformation from "../hooks/useEditStudentInformation";

/* ── TypeScript Interfaces ──────────────────────────────── */
export interface StudentInfo {
  _id: string;
  name?: string;
  email?: string;
  studentId?: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface UseEditStudentInformationReturn {
  navigate: (path: string) => void;
  student: StudentInfo | null;
  isStudentLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  photoFile: File | null;
  setPhotoFile: React.Dispatch<React.SetStateAction<File | null>>;
  isSaving: boolean;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleEditMode: () => void;
  institutes: unknown[];
  messes: unknown[];
  academicData: unknown[];
  register: UseFormRegister<any>;
  handleSubmit: (
    onValid: SubmitHandler<any>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  isDirty: boolean;
  onSubmit: SubmitHandler<any>;
  handleCancel: () => void;
}

/* ── Animation Variants ─────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 25 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

/* ══════════════════════════════════════════════════════════ */
export default function EditStudentInformation(): React.JSX.Element {
  const {
    navigate,
    student,
    isStudentLoading,
    photoFile,
    setPhotoFile,
    isSaving,
    isEditMode,
    messes,
    academicData,
    institutes,
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    errors,
    isDirty,
    onSubmit,
  } = useEditStudentInformation() as unknown as UseEditStudentInformationReturn;

  /* ── Skeleton Loading Screen ───────────────────────────── */
  if (isStudentLoading) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center font-sans bg-white">
        <p className="text-sm font-semibold text-slate-400 tracking-wide">
          Loading student information...
        </p>
      </div>
    );
  }

  if (!student) return <></>;

  return (
    <div className="min-h-screen relative bg-white font-sans selection:bg-indigo-500 selection:text-white pb-12 overflow-hidden">
      <div className="relative z-10">
        {/* ── Main Glass morphic Wrapper ──────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white overflow-hidden"
        >
          {/* ── Header Component ───────────────────────────── */}
          <EditStudentHeader student={student} />

          {/* ── Form Body ───────────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <AnimatePresence mode="wait">
                {/* Personal Section */}
                <EditStudentPersonalDetails
                  register={register}
                  control={control}
                  errors={errors}
                  isEditMode={isEditMode}
                  student={student}
                  photoFile={photoFile}
                  setPhotoFile={setPhotoFile}
                  watch={watch}
                  setValue={setValue}
                />

                {/* ── ADDRESS TAB ── */}
                <motion.div
                  key="address"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-8"
                >
                  <EditStudentAddressSection
                    student={student}
                    register={register}
                    control={control}
                    messes={messes}
                    errors={errors}
                    watch={watch}
                    isEditMode={isEditMode}
                  />
                </motion.div>

                {/* ── ACADEMIC  ── */}
                <motion.div
                  key="academic"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-8"
                >
                  <EditStudentAcademicSection
                    academicData={academicData}
                    institutes={institutes}
                    student={student}
                    register={register}
                    control={control}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    isEditMode={isEditMode}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Floating Sticky Action Footer ───────────────── */}
            <AnimatePresence>
              {isEditMode && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3 }}
                  className="sticky bottom-4 z-40 mb-4 p-5 bg-white/90 backdrop-blur-2xl border border-white/80 rounded-md shadow-2xl shadow-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => navigate("/dashboard/admin/student/all")}
                      className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200 rounded-md transition-all duration-200 cursor-pointer"
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={isSaving || !isDirty}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 cursor-pointer min-h-[42px]"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import PersonalSection from "../components/StudentEnrollment.jsx/sections/personal/PersonalSection";
import AddressSection from "../components/StudentEnrollment.jsx/sections/address/AddressSection";
import EducationSection from "../components/StudentEnrollment.jsx/sections/education/EducationSection";
import PaymentSection from "../components/StudentEnrollment.jsx/sections/payment/PaymentSection";
import FooterNavigation from "../components/StudentEnrollment.jsx/layout/FooterNavigation";
import EnrollmentHeader from "../components/StudentEnrollment.jsx/layout/EnrollmentHeader";
import EnrollmentSidebar from "../components/StudentEnrollment.jsx/layout/EnrollmentSidebar";
import { usePhotoUpload } from "../hooks/usePhotoUpload";
import { BLOOD_GROUPS } from "../constants/bloodGroups";
import { DEPARTMENTS } from "../constants/departments";
import { ENROLLMENT_SECTIONS } from "../constants/sections";

import { useAddress } from "../hooks/useAddress";
import { useStudentData } from "../hooks/useStudentData";
import { generateSessionOptions } from "../utils/sessionGenerator";
import { useStudentForm } from "../hooks/useStudentForm";
import { useStudentSubmit } from "../hooks/useStudentSubmit";
import { useSameAsField } from "../hooks/useSameAsField";
import { usePayment } from "../hooks/usePayment";
import { useEnrollmentNavigation } from "../hooks/useEnrollmentNavigation";
import { AppDispatch, RootState } from "@/app/store";
import { resetForm, updatedField } from "@/redux/features/student/studentSlice";
import { toast } from "sonner";

const StudentAdmitByAdmin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state?.auth);
  const student = useSelector((state: RootState) => state?.student?.student);

  // custom hooks
  const { previewUrl, setPreviewUrl, file, setFile, handleFileChange } =
    usePhotoUpload();

  const {
    loading: addressLoading,
    error: addressError,
    districtNames,
    permanentUpazilaNames,
    presentUpazilaNames,
    selectedPermanentZilla,
    selectedPresentZilla,
    handlePermanentZillaChange,
    handlePresentZillaChange,
    setSelectedPermanentZilla,
    setSelectedPresentZilla,
  } = useAddress(student);

  const { isSubmitting, handleFormSubmit, handleFormReset } = useStudentSubmit(
    student,
    file,
  );

  const {
    // Data
    allBatches,
    institutes,
    messes,
    sscInformation,
    diplomaInformation,
    messSelected,

    // Individual Loaders
    isBatchesLoading,
    isInstitutesLoading,
    isMessesLoading,

    // Individual Errors
    isBatchesError,
    isInstitutesError,
    isMessesError,
  } = useStudentData(student);

  const { handleChange } = useStudentForm();

  const { balanceDue, paymentProgress } = usePayment(student);
  const { progressPct, activeSection, mounted, setActiveSection } =
    useEnrollmentNavigation();

  const {
    sameAsPhone,
    sameAsGuardianPhone,
    sameAsPermanentAddress,
    handleSameAsPhoneToggle,
    handleSameAsGuardianPhoneToggle,
    handleSameAsPermanentAddressToggle,
  } = useSameAsField(student);

  // Form Reset Functionality
  const handleReset = (): void => {
    dispatch(resetForm());
    setFile(null);
    setPreviewUrl(null);
    setSelectedPermanentZilla("");
    setSelectedPresentZilla("");
    toast.success("Form reset!");
  };

  return (
    <div className="font-sans">
      <EnrollmentHeader
        user={user}
        mounted={mounted}
        handleReset={handleReset}
      />
      {/* ── Main Content ─────────────────────────────────────────────────── */}
      {
        <section>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="py-4"
          >
            <div className="grid grid-cols-1 xl:grid-cols-6">
              {/* ── Sidebar ───────────────────────────────────────────── */}
              <EnrollmentSidebar
                sections={ENROLLMENT_SECTIONS}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                progressPct={progressPct}
              />

              {/* ── Form Area ─────────────────────────────────────────── */}
              <div className="min-w-0 col-span-5">
                <form onSubmit={handleFormSubmit}>
                  <AnimatePresence mode="wait">
                    {/* ═══════════════════════════════════════════════════
                        PERSONAL SECTION — includes guardian fields
                    ════════════════════════════════════════════════════ */}
                    {activeSection === "personal" && (
                      <PersonalSection
                        activeSection={activeSection}
                        previewUrl={previewUrl}
                        setFile={setFile}
                        setPreviewUrl={setPreviewUrl}
                        sameAsPhone={sameAsPhone}
                        sameAsGuardianPhone={sameAsGuardianPhone}
                        handleSameAsPhoneToggle={handleSameAsPhoneToggle}
                        handleSameAsGuardianPhoneToggle={
                          handleSameAsGuardianPhoneToggle
                        }
                        handleFileChange={handleFileChange}
                        student={student}
                        handleChange={handleChange}
                        bloodGroups={BLOOD_GROUPS}
                        dispatch={dispatch}
                        updatedField={updatedField}
                      />
                    )}

                    {/* ═══════════════════════════════════════════════════
                        ADDRESS SECTION
                    ════════════════════════════════════════════════════ */}
                    {activeSection === "address" && (
                      <AddressSection
                        activeSection={activeSection}
                        student={student}
                        handleChange={handleChange}
                        districtNames={districtNames}
                        selectedPermanentZilla={selectedPermanentZilla}
                        handlePermanentZillaChange={handlePermanentZillaChange}
                        permanentUpazilaNames={permanentUpazilaNames}
                        selectedPresentZilla={selectedPresentZilla}
                        handlePresentZillaChange={handlePresentZillaChange}
                        presentUpazilaNames={presentUpazilaNames}
                        messes={messes}
                        messSelected={messSelected}
                        sameAsPermanentAddress={sameAsPermanentAddress}
                        handleSameAsPermanentAddressToggle={
                          handleSameAsPermanentAddressToggle
                        }
                        //loader
                        isBatchesLoading={isBatchesLoading}
                        isInstitutesLoading={isInstitutesLoading}
                        isMessesLoading={isMessesLoading}
                        //error
                        isBatchesError={isBatchesError}
                        isInstitutesError={isInstitutesError}
                        isMessesError={isMessesError}
                      />
                    )}

                    {/* ═══════════════════════════════════════════════════
                        EDUCATION SECTION
                        Includes: Receipt No, Student ID, Batch,
                        Department, Session, Institute + SSC + Diploma
                    ════════════════════════════════════════════════════ */}
                    {activeSection === "education" && (
                      <EducationSection
                        activeSection={activeSection}
                        student={student}
                        handleChange={handleChange}
                        departments={DEPARTMENTS}
                        allBatches={allBatches}
                        sessionOptions={generateSessionOptions()}
                        institutes={institutes}
                        sscInformation={sscInformation}
                        diplomaInformation={diplomaInformation}
                        loadingInstitutes={isInstitutesLoading}
                      />
                    )}

                    {/* ═══════════════════════════════════════════════════
                        PAYMENT SECTION
                    ════════════════════════════════════════════════════ */}
                    {activeSection === "payment" && (
                      <PaymentSection
                        activeSection={activeSection}
                        student={student}
                        handleChange={handleChange}
                        balanceDue={balanceDue}
                        paymentProgress={paymentProgress}
                        isSubmitting={isSubmitting}
                      />
                    )}
                  </AnimatePresence>

                  {/* ── Footer Navigation ────────────────────────────── */}
                  <FooterNavigation
                    sections={ENROLLMENT_SECTIONS}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                  />
                </form>
              </div>
            </div>
          </motion.div>
        </section>
      }
    </div>
  );
};

export default StudentAdmitByAdmin;

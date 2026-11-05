import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  UserPlus,
  GraduationCap,
  UserRound,
  Users,
  CreditCard,
  RotateCcw,
  ArrowLeft,
  Loader2,
  X,
  Home,
  MapPin,
  BookOpen,
  Book,
  Camera,
  Upload,
  ChevronRight,
  Search,
  Check,
  Receipt,
  Hash,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  resetForm,
  updatedField,
} from '../../../../../redux/features/student/studentSlice';
import { useGetBatchesQuery } from '../../../../../redux/features/batch/batchApi';
import {
  useGetStudentsQuery,
  usePostStudentMutation,
} from '../../../../../redux/features/student/studentApi';
import { useGetAcademicInfosQuery } from '../../../../../redux/features/academic/academicApi';
import { useGetInstitutesQuery } from '../../../../../redux/features/institute/instituteApi';
import { useGetMessesQuery } from '../../../../../redux/features/mess/messApi';
import CapturePhoto from '../../../../../components/CapturePhoto';
import bgLogo from '../../../../../assets/img/log-rpr.png';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import { Student } from 'phosphor-react';
import Toggle from '../components/StudentEnrollment.jsx/common/Toggle';
import SectionHeader from '../components/StudentEnrollment.jsx/common/SectionHeader';
import FormField from '../components/StudentEnrollment.jsx/common/FormField';
import TextInput from '../components/StudentEnrollment.jsx/common/TextInput';
import SearchableSelect from '../components/StudentEnrollment.jsx/common/SearchableSelect';
import CardSection from '../components/StudentEnrollment.jsx/common/CardSection';
import PersonalSection from '../components/StudentEnrollment.jsx/sections/personal/PersonalSection';
import AddressSection from '../components/StudentEnrollment.jsx/sections/address/AddressSection';
import EducationSection from '../components/StudentEnrollment.jsx/sections/education/EducationSection';
import PaymentSection from '../components/StudentEnrollment.jsx/sections/payment/PaymentSection';
import FooterNavigation from '../components/StudentEnrollment.jsx/layout/FooterNavigation';
import EnrollmentHeader from '../components/StudentEnrollment.jsx/layout/EnrollmentHeader';
import EnrollmentSidebar from '../components/StudentEnrollment.jsx/layout/EnrollmentSidebar';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import { BLOOD_GROUPS } from '../constants/bloodGroups';
import { DEPARTMENTS } from '../constants/departments';
import { ENROLLMENT_SECTIONS } from '../constants/sections';
import { useAddress } from '../hooks/useAddress';
import { useStudentData } from '../hooks/useStudentData';
import { generateSessionOptions } from '../utils/sessionGenerator';
import { generateReceiptNo } from '../utils/receiptGenerator';
import { useStudentForm } from '../hooks/useStudentForm';
import { useStudentSubmit } from '../hooks/useStudentSubmit';
import { useSameAsField } from '../hooks/useSameAsField';
import { usePayment } from '../hooks/usePayment';
import { useEnrollmentNavigation } from '../hooks/useEnrollmentNavigation';
import { useBillingCalculator } from '../hooks/useBillingCalculator';

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const StudentAdmitByAdmin = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state?.auth);
  const student = useSelector((state) => state?.student?.student);

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
  const { referenceDiscount } = useBillingCalculator();
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
  const handleReset = () => {
    dispatch(resetForm());
    setFile(null);
    setPreviewUrl(null);
    setSelectedPermanentZilla('');
    setSelectedPresentZilla('');
    toast.success('Form reset!');
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
                    {activeSection === 'personal' && (
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
                    {activeSection === 'address' && (
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
                    {activeSection === 'education' && (
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
                    {activeSection === 'payment' && (
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

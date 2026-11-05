import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BadgeDollarSign,
  CalendarDays,
  CheckCircle,
  Eye,
  Home,
  ListIcon,
  Loader2,
  PencilLine,
  Phone,
  Plus,
  PlusCircle,
  Printer,
  School,
  Search,
  Square,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Webcam from 'react-webcam';
import logo from '../../../../../assets/img/log-rpr.png';
import signature from '../../../../../assets/img/rpr-director-sign.png';
import CreateGreenCard from './GreenCard/CreateGreenCard';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';
import GreenCardDashboard from './GreenCard/GreenCardDashboard';
import GreenCardPreview from './GreenCard/GreenCardPreview';
import { useGreenCardExplorer } from '../hooks/useGreenCardExplorer';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

// Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
        type === 'success'
          ? 'bg-emerald-50 border border-emerald-200'
          : 'bg-red-50 border border-red-200'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-emerald-500" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-500" />
      )}
      <span
        className={`text-sm font-medium ${type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}
      >
        {message}
      </span>
      <button type="button" onClick={onClose} className="ml-4">
        <X
          size={16}
          className={type === 'success' ? 'text-emerald-500' : 'text-red-500'}
        />
      </button>
    </motion.div>
  );
};

// Loading Spinner Component
const LoadingSpinner = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="w-8 h-8 mb-3 animate-spin text-slate-400" />
    <p className="text-sm text-slate-500">{text || 'Loading...'}</p>
  </div>
);

const tabs = [
  {
    id: 'create',
    sl: 1,
    icon: <Plus size={16} />,
    label: 'Create',
    color: 'bg-emerald-50/80 border border-emerald-100',
  },
  {
    id: 'list',
    sl: 2,
    icon: <ListIcon size={16} />,
    label: 'View List',
    color: 'bg-indigo-50/80 border border-indigo-100',
  },
  {
    id: 'preview',
    sl: 3,
    icon: <Eye size={16} />,
    label: 'Preview',
    color: 'bg-rose-50/80 border border-rose-100',
  },
];

const ExamCenterDashboard = () => {
  const [view, setView] = useState('list');

  const {
    tableData,
    academicYear,
    selectedCard,
    formData,
    handleChange,
    summary,
    pagination,
    isLoading,
    search,
    setNotification,
    loadingCards,
    sessionOptions,
    institutesData,
    departmentsData,
    processImage,
    handleSearchChange,
    handlePrintGreenCard,
    printRef,
    handleSetSession,
    notification,
    selectedIds,
    setUseCamera,
    setPhoto,
    toggleSelect,
    toggleSelectAll,
    handleReset,
    handleDeleteSelected,
    isDeleting,
    isUpdating,
    handleExport,
    handleEditClick,
    isModalOpen,
    closeEditModal,
    handleUpdateCard,
    SERVER,
    range,
    handleRangeChange,
    createAdmitCard,
    isCreating,
    refetch,
    user,
    showNotification,
    // @ts-ignore
    limit,
    setLimit,
    page,
    setPage,
  } = useGreenCardExplorer({});

  return (
    <div className="min-h-screen antialiased bg-slate-50/50 text-slate-900 font-sans">
      {/* Notification */}
      <AnimatePresence>
        {notification?.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() =>
              setNotification({ show: false, type: '', message: '' })
            }
          />
        )}
      </AnimatePresence>

      {/* Header Section */}
      <header className="sticky top-0 z-0 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 print:hidden">
        <div className="flex flex-col gap-6">
          {/* Breadcrumb Menu (Subtle Notion-style) */}
          <nav
            className="sticky top-0 z-30 w-full border-b border-[#E8E8E5] px-4"
            style={{
              background: 'rgba(250,250,249,0.92)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-center h-10">
              <BreadCrumbMenu />
            </div>
          </nav>

          {/* Header Title & Subtitle Section */}
          <div className="flex flex-col px-4 pb-5">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
              Green Card Center
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Manage your student admission workflows with precision. Create,
              track, and generate professional green admit cards.
            </p>
          </div>
        </div>
      </header>

      <div className="flex items-center gap-8 border-b border-gray-200">
        {/* Navigation Controls */}
        <div className="flex items-center p-1 bg-white  shadow-sm w-fit border-slate-200">
          {tabs?.map((tab) => (
            <NavButton
              key={tab?.sl}
              active={view === tab.id}
              onClick={() => setView(tab.id)}
              icon={tab.icon}
              label={tab.label}
              colorClass={tab.color}
            />
          ))}
        </div>
      </div>
      <main className="p-2">
        <AnimatePresence mode="wait">
          {/* Create View */}
          <CreateGreenCard
            view={view}
            setView={setView}
            sessionOptions={sessionOptions}
            institutesData={institutesData}
            departmentsData={departmentsData}
            createAdmitCard={createAdmitCard}
            isCreating={isCreating}
            refetch={refetch}
            user={user}
            showNotification={showNotification}
            precessImage={processImage}
          />

          {/* green card and seller performance table */}
          {
            <GreenCardDashboard
              isUpdating={isUpdating}
              view={view}
              setView={setView}
              tableData={tableData}
              academicYear={academicYear}
              formData={formData || {}}
              handleChange={handleChange}
              summary={summary}
              pagination={pagination}
              isLoading={isLoading}
              search={search}
              handleSearchChange={handleSearchChange}
              handleSetSession={handleSetSession}
              selectedIds={selectedIds}
              toggleSelect={toggleSelect}
              toggleSelectAll={toggleSelectAll}
              handleReset={handleReset}
              handleDeleteSelected={handleDeleteSelected}
              isDeleting={isDeleting}
              handleExport={handleExport}
              refetch={refetch}
              handleEditClick={handleEditClick}
              selectedCard={selectedCard}
              processImage={processImage}
              handleUpdateCard={handleUpdateCard}
              closeEditModal={closeEditModal}
              SERVER={SERVER}
              range={range}
              handleRangeChange={handleRangeChange}
              isModalOpen={isModalOpen}
              institutesData={institutesData}
              departmentsData={departmentsData}
              sessionOptions={sessionOptions}
              setUseCamera={setUseCamera}
              setPhoto={setPhoto}
              // @ts-ignore
              limit={limit}
              setLimit={setLimit}
              page={page}
              setPage={setPage}
            />
          }

          {/* green card Preview & Print View */}
          <GreenCardPreview
            printRef={printRef}
            range={range}
            handleRangeChange={handleRangeChange}
            search={search}
            handleSearchChange={handleSearchChange}
            handleReset={handleReset}
            // @ts-ignore
            limit={limit}
            setLimit={setLimit}
            page={page}
            setPage={setPage}
            view={view}
            tableData={tableData}
            loadingCards={loadingCards}
            selectedIds={selectedIds}
            toggleSelect={toggleSelect}
            toggleSelectAll={toggleSelectAll}
            handlePrintGreenCard={handlePrintGreenCard}
          />
        </AnimatePresence>
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, colorClass }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-300 z-10 ${
      active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {active && (
      <motion.div
        layoutId="activeTab"
        className={`absolute inset-0 rounded-lg ${colorClass} shadow-sm`}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-2">
      {icon}
      {label}
    </span>
  </button>
);

export default ExamCenterDashboard;

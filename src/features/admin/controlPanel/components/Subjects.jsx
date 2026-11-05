import { useForm } from 'react-hook-form';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Trash2,
  X,
  Loader2,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Info,
  Pencil,
  Grid,
  List,
  MoreVertical,
  Eye,
  EyeOff,
  Tag,
  Calendar,
  Check,
  Download,
  Upload,
} from 'lucide-react';
import { useSubjectControll } from '../hooks/useSubjectControll';

/* ========== Notification ========== */
const Notification = ({ notification, setNotification }) => (
  <AnimatePresence>
    {notification.show && (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`fixed top-6 right-6 z-50 p-4 rounded-lg shadow-xl border backdrop-blur-sm ${
          notification.type === 'success'
            ? 'bg-green-50/95 border-green-200 text-green-800'
            : notification.type === 'error'
              ? 'bg-red-50/95 border-red-200 text-red-800'
              : 'bg-blue-50/95 border-blue-200 text-blue-800'
        }`}
        style={{ width: '380px' }}
      >
        <div className="flex items-start gap-3">
          <div
            className={`rounded-full p-1.5 ${
              notification.type === 'success'
                ? 'bg-green-100'
                : notification.type === 'error'
                  ? 'bg-red-100'
                  : 'bg-blue-100'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600" />
            ) : (
              <Info className="w-4 h-4 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() =>
              setNotification({ show: false, message: '', type: '' })
            }
            className="p-1 text-gray-400 rounded hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ========== Subject Card (Grid View) ========== */
const SubjectCard = ({
  subject,
  isSelected,
  onSelect,
  onDelete,
  editingOption,
  editingValue,
  setEditingOption,
  setEditingValue,
  handleUpdateOption,
  handleDeleteOption,
  cancelEdit,
  editingLabel,
  editingLabelValue,
  setEditingLabel,
  setEditingLabelValue,
  handleUpdateSubjectLabel,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative bg-white rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50/30'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start flex-1 gap-3">
          <button
            onClick={() => onSelect(subject._id)}
            className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors mt-0.5 ${
              isSelected
                ? 'bg-blue-600 border-blue-600'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            {editingLabel === subject._id ? (
              <div className="flex items-center gap-2">
                <input
                  value={editingLabelValue}
                  onChange={(e) => setEditingLabelValue(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter')
                      handleUpdateSubjectLabel(subject._id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => handleUpdateSubjectLabel(subject._id)}
                    className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/label">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 border border-blue-200 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {subject.label}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{subject.options?.length || 0} options</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(subject.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingLabel(subject._id);
                    setEditingLabelValue(subject.label);
                  }}
                  className="p-1 ml-2 text-gray-400 transition-opacity rounded opacity-0 hover:text-blue-600 hover:bg-blue-50 group-hover/label:opacity-100"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 z-10 w-48 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg top-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setShowOptions(!showOptions);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  {showOptions ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {showOptions ? 'Hide Options' : 'Show Options'}
                </button>
                <button
                  onClick={() => {
                    setEditingLabel(subject._id);
                    setEditingLabelValue(subject.label);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Label
                </button>
                <div className="border-t border-gray-200">
                  <button
                    onClick={() => {
                      onDelete(subject._id);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Subject
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 mt-3 border-t border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag className="h-3.5 w-3.5" />
                Options
              </h4>
              <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                {subject?.options?.length || 0} items
              </span>
            </div>
            <div className="pr-2 space-y-2 overflow-y-auto max-h-48">
              {subject?.options?.map((opt, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg group/option hover:bg-gray-50"
                >
                  {editingOption === opt ? (
                    <div className="flex items-center w-full gap-2">
                      <span className="w-5 text-sm font-medium text-gray-500">
                        {idx + 1}.
                      </span>
                      <input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter')
                            handleUpdateOption(subject._id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUpdateOption(subject._id)}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center min-w-0 gap-2">
                        <span className="w-5 text-sm font-medium text-gray-500">
                          {idx + 1}.
                        </span>
                        <span className="text-gray-800 truncate">{opt}</span>
                      </div>
                      <div className="flex gap-1 transition-opacity opacity-0 group-hover/option:opacity-100">
                        <button
                          onClick={() => {
                            setEditingOption(opt);
                            setEditingValue(opt);
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOption(subject._id, opt)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}

              {(!subject.options || subject.options.length === 0) && (
                <div className="py-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full">
                    <Tag className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No options added</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ========== Main Subjects Component ========== */
import { useState } from 'react';

const Subjects = () => {
  const {
    subjects,
    departments,
    subjectsLoading,
    subjectsError,
    subjectsErrorData,
    creatingSubject,
    searchTerm,
    setSearchTerm,
    clearSearch,
    viewMode,
    setViewMode,
    selectedSubjects,
    toggleSubjectSelection,
    selectAllSubjects,
    handleDeleteSelected,
    editingOption,
    setEditingOption,
    editingValue,
    setEditingValue,
    editingLabel,
    setEditingLabel,
    editingLabelValue,
    setEditingLabelValue,
    cancelEdit,
    handleCreateSubject,
    handleUpdateSubjectLabel,
    handleDeleteSubject,
    handleDeleteOption,
    handleUpdateOption,
    refetchSubjects,
    notification,
    setNotification,
  } = useSubjectControll();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: '',
      departmentId: '',
      thumbnail: '',
      isCommon: false,
    },
  });

  const isCommon = watch('isCommon', false);

  const onSubmit = async (data) => {
    const success = await handleCreateSubject(data);
    if (success) reset();
  };

  // TanStack Table columns
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.display({
      id: 'select',
      header: () => (
        <button
          onClick={selectAllSubjects}
          className={`w-4 h-4 rounded border flex items-center justify-center ${
            subjects.length > 0 && selectedSubjects.length === subjects.length
              ? 'bg-blue-600 border-blue-600'
              : 'border-gray-300'
          }`}
        >
          {subjects.length > 0 &&
            selectedSubjects.length === subjects.length && (
              <Check className="w-3 h-3 text-white" />
            )}
        </button>
      ),
      cell: ({ row }) => (
        <button
          onClick={() => toggleSubjectSelection(row.original._id)}
          className={`w-4 h-4 rounded border flex items-center justify-center ${
            selectedSubjects.includes(row.original._id)
              ? 'bg-blue-600 border-blue-600'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          {selectedSubjects.includes(row.original._id) && (
            <Check className="w-3 h-3 text-white" />
          )}
        </button>
      ),
    }),
    columnHelper.accessor('label', {
      header: 'Subject',
      cell: ({ row }) => {
        const subject = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              {editingLabel === subject._id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editingLabelValue}
                    onChange={(e) => setEditingLabelValue(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')
                        handleUpdateSubjectLabel(subject._id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button
                    onClick={() => handleUpdateSubjectLabel(subject._id)}
                    className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <span className="font-medium text-gray-900">
                    {subject.label}
                  </span>
                  <button
                    onClick={() => {
                      setEditingLabel(subject._id);
                      setEditingLabelValue(subject.label);
                    }}
                    className="p-1 text-gray-400 rounded opacity-0 hover:text-blue-600 hover:bg-blue-50 group-hover:opacity-100"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {subject.options?.length || 0} options • Created:{' '}
                {new Date(subject.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('options', {
      header: 'Options',
      cell: ({ getValue }) => {
        const options = getValue() || [];
        return (
          <div className="space-y-1">
            {options.slice(0, 3).map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-4 text-xs text-gray-500">{idx + 1}.</span>
                <span className="text-sm text-gray-700 truncate">{opt}</span>
              </div>
            ))}
            {options.length > 3 && (
              <span className="text-xs text-gray-400">
                +{options.length - 3} more
              </span>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => handleDeleteSubject(row.original._id)}
          className="p-2 text-red-600 rounded-lg hover:text-red-800 hover:bg-red-50"
          title="Delete subject"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data: subjects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Notification
        notification={notification}
        setNotification={setNotification}
      />

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* ========== LEFT: Create Form ========== */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 border border-blue-200 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Create Subject
                </h2>
                <p className="text-xs text-gray-500">Add a new subject</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Subject Name / Label
                </label>
                <input
                  {...register('label', {
                    required: 'Subject name is required',
                  })}
                  placeholder="e.g., DESIGN OF STRUCTURE-2"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.label && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.label.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Select Department
                </label>
                <select
                  {...register('departmentId', {
                    required: !isCommon ? 'Department is required' : false,
                  })}
                  disabled={isCommon}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Choose Department --</option>
                  {departments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} {dept.code ? `(${dept.code})` : ''}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.departmentId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Thumbnail Image URL (Optional)
                </label>
                <input
                  {...register('thumbnail')}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCommon"
                  {...register('isCommon')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isCommon"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Common Subject (applies to all departments)
                </label>
              </div>

              <button
                type="submit"
                disabled={creatingSubject}
                className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold text-white transition-all rounded-lg shadow-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingSubject ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Subject
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ========== RIGHT: Data ========== */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute w-4 h-4 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute p-1 text-gray-400 right-3 top-1/2 -translate-y-1/2 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {selectedSubjects?.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedSubjects.length})
                </button>
              )}

              <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Selection info */}
          {subjects?.length > 0 && (
            <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
              <span>
                {selectedSubjects?.length > 0
                  ? `${selectedSubjects.length} of ${subjects.length} selected`
                  : `${subjects.length} subjects found`}
              </span>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-900 uppercase"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {subjectsLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <Loader2 className="w-8 h-8 mx-auto mb-3 text-blue-600 animate-spin" />
                          <p className="text-gray-600">Loading subjects...</p>
                        </td>
                      </tr>
                    ) : subjectsError ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                          <p className="mb-2 text-gray-600">
                            {subjectsErrorData?.data?.message ||
                              'Failed to load subjects'}
                          </p>
                          <button
                            onClick={refetchSubjects}
                            className="px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    ) : subjects.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className={`border-b hover:bg-gray-50 ${
                            selectedSubjects.includes(row.original._id)
                              ? 'bg-blue-50'
                              : ''
                          }`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-6 py-4">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center">
                          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            No subjects found
                          </h3>
                          <p className="text-gray-600">
                            {searchTerm
                              ? 'No subjects match your search.'
                              : 'Create your first subject to get started.'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="p-6">
                {subjectsLoading ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-32 bg-gray-100 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : subjectsError ? (
                  <div className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                    <p className="mb-4 text-gray-600">
                      Failed to load subjects
                    </p>
                    <button
                      onClick={refetchSubjects}
                      className="px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : subjects.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {subjects.map((subject) => (
                      <SubjectCard
                        key={subject._id}
                        subject={subject}
                        isSelected={selectedSubjects.includes(subject._id)}
                        onSelect={toggleSubjectSelection}
                        onDelete={handleDeleteSubject}
                        editingOption={editingOption}
                        editingValue={editingValue}
                        setEditingOption={setEditingOption}
                        setEditingValue={setEditingValue}
                        handleUpdateOption={handleUpdateOption}
                        handleDeleteOption={handleDeleteOption}
                        cancelEdit={cancelEdit}
                        editingLabel={editingLabel}
                        editingLabelValue={editingLabelValue}
                        setEditingLabel={setEditingLabel}
                        setEditingLabelValue={setEditingLabelValue}
                        handleUpdateSubjectLabel={handleUpdateSubjectLabel}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      No subjects found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm
                        ? 'Try adjusting your search terms'
                        : 'Create your first subject to get started'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Subjects;

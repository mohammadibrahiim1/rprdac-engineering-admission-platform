import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Loader2,
  Building,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Pencil,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { useDepartmentControll } from '../hooks/useDepartmentControll';

/* ========== Notification ========== */
const Notification = ({ notification, setNotification }) => (
  <AnimatePresence>
    {notification?.show && (
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
            {notification?.type === 'success' ? (
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

/* ========== Department Card ========== */
const DepartmentCard = ({ department }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 transition-shadow bg-white border border-gray-200 rounded-xl hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 border border-purple-200 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50">
            <Building className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{department.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              {department.code && (
                <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                  {department.code}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {new Date(department?.createdAt).toLocaleDateString()}
              </span>
            </div>
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
                className="absolute right-0 z-10 w-40 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg top-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-2">
                  <Pencil className="w-4 h-4" />
                  Edit Department
                </button>
                <div className="border-t border-gray-200">
                  <button className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Department
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

import { useState } from 'react';

const Departments = () => {
  const {
    departments,
    departmentsLoading,
    departmentsError,
    creatingDept,
    handleCreateDepartment,
    refetchDepartments,
    notification,
    setNotification,
  } = useDepartmentControll();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '' },
  });

  const onSubmit = async (data) => {
    const success = await handleCreateDepartment(data);
    if (success) reset();
  };

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
              <div className="flex items-center justify-center w-10 h-10 border border-purple-200 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50">
                <Building className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Create Department
                </h2>
                <p className="text-xs text-gray-500">Add a new department</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Department Name
                </label>
                <input
                  {...register('name', {
                    required: 'Department name is required',
                  })}
                  placeholder="e.g., Computer Science & Engineering"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={creatingDept}
                className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold text-white transition-all rounded-lg shadow-sm bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingDept ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Department
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ========== RIGHT: Data ========== */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              {departmentsLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-gray-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : departmentsError ? (
                <div className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                  <p className="mb-4 text-gray-600">
                    Failed to load departments
                  </p>
                  <button
                    onClick={refetchDepartments}
                    className="px-4 py-2 font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    Retry
                  </button>
                </div>
              ) : departments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {departments.map((dept) => (
                    <DepartmentCard key={dept._id} department={dept} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No departments found
                  </h3>
                  <p className="text-gray-600">
                    Create your first department to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Departments;

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Clock, UserCircle, CheckCircle, Users } from 'lucide-react';
import { usePostEmployeeAttendanceMutation } from '../../../../redux/features/staff/employeeApi';
import toast from 'react-hot-toast';

const HOURLY_RATE = 53;

const StaffAttendance = () => {
  const user = useSelector((state) => state.auth.user);
  const [postEmployeeAttendance, { isLoading }] =
    usePostEmployeeAttendanceMutation();
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({
    date: '',
    employeeName: '',
    phone: '',
    employeeId: '',
    workDetails: '',
    dutyStartTime: '',
    dutyEndTime: '',
    totalDutyTime: 0,
    totalDutyFee: 0,
    everyHourFee: HOURLY_RATE,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        date: currentDate,
        employeeName: user.userName || '',
        phone: user.phone || '',
        employeeId: user._id || '',
      }));
    }
  }, [user, currentDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateDuty = (start, end) => {
    if (!start || !end) return { seconds: 0, fee: 0 };

    const startDate = new Date(`1970-01-01T${start}:00`);
    const endDate = new Date(`1970-01-01T${end}:00`);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const diffSeconds = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 1000,
    );
    const fee = diffSeconds * (HOURLY_RATE / 3600);

    return { seconds: diffSeconds, fee };
  };

  useEffect(() => {
    if (formData.dutyStartTime && formData.dutyEndTime) {
      const { seconds, fee } = calculateDuty(
        formData.dutyStartTime,
        formData.dutyEndTime,
      );
      setFormData((prev) => ({
        ...prev,
        totalDutyTime: seconds,
        totalDutyFee: fee,
      }));
    }
  }, [formData.dutyStartTime, formData.dutyEndTime]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.workDetails.trim()) {
      toast.error('Please provide work details');
      return;
    }

    if (!formData.dutyStartTime || !formData.dutyEndTime) {
      toast.error('Please set both start and end time');
      return;
    }

    try {
      const result = await postEmployeeAttendance(formData).unwrap();
      toast.success(result.message);

      setFormData((prev) => ({
        ...prev,
        workDetails: '',
        dutyStartTime: '',
        dutyEndTime: '',
        totalDutyTime: 0,
        totalDutyFee: 0,
      }));
    } catch (error) {
      toast.error(error?.data?.error || 'Submission failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 py-6 bg-gray-50 md:px-8"
    >
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 p-6 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 text-white bg-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Employee Duty Registration
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Record your daily duty information
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Rate:{' '}
          <span className="font-semibold text-purple-600">
            ${HOURLY_RATE.toFixed(3)}/hour
          </span>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid max-w-6xl grid-cols-1 gap-6 mx-auto lg:grid-cols-2"
      >
        {/* Employee Info Card */}
        <div className="p-6 space-y-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center gap-4 p-3 border border-blue-100 rounded-lg bg-blue-50">
            <div className="p-2 bg-blue-100 rounded-full">
              <UserCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 capitalize">
                {user?.userName || 'Employee'}
              </h3>
              <p className="flex items-center gap-1 text-xs text-gray-600">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {user?.userType || 'Staff Member'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <UserCircle className="w-5 h-5 text-blue-600" />
              Employee Information
            </h2>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={formData.date}
                max={formData.date}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                name="employeeName"
                value={formData.employeeName}
                disabled
                className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  disabled
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Employee ID
                </label>
                <input
                  name="employeeId"
                  value={formData.employeeId}
                  disabled
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Duty Info Card */}
        <div className="p-6 space-y-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Clock className="w-5 h-5 text-green-600" />
            Duty Details
          </h2>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Work Description
            </label>
            <input
              type="text"
              name="workDetails"
              value={formData.workDetails}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe tasks completed today..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                name="dutyStartTime"
                value={formData.dutyStartTime}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                name="dutyEndTime"
                value={formData.dutyEndTime}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Total Time
              </label>
              <div className="relative">
                <input
                  value={formatDuration(formData.totalDutyTime)}
                  readOnly
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Total Earnings
              </label>
              <div className="relative">
                <input
                  value={`$${formData.totalDutyFee.toFixed(2)}`}
                  readOnly
                  className="w-full p-3 pl-3 pr-10 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                />
                <span className="absolute text-sm text-gray-500 right-3 top-3">
                  USD
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full p-3.5 bg-blue-600 text-white font-medium rounded-lg transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit Duty Record'}
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default StaffAttendance;

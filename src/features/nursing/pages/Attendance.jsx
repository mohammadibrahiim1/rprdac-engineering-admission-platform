import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { usePostNursingAttendanceMutation } from '../../../../redux/features/Nursing/NursingApi';
import toast from 'react-hot-toast';
import BreadCrumbMenu from '../../../../components/BreadCrumbMenu';

const Attendance = () => {
  // Form state
  const [formData, setFormData] = useState({
    date: '',
    employeeName: '',
    phone: '',
    nursingId: '',
    messName: '',
    dutyStartTime: '',
    dutyEndTime: '',
    totalDutyTime: '',
    totalDutyFee: 0,
    messDutyFee: 100,
  });

  const ratePerSecond = 0.0277777777777778; // 100 per hour (100/3600)
  const [postNursingData, { isLoading, error }] =
    usePostNursingAttendanceMutation();

  const user = useSelector((state) => state?.auth?.user || null);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);
    setFormData((prev) => ({
      ...prev,
      date: today,
      employeeName: user?.userName || '',
      phone: user?.phone || '',
      nursingId: user?._id || '',
    }));
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };

      // Calculate totalDutyTime and totalDutyFee when dutyStartTime or dutyEndTime changes
      if (name === 'dutyStartTime' || name === 'dutyEndTime') {
        const { dutyStartTime, dutyEndTime } = updatedFormData;
        if (dutyStartTime && dutyEndTime) {
          const start = new Date(`1970-01-01T${dutyStartTime}:00`);
          const end = new Date(`1970-01-01T${dutyEndTime}:00`);

          let diffMs;
          if (end < start) {
            // Handle overnight shifts
            end.setDate(end.getDate() + 1);
          }
          diffMs = end - start;

          const diffSeconds = Math.floor(diffMs / 1000);
          const calculatedFee = diffSeconds * ratePerSecond;

          updatedFormData.totalDutyTime = diffSeconds;
          updatedFormData.totalDutyFee = Math.round(calculatedFee);
        }
      }

      return updatedFormData;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare submission data
    const submissionData = {
      ...formData,
      totalAmount: formData.totalDutyFee,
    };

    try {
      const result = await postNursingData(submissionData).unwrap();
      toast.success(result?.message);

      // Reset form after successful submission
      setFormData({
        date: currentDate,
        employeeName: user?.userName || '',
        phone: user?.phone || '',
        nursingId: user?._id || '',
        messName: '',
        dutyStartTime: '',
        dutyEndTime: '',
        totalDutyTime: 0,
        totalDutyFee: 0,
      });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save data');
    }
  };

  return (
    <div>
      <div className="lg:text-3xl text-2xl tracking-tight font-semibold capitalize text-center py-5 bg-[#EFF6FF] text-[#1B3764] leading-tight">
        <h1 className="text-[#1B3764] leading-tight">Nursing Attendance</h1>
        <BreadCrumbMenu />
      </div>

      <section className="lg:p-6 text-gray-900">
        <h1 className="text-center my-5 capitalize text-[#1B3764] font-semibold border-b border-b-[#1B3764]">
          Enter Nursing work details
        </h1>
        <form
          onSubmit={handleSubmit}
          className="container flex flex-col mx-auto space-y-12"
        >
          {/* Profile Section */}
          <fieldset className="grid grid-cols-4 gap-6 p-6 rounded-none shadow-sm bg-gray-50">
            <div className="col-span-full lg:col-span-1">
              <p className="text-2xl tracking-tight font-bold capitalize text-[#1B3764] leading-tight border-b border-b-[#1B3764]">
                Profile
              </p>
              <p className="text-sm pt-1">Check profile info!</p>
            </div>
            <div className="grid grid-cols-6 gap-4 col-span-full lg:col-span-3">
              <div className="col-span-full">
                <label htmlFor="date" className="text-sm">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={currentDate}
                  max={currentDate}
                  className="w-full rounded-none focus:ring focus:ring-opacity-75 text-gray-900 focus:ring-default-600 border border-gray-300 p-3"
                />
              </div>
              <div className="col-span-full">
                <label htmlFor="employeeName" className="text-sm">
                  Full Name
                </label>
                <input
                  type="text"
                  name="employeeName"
                  id="employeeName"
                  value={formData.employeeName}
                  onChange={handleChange}
                  disabled
                  className="w-full rounded-none focus:ring focus:ring-opacity-75 text-gray-900 focus:ring-default-600 border border-gray-300 p-3"
                />
              </div>
              <div className="col-span-full">
                <label htmlFor="phone" className="text-sm">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled
                  className="w-full rounded-none focus:ring focus:ring-opacity-75 text-gray-900 focus:ring-default-600 border border-gray-300 p-3"
                />
              </div>
              <div className="col-span-full">
                <label htmlFor="nursingId" className="text-sm">
                  ID
                </label>
                <input
                  type="text"
                  name="nursingId"
                  id="nursingId"
                  value={formData.nursingId}
                  onChange={handleChange}
                  disabled
                  className="w-full rounded-none focus:ring focus:ring-opacity-75 text-gray-900 focus:ring-default-600 border border-gray-300 p-3"
                />
              </div>
            </div>
          </fieldset>

          {/* Work Details Section */}
          <fieldset className="grid grid-cols-4 gap-6 p-6 rounded-none shadow-sm bg-gray-50">
            <div className="col-span-full lg:col-span-1">
              <p className="text-2xl tracking-tight font-bold capitalize text-[#1B3764] leading-tight border-b border-b-[#1B3764]">
                Work Details
              </p>
              <p className="text-sm pt-1">Enter your details of work!</p>
            </div>
            <div className="grid grid-cols-6 gap-4 col-span-full lg:col-span-3">
              <div className="col-span-full">
                <label htmlFor="messName" className="text-sm">
                  Type mess name
                </label>
                <input
                  type="text"
                  name="messName"
                  id="messName"
                  value={formData.messName}
                  onChange={handleChange}
                  className="w-full rounded-none focus:ring focus:ring-opacity-75 text-gray-900 focus:ring-default-600 border border-gray-300 p-3"
                />
              </div>
              <div className="col-span-full">
                <label htmlFor="totalDutyFee" className="text-sm">
                  Total Duty Fee
                </label>
                <input
                  type="text"
                  name="totalDutyFee"
                  id="totalDutyFee"
                  value={formData.totalDutyFee}
                  readOnly
                  className="w-full rounded-none focus:ring focus:ring-opacity-75 text-gray-900 focus:ring-default-600 border border-gray-300 p-3"
                />
              </div>
              <div className="col-span-full sm:col-span-2">
                <label htmlFor="dutyStartTime" className="text-sm">
                  Start Time
                </label>
                <input
                  type="time"
                  name="dutyStartTime"
                  id="dutyStartTime"
                  value={formData.dutyStartTime}
                  onChange={handleChange}
                  className="w-full rounded-none focus:ring focus:ring-opacity-75 text-gray-900 focus:ring-default-600 border border-gray-300 p-3"
                />
              </div>
              <div className="col-span-full sm:col-span-2">
                <label htmlFor="dutyEndTime" className="text-sm">
                  End Time
                </label>
                <input
                  type="time"
                  name="dutyEndTime"
                  id="dutyEndTime"
                  value={formData.dutyEndTime}
                  onChange={handleChange}
                  className="w-full rounded-none focus:ring focus:ring-opacity-75 text-gray-900 focus:ring-default-600 border border-gray-300 p-3"
                />
              </div>
              <div className="col-span-full sm:col-span-2">
                <label htmlFor="totalDutyTime" className="text-sm">
                  Total Duty Time
                </label>
                <input
                  type="text"
                  name="totalDutyTime"
                  id="totalDutyTime"
                  value={formData.totalDutyTime}
                  readOnly
                  className="w-full rounded-none focus:ring focus:ring-opacity-75 text-gray-900 focus:ring-default-600 border border-gray-300 p-3"
                />
              </div>
              <div className="col-span-full">
                <label htmlFor="totalDutyTime" className="text-sm">
                  Total Duty Time
                </label>
                <input
                  type="text"
                  name="messDutyFee"
                  id="messDutyFee"
                  value={formData.messDutyFee}
                  readOnly
                  className="w-full rounded-none focus:ring focus:ring-opacity-75 text-gray-900 focus:ring-default-600 border border-gray-300 p-3"
                />
              </div>
              <div className="col-span-full">
                <button
                  type="submit"
                  className="w-full my-10 py-3 basis-full md:basis-[20%] btn btn-md border border-[#EFF6FF] hover:border-[#c3d8f0] duration-500 rounded-none text-[#1B3764] hover:text-[#1B3764] bg-[#d9e4f1] hover:bg-[#EFF6FF]"
                >
                  Submit
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      </section>
    </div>
  );
};

export default Attendance;

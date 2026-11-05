// @ts-nocheck
import {
  Camera,
  Loader2,
  Upload,
  X,
  GraduationCap,
  CalendarDays,
  School,
  CheckCircle2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';

const EditGreenCardModal = ({
  isOpen,
  onClose,
  // Props from Hook
  formData,
  handleChange,
  handleUpdateCard,
  isLoading,
  isUpdating,
  photo,
  setPhoto,
  currentPhotoUrl,
  // Dropdown Data
  institutesData,
  departmentsData,
  sessionOptions,
}) => {
  // Local state exclusively for the custom searchable dropdown
  const [isInsDropdownOpen, setIsInsDropdownOpen] = useState(false);
  const [searchIns, setSearchIns] = useState('');
  const webcamRef = useRef(null);
  const [useCamera, setUseCamera] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Filter institutes based on search input
  const filteredInstitutes =
    institutesData?.data?.filter((inst) =>
      inst.name.toLowerCase().includes(searchIns.toLowerCase()),
    ) || [];

  // React Hook Form Setup
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      studentName: formData?.studentName || '',
      studentId: formData?.studentId || '',
      studentPhone: formData?.studentPhone || '',
      examType: formData?.examType || 'Short',
      department: formData?.department || '',
      academicYear: formData?.academicYear || '',
      amount: formData?.amount || '',
      polytechnicName: formData?.polytechnicName || '',
    },
  });

  // Watch polytechnic name for custom dropdown
  const watchedPolytechnicName = watch('polytechnicName');

  // Reset form if formData changes (e.g., opening modal for a different student)
  useEffect(() => {
    if (formData) {
      reset({
        studentName: formData?.studentName || '',
        studentId: formData?.studentId || '',
        studentPhone: formData?.studentPhone || '',
        examType: formData?.examType || 'Short',
        department: formData?.department || '',
        academicYear: formData?.academicYear || '',
        amount: formData?.amount || '',
        polytechnicName: formData?.polytechnicName || '',
      });
      setNewPhotoFile(null);
      setPreviewUrl(null);
      setUseCamera(false);
    }
  }, [formData, reset]);

  // File selection handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024) {
        alert('Max 100KB allowed');
        e.target.value = '';
        return;
      }
      setNewPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Camera Capture Handler (Converts Base64 to File object)
  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'captured_photo.jpg', {
            type: 'image/jpeg',
          });
          setNewPhotoFile(file);
          setPreviewUrl(imageSrc);
          setUseCamera(false); // Switch back to preview
        });
    }
  }, [webcamRef]);

  // Form Submission Handler to structure the FormData

  const onSubmit = (data) => {
    const formDataToSend = new FormData();

    // 1. Text Data Append
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        if (key === 'amount') {
          formDataToSend.append(key, Number(data[key]));
        } else {
          formDataToSend.append(key, data[key]);
        }
      }
    });

    // 2. Photo Append (Only if a NEW photo is captured/selected)
    if (newPhotoFile) {
      formDataToSend.append('studentPhoto', newPhotoFile);
    }

    handleUpdateCard(formDataToSend);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl p-6 bg-white rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Edit Green Card</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Update Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-slate-500" />
              <label className="text-sm font-semibold tracking-wider uppercase text-slate-700">
                Update Student Photo
              </label>
            </div>

            <div className="flex flex-col items-center gap-6 p-6 transition-all border-2 border-dashed rounded-xl bg-slate-50/30 md:flex-row hover:border-slate-300">
              {/* Current Photo Preview (if no new photo) */}
              {currentPhotoUrl && !previewUrl && (
                <div className="relative">
                  <img
                    src={currentPhotoUrl}
                    alt="Current"
                    className="object-cover w-24 h-24 rounded-lg"
                  />
                  <span className="absolute bottom-0 left-0 right-0 text-xs text-center text-white rounded-b-lg bg-black/50">
                    Current
                  </span>
                </div>
              )}

              {/* New Photo Preview */}
              {previewUrl && (
                <div className="relative rounded-lg group ring-2 ring-slate-900 ring-offset-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="object-cover w-24 h-24 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setNewPhotoFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 -top-2 -right-2 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex flex-col w-full gap-2 md:w-auto">
                <button
                  type="button"
                  onClick={() => setUseCamera(false)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-md shadow-sm border ${
                    !useCamera
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-4 h-4" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUseCamera(true)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-md shadow-sm border ${
                    useCamera
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Camera className="w-4 h-4" /> Live Camera
                </button>
              </div>

              <div className="flex-1 w-full max-w-sm">
                {!useCamera ? (
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs cursor-pointer text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                    />
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center overflow-hidden bg-black rounded-lg shadow-inner aspect-video">
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="object-cover w-full"
                    />
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="absolute px-4 py-2 text-xs font-bold transition-all -translate-x-1/2 rounded-full shadow-lg bottom-4 left-1/2 bg-white/90 backdrop-blur hover:bg-white active:scale-95 text-black"
                    >
                      Capture Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Student Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Student Name
              </label>
              <input
                {...register('studentName', { required: true })}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                placeholder="Student Name"
              />
            </div>

            {/* Student ID */}
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Student ID
              </label>
              <input
                {...register('studentId', { required: true })}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                placeholder="Student ID"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                {...register('studentPhone', { required: true })}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                placeholder="Phone Number"
              />
            </div>

            {/* Exam Type */}
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Exam Type
              </label>
              <select
                {...register('examType')}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
              >
                <option value="Short">Short Term Exam</option>
                <option value="Long">Final/Long Exam</option>
              </select>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <GraduationCap size={14} /> Department
              </label>
              <select
                {...register('department', { required: true })}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
              >
                <option value="" disabled>
                  Select Dept
                </option>
                {departmentsData?.data?.map((dept) => (
                  <option key={dept?._id} value={dept?.name}>
                    {dept?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Session */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <CalendarDays size={14} /> Session
              </label>
              <select
                {...register('academicYear', { required: true })}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
              >
                <option value="" disabled>
                  Select Session
                </option>
                {sessionOptions?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Amount (BDT)
              </label>
              <input
                type="number"
                {...register('amount', { required: true })}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                placeholder="Amount"
              />
            </div>

            {/* Polytechnic Name Searchable Dropdown */}
            <div className="relative space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <School size={14} /> Polytechnic Name
              </label>
              <div
                onClick={() => setIsInsDropdownOpen(!isInsDropdownOpen)}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg cursor-pointer flex justify-between items-center focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
              >
                <span
                  className={
                    watchedPolytechnicName ? 'text-slate-900' : 'text-slate-400'
                  }
                >
                  {watchedPolytechnicName || 'Select institute...'}
                </span>
                <span className="text-xs text-slate-400">▼</span>
              </div>

              {isInsDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search..."
                    value={searchIns}
                    onChange={(e) => setSearchIns(e.target.value)}
                    className="w-full p-3 border-b border-slate-100 outline-none text-sm bg-slate-50 focus:ring-0"
                  />
                  <div className="max-h-48 overflow-y-auto">
                    {filteredInstitutes?.length > 0 ? (
                      filteredInstitutes?.map((inst) => (
                        <div
                          key={inst?._id}
                          onClick={() => {
                            setValue('polytechnicName', inst.name, {
                              shouldValidate: true,
                            });
                            setIsInsDropdownOpen(false);
                            setSearchIns('');
                          }}
                          className="px-4 py-2.5 text-sm hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                        >
                          {inst.name}
                          {watchedPolytechnicName === inst.name && (
                            <CheckCircle2
                              size={14}
                              className="text-slate-900"
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2.5 text-sm text-slate-400">
                        No institute found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium transition-colors rounded-md text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white transition-all rounded-md bg-slate-900 hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/10 disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGreenCardModal;

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

// ==========================================
// Types & Interfaces
// ==========================================
export interface ApplicationSettings {
  isActive: boolean;
  startDate: string;
  endDate: string;
  buttonText: string;
  buttonLink: string;
}

export interface AdmissionTestSettings {
  isActive: boolean;
  examDate: string;
}

export interface OfficeHourSettings {
  isActive: boolean;
  openingTime: string;
  closingTime: string;
  weeklyHoliday: string;
  message: string;
}

export interface TimelineFormData {
  session: string;
  title: string;
  description: string;
  application: ApplicationSettings;
  admissionTest: AdmissionTestSettings;
  officeHour: OfficeHourSettings;
  [key: string]: unknown;
}

export interface TimelineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => { unwrap: () => Promise<any> };
  editingData?: {
    _id?: string;
    session?: string;
    title?: string;
    description?: string;
    application?: Partial<ApplicationSettings>;
    admissionTest?: Partial<AdmissionTestSettings>;
    officeHour?: Partial<OfficeHourSettings>;
  } | null;
  isLoading: boolean;
}

const INITIAL_STATE: TimelineFormData = {
  session: "DUET Admission 2026",
  title: "",
  description: "",

  application: {
    isActive: false,
    startDate: "",
    endDate: "",
    buttonText: "Apply Now",
    buttonLink: "/admission",
  },

  admissionTest: {
    isActive: false,
    examDate: "",
  },

  officeHour: {
    isActive: false,
    openingTime: "09:00 AM",
    closingTime: "05:00 PM",
    weeklyHoliday: "Friday",
    message:
      "For admission related information, please visit the admission office during office hours.",
  },
};

const TimelineFormModal: React.FC<TimelineFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingData,
  isLoading,
}) => {
  const [formData, setFormData] = useState<TimelineFormData>(INITIAL_STATE);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (editingData) {
      setFormData({
        session: editingData.session || "DUET Admission 2026",
        title: editingData.title || "",
        description: editingData.description || "",

        application: {
          isActive: editingData.application?.isActive ?? false,
          startDate: editingData.application?.startDate
            ? new Date(editingData.application.startDate)
                .toISOString()
                .split("T")[0]
            : "",
          endDate: editingData.application?.endDate
            ? new Date(editingData.application.endDate)
                .toISOString()
                .split("T")[0]
            : "",
          buttonText: editingData.application?.buttonText || "Apply Now",
          buttonLink: editingData.application?.buttonLink || "/admission",
        },

        admissionTest: {
          isActive: editingData.admissionTest?.isActive ?? false,
          examDate: editingData.admissionTest?.examDate
            ? new Date(editingData.admissionTest.examDate)
                .toISOString()
                .slice(0, 16)
            : "",
        },

        officeHour: {
          isActive: editingData.officeHour?.isActive ?? false,
          openingTime: editingData.officeHour?.openingTime || "09:00 AM",
          closingTime: editingData.officeHour?.closingTime || "05:00 PM",
          weeklyHoliday: editingData.officeHour?.weeklyHoliday || "Friday",
          message:
            editingData.officeHour?.message ||
            "For admission related information, please visit the admission office during office hours.",
        },
      });
    } else {
      setFormData(INITIAL_STATE);
    }
    setErrorMessage("");
  }, [editingData, isOpen]);

  if (!isOpen) return null;

  // Root level input handler
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Nested input/checkbox handler with strict key safety
  const handleNestedChange = <
    K extends keyof TimelineFormData,
    SubK extends keyof TimelineFormData[K],
  >(
    section: K,
    field: SubK,
    value: TimelineFormData[K][SubK],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any>),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      if (editingData && editingData._id) {
        await onSubmit({ id: editingData._id, body: formData }).unwrap();
      } else {
        await onSubmit(formData).unwrap();
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || "Something went wrong.",
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {editingData
            ? "Edit Admission Timeline"
            : "Create Admission Timeline"}
        </h2>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Session *
              </label>
              <input
                type="text"
                name="session"
                value={formData.session}
                onChange={handleChange}
                required
                placeholder="e.g. DUET Admission 2026"
                className="mt-1 w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Undergraduate Admission"
                className="mt-1 w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* 1. APPLICATION SECTION */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-blue-900 uppercase">
                Application Settings
              </h4>
              <label className="inline-flex items-center cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={formData.application.isActive}
                  onChange={(e) =>
                    handleNestedChange(
                      "application",
                      "isActive",
                      e.target.checked,
                    )
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-700">
                  Active
                </span>
              </label>
            </div>

            {formData.application.isActive && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.application.startDate}
                    onChange={(e) =>
                      handleNestedChange(
                        "application",
                        "startDate",
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full border rounded-md p-2 text-sm bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    End Date (Deadline)
                  </label>
                  <input
                    type="date"
                    value={formData.application.endDate}
                    onChange={(e) =>
                      handleNestedChange(
                        "application",
                        "endDate",
                        e.target.value,
                      )
                    }
                    className="mt-1 w-full border rounded-md p-2 text-sm bg-white outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. ADMISSION TEST SECTION */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-purple-900 uppercase">
                Admission Test Settings
              </h4>
              <label className="inline-flex items-center cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={formData.admissionTest.isActive}
                  onChange={(e) =>
                    handleNestedChange(
                      "admissionTest",
                      "isActive",
                      e.target.checked,
                    )
                  }
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-700">
                  Active
                </span>
              </label>
            </div>

            {formData.admissionTest.isActive && (
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-700">
                  Exam Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.admissionTest.examDate}
                  onChange={(e) =>
                    handleNestedChange(
                      "admissionTest",
                      "examDate",
                      e.target.value,
                    )
                  }
                  className="mt-1 w-full border rounded-md p-2 text-sm bg-white outline-none"
                />
              </div>
            )}
          </div>

          {/* 3. OFFICE HOUR SECTION */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-amber-900 uppercase">
                Office Hour Settings
              </h4>
              <label className="inline-flex items-center cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={formData.officeHour.isActive}
                  onChange={(e) =>
                    handleNestedChange(
                      "officeHour",
                      "isActive",
                      e.target.checked,
                    )
                  }
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-700">
                  Active
                </span>
              </label>
            </div>

            {formData.officeHour.isActive && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Opening Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM"
                      value={formData.officeHour.openingTime}
                      onChange={(e) =>
                        handleNestedChange(
                          "officeHour",
                          "openingTime",
                          e.target.value,
                        )
                      }
                      className="mt-1 w-full border rounded-md p-2 text-sm bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Closing Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 05:00 PM"
                      value={formData.officeHour.closingTime}
                      onChange={(e) =>
                        handleNestedChange(
                          "officeHour",
                          "closingTime",
                          e.target.value,
                        )
                      }
                      className="mt-1 w-full border rounded-md p-2 text-sm bg-white outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Weekly Holiday
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Friday"
                      value={formData.officeHour.weeklyHoliday}
                      onChange={(e) =>
                        handleNestedChange(
                          "officeHour",
                          "weeklyHoliday",
                          e.target.value,
                        )
                      }
                      className="mt-1 w-full border rounded-md p-2 text-sm bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Notice Message
                    </label>
                    <input
                      type="text"
                      value={formData.officeHour.message}
                      onChange={(e) =>
                        handleNestedChange(
                          "officeHour",
                          "message",
                          e.target.value,
                        )
                      }
                      className="mt-1 w-full border rounded-md p-2 text-sm bg-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* General Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700">
              General Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Additional instructions..."
              className="mt-1 w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border rounded-md text-sm text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition disabled:opacity-50 font-medium cursor-pointer"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimelineFormModal;

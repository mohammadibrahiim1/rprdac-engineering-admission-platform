import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Camera,
  Edit3,
  Save,
  X,
  Shield,
  CheckCircle2,
  Loader2,
  BadgeCheck,
  Smartphone,
  Mail,
  CameraIcon,
  Home,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import {
  useGetSingleUserQuery,
  useUpdateSingleUserMutation,
} from "../../../../redux/features/users/userApi";

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const UserAccountSettings = () => {
  const auth = useSelector((state) => state?.auth?.user);
  const { data: user, isLoading } = useGetSingleUserQuery(auth?.userId);
  const [updateSingleUser] = useUpdateSingleUserMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [formData, setFormData] = useState({
    userName: "",
    phone: "",
    userType: "",
    profilePicture: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user?.userName || "",
        phone: user?.phone || "",
        userType: user?.userType || "",
        profilePicture: user?.profilePicture || "",
      });
      setPreviewImage(
        user?.profilePicture ? `${SERVER}${user.profilePicture}` : "",
      );
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, profilePicture: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const fd = new FormData();
      if (formData.userName !== user.userName)
        fd.append("userName", formData.userName);
      if (formData.phone !== user.phone) fd.append("phone", formData.phone);
      if (formData.profilePicture instanceof File)
        fd.append("profilePicture", formData.profilePicture);
      if (formData.userType !== user.userType)
        fd.append("userType", formData.userType);

      if (fd.entries().next().done) {
        toast.error("No changes detected");
        setIsSaving(false);
        return;
      }

      await updateSingleUser({ userId: user.userId, formData: fd }).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 font-sans text-slate-950">
      {/* --- SHADCN-STYLE ILLUSTRATED HEADER --- */}
      {/* Cover Graphic Strip */}
      <div className="relative w-full h-44 bg-gradient-to-r from-slate-100 via-slate-200/70 to-zinc-100 border-b border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute right-24 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent blur-2xl"></div>
      </div>

      {/* ─── Header with Gradient Title ─── */}
      <motion.header
        // variants={itemVariants}
        className="border-b border-[#E8E8E5] px-5 sm:px-5 py-6 sm:py-8 bg-[#FDFDFD]"
      >
        <div className="flex flex-col gap-6 -mt-20 relative z-10 lg:flex-row lg:items-end lg:justify-between">
          {/* Left Side: Logo/Icon, Title & Description */}
          <div className="flex flex-col sm:items-start gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.05,
                type: "spring",
                stiffness: 200,
                damping: 18,
              }}
              className="inline-flex items-center justify-center w-24 h-24 rounded bg-white border border-slate-200/80 shadow-md p-5 text-4xl select-none"
            >
              <User className="w-auto h-auto sm:w-auto sm:h-auto" />
            </motion.div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-[#122054] to-[#2C2484] bg-clip-text text-transparent">
                  Account Settings
                </span>
              </h1>

              {/* Meta Tags */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7A7A75] font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                  Active User
                </span>
                <span className="hidden sm:inline text-[#E8E8E5]">|</span>
                <span className="flex items-center gap-1">Account Records</span>
              </div>

              <p className="text-xs sm:text-[13px] text-[#8A8A80] max-w-xl leading-relaxed pt-0.5">
                View and update user profiles, check registration details, and
                track fee payments. Easily filter through different classes or
                batches and manage all student information in one place.
              </p>
            </div>
          </div>
        </div>
      </motion.header>
      <div className="max-w-5xl px-6 mt-5 ps-6 lg:ps-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* --- LEFT COLUMN: PROFILE SUMMARY --- */}
          <aside className="lg:col-span-4">
            <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl">
              <div className="p-6 text-center">
                <div className="relative inline-block group">
                  <div className="w-32 h-32 overflow-hidden border-4 border-white rounded-full shadow-md bg-slate-100">
                    <img
                      src={
                        previewImage ||
                        `https://ui-avatars.com/api/?name=${user?.userName || "User"}&background=6366f1&color=fff`
                      }
                      alt="Profile"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center transition-opacity rounded-full opacity-0 cursor-pointer bg-black/50 group-hover:opacity-100">
                      <CameraIcon className="w-6 h-6 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </label>
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  <h2 className="text-xl font-semibold capitalize text-slate-900">
                    {user?.userName}
                  </h2>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
                    {user?.userType}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Account Status</span>
                    <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* --- RIGHT COLUMN: MAIN FORM/DETAILS --- */}
          <main className="lg:col-span-8">
            <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Profile Information
                  </h3>
                  <p className="text-sm text-slate-500">
                    Update your account details and photo.
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-md border-slate-200 hover:bg-slate-50"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                )}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.form
                      key="edit"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <ShadcnInput
                          label="Full Name"
                          value={formData.userName}
                          onChange={(val) =>
                            setFormData({ ...formData, userName: val })
                          }
                          placeholder="Enter name"
                        />
                        <ShadcnInput
                          label="Phone Number"
                          value={formData.phone}
                          onChange={(val) =>
                            setFormData({ ...formData, phone: val })
                          }
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Account Role
                        </label>
                        <select
                          value={formData.userType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              userType: e.target.value,
                            })
                          }
                          className="flex w-full h-10 px-3 py-2 text-sm bg-white border rounded-md border-slate-200 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        >
                          <option value="admin">Admin</option>
                          <option value="teacher">Teacher</option>
                          <option value="employee">Employee</option>
                          <option value="nursing">Nursing</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-sm font-medium transition-colors border rounded-md border-slate-200 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save Changes
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="view"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 gap-8 capitalize md:grid-cols-2">
                        <DetailRow
                          icon={User}
                          label="Name"
                          value={user?.userName}
                        />
                        <DetailRow
                          icon={Smartphone}
                          label="Contact"
                          value={user?.phone || "Not provided"}
                        />
                        <DetailRow
                          icon={Shield}
                          label="Account Role"
                          value={user?.userType}
                          isCapitalized
                        />
                        <DetailRow
                          icon={CheckCircle2}
                          label="Security Status"
                          value="Active"
                          isStatus
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const ShadcnInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium leading-none text-slate-700">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex w-full h-10 px-3 py-2 text-sm bg-white border rounded-md border-slate-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
    />
  </div>
);

const DetailRow = ({ icon: Icon, label, value, isStatus, isCapitalized }) => (
  <div className="flex items-center gap-4">
    <div className="flex items-center justify-center w-10 h-10 border rounded-lg border-slate-100 bg-slate-50">
      <Icon className="w-5 h-5 text-slate-600" />
    </div>
    <div>
      <p className="text-xs font-medium tracking-tight uppercase text-slate-500">
        {label}
      </p>
      <p
        className={`text-sm font-semibold text-slate-900 ${isCapitalized ? "capitalize" : ""}`}
      >
        {value}
        {isStatus && (
          <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 rounded-full font-bold">
            ACTIVE
          </span>
        )}
      </p>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-white">
    <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
    <p className="text-sm font-medium tracking-widest uppercase text-slate-500 animate-pulse">
      Loading Account...
    </p>
  </div>
);

export default UserAccountSettings;

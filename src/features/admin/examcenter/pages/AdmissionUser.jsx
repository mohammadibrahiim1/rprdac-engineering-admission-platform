import { useState } from "react";

import { useGetAdmissionUserQuery } from "@/redux/features/admin/adminApi";
import { useCreateStaffAccountMutation } from "@/features/auth/authApi";
import { useUpdateAdmissionStaffAccountMutation } from "@/features/auth/authApi";

import { toast } from "sonner";

const AdmissionUser = () => {
  const [formData, setFormData] = useState({
    staffName: "",
    userName: "",
    password: "",
  });
  const [createStaffAccount, { isLoading: creating }] =
    useCreateStaffAccountMutation();

  const [
    updateAdmissionStaffAccount,
    { isLoading: updating, error: updateError },
  ] = useUpdateAdmissionStaffAccountMutation();

  const { data, isLoading } = useGetAdmissionUserQuery();

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createStaffAccount(formData).unwrap();
      toast.success(res.message);
    } catch (error) {
      error?.data?.message;
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const res = await updateAdmissionStaffAccount({
      id: data._id,
      user: formData,
    });
    toast.success(res?.data?.message);
    window.location.reload();
  };

  if (updating || creating) {
    return <p>Loading...</p>;
  }

  if (updateError) {
    return <p>{updateError?.data?.message}</p>;
  }

  return (
    <div>
      <header className="py-16">
        <div className="text-3xl font-semibold text-center text-primary/90">
          {data ? (
            <span>Update Admission User</span>
          ) : (
            <span>Create Admission User</span>
          )}
        </div>
        <Breadcrumb></Breadcrumb>
      </header>

      <section className="p-6 text-gray-900 bg-gray-100">
        {!data ? (
          // Create Admission Staff Account
          <form
            onSubmit={handleCreateSubmit}
            className="flex flex-col max-w-lg mx-auto space-y-12"
          >
            <fieldset className="grid grid-cols-4 gap-6 rounded-md shadow-sm lg:p-16 bg-gray-50">
              <div className="space-y-2 col-span-full lg:col-span-1">
                <p className="font-medium">Enter user information</p>
                <p className="text-xs">
                  Create an account for the admission page!
                </p>
              </div>
              <div className="grid grid-cols-6 gap-4 col-span-full lg:col-span-3">
                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="staffName" className="text-sm">
                    Staff Name
                  </label>
                  <input
                    type="text"
                    placeholder="Staff Name"
                    value={formData.staffName}
                    onChange={(e) =>
                      setFormData({ ...formData, staffName: e.target.value })
                    }
                    required
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="username" className="text-sm">
                    User Name
                  </label>
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    required
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="username" className="text-sm">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full p-2 text-white bg-blue-500 rounded col-span-full sm:col-span-4"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Account"}
                </button>
              </div>
            </fieldset>
          </form>
        ) : (
          // Update Admission Staff Account
          <form
            onSubmit={handleUpdateSubmit}
            className="flex flex-col max-w-lg mx-auto space-y-12"
          >
            <fieldset className="grid grid-cols-4 gap-6 p-6 rounded-md shadow-sm bg-gray-50">
              <div className="space-y-2 col-span-full lg:col-span-1">
                <p className="text-xl font-medium">Update User</p>
                <p className="text-xs">Modify the admission staff account!</p>
              </div>
              <div className="grid grid-cols-6 gap-4 col-span-full lg:col-span-3">
                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="staffName" className="text-sm">
                    Old user Name
                  </label>
                  <input
                    type="text"
                    value={data.userName}
                    readOnly
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="staffName" className="text-sm">
                    New Staff Name
                  </label>
                  <input
                    type="text"
                    placeholder="New Staff Name"
                    value={formData.staffName}
                    onChange={(e) =>
                      setFormData({ ...formData, staffName: e.target.value })
                    }
                    required
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="staffName" className="text-sm">
                    New User Name
                  </label>
                  <input
                    type="text"
                    placeholder="New Username"
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    required
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="staffName" className="text-sm">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full p-2 text-white bg-green-500 rounded col-span-full sm:col-span-3"
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update Account"}
                </button>
              </div>
            </fieldset>
          </form>
        )}
      </section>
    </div>
  );
};

export default AdmissionUser;

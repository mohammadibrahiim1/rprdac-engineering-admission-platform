import React from "react";
import { motion } from "framer-motion";
import {
  IBillingRateFormModalProps,
  IUseBillingRateFormReturn,
  IUser,
} from "../types/BillingRate.types";
import { useBillingRateForm } from "../hooks/useBillingRateForm";

export default function BillingRateFormModal({
  open,
  onClose,
  onSuccess,
}: IBillingRateFormModalProps) {
  const {
    register,
    handleCreateSubmit,
    errors,
    isValid,
    isCreating,
    fields,
    append,
    remove,
    handleHourlyRateChange,
    handleSearchChange,
    handleUserTypeChange,
    userTypeFilter,
    usersList,
    userLoading,
    selectedUserIds,
    handleToggleUserSelect,
    handleSelectAllToggle,
  }: IUseBillingRateFormReturn = useBillingRateForm(onClose, onSuccess);

  if (!open) return null;

  const isAllSelected =
    usersList.length > 0 &&
    usersList.every((u: IUser) =>
      selectedUserIds.includes(u._id || u.id || ""),
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-3xl bg-white rounded-md shadow-xl overflow-hidden border border-neutral-100 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div>
            <h3 className="text-lg font-sans font-bold text-neutral-900">
              Create / Bulk Billing Rate
            </h3>
            <p className="text-xs text-neutral-500">
              Select user type, filter users, and assign rates.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleCreateSubmit}
          className="p-6 overflow-y-auto space-y-6 flex-1"
        >
          {/* User Type & Search Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* User Type Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                User Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register("userType", { required: "User type is required" })}
                value={userTypeFilter}
                onChange={(e) => handleUserTypeChange(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-neutral-200 text-sm bg-white focus:outline-none focus:border-neutral-900 transition-all"
              >
                <option value="teacher">Teacher</option>
                <option value="staff">Employee</option>
                <option value="nursing">Nursing</option>
                <option value="other">Other</option>
              </select>
              {errors.userType && (
                <p className="text-xs text-red-500">
                  {errors.userType.message as string}
                </p>
              )}
            </div>

            {/* Search Input (Phone / Name) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Search User (Name / Phone)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by phone or name..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-all"
                />
                {userLoading && (
                  <div className="absolute right-3 top-3 text-xs text-neutral-400">
                    Loading...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Selection Checkbox List Box */}
          <div className="space-y-2 border border-neutral-200 rounded-md p-3 bg-neutral-50/50">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={isAllSelected}
                  onChange={handleSelectAllToggle}
                  className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                />
                <label
                  htmlFor="selectAll"
                  className="text-xs font-bold text-neutral-700 cursor-pointer"
                >
                  Select All ({usersList.length} Users Found)
                </label>
              </div>
              <span className="text-xs font-medium text-blue-600">
                {selectedUserIds.length} User(s) Selected
              </span>
            </div>

            {/* User List with Checkboxes */}
            <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
              {userLoading ? (
                <p className="text-xs text-center py-4 text-neutral-400">
                  Fetching users...
                </p>
              ) : usersList.length === 0 ? (
                <p className="text-xs text-center py-4 text-neutral-400">
                  No users found for this type/search.
                </p>
              ) : (
                usersList.map((user: IUser) => {
                  const uid = user._id || user.id || "";
                  const isChecked = selectedUserIds.includes(uid);
                  return (
                    <div
                      key={uid}
                      onClick={() => handleToggleUserSelect(uid)}
                      className={`px-3 py-2 text-sm rounded-md cursor-pointer flex justify-between items-center transition-colors ${
                        isChecked
                          ? "bg-neutral-900 text-white"
                          : "bg-white hover:bg-neutral-100 text-neutral-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by parent div onClick
                          className="w-4 h-4 rounded cursor-pointer accent-neutral-900"
                        />
                        <span className="font-medium">
                          {user.userName || user.name || "Unnamed"} (
                          {user.phone || "No Phone"})
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          isChecked
                            ? "bg-neutral-800 text-neutral-200"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {user.userType || userTypeFilter}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Dynamic Rates Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Categories & Rates <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  append({
                    category: "",
                    hourlyRate: "",
                    secRate: "",
                    startDate: "",
                    endDate: "",
                  })
                }
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                + Add Category
              </button>
            </div>

            {fields?.map((field, index) => (
              <div
                key={field.id}
                className="p-4 bg-white rounded-md border border-neutral-200 space-y-3 shadow-sm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Category Name */}
                  <div>
                    <input
                      type="text"
                      placeholder="Category (e.g. regular)"
                      {...register(`rates.${index}.category` as const, {
                        required: "Category is required",
                      })}
                      className="w-full h-9 px-3 rounded-md border border-neutral-200 text-sm bg-white focus:outline-none focus:border-neutral-900"
                    />
                    {errors.rates?.[index]?.category && (
                      <span className="text-[10px] text-red-500">
                        {errors.rates[index]?.category?.message as string}
                      </span>
                    )}
                  </div>

                  {/* Hourly Rate */}
                  <div>
                    <input
                      type="number"
                      placeholder="Hourly Rate (BDT)"
                      step={"any"}
                      {...register(`rates.${index}.hourlyRate` as const, {
                        required: "Rate is required",
                        min: { value: 0.1, message: "Must be > 0" },
                        onChange: (e) =>
                          handleHourlyRateChange(index, e.target.value),
                      })}
                      className="w-full h-9 px-3 rounded-md border border-neutral-200 text-sm bg-white focus:outline-none focus:border-neutral-900"
                    />
                    {errors.rates?.[index]?.hourlyRate && (
                      <span className="text-[10px] text-red-500">
                        {errors.rates[index]?.hourlyRate?.message as string}
                      </span>
                    )}
                  </div>

                  {/* Sec Rate (Auto-calculated) */}
                  <div>
                    <input
                      type="text"
                      placeholder="Sec Rate (Auto)"
                      {...register(`rates.${index}.secRate` as const)}
                      readOnly
                      className="w-full h-9 px-3 rounded-md border border-neutral-200 text-sm bg-neutral-100 text-neutral-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      {...register(`rates.${index}.startDate` as const)}
                      className="w-full h-9 px-3 rounded-md border border-neutral-200 text-sm bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      {...register(`rates.${index}.endDate` as const)}
                      className="w-full h-9 px-3 rounded-md border border-neutral-200 text-sm bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs text-red-500 hover:underline pt-1 inline-block"
                  >
                    Remove category
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isCreating || selectedUserIds.length === 0}
              className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating
                ? "Saving..."
                : `Save Rate (${selectedUserIds.length} Users)`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

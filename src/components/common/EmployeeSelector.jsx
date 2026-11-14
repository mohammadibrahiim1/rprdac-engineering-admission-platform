import { useEffect, useRef, useState } from "react";
import { Search, User, Phone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useController } from "react-hook-form";
// Replace with your actual hook
import { useFetchAllEmployeesQuery } from "../../redux/features/staff/employeeApi";

const EmployeeSelector = ({ name, control, labelBase, inputBase }) => {
  const { field } = useController({ name, control });
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const dropdownRef = useRef(null);

  const { data: employeesData, isFetching } = useFetchAllEmployeesQuery(search);
  const employees = employeesData?.data || [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (employee) => {
    setSelected(employee);
    field.onChange(employee._id); // Updates react-hook-form state
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelected(null);
    field.onChange("");
    setSearch("");
  };

  return (
    <div className="relative capitalize" ref={dropdownRef}>
      <label className={labelBase}>Select Employee</label>
      <div className="relative">
        <Search
          className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Search by name, phone, or ID..."
          value={selected ? selected.userName : search}
          onChange={(e) => {
            if (selected) handleClear();
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`${inputBase} pl-10`}
        />
        {selected && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-red-500"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && !selected && (
          <motion.ul
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 w-full p-1 mt-2 overflow-y-auto bg-white border rounded-lg shadow-xl border-slate-200 max-h-64"
          >
            {isFetching ? (
              <li className="px-4 py-3 text-sm text-center text-slate-400">
                Searching...
              </li>
            ) : employees?.length > 0 ? (
              employees?.map((emp) => (
                <li
                  key={emp._id}
                  onClick={() => handleSelect(emp)}
                  className="flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer hover:bg-blue-50"
                >
                  <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-blue-700 bg-blue-100 rounded-full">
                    {emp.userName?.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {emp.userName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {emp.phone}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-center text-slate-400">
                No employees found
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>

      <div className="mt-4">
        {selected ? (
          <div className="flex flex-col gap-2 p-4 mt-4 border border-blue-100 rounded-lg bg-blue-50/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <User size={14} /> {selected.userName}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Phone size={14} /> {selected.phone}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center border-2 border-gray-100 border-dashed rounded-xl">
            <p className="text-xs text-gray-400">Search to select member</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSelector;

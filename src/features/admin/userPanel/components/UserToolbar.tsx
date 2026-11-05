import React from 'react';
import { Search, Download, UserPlus } from 'lucide-react';

interface ToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  userType: string;
  setUserType: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  limit: number | 'all';
  handleLimitChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onExport: () => void;
}

export const UserToolbar: React.FC<ToolbarProps> = ({
  search,
  userType,
  setUserType,
  setSearch,
  statusFilter,
  setStatusFilter,
  limit,
  handleLimitChange,
  onExport,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Filter by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 pr-3 text-sm bg-[#f7f6f3] text-[#37352f] border-none rounded-md focus:ring-2 focus:ring-sky-500/20 w-72 outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 text-sm bg-[#f7f6f3] text-[#37352f] border-none rounded-md outline-none cursor-pointer hover:bg-[#efede8] transition-colors"
        >
          <option value="all">Status: All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="h-10 px-3 text-sm bg-[#f7f6f3] text-[#37352f] border-none rounded-md outline-none cursor-pointer hover:bg-[#efede8] transition-colors"
        >
          <option value="all">User Type: All</option>
          <option value="staff">Employee</option>
          <option value="nursing">Nursing</option>
          <option value="teacher">Teacher</option>
        </select>

        <div className="flex items-center h-10 gap-2 px-3 bg-[#f7f6f3] rounded-md text-sm text-[#37352f]">
          <span className="font-medium opacity-40">Rows:</span>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="font-semibold bg-transparent border-none outline-none cursor-pointer text-[#37352f]"
          >
            {[5, 10, 25, 50].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onExport}
          className="flex h-9 items-center gap-2 px-3.5 text-sm bg-white border border-[#37352f]/10 hover:bg-[#f7f6f3] text-[#37352f] rounded-md transition-all font-medium shadow-sm active:scale-95"
        >
          <Download className="w-4 h-4 text-sky-500" />
          Export CSV / Excel
        </button>
      </div>
    </div>
  );
};

import React, { useMemo, useState, useCallback, ChangeEvent } from "react";
import { AdmissionTimelineItem } from "../timeline-types/Timeline.types";
import { useSelection } from "../hooks/useSelection";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate } from "../utils/fotmatDate";
import { truncate } from "../utils/formatters";

// ==========================================
// Types & Interfaces
// ==========================================
export interface TimelineTableProps {
  timelines?: AdmissionTimelineItem[];
  onEdit: (item: AdmissionTimelineItem) => void;
  onDeleteSelected: (ids: string[]) => Promise<void> | void;
  isDeleting: boolean;
}

const TimelineTable: React.FC<TimelineTableProps> = React.memo(
  ({ timelines = [], onEdit, onDeleteSelected, isDeleting }) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const debouncedSearch = useDebounce<string>(searchTerm, 300);

    const {
      selectedIds,
      toggleSelection,
      selectAll,
      clearSelection,
      isSelected,
    } = useSelection();

    // Search logic
    const filteredTimelines = useMemo(() => {
      if (!debouncedSearch) return timelines;
      const query = debouncedSearch.toLowerCase();
      return timelines.filter(
        (t) =>
          t.session?.toLowerCase().includes(query) ||
          t.title?.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query),
      );
    }, [timelines, debouncedSearch]);

    const allFilteredIds = useMemo(
      () => filteredTimelines.map((t) => t._id),
      [filteredTimelines],
    );

    const isAllSelected =
      allFilteredIds.length > 0 && allFilteredIds.every((id) => isSelected(id));

    const handleSelectAllToggle = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
          selectAll(allFilteredIds);
        } else {
          clearSelection();
        }
      },
      [allFilteredIds, selectAll, clearSelection],
    );

    const handleDelete = async () => {
      if (selectedIds.length === 0) return;
      if (
        window.confirm(
          `Are you sure you want to delete ${selectedIds.length} item(s)?`,
        )
      ) {
        await onDeleteSelected(selectedIds);
        clearSelection();
      }
    };

    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Search & Bulk Action Header */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-slate-100 bg-slate-50/50">
          <input
            type="text"
            placeholder="Search by session, title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium placeholder:text-slate-400 transition-all"
          />

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {isDeleting
                ? "Deleting..."
                : `Delete Selected (${selectedIds.length})`}
            </button>
          )}
        </div>

        {/* Shadcn UI Styled Table Area */}
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-xs">
            <thead className="[&_tr]:border-b bg-slate-50/80">
              <tr className="border-b border-slate-100 transition-colors">
                <th className="h-10 px-4 text-left align-middle font-semibold text-slate-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    aria-label="Select all timelines"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    onChange={handleSelectAllToggle}
                    checked={isAllSelected}
                  />
                </th>
                <th className="h-10 px-4 text-left align-middle font-semibold text-slate-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="h-10 px-4 text-left align-middle font-semibold text-slate-500 uppercase tracking-wider">
                  Title & Details
                </th>
                <th className="h-10 px-4 text-left align-middle font-semibold text-slate-500 uppercase tracking-wider">
                  Application Status
                </th>
                <th className="h-10 px-4 text-left align-middle font-semibold text-slate-500 uppercase tracking-wider">
                  Admission Test
                </th>
                <th className="h-10 px-4 text-left align-middle font-semibold text-slate-500 uppercase tracking-wider">
                  Office Hours
                </th>
                <th className="h-10 px-4 text-left align-middle font-semibold text-slate-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="h-10 px-4 text-right align-middle font-semibold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0 divide-y divide-slate-100">
              {filteredTimelines.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="h-32 text-center text-slate-400 font-medium"
                  >
                    No matching timelines found.
                  </td>
                </tr>
              ) : (
                filteredTimelines.map((item) => {
                  const app = item.application;
                  const test = item.admissionTest;
                  const office = item.officeHour;

                  return (
                    <tr
                      key={item._id}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100"
                    >
                      {/* Select Checkbox */}
                      <td className="p-4 align-middle">
                        <input
                          type="checkbox"
                          aria-label={`Select timeline ${item._id}`}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={isSelected(item._id)}
                          onChange={() => toggleSelection(item._id)}
                        />
                      </td>

                      {/* Session */}
                      <td className="p-4 align-middle font-semibold text-slate-900 whitespace-nowrap">
                        {item.session || "—"}
                      </td>

                      {/* Title & Description */}
                      <td className="p-4 align-middle max-w-xs">
                        <div
                          className="font-medium text-slate-900 truncate"
                          title={item.title}
                        >
                          {truncate(item.title, 30) || "—"}
                        </div>
                        {item.description && (
                          <div
                            className="text-[11px] text-slate-500 truncate"
                            title={item.description}
                          >
                            {item.description}
                          </div>
                        )}
                      </td>

                      {/* Application Status */}
                      <td className="p-4 align-middle whitespace-nowrap">
                        {app ? (
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  app.isActive
                                    ? "bg-emerald-500"
                                    : "bg-slate-300"
                                }`}
                              />
                              <span className="font-medium text-slate-700">
                                {app.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              {formatDate(app.startDate)} -{" "}
                              {formatDate(app.endDate)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Admission Test */}
                      <td className="p-4 align-middle whitespace-nowrap">
                        {test ? (
                          test.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 border border-blue-200/60 text-blue-700 rounded-md text-xs font-medium">
                              {test.examDate
                                ? formatDate(test.examDate)
                                : "Date Pending"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[11px]">
                              Not Active
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Office Hours */}
                      <td className="p-4 align-middle whitespace-nowrap">
                        {office ? (
                          <div className="text-xs space-y-0.5">
                            <span className="font-medium text-slate-700">
                              {office?.isActive ? "Active" : "Inactive"}
                            </span>
                            <div className="text-slate-800 font-medium">
                              {office?.openingTime} - {office?.closingTime}
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Off:{" "}
                              <span className="text-rose-500 font-medium">
                                {office?.weeklyHoliday}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="p-4 align-middle text-slate-500 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 align-middle text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg text-xs transition cursor-pointer shadow-2xs"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

TimelineTable.displayName = "TimelineTable";

export default TimelineTable;

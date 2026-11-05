import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export const SystemLockTimeline = ({ lock }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    // Date and Time Formatting
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return { date: formattedDate, time: formattedTime };
  };

  const start = formatDateTime(lock?.startDate);
  const end = formatDateTime(lock?.endDate);

  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex items-center gap-1.5 text-gray-700 font-medium whitespace-nowrap">
        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span>
          {start.date}{' '}
          <span className="text-gray-400 font-normal">({start.time})</span>
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-gray-500 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span>
          to {end.date}{' '}
          <span className="text-gray-400 font-normal">({end.time})</span>
        </span>
      </div>
    </div>
  );
};

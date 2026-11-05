import React from 'react';
import { formatDate, formatDateTime } from '../utils/formatters';
import { useCountdown } from '../hooks/useCountdown';
import { DISPLAY_MODE } from '../constants/timeline.constants';
import { pickActiveContent } from '../utils/pickActiveContent';

const CountdownBadge = ({ targetDate }) => {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  if (expired) {
    return (
      <span className="text-red-600 font-semibold text-xs">(Expired)</span>
    );
  }

  return (
    <div className="flex gap-1 text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
      <span>{days}d</span>:<span>{hours}h</span>:<span>{minutes}m</span>:
      <span>{seconds}s</span> left
    </div>
  );
};

const ActiveTimelineCard = React.memo(({ data, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 border rounded-xl animate-pulse mb-6">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-3"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="p-6 text-center border border-dashed rounded-xl bg-gray-50 text-gray-500 mb-6">
        No active admission timeline display is configured.
      </div>
    );
  }

  const activeContent = pickActiveContent(data?.data);

  if (!activeContent) {
    return (
      <div className="p-6 text-center border border-dashed rounded-xl bg-gray-50 text-gray-500 mb-6">
        No sections are currently marked as active.
      </div>
    );
  }

  const {
    displayMode,
    title,
    description,
    application,
    admissionTest,
    officeHour,
  } = activeContent;

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm mb-6">
      <div className="flex justify-between items-center mb-3">
        <span className="px-3 py-1 text-xs font-bold text-blue-800 bg-blue-200 rounded-full uppercase">
          Active: {displayMode}
        </span>
        {displayMode === DISPLAY_MODE.APPLICATION && application?.endDate && (
          <CountdownBadge targetDate={application.endDate} />
        )}
        {displayMode === DISPLAY_MODE.ADMISSION_TEST &&
          admissionTest?.examDate && (
            <CountdownBadge targetDate={admissionTest.examDate} />
          )}
      </div>

      <h3 className="text-xl font-bold text-gray-800">
        {title || 'Untitled Timeline'}
      </h3>
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}

      <div className="mt-4 pt-4 border-t border-blue-200/60 text-sm">
        {/* Application UI */}
        {displayMode === DISPLAY_MODE.APPLICATION && application && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 block text-xs">Start Date</span>
                <strong className="text-gray-800">
                  {formatDate(application.startDate)}
                </strong>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">
                  End Date (Deadline)
                </span>
                <strong className="text-gray-800">
                  {formatDate(application.endDate)}
                </strong>
              </div>
            </div>
            {application.buttonLink && (
              <a
                href={application.buttonLink}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-blue-700 transition"
              >
                {application.buttonText || 'Apply Now'}
              </a>
            )}
          </div>
        )}

        {/* Admission Test UI */}
        {displayMode === DISPLAY_MODE.ADMISSION_TEST && admissionTest && (
          <div>
            <span className="text-gray-500 block text-xs">
              Exam Date & Time
            </span>
            <strong className="text-gray-800">
              {formatDateTime(admissionTest.examDate)}
            </strong>
          </div>
        )}

        {/* Office Hour UI */}
        {displayMode === DISPLAY_MODE.OFFICE_HOUR && officeHour && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 block text-xs">
                  Office Timing
                </span>
                <strong className="text-gray-800">
                  {officeHour.openingTime} - {officeHour.closingTime}
                </strong>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">
                  Weekly Holiday
                </span>
                <strong className="text-red-600">
                  {officeHour.weeklyHoliday || 'None'}
                </strong>
              </div>
            </div>
            {officeHour.message && (
              <p className="text-xs text-gray-600 italic mt-2">
                {officeHour.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ActiveTimelineCard.displayName = 'ActiveTimelineCard';
export default ActiveTimelineCard;

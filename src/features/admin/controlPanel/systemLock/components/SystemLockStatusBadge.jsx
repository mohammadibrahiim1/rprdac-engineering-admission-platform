import React from 'react';
import { getLockData } from '../utils/lockHelpers';

export const SystemLockStatusBadge = ({ lock }) => {
  const active = getLockData(lock);

  const asmissionSystemActive = active?.isActive;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        asmissionSystemActive === true
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          asmissionSystemActive === true
            ? 'bg-emerald-500 animate-pulse'
            : 'bg-gray-400'
        }`}
      />
      {asmissionSystemActive === true ? 'Active' : 'Inactive'}
    </span>
  );
};

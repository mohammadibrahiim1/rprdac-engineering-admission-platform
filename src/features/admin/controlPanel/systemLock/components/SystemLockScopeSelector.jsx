import React from 'react';
import { Globe, Users, CalendarCheck } from 'lucide-react';
import { LOCK_SCOPES } from '../constants/lockScopes';

export const SystemLockScopeSelector = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        Scope
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Global Admission */}
        <button
          type="button"
          onClick={() => onChange(LOCK_SCOPES.GLOBAL_ADMISSION)}
          className={`p-3 rounded-lg border-2 transition-all text-left ${
            value === LOCK_SCOPES.GLOBAL_ADMISSION
              ? 'border-[#143F6B] bg-[#143F6B05]'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Globe
            className="w-5 h-5 mb-2"
            style={{
              color:
                value === LOCK_SCOPES.GLOBAL_ADMISSION ? '#143F6B' : '#9CA3AF',
            }}
          />
          <p className="text-sm font-medium text-gray-900">Global Admission</p>
          <p className="text-xs text-gray-500 mt-0.5">Portal-wide control</p>
        </button>

        {/* Student Update */}
        <button
          type="button"
          onClick={() => onChange(LOCK_SCOPES.STUDENT_UPDATE)}
          className={`p-3 rounded-lg border-2 transition-all text-left ${
            value === LOCK_SCOPES.STUDENT_UPDATE
              ? 'border-[#143F6B] bg-[#143F6B05]'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Users
            className="w-5 h-5 mb-2"
            style={{
              color:
                value === LOCK_SCOPES.STUDENT_UPDATE ? '#143F6B' : '#9CA3AF',
            }}
          />
          <p className="text-sm font-medium text-gray-900">Student Update</p>
          <p className="text-xs text-gray-500 mt-0.5">Batch-specific</p>
        </button>

        {/* Session Lock */}
        <button
          type="button"
          onClick={() => onChange(LOCK_SCOPES.SESSION_LOCK)}
          className={`p-3 rounded-lg border-2 transition-all text-left ${
            value === LOCK_SCOPES.SESSION_LOCK
              ? 'border-[#143F6B] bg-[#143F6B05]'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <CalendarCheck
            className="w-5 h-5 mb-2"
            style={{
              color: value === LOCK_SCOPES.SESSION_LOCK ? '#143F6B' : '#9CA3AF',
            }}
          />
          <p className="text-sm font-medium text-gray-900">Session Lock</p>
          <p className="text-xs text-gray-500 mt-0.5">Block student login</p>
        </button>
      </div>
    </div>
  );
};

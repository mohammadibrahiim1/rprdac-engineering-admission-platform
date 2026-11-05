import { LOCK_SCOPES } from '../constants/lockScopes';

const safeToISO = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

export const buildLockPayload = (formData, selectedLock = null) => {
  // Session lock-er khetre date lagbe na, tai null thakbe
  const isSessionLock = formData.scope === LOCK_SCOPES.SESSION_LOCK;

  const startIso = isSessionLock ? null : safeToISO(formData.startDate);
  const endIso = isSessionLock ? null : safeToISO(formData.endDate);

  if (selectedLock) {
    const isGlobal = selectedLock.scope === LOCK_SCOPES.GLOBAL_ADMISSION;
    const isSession = selectedLock.scope === LOCK_SCOPES.SESSION_LOCK;

    let updateType = 'UPDATE_BATCH';
    if (isGlobal) updateType = 'UPDATE_GLOBAL_ADMISSION';
    else if (isSession) updateType = 'UPDATE_SESSION'; // Backend requirement onujayi update type dite paren

    return {
      updateType,
      targetId: selectedLock._id,
      payload: isGlobal
        ? {
            startDate: startIso,
            endDate: endIso,
            isActive: Boolean(formData.isActive),
          }
        : isSession
          ? {
              session: formData.session ? formData.session.trim() : '',
              isActive: Boolean(formData.isActive),
            }
          : {
              batchName: formData.batchName ? formData.batchName.trim() : '',
              startDate: startIso,
              endDate: endIso,
              isActive: Boolean(formData.isActive),
            },
    };
  }

  // New Creation Payload
  if (formData.scope === LOCK_SCOPES.GLOBAL_ADMISSION) {
    return {
      scope: formData.scope,
      startDate: startIso,
      endDate: endIso,
      isActive: Boolean(formData.isActive),
    };
  }

  if (formData.scope === LOCK_SCOPES.SESSION_LOCK) {
    return {
      scope: formData.scope,
      session: formData.session ? formData.session.trim() : '',
      isActive: Boolean(formData.isActive),
    };
  }

  return {
    scope: formData.scope,
    batchName: formData.batchName ? formData.batchName.trim() : '',
    startDate: startIso,
    endDate: endIso,
    isActive: Boolean(formData.isActive),
  };
};

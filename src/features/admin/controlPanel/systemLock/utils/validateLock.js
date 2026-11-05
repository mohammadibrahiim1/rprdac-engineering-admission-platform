import { LOCK_SCOPES } from '../constants/lockScopes';
import { MESSAGES } from '../constants/messages';

export const validateLockForm = (values) => {
  const errors = {};

  // Student update-er jonno batchName validation
  if (
    values.scope === LOCK_SCOPES.STUDENT_UPDATE &&
    !values.batchName?.trim()
  ) {
    errors.batchName = MESSAGES.VALIDATION.BATCH_REQUIRED;
  }

  // Session lock-er jonno session validation
  if (values.scope === LOCK_SCOPES.SESSION_LOCK && !values.session?.trim()) {
    errors.session = 'Session is required for session locking.';
  }

  // Session lock baade onnanno scope-gulo (Global Admission, Student Update) er jonno date check hobe
  if (values.scope !== LOCK_SCOPES.SESSION_LOCK) {
    if (!values.startDate) {
      errors.startDate = MESSAGES.VALIDATION.START_DATE_REQUIRED;
    }

    if (!values.endDate) {
      errors.endDate = MESSAGES.VALIDATION.END_DATE_REQUIRED;
    }

    if (values.startDate && values.endDate) {
      if (new Date(values.endDate) <= new Date(values.startDate)) {
        errors.endDate = MESSAGES.VALIDATION.END_DATE_AFTER;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

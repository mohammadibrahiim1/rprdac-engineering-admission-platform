import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatedField } from '../../../../../redux/features/student/studentSlice';

const NUMERIC_FIELDS = [
  'courseFee',
  'admissionFee',
  'admissionFeePaid',
  'messServiceCharge',
  'messServiceChargePaid',
  'dueAmount',
  'cgpaDiscount',
  'referenceDiscount',
  'cashback',
  'studentReturnAmount',
  'totalAfterDiscount',
  'deductMoney',
  'cgpa',
  'sscGpa',
  'diplomaGpa',
];

export const useStudentForm = () => {
  const dispatch = useDispatch();

  const student = useSelector(
    (state) => state?.student?.student || state?.student,
  );

  const handleChange = useCallback(
    (e) => {
      if (!e?.target) return;

      let { name, value, type } = e.target;

      // =====================================================
      // 1. Number fields
      // =====================================================
      if (type === 'number' || NUMERIC_FIELDS.includes(name)) {
        value = value === '' ? 0 : Number(value);
      }

      // =====================================================
      // 2. Department
      // =====================================================
      if (name === 'department') {
        dispatch(
          updatedField({
            name,
            value,
          }),
        );

        if (value) {
          const currentId = student?.studentId || '';

          const rawId = currentId.includes('-')
            ? currentId.split('-')[1]
            : currentId;

          dispatch(
            updatedField({
              name: 'studentId',
              value: `${value}-${rawId}`,
            }),
          );
        }

        return;
      }

      // =====================================================
      // 3. Mess dependency handling
      // =====================================================
      if (name === 'mess') {
        const messValue = String(value || '').trim();

        // Update mess first
        dispatch(
          updatedField({
            name: 'mess',
            value: messValue,
          }),
        );

        // Mess removed → clear all dependent fields
        if (!messValue) {
          dispatch(
            updatedField({
              name: 'messReceiptNo',
              value: '',
            }),
          );

          dispatch(
            updatedField({
              name: 'messServiceCharge',
              value: 0,
            }),
          );

          dispatch(
            updatedField({
              name: 'messServiceChargePaid',
              value: 0,
            }),
          );

          dispatch(
            updatedField({
              name: 'room',
              value: '',
            }),
          );
        }

        return;
      }

      // =====================================================
      // 4. Normal field update
      // =====================================================
      dispatch(
        updatedField({
          name,
          value,
        }),
      );
    },
    [dispatch, student?.studentId],
  );

  return {
    student,
    handleChange,
  };
};

import { updatedField } from "@/redux/features/student/studentSlice";
import { useCallback, type ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";

export interface Student {
  studentId?: string;
  department?: string;
  mess?: string;
  [key: string]: unknown;
}

interface StudentStateWrapper {
  student?:
    | {
        student?: Student;
        [key: string]: unknown;
      }
    | Student;
}

const NUMERIC_FIELDS = [
  "courseFee",
  "admissionFee",
  "admissionFeePaid",
  "messServiceCharge",
  "messServiceChargePaid",
  "dueAmount",
  "cgpaDiscount",
  "referenceDiscount",
  "cashback",
  "studentReturnAmount",
  "totalAfterDiscount",
  "deductMoney",
  "cgpa",
  "sscGpa",
  "diplomaGpa",
] as const;

export interface UseStudentFormReturn {
  student: Student | undefined;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
}

export const useStudentForm = (): UseStudentFormReturn => {
  const dispatch = useDispatch();

  const student = useSelector((state: StudentStateWrapper) => {
    const studentState = state?.student;
    if (studentState && typeof studentState === "object") {
      if ("student" in studentState && studentState.student) {
        return studentState.student as Student;
      }
      return studentState as Student;
    }
    return undefined;
  });

  const handleChange = useCallback(
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      if (!e?.target) return;

      const { name, type } = e.target;
      let { value } = e.target;

      // =====================================================
      // 1. Number fields
      // =====================================================
      if (
        type === "number" ||
        (NUMERIC_FIELDS as readonly string[]).includes(name)
      ) {
        value = (value === "" ? 0 : Number(value)) as unknown as string;
      }

      // =====================================================
      // 2. Department
      // =====================================================
      if (name === "department") {
        dispatch(
          updatedField({
            name,
            value,
          }),
        );

        if (value) {
          const currentId = student?.studentId || "";

          const rawId = currentId.includes("-")
            ? currentId.split("-")[1]
            : currentId;

          dispatch(
            updatedField({
              name: "studentId",
              value: `${value}-${rawId}`,
            }),
          );
        }

        return;
      }

      // =====================================================
      // 3. Mess dependency handling
      // =====================================================
      if (name === "mess") {
        const messValue = String(value || "").trim();

        // Update mess first
        dispatch(
          updatedField({
            name: "mess",
            value: messValue,
          }),
        );

        // Mess removed → clear all dependent fields
        if (!messValue) {
          dispatch(
            updatedField({
              name: "messReceiptNo",
              value: "",
            }),
          );

          dispatch(
            updatedField({
              name: "messServiceCharge",
              value: 0,
            }),
          );

          dispatch(
            updatedField({
              name: "messServiceChargePaid",
              value: 0,
            }),
          );

          dispatch(
            updatedField({
              name: "room",
              value: "",
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

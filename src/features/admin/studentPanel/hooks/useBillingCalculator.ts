import { useMemo } from 'react';

export interface BillingCalculationResult {
  referenceDiscount: number;
  cgpaDiscount: number;
  netDiscount: number;
  totalAfterDiscount: number;
}

export const useBillingCalculator = (
  courseFee: number | string | undefined | null,
  admissionFee: number | string | undefined | null,
  cgpa: number | string | undefined | null
): BillingCalculationResult => {
  return useMemo(() => {
    const feeBase = Number(courseFee) || 0;
    const admissionBase = Number(admissionFee) || 0;
    const studentCgpa = Number(cgpa) || 0;

    const referenceDiscount = Math.max(0, feeBase - admissionBase);

    let cgpaPercentage = 0;
    if (studentCgpa >= 3.9) {
      cgpaPercentage = 0.25;
    } else if (studentCgpa >= 3.7) {
      cgpaPercentage = 0.15;
    }

    const cgpaDiscount = feeBase * cgpaPercentage;

    const netDiscount = Math.max(0, cgpaDiscount - referenceDiscount);

    const totalAfterDiscount = admissionBase - netDiscount;

    return {
      referenceDiscount,
      cgpaDiscount,
      netDiscount,
      totalAfterDiscount,
    };
  }, [courseFee, admissionFee, cgpa]);
};
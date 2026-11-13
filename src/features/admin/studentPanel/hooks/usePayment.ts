export interface PaymentStudent {
  admissionFee?: number | string | null;
  admissionFeePaid?: number | string | null;
  messServiceCharge?: number | string | null;
  messServiceChargePaid?: number | string | null;
  [key: string]: unknown;
}

export interface UsePaymentReturn {
  balanceDue: number;
  paymentProgress: number;
}

export const usePayment = (
  student?: PaymentStudent | null,
): UsePaymentReturn => {
  const admissionFee = Number(student?.admissionFee) || 0;
  const admissionFeePaid = Number(student?.admissionFeePaid) || 0;
  const messServiceCharge = Number(student?.messServiceCharge) || 0;
  const messServiceChargePaid = Number(student?.messServiceChargePaid) || 0;

  const totalFee = admissionFee + messServiceCharge;
  const totalPaid = admissionFeePaid + messServiceChargePaid;

  const balanceDue = Math.max(0, totalFee - totalPaid);

  const paymentProgress =
    admissionFee > 0
      ? Math.min(100, Math.max(0, (admissionFeePaid / admissionFee) * 100))
      : 0;

  return { balanceDue, paymentProgress };
};

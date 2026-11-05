export const usePayment = (student) => {
  const balanceDue =
    student?.admissionFee && student?.admissionFeePaid
      ? Math.max(
          0,
          Number(student.admissionFee + student.messServiceCharge) -
            Number(student.admissionFeePaid + student.messServiceChargePaid),
        )
      : 0;

  const paymentProgress =
    student?.admissionFee && student?.admissionFeePaid
      ? Math.min(
          100,
          (Number(student.admissionFeePaid) / Number(student.admissionFee)) *
            100,
        )
      : 0;

  return { balanceDue, paymentProgress };
};

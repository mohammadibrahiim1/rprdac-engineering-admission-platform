import React, { type FC, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import PaymentSummary from "./PaymentSummary";
import SectionHeader from "../../common/SectionHeader";
import PaymentInputs from "./PaymentInputs";

export interface PaymentSectionProps {
  activeSection: string;
  student?: Record<string, unknown> | null;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  balanceDue: number;
  paymentProgress: number;
  isSubmitting: boolean;
}

export const PaymentSection: FC<PaymentSectionProps> = ({
  activeSection,
  student,
  handleChange,
  balanceDue,
  paymentProgress,
  isSubmitting,
}) => {
  if (activeSection !== "payment") return null;

  return (
    <motion.section
      key="payment"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="px-5 lg:px-5"
    >
      <SectionHeader
        icon={CreditCard}
        iconBg="bg-rose-50 text-rose-500"
        title="Payment Information"
        subtitle="Fee structure and payment details"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-4">
        {/* Left Side: Inputs */}
        <div className="col-span-1 lg:col-span-2">
          <PaymentInputs student={student} handleChange={handleChange} />
        </div>

        {/* Right Side: Calculation Summary & Button */}
        <div className="col-span-1 lg:col-span-1">
          <PaymentSummary
            student={student}
            balanceDue={balanceDue}
            paymentProgress={paymentProgress}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </motion.section>
  );
};

export default PaymentSection;

import React from 'react';
import FormField from '../../common/FormField';

const PAYMENT_METHODS = [
  { label: 'Select Payment Method', value: '' },
  { label: 'bKash', value: 'bkash' },
  { label: 'Nagad', value: 'nagad' },
  { label: 'Rocket', value: 'rocket' },
  { label: 'DBBL', value: 'dbbl' },
  { label: 'Cash', value: 'cash' },
];

export default function PaymentInputs({ student, handleChange }) {
  const isCash = student?.paymentMethod === 'cash';

  const fields = [
    {
      name: 'courseFee',
      label: 'Course Fee (৳)',
      placeholder: 'Enter course fee',
      type: 'number',
      isCurrency: true,
      required: true,
      hide: false,
    },
    {
      name: 'admissionFee',
      label: 'Admission Fee (৳)',
      placeholder: 'Enter admission fee',
      type: 'number',
      isCurrency: true,
      required: true,
      hide: false,
    },
    {
      name: 'admissionFeePaid',
      label: 'Amount Paid (৳)',
      placeholder: 'Enter paid amount',
      type: 'number',
      isCurrency: true,
      required: true,
      hide: false,
    },
    {
      name: 'messServiceChargePaid',
      label: 'Mess Service Charge Paid (৳)',
      placeholder: 'Enter paid amount',
      type: 'number',
      isCurrency: true,
      required: true,
      hide: false,
    },
    {
      name: 'paymentMethod',
      label: 'Payment Method',
      type: 'select',
      options: PAYMENT_METHODS,
      required: true,
      hide: false,
    },
    {
      name: 'accountNumber',
      label: 'Account Number',
      placeholder: 'Enter account number',
      type: 'text',
      required: !isCash, // Cash সিলেক্ট থাকলে required উঠে যাবে
      hide: isCash, // Cash সিলেক্ট থাকলে হাইড হবে
    },
    {
      name: 'transactionId',
      label: 'Transaction ID',
      placeholder: 'Enter transaction ID',
      type: 'text',
      required: !isCash, // Cash সিলেক্ট থাকলে required উঠে যাবে
      hide: isCash, // Cash সিলেক্ট থাকলে হাইড হবে
    },
    {
      name: 'comment',
      label: 'Comment',
      placeholder: 'Enter comment',
      type: 'text',
      required: false,
      hide: false,
    },
  ];

  return (
    <div className=" grid grid-cols-2 items-center justify-center gap-4">
      {fields
        ?.filter((field) => !field.hide)
        ?.map((field) => (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
          >
            <div className="relative">
              {/* Currency Symbol (৳) - only for financial amounts */}
              {field.isCurrency && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm text-[#9b9a97] pointer-events-none">
                  ৳
                </span>
              )}

              {/* Select Dropdown for Payment Method */}
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={student?.[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e3e2de] text-sm text-[#37352f] bg-white hover:border-[#b5b3aa] hover:bg-[#fafaf9] focus:border-[#2383e2] focus:ring-2 focus:ring-[#2383e2]/20 outline-none transition-all cursor-pointer"
                >
                  {field?.options?.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.value === ''}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                /* Standard Input Fields */
                <input
                  type={field.type}
                  name={field.name}
                  value={student?.[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  className={`w-full pr-3.5 py-2.5 rounded-md border border-[#e3e2de] text-sm text-[#37352f] placeholder-[#9b9a97] bg-white hover:border-[#b5b3aa] hover:bg-[#fafaf9] focus:border-[#2383e2] focus:ring-2 focus:ring-[#2383e2]/20 outline-none transition-all 
                    ${field.isCurrency ? 'pl-7' : 'pl-3.5'}`}
                />
              )}
            </div>
          </FormField>
        ))}
    </div>
  );
}

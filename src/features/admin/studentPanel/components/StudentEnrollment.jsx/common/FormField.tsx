import React, { type FC, type ReactNode } from "react";

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  children?: ReactNode;
  className?: string;
}

export const FormField: FC<FormFieldProps> = ({
  label,
  required = false,
  children,
  className = "",
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm pb-1 font-semibold text-[#37352f] tracking-wider capitalize">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
      )}
      {children}
    </div>
  );
};

export default FormField;

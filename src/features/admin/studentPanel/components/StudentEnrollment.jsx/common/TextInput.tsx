import React, { type FC, type ChangeEvent } from 'react';

export interface TextInputProps {
  type?: string;
  name: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  step?: string | number;
  readOnly?: boolean;
  className?: string;
}

export const TextInput: FC<TextInputProps> = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  step,
  readOnly = false,
  className = '',
}) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      step={step}
      className={`
        w-full px-3.5 py-2.5 rounded-md border text-xs text-[#37352f]
        placeholder-[#9b9a97] outline-none transition-all duration-150
        ${
          disabled || readOnly
            ? 'bg-[#f7f7f5] border-[#e3e2de] text-[#9b9a97] cursor-not-allowed'
            : 'bg-white border-[#e3e2de] hover:border-[#b5b3aa] hover:bg-[#fafaf9] focus:border-[#2383e2] focus:ring-2 focus:ring-[#2383e2]/20'
        }
        ${className}
      `}
    />
  );
};

export default TextInput;
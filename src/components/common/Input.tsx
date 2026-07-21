import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: ReactNode;
}

export function Input({ label, hint, id, className = "", ...rest }: InputProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label htmlFor={id} className="font-medium text-[14px] text-grey8">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-tag border border-grey3 bg-white px-4 py-3 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none ${className}`}
        {...rest}
      />
      {hint && <span className="font-regular text-[12px] text-grey6">{hint}</span>}
    </div>
  );
}

import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, error, children, required }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[14px] font-bold text-[#1A2035]">
        {label} {required && <span className="text-[#DC2626]">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-[12px] font-bold text-[#DC2626] animate-in fade-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </div>
  );
}

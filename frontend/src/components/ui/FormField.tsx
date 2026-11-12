import React from 'react';

export interface FormFieldProps {
  id?: string;
  htmlFor?: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  htmlFor,
  label,
  required = false,
  hint,
  error,
  children
}) => {
  const targetId = htmlFor || id || '';
  const hintId = hint && targetId ? `${targetId}-hint` : undefined;
  const errorId = error && targetId ? `${targetId}-error` : undefined;

  return (
    <div className="space-y-1 mb-4">
      <label htmlFor={targetId} className="block text-sm font-semibold text-[#1A1A1A]">
        {label} {required && <span className="text-[#B3261E]" aria-hidden="true">*</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-[#4A4F57] mb-1">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-[#B3261E] font-medium flex items-center gap-1 mt-1">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
};

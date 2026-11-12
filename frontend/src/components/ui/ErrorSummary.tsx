import React, { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface ErrorSummaryProps {
  title?: string;
  errors: string[];
  autoFocus?: boolean;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  title = 'There is a problem',
  errors,
  autoFocus = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && errors.length > 0 && containerRef.current) {
      containerRef.current.focus();
    }
  }, [errors, autoFocus]);

  if (errors.length === 0) return null;

  return (
    <div
      ref={containerRef}
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      className="p-4 mb-5 bg-[#FFF4E5] border-2 border-[#B3261E] rounded outline-none"
    >
      <div className="flex items-center gap-2 text-[#B3261E] font-bold text-sm mb-2">
        <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
        <h2>{title}</h2>
      </div>
      <ul className="list-disc list-inside space-y-1 text-sm text-[#1A1A1A]">
        {errors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>
    </div>
  );
};

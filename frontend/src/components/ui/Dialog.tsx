import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-2xl'
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus dialog on open
      dialogRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="dialog-title"
      aria-describedby={description ? 'dialog-description' : undefined}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`bg-white border border-[#C5CCD6] rounded shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col outline-none`}
      >
        <header className="px-6 py-4 border-b border-[#C5CCD6] bg-[#F4F6FA] flex items-center justify-between">
          <div>
            <h2 id="dialog-title" className="text-lg font-bold text-[#0B2A5B] m-0">
              {title}
            </h2>
            {description && (
              <p id="dialog-description" className="text-xs text-[#4A4F57] m-0 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded text-[#4A4F57] hover:text-[#0B2A5B] hover:bg-[#C5CCD6]/30 transition"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

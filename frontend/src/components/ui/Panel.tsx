import React from 'react';

export interface PanelProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  bodyClassName = 'p-5'
}) => {
  return (
    <section className={`bg-white border border-[#C5CCD6] rounded shadow-sm ${className}`}>
      {(title || action) && (
        <header className="px-5 py-3.5 border-b border-[#C5CCD6] bg-[#F4F6FA] flex flex-wrap items-center justify-between gap-3">
          <div>
            {typeof title === 'string' ? (
              <h2 className="text-base font-bold text-[#0B2A5B] m-0">{title}</h2>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-[#4A4F57] m-0 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
};

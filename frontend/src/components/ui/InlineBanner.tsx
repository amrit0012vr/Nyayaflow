import React from 'react';
import { Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export interface InlineBannerProps {
  variant?: 'info' | 'warning' | 'success' | 'danger';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const InlineBanner: React.FC<InlineBannerProps> = ({
  variant = 'info',
  title,
  children,
  className = ''
}) => {
  const configs = {
    info: {
      border: 'border-[#0B5FA5]',
      bg: 'bg-[#F4F6FA]',
      text: 'text-[#0B2A5B]',
      icon: <Info className="w-5 h-5 text-[#0B5FA5] shrink-0" aria-hidden="true" />
    },
    warning: {
      border: 'border-[#FF9933]',
      bg: 'bg-[#FFF4E5]',
      text: 'text-[#8A4B00]',
      icon: <AlertTriangle className="w-5 h-5 text-[#FF9933] shrink-0" aria-hidden="true" />
    },
    success: {
      border: 'border-[#138808]',
      bg: 'bg-[#138808]/10',
      text: 'text-[#138808]',
      icon: <CheckCircle className="w-5 h-5 text-[#138808] shrink-0" aria-hidden="true" />
    },
    danger: {
      border: 'border-[#B3261E]',
      bg: 'bg-[#B3261E]/10',
      text: 'text-[#B3261E]',
      icon: <AlertCircle className="w-5 h-5 text-[#B3261E] shrink-0" aria-hidden="true" />
    }
  }[variant];

  return (
    <div
      role="status"
      className={`p-4 rounded border-l-4 border ${configs.border} ${configs.bg} ${className} flex items-start gap-3`}
    >
      {configs.icon}
      <div className="flex-1 text-sm text-[#1A1A1A]">
        {title && <div className={`font-bold ${configs.text} mb-0.5`}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
};

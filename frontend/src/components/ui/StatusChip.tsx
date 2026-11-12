import React from 'react';
import { AlertTriangle, Clock, CheckCircle, Info, Sparkles, Shield, XCircle } from 'lucide-react';

export type ChipVariant =
  | 'critical'
  | 'high'
  | 'normal'
  | 'low'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'ai'
  | 'rules';

export interface StatusChipProps {
  variant: ChipVariant;
  label?: string;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  variant,
  label,
  className = ''
}) => {
  const configs = {
    critical: {
      text: label || 'Critical Tier',
      icon: <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />,
      classes: 'bg-[#B3261E]/10 text-[#B3261E] border-[#B3261E]/40'
    },
    high: {
      text: label || 'High Tier',
      icon: <Clock className="w-3.5 h-3.5" aria-hidden="true" />,
      classes: 'bg-[#FF9933]/15 text-[#8A4B00] border-[#FF9933]/50'
    },
    normal: {
      text: label || 'Normal Tier',
      icon: <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />,
      classes: 'bg-[#0B5FA5]/10 text-[#0B5FA5] border-[#0B5FA5]/40'
    },
    low: {
      text: label || 'Low Tier',
      icon: <Info className="w-3.5 h-3.5" aria-hidden="true" />,
      classes: 'bg-[#F4F6FA] text-[#4A4F57] border-[#C5CCD6]'
    },
    pending: {
      text: label || 'Pending Review',
      icon: <Clock className="w-3.5 h-3.5" aria-hidden="true" />,
      classes: 'bg-[#FF9933]/15 text-[#8A4B00] border-[#FF9933]/50'
    },
    approved: {
      text: label || 'Approved',
      icon: <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />,
      classes: 'bg-[#138808]/10 text-[#138808] border-[#138808]/40'
    },
    rejected: {
      text: label || 'Rejected',
      icon: <XCircle className="w-3.5 h-3.5" aria-hidden="true" />,
      classes: 'bg-[#B3261E]/10 text-[#B3261E] border-[#B3261E]/40'
    },
    ai: {
      text: label || 'AI-assisted — verify with source',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#0B5FA5]" aria-hidden="true" />,
      classes: 'bg-[#0B5FA5]/10 text-[#0B2A5B] border-[#0B5FA5]/40'
    },
    rules: {
      text: label || 'Rules-based',
      icon: <Shield className="w-3.5 h-3.5 text-[#138808]" aria-hidden="true" />,
      classes: 'bg-[#138808]/10 text-[#138808] border-[#138808]/40'
    }
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border ${configs.classes} ${className}`}
    >
      {configs.icon}
      <span>{configs.text}</span>
    </span>
  );
};

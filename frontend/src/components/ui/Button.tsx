import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isBusy?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isBusy = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2 min-h-[44px]',
    lg: 'text-base px-5 py-2.5 min-h-[48px]'
  }[size];

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variantClasses = {
    primary: 'bg-[#0B2A5B] hover:bg-[#071C3F] text-white border border-[#0B2A5B]',
    secondary: 'bg-white hover:bg-[#F4F6FA] text-[#0B2A5B] border border-[#0B2A5B]',
    danger: 'bg-[#B3261E] hover:opacity-90 text-white border border-[#B3261E]',
    outline: 'bg-white hover:bg-[#F4F6FA] text-[#1A1A1A] border border-[#C5CCD6]'
  }[variant];

  return (
    <button
      disabled={disabled || isBusy}
      aria-busy={isBusy}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isBusy && (
        <span
          className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};

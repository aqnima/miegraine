import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

export type ActionButtonVariant = 'primary' | 'success' | 'warning' | 'danger' | 'ghost';

export interface TableActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: ActionButtonVariant;
  isLoading?: boolean;
  tooltip: string;
  href?: string;
}

export function TableActionButton({
  icon: Icon,
  variant = 'primary',
  isLoading = false,
  tooltip,
  href,
  className = '',
  disabled,
  ...props
}: TableActionButtonProps) {
  const variantStyles: Record<ActionButtonVariant, string> = {
    primary:
      'border-[#3182F6]/20 bg-[#E8F3FF] text-[#3182F6] hover:bg-[#3182F6] hover:text-white',
    success:
      'border-[#03B26C]/20 bg-[#E6FAF2] text-[#03B26C] hover:bg-[#03B26C] hover:text-white',
    warning:
      'border-[#FE9800]/30 bg-[#FFF5E6] text-[#FE9800] hover:bg-[#FE9800] hover:text-white',
    danger:
      'border-[#F04452]/20 bg-[#FEECED] text-[#F04452] hover:bg-[#F04452] hover:text-white',
    ghost:
      'border-[#E5E8EB] bg-white text-[#6F7780] hover:bg-[#F2F4F6] hover:text-[#191F28]',
  };

  const baseClasses = `p-2 rounded-lg border transition-all shadow-2xs flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
        title={tooltip}
      >
        <Icon className="w-4 h-4" />
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={baseClasses}
      title={tooltip}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
    </button>
  );
}

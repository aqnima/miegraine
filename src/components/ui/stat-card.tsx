import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string; // e.g. "text-[#3182F6]" | "text-[#03B26C]"
  valueColor?: string; // e.g. "text-[#03B26C]" | "text-[#191F28]"
  subtitle?: React.ReactNode;
  trend?: {
    text: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-[#3182F6]',
  valueColor = 'text-[#191F28]',
  subtitle,
  trend,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`group bg-white p-5 rounded-xl border border-[#E5E8EB] shadow-xs flex flex-col justify-between transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-[#3182F6]/30 animate-card-enter select-none ${className}`}
    >
      <div>
        <div className="flex items-center justify-between text-[#6F7780] mb-2.5">
          <span className="text-xs font-semibold group-hover:text-[#191F28] transition-colors duration-200">
            {title}
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#F8F9FA] group-hover:bg-[#E8F3FF] flex items-center justify-center transition-all duration-200 group-hover:scale-110">
            <Icon className={`w-4 h-4 ${iconColor} transition-colors duration-200`} />
          </div>
        </div>
        <p className={`text-2xl font-extrabold ${valueColor} tabular-nums font-mono tracking-tight`}>
          {value}
        </p>
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 text-[11px] text-[#6F7780]">
          {trend && (
            <span
              className={`font-semibold mr-1.5 inline-flex items-center ${
                trend.isPositive ? 'text-[#03B26C]' : 'text-[#F04452]'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {trend.text}
            </span>
          )}
          {subtitle && <span className="font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

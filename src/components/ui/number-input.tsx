'use client';

import React from 'react';
import { formatRibuan, parseRibuan } from '@/lib/utils';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | string | null | undefined;
  onChange: (value: number) => void;
  prefix?: string;
  allowZero?: boolean;
}

export function NumberInput({
  value,
  onChange,
  prefix,
  className = '',
  placeholder = '0',
  allowZero = true,
  disabled,
  ...props
}: NumberInputProps) {
  const displayValue = formatRibuan(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseRibuan(raw);
    onChange(parsed);
  };

  return (
    <div className="relative flex items-center w-full">
      {prefix && (
        <span className="absolute left-3 text-xs font-bold text-[#6F7780] pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full text-xs font-mono font-bold text-[#191F28] tabular-nums focus:outline-none transition-all ${
          prefix ? 'pl-8' : 'px-3'
        } py-2 rounded-xl border border-[#E5E8EB] bg-[#F2F4F6] focus:bg-white focus:ring-2 focus:ring-[#3182F6] disabled:opacity-50 ${className}`}
        {...props}
      />
    </div>
  );
}

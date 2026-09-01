import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge multiple Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah currency with Tabular Numbers support
 * Example: 150000 -> "Rp 150.000"
 */
export function formatRupiah(amount?: number | null): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Format datetime to Indonesian standard readable string
 */
export function formatTanggal(date?: Date | string | number | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format raw number or string into thousand separated dots (e.g. 10000 -> "10.000")
 */
export function formatRibuan(value?: number | string | null): string {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : Math.round(value);
  if (isNaN(num)) return '';
  return num.toLocaleString('id-ID');
}

/**
 * Parse thousand separated string into raw integer number (e.g. "10.000" -> 10000)
 */
export function parseRibuan(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const cleaned = value.replace(/\D/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

/**
 * Sanitize internal redirect URL to prevent Open Redirect attacks
 */
export function sanitizeRedirectPath(url?: string | null, fallback: string = '/dashboard'): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  // Must start with single '/', cannot start with '//' or contain protocol or backslashes
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\') && !trimmed.includes('://')) {
    return trimmed;
  }
  return fallback;
}



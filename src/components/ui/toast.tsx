'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  isExiting?: boolean;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string, duration?: number) => void;
    error: (title: string, message?: string, duration?: number) => void;
    warning: (title: string, message?: string, duration?: number) => void;
    info: (title: string, message?: string, duration?: number) => void;
    custom: (item: Omit<ToastItem, 'id' | 'isExiting'>) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Helper to ensure clean, professional Indonesian sentence ending punctuation
const ensurePunctuation = (str?: string): string => {
  if (!str) return '';
  const trimmed = str.trim();
  if (['.', '!', '?'].includes(trimmed.slice(-1))) return trimmed;
  return `${trimmed}.`;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Smooth remove with out transition
  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 3800) => {
      const id = Math.random().toString(36).substring(2, 9);
      const cleanTitle = title.trim();
      const cleanMessage = message && message.trim() ? ensurePunctuation(message) : undefined;

      const newToast: ToastItem = {
        id,
        type,
        title: cleanTitle,
        message: cleanMessage,
        duration,
        isExiting: false,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (title: string, message?: string, duration?: number) =>
      addToast('success', title, message, duration),
    error: (title: string, message?: string, duration?: number) =>
      addToast('error', title, message, duration),
    warning: (title: string, message?: string, duration?: number) =>
      addToast('warning', title, message, duration),
    info: (title: string, message?: string, duration?: number) =>
      addToast('info', title, message, duration),
    custom: (item: Omit<ToastItem, 'id' | 'isExiting'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [
        ...prev,
        {
          ...item,
          id,
          message: item.message && item.message.trim() ? ensurePunctuation(item.message) : undefined,
          isExiting: false,
        },
      ]);
      if ((item.duration ?? 3800) > 0) {
        setTimeout(() => removeToast(id), item.duration ?? 3800);
      }
    },
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-[#03B26C]/25',
          bg: 'bg-white',
          iconColor: 'text-[#03B26C]',
          iconBg: 'bg-[#E6FAF2]',
          progressBg: 'bg-[#03B26C]',
          Icon: CheckCircle2,
        };
      case 'error':
        return {
          border: 'border-[#F04452]/25',
          bg: 'bg-white',
          iconColor: 'text-[#F04452]',
          iconBg: 'bg-[#FEECED]',
          progressBg: 'bg-[#F04452]',
          Icon: AlertCircle,
        };
      case 'warning':
        return {
          border: 'border-[#FE9800]/30',
          bg: 'bg-white',
          iconColor: 'text-[#FE9800]',
          iconBg: 'bg-[#FFF5E6]',
          progressBg: 'bg-[#FE9800]',
          Icon: AlertTriangle,
        };
      case 'info':
      default:
        return {
          border: 'border-[#3182F6]/25',
          bg: 'bg-white',
          iconColor: 'text-[#3182F6]',
          iconBg: 'bg-[#E8F3FF]',
          progressBg: 'bg-[#3182F6]',
          Icon: Info,
        };
    }
  };

  const toastContainer = isClient ? (
    <div className="fixed bottom-5 right-5 z-[99999] flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => {
        const style = getToastStyles(t.type);
        const IconComponent = style.Icon;
        const duration = t.duration || 3800;
        const hasMessage = Boolean(t.message);

        return (
          <div
            key={t.id}
            className={`pointer-events-auto relative overflow-hidden rounded-xl border ${
              style.border
            } ${style.bg} shadow-lg transition-all ${
              hasMessage
                ? 'p-3.5 pl-3.5 pr-3 flex items-start space-x-3'
                : 'py-2.5 px-3.5 flex items-center space-x-3'
            } ${t.isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}
            role="alert"
          >
            {/* Left Icon Badge */}
            <div
              className={`w-7 h-7 rounded-lg ${style.iconBg} ${
                style.iconColor
              } flex items-center justify-center flex-shrink-0 ${
                hasMessage ? 'mt-0.5' : 'mt-0'
              }`}
            >
              <IconComponent className="w-4 h-4 stroke-[2.2]" />
            </div>

            {/* Middle Content: 1 Baris jika tanpa pesan, 2 Baris jika ada deskripsi */}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="font-extrabold text-xs text-[#191F28] leading-tight tracking-tight">
                {t.title}
              </h4>
              {hasMessage && (
                <p className="text-[11px] text-[#4E5968] mt-1 leading-normal font-medium">
                  {t.message}
                </p>
              )}
            </div>

            {/* Right Close 'X' Button */}
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className={`w-6 h-6 rounded-md text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F2F4F6] flex items-center justify-center transition-colors flex-shrink-0 ${
                hasMessage ? '-mt-0.5 -mr-0.5' : '-mr-0.5'
              }`}
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* 100% Seamless Full-Width Solid Timeout Progress Bar (3.5px clearly visible) */}
            <div className="absolute -bottom-[1px] -left-[1px] -right-[1px] h-[3.5px] bg-[#E5E8EB] overflow-hidden rounded-b-xl pointer-events-none">
              <div
                className={`h-full ${style.progressBg}`}
                style={{
                  animation: `toastProgress ${duration}ms linear forwards`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  ) : null;

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {isClient && toastContainer && createPortal(toastContainer, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

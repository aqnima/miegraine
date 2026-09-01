'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LucideIcon, X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full' | string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  iconColor = 'text-[#3182F6]',
  iconBg = 'bg-[#E8F3FF]',
  maxWidth,
  size,
  children,
  footer,
  noPadding = false,
  className = '',
}: ModalProps) {
  const activeMaxWidth = (size || maxWidth || 'lg') as any;
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const isMouseDownOnBackdrop = React.useRef(false);

  // Smooth Mount & Unmount with Apple/Toss spring transition
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen) {
      setIsMounted(true);
      // Double rAF ensures DOM paint before transition class triggers
      const rAF = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimatingIn(true);
        });
      });
      return () => cancelAnimationFrame(rAF);
    } else if (isMounted) {
      setIsAnimatingIn(false);
      timer = setTimeout(() => {
        setIsMounted(false);
      }, 220); // Sync with exit transition duration
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, isMounted]);

  // Close on ESC key
  useEffect(() => {
    if (!isMounted || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMounted, isOpen, onClose]);

  // Lock body scroll when open without layout shift
  useEffect(() => {
    if (!isMounted) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMounted]);

  if (!isMounted) return null;

  const maxWidthMap: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-6xl',
  };

  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden select-none transition-all duration-200 ease-out ${
        isAnimatingIn
          ? 'bg-black/45 backdrop-blur-[6px] opacity-100'
          : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onMouseDown={(e) => {
        isMouseDownOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && isMouseDownOnBackdrop.current) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full ${maxWidthMap[activeMaxWidth] || 'max-w-lg'} bg-white rounded-t-2xl sm:rounded-2xl border border-[#E5E8EB] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] my-0 sm:my-auto relative z-10 select-text transform-gpu transition-all duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          isAnimatingIn
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-[0.96] translate-y-3 sm:translate-y-2 pointer-events-none'
        } ${className}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Pinned Sticky Top) */}
        <div className="p-4 sm:p-5 border-b border-[#E5E8EB] flex items-center justify-between flex-shrink-0 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            {Icon && (
              <div
                className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center font-bold flex-shrink-0 shadow-2xs`}
              >
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-extrabold text-base sm:text-lg text-[#191F28] leading-tight truncate">
                {title}
              </h2>
              {description && (
                <p className="text-[11px] text-[#6F7780] mt-0.5 truncate">{description}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#F2F4F6] text-[#6F7780] hover:bg-[#E5E8EB] hover:text-[#191F28] active:scale-95 flex items-center justify-center transition-all flex-shrink-0 ml-2"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className={`overflow-y-auto flex-1 ${noPadding ? '' : 'p-4 sm:p-5'}`}>{children}</div>

        {/* Modal Footer (Pinned Sticky Bottom) */}
        {footer && (
          <div className="p-4 sm:p-5 border-t border-[#E5E8EB] bg-white flex-shrink-0 sticky bottom-0 z-10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

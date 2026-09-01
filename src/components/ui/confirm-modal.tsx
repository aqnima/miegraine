'use client';

import React from 'react';
import { Modal } from './modal';
import { LucideIcon, AlertTriangle, HelpCircle, AlertOctagon, CheckCircle2, Loader2, X, Check, Trash2 } from 'lucide-react';

export type ConfirmVariant = 'primary' | 'danger' | 'warning' | 'success';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: LucideIcon;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'primary',
  icon: CustomIcon,
  isLoading = false,
}: ConfirmModalProps) {
  const variantConfig: Record<
    ConfirmVariant,
    {
      icon: LucideIcon;
      iconColor: string;
      iconBg: string;
      btnClass: string;
    }
  > = {
    primary: {
      icon: HelpCircle,
      iconColor: 'text-[#3182F6]',
      iconBg: 'bg-[#E8F3FF]',
      btnClass: 'bg-[#3182F6] hover:bg-[#2272EB] text-white',
    },
    danger: {
      icon: AlertOctagon,
      iconColor: 'text-[#F04452]',
      iconBg: 'bg-[#FEECED]',
      btnClass: 'bg-[#F04452] hover:bg-[#D93845] text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-[#FE9800]',
      iconBg: 'bg-[#FFF5E6]',
      btnClass: 'bg-[#FE9800] hover:bg-[#E08600] text-white',
    },
    success: {
      icon: CheckCircle2,
      iconColor: 'text-[#03B26C]',
      iconBg: 'bg-[#E6FAF2]',
      btnClass: 'bg-[#03B26C] hover:bg-[#02985B] text-white',
    },
  };

  const config = variantConfig[variant];
  const IconComponent = CustomIcon || config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={title}
      icon={IconComponent}
      iconColor={config.iconColor}
      iconBg={config.iconBg}
      maxWidth="md"
    >
      <div className="space-y-5">
        <div className="text-xs text-[#4E5968] leading-relaxed">
          {typeof description === 'string' ? <p>{description}</p> : description}
        </div>

        <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-[#E5E8EB]">
          {cancelText && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-[#E5E8EB] bg-white hover:bg-[#F2F4F6] text-[#4E5968] font-bold text-xs transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>{cancelText}</span>
            </button>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-xs disabled:opacity-50 active:scale-98 ${config.btnClass}`}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : variant === 'danger' ? (
              <Trash2 className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string | React.ReactNode;
  buttonText?: string;
  variant?: ConfirmVariant;
  icon?: LucideIcon;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  description,
  buttonText = 'Mengerti',
  variant = 'danger',
  icon,
}: AlertModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onClose}
      title={title}
      description={description}
      confirmText={buttonText}
      cancelText=""
      variant={variant}
      icon={icon}
    />
  );
}

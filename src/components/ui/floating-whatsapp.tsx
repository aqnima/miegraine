'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingWhatsappProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function FloatingWhatsapp({
  phoneNumber = '6281234567890',
  defaultMessage = 'Halo Admin Miegraine, saya tertarik mencoba sistem kasir Miegraine. Bisa bantu konsultasi untuk jenis toko saya?',
}: FloatingWhatsappProps) {
  const [showTooltip, setShowTooltip] = useState(true);

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 group">
      {/* Interactive Tooltip Bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center space-x-2 bg-white text-[#191F28] px-3.5 py-2 rounded-xl shadow-lg border border-[#E5E8EB] text-xs font-semibold animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-[#03B26C] animate-pulse flex-shrink-0" />
          <span>Tanya & Konsultasi Demo</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowTooltip(false);
            }}
            className="text-[#6F7780] hover:text-[#191F28] ml-1 p-0.5 rounded-md hover:bg-[#F2F4F6] transition-colors"
            title="Tutup pesan"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Floating WhatsApp Button (Bulat Penuh) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp CS Miegraine"
        className="relative flex items-center justify-center w-14 h-14 bg-[#03B26C] hover:bg-[#029B5D] text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 group-hover:scale-105"
      >
        {/* Glow / Ping Indicator */}
        <span className="absolute 0.5 top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#03B26C] opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#03B26C] border-2 border-white" />
        </span>

        <MessageCircle className="w-7 h-7 stroke-[2.2] transition-transform duration-200 group-hover:rotate-6" />
      </a>
    </div>
  );
}

'use client';

import { MessageCircle } from 'lucide-react';

export function FloatingWhatsApp() {
  // 👇 FIXED: Updated with your exact admin WhatsApp number
  const adminWhatsAppNumber = "263784567174"; 
  const defaultMessage = "Hi HukuMarket! I am looking to buy 50+ chickens. Can you help me find a local farmer?";
  
  const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 sm:gap-3 group animate-in fade-in slide-in-from-bottom-4"
    >
      {/* 👇 FIXED: Removed the "hidden" class so this now shows on mobile too! */}
      <div className="flex bg-white px-3 py-2 sm:px-4 sm:py-2 rounded-2xl shadow-lg border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 transition-all transform origin-right group-hover:scale-105">
        Need 50+ Birds? <span className="text-huku-orange ml-1">We'll find them!</span>
      </div>

      {/* The main green WhatsApp Button */}
      <div className="relative flex items-center justify-center shrink-0">
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25"></div>
        <div className="relative bg-[#25D366] hover:bg-[#20bd5a] text-white p-3 sm:p-4 rounded-full shadow-xl transition-transform hover:scale-110 flex items-center justify-center">
          <MessageCircle size={28} className="sm:w-8 sm:h-8" strokeWidth={2.5} />
        </div>
      </div>
    </a>
  );
}
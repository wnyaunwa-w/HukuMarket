'use client';

import { MessageCircle } from 'lucide-react';

export function FloatingWhatsApp() {
  // Replace this with your actual admin WhatsApp number (include the 263 country code, no + or spaces)
  const adminWhatsAppNumber = "263700000000"; 
  const defaultMessage = "Hi HukuMarket! I am looking to buy 50+ chickens. Can you help me find a local farmer?";
  
  const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group animate-in fade-in slide-in-from-bottom-4"
    >
      {/* Pop-out text bubble (hidden on very small screens, expands on hover) */}
      <div className="hidden sm:flex bg-white px-4 py-2 rounded-2xl shadow-lg border border-slate-200 text-sm font-bold text-slate-700 transition-all transform origin-right group-hover:scale-105">
        Need 50+ Birds? <span className="text-huku-orange ml-1">We'll find them!</span>
      </div>

      {/* The main green WhatsApp Button with a pulsing effect */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25"></div>
        <div className="relative bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 flex items-center justify-center">
          <MessageCircle size={32} strokeWidth={2.5} />
        </div>
      </div>
    </a>
  );
}
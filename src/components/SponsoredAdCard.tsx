import React from "react";

export interface SponsoredAdCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  ctaText?: string;
  logoUrl?: string; // 👈 NEW: Tells TypeScript to expect a logo
}

export function SponsoredAdCard({ title, description, image, link, ctaText = "Shop Now", logoUrl }: SponsoredAdCardProps) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition group flex flex-col h-full relative">
      
      {/* 🖼️ Main Banner Image */}
      <div className="relative h-48 w-full bg-slate-100">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        
        {/* Sponsored Tag */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded text-slate-500 shadow-sm">
          Sponsored
        </div>

        {/* 🏢 NEW: Company Logo Overlay */}
        {logoUrl && (
          <div className="absolute -bottom-6 left-6 w-14 h-14 bg-white rounded-xl p-1 shadow-md border border-slate-100 z-10">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
        )}
      </div>
      
      {/* 📝 Text Content */}
      <div className={`p-6 flex flex-col flex-grow ${logoUrl ? 'pt-8' : ''}`}>
        <h3 className="font-black text-lg text-slate-900 mb-2 line-clamp-1">{title}</h3>
        <p className="text-slate-500 text-sm mb-6 flex-grow line-clamp-2">{description}</p>
        
        <a 
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 py-3 rounded-xl font-bold flex items-center justify-center transition"
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}
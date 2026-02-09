import { ExternalLink, ShoppingBag } from "lucide-react";

interface SponsoredAdCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  ctaText?: string;
}

export function SponsoredAdCard({ title, description, image, link, ctaText = "Shop Now" }: SponsoredAdCardProps) {
  return (
    <div className="relative bg-white border-2 border-blue-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition group">
      
      {/* "Sponsored" Badge */}
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 z-10">
        Sponsored
      </div>

      {/* Image Section */}
      <div className="h-48 overflow-hidden relative bg-slate-100">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <div className="bg-blue-600 w-fit p-1.5 rounded-lg mb-2">
            <ShoppingBag size={16} />
          </div>
          <h3 className="font-black text-xl leading-tight">{title}</h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
          {description}
        </p>

        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-center hover:bg-blue-100 transition flex items-center justify-center gap-2"
        >
          {ctaText} <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
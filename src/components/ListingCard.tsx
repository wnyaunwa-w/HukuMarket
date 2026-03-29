"use client";

import { Batch } from "@/lib/db-service";
import { MapPin, ArrowRight, Heart, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  toggleFavorite, 
  getFavoriteIds, 
  getUserProfile, 
  getFarmerReviews,
  trackBuyerInquiry // 👈 Added the tracking function here!
} from "@/lib/db-service";
import { FarmerBadge } from "@/components/FarmerBadge"; 

interface ListingCardProps {
  batch: Batch;
  onContact: (batch: Batch) => void;
}

export function ListingCard({ batch, onContact }: ListingCardProps) {
  const isDressed = batch.listingType === 'dressed';
  const isSoldOut = batch.count <= 0;
  
  const { currentUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [farmerName, setFarmerName] = useState("Farmer");
  const [farmerPhoto, setFarmerPhoto] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    async function loadCardData() {
      if (currentUser && batch.id) {
        const favs = await getFavoriteIds(currentUser.uid);
        setIsFavorite(favs.includes(batch.id));
      }

      if (batch.userId) {
        const profile = await getUserProfile(batch.userId);
        if (profile) {
          setFarmerName(profile.displayName || "Farmer");
          setFarmerPhoto(profile.photoURL);
          setIsVerified(profile.isVerified || false); 
        }

        const reviews = await getFarmerReviews(batch.userId);
        if (reviews.length > 0) {
          const avg = reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length;
          setRating(avg);
        }
      }
    }
    loadCardData();
  }, [currentUser, batch.id, batch.userId]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!currentUser) return alert("Please sign in to save favorites!");
    if (!batch.id) return;

    const newState = !isFavorite;
    setIsFavorite(newState);
    
    try {
      await toggleFavorite(currentUser.uid, batch.id);
    } catch (error) {
      setIsFavorite(!newState); 
    }
  };

  let cardBgClass = "bg-huku-light border-huku-tan hover:shadow-xl hover:scale-[1.01]"; 
  
  if (isSoldOut) {
    cardBgClass = "bg-slate-50 border-slate-200 hover:scale-100 cursor-not-allowed opacity-80";
  } else if (isVerified) {
    if (isDressed) {
      cardBgClass = "bg-[#ccd5ae] border-[#a3b18a] hover:shadow-xl hover:scale-[1.01] shadow-xl shadow-[#ccd5ae]/40";
    } else {
      cardBgClass = "bg-[#e9c46a] border-[#cca74a] hover:shadow-xl hover:scale-[1.01] shadow-xl shadow-[#e9c46a]/30";
    }
  } else if (isDressed) {
    cardBgClass = "bg-[#e9edc9] border-[#c8ccaa] hover:shadow-xl hover:scale-[1.01]";
  }

  return (
    <div 
      id={batch.id} 
      className={`relative border-2 rounded-3xl p-5 transition-all duration-300 group overflow-hidden ${cardBgClass}`}
    >
      
      {isSoldOut && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-6">
          <div className="border-4 border-red-700 text-red-700 font-black text-3xl uppercase p-3 -rotate-12 rounded-xl tracking-widest bg-white/20 backdrop-blur-[2px] shadow-sm">
            Sold Out
          </div>
        </div>
      )}

      <button 
        onClick={handleToggleFavorite}
        disabled={isSoldOut}
        className="absolute top-5 right-5 z-20 p-2 rounded-full transition shadow-sm border bg-white border-slate-200 hover:bg-orange-50"
      >
        <Heart 
          size={20} 
          className={`transition-colors duration-300 ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-400"}`}
        />
      </button>

      <div className="flex items-center gap-3 mb-6 pr-10">
        <div className="h-12 w-12 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden relative shrink-0">
          {farmerPhoto ? (
            <img src={farmerPhoto} alt={farmerName} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-huku-orange text-white font-bold text-lg">
              {farmerName.charAt(0)}
            </div>
          )}
        </div>
        
        <div>
          <h4 className="font-bold text-slate-900 text-[15px] leading-tight flex items-center gap-1">
            {farmerName} 
            <FarmerBadge userId={batch.userId} />
          </h4>
          
          <div className="flex items-center gap-1 text-sm mt-0.5">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-slate-700">{rating ? rating.toFixed(1) : "New"}</span>
            {rating && <span className="text-slate-400 text-xs">Rating</span>}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <span className={`text-sm font-bold mb-1 block ${isDressed && !isVerified ? 'text-slate-600' : 'text-slate-600'}`}>
            {isDressed ? "❄️ DRESSED CHICKENS" : batch.breed}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-3xl leading-none">{isDressed ? "🍗" : "🐔"}</span>
            <span className="text-4xl font-black text-slate-900 tracking-tight">{batch.count}</span>
          </div>
          <span className="text-sm font-bold text-slate-500 ml-11">
            {isDressed ? "birds ready" : "birds available"}
          </span>
        </div>
        
        <div className="text-right bg-white/90 backdrop-blur-sm border border-slate-200/50 px-3 py-2 rounded-xl shadow-sm">
          <span className="block text-xl font-black text-huku-orange">${batch.pricePerBird.toFixed(2)}</span>
          <span className="text-[11px] text-orange-600/70 font-bold uppercase tracking-wider">per bird</span>
        </div>
      </div>

      {/* 🟢 HARDCODED PROGRESS BAR */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
            isVerified && isDressed ? 'bg-white/60 text-slate-800' 
            : isDressed ? 'bg-[#ccd5ae] text-slate-800' 
            : 'bg-green-100 text-green-700' 
          }`}>
            {isDressed ? "❄️ DRESSED & READY" : "MARKET READY"}
          </span>
          <span>Ready Now</span>
        </div>
        <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden border border-black/5">
          <div 
            className="h-full rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
            style={{ width: `100%` }} 
          />
        </div>
      </div>

      <div className="flex items-start gap-2 text-sm mb-6 p-3 rounded-xl border shadow-sm bg-white/60 border-slate-200/50 text-slate-700">
        <MapPin size={18} className="shrink-0 mt-0.5 text-slate-400" />
        <span className="font-medium leading-snug line-clamp-2">{batch.location}</span>
      </div>

      {/* 👈 ACTION BUTTON WITH INQUIRY TRACKING INJECTED */}
      <button 
        onClick={() => {
          if (batch.id && !isSoldOut) {
            trackBuyerInquiry(batch.id); // Triggers the analytics counter!
          }
          onContact(batch);
        }}
        disabled={isSoldOut}
        className={`w-full py-3.5 rounded-xl font-bold border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
            isSoldOut 
            ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" 
            : "bg-white border-transparent text-slate-800 hover:border-green-500 hover:text-green-700 hover:shadow-lg shadow-md"
        }`}
      >
        {isSoldOut ? "Batch Sold Out" : "View Contact Details"} 
        {!isSoldOut && <ArrowRight size={18} className="text-slate-400 group-hover:text-green-600 transition-colors"/>}
      </button>
    </div>
  );
}
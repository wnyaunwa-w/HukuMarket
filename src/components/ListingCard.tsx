"use client";

import { Batch } from "@/lib/db-service";
import { MapPin, ArrowRight, Heart, Star } from "lucide-react";
import { getGrowthStage } from "@/lib/chickenLogic";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  toggleFavorite, 
  getFavoriteIds, 
  getUserProfile, 
  getFarmerReviews 
} from "@/lib/db-service";
import { FarmerBadge } from "@/components/FarmerBadge"; // 👈 1. Import Badge

interface ListingCardProps {
  batch: Batch;
  onContact: (batch: Batch) => void;
}

export function ListingCard({ batch, onContact }: ListingCardProps) {
  const { stage, progress, daysLeft } = getGrowthStage(batch.hatchDate);
  const isSoldOut = batch.count === 0;
  
  const { currentUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [farmerName, setFarmerName] = useState("Farmer");
  const [farmerPhoto, setFarmerPhoto] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);

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

  return (
    <div 
      id={batch.id} 
      className={`relative bg-huku-light border-2 border-huku-tan rounded-3xl p-5 transition-all group overflow-hidden ${isSoldOut ? "hover:scale-100 cursor-not-allowed" : "hover:shadow-xl hover:scale-[1.01]"}`}
    >
      
      {/* 🚫 SOLD OUT OVERLAY */}
      {isSoldOut && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-6">
          <div className="border-4 border-red-700 text-red-700 font-black text-3xl uppercase p-3 -rotate-12 rounded-xl tracking-widest bg-white/20 backdrop-blur-[2px] shadow-sm">
            Sold Out
          </div>
        </div>
      )}

      {/* ❤️ HEART ICON */}
      <button 
        onClick={handleToggleFavorite}
        disabled={isSoldOut}
        className="absolute top-5 right-5 z-20 p-2 rounded-full bg-white hover:bg-orange-50 transition shadow-sm border border-huku-tan/50"
      >
        <Heart 
          size={20} 
          className={`transition-colors duration-300 ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-400"}`}
        />
      </button>

      {/* 👤 FARMER PROFILE HEADER */}
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
          {/* 👇 2. UPDATED: Flex container to hold Name + Badge */}
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

      {/* MAIN INFO GRID */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="text-sm font-bold text-slate-500 mb-1 block">{batch.breed}</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl leading-none">🐔</span>
            <span className="text-4xl font-black text-slate-900 tracking-tight">{batch.count}</span>
          </div>
          <span className="text-sm font-bold text-slate-500 ml-11">birds available</span>
        </div>
        
        <div className="text-right bg-white/80 border border-huku-tan/50 px-3 py-2 rounded-xl">
          <span className="block text-xl font-black text-huku-orange">${batch.pricePerBird.toFixed(2)}</span>
          <span className="text-[11px] text-orange-600/70 font-bold uppercase tracking-wider">per bird</span>
        </div>
      </div>

      {/* 🟢 PROGRESS BAR */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${stage === 'Market Ready' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
            {stage}
          </span>
          <span>{daysLeft <= 0 ? "Ready Now" : `${daysLeft} days left`}</span>
        </div>
        <div className="h-3 w-full bg-slate-200/50 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
            style={{ width: `${Math.min(progress, 100)}%` }} 
          />
        </div>
      </div>

      {/* 📍 LOCATION */}
      <div className="flex items-start gap-2 text-sm text-slate-600 mb-6 bg-white/60 p-3 rounded-xl border border-huku-tan/50">
        <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
        <span className="font-medium leading-snug line-clamp-2">{batch.location}</span>
      </div>

      {/* ACTION BUTTON */}
      <button 
        onClick={() => onContact(batch)}
        disabled={isSoldOut}
        className={`w-full py-3.5 rounded-xl font-bold border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
            isSoldOut 
            ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" 
            : "bg-white border-huku-tan/50 text-slate-700 hover:border-green-500 hover:text-green-700 hover:bg-green-50/50 hover:shadow-md"
        }`}
      >
        {isSoldOut ? "Batch Sold Out" : "View Contact Details"} 
        {!isSoldOut && <ArrowRight size={18} className="text-slate-400 group-hover:text-green-600 transition-colors"/>}
      </button>
    </div>
  );
}
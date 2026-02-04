"use client";

import { Batch } from "@/lib/db-service";
import { Users, Calendar, MapPin, ArrowRight, Heart } from "lucide-react";
import { getGrowthStage } from "@/lib/chickenLogic"; // This will work now
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toggleFavorite, getFavoriteIds } from "@/lib/db-service";

interface ListingCardProps {
  batch: Batch;
  onContact: (batch: Batch) => void;
}

export function ListingCard({ batch, onContact }: ListingCardProps) {
  // 1. Safe access to hatchDate
  const { stage, progress, daysLeft } = getGrowthStage(batch.hatchDate);
  
  const { currentUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if this batch is already favorited by the user
  useEffect(() => {
    async function checkStatus() {
      // 2. Added check: Ensure we have both a user AND a batch ID
      if (currentUser && batch.id) {
        const favs = await getFavoriteIds(currentUser.uid);
        setIsFavorite(favs.includes(batch.id));
      }
    }
    checkStatus();
  }, [currentUser, batch.id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!currentUser) return alert("Please sign in to save favorites!");
    
    // 3. Safety check: Cannot favorite a batch without an ID
    if (!batch.id) return;

    const newState = !isFavorite;
    setIsFavorite(newState);
    
    try {
      await toggleFavorite(currentUser.uid, batch.id);
    } catch (error) {
      setIsFavorite(!newState); // Revert on error
    }
  };

  return (
    <div className="bg-huku-light border-2 border-huku-tan rounded-3xl p-6 relative hover:shadow-xl transition-all hover:scale-[1.02] group">
      
      {/* Heart Icon */}
      <button 
        onClick={handleToggleFavorite}
        className="absolute top-5 right-5 z-20 p-2 rounded-full bg-white/80 hover:bg-white transition shadow-sm"
      >
        <Heart 
          size={22} 
          className={`transition-colors duration-300 ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-400"}`}
        />
      </button>

      {/* Growth Badge */}
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
        stage === "Market Ready" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
      }`}>
        {stage.toUpperCase()}
      </div>

      <div className="flex justify-between items-start mb-2 pr-10">
        <div>
          <h3 className="text-xl font-black text-slate-800">{batch.breed}</h3>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-1 mt-1">
            {/* 4. FIXED: Changed 'quantity' to 'count' to match database */}
            <Users size={14} /> {batch.count} birds available
          </p>
        </div>
        <div className="text-right">
          <span className="block text-2xl font-black text-huku-orange">${batch.pricePerBird}</span>
          <span className="text-xs text-slate-400 font-bold">per bird</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 mb-4">
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
          <span>Growth Progress</span>
          <span>{Math.min(Math.round(progress), 100)}%</span>
        </div>
        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              stage === "Market Ready" ? "bg-green-500" : "bg-huku-orange"
            }`} 
            style={{ width: `${Math.min(progress, 100)}%` }} 
          />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 mb-6">
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100">
          <MapPin size={16} className="text-huku-orange" />
          <span className="truncate">{batch.location}</span>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100">
          <Calendar size={16} className="text-huku-orange" />
          <span className="truncate">
            {daysLeft <= 0 ? "Ready Now!" : `Ready in ${daysLeft} days`}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => onContact(batch)}
        className="w-full py-3 rounded-xl font-bold bg-white border-2 border-slate-100 text-slate-700 hover:border-huku-orange hover:text-huku-orange hover:bg-orange-50 transition flex items-center justify-center gap-2"
      >
        View Details <ArrowRight size={18} />
      </button>
    </div>
  );
}
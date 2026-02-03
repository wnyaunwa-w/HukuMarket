"use client";
import { useEffect, useState } from "react";
import { Batch, getUserProfile } from "@/lib/db-service";
import { calculateBatchMetrics, BREEDS } from "@/lib/chickenLogic";
import { MapPin, Calendar, Star, User, ArrowRight } from "lucide-react";

interface ListingCardProps {
  batch: Batch;
  onContact: (batch: Batch) => void;
}

export function ListingCard({ batch, onContact }: ListingCardProps) {
  const [farmer, setFarmer] = useState<any>(null);
  const metrics = calculateBatchMetrics(batch.hatchDate, batch.breed);

  // Fetch the farmer's details (Name/Avatar) for this specific batch
  useEffect(() => {
    async function loadFarmer() {
      const profile = await getUserProfile(batch.userId);
      setFarmer(profile);
    }
    loadFarmer();
  }, [batch.userId]);

  return (
    // UPDATED: bg-huku-light, border-huku-tan
    <div className="bg-huku-light rounded-2xl shadow-sm hover:shadow-xl transition border border-huku-tan group flex flex-col h-full overflow-hidden">
      
      {/* 1. Header: Price & Status */}
      <div className="p-6 pb-2 flex justify-between items-start">
        <div>
          {/* UPDATED: Status badge border */}
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-white/50 ${metrics.statusColor}`}>
            {metrics.status}
          </span>
          <h3 className="font-bold text-xl text-slate-900 mt-2">
            {BREEDS[batch.breed as keyof typeof BREEDS]?.name || batch.breed}
          </h3>
        </div>
        <div className="text-right">
          {/* UPDATED: Price color to huku-orange */}
          <p className="text-2xl font-black text-huku-orange">${batch.pricePerBird}</p>
          <p className="text-xs text-slate-500">per bird</p>
        </div>
      </div>

      {/* 2. Farmer Profile Strip */}
      {/* UPDATED: Border color to huku-tan/30 */}
      <div className="px-6 py-3 flex items-center gap-3 border-b border-huku-tan/30">
        {/* UPDATED: Avatar border */}
        <div className="w-10 h-10 rounded-full bg-white border border-huku-tan overflow-hidden shrink-0">
          {farmer?.photoURL ? (
            <img src={farmer.photoURL} alt="Farmer" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={20} /></div>
          )}
        </div>
        <div className="flex-grow">
          <p className="text-sm font-bold text-slate-800 leading-tight">
            {farmer?.displayName || "Local Farmer"}
          </p>
          {/* UPDATED: Stars color to huku-yellow */}
          <div className="flex items-center gap-1 text-xs text-huku-yellow">
            <Star size={10} fill="currentColor" />
            <span className="font-bold text-slate-700">5.0</span>
            <span className="text-slate-400 font-normal">(New Seller)</span>
          </div>
        </div>
      </div>

      {/* 3. Details: Location, Qty, Date */}
      <div className="px-6 py-4 flex flex-col gap-2 text-sm text-slate-700 flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* UPDATED: Icon color to huku-orange */}
            <MapPin size={16} className="text-huku-orange" />
            <span className="font-medium">{batch.location}</span>
          </div>
          {/* UPDATED: Quantity Badge style */}
          <span className="bg-white/80 border border-huku-tan/30 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">
            {batch.count} birds left
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-500" />
          <span>Ready: <b>{metrics.marketReadyDate}</b></span>
        </div>
      </div>

      {/* 4. Progress Bar */}
      <div className="px-6 pb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Growth Progress</span>
          <span>{Math.round(metrics.progress)}%</span>
        </div>
        {/* UPDATED: Bar background white with tan border */}
        <div className="w-full bg-white rounded-full h-2 border border-huku-tan/20">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics.progress}%` }}></div>
        </div>
      </div>

      {/* 5. Footer Button */}
      {/* UPDATED: Footer bg and border */}
      <div className="p-4 bg-huku-tan/10 mt-auto border-t border-huku-tan/30">
        <button 
          onClick={() => onContact(batch)}
          className="w-full py-3 rounded-xl font-bold bg-white border border-huku-tan text-slate-800 shadow-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition flex items-center justify-center gap-2"
        >
          View Contact Details <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
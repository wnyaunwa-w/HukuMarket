"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToBatches, Batch, deleteBatch, getActiveAds, Ad } from "@/lib/db-service";
import { getGrowthStage } from "@/lib/chickenLogic";
import { Loader2, PlusCircle, TrendingUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { RecordSaleModal } from "@/components/RecordSaleModal";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  
  // 📢 AD STATE
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToBatches(currentUser.uid, (data) => {
        setBatches(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  // 📢 FETCH & ROTATE ADS (DEBUG VERSION)
  useEffect(() => {
    async function loadAds() {
      try {
        console.log("🔍 Attempting to fetch ads...");
        const ads = await getActiveAds("dashboard_banner");
        
        console.log(`✅ Found ${ads.length} active ads in database.`);
        
        if (ads.length > 0) {
          // Log the titles to see which ones are available to prove they exist
          ads.forEach((ad, index) => console.log(`[${index}] ${ad.title}`));

          // Pick a random one
          const randomIndex = Math.floor(Math.random() * ads.length);
          console.log(`🎲 Selected Index: ${randomIndex} (${ads[randomIndex].title})`);
          
          setCurrentAd(ads[randomIndex]);
        } else {
          console.warn("⚠️ No ads found! Check your database fields.");
        }
      } catch (error) {
        console.error("❌ Failed to load ads:", error);
      }
    }
    loadAds();
  }, []);

  // 🗑️ HANDLE DELETE LOGIC
  const handleDelete = async (batchId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this listing? This action cannot be undone.");
    if (confirmDelete) {
      await deleteBatch(batchId);
    }
  };

  // Calculate Totals
  const totalBirds = batches.reduce((acc, b) => acc + b.count, 0);
  const activeBatches = batches.length;

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome, {currentUser?.displayName}</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-orange-50 p-6 rounded-3xl border border-huku-orange/20">
          <p className="text-xs font-bold text-huku-orange uppercase tracking-wider mb-1">Total Birds</p>
          <h3 className="text-4xl font-black text-slate-900">{totalBirds.toLocaleString()}</h3>
        </div>
        <div className="bg-orange-50 p-6 rounded-3xl border border-huku-orange/20">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Batches</p>
          <h3 className="text-4xl font-black text-huku-orange">{activeBatches}</h3>
        </div>
      </div>

      {/* 📢 DYNAMIC SPONSORED BANNER */}
      {/* Only render if we successfully fetched an ad */}
      {currentAd && (
        <div className="mb-8 rounded-3xl overflow-hidden relative group shadow-sm hover:shadow-md transition">
          {/* Background & Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 opacity-90 z-10" />
          <img 
            src={currentAd.imageUrl} 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" 
            alt={currentAd.title} 
          />
          
          <div className="relative z-20 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest mb-2 inline-block shadow-sm">
                Partner Offer
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                {currentAd.title}
              </h3>
              <p className="text-blue-100 font-medium max-w-lg text-sm md:text-base leading-relaxed">
                {currentAd.description}
              </p>
            </div>
            <a 
              href={currentAd.link} 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg whitespace-nowrap text-sm"
            >
              {currentAd.ctaText}
            </a>
          </div>
        </div>
      )}

      {/* BATCH LIST */}
      <div className="space-y-6">
        {batches.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <h3 className="text-xl font-bold text-slate-700">No chickens yet? 🐔</h3>
            <p className="text-slate-500 mb-6">Start tracking your first batch now.</p>
            <Link href="/dashboard/listings/new" className="bg-huku-orange text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-orange-600 transition">
              <PlusCircle size={20} /> Create Listing
            </Link>
          </div>
        ) : (
          batches.map((batch) => {
            const { stage, progress, daysLeft, marketReadyDate } = getGrowthStage(batch.hatchDate);
            
            return (
              <div key={batch.id} className="bg-huku-light border-2 border-huku-tan rounded-3xl p-6 relative group transition hover:shadow-lg">
                
                {/* 🗑️ DELETE BUTTON (Top Right) */}
                <button 
                  onClick={() => batch.id && handleDelete(batch.id)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Delete Listing"
                >
                  <Trash2 size={20} />
                </button>

                {/* HEADER INFO */}
                <div className="flex justify-between items-start mb-6 pr-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-black text-slate-900">{batch.breed}</h3>
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {stage}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>📍 {batch.location}</span>
                      <span>👤 {batch.count} Birds</span>
                    </div>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="mb-6">
                   <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                     <span>Day {Math.floor(progress * 0.42)}</span>
                     <span className={daysLeft <= 3 ? "text-orange-600" : "text-green-600"}>
                       {daysLeft <= 0 ? "Ready for Market!" : `Ready: ${marketReadyDate}`}
                     </span>
                   </div>
                   <div className="h-4 w-full bg-white rounded-full overflow-hidden border border-huku-tan/50">
                     <div 
                       className="h-full bg-huku-orange rounded-full transition-all duration-1000"
                       style={{ width: `${Math.min(progress, 100)}%` }} 
                     />
                   </div>
                </div>

                {/* ACTION BUTTON */}
                <button 
                  onClick={() => setSelectedBatch(batch)}
                  className="w-full bg-white border-2 border-huku-tan text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-huku-orange hover:text-huku-orange transition"
                >
                  Record Sale (birds sold) <TrendingUp size={18} />
                </button>

              </div>
            );
          })
        )}
      </div>

      {/* Sale Modal */}
      {selectedBatch && (
        <RecordSaleModal 
          batch={selectedBatch} 
          onClose={() => setSelectedBatch(null)} 
        />
      )}
      
    </div>
  );
}
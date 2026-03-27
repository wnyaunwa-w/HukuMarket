"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToBatches, Batch, deleteBatch, getActiveAds, Ad, getUserProfile, updateBatchStock } from "@/lib/db-service";
import { getGrowthStage } from "@/lib/chickenLogic";
import { Loader2, PlusCircle, TrendingUp, Trash2, BadgeCheck, ShieldAlert, ClockAlert, CheckCircle2, Edit3 } from "lucide-react"; 
import Link from "next/link";
import { RecordSaleModal } from "@/components/RecordSaleModal";
import { EditBatchModal } from "@/components/EditBatchModal"; 

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null); 
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToBatches(currentUser.uid, (data) => {
        setBatches(data);
        setLoading(false);
      });

      getUserProfile(currentUser.uid).then((profile) => {
        setUserProfile(profile);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    async function loadAds() {
      try {
        const ads = await getActiveAds("dashboard_banner");
        if (ads.length > 0) {
          const randomIndex = Math.floor(Math.random() * ads.length);
          setCurrentAd(ads[randomIndex]);
        }
      } catch (error) {
        console.error("Ad service unavailable");
      }
    }
    loadAds();
  }, []);

  const handleDelete = async (batchId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this listing? This action cannot be undone.");
    if (confirmDelete) {
      await deleteBatch(batchId);
    }
  };

  const handleMarkSoldOut = async (batch: Batch) => {
    const confirmSoldOut = window.confirm("Mark this entire batch as Sold Out? This will instantly remove it from the marketplace.");
    if (confirmSoldOut && batch.id) {
      try {
        await updateBatchStock(batch.id, batch.count); 
      } catch (error) {
        console.error("Failed to mark sold out", error);
        alert("Failed to update status. Please try again.");
      }
    }
  };

  // 👈 FIX 1: Added fallback date and prevented dressed birds from expiring
  const activeBatchesList = batches.filter(b => {
      if (b.listingType === 'dressed') return b.count > 0;
      const { daysLeft } = getGrowthStage(b.hatchDate || new Date().toISOString());
      return daysLeft >= -14 && b.count > 0; 
  });
  
  const totalBirds = activeBatchesList.reduce((acc, b) => acc + b.count, 0);
  const activeBatches = activeBatchesList.length;

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            Dashboard
            {userProfile?.isVerified ? (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-blue-200">
                <BadgeCheck size={14} className="fill-blue-500 text-white" /> Verified Farmer
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-slate-200">
                Unverified
              </span>
            )}
          </h1>
          <p className="text-slate-500">Welcome, {currentUser?.displayName || "Farmer"}</p>
        </div>
        
        {!userProfile?.isVerified && (
           <Link 
             href="/dashboard/verify" 
             className="flex text-xs font-bold text-slate-500 items-center gap-1 hover:text-blue-600 transition bg-white md:bg-transparent border md:border-transparent border-slate-200 p-2 md:p-0 rounded-lg md:rounded-none w-fit shadow-sm md:shadow-none"
           >
             <ShieldAlert size={14} className="text-blue-500" /> How to get verified?
           </Link>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-orange-50 p-6 rounded-3xl border border-huku-orange/20">
          <p className="text-xs font-bold text-huku-orange uppercase tracking-wider mb-1">Active Birds</p>
          <h3 className="text-4xl font-black text-slate-900">{totalBirds.toLocaleString()}</h3>
        </div>
        <div className="bg-orange-50 p-6 rounded-3xl border border-huku-orange/20">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Batches</p>
          <h3 className="text-4xl font-black text-huku-orange">{activeBatches}</h3>
        </div>
      </div>

      {/* ADS */}
      {currentAd && (
        <div className="mb-8 rounded-3xl overflow-hidden relative group shadow-lg h-64 md:h-72">
          <div className="absolute inset-0">
             <img src={currentAd.imageUrl} className="w-full h-full object-cover" alt={currentAd.title} />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>
          <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="flex items-start gap-4">
                {currentAd.logoUrl && (
                  <div className="w-16 h-16 rounded-full border-2 border-white/20 bg-white p-1 shadow-lg shrink-0 overflow-hidden">
                    <img src={currentAd.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                )}
                <div>
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest mb-2 inline-block shadow-sm">Partner Offer</span>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight drop-shadow-md">{currentAd.title}</h3>
                  <p className="text-blue-100 font-medium max-w-lg text-sm md:text-base leading-relaxed drop-shadow-sm line-clamp-2">{currentAd.description}</p>
                </div>
              </div>
              <a href={currentAd.link} target="_blank" rel="noopener noreferrer" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg whitespace-nowrap text-sm flex-shrink-0">{currentAd.ctaText}</a>
            </div>
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
            const isDressed = batch.listingType === 'dressed';

            // 👈 FIX 2: Added the fallback date here as well
            let { stage, progress, daysLeft, marketReadyDate } = getGrowthStage(batch.hatchDate || new Date().toISOString());
            
            if (isDressed) progress = 100;

            const isExpired = !isDressed && daysLeft < -14; 
            const isSoldOut = batch.count <= 0;
            const isHidden = isExpired || isSoldOut; 
            
            return (
              <div key={batch.id} className={`border-2 rounded-3xl p-6 relative group transition duration-300 ${
                isHidden ? "bg-slate-50 border-slate-200 opacity-80" : "bg-huku-light border-huku-tan hover:shadow-lg"
              }`}>
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => setEditingBatch(batch)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                    title="Edit Listing"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button 
                    onClick={() => batch.id && handleDelete(batch.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Delete Listing"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="flex justify-between items-start mb-6 pr-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-xl font-black ${isHidden ? "text-slate-500 line-through" : "text-slate-900"}`}>
                        {isDressed ? "❄️ DRESSED CHICKENS" : batch.breed}
                      </h3>
                      
                      {!isHidden && userProfile?.isVerified && (
                        <BadgeCheck size={18} className="text-blue-500 fill-blue-100" />
                      )}

                      {/* Dynamic Status Badges */}
                      {isSoldOut ? (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-1 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Sold Out
                        </span>
                      ) : isExpired ? (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-1 flex items-center gap-1">
                          <ClockAlert size={12} /> Auto-Archived
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-1 ${isDressed ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'}`}>
                          {isDressed ? "❄️ DRESSED & READY" : stage}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>📍 {batch.location}</span>
                      <span className={isSoldOut ? "text-green-600 font-bold" : ""}>{isDressed ? "🍗" : "👤"} {batch.count} Birds</span>
                    </div>
                  </div>
                </div>

                {!isHidden && (
                  <div className="mb-6">
                     <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                       <span>{isDressed ? "Ready Now" : `Day ${Math.floor(progress * 0.42)}`}</span>
                       <span className={isDressed || daysLeft <= 3 ? "text-green-600" : "text-orange-600"}>
                         {isDressed ? "Ready for Market!" : (daysLeft <= 0 ? "Ready for Market!" : `Ready: ${marketReadyDate}`)}
                       </span>
                     </div>
                     <div className="h-4 w-full bg-white rounded-full overflow-hidden border border-huku-tan/50">
                       <div 
                         className={`h-full rounded-full transition-all duration-1000 ${isDressed ? "bg-green-500" : "bg-huku-orange"}`}
                         style={{ width: `${Math.min(progress, 100)}%` }} 
                       />
                     </div>
                  </div>
                )}

                {/* DYNAMIC ACTIONS */}
                {isSoldOut ? (
                  <div className="w-full bg-green-50/50 border border-green-200 text-green-700 py-3 rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-1">
                    <span>🎉 Batch Sold Out</span>
                    <span className="text-xs font-medium text-green-600">This listing is no longer on the marketplace.</span>
                  </div>
                ) : isExpired ? (
                  <div className="w-full bg-red-50/50 border border-red-100 text-red-600 py-3 rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-1">
                    <span>⚠️ Hidden from Marketplace</span>
                    <span className="text-xs font-medium text-red-400">Batch is over 8 weeks old. Please delete or mark as sold out.</span>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedBatch(batch)}
                      className="flex-1 bg-white border-2 border-huku-tan text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-huku-orange hover:text-huku-orange transition text-sm sm:text-base"
                    >
                      Record Sale <TrendingUp size={18} />
                    </button>
                    <button 
                      onClick={() => handleMarkSoldOut(batch)}
                      className="flex-1 bg-green-50 border-2 border-green-200 text-green-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 hover:border-green-300 transition text-sm sm:text-base"
                    >
                      Sold Out <CheckCircle2 size={18} />
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {selectedBatch && (
        <RecordSaleModal 
          batch={selectedBatch} 
          onClose={() => setSelectedBatch(null)} 
        />
      )}

      {editingBatch && (
        <EditBatchModal 
          batch={editingBatch} 
          onClose={() => setEditingBatch(null)} 
        />
      )}
      
    </div>
  );
}
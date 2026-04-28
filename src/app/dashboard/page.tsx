"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToBatches, Batch, deleteBatch, getActiveAds, Ad, getUserProfile, updateBatchStock } from "@/lib/db-service";
import { getGrowthStage } from "@/lib/chickenLogic";
import { Loader2, PlusCircle, TrendingUp, Trash2, BadgeCheck, ShieldAlert, ClockAlert, CheckCircle2, Edit3, Sparkles, Eye, DollarSign, Package } from "lucide-react"; 
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

  const [daysLeftInTrial, setDaysLeftInTrial] = useState(0);
  const [isTrialActive, setIsTrialActive] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToBatches(currentUser.uid, (data) => {
        setBatches(data);
        setLoading(false);
      });

      getUserProfile(currentUser.uid).then((profile) => {
        setUserProfile(profile);
        
        // ⏱️ NEW: Calculate exact days left based on the database expiration stamp
        if (profile?.subscriptionExpiryDate) {
          const expiry = new Date(profile.subscriptionExpiryDate);
          const now = new Date();
          const diffTime = expiry.getTime() - now.getTime();
          const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          setDaysLeftInTrial(remainingDays > 0 ? remainingDays : 0);
          setIsTrialActive(remainingDays > 0 && profile.subscriptionStatus === 'trial');
        } 
        // 🛡️ FALLBACK: For old accounts before we added the expiry stamp (Assumes 90 days from creation)
        else if (currentUser.metadata?.creationTime) {
          const signupDate = new Date(currentUser.metadata.creationTime);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
          const remaining = 90 - diffDays;
          setDaysLeftInTrial(remaining > 0 ? remaining : 0);
          setIsTrialActive(remaining > 0 && profile?.subscriptionStatus !== 'active');
        }
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
    if (window.confirm("Are you sure you want to delete this listing?")) {
      await deleteBatch(batchId);
    }
  };

  const handleMarkSoldOut = async (batch: Batch) => {
    if (window.confirm("Mark this entire batch as Sold Out?") && batch.id) {
      try { await updateBatchStock(batch.id, batch.count); } 
      catch (error) { alert("Failed to update status. Please try again."); }
    }
  };

  // 📈 ANALYTICS CALCULATIONS
  const activeBatchesList = batches.filter(b => b.count > 0 && (b.listingType === 'dressed' || getGrowthStage(b.hatchDate || new Date().toISOString()).daysLeft >= -14));
  const totalBirds = activeBatchesList.reduce((acc, b) => acc + b.count, 0);
  
  // Track metrics across ALL batches (including sold out ones)
  const totalInquiries = batches.reduce((acc, b) => acc + (b.inquiries || 0), 0);
  const totalSold = batches.reduce((acc, b) => acc + (b.soldCount || 0), 0); 
  const estimatedRevenue = batches.reduce((acc, b) => acc + ((b.soldCount || 0) * b.pricePerBird), 0);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
           <Link href="/dashboard/verify" className="flex text-xs font-bold text-slate-500 items-center gap-1 hover:text-blue-600 transition bg-white md:bg-transparent border md:border-transparent border-slate-200 p-2 md:p-0 rounded-lg md:rounded-none w-fit shadow-sm md:shadow-none">
             <ShieldAlert size={14} className="text-blue-500" /> How to get verified?
           </Link>
        )}
      </div>

      {/* 🚀 THE LAUNCH SPECIAL BANNER */}
      {isTrialActive && userProfile?.subscriptionStatus !== 'active' && (
        <div className="bg-gradient-to-r from-orange-500 to-huku-orange p-6 rounded-3xl text-white mb-8 shadow-lg shadow-orange-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="bg-white/20 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest mb-2 inline-flex items-center gap-1">
              <Sparkles size={12} /> Launch Special
            </span>
            <h3 className="text-xl font-black mb-1">Pioneer Promo Active!</h3>
            <p className="text-orange-50 font-medium text-sm md:text-base flex flex-wrap items-center gap-1.5">
              Monthly Subscription: <span className="line-through opacity-70 ml-1 decoration-2">$5.00</span> <span className="font-black text-white text-lg">$0.00</span> 
            </p>
          </div>
          <div className="shrink-0 text-center bg-white/10 px-5 py-3 rounded-2xl border border-white/20 shadow-inner w-full md:w-auto">
             <span className="block text-3xl font-black drop-shadow-sm">{daysLeftInTrial}</span>
             <span className="text-[10px] uppercase tracking-widest font-bold opacity-90">Days Left</span>
          </div>
        </div>
      )}

      {/* 📊 NEW PERFORMANCE ANALYTICS GRID */}
      <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
        <TrendingUp className="text-huku-orange" size={20} /> Your Performance
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Eye size={16} className="text-blue-500" />
            <p className="text-xs font-bold uppercase tracking-wider">Inquiries</p>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{totalInquiries}</h3>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <DollarSign size={16} className="text-green-500" />
            <p className="text-xs font-bold uppercase tracking-wider">Est. Revenue</p>
          </div>
          <h3 className="text-3xl font-black text-slate-900">${estimatedRevenue.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <CheckCircle2 size={16} className="text-huku-orange" />
            <p className="text-xs font-bold uppercase tracking-wider">Birds Sold</p>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{totalSold}</h3>
        </div>

        <div className="bg-orange-50 p-5 rounded-3xl border border-huku-orange/20 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Package size={16} className="text-huku-orange" />
            <p className="text-xs font-bold uppercase tracking-wider text-huku-orange">Active Stock</p>
          </div>
          <h3 className="text-3xl font-black text-huku-orange">{totalBirds.toLocaleString()}</h3>
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
             <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight drop-shadow-md">{currentAd.title}</h3>
             <a href={currentAd.link} target="_blank" rel="noopener noreferrer" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 w-fit">
               {currentAd.ctaText}
             </a>
          </div>
        </div>
      )}

      {/* BATCH LIST */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-black text-slate-900">Your Listings</h3>
          <Link href="/dashboard/listings/new" className="text-sm font-bold text-huku-orange hover:text-orange-700 flex items-center gap-1">
            <PlusCircle size={16} /> Add New
          </Link>
        </div>

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
            let { stage, progress, daysLeft, marketReadyDate } = getGrowthStage(batch.hatchDate || new Date().toISOString());
            if (isDressed) progress = 100;
            const isExpired = !isDressed && daysLeft < -14; 
            const isSoldOut = batch.count <= 0;
            const isHidden = isExpired || isSoldOut; 
            
            return (
              <div key={batch.id} className={`border-2 rounded-3xl p-6 relative group transition duration-300 ${isHidden ? "bg-slate-50 border-slate-200 opacity-80" : "bg-huku-light border-huku-tan hover:shadow-lg"}`}>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => setEditingBatch(batch)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"><Edit3 size={20} /></button>
                  <button onClick={() => batch.id && handleDelete(batch.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><Trash2 size={20} /></button>
                </div>

                <div className="flex justify-between items-start mb-6 pr-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-xl font-black ${isHidden ? "text-slate-500 line-through" : "text-slate-900"}`}>{isDressed ? "❄️ DRESSED CHICKENS" : batch.breed}</h3>
                      {isSoldOut ? <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-1 flex items-center gap-1"><CheckCircle2 size={12} /> Sold Out</span> : null}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>📍 {batch.location}</span>
                      <span className={isSoldOut ? "text-green-600 font-bold" : ""}>{isDressed ? "🍗" : "👤"} {batch.count} Birds Left</span>
                      <span className="flex items-center gap-1 text-blue-500 font-bold bg-blue-50 px-2 rounded-lg border border-blue-100"><Eye size={14}/> {batch.inquiries || 0} Inquiries</span>
                    </div>
                  </div>
                </div>

                {!isHidden ? (
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setSelectedBatch(batch)} className="flex-1 bg-white border-2 border-huku-tan text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-huku-orange hover:text-huku-orange transition text-sm">Record Sale <TrendingUp size={18} /></button>
                    <button onClick={() => handleMarkSoldOut(batch)} className="flex-1 bg-green-50 border-2 border-green-200 text-green-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 hover:border-green-300 transition text-sm">Sold Out <CheckCircle2 size={18} /></button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {selectedBatch && <RecordSaleModal batch={selectedBatch} onClose={() => setSelectedBatch(null)} />}
      {editingBatch && <EditBatchModal batch={editingBatch} onClose={() => setEditingBatch(null)} />}
    </div>
  );
}
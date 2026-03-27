"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToBatches, Batch, deleteBatch } from "@/lib/db-service";
import { getGrowthStage } from "@/lib/chickenLogic";
import { Loader2, PlusCircle, Trash2, MapPin, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";
import { RecordSaleModal } from "@/components/RecordSaleModal";

export default function MyListingsPage() {
  const { currentUser } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToBatches(currentUser.uid, (data) => {
        setBatches(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleDelete = async (batchId: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      await deleteBatch(batchId);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-slate-900">My Listings</h1>
        <Link href="/dashboard/listings/new" className="bg-huku-orange text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-orange-600 transition">
          <PlusCircle size={20} /> New Batch
        </Link>
      </div>

      <div className="space-y-4">
        {batches.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 mb-4">You haven't listed any chickens yet.</p>
            <Link href="/dashboard/listings/new" className="text-huku-orange font-bold hover:underline">Create your first listing</Link>
          </div>
        ) : (
          batches.map((batch) => {
            const isDressed = batch.listingType === 'dressed';
            
            // 👈 FIX: Added the fallback date to satisfy TypeScript
            let { stage, progress, daysLeft, marketReadyDate } = getGrowthStage(batch.hatchDate || new Date().toISOString());
            
            // 👈 UPGRADE: Override math for dressed birds
            if (isDressed) {
              progress = 100;
            }
            
            return (
              <div key={batch.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition relative group">
                
                {/* Delete Button */}
                <button 
                  onClick={() => batch.id && handleDelete(batch.id)}
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                  title="Delete Batch"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Status Column */}
                  <div className={`shrink-0 flex flex-col items-center justify-center rounded-xl w-24 h-24 border ${isDressed ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="text-3xl">{isDressed ? "🍗" : "🐔"}</span>
                    <span className="font-black text-slate-900 text-lg">{batch.count}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Birds</span>
                  </div>

                  {/* Info Column */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold text-lg ${isDressed ? "text-blue-600" : "text-slate-900"}`}>
                        {isDressed ? "❄️ DRESSED CHICKENS" : batch.breed}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isDressed ? 'bg-blue-100 text-blue-700' :
                        daysLeft <= 0 ? 'bg-green-100 text-green-700' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {isDressed ? "❄️ DRESSED & READY" : stage}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} /> {batch.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} /> Ready: <span className="text-slate-700 font-medium">{isDressed ? "Now" : marketReadyDate}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 text-right">
                      {isDressed ? "Ready Now" : (daysLeft > 0 ? `${daysLeft} days to maturity` : "Market Ready")}
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                   <button 
                     onClick={() => setSelectedBatch(batch)}
                     className="text-sm font-bold text-huku-orange hover:bg-orange-50 px-4 py-2 rounded-lg transition flex items-center gap-2"
                   >
                     Record Sale (birds sold) <TrendingUp size={16} />
                   </button>
                </div>
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
    </div>
  );
}
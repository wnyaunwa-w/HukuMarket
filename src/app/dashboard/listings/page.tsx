"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToBatches, Batch } from "@/lib/db-service";
import { calculateBatchMetrics, BREEDS } from "@/lib/chickenLogic";
import { UpdateStockModal } from "@/components/UpdateStockModal"; 
import { MapPin, User, Calendar, PlusCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyListings() {
  const { currentUser, loading } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  // Listen to your specific batches
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToBatches(currentUser.uid, (data) => {
        setBatches(data);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  if (loading) return <div className="p-10 text-center text-slate-400">Loading listings...</div>;

  return (
    <div className="max-w-5xl mx-auto py-6">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Listings 📋</h1>
          <p className="text-slate-500">Manage your active chicken stock.</p>
        </div>
        <Link 
          href="/dashboard/listings/new" 
          className="bg-orange-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center gap-2 shadow-lg hover:shadow-orange-200"
        >
          <PlusCircle size={20} /> New Listing
        </Link>
      </div>

      {/* Empty State */}
      {batches.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No active listings</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            You haven't listed any chickens yet. Create your first batch to start selling to buyers near you.
          </p>
          <Link 
             href="/dashboard/listings/new" 
             className="text-orange-600 font-bold hover:underline"
          >
            Create a Listing Now →
          </Link>
        </div>
      ) : (
        /* Grid of Listings */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {batches.map((batch) => {
            const metrics = calculateBatchMetrics(batch.hatchDate, batch.breed);
            
            return (
              <div key={batch.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden group hover:border-orange-200 transition">
                
                {/* Status Badge */}
                <div className={`absolute top-0 right-0 px-4 py-1.5 text-xs font-bold rounded-bl-2xl ${metrics.statusColor}`}>
                  {metrics.status}
                </div>

                <div className="mb-4 pr-10">
                  <h3 className="font-bold text-xl text-slate-900 mb-1">
                    {BREEDS[batch.breed as keyof typeof BREEDS]?.name || batch.breed}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <MapPin size={14} /> {batch.location}
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Quantity</p>
                    <p className="font-bold text-slate-800 text-lg flex items-center gap-1">
                      <User size={16} className="text-slate-400"/> {batch.count}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Market Ready</p>
                    <p className="font-bold text-green-700 text-lg flex items-center gap-1">
                      <Calendar size={16} className="text-green-500"/> {metrics.marketReadyDate}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                    <span>Day {metrics.ageInDays}</span>
                    <span>{Math.round(metrics.progress)}% Grown</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${metrics.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-3">
                  <button 
                    onClick={() => setEditingBatch(batch)}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                  >
                    Update Stock 📉
                  </button>
                  {/* You could add an 'Edit Listing' button here in the future */}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Stock Update Modal */}
      {editingBatch && (
        <UpdateStockModal 
          batch={editingBatch} 
          onClose={() => setEditingBatch(null)} 
        />
      )}
    </div>
  );
}
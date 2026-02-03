"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToBatches, Batch } from "@/lib/db-service";
import { AddBatchModal } from "@/components/AddBatchModal";
import { UpdateStockModal } from "@/components/UpdateStockModal"; 
import { calculateBatchMetrics, BREEDS } from "@/lib/chickenLogic";
import { Plus, User, MapPin, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { currentUser, logout, loading } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null); 
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/");
    }
  }, [currentUser, loading, router]);

  // Listen to your chickens
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToBatches(currentUser.uid, (data) => {
        setBatches(data);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome, {currentUser?.displayName || "Farmer"}</p>
        </div>
        <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500">
          <LogOut size={20} />
        </button>
      </div>

      {/* Stats Cards - UPDATED THEME */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-huku-light p-4 rounded-xl shadow-sm border border-huku-tan">
          <p className="text-xs text-slate-400 uppercase font-bold">Total Birds</p>
          <p className="text-2xl font-black text-slate-800">
            {batches.reduce((sum, b) => sum + b.count, 0)}
          </p>
        </div>
        <div className="bg-huku-light p-4 rounded-xl shadow-sm border border-huku-tan">
          <p className="text-xs text-slate-400 uppercase font-bold">Active Batches</p>
          <p className="text-2xl font-black text-huku-orange">{batches.length}</p>
        </div>
      </div>

      {/* List of Batches */}
      <div className="space-y-4">
        {batches.map((batch) => {
          const metrics = calculateBatchMetrics(batch.hatchDate, batch.breed);
          
          return (
            // UPDATED: bg-huku-light, border-huku-tan
            <div key={batch.id} className="bg-huku-light p-5 rounded-xl shadow-sm border border-huku-tan relative overflow-hidden">
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl ${metrics.statusColor}`}>
                {metrics.status}
              </div>

              <div className="mb-2">
                <h3 className="font-bold text-lg text-slate-800">
                  {BREEDS[batch.breed as keyof typeof BREEDS]?.name || batch.breed}
                </h3>
                <div className="flex items-center text-slate-500 text-xs mt-1 space-x-2">
                  <span className="flex items-center"><MapPin size={12} className="mr-1"/> {batch.location}</span>
                  <span className="flex items-center"><User size={12} className="mr-1"/> {batch.count} Birds</span>
                </div>
              </div>

              {/* The Feed Clock Visual */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-500">Day {metrics.ageInDays}</span>
                  <span className="text-green-700">Ready: {metrics.marketReadyDate}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div 
                    className="bg-huku-orange h-2.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${metrics.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Record Sale Button */}
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => setEditingBatch(batch)}
                  className="flex-1 bg-white border border-huku-tan text-slate-700 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition"
                >
                  Record Sale 📉
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Floating Add Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-lg hover:scale-105 transition"
      >
        <Plus size={24} />
      </button>

      {/* MODALS */}
      {isModalOpen && <AddBatchModal onClose={() => setIsModalOpen(false)} />}
      
      {editingBatch && (
        <UpdateStockModal 
          batch={editingBatch} 
          onClose={() => setEditingBatch(null)} 
        />
      )}
    </div>
  );
}
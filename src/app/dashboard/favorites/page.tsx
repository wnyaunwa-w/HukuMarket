"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFavoriteBatches, Batch } from "@/lib/db-service";
import { ListingCard } from "@/components/ListingCard";
import { Loader2, Heart, Contact } from "lucide-react";
import { ContactModal } from "@/components/ContactModal";

export default function FavoritesPage() {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  useEffect(() => {
    async function loadFavorites() {
      if (currentUser) {
        const data = await getFavoriteBatches(currentUser.uid);
        setFavorites(data);
      }
      setLoading(false);
    }
    loadFavorites();
  }, [currentUser]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-100 rounded-full text-red-500">
          <Heart size={24} className="fill-current" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800">Saved Farms</h1>
          <p className="text-slate-500">Track the batches you are interested in.</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <Heart size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No favorites yet</h3>
          <p className="text-slate-400 mt-2">Go to the market and click the heart on listings you like!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((batch) => (
            <ListingCard 
              key={batch.id} 
              batch={batch} 
              onContact={(b) => setSelectedBatch(b)} 
            />
          ))}
        </div>
      )}

      {selectedBatch && (
        <ContactModal 
          batch={selectedBatch} 
          onClose={() => setSelectedBatch(null)} 
        />
      )}
    </div>
  );
}
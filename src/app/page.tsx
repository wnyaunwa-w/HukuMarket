"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { getAllBatches, Batch } from "@/lib/db-service";
import { ListingCard } from "@/components/ListingCard";
import { ContactModal } from "@/components/ContactModal";
import { Loader2, Search, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation"; // 👈 Logic preserved

export default function Home() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight'); // 👈 Logic preserved

  useEffect(() => {
    async function loadBatches() {
      const data = await getAllBatches();
      setBatches(data);
      setLoading(false);
    }
    loadBatches();
  }, []);

  // 👇 AUTO-SCROLL LOGIC (Preserved)
  useEffect(() => {
    if (!loading && highlightId) {
      const element = document.getElementById(highlightId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-huku-orange');
          setTimeout(() => element.classList.remove('ring-4', 'ring-huku-orange'), 2000);
        }, 500);
      }
    }
  }, [loading, highlightId]);

  const filteredBatches = batches.filter(batch => 
    batch.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />

      {/* 🏡 HERO SECTION (Restored to Original Design) */}
      <div className="relative h-[500px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1563205886-d440026e6328?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover brightness-[0.65]" 
            alt="Poultry Farm"
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          {/* Original White Text Design */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-sm">
            Zimbabwe's Poultry <br/>
            Marketplace 🇿🇼
          </h1>
          <p className="text-lg text-white/90 mb-10 font-bold max-w-2xl mx-auto drop-shadow-md">
            Connect directly with local broiler producers to buy healthy, market-ready chickens.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center max-w-xl mx-auto transform transition hover:scale-[1.01]">
             <div className="bg-slate-50 p-3 rounded-xl text-slate-400 ml-1">
               <Search size={24} />
             </div>
             <input 
               type="text" 
               placeholder="Search by Location (e.g. Ruwa)" 
               className="flex-1 px-4 py-3 outline-none text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium bg-transparent"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>
      </div>

      {/* LISTINGS GRID */}
      <div className="max-w-7xl mx-auto px-4 mt-12 relative z-20">
        <div className="flex items-center gap-2 mb-6 ml-2">
           <div className="bg-huku-orange p-2 rounded-lg text-white shadow-md">
             <MapPin size={20} />
           </div>
           <h2 className="text-slate-800 font-black text-2xl">Active Listings</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-huku-orange" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => (
              <ListingCard 
                key={batch.id} 
                batch={batch} 
                onContact={(b) => setSelectedBatch(b)} 
              />
            ))}
          </div>
        )}
        
        {!loading && filteredBatches.length === 0 && (
          <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 border-dashed">
            <p className="text-slate-400 font-bold">No chickens found matching your search.</p>
          </div>
        )}
      </div>

      {selectedBatch && (
        <ContactModal 
          batch={selectedBatch} 
          onClose={() => setSelectedBatch(null)} 
        />
      )}
    </div>
  );
}
"use client";

import { useEffect, useState, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { getAllBatches, Batch } from "@/lib/db-service";
import { ListingCard } from "@/components/ListingCard";
import { ContactModal } from "@/components/ContactModal";
import { Loader2, Search, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Sub-component to handle search params safely in Next.js
function MarketContent() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  useEffect(() => {
    async function loadBatches() {
      const data = await getAllBatches();
      setBatches(data);
      setLoading(false);
    }
    loadBatches();
  }, []);

  useEffect(() => {
    if (!loading && highlightId) {
      const element = document.getElementById(highlightId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-huku-orange');
          setTimeout(() => element.classList.remove('ring-4', 'ring-huku-orange'), 3000);
        }, 800);
      }
    }
  }, [loading, highlightId]);

  const filteredBatches = batches.filter(batch => 
    batch.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* 🏡 RESTORED HERO SECTION */}
      <div className="relative h-[550px] flex items-center justify-center bg-slate-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1563205886-d440026e6328?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover brightness-[0.55]" 
            alt="Poultry Farm Background"
            onError={(e) => {
              // Fallback if image fails
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/40" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-xl">
            Zimbabwe's Poultry <br/>
            <span className="text-huku-orange">Marketplace 🇿🇼</span>
          </h1>
          <p className="text-lg md:text-xl text-white/95 mb-10 font-bold max-w-2xl mx-auto drop-shadow-lg">
            Connect directly with local broiler producers to buy healthy, market-ready chickens.
          </p>

          {/* Fixed Search Bar Container */}
          <div className="bg-white p-2 rounded-2xl shadow-2xl flex items-center max-w-xl mx-auto border-4 border-white/20">
             <div className="bg-slate-50 p-3 rounded-xl text-slate-400 ml-1">
               <Search size={24} />
             </div>
             <input 
               type="text" 
               placeholder="Search by Location (e.g. Ruwa)" 
               className="flex-1 px-4 py-3 outline-none text-slate-800 font-bold placeholder:text-slate-400 bg-transparent"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>
      </div>

      {/* LISTINGS GRID */}
      <div className="max-w-7xl mx-auto px-4 mt-16 relative z-20">
        <div className="flex items-center gap-3 mb-8 ml-2">
           <div className="bg-huku-orange p-2.5 rounded-xl text-white shadow-lg shadow-orange-200">
             <MapPin size={22} />
           </div>
           <h2 className="text-slate-800 font-black text-3xl">Active Listings</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-huku-orange" size={48} />
            <p className="text-slate-400 font-bold animate-pulse">Loading the market...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div className="bg-white p-20 rounded-[3rem] text-center border-4 border-dashed border-slate-100">
            <div className="text-6xl mb-4 text-slate-200">🐣</div>
            <p className="text-slate-400 font-black text-xl">No listings found in this area yet.</p>
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-4 text-huku-orange font-bold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {selectedBatch && (
        <ContactModal 
          batch={selectedBatch} 
          onClose={() => setSelectedBatch(null)} 
        />
      )}
    </>
  );
}

// Main Page wrapper with Suspense (required for searchParams in Next.js)
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <Navbar />
      <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>}>
        <MarketContent />
      </Suspense>
    </div>
  );
}
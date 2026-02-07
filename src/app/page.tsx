"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { getAllBatches, Batch } from "@/lib/db-service";
import { ListingCard } from "@/components/ListingCard";
import { ContactModal } from "@/components/ContactModal";
import { Loader2, Search, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation"; // 👈 Import Search Params

export default function Home() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight'); // 👈 Get the ID from URL

  useEffect(() => {
    async function loadBatches() {
      const data = await getAllBatches();
      setBatches(data);
      setLoading(false);
    }
    loadBatches();
  }, []);

  // 👇 AUTO-SCROLL LOGIC
  useEffect(() => {
    if (!loading && highlightId) {
      const element = document.getElementById(highlightId);
      if (element) {
        // Wait a split second for layout to settle
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Optional: Add a temporary highlight effect
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

      {/* HERO SECTION */}
      <div className="relative bg-slate-900 h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40">
           <img 
             src="https://images.unsplash.com/photo-1563205886-d440026e6328?q=80&w=2000&auto=format&fit=crop" 
             className="w-full h-full object-cover"
             alt="Poultry Farm"
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
            Zimbabwe's Poultry <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-huku-orange to-yellow-400">Marketplace 🇿🇼</span>
          </h1>
          <p className="text-lg text-slate-200 mb-10 font-medium max-w-2xl mx-auto">
            Connect directly with local broiler producers to buy healthy, market-ready chickens.
          </p>

          {/* SEARCH BAR */}
          <div className="bg-white p-2 rounded-full shadow-2xl flex items-center max-w-xl mx-auto transition-transform hover:scale-[1.02]">
             <div className="bg-slate-100 p-3 rounded-full text-slate-400 ml-1">
               <Search size={24} />
             </div>
             <input 
               type="text" 
               placeholder="Search by Location (e.g. Ruwa)" 
               className="flex-1 px-4 py-3 outline-none text-slate-700 font-bold placeholder:text-slate-300 placeholder:font-medium"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>
      </div>

      {/* LISTINGS GRID */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="flex items-center gap-2 mb-6 ml-2">
           <div className="bg-huku-orange p-2 rounded-lg text-white shadow-lg">
             <MapPin size={20} />
           </div>
           <h2 className="text-white font-bold text-xl drop-shadow-md">Active Listings</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-white" size={48} />
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
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
            <p className="text-slate-400 font-bold">No chickens found in this area yet.</p>
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
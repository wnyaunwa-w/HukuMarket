"use client";
import { useState, useEffect } from "react";
import Image from "next/image"; // 👈 1. Import Image component
import { Navbar } from "@/components/Navbar";
import { ListingCard } from "@/components/ListingCard";
import { ContactModal } from "@/components/ContactModal";
import { getAllBatches, Batch } from "@/lib/db-service";
import { Search, Loader2 } from "lucide-react";

export default function Home() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getAllBatches();
      setBatches(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredBatches = batches.filter((b) =>
    b.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* 🎨 HERO SECTION: UPDATED STRUCTURE */}
      {/* 2. Changed className: Added 'relative' and removed 'bg-huku-tan' */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        
        {/* 3. THE BACKGROUND IMAGE */}
        {/* Ensure your image is named 'hero-bg.jpg' and is in the 'public' folder */}
        <Image
          src="/hero-bg.jpg" 
          alt="Poultry Farm Background"
          fill
          priority // Tells Next.js to load this image first
          className="object-cover -z-20" // Puts it behind everything
        />

        {/* 4. THE DARK OVERLAY (Crucial for text readability) */}
        {/* Adjust 'bg-black/50' to make it darker/lighter (e.g., bg-black/40 or bg-black/60) */}
        <div className="absolute inset-0 bg-black/50 -z-10" />

        {/* 5. THE CONTENT CONTAINER (Wrapped to ensure z-index sits on top) */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-sm">
            Zimbabwe's Poultry Marketplace 🇿🇼
          </h1>
          <p className="text-xl text-white/90 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
            Connect directly with local broiler producers to buy healthy, market-ready chickens.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-huku-orange transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by Location (e.g. Ruwa)"
              className="w-full pl-14 pr-6 py-5 rounded-2xl shadow-xl outline-none focus:ring-4 ring-white/30 text-lg transition-all text-slate-800 placeholder:text-slate-400 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Listings Section (Unchanged) */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Fresh Listings</h2>
          <p className="text-slate-500 font-medium">{filteredBatches.length} producers found</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-huku-orange" size={48} />
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
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-400 text-lg">No producers found in this location yet.</p>
          </div>
        )}
      </section>

      {/* Modals */}
      {selectedBatch && (
        <ContactModal 
          batch={selectedBatch} 
          onClose={() => setSelectedBatch(null)} 
        />
      )}
    </main>
  );
}
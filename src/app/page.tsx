"use client";

import { useEffect, useState, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { getAllBatches, Batch } from "@/lib/db-service";
import { ListingCard } from "@/components/ListingCard";
import { ContactModal } from "@/components/ContactModal";
import { Loader2, Search, MapPin, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Sub-component to handle search params safely in Next.js
function MarketContent() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
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

  const faqs = [
    {
      question: "How do I buy chickens on HukuMarket?",
      answer: "It's simple! Browse the active listings above. When you find a batch you like, click 'View Contact Details' to get the farmer's phone number. You can then call or WhatsApp them directly to arrange payment and collection."
    },
    {
      question: "Is payment handled through the website?",
      answer: "No. HukuMarket connects you directly with the farmer. You pay them directly via Cash, EcoCash, or InnBucks upon collection or delivery. We do not hold funds."
    },
    {
      question: "How do I know the chickens are healthy?",
      answer: "We encourage all buyers to inspect the birds in person before paying. Ask the farmer for their vaccination record card and, if moving across districts, a Department of Veterinary Services movement permit."
    },
    {
      question: "I am a farmer. How do I list my birds?",
      answer: "Click the orange 'Sell' button in the top right corner. You'll need to create a free account, select 'I'm a Farmer', and then you can post your batch details, pricing, and location."
    },
    {
      question: "Do you offer delivery services?",
      answer: "HukuMarket itself does not offer transport. However, many farmers on our platform are willing to deliver for a fee. Check the specific listing description or ask the farmer when you call."
    }
  ];

  return (
    <>
      {/* 🏡 HERO SECTION */}
      <div className="relative h-[550px] flex items-center justify-center bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.jpg" 
            className="w-full h-full object-cover brightness-[0.55]" 
            alt="Poultry Farm Background"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
      <div className="max-w-7xl mx-auto px-4 mt-16 relative z-20 pb-24">
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
            <button onClick={() => setSearchTerm("")} className="mt-4 text-huku-orange font-bold hover:underline">
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* ❓ FAQ SECTION (New) */}
      <div className="bg-white border-t border-slate-100 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-orange-100 text-huku-orange rounded-full mb-4">
              <HelpCircle size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium">Everything you need to know about buying and selling on HukuMarket.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  openFaqIndex === index 
                  ? "bg-orange-50/50 border-orange-200 shadow-sm" 
                  : "bg-slate-50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className={`font-bold text-lg ${openFaqIndex === index ? "text-huku-orange" : "text-slate-700"}`}>
                    {faq.question}
                  </span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="text-huku-orange" size={20} />
                  ) : (
                    <ChevronDown className="text-slate-400" size={20} />
                  )}
                </button>
                
                {openFaqIndex === index && (
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-1">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
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

// Main Page wrapper with Suspense
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
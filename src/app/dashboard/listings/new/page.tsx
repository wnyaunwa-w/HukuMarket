"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBatch } from "@/lib/db-service"; 
import { useAuth } from "@/context/AuthContext"; 
import { Loader2, Bird, Snowflake } from "lucide-react"; // 👈 Added Bird and Snowflake icons
import { BREEDS } from "@/lib/chickenLogic";
import { SubscriptionGate } from "@/components/SubscriptionGate"; 

export default function CreateListing() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // NEW: Listing Type State
  const [listingType, setListingType] = useState<'live' | 'dressed'>('live');

  // Form State
  const [formData, setFormData] = useState({
    breed: "COBB_500",
    otherBreed: "", 
    count: 100,
    pricePerBird: 5,
    city: "Harare",   
    suburb: "",       
    hatchDate: new Date().toISOString().split("T")[0], 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    
    if (!currentUser) {
      alert("Please log in first!");
      return;
    }
    
    setLoading(true);

    try {
      const finalBreed = formData.breed === "OTHER" ? formData.otherBreed : formData.breed;
      const finalLocation = `${formData.city}, ${formData.suburb}`;

      await createBatch({
        userId: currentUser.uid,
        listingType: listingType, // 👈 Tell the DB which type this is
        // If dressed, save as "DRESSED" to prevent frontend errors. Otherwise use chosen breed.
        breed: listingType === 'live' ? finalBreed : "DRESSED", 
        count: Number(formData.count),
        // If dressed, save today's date just as a fallback placeholder
        hatchDate: listingType === 'live' ? formData.hatchDate : new Date().toISOString().split("T")[0], 
        location: finalLocation, 
        pricePerBird: Number(formData.pricePerBird),
      });

      router.push("/dashboard"); 
    } catch (error) {
      console.error(error);
      alert("Failed to create listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔒 1. Wrap everything in the SubscriptionGate
    <SubscriptionGate>
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-2">Create a New Listing 🐣</h1>
        <p className="text-slate-500 mb-8">List your broiler chickens on HukuMarket.</p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          
          {/* 👈 THE NEW LISTING TYPE TOGGLE */}
          <div className="mb-6 border-b border-slate-100 pb-8">
            <label className="block text-sm font-bold text-slate-700 mb-3">What are you selling?</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setListingType('live')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  listingType === 'live' 
                  ? 'border-orange-500 bg-orange-50 text-orange-600' 
                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Bird size={28} className="mb-2" />
                <span className="font-bold">Live Broilers</span>
              </button>
              
              <button
                type="button"
                onClick={() => setListingType('dressed')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  listingType === 'dressed' 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Snowflake size={28} className="mb-2" />
                <span className="font-bold">Dressed / Frozen</span>
              </button>
            </div>
          </div>

          {/* Row 1: Breed & Placement Date (ONLY SHOW FOR LIVE BIRDS) */}
          {listingType === 'live' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Breed</label>
                <select
                  className="w-full p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 ring-orange-100"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                >
                  {Object.entries(BREEDS).map(([key, info]) => (
                    <option key={key} value={key}>{info.name}</option>
                  ))}
                  <option value="OTHER">Other (Specify below)</option>
                </select>
                
                {/* Show this input ONLY if "Other" is selected */}
                {formData.breed === "OTHER" && (
                  <input
                    type="text"
                    placeholder="Type breed name..."
                    required
                    className="w-full p-3 mt-2 border rounded-lg bg-white outline-none focus:ring-2 ring-orange-100 animate-in fade-in slide-in-from-top-1"
                    value={formData.otherBreed}
                    onChange={(e) => setFormData({ ...formData, otherBreed: e.target.value })}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Placement Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 ring-orange-100"
                  value={formData.hatchDate}
                  onChange={(e) => setFormData({ ...formData, hatchDate: e.target.value })}
                />
                <p className="text-xs text-slate-400 mt-1">Date you placed your chicks in the fowl run.</p>
              </div>
            </div>
          )}

          {/* Row 2: Price & Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Price per Bird ($)</label>
              <input
                type="number" step="0.5" required
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 ring-orange-100"
                value={formData.pricePerBird}
                onChange={(e) => setFormData({ ...formData, pricePerBird: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Available Quantity</label>
              <input
                type="number" required
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 ring-orange-100"
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Row 3: Location Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">City / Town</label>
              <input
                type="text" required placeholder="e.g. Harare"
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 ring-orange-100"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Suburb / Area</label>
              <input
                type="text" required placeholder="e.g. Ruwa"
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 ring-orange-100"
                value={formData.suburb}
                onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
              />
            </div>
          </div>

          {/* Submit Button (Dynamically changes color based on type!) */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-4 rounded-lg transition flex items-center justify-center text-lg shadow-lg ${
              listingType === 'dressed' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" /> Saving...
              </span>
            ) : (
               listingType === 'dressed' ? "Create Dressed Listing" : "Create Live Listing"
            )}
          </button>

        </form>
      </div>
    </SubscriptionGate>
  );
}
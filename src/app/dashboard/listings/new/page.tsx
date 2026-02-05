"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBatch } from "@/lib/db-service"; 
import { useAuth } from "@/context/AuthContext"; 
import { Loader2 } from "lucide-react";
import { BREEDS } from "@/lib/chickenLogic";
import { SubscriptionGate } from "@/components/SubscriptionGate"; // 👈 Import the Gate

export default function CreateListing() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    breed: "COBB_500",
    otherBreed: "", // NEW: For manual entry
    count: 100,
    pricePerBird: 5,
    city: "Harare",   // NEW: City
    suburb: "",       // NEW: Suburb
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
      // Logic: If they chose "Other", use the manual text. Otherwise use the dropdown value.
      const finalBreed = formData.breed === "OTHER" ? formData.otherBreed : formData.breed;
      
      // Logic: Combine City + Suburb into one "Location" string for the card
      const finalLocation = `${formData.city}, ${formData.suburb}`;

      await createBatch({
        userId: currentUser.uid,
        breed: finalBreed,
        count: Number(formData.count),
        hatchDate: formData.hatchDate,
        location: finalLocation, // Saves as "Harare, Ruwa"
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
          
          {/* Row 1: Breed & Placement Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <p className="text-xs text-slate-400 mt-1">Date chicks were placed in your coop.</p>
            </div>
          </div>

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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-lg transition flex items-center justify-center text-lg shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" /> Saving...
              </span>
            ) : (
              "Create Listing"
            )}
          </button>

        </form>
      </div>
    </SubscriptionGate>
  );
}
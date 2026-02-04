"use client";
import React, { useState } from "react";
import { createBatch } from "@/lib/db-service";
import { useAuth } from "@/context/AuthContext";
import { BREEDS } from "@/lib/chickenLogic";
import { X, Loader2 } from "lucide-react";

export function AddBatchModal({ onClose }: { onClose: () => void }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    breed: "COBB_500",
    count: 100,
    hatchDate: new Date().toISOString().split("T")[0], // Defaults to Today
    location: "Harare",
    pricePerBird: 6
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    try {
      await createBatch({
        userId: currentUser.uid,
        ...formData,
        count: Number(formData.count),
        pricePerBird: Number(formData.pricePerBird)
      });
      onClose(); 
    } catch (error) {
      alert("Failed to save batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* UPDATED: bg-huku-light for the cream background */}
      <div className="bg-huku-light rounded-2xl w-full max-w-md p-6 relative shadow-2xl border border-huku-tan max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={24} />
        </button>

        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-800">Create a New Listing 🐣</h2>
          <p className="text-sm text-slate-500 font-medium">List your broiler chickens on HukuMarket.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Breed Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Breed</label>
            <div className="relative">
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-huku-orange outline-none appearance-none font-medium"
                value={formData.breed}
                onChange={(e) => setFormData({...formData, breed: e.target.value})}
              >
                {Object.entries(BREEDS).map(([key, info]) => (
                  <option key={key} value={key}>{info.name}</option>
                ))}
              </select>
              {/* Custom arrow for styling */}
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>

          {/* Placement Date - UPDATED TEXT */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Placement Date <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" required
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-huku-orange outline-none transition"
              value={formData.hatchDate}
              onChange={(e) => setFormData({...formData, hatchDate: e.target.value})}
            />
            {/* UPDATED: "fowl run" text */}
            <p className="text-[10px] text-slate-400 mt-1 ml-1 font-medium">
              Date chicks were placed in your fowl run.
            </p>
          </div>

          {/* Price & Quantity Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Price per Bird ($)</label>
              <input 
                type="number" step="0.5" required
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-huku-orange outline-none"
                value={formData.pricePerBird}
                onChange={(e) => setFormData({...formData, pricePerBird: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Available Quantity</label>
              <input 
                type="number" required
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-huku-orange outline-none"
                value={formData.count}
                onChange={(e) => setFormData({...formData, count: Number(e.target.value)})}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">City / Town</label>
            <input 
              type="text" required 
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-huku-orange outline-none mb-3"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
            
            <label className="block text-sm font-bold text-slate-700 mb-1">Suburb / Area</label>
             <input 
              type="text" placeholder="e.g. Ruwa"
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-huku-orange outline-none placeholder:text-slate-300"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" disabled={loading}
            className="w-full bg-huku-orange text-white p-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200 flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
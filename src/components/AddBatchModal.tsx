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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-slate-800">Add New Batch 🐣</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Breed</label>
            <select 
              className="w-full mt-1 p-3 border rounded-lg bg-slate-50 text-slate-800"
              value={formData.breed}
              onChange={(e) => setFormData({...formData, breed: e.target.value})}
            >
              {Object.entries(BREEDS).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input 
                type="number" required
                className="w-full mt-1 p-3 border rounded-lg text-slate-800"
                value={formData.count}
                onChange={(e) => setFormData({...formData, count: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price ($)</label>
              <input 
                type="number" step="0.5" required
                className="w-full mt-1 p-3 border rounded-lg text-slate-800"
                value={formData.pricePerBird}
                onChange={(e) => setFormData({...formData, pricePerBird: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hatch Date (Day 1)</label>
            <input 
              type="date" required
              className="w-full mt-1 p-3 border rounded-lg text-slate-800"
              value={formData.hatchDate}
              onChange={(e) => setFormData({...formData, hatchDate: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input 
              type="text" required placeholder="e.g. Ruwa"
              className="w-full mt-1 p-3 border rounded-lg text-slate-800"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-orange-600 text-white p-3 rounded-lg font-bold hover:bg-orange-700 transition flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Start Tracking 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
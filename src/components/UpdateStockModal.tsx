"use client";
import { useState } from "react";
import { updateBatchStock, Batch } from "@/lib/db-service";
import { X, Save, MinusCircle } from "lucide-react";

interface UpdateStockModalProps {
  batch: Batch;
  onClose: () => void;
}

export function UpdateStockModal({ batch, onClose }: UpdateStockModalProps) {
  const [soldCount, setSoldCount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateBatchStock(batch.id!, Number(soldCount));
      onClose(); // Close automatically
      window.location.reload(); // Refresh to show new numbers
    } catch (error) {
      alert("Error: Could not update stock. Check if you have enough birds.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-1">Update Stock 📉</h2>
        <p className="text-sm text-slate-500 mb-4">You have <b>{batch.count}</b> birds currently.</p>

        <form onSubmit={handleUpdate}>
          <label className="block text-sm font-bold text-slate-700 mb-2">How many did you sell?</label>
          <input 
            type="number" 
            max={batch.count}
            min={1}
            required
            autoFocus
            className="w-full p-3 border rounded-lg mb-4 text-lg font-bold text-center"
            value={soldCount}
            onChange={(e) => setSoldCount(e.target.value)}
          />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition"
          >
            {loading ? "Updating..." : "Confirm Sale"}
          </button>
        </form>
      </div>
    </div>
  );
}
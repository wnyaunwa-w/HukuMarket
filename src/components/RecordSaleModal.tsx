"use client";
import { useState } from "react";
import { Batch, updateBatchStock } from "@/lib/db-service";
import { Loader2, X, ShoppingCart } from "lucide-react";

interface RecordSaleModalProps {
  batch: Batch;
  onClose: () => void;
}

export function RecordSaleModal({ batch, onClose }: RecordSaleModalProps) {
  const [soldAmount, setSoldAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch.id) return;
    
    if (soldAmount > batch.count) {
      alert("You cannot sell more birds than you currently have!");
      return;
    }

    setLoading(true);
    try {
      await updateBatchStock(batch.id, soldAmount);
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to record sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-huku-orange" size={20} />
            <h3 className="font-bold text-slate-800">Record a Sale</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSale} className="p-8">
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Quantity Sold
            </label>
            <input 
              type="number"
              min="1"
              max={batch.count}
              required
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-900 focus:border-huku-orange focus:ring-0 transition-colors"
              value={soldAmount}
              onChange={(e) => setSoldAmount(Number(e.target.value))}
            />
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Current stock: <span className="text-slate-600">{batch.count} birds</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || batch.count === 0}
              className="w-full bg-huku-orange text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-orange-100 hover:bg-orange-600 transition active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Confirm Sale"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
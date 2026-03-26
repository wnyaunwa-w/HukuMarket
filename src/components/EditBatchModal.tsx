import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { Batch, updateBatch } from "@/lib/db-service";

interface EditBatchModalProps {
  batch: Batch;
  onClose: () => void;
}

export function EditBatchModal({ batch, onClose }: EditBatchModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    breed: batch.breed,
    count: batch.count,
    pricePerBird: batch.pricePerBird,
    location: batch.location,
    hatchDate: batch.hatchDate,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch.id) return;
    
    setLoading(true);
    try {
      // Pass the updated form data to the database
      await updateBatch(batch.id, {
        breed: formData.breed,
        count: Number(formData.count),
        pricePerBird: Number(formData.pricePerBird),
        location: formData.location,
        hatchDate: formData.hatchDate,
      });
      onClose(); // Close the modal on success
    } catch (error) {
      console.error(error);
      alert("Failed to update listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">Edit Listing</h2>
            <p className="text-sm font-medium text-slate-500">Update your batch details below.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shadow-sm border border-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Breed</label>
              <input type="text" required className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange font-bold text-slate-700"
                value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Total Birds</label>
              <input type="number" required min="1" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange font-bold text-slate-700"
                value={formData.count} onChange={e => setFormData({...formData, count: Number(e.target.value)})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Price ($)</label>
              <input type="number" step="0.01" required className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange font-bold text-slate-700"
                value={formData.pricePerBird} onChange={e => setFormData({...formData, pricePerBird: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Hatch Date</label>
              <input type="date" required className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange font-bold text-slate-700 text-sm"
                value={formData.hatchDate} onChange={e => setFormData({...formData, hatchDate: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Location</label>
            <input type="text" required className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange font-bold text-slate-700"
              value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full mt-2 bg-huku-orange text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-200">
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
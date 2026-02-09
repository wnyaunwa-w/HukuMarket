"use client";

import { useEffect, useState } from "react";
import { getAllAds, createAd, deleteAd, toggleAdStatus, Ad } from "@/lib/db-service";
import { Trash2, Plus, Power, ExternalLink, Image as ImageIcon, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdManager() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [newAd, setNewAd] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    ctaText: "Learn More",
    type: "dashboard_banner" as const,
    active: true
  });

  useEffect(() => {
    loadAds();
  }, []);

  async function loadAds() {
    setLoading(true);
    const data = await getAllAds();
    setAds(data);
    setLoading(false);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.title || !newAd.imageUrl) return alert("Title and Image are required");
    
    await createAd(newAd);
    setIsCreating(false);
    setNewAd({ title: "", description: "", imageUrl: "", link: "", ctaText: "Learn More", type: "dashboard_banner", active: true }); // Reset
    loadAds(); // Refresh list
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this ad?")) {
      await deleteAd(id);
      loadAds();
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleAdStatus(id, currentStatus);
    loadAds();
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <Link href="/dashboard" className="p-2 bg-white rounded-full border hover:bg-slate-50 transition">
               <ArrowLeft size={20} className="text-slate-600" />
             </Link>
             <div>
               <h1 className="text-3xl font-black text-slate-900">Ad Manager</h1>
               <p className="text-slate-500">Manage partner campaigns and revenue.</p>
             </div>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-huku-orange text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-200"
          >
            <Plus size={20} /> New Campaign
          </button>
        </div>

        {/* 📝 CREATE FORM (Conditional) */}
        {isCreating && (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="font-bold text-xl mb-6">Create New Ad</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Headline</label>
                  <input required type="text" placeholder="e.g. 10% Off Feed" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange" 
                    value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea required rows={3} placeholder="e.g. Buy 20 bags and get free delivery..." className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange"
                    value={newAd.description} onChange={e => setNewAd({...newAd, description: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Image URL</label>
                  <div className="flex gap-2">
                    <input required type="url" placeholder="https://..." className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange"
                      value={newAd.imageUrl} onChange={e => setNewAd({...newAd, imageUrl: e.target.value})} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Tip: Use an image from Unsplash or host it on imgur.com</p>
                </div>
                <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Target Link</label>
                      <input required type="url" placeholder="https://wa.me/..." className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange"
                        value={newAd.link} onChange={e => setNewAd({...newAd, link: e.target.value})} />
                   </div>
                   <div className="w-1/3">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Button Text</label>
                      <input required type="text" placeholder="Shop Now" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange"
                        value={newAd.ctaText} onChange={e => setNewAd({...newAd, ctaText: e.target.value})} />
                   </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t border-slate-50 pt-6">
                <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800">Create Campaign</button>
              </div>
            </form>
          </div>
        )}

        {/* 📊 ADS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className={`relative bg-white border-2 rounded-3xl overflow-hidden transition group ${!ad.active ? "opacity-60 grayscale border-slate-100" : "border-slate-100 hover:border-blue-100 hover:shadow-xl"}`}>
              
              {/* Status Badge */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-10 ${ad.active ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                {ad.active ? "Active" : "Inactive"}
              </div>

              {/* Actions Overlay */}
              <div className="absolute top-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   onClick={() => handleToggle(ad.id, ad.active)}
                   className="p-2 bg-white rounded-lg shadow-sm hover:bg-slate-50 text-slate-600"
                   title={ad.active ? "Pause Campaign" : "Activate Campaign"}
                 >
                   <Power size={16} className={ad.active ? "text-green-600" : "text-slate-400"} />
                 </button>
                 <button 
                   onClick={() => handleDelete(ad.id)}
                   className="p-2 bg-white rounded-lg shadow-sm hover:bg-red-50 text-red-500"
                   title="Delete"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>

              {/* Image Preview */}
              <div className="h-40 bg-slate-100 relative">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white font-bold flex items-center gap-1 text-xs">
                   <ImageIcon size={14} /> Banner Ad
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-slate-900 leading-tight mb-2 line-clamp-1">{ad.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{ad.description}</p>
                
                <a href={ad.link} target="_blank" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                  Test Link <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {ads.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 mb-4 font-bold">No ads found.</p>
            <button onClick={() => setIsCreating(true)} className="text-huku-orange font-bold hover:underline">Create your first campaign</button>
          </div>
        )}
      </div>
    </div>
  );
}
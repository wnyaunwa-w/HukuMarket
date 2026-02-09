"use client";

import { useEffect, useState } from "react";
import { getAllAds, createAd, deleteAd, toggleAdStatus, Ad, uploadAdAsset } from "@/lib/db-service";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Power, ExternalLink, Image as ImageIcon, Loader2, ArrowLeft, Upload, X, MessageCircle, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdManager() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Upload States
  const [uploading, setUploading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Form State
  const [newAd, setNewAd] = useState({
    title: "",
    description: "",
    imageUrl: "", 
    logoUrl: "",  
    link: "",
    ctaText: "Chat on WhatsApp",
    type: "dashboard_banner" as const,
    active: true,
    startDate: "", // 👈 New Date Fields
    endDate: ""
  });

  useEffect(() => {
    if (!loading && !currentUser) {
        router.push("/login"); 
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    loadAds();
  }, []);

  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [bannerPreview, logoPreview]);

  async function loadAds() {
    setLoading(true);
    const data = await getAllAds();
    setAds(data);
    setLoading(false);
  }

  const handleFileSelect = (file: File, type: 'banner' | 'logo') => {
    if (type === 'banner') {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    } else {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setNewAd({ 
        title: "", description: "", imageUrl: "", logoUrl: "", link: "", 
        ctaText: "Chat on WhatsApp", type: "dashboard_banner", active: true,
        startDate: "", endDate: "" 
    });
    setBannerFile(null);
    setLogoFile(null);
    setBannerPreview("");
    setLogoPreview("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAd.title || !newAd.description || !bannerFile || !logoFile) {
      alert("Please fill in required text fields and upload both banner and logo images.");
      return;
    }

    let cleanLink = newAd.link.trim();
    if (!cleanLink.startsWith("https://wa.me/")) {
        if(cleanLink.startsWith("263") || cleanLink.startsWith("+263")) {
             cleanLink = `https://wa.me/${cleanLink.replace('+', '')}`;
        } else {
             alert("The Target Link must be a valid WhatsApp URL starting with 'https://wa.me/'.");
             return;
        }
    }

    try {
      setUploading(true);

      const [bannerUrl, logoUrl] = await Promise.all([
        uploadAdAsset(bannerFile, 'banners'),
        uploadAdAsset(logoFile, 'logos')
      ]);
      
      await createAd({
        ...newAd,
        imageUrl: bannerUrl,
        logoUrl: logoUrl,
        link: cleanLink,
        // Save dates if provided, otherwise leave undefined (runs forever)
        startDate: newAd.startDate || undefined,
        endDate: newAd.endDate || undefined
      });

      resetForm();
      loadAds(); 
    } catch (error) {
        console.error(error);
        alert("Failed to upload images or create ad.");
    } finally {
      setUploading(false);
    }
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

  // Helper to check expiry status
  const getAdStatus = (ad: Ad) => {
    if (!ad.active) return { label: "Paused", color: "bg-slate-200 text-slate-500" };
    
    const now = new Date();
    if (ad.endDate && new Date(ad.endDate) < now) return { label: "Expired", color: "bg-red-100 text-red-600" };
    if (ad.startDate && new Date(ad.startDate) > now) return { label: "Scheduled", color: "bg-blue-100 text-blue-600" };
    
    return { label: "Active", color: "bg-green-500 text-white" };
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>;
  if (!currentUser) return null; 

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
          {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-huku-orange text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-200"
          >
            <Plus size={20} /> New Campaign
          </button>
          )}
        </div>

        {/* 📝 CREATE FORM */}
        {isCreating && (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 relative">
            {uploading && (
                <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center rounded-3xl">
                    <Loader2 className="animate-spin text-huku-orange mb-2" size={40} />
                    <p className="font-bold text-slate-600">Uploading Assets...</p>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="font-black text-2xl text-slate-900">Create New Ad</h2>
                <button onClick={resetForm} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Headline</label>
                  <input required type="text" placeholder="e.g. 10% Off Feed" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange font-bold text-slate-800" 
                    value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                  <textarea required rows={3} placeholder="e.g. Buy 20 bags..." className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange font-medium text-slate-600 resize-none"
                    value={newAd.description} onChange={e => setNewAd({...newAd, description: e.target.value})} />
                </div>

                {/* 🗓️ DATE RANGE PICKER */}
                <div className="flex gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Start Date</label>
                        <input type="date" className="w-full p-2 bg-white rounded-lg border border-blue-200 text-sm font-bold text-slate-700"
                        value={newAd.startDate} onChange={e => setNewAd({...newAd, startDate: e.target.value})} />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-blue-800 uppercase mb-2">End Date</label>
                        <input type="date" className="w-full p-2 bg-white rounded-lg border border-blue-200 text-sm font-bold text-slate-700"
                        value={newAd.endDate} onChange={e => setNewAd({...newAd, endDate: e.target.value})} />
                    </div>
                </div>

                 <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase mb-2">
                        <MessageCircle size={14} /> WhatsApp Target Link
                    </label>
                    <input required type="url" placeholder="https://wa.me/263..." className="w-full p-3 bg-green-50/50 rounded-xl border border-green-200 outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm text-green-800"
                    value={newAd.link} onChange={e => setNewAd({...newAd, link: e.target.value})} />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Button Text</label>
                    <input required type="text" placeholder="Chat on WhatsApp" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange font-bold"
                    value={newAd.ctaText} onChange={e => setNewAd({...newAd, ctaText: e.target.value})} />
                </div>
              </div>

              {/* RIGHT COLUMN - IMAGES */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Main Banner Image</label>
                  <div className="relative group">
                    <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'banner')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className={`h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center bg-slate-50 overflow-hidden ${bannerPreview ? 'border-huku-orange' : 'border-slate-300'}`}>
                        {bannerPreview ? <img src={bannerPreview} className="w-full h-full object-cover" /> : <Upload className="text-slate-400" />}
                    </div>
                  </div>
                </div>

                 <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Company Logo</label>
                  <div className="relative group w-24 h-24">
                      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'logo')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-slate-50 overflow-hidden ${logoPreview ? 'border-huku-orange' : 'border-slate-300'}`}>
                          {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" /> : <Upload className="text-slate-400" size={20} />}
                      </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2 flex justify-end">
                 <button type="submit" disabled={uploading} className="px-8 py-4 rounded-xl font-black bg-huku-orange text-white hover:bg-orange-600 transition shadow-lg flex items-center gap-2">
                    {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />} Create Campaign
                 </button>
              </div>
            </form>
          </div>
        )}

        {/* 📊 ADS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {ads.map((ad) => {
            const status = getAdStatus(ad);
            return (
            <div key={ad.id} className={`relative bg-white border-2 rounded-3xl overflow-hidden transition group ${!ad.active ? "opacity-60 grayscale border-slate-100" : "border-slate-100 hover:border-blue-100 hover:shadow-xl"}`}>
              
              {/* Status Badge */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-10 shadow-sm ${status.color}`}>
                {status.label}
              </div>

              {/* Actions Overlay */}
              <div className="absolute top-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleToggle(ad.id, ad.active)} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-slate-50 text-slate-600">
                   <Power size={16} />
                 </button>
                 <button onClick={() => handleDelete(ad.id)} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-red-50 text-red-500">
                   <Trash2 size={16} />
                 </button>
              </div>

              {/* Preview */}
              <div className="h-40 bg-slate-100 relative">
                {ad.imageUrl && <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white flex items-center gap-2">
                    {ad.logoUrl && <img src={ad.logoUrl} className="w-8 h-8 rounded-full border border-white/50 bg-white" />}
                    <h3 className="font-bold text-sm line-clamp-1">{ad.title}</h3>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                 <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <Calendar size={14} />
                    {ad.endDate ? `Ends: ${ad.endDate}` : "Run indefinitely"}
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{ad.ctaText}</span>
                    <a href={ad.link} target="_blank" className="text-xs font-bold text-green-600 hover:underline">Test Link ↗</a>
                 </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
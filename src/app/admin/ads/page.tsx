"use client";

import { useEffect, useState } from "react";
import { getAllAds, createAd, deleteAd, toggleAdStatus, Ad, uploadAdAsset } from "@/lib/db-service";
import { Trash2, Plus, Power, ExternalLink, Image as ImageIcon, Loader2, ArrowLeft, Upload, X, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdManager() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // 🆕 Upload States
  const [uploading, setUploading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  // Previews
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Form State
  const [newAd, setNewAd] = useState({
    title: "",
    description: "",
    imageUrl: "", // Will be set after upload
    logoUrl: "",  // Will be set after upload
    link: "",
    ctaText: "Chat on WhatsApp",
    type: "dashboard_banner" as const,
    active: true
  });

  useEffect(() => {
    loadAds();
  }, []);

  // Clean up object URLs to avoid memory leaks
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
    setNewAd({ title: "", description: "", imageUrl: "", logoUrl: "", link: "", ctaText: "Chat on WhatsApp", type: "dashboard_banner", active: true });
    setBannerFile(null);
    setLogoFile(null);
    setBannerPreview("");
    setLogoPreview("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Basic Validation
    if (!newAd.title || !newAd.description || !bannerFile || !logoFile) {
      alert("Please fill in required text fields and upload both banner and logo images.");
      return;
    }

    // 2. WhatsApp Validation
    // Remove whitespace and ensure it starts with the correct prefix
    let cleanLink = newAd.link.trim();
    if (!cleanLink.startsWith("https://wa.me/")) {
        //If they just typed a number (e.g. 26377...), help them out
        if(cleanLink.startsWith("263") || cleanLink.startsWith("+263")) {
             cleanLink = `https://wa.me/${cleanLink.replace('+', '')}`;
        } else {
             alert("The Target Link must be a valid WhatsApp URL starting with 'https://wa.me/' followed by the country code and phone number.");
             return;
        }
    }

    try {
      setUploading(true);

      // 3. Upload Images concurrently
      const [bannerUrl, logoUrl] = await Promise.all([
        uploadAdAsset(bannerFile, 'banners'),
        uploadAdAsset(logoFile, 'logos')
      ]);
      
      // 4. Create Ad in DB with resultant URLs
      await createAd({
        ...newAd,
        imageUrl: bannerUrl,
        logoUrl: logoUrl,
        link: cleanLink
      });

      resetForm();
      loadAds(); // Refresh list
    } catch (error) {
        console.error(error);
        alert("Failed to upload images or create ad. See console.");
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
          {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-huku-orange text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-200"
          >
            <Plus size={20} /> New Campaign
          </button>
          )}
        </div>

        {/* 📝 CREATE FORM (Conditional) */}
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
              
              {/* LEFT COLUMN - TEXT INPUTS */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Headline</label>
                  <input required type="text" placeholder="e.g. 10% Off Feed" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange font-bold text-slate-800" 
                    value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                  <textarea required rows={4} placeholder="e.g. Buy 20 bags and get free delivery..." className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange font-medium text-slate-600 resize-none"
                    value={newAd.description} onChange={e => setNewAd({...newAd, description: e.target.value})} />
                </div>

                {/* WhatsApp Link Input */}
                 <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase mb-2">
                        <MessageCircle size={14} /> WhatsApp Target Link
                    </label>
                    <input required type="url" placeholder="https://wa.me/263771234567" className="w-full p-3 bg-green-50/50 rounded-xl border border-green-200 outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm text-green-800 placeholder:text-green-300/70"
                    value={newAd.link} onChange={e => setNewAd({...newAd, link: e.target.value})} />
                    <p className="text-[10px] text-slate-400 mt-2">Must start with <code>https://wa.me/</code> followed by country code (no +) and number.</p>
                </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Button Text</label>
                    <input required type="text" placeholder="Chat on WhatsApp" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange font-bold"
                    value={newAd.ctaText} onChange={e => setNewAd({...newAd, ctaText: e.target.value})} />
                </div>
              </div>

              {/* RIGHT COLUMN - IMAGE UPLOADS */}
              <div className="space-y-6">
                
                {/* Banner Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Main Banner Image (Landscape)</label>
                  <div className="relative group">
                    <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'banner')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center bg-slate-50 overflow-hidden transition-all ${bannerPreview ? 'border-huku-orange' : 'border-slate-300 group-hover:border-huku-orange group-hover:bg-orange-50/50'}`}>
                        {bannerPreview ? (
                             <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <Upload className="text-slate-400 mb-2 group-hover:text-huku-orange transition-colors" size={30} />
                                <p className="text-sm text-slate-500 font-bold group-hover:text-huku-orange transition-colors">Click to upload banner</p>
                                <p className="text-xs text-slate-400">PNG, JPG, WEBP (Max 2MB)</p>
                            </>
                        )}
                    </div>
                  </div>
                </div>

                 {/* Logo Upload */}
                 <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Company Logo (Square/Circle)</label>
                  <div className="flex items-center gap-4">
                    <div className="relative group w-24 h-24 shrink-0">
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'logo')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center bg-slate-50 overflow-hidden transition-all ${logoPreview ? 'border-huku-orange' : 'border-slate-300 group-hover:border-huku-orange group-hover:bg-orange-50/50'}`}>
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Upload className="text-slate-400 group-hover:text-huku-orange transition-colors" size={20} />
                            )}
                        </div>
                    </div>
                    <div className="text-sm text-slate-500">
                        <p className="font-bold">Upload Partner Logo</p>
                        <p className="text-xs text-slate-400">Will be displayed next to the headline.</p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2 flex justify-end">
                 <button 
                    type="submit" 
                    disabled={uploading}
                    className="px-8 py-4 rounded-xl font-black bg-huku-orange text-white hover:bg-orange-600 transition shadow-lg shadow-orange-200/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                    Create & Publish Campaign
                 </button>
              </div>
            </form>
          </div>
        )}

        {/* 📊 ADS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {ads.map((ad) => (
            <div key={ad.id} className={`relative bg-white border-2 rounded-3xl overflow-hidden transition group ${!ad.active ? "opacity-60 grayscale border-slate-100" : "border-slate-100 hover:border-blue-100 hover:shadow-xl"}`}>
              
              {/* Status Badge */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-10 shadow-sm ${ad.active ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                {ad.active ? "Active" : "Inactive"}
              </div>

              {/* Actions Overlay */}
              <div className="absolute top-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   onClick={() => handleToggle(ad.id, ad.active)}
                   className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-slate-50 text-slate-600"
                   title={ad.active ? "Pause Campaign" : "Activate Campaign"}
                 >
                   <Power size={16} className={ad.active ? "text-green-600" : "text-slate-400"} />
                 </button>
                 <button 
                   onClick={() => handleDelete(ad.id)}
                   className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-red-50 text-red-500"
                   title="Delete"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>

              {/* Image Preview */}
              <div className="h-48 bg-slate-100 relative">
                {ad.imageUrl ? (
                     <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                
                {/* Logo & Title Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white flex items-center gap-3">
                    {ad.logoUrl && <img src={ad.logoUrl} className="w-10 h-10 rounded-full border-2 border-white/50 shadow-sm object-cover" />}
                    <div>
                         <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 block">Partner Offer</span>
                         <h3 className="font-black leading-tight line-clamp-1 text-lg">{ad.title}</h3>
                    </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10 leading-relaxed">{ad.description}</p>
                
                <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{ad.ctaText}</span>
                    <a href={ad.link} target="_blank" className="text-xs font-bold text-green-600 flex items-center gap-1 hover:underline bg-green-50 px-2 py-1 rounded-md">
                    Test WhatsApp <ExternalLink size={12} />
                    </a>
                </div>
               
              </div>
            </div>
          ))}
        </div>

        {ads.length === 0 && !loading && !isCreating && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 mb-4 font-bold">No ads found.</p>
            <button onClick={() => setIsCreating(true)} className="text-huku-orange font-bold hover:underline">Create your first campaign</button>
          </div>
        )}
      </div>
    </div>
  );
}
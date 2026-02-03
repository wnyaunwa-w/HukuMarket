"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile } from "@/lib/db-service";
import { Loader2, User, Phone, MapPin, Save, AlertCircle } from "lucide-react";

export function ForceProfileUpdateModal() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    city: "",
    suburb: ""
  });

  // 1. Check if profile is complete
  useEffect(() => {
    async function checkProfile() {
      if (!currentUser) return;
      
      const profile = await getUserProfile(currentUser.uid);
      
      // If profile is missing OR key fields are empty, show modal
      if (!profile || !profile.displayName || !profile.phoneNumber || !profile.city) {
        setIsOpen(true);
        // Pre-fill existing data if any
        if (profile) {
          setFormData({
            displayName: profile.displayName || "",
            phoneNumber: profile.phoneNumber || "",
            city: profile.city || "",
            suburb: profile.suburb || ""
          });
        }
      }
      setChecking(false);
    }
    checkProfile();
  }, [currentUser]);

  // 2. Handle Form Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    try {
      await updateUserProfile(currentUser.uid, formData);
      setIsOpen(false); // Unlock the screen
      alert("Welcome aboard! 🚀 Your profile is set.");
      window.location.reload(); // Refresh to update sidebar name
    } catch (error) {
      console.error(error);
      alert("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || checking) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center p-4 z-[100] backdrop-blur-md">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl border-t-4 border-orange-500 animate-in zoom-in-95 duration-300">
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Welcome to HukuMarket! 🐔</h2>
          <p className="text-slate-500 mt-2">To start selling or buying, we need a few details to verify your account.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Name / Farm Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" required placeholder="e.g. Tendai Dube"
                className="w-full pl-10 p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 ring-orange-100 outline-none"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="tel" required placeholder="+263..."
                className="w-full pl-10 p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 ring-orange-100 outline-none"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
              <input 
                type="text" required placeholder="Harare"
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 ring-orange-100 outline-none"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Suburb</label>
              <input 
                type="text" required placeholder="Ruwa"
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 ring-orange-100 outline-none"
                value={formData.suburb}
                onChange={(e) => setFormData({...formData, suburb: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Complete Setup
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
              <AlertCircle size={12}/> You cannot skip this step.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
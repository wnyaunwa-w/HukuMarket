"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile, uploadProfileImage } from "@/lib/db-service";
import { Loader2, Camera, Phone, User, Save, Building, CheckCircle2, MapPin } from "lucide-react";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false); // State for GPS button

  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    city: "",      // NEW
    suburb: "",    // NEW
    address: "",   // Keep for specific directions
    latitude: 0,   // NEW: For math/grouping
    longitude: 0,  // NEW: For math/grouping
    role: "SELLER",
    photoURL: ""
  });

  useEffect(() => {
    async function loadData() {
      if (currentUser) {
        const data = await getUserProfile(currentUser.uid);
        if (data) {
          setFormData({
            displayName: data.displayName || "",
            phoneNumber: data.phoneNumber || "",
            city: data.city || "",
            suburb: data.suburb || "",
            address: data.address || "",
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            role: data.role || "SELLER",
            photoURL: data.photoURL || ""
          });
        }
      }
      setFetching(false);
    }
    loadData();
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    
    try {
      await updateUserProfile(currentUser.uid, formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setImageLoading(true);
    try {
      const url = await uploadProfileImage(currentUser.uid, file);
      setFormData(prev => ({ ...prev, photoURL: url })); 
    } catch (error) {
      alert("Failed to upload image.");
    } finally {
      setImageLoading(false);
    }
  };

  // 📍 NEW: Function to get GPS Coordinates
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setGpsLoading(false);
        alert("Location pinned! 📍 We can now group you accurately.");
      },
      (error) => {
        setGpsLoading(false);
        alert("Unable to retrieve your location. Please allow location access.");
      }
    );
  };

  if (fetching) return <div className="p-10 text-slate-400">Loading profile...</div>;

  return (
    <div className="max-w-5xl mx-auto py-6 relative">
      
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right fade-in duration-300">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle2 size={24} className="text-white" />
            <div>
              <h4 className="font-bold">Success!</h4>
              <p className="text-green-100 text-sm">Your profile has been saved.</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
        <p className="text-slate-500">Manage your identity and business location.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Avatar */}
        <div className="md:col-span-1">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center">
            <div className="relative w-40 h-40 mb-6 group cursor-pointer">
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                {formData.photoURL ? (
                  <img src={formData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-slate-300" />
                )}
              </div>
              <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                <Camera className="text-white w-10 h-10" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">{formData.displayName || "New Farmer"}</h2>
            <p className="text-sm text-slate-500 mb-4 break-all px-4">{currentUser?.email}</p>
            <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase tracking-wider mb-6">
              {formData.role}
            </div>
            <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 text-sm font-bold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-2">
              {imageLoading ? <Loader2 className="animate-spin" size={16}/> : <Camera size={16}/>} Change Avatar
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Edit Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
            
            {/* Personal Details */}
            <div>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
                <User className="text-orange-600" size={22} />
                <h3 className="font-bold text-xl text-slate-800">Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                  <input type="text" required className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 outline-none" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                  <input type="tel" required className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 outline-none" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div>
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Building className="text-orange-600" size={22} />
                  <h3 className="font-bold text-xl text-slate-800">Exact Location</h3>
                </div>
                {/* 📍 GPS BUTTON */}
                <button 
                  type="button" 
                  onClick={handleGetLocation}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                >
                  {gpsLoading ? <Loader2 className="animate-spin" size={12}/> : <MapPin size={12}/>}
                  {formData.latitude ? "Update GPS Pin" : "Auto-Detect GPS"}
                </button>
              </div>

              {/* Show coordinates if pinned */}
              {formData.latitude !== 0 && (
                 <div className="mb-4 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} /> 
                    <span>GPS Location Pinned: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</span>
                 </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">City / Town</label>
                  <input type="text" placeholder="e.g. Harare" required className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 outline-none" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Suburb / Area</label>
                  <input type="text" placeholder="e.g. Ruwa, Mabelreign" required className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 outline-none" value={formData.suburb} onChange={(e) => setFormData({...formData, suburb: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Street Address / Directions</label>
                <textarea className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 outline-none h-24 resize-none" placeholder="e.g. Plot 45, turn left at the shops..." value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={loading} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-xl shadow-slate-200 hover:scale-105 active:scale-95">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Save Changes
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
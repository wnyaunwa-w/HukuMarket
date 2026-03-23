"use client";
import { useState, useEffect } from "react";
import { X, Phone, User, MapPin, Star, MessageSquare, Loader2 } from "lucide-react";
import { Batch, getUserProfile } from "@/lib/db-service"; 
import { useAuth } from "@/context/AuthContext";
import { ReviewModal } from "./ReviewModal"; 
import { ReviewsList } from "./ReviewsList"; 

interface ContactModalProps {
  batch: Batch;
  onClose: () => void;
}

export function ContactModal({ batch, onClose }: ContactModalProps) {
  const { currentUser } = useAuth();
  const [view, setView] = useState<"CONTACT" | "WRITE_REVIEW" | "READ_REVIEWS">("CONTACT");
  
  const [sellerPhone, setSellerPhone] = useState<string | null>(null);
  const [loadingPhone, setLoadingPhone] = useState(true);

  // 👈 UPDATED: Look for both 'phoneNumber' and 'phone' in the database
  useEffect(() => {
    async function fetchSellerData() {
      if (batch.userId) {
        try {
          const profile = await getUserProfile(batch.userId);
          // Check for 'phoneNumber' (Firebase default) or 'phone' (custom)
          const fetchedPhone = profile?.phoneNumber || profile?.phone;
          
          if (fetchedPhone) {
            setSellerPhone(fetchedPhone);
          }
        } catch (error) {
          console.error("Failed to fetch seller profile:", error);
        }
      }
      setLoadingPhone(false);
    }
    fetchSellerData();
  }, [batch.userId]);

  // 1. Show Write Review Form
  if (view === "WRITE_REVIEW" && currentUser) {
    return (
      <ReviewModal 
        farmerId={batch.userId} 
        reviewerId={currentUser.uid} 
        onClose={onClose} 
      />
    );
  }

  // 2. Show Read Reviews List
  if (view === "READ_REVIEWS") {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
          <ReviewsList farmerId={batch.userId} onBack={() => setView("CONTACT")} />
        </div>
      </div>
    );
  }

  // 📱 WhatsApp formatting helper
  let waLink = "#";
  let callLink = "#";
  
  if (sellerPhone) {
    // Remove spaces, plus signs, brackets, and dashes
    let cleanPhone = sellerPhone.replace(/[\s\+\-\(\)]/g, "");
    
    // If it's a local Zim number starting with 0, replace 0 with 263 for WhatsApp
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "263" + cleanPhone.substring(1);
    }
    
    waLink = `https://wa.me/${cleanPhone}`;
    callLink = `tel:${sellerPhone}`;
  }

  // 3. Default: Show Contact Details
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Contact Seller</h2>
          <p className="text-sm text-slate-500">Connect to buy this batch</p>
          
          <button 
            onClick={() => setView("READ_REVIEWS")}
            className="text-xs font-bold text-orange-600 hover:underline mt-2 flex items-center justify-center gap-1"
          >
            <Star size={12} fill="currentColor"/> See Seller Reviews
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <MapPin className="text-orange-500 shrink-0" size={20} />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Location</p>
              <p className="font-medium text-slate-700">{batch.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 min-h-[64px]">
            <Phone className="text-green-600 shrink-0" size={20} />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Phone / WhatsApp</p>
              {loadingPhone ? (
                 <Loader2 size={16} className="animate-spin text-slate-400 mt-1" />
              ) : (
                 <p className="font-medium text-slate-700">
                   {sellerPhone || "No phone provided"}
                 </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <a 
            href={callLink} 
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition ${
              !sellerPhone ? "bg-slate-200 text-slate-400 pointer-events-none" : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            <Phone size={18} /> Call
          </a>
          <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition ${
              !sellerPhone ? "bg-slate-200 text-slate-400 pointer-events-none" : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            WhatsApp
          </a>
        </div>

        {/* WRITE REVIEW BUTTON */}
        {currentUser && currentUser.uid !== batch.userId && (
          <button 
            onClick={() => setView("WRITE_REVIEW")}
            className="w-full py-3 bg-orange-50 text-orange-700 font-bold rounded-xl hover:bg-orange-100 transition flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} /> Write a Review
          </button>
        )}
      </div>
    </div>
  );
}
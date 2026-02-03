"use client";
import { useState } from "react";
import { X, Phone, User, MapPin, Star, MessageSquare } from "lucide-react";
import { Batch } from "@/lib/db-service";
import { useAuth } from "@/context/AuthContext";
import { ReviewModal } from "./ReviewModal"; 
import { ReviewsList } from "./ReviewsList"; // <--- Import the new list

interface ContactModalProps {
  batch: Batch;
  onClose: () => void;
}

export function ContactModal({ batch, onClose }: ContactModalProps) {
  const { currentUser } = useAuth();
  const [view, setView] = useState<"CONTACT" | "WRITE_REVIEW" | "READ_REVIEWS">("CONTACT");

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
          
          {/* LINK TO READ REVIEWS */}
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

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Phone className="text-green-600 shrink-0" size={20} />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Phone / WhatsApp</p>
              <p className="font-medium text-slate-700">+263 77 123 4567</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <a href="tel:+263771234567" className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">
            <Phone size={18} /> Call
          </a>
          <a href="https://wa.me/263771234567" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition">
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
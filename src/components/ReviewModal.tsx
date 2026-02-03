"use client";
import { useState } from "react";
import { addReview } from "@/lib/db-service";
import { Star, X } from "lucide-react";

interface ReviewModalProps {
  farmerId: string;
  reviewerId: string;
  onClose: () => void;
}

export function ReviewModal({ farmerId, reviewerId, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addReview(farmerId, reviewerId, rating, comment);
    setLoading(false);
    onClose();
    alert("Review submitted! Thanks for the feedback.");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><X size={20} /></button>
        
        <h2 className="text-xl font-bold mb-4">Rate this Farmer</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition ${star <= rating ? "text-orange-500 scale-110" : "text-slate-300"}`}
              >
                <Star size={32} fill="currentColor" />
              </button>
            ))}
          </div>

          <textarea 
            required
            placeholder="Was the chicken healthy? Was the farmer polite?"
            className="w-full p-3 border rounded-lg h-24"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold"
          >
            {loading ? "Posting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
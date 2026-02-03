"use client";
import { useEffect, useState } from "react";
import { getFarmerReviews } from "@/lib/db-service";
import { Star, User, Loader2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns"; // You might need to install this: npm install date-fns

interface ReviewsListProps {
  farmerId: string;
  onBack: () => void;
}

export function ReviewsList({ farmerId, onBack }: ReviewsListProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getFarmerReviews(farmerId);
      setReviews(data);
      setLoading(false);
    }
    load();
  }, [farmerId]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <h3 className="font-bold text-lg">Farmer Reviews</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl">
          <p>No reviews yet.</p>
          <p className="text-xs mt-1">Be the first to rate this farmer!</p>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
          {reviews.map((review, i) => (
            <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={12} 
                      fill={star <= review.rating ? "orange" : "none"} 
                      className={star <= review.rating ? "text-orange-500" : "text-slate-300"} 
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400">
                  {review.createdAt?.seconds 
                    ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() 
                    : 'Just now'}
                </span>
              </div>
              <p className="text-sm text-slate-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
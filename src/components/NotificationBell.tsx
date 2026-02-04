"use client";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFavoriteBatches } from "@/lib/db-service";
import { getGrowthStage } from "@/lib/chickenLogic";
import { Batch } from "@/lib/db-service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Assuming you have shadcn popover or use simple div

export function NotificationBell() {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState<Batch[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function checkAlerts() {
      if (!currentUser) return;
      const favorites = await getFavoriteBatches(currentUser.uid);
      
      // 🔔 THE LOGIC: Filter for batches ready in 5 days or less
      const urgent = favorites.filter(batch => {
        const { daysLeft } = getGrowthStage(batch.hatchDate);
        // Alert if it is ready within 5 days OR already ready (but not ancient history)
        return daysLeft <= 5 && daysLeft > -30; 
      });

      setAlerts(urgent);
    }
    checkAlerts();
  }, [currentUser]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 relative hover:bg-slate-100 rounded-full transition"
      >
        <Bell size={24} className="text-slate-600" />
        
        {/* Red Dot if Notifications exist */}
        {alerts.length > 0 && (
          <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-50 bg-slate-50/50">
            <h4 className="font-bold text-slate-800">Notifications</h4>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No alerts yet. <br/> Heart ❤️ a listing to get notified!
              </div>
            ) : (
              alerts.map((batch) => {
                 const { daysLeft } = getGrowthStage(batch.hatchDate);
                 return (
                   <div key={batch.id} className="p-4 border-b border-slate-50 hover:bg-orange-50 transition cursor-pointer">
                     <div className="flex justify-between items-start">
                       <h5 className="font-bold text-slate-800 text-sm">{batch.breed}</h5>
                       <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                         {daysLeft <= 0 ? "READY!" : `${daysLeft} days left`}
                       </span>
                     </div>
                     <p className="text-xs text-slate-500 mt-1">
                       Located in {batch.location}.
                     </p>
                   </div>
                 );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
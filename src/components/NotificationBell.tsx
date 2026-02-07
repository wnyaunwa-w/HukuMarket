"use client";

import { Bell } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFavoriteBatches, Batch } from "@/lib/db-service";
import { getGrowthStage } from "@/lib/chickenLogic";
import { useRouter } from "next/navigation"; // 👈 Import router

export function NotificationBell() {
  const { currentUser } = useAuth();
  const router = useRouter(); // 👈 Initialize router
  const [alerts, setAlerts] = useState<Batch[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkAlerts() {
      if (!currentUser) return;
      const favorites = await getFavoriteBatches(currentUser.uid);
      
      // 🔔 THE LOGIC: Filter for batches ready in 7 days or less
      const urgent = favorites.filter(batch => {
        const { daysLeft } = getGrowthStage(batch.hatchDate);
        // Alert if it is ready within 7 days OR already ready (but not ancient history)
        return daysLeft <= 7 && daysLeft > -30; 
      });

      setAlerts(urgent);
    }
    checkAlerts();
  }, [currentUser, isOpen]); // Refresh when opened

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🖱️ HANDLE CLICK: Navigate to listing
  const handleNotificationClick = (batchId: string | undefined) => {
    if (!batchId) return;
    setIsOpen(false);
    // Navigate to home with a query param to trigger the scroll
    router.push(`/?highlight=${batchId}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 relative hover:bg-slate-100 rounded-full transition-colors"
      >
        <Bell size={24} className="text-slate-600" />
        
        {/* Red Dot if Notifications exist */}
        {alerts.length > 0 && (
          <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm" />
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-slate-50 bg-slate-50/80 backdrop-blur-sm flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {alerts.length} New
            </span>
          </div>
          
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-400 text-sm mb-2">No alerts yet.</p>
                <p className="text-xs text-slate-300">Heart ❤️ a listing to get notified when chickens are ready!</p>
              </div>
            ) : (
              alerts.map((batch) => {
                 const { daysLeft } = getGrowthStage(batch.hatchDate);
                 return (
                   <div 
                     key={batch.id} 
                     onClick={() => handleNotificationClick(batch.id)} // 👈 Added Click Handler
                     className="p-4 border-b border-slate-50 hover:bg-orange-50 transition-colors cursor-pointer group relative"
                   >
                     <div className="flex justify-between items-start mb-1">
                       <h5 className="font-bold text-slate-800 text-sm line-clamp-1">{batch.breed}</h5>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${daysLeft <= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                         {daysLeft <= 0 ? "READY!" : `${daysLeft} days left`}
                       </span>
                     </div>
                     <p className="text-xs text-slate-500 line-clamp-1">
                       Located in <span className="font-medium text-slate-700">{batch.location}</span>
                     </p>
                     
                     {/* Hover Prompt */}
                     <p className="text-[10px] text-huku-orange font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                       View Listing →
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
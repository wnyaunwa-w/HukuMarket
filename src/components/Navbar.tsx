"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LayoutGrid, ShoppingBag, LogOut, PlusCircle } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";

export function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-1.5 font-black text-huku-orange shrink-0">
          <span className="text-2xl">🐔</span>
          {/* UPDATED: Removed 'hidden' class so text shows on mobile too. Added text-lg for mobile sizing. */}
          <span className="text-lg md:text-xl tracking-tight">HukuMarket</span>
        </Link>

        {/* Actions Section */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Market Link (Icon only on mobile to save space) */}
          <Link href="/" className="text-slate-500 hover:text-huku-orange flex items-center gap-1 font-medium transition-colors">
            <ShoppingBag size={20} />
            <span className="hidden md:inline">Market</span>
          </Link>

          {currentUser ? (
            <>
              {/* Notification Bell */}
              <div className="flex items-center">
                <NotificationBell />
              </div>

              {/* Dashboard Link */}
              <Link href="/dashboard" className="text-slate-600 hover:text-huku-orange flex items-center gap-2 font-medium transition-colors">
                <LayoutGrid size={20} />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              
              {/* Sell Button - Made slightly more compact on mobile */}
              <Link href="/dashboard/listings/new" className="flex items-center gap-1 bg-huku-orange text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold hover:bg-huku-orange/90 transition shadow-md shadow-huku-orange/20 whitespace-nowrap">
                <PlusCircle size={16} />
                <span>Sell</span>
              </Link>

              {/* Logout Button */}
              <button onClick={logout} className="ml-1 text-slate-400 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <Link 
                href="/login" 
                className="text-slate-600 font-bold hover:text-slate-900 px-2 text-sm md:text-base"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-huku-orange text-white px-4 py-2 md:px-6 rounded-full text-xs md:text-sm font-bold hover:bg-huku-orange/90 transition shadow-lg shadow-huku-orange/20 whitespace-nowrap"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
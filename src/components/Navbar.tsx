"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LayoutGrid, ShoppingBag, LogOut, PlusCircle } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell"; // 👈 1. Imported the Bell

export function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 font-black text-xl text-huku-orange">
          <span className="text-2xl">🐔</span>
          <span className="hidden sm:inline">HukuMarket</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-500 hover:text-huku-orange flex items-center gap-1 font-medium transition-colors">
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Market</span>
          </Link>

          {currentUser ? (
            <>
              {/* 🔔 2. Added Notification Bell here */}
              <div className="mr-1">
                <NotificationBell />
              </div>

              <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-huku-orange font-medium transition-colors">
                <LayoutGrid size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              
              <Link href="/dashboard/listings/new" className="flex items-center gap-2 bg-huku-orange text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-huku-orange/90 transition shadow-md shadow-huku-orange/20">
                <PlusCircle size={16} />
                <span>Sell</span>
              </Link>

              <button onClick={logout} className="ml-2 text-slate-400 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-slate-600 font-bold hover:text-slate-900 px-2"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-huku-orange text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-huku-orange/90 transition shadow-lg shadow-huku-orange/20"
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
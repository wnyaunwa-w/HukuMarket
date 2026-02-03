"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllBatches, getAllUsers, Batch } from "@/lib/db-service";
import { ShieldAlert, Trash2, Users, Bird, DollarSign, MapPin, Phone, Mail } from "lucide-react";

export default function SuperAdminPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"LISTINGS" | "USERS">("USERS");
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    async function load() {
      const [batchesData, usersData] = await Promise.all([
        getAllBatches(),
        getAllUsers()
      ]);
      setAllBatches(batchesData);
      setAllUsers(usersData);
      setLoading(false);
    }
    load();
  }, []);

  // Security Check
  if (currentUser?.email !== "wnyaunwa@gmail.com") {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <ShieldAlert size={64} className="mb-4" />
        <h1 className="text-3xl font-black">ACCESS DENIED</h1>
      </div>
    );
  }

  // Calculate Stats
  const totalBirds = allBatches.reduce((sum, b) => sum + b.count, 0);
  const activeSubs = allUsers.length;
  const subsFee = activeSubs * 5; // Example: Assuming $5/user revenue

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          Super Admin Console <span className="text-red-600 text-sm bg-red-100 px-3 py-1 rounded-full whitespace-nowrap">MASTER ACCESS</span>
        </h1>
        <p className="text-slate-500">Welcome back, Boss.</p>
      </div>

      {/* 📊 STEP 1: STATS CARDS (Already Mobile Responsive via grid-cols-1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
            <Bird size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Birds</p>
            <p className="text-3xl font-black text-slate-900">{totalBirds.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Active Subs</p>
            <p className="text-3xl font-black text-slate-900">{activeSubs}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Subs Fee (Est.)</p>
            <p className="text-3xl font-black text-slate-900">${subsFee}</p>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-4 border-b border-slate-200 mb-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("USERS")}
          className={`pb-3 px-2 font-bold text-sm transition whitespace-nowrap ${activeTab === "USERS" ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"}`}
        >
          User Database
        </button>
        <button 
          onClick={() => setActiveTab("LISTINGS")}
          className={`pb-3 px-2 font-bold text-sm transition whitespace-nowrap ${activeTab === "LISTINGS" ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"}`}
        >
          Market Listings
        </button>
      </div>

      {/* 📊 STEP 2: CONTENT AREA (Added Horizontal Scroll for Mobile) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* 1. USERS TAB */}
        {activeTab === "USERS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]"> {/* min-w prevents squishing */}
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Phone</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition text-sm">
                    <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        {user.photoURL && <img src={user.photoURL} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="whitespace-nowrap">{user.displayName || "Unknown"}</span>
                    </td>
                    <td className="p-4 text-slate-600">
                       <span className="flex items-center gap-2 whitespace-nowrap"><Mail size={14} className="text-slate-300"/> {user.email || "No Email"}</span>
                    </td>
                    <td className="p-4 text-slate-600 whitespace-nowrap">
                      <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-300"/> {user.city ? `${user.city}, ${user.suburb}` : user.address || "N/A"}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-600 whitespace-nowrap">
                      <span className="flex items-center gap-2"><Phone size={14} className="text-slate-300"/> {user.phoneNumber || "N/A"}</span>
                    </td>
                  </tr>
                ))}
                {allUsers.length === 0 && !loading && (
                   <tr><td colSpan={4} className="p-8 text-center text-slate-400">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. LISTINGS TAB */}
        {activeTab === "LISTINGS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]"> {/* min-w prevents squishing */}
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                  <th className="p-4">Breed</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {allBatches.map((batch) => (
                  <tr key={batch.id} className="border-b border-slate-100 hover:bg-slate-50 transition text-sm">
                    <td className="p-4 font-bold text-slate-800 whitespace-nowrap">{batch.breed}</td>
                    <td className="p-4 text-slate-600 whitespace-nowrap">{batch.location}</td>
                    <td className="p-4 font-bold text-slate-800">{batch.count}</td>
                    <td className="p-4">
                      <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { 
  Calculator, Activity, Calendar, DollarSign, 
  TrendingUp, AlertTriangle, Camera, Scale, Save
} from "lucide-react";

export default function ManagementTool() {
  const [activeTab, setActiveTab] = useState<"setup" | "log" | "performance">("setup");

  // Placeholder state for the UI
  const [flockName, setFlockName] = useState("");
  const [breed, setBreed] = useState("Broiler - Cobb 500");

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Huku Management 📊</h1>
        <p className="text-slate-500">Track your flock, manage costs, and calculate profits.</p>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab("setup")}
          className={`pb-3 font-bold px-2 transition whitespace-nowrap ${activeTab === 'setup' ? 'text-huku-orange border-b-2 border-huku-orange' : 'text-slate-400'}`}
        >
          1. Batch Setup & Costs
        </button>
        <button 
          onClick={() => setActiveTab("log")}
          className={`pb-3 font-bold px-2 transition whitespace-nowrap ${activeTab === 'log' ? 'text-huku-orange border-b-2 border-huku-orange' : 'text-slate-400'}`}
        >
          2. Daily Log
        </button>
        <button 
          onClick={() => setActiveTab("performance")}
          className={`pb-3 font-bold px-2 transition whitespace-nowrap ${activeTab === 'performance' ? 'text-huku-orange border-b-2 border-huku-orange' : 'text-slate-400'}`}
        >
          3. Performance & Profit
        </button>
      </div>

      {/* 🟢 TAB 1: SETUP & COSTS */}
      {activeTab === 'setup' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="text-blue-500" /> Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Batch Name / ID</label>
                <input type="text" placeholder="e.g., April Broilers" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-huku-orange" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Breed Type</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none">
                  <option>Broiler - Cobb 500</option>
                  <option>Broiler - Ross 308</option>
                  <option>Roadrunner (Sasso/Kuroiler)</option>
                  <option>Layers</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Date of Placement</label>
                <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Vaccination Schedule Start</label>
                <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <DollarSign className="text-green-500" /> Initial Capital & Costs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Cost of Chicks ($)</label>
                <input type="number" placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Cost of Feed (Total Est.)</label>
                <input type="number" placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Heating (Charcoal/Elec)</label>
                <input type="number" placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Bedding (Shavings/Hay)</label>
                <input type="number" placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Cost of Labour</label>
                <input type="number" placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
              </div>
            </div>
            <button className="mt-6 w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800">
              <Save size={18} /> Save Setup
            </button>
          </div>
        </div>
      )}

      {/* 🔴 TAB 2: DAILY LOG */}
      {activeTab === 'log' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="text-orange-500" /> Today's Log
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Feed & Weight */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Feed Stage</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none">
                    <option>Starter</option>
                    <option>Grower</option>
                    <option>Finisher</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Scale size={14} /> Weekly Sample Weight (grams)
                  </label>
                  <input type="number" placeholder="e.g., 1200" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
                  <p className="text-[10px] text-slate-400 mt-1">Weigh 5 random birds and enter the average.</p>
                </div>
              </div>

              {/* Right Column: Mortality */}
              <div className="space-y-4 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                <div>
                  <label className="text-xs font-bold text-red-800 uppercase flex items-center gap-2">
                    <AlertTriangle size={14} /> Daily Mortality Count
                  </label>
                  <input type="number" placeholder="0" className="w-full p-3 bg-white border border-red-200 rounded-xl mt-1 outline-none text-red-600 font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-red-800 uppercase flex items-center gap-2">
                    <Camera size={14} /> Mortality Photo Evidence
                  </label>
                  <button className="w-full mt-1 p-4 border-2 border-dashed border-red-200 rounded-xl text-red-400 bg-white hover:bg-red-50 flex flex-col items-center justify-center gap-2 transition">
                    <Camera size={24} />
                    <span className="text-xs font-bold">Tap to upload photo</span>
                  </button>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full bg-huku-orange text-white px-6 py-4 rounded-xl font-bold shadow-md hover:bg-orange-600 transition flex items-center justify-center gap-2">
              <Save size={18} /> Submit Daily Record
            </button>
          </div>
        </div>
      )}

      {/* 📈 TAB 3: PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <p className="text-[10px] text-slate-500 font-bold uppercase">Mortality Rate</p>
               <h3 className="text-2xl font-black text-red-500">4.2%</h3>
               <p className="text-[10px] text-slate-400 mt-1">Target: &lt; 5%</p>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <p className="text-[10px] text-slate-500 font-bold uppercase">Feed Conversion (FCR)</p>
               <h3 className="text-2xl font-black text-blue-500">1.65</h3>
               <p className="text-[10px] text-slate-400 mt-1">Excellent efficiency</p>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <p className="text-[10px] text-slate-500 font-bold uppercase">Total Input Costs</p>
               <h3 className="text-2xl font-black text-slate-800">$450.00</h3>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/30">
               <p className="text-[10px] text-emerald-600 font-bold uppercase">Est. Net Profit</p>
               <h3 className="text-2xl font-black text-emerald-600">$210.00</h3>
             </div>
          </div>

          {/* Calculator Tool */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Calculator className="text-slate-500" /> Profitability Calculator
            </h2>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-600 mb-4">
                Enter your expected selling price per bird to calculate your final margins.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="number" placeholder="Selling Price ($)" className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-huku-orange" />
                <button className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition">
                  Calculate
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
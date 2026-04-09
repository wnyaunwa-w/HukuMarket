"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createFlock, getActiveFlock, addDailyLog, getFlockLogs } from "@/lib/db-service";
import { 
  Calculator, Activity, Calendar, DollarSign, 
  TrendingUp, AlertTriangle, Camera, Scale, Save, Loader2, CheckCircle
} from "lucide-react";

export default function ManagementTool() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"setup" | "log" | "performance">("setup");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active Flock Data
  const [currentFlock, setCurrentFlock] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  // Setup Form State
  const [setupData, setSetupData] = useState({
    name: "",
    breed: "Broiler - Cobb 500",
    placementDate: "",
    vaccineStart: "",
    numChicks: "", // CRITICAL for math
    costChicks: "",
    costFeed: "",
    costHeating: "",
    costBedding: "",
    costLabour: ""
  });

  // Daily Log Form State
  const [logData, setLogData] = useState({
    feedStage: "Starter",
    sampleWeight: "",
    mortalityCount: ""
  });

  // Profit Calculator State
  const [sellingPrice, setSellingPrice] = useState("");
  const [estProfit, setEstProfit] = useState<number | null>(null);

  // Load existing data when page opens
  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      const flock = await getActiveFlock(currentUser.uid);
      if (flock) {
        setCurrentFlock(flock);
        const flockLogs = await getFlockLogs(flock.id);
        setLogs(flockLogs);
        setActiveTab("log"); // Jump straight to logging if they have a flock
      }
      setLoading(false);
    }
    loadData();
  }, [currentUser]);

  // Handle saving the Setup Tab
  const handleSaveSetup = async () => {
    if (!currentUser) return;
    if (!setupData.name || !setupData.numChicks) return alert("Please enter Batch Name and Number of Chicks");
    
    setSaving(true);
    try {
      const numericData = {
        ...setupData,
        numChicks: Number(setupData.numChicks),
        costChicks: Number(setupData.costChicks || 0),
        costFeed: Number(setupData.costFeed || 0),
        costHeating: Number(setupData.costHeating || 0),
        costBedding: Number(setupData.costBedding || 0),
        costLabour: Number(setupData.costLabour || 0),
      };
      
      const newFlock = await createFlock(currentUser.uid, numericData);
      setCurrentFlock(newFlock);
      setActiveTab("log");
      alert("Batch setup successfully! Now you can start logging daily.");
    } catch (error) {
      alert("Failed to save setup.");
    } finally {
      setSaving(false);
    }
  };

  // Handle saving the Daily Log
  const handleSaveLog = async () => {
    if (!currentFlock) return alert("Please setup your batch first!");
    setSaving(true);
    try {
      const numericLog = {
        ...logData,
        sampleWeight: Number(logData.sampleWeight || 0),
        mortalityCount: Number(logData.mortalityCount || 0),
      };
      await addDailyLog(currentFlock.id, numericLog);
      
      // Refresh logs
      const flockLogs = await getFlockLogs(currentFlock.id);
      setLogs(flockLogs);
      
      // Reset form
      setLogData({ feedStage: "Starter", sampleWeight: "", mortalityCount: "" });
      alert("Daily record saved!");
    } catch (error) {
      alert("Failed to save log.");
    } finally {
      setSaving(false);
    }
  };

  // --- THE REAL-TIME MATH ---
  const totalInputCosts = currentFlock ? (currentFlock.costChicks + currentFlock.costFeed + currentFlock.costHeating + currentFlock.costBedding + currentFlock.costLabour) : 0;
  const totalMortality = logs.reduce((sum, log) => sum + log.mortalityCount, 0);
  const initialChicks = currentFlock?.numChicks || 1;
  const mortalityRate = ((totalMortality / initialChicks) * 100).toFixed(1);
  const survivingBirds = initialChicks - totalMortality;

  const handleCalculateProfit = () => {
    const price = Number(sellingPrice);
    if (!price || !currentFlock) return;
    const revenue = survivingBirds * price;
    setEstProfit(revenue - totalInputCosts);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>;

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
          disabled={!currentFlock}
          className={`pb-3 font-bold px-2 transition whitespace-nowrap disabled:opacity-50 ${activeTab === 'log' ? 'text-huku-orange border-b-2 border-huku-orange' : 'text-slate-400'}`}
        >
          2. Daily Log
        </button>
        <button 
          onClick={() => setActiveTab("performance")}
          disabled={!currentFlock}
          className={`pb-3 font-bold px-2 transition whitespace-nowrap disabled:opacity-50 ${activeTab === 'performance' ? 'text-huku-orange border-b-2 border-huku-orange' : 'text-slate-400'}`}
        >
          3. Performance & Profit
        </button>
      </div>

      {/* 🟢 TAB 1: SETUP & COSTS */}
      {activeTab === 'setup' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {currentFlock && (
            <div className="bg-green-50 p-4 rounded-2xl border border-green-200 flex items-center gap-3 text-green-700">
              <CheckCircle size={20} />
              <div>
                <p className="font-bold">Active Batch: {currentFlock.name}</p>
                <p className="text-sm">You are currently tracking this batch. Complete it to start a new one.</p>
              </div>
            </div>
          )}

          <div className={`space-y-6 ${currentFlock ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="text-blue-500" /> Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Batch Name / ID *</label>
                  <input type="text" value={setupData.name} onChange={e => setSetupData({...setupData, name: e.target.value})} placeholder="e.g., April Broilers" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-huku-orange" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Breed Type</label>
                  <select value={setupData.breed} onChange={e => setSetupData({...setupData, breed: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none">
                    <option>Broiler - Cobb 500</option>
                    <option>Broiler - Ross 308</option>
                    <option>Roadrunner (Sasso/Kuroiler)</option>
                    <option>Layers</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Number of Chicks *</label>
                  <input type="number" value={setupData.numChicks} onChange={e => setSetupData({...setupData, numChicks: e.target.value})} placeholder="e.g. 500" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Date of Placement</label>
                  <input type="date" value={setupData.placementDate} onChange={e => setSetupData({...setupData, placementDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Vaccination Schedule Start</label>
                  <input type="date" value={setupData.vaccineStart} onChange={e => setSetupData({...setupData, vaccineStart: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
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
                  <input type="number" value={setupData.costChicks} onChange={e => setSetupData({...setupData, costChicks: e.target.value})} placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Cost of Feed (Total Est.)</label>
                  <input type="number" value={setupData.costFeed} onChange={e => setSetupData({...setupData, costFeed: e.target.value})} placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Heating (Charcoal/Elec)</label>
                  <input type="number" value={setupData.costHeating} onChange={e => setSetupData({...setupData, costHeating: e.target.value})} placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Bedding (Shavings/Hay)</label>
                  <input type="number" value={setupData.costBedding} onChange={e => setSetupData({...setupData, costBedding: e.target.value})} placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Cost of Labour</label>
                  <input type="number" value={setupData.costLabour} onChange={e => setSetupData({...setupData, costLabour: e.target.value})} placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
                </div>
              </div>
              {!currentFlock && (
                <button onClick={handleSaveSetup} disabled={saving} className="mt-6 w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50">
                  {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save & Start Tracking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🔴 TAB 2: DAILY LOG */}
      {activeTab === 'log' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Activity className="text-orange-500" /> Today's Log
              </h2>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">Day {logs.length + 1}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Feed & Weight */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Feed Stage</label>
                  <select value={logData.feedStage} onChange={e => setLogData({...logData, feedStage: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none">
                    <option>Starter</option>
                    <option>Grower</option>
                    <option>Finisher</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Scale size={14} /> Weekly Sample Weight (grams)
                  </label>
                  <input type="number" value={logData.sampleWeight} onChange={e => setLogData({...logData, sampleWeight: e.target.value})} placeholder="e.g., 1200" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none" />
                  <p className="text-[10px] text-slate-400 mt-1">Weigh 5 random birds and enter the average.</p>
                </div>
              </div>

              {/* Right Column: Mortality */}
              <div className="space-y-4 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                <div>
                  <label className="text-xs font-bold text-red-800 uppercase flex items-center gap-2">
                    <AlertTriangle size={14} /> Daily Mortality Count
                  </label>
                  <input type="number" value={logData.mortalityCount} onChange={e => setLogData({...logData, mortalityCount: e.target.value})} placeholder="0" className="w-full p-3 bg-white border border-red-200 rounded-xl mt-1 outline-none text-red-600 font-bold" />
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

            <button onClick={handleSaveLog} disabled={saving} className="mt-6 w-full bg-huku-orange text-white px-6 py-4 rounded-xl font-bold shadow-md hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Submit Daily Record
            </button>
          </div>
          
          {/* Recent Logs Preview */}
          {logs.length > 0 && (
             <div className="text-sm text-slate-500 pl-2">
               <p className="font-bold mb-2">Recent Logs:</p>
               <div className="flex flex-wrap gap-2">
                 {logs.slice(-3).map((log, i) => (
                   <span key={i} className="bg-slate-200/50 px-2 py-1 rounded-md text-xs">
                     {new Date(log.timestamp).toLocaleDateString()}: {log.mortalityCount} dead, {log.feedStage}
                   </span>
                 ))}
               </div>
             </div>
          )}
        </div>
      )}

      {/* 📈 TAB 3: PERFORMANCE */}
      {activeTab === 'performance' && currentFlock && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <p className="text-[10px] text-slate-500 font-bold uppercase">Mortality Rate</p>
               <h3 className="text-2xl font-black text-red-500">{mortalityRate}%</h3>
               <p className="text-[10px] text-slate-400 mt-1">{totalMortality} / {initialChicks} birds lost</p>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <p className="text-[10px] text-slate-500 font-bold uppercase">Surviving Birds</p>
               <h3 className="text-2xl font-black text-blue-500">{survivingBirds}</h3>
               <p className="text-[10px] text-slate-400 mt-1">Ready for market</p>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <p className="text-[10px] text-slate-500 font-bold uppercase">Total Input Costs</p>
               <h3 className="text-2xl font-black text-slate-800">${totalInputCosts.toFixed(2)}</h3>
               <p className="text-[10px] text-slate-400 mt-1">Setup & Feed</p>
             </div>
             <div className={`p-5 rounded-2xl border shadow-sm ${estProfit !== null && estProfit >= 0 ? 'bg-emerald-50/30 border-emerald-200' : (estProfit !== null ? 'bg-red-50/30 border-red-200' : 'bg-white border-slate-200')}`}>
               <p className={`text-[10px] font-bold uppercase ${estProfit !== null && estProfit >= 0 ? 'text-emerald-600' : (estProfit !== null ? 'text-red-600' : 'text-slate-500')}`}>Est. Net Profit</p>
               <h3 className={`text-2xl font-black ${estProfit !== null && estProfit >= 0 ? 'text-emerald-600' : (estProfit !== null ? 'text-red-600' : 'text-slate-800')}`}>
                 {estProfit !== null ? `$${estProfit.toFixed(2)}` : "--"}
               </h3>
               <p className="text-[10px] text-slate-400 mt-1">Based on calc below</p>
             </div>
          </div>

          {/* Calculator Tool */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Calculator className="text-slate-500" /> Profitability Calculator
            </h2>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-600 mb-4">
                Enter your expected selling price per bird (for your <strong>{survivingBirds}</strong> surviving birds) to calculate your final margins.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="number" 
                  value={sellingPrice}
                  onChange={e => setSellingPrice(e.target.value)}
                  placeholder="Selling Price ($)" 
                  className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-huku-orange" 
                />
                <button onClick={handleCalculateProfit} className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition">
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
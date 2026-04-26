"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { createFlock, updateFlock, getActiveFlocks, addDailyLog, getFlockLogs, uploadMortalityPhoto } from "@/lib/db-service";
import { 
  Calculator, Activity, Calendar, DollarSign, 
  AlertTriangle, Camera, Scale, Save, Loader2, 
  CheckCircle, Share2, Plus, Bird, Clock 
} from "lucide-react";

// 🕒 NEW: Maturity Progress Card Component
function MaturityCard({ placementDate, breed = "Broiler" }: { placementDate: string, breed?: string }) {
  if (!placementDate) return null;

  // Standard target maturity days
  const targetDays = breed.toLowerCase().includes("roadrunner") ? 120 : 42; 
  
  // Calculate current age
  const placement = new Date(placementDate);
  const today = new Date();
  const diffTime = today.getTime() - placement.getTime();
  const currentAgeDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  
  // Calculate remaining days and progress
  const daysLeft = Math.max(0, targetDays - currentAgeDays);
  const progressPercent = Math.min(100, (currentAgeDays / targetDays) * 100);
  const isReady = daysLeft === 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-5 text-huku-orange">
        <Clock size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={16} className="text-slate-400" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Growth Tracker</p>
        </div>
        
        <div className="flex items-baseline gap-2 mb-4">
          <h3 className="text-4xl font-black text-slate-800">Day {currentAgeDays}</h3>
          <p className="text-slate-500 font-medium">of {targetDays} days</p>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
          <div 
            className={`h-full transition-all duration-1000 rounded-full ${
              isReady ? 'bg-green-500' : 'bg-huku-orange'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {isReady ? (
          <div className="flex items-center gap-2 text-green-700 font-bold bg-green-50 p-3 rounded-xl border border-green-100 mt-4">
            <CheckCircle size={20} />
            <span>Market Ready! Time to list these birds.</span>
          </div>
        ) : (
          <p className="text-sm font-bold text-slate-600">
            <span className="text-huku-orange">{daysLeft} days</span> until market ready
          </p>
        )}
      </div>
    </div>
  );
}

export default function ManagementTool() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"setup" | "log" | "performance">("setup");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Multi-Flock State
  const [activeFlocks, setActiveFlocks] = useState<any[]>([]);
  const [selectedFlockId, setSelectedFlockId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  // Form States
  const defaultSetup = {
    name: "", breed: "Broiler - Cobb 500", placementDate: "", vaccineStart: "", 
    numChicks: "", costChicks: "", costFeed: "", costHeating: "", costBedding: "", costLabour: ""
  };
  const [setupData, setSetupData] = useState(defaultSetup);

  const defaultLog = {
    feedStage: "Starter", feedQuantity: "", sampleWeight: "", mortalityCount: "", hasPhotoEvidence: false, photoUrl: ""
  };
  const [logData, setLogData] = useState(defaultLog);

  // Photo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [sellingPrice, setSellingPrice] = useState("");
  const [estProfit, setEstProfit] = useState<number | null>(null);

  // Load Flocks
  useEffect(() => {
    async function initData() {
      if (!currentUser) return;
      const flocks = await getActiveFlocks(currentUser.uid);
      setActiveFlocks(flocks);
      if (flocks.length > 0) {
        handleSelectFlock(flocks[0].id, flocks);
      } else {
        setLoading(false);
      }
    }
    initData();
  }, [currentUser]);

  // Handle Switching Flocks
  const handleSelectFlock = async (flockId: string, flocksList = activeFlocks) => {
    setLoading(true);
    setSelectedFlockId(flockId);
    
    const flock = flocksList.find(f => f.id === flockId);
    if (flock) {
      setSetupData({
        name: flock.name || "", breed: flock.breed || "Broiler - Cobb 500", 
        placementDate: flock.placementDate || "", vaccineStart: flock.vaccineStart || "",
        numChicks: flock.numChicks?.toString() || "", costChicks: flock.costChicks?.toString() || "",
        costFeed: flock.costFeed?.toString() || "", costHeating: flock.costHeating?.toString() || "",
        costBedding: flock.costBedding?.toString() || "", costLabour: flock.costLabour?.toString() || ""
      });

      const flockLogs = await getFlockLogs(flock.id);
      setLogs(flockLogs);
      setActiveTab("log");
    }
    setLoading(false);
  };

  const handleCreateNewBatch = () => {
    setSelectedFlockId(null);
    setSetupData(defaultSetup);
    setLogs([]);
    setActiveTab("setup");
  };

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
      
      if (selectedFlockId) {
        await updateFlock(selectedFlockId, numericData);
        setActiveFlocks(activeFlocks.map(f => f.id === selectedFlockId ? { ...f, ...numericData } : f));
        alert("Batch details updated!");
      } else {
        const newFlock = await createFlock(currentUser.uid, numericData);
        setActiveFlocks([...activeFlocks, newFlock]);
        setSelectedFlockId(newFlock.id);
        alert("New Batch created! You can now log daily data.");
      }
      setActiveTab("log");
    } catch (error) {
      alert("Failed to save batch.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFlockId) return;

    setUploadingImage(true);
    try {
      const url = await uploadMortalityPhoto(file, selectedFlockId);
      setLogData({ ...logData, photoUrl: url, hasPhotoEvidence: true });
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please check your connection and try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveLog = async () => {
    if (!selectedFlockId) return alert("Please select a batch first!");
    if (!logData.feedQuantity) return alert("Please enter the daily feed consumed.");
    
    setSaving(true);
    try {
      const numericLog = {
        ...logData,
        feedQuantity: Number(logData.feedQuantity || 0),
        sampleWeight: Number(logData.sampleWeight || 0),
        mortalityCount: Number(logData.mortalityCount || 0),
      };
      await addDailyLog(selectedFlockId, numericLog);
      
      const updatedLogs = await getFlockLogs(selectedFlockId);
      setLogs(updatedLogs);
      
      if (confirm("Daily record saved! Would you like to share this report via WhatsApp?")) {
        shareToWhatsApp(numericLog, updatedLogs.length);
      }
      
      setLogData(defaultLog);
    } catch (error) {
      alert("Failed to save log.");
    } finally {
      setSaving(false);
    }
  };

  const shareToWhatsApp = (log: any, currentDay: number) => {
    const flock = activeFlocks.find(f => f.id === selectedFlockId);
    if (!flock) return;

    const photoNote = log.photoUrl ? `\n*Photo Evidence:* ${log.photoUrl}` : "";
    
    const text = `🐔 *Daily Farm Report*\nBatch: ${flock.name}\nDay: ${currentDay}\n\n*Mortality:* ${log.mortalityCount}${photoNote}\n*Feed Stage:* ${log.feedStage}\n*Feed Consumed:* ${log.feedQuantity}kg\n*Avg Weight:* ${log.sampleWeight}g\n\n_Sent via HukuMarket Management_`;

    if (navigator.share) {
      navigator.share({ title: 'Farm Report', text: text }).catch(console.error);
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const currentFlock = activeFlocks.find(f => f.id === selectedFlockId);
  const totalInputCosts = currentFlock ? (currentFlock.costChicks + currentFlock.costFeed + currentFlock.costHeating + currentFlock.costBedding + currentFlock.costLabour) : 0;
  const totalMortality = logs.reduce((sum, log) => sum + (log.mortalityCount || 0), 0);
  const totalFeedKg = logs.reduce((sum, log) => sum + (log.feedQuantity || 0), 0);
  const initialChicks = currentFlock?.numChicks || 1;
  const mortalityRate = ((totalMortality / initialChicks) * 100).toFixed(1);
  const survivingBirds = initialChicks - totalMortality;

  const latestWeightGrams = logs.length > 0 ? logs[logs.length - 1].sampleWeight : 0;
  const latestWeightKg = latestWeightGrams / 1000;
  const estTotalWeightGain = survivingBirds * latestWeightKg;
  const currentFCR = estTotalWeightGain > 0 ? (totalFeedKg / estTotalWeightGain).toFixed(2) : "0.00";

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      <div>
        <h1 className="text-3xl font-black text-slate-900">Huku Management 📊</h1>
        <p className="text-slate-500">Track your flock, manage costs, and calculate profits.</p>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {activeFlocks.map(flock => (
          <button 
            key={flock.id}
            onClick={() => handleSelectFlock(flock.id)}
            className={`flex flex-col text-left px-4 py-3 rounded-2xl border-2 transition min-w-[160px] ${
              selectedFlockId === flock.id 
              ? 'border-huku-orange bg-orange-50' 
              : 'border-slate-200 bg-white hover:border-orange-200'
            }`}
          >
            <span className="font-bold text-slate-800 text-sm truncate">{flock.name}</span>
            <span className="text-[10px] text-slate-500 uppercase font-medium">{flock.numChicks} Birds • {flock.breed.split('-')[0]}</span>
          </button>
        ))}
        
        <button 
          onClick={handleCreateNewBatch}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed transition whitespace-nowrap h-[68px] ${
            !selectedFlockId && activeFlocks.length > 0 ? 'border-huku-orange text-huku-orange bg-orange-50' : 'border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <Plus size={18} /> <span className="font-bold text-sm">New Batch</span>
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto hide-scrollbar mt-4">
        <button onClick={() => setActiveTab("setup")} className={`pb-3 font-bold px-2 transition whitespace-nowrap ${activeTab === 'setup' ? 'text-huku-orange border-b-2 border-huku-orange' : 'text-slate-400'}`}>
          1. Batch Setup
        </button>
        <button onClick={() => setActiveTab("log")} disabled={!selectedFlockId} className={`pb-3 font-bold px-2 transition whitespace-nowrap disabled:opacity-50 ${activeTab === 'log' ? 'text-huku-orange border-b-2 border-huku-orange' : 'text-slate-400'}`}>
          2. Daily Log
        </button>
        <button onClick={() => setActiveTab("performance")} disabled={!selectedFlockId} className={`pb-3 font-bold px-2 transition whitespace-nowrap disabled:opacity-50 ${activeTab === 'performance' ? 'text-huku-orange border-b-2 border-huku-orange' : 'text-slate-400'}`}>
          3. Performance
        </button>
      </div>

      {/* 🟢 TAB 1: SETUP */}
      {activeTab === 'setup' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="text-blue-500" /> Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Batch Name / ID *</label>
                <input type="text" value={setupData.name} onChange={e => setSetupData({...setupData, name: e.target.value})} placeholder="e.g., April Broilers" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-huku-orange" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Breed Type</label>
                <select value={setupData.breed} onChange={e => setSetupData({...setupData, breed: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-huku-orange">
                  <option>Broiler - Cobb 500</option>
                  <option>Broiler - Ross 308</option>
                  <option>Roadrunner (Sasso/Kuroiler)</option>
                  <option>Layers</option>
                  <option>Other</option>
                </select>
              </div>
              {/* 📅 NEW: Placement Date Input */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Placement Date *</label>
                <input type="date" value={setupData.placementDate} onChange={e => setSetupData({...setupData, placementDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-huku-orange" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Number of Chicks *</label>
                <input type="number" value={setupData.numChicks} onChange={e => setSetupData({...setupData, numChicks: e.target.value})} placeholder="e.g. 500" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-huku-orange" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <DollarSign className="text-green-500" /> Initial Capital & Costs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Cost of Chicks ($)</label>
                <input type="number" value={setupData.costChicks} onChange={e => setSetupData({...setupData, costChicks: e.target.value})} placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-huku-orange" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Est. Cost of Feed</label>
                <input type="number" value={setupData.costFeed} onChange={e => setSetupData({...setupData, costFeed: e.target.value})} placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-huku-orange" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Heating & Bedding</label>
                <input type="number" value={setupData.costHeating} onChange={e => setSetupData({...setupData, costHeating: e.target.value})} placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-huku-orange" />
              </div>
            </div>
            
            <button onClick={handleSaveSetup} disabled={saving} className="mt-6 w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} 
              {selectedFlockId ? "Update Batch Details" : "Save & Start Tracking"}
            </button>
          </div>
        </div>
      )}

      {/* 🔴 TAB 2: DAILY LOG */}
      {activeTab === 'log' && currentFlock && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          
          {/* 🕒 NEW: The Maturity Progress Card */}
          <MaturityCard placementDate={currentFlock.placementDate} breed={currentFlock.breed} />

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Activity className="text-orange-500" /> Today's Log ({currentFlock.name})
              </h2>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">Day {logs.length + 1}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feed & Weight */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Feed Stage</label>
                    <select value={logData.feedStage} onChange={e => setLogData({...logData, feedStage: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-huku-orange">
                      <option>Starter</option><option>Grower</option><option>Finisher</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Consumed (kg) *</label>
                    <input type="number" value={logData.feedQuantity} onChange={e => setLogData({...logData, feedQuantity: e.target.value})} placeholder="e.g. 50" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-huku-orange" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Scale size={14} /> Weekly Sample Weight (grams)
                  </label>
                  <input type="number" value={logData.sampleWeight} onChange={e => setLogData({...logData, sampleWeight: e.target.value})} placeholder="e.g., 1200" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-huku-orange" />
                </div>
              </div>

              {/* Mortality */}
              <div className="space-y-4 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                <div>
                  <label className="text-xs font-bold text-red-800 uppercase flex items-center gap-2">
                    <AlertTriangle size={14} /> Daily Mortality Count
                  </label>
                  <input type="number" value={logData.mortalityCount} onChange={e => setLogData({...logData, mortalityCount: e.target.value})} placeholder="0" className="w-full p-3 bg-white border border-red-200 rounded-xl mt-1 outline-none text-red-600 font-bold focus:ring-2 focus:ring-red-400" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-red-800 uppercase flex items-center gap-2">
                    <Camera size={14} /> Mortality Photo Evidence
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className={`w-full mt-1 p-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition ${logData.hasPhotoEvidence ? 'border-green-400 bg-green-50 text-green-700' : 'border-red-200 bg-white text-red-400 hover:bg-red-50'} disabled:opacity-50`}
                  >
                    {uploadingImage ? <Loader2 size={20} className="animate-spin" /> : logData.hasPhotoEvidence ? <CheckCircle size={20} /> : <Camera size={20} />}
                    <span className="text-xs font-bold">
                      {uploadingImage ? "Uploading Photo..." : logData.hasPhotoEvidence ? "Photo Attached (Ready to Share)" : "Tap to Take Photo"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handleSaveLog} disabled={saving || uploadingImage} className="mt-6 w-full bg-huku-orange text-white px-6 py-4 rounded-xl font-bold shadow-md hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save & Share Report
            </button>
          </div>
        </div>
      )}

      {/* 📈 TAB 3: PERFORMANCE */}
      {activeTab === 'performance' && currentFlock && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <p className="text-[10px] text-slate-500 font-bold uppercase">Mortality Rate</p>
               <h3 className="text-2xl font-black text-red-500">{mortalityRate}%</h3>
               <p className="text-[10px] text-slate-400 mt-1">{totalMortality} lost</p>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <p className="text-[10px] text-slate-500 font-bold uppercase">Feed Conversion (FCR)</p>
               <h3 className="text-2xl font-black text-blue-500">{currentFCR}</h3>
               <p className="text-[10px] text-slate-400 mt-1">{totalFeedKg}kg feed total</p>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <p className="text-[10px] text-slate-500 font-bold uppercase">Surviving Birds</p>
               <h3 className="text-2xl font-black text-slate-800">{survivingBirds}</h3>
               <p className="text-[10px] text-slate-400 mt-1">Ready for market</p>
             </div>
             <div className={`p-5 rounded-2xl border shadow-sm ${estProfit !== null && estProfit >= 0 ? 'bg-emerald-50/30 border-emerald-200' : (estProfit !== null ? 'bg-red-50/30 border-red-200' : 'bg-white border-slate-200')}`}>
               <p className={`text-[10px] font-bold uppercase ${estProfit !== null && estProfit >= 0 ? 'text-emerald-600' : (estProfit !== null ? 'text-red-600' : 'text-slate-500')}`}>Est. Net Profit</p>
               <h3 className={`text-2xl font-black ${estProfit !== null && estProfit >= 0 ? 'text-emerald-600' : (estProfit !== null ? 'text-red-600' : 'text-slate-800')}`}>
                 {estProfit !== null ? `$${estProfit.toFixed(2)}` : "--"}
               </h3>
               <p className="text-[10px] text-slate-400 mt-1">Total Costs: ${totalInputCosts}</p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Calculator className="text-slate-500" /> Profitability Calculator
            </h2>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-600 mb-4">
                Enter your expected selling price per bird (for your <strong>{survivingBirds}</strong> surviving birds) to calculate your margins.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="Selling Price ($)" className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-huku-orange" />
                <button onClick={() => {
                  const price = Number(sellingPrice);
                  if (price) setEstProfit((survivingBirds * price) - totalInputCosts);
                }} className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition">
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
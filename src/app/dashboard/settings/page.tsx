"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile } from "@/lib/db-service";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { 
  Bell, 
  Lock, 
  Trash2, 
  Save, 
  Loader2, 
  Mail, 
  Globe, 
  CheckCircle2 
} from "lucide-react";

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  // Settings State
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    stockAlerts: true,
    marketingEmails: false,
    language: "English"
  });

  // Load existing settings
  useEffect(() => {
    async function load() {
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        if (profile?.settings) {
          setPreferences(profile.settings);
        }
      }
    }
    load();
  }, [currentUser]);

  // Save Changes
  const handleSave = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Save the "settings" object inside the user's profile
      await updateUserProfile(currentUser.uid, { settings: preferences });
      alert("Settings saved successfully! ✅");
    } catch (error) {
      console.error(error);
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Logic
  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setResetSent(true);
    } catch (error) {
      alert("Error sending reset email. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings ⚙️</h1>
        <p className="text-slate-500">Manage your app preferences and account security.</p>
      </div>

      <div className="space-y-6">
        
        {/* 1. NOTIFICATIONS CARD */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">Notifications</h2>
              <p className="text-xs text-slate-400">Control what emails you receive</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700">New Message Alerts</p>
                <p className="text-xs text-slate-400">Get emailed when a buyer messages you.</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-orange-600"
                checked={preferences.emailAlerts}
                onChange={(e) => setPreferences({...preferences, emailAlerts: e.target.checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700">Low Stock Warnings</p>
                <p className="text-xs text-slate-400">Alert me when my batch count drops below 50.</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-orange-600"
                checked={preferences.stockAlerts}
                onChange={(e) => setPreferences({...preferences, stockAlerts: e.target.checked})}
              />
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div>
                <p className="font-medium text-slate-700">Marketing & Tips</p>
                <p className="text-xs text-slate-400">Receive weekly poultry farming tips.</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-orange-600"
                checked={preferences.marketingEmails}
                onChange={(e) => setPreferences({...preferences, marketingEmails: e.target.checked})}
              />
            </div>
          </div>
        </div>

        {/* 2. SECURITY CARD */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">Security</h2>
              <p className="text-xs text-slate-400">Manage your login details</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-700">Password</p>
              <p className="text-xs text-slate-400">Last changed: Never</p>
            </div>
            {resetSent ? (
              <span className="text-green-600 text-sm font-bold flex items-center gap-2">
                <CheckCircle2 size={16}/> Email Sent
              </span>
            ) : (
              <button 
                onClick={handlePasswordReset}
                className="text-sm border border-slate-300 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition"
              >
                Reset Password via Email
              </button>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
             <div>
              <p className="font-medium text-slate-700">Email Address</p>
              <p className="text-xs text-slate-400">{currentUser?.email}</p>
            </div>
            <div className="text-slate-400 text-sm italic">Cannot change</div>
          </div>
        </div>

        {/* 3. DANGER ZONE */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white text-red-600 rounded-full flex items-center justify-center shadow-sm">
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-red-900">Danger Zone</h2>
              <p className="text-xs text-red-400">Irreversible actions</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-800">Delete my account and all listings permanently.</p>
            <button 
              onClick={() => alert("Please contact support at wnyaunwa@gmail.com to delete your account.")}
              className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}
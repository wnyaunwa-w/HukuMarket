"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/lib/db-service";
import { Loader2, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(currentUser.uid);

        // 1. ⏱️ Calculate the 90-Day "Pioneer" Trial
        const creationTime = currentUser.metadata?.creationTime;
        let isTrialActive = false;

        if (creationTime) {
          const signupDate = new Date(creationTime);
          const now = new Date();
          const diffTime = now.getTime() - signupDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          isTrialActive = diffDays <= 90;
        }

        // 2. 💳 Check if they have an active paid subscription
        const isSubscribed = profile?.subscriptionStatus === "active";

        // 3. 🚪 Grant access if EITHER the trial is active OR they are subscribed
        if (isTrialActive || isSubscribed) {
          setHasAccess(true);
        }

      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [currentUser]);

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <Loader2 className="animate-spin text-huku-orange mb-4" size={32} />
        <p className="text-slate-500 font-medium">Loading secure dashboard...</p>
      </div>
    );
  }

  // ✅ ACCESS GRANTED: Render the protected page (like Create Listing)
  if (hasAccess) {
    return <>{children}</>;
  }

  // 🛑 ACCESS DENIED: Show the Paywall
  return (
    <div className="max-w-lg mx-auto py-20 px-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Lock size={32} className="text-huku-orange" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-2">Time to Upgrade! 🚀</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Your 90-day Pioneer Promo has successfully completed! To continue listing your chickens and reaching buyers across your province, please activate your monthly subscription.
        </p>

        <div className="bg-slate-50 p-6 rounded-2xl mb-8 text-left border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-huku-orange" /> Subscription Benefits
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
              <span>Unlimited live & dressed broiler listings</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
              <span>Direct WhatsApp inquiries from local buyers</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
              <span>Marketplace analytics and sales tracking</span>
            </li>
          </ul>
        </div>

        <div className="mb-8">
          <span className="text-4xl font-black text-slate-900">$5</span>
          <span className="text-slate-500 font-medium"> / month</span>
        </div>

        {/* This button will link to a billing page where they can see InnBucks/EcoCash details */}
        <Link 
          href="/dashboard/billing" 
          className="block w-full bg-huku-orange text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-200"
        >
          Activate My Account
        </Link>
        
        <p className="text-xs text-slate-400 mt-4">
          Payments securely processed via EcoCash or InnBucks.
        </p>
      </div>
    </div>
  );
}
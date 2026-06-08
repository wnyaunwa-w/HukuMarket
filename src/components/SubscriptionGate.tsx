"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/lib/db-service";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase";
import { Loader2, Lock, Sparkles, CheckCircle2 } from "lucide-react";

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  // 📱 UPDATED: Admin Phone State for the Paywall
  const [adminPhone, setAdminPhone] = useState("+263 78 456 7174");

  useEffect(() => {
    async function checkAccess() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // 🚨 CRITICAL FIX: THE SUPER ADMIN BYPASS 🚨
        if (currentUser.email === "wnyaunwa@gmail.com") {
          setHasAccess(true);
          setLoading(false);
          return; 
        }

        const profile = await getUserProfile(currentUser.uid);

        // Check if already pending so we can change the UI text
        if (profile?.subscriptionStatus === "pending") {
          setIsPending(true);
        }

        // 1. ⏱️ Calculate Trial Status
        let isTrialActive = false;
        
        if (profile?.subscriptionExpiryDate) {
          const expiry = new Date(profile.subscriptionExpiryDate);
          isTrialActive = expiry.getTime() > new Date().getTime();
        } else if (currentUser.metadata?.creationTime) {
          const signupDate = new Date(currentUser.metadata.creationTime);
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
        } else {
          // 4. If locked out, fetch the Super Admin phone for the payment instructions
          try {
            const adminQuery = query(collection(db, "users"), where("email", "==", "wnyaunwa@gmail.com"));
            const adminSnap = await getDocs(adminQuery);
            if (!adminSnap.empty) {
              const adminData = adminSnap.docs[0].data();
              const fetchedPhone = adminData.phoneNumber || adminData.phone;
              if (fetchedPhone) {
                setAdminPhone(fetchedPhone);
              }
            }
          } catch (phoneErr) {
            console.error("Could not fetch admin phone number", phoneErr);
          }
        }

      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [currentUser]);

  // 📱 PREPARE THE WHATSAPP LINK DYNAMICALLY FOR THE PAYWALL
  let cleanAdminPhone = adminPhone.replace(/[\s\+\-\(\)]/g, "");
  if (cleanAdminPhone.startsWith("0")) {
    cleanAdminPhone = "263" + cleanAdminPhone.substring(1);
  }
  const waMessage = encodeURIComponent(`Hello, I want to activate my HukuMarket monthly subscription. My email is ${currentUser?.email}. Here is my $5 proof of payment:`);
  const whatsappLink = `https://wa.me/${cleanAdminPhone}?text=${waMessage}`;

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <Loader2 className="animate-spin text-huku-orange mb-4" size={32} />
        <p className="text-slate-500 font-medium">Loading secure dashboard...</p>
      </div>
    );
  }

  // ✅ ACCESS GRANTED: Render the protected page
  if (hasAccess) {
    return <>{children}</>;
  }

  // 🛑 ACCESS DENIED: Show the New Paywall UI
  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Lock size={32} className="text-huku-orange" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-2">Activate Your Seller Account</h2>
        <p className="text-slate-500 mb-8 leading-relaxed text-sm">
          Your free trial has completed. To continue selling your birds and tracking your flocks on HukuMarket, you need an active subscription.
        </p>

        {/* The "Monthly Producer Plan" Card */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 text-left mb-8 shadow-sm">
          <h3 className="text-lg font-black text-center text-slate-900 mb-4">Monthly Producer Plan</h3>
          
          <div className="text-center mb-6">
            <span className="text-4xl font-black text-huku-orange">$5</span>
            <span className="text-slate-500 font-medium"> / month</span>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              <span className="font-medium">Unlimited live & dressed listings</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              <span className="font-medium">Direct WhatsApp inquiries</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              <span className="font-medium">Dashboard sales tracking</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              <span className="font-medium">Huku Daily Management Tool</span>
            </li>
          </ul>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
            <p className="font-bold text-slate-700 mb-1">How to renew:</p>
            <ol className="text-slate-600 space-y-1 list-decimal list-inside">
              <li>Send $5 via Innbucks or EcoCash to: <strong className="text-slate-900 block mt-1">{adminPhone}</strong></li>
              <li className="mt-2">Send proof of payment to WhatsApp below.</li>
              <li>We will reactivate your account immediately.</li>
            </ol>
          </div>
        </div>

        {/* WhatsApp Action Button with Database Update */}
        <button 
          onClick={async () => {
            try {
              // 1. Tell the database this user is pending approval!
              if (currentUser?.uid) {
                const userRef = doc(db, "users", currentUser.uid);
                await updateDoc(userRef, { subscriptionStatus: "pending" });
                setIsPending(true); // Update local state so button text changes
              }
              // 2. Open WhatsApp for them to send the proof
              window.open(whatsappLink, "_blank");
              
              // 3. Give them a quick alert so they know the app registered it
              alert("Notification sent to Admin! Please complete the WhatsApp message with your proof of payment.");
            } catch (err) {
              console.error("Failed to update status", err);
              window.open(whatsappLink, "_blank"); // Fallback to open WhatsApp anyway
            }
          }}
          className={`block w-full text-white font-bold py-4 rounded-xl transition shadow-lg ${
            isPending 
              ? "bg-slate-800 hover:bg-slate-900 shadow-slate-200" 
              : "bg-green-500 hover:bg-green-600 shadow-green-200"
          }`}
        >
          {isPending ? "Resend Proof of Payment" : "Send Proof of Payment"}
        </button>
        {isPending && (
          <p className="text-xs text-slate-500 text-center mt-3 font-medium">
            ⏳ Your payment is currently under review by an admin.
          </p>
        )}
      </div>
    </div>
  );
}
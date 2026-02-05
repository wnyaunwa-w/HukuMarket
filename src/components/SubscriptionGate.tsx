"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldCheck } from "lucide-react";
import { getSubscriptionFee } from "@/lib/db-service"; // Import the helper

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [fee, setFee] = useState(5); // Default
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if (currentUser) {
        // 1. Fetch User Status
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (userSnap.exists()) {
          setStatus(userSnap.data().subscriptionStatus);
          setRole(userSnap.data().role);
        }
        
        // 2. Fetch Global Fee
        const currentFee = await getSubscriptionFee();
        setFee(currentFee);
      }
      setLoading(false);
    }
    checkSubscription();
  }, [currentUser]);

  if (loading) return null;

  // 🔒 BLOCK ACCESS if Farmer is Inactive
  if (role === 'farmer' && status !== 'active') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-orange-100 p-6 rounded-full mb-6">
          <ShieldCheck size={48} className="text-huku-orange" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Activate Your Seller Account</h2>
        <p className="text-slate-500 max-w-md mb-8">
          To start selling your birds on HukuMarket, you need an active subscription.
        </p>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full mb-6">
          <h3 className="font-bold text-lg">Monthly Producer Plan</h3>
          <div className="text-4xl font-black text-huku-orange my-4">
            {fee === 0 ? "FREE" : `$${fee}`} 
            {fee > 0 && <span className="text-sm text-slate-400 font-medium">/month</span>}
          </div>
          
          <ul className="text-sm text-slate-600 text-left space-y-2 mb-4">
            <li>✅ Unlimited Listings</li>
            <li>✅ Buyer Notifications</li>
            <li>✅ Verified Badge</li>
          </ul>
          
          {/* Payment Instructions (Only if not Free) */}
          {fee > 0 && (
             <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 text-left">
              <strong>How to pay:</strong><br/>
              1. Send ${fee} via Innbucks to: <strong>+263 77 123 4567</strong><br/>
              2. Send proof of payment to WhatsApp below.<br/>
              3. We will approve & activate your account.
            </div>
          )}
        </div>

        <a 
          href="https://wa.me/263771234567?text=I%20have%20paid%20my%20subscription%20please%20activate%20me" 
          target="_blank"
          className="bg-green-500 text-white px-8 py-3 rounded-full font-bold hover:bg-green-600 transition shadow-lg shadow-green-200"
        >
          {fee === 0 ? "Contact Admin to Activate" : "Send Proof of Payment"}
        </a>
      </div>
    );
  }

  // ALLOW ACCESS
  return <>{children}</>;
}
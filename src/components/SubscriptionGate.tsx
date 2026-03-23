"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldCheck, AlertTriangle, Clock } from "lucide-react"; 
import { getSubscriptionFee } from "@/lib/db-service";
import { differenceInDays, parseISO, format } from "date-fns"; 
import { usePathname } from "next/navigation"; 

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const pathname = usePathname(); 
  const [status, setStatus] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [fee, setFee] = useState(5);
  const [loading, setLoading] = useState(true);
  
  const [adminPhone, setAdminPhone] = useState("+263 77 123 4567"); 

  useEffect(() => {
    async function checkSubscription() {
      if (currentUser) {
        // 1. Fetch User Status & Expiry
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setStatus(data.subscriptionStatus);
          setRole(data.role);
          setExpiryDate(data.subscriptionExpiryDate || null);
        }
        
        // 2. Fetch Global Fee
        const currentFee = await getSubscriptionFee();
        setFee(currentFee);

        // 3. Fetch Super Admin's Phone Number dynamically
        try {
          const adminQuery = query(collection(db, "users"), where("email", "==", "wnyaunwa@gmail.com"));
          const adminSnap = await getDocs(adminQuery);
          if (!adminSnap.empty) {
            const adminData = adminSnap.docs[0].data();
            const phone = adminData.phoneNumber || adminData.phone;
            if (phone) {
              setAdminPhone(phone);
            }
          }
        } catch (error) {
          console.error("Could not fetch admin phone number", error);
        }
      }
      setLoading(false);
    }
    checkSubscription();
  }, [currentUser]);

  if (loading) return null;

  // --- CALCULATION LOGIC ---
  const today = new Date();
  let daysLeft = null;
  let isExpired = false;

  if (expiryDate) {
    const end = parseISO(expiryDate);
    daysLeft = differenceInDays(end, today);
    if (daysLeft < 0) isExpired = true;
  }

  // --- 🔒 BULLETPROOF BLOCKING LOGIC ---
  const isTryingToSell = pathname?.startsWith('/dashboard/listings');
  
  // 1. Are they a buyer trying to sneak into the seller pages?
  const isBuyerTryingToSell = role === 'buyer' && isTryingToSell;
  
  // 2. Are they a farmer who hasn't paid or expired?
  const isUnpaidFarmer = role === 'farmer' && (status !== 'active' || isExpired);

  // Block if either condition is true
  const shouldBlock = isBuyerTryingToSell || isUnpaidFarmer;

  if (shouldBlock) {
    let cleanAdminPhone = adminPhone.replace(/[\s\+\-\(\)]/g, "");
    if (cleanAdminPhone.startsWith("0")) {
      cleanAdminPhone = "263" + cleanAdminPhone.substring(1);
    }

    // Smart WhatsApp message based on their exact situation
    let waMessage = "I want to activate my seller account";
    if (isExpired) waMessage = "My subscription expired";
    if (role === 'buyer') waMessage = "I am a buyer but I want to upgrade to a seller account";

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-300">
        <div className={`p-6 rounded-full mb-6 ${isExpired ? "bg-red-100" : "bg-orange-100"}`}>
          {isExpired ? (
            <Clock size={48} className="text-red-600" />
          ) : (
            <ShieldCheck size={48} className="text-huku-orange" />
          )}
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-2">
          {isExpired ? "Subscription Expired" : "Activate Your Seller Account"}
        </h2>
        
        <p className="text-slate-500 max-w-md mb-8">
          {isExpired 
            ? "Your monthly subscription period has ended. Please renew to continue managing your listings." 
            : "To start selling your birds on HukuMarket, you need an active subscription."}
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
          </ul>
          
          {fee > 0 && (
             <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 text-left">
              <strong>How to activate:</strong><br/>
              1. Send ${fee} via Innbucks or EcoCash to: <strong>{adminPhone}</strong><br/>
              2. Send proof of payment to WhatsApp below.<br/>
              3. We will activate your account immediately.
            </div>
          )}
        </div>

        <a 
          href={`https://wa.me/${cleanAdminPhone}?text=${waMessage}%20(Email:%20${currentUser?.email}).%20Here%20is%20my%20proof%20of%20payment.`} 
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white px-8 py-3 rounded-full font-bold hover:bg-green-600 transition shadow-lg shadow-green-200"
        >
          {fee === 0 ? "Contact Admin to Activate" : "Send Proof of Payment"}
        </a>
      </div>
    );
  }

  // --- ⚠️ WARNING LOGIC (3 Days Left) ---
  return (
    <>
      {!shouldBlock && daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 && role === 'farmer' && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r-lg flex items-start gap-3">
          <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-orange-800 text-sm">Subscription Expiring Soon</h4>
            <p className="text-orange-700 text-xs mt-1">
              Your plan expires in <span className="font-black">{daysLeft === 0 ? "less than 24 hours" : `${daysLeft} days`}</span> ({expiryDate && format(parseISO(expiryDate), "d MMM")}). 
              Please renew to avoid interruption.
            </p>
          </div>
        </div>
      )}

      {children}
    </>
  );
}
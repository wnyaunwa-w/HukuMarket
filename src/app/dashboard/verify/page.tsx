"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { BadgeCheck, Clock, ShieldAlert, Upload, Loader2, CheckCircle2 } from "lucide-react";

export default function VerifyBadgePage() {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<"idle" | "pending_admin_approval" | "verified" | "expired">("idle");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Admin Phone State
  const [adminPhone, setAdminPhone] = useState("+263 78 456 7174"); // Updated to match your default

  // User's Own Phone Number State for WhatsApp Message
  const [userPhone, setUserPhone] = useState("");

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchVerificationStatus() {
      if (currentUser) {
        // 1. Fetch User Status & Phone Number
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          // Grab their phone number for the WhatsApp message
          if (data.phone || data.phoneNumber) {
             setUserPhone(data.phone || data.phoneNumber);
          }

          if (data.isVerified) {
            setStatus("verified");
          } else if (data.verificationStatus) {
            setStatus(data.verificationStatus);
          }
        }

        // 2. Fetch Super Admin's Phone Number dynamically
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
        } catch (error) {
          console.error("Could not fetch admin phone number", error);
        }
      }
      setLoading(false);
    }
    fetchVerificationStatus();
  }, [currentUser]);

  // 📱 PREPARE THE WHATSAPP LINK DYNAMICALLY
  let cleanAdminPhone = adminPhone.replace(/[\s\+\-\(\)]/g, "");
  if (cleanAdminPhone.startsWith("0")) {
    cleanAdminPhone = "263" + cleanAdminPhone.substring(1);
  }
  
  // 👈 UPDATED: Now uses the user's phone number instead of email!
  const identifier = userPhone || currentUser?.email || "Unknown";
  const waMessage = encodeURIComponent(`Hello, I have submitted my KYC details for the Verified Badge. My phone number is ${identifier}. Here is my $10 proof of payment:`);
  const whatsappLink = `https://wa.me/${cleanAdminPhone}?text=${waMessage}`;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !idFile) {
      setError("Please upload a picture of your National ID.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // 1. Upload ID Image to Firebase Storage
      const fileRef = ref(storage, `kyc_documents/${currentUser.uid}_id_photo`);
      await uploadBytes(fileRef, idFile);
      const photoURL = await getDownloadURL(fileRef);

      // 2. Save Application to Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        verificationStatus: "pending_admin_approval",
        verificationData: {
          fullNameOnID: fullName,
          verifiedPhoneNumber: phone,
          physicalAddress: address,
          nationalIDPhotoURL: photoURL,
          submissionDate: new Date().toISOString(),
        }
      });

      // 3. Try to open WhatsApp automatically (might be blocked by browser)
      window.open(whatsappLink, "_blank");

      // 4. Update UI Status
      setStatus("pending_admin_approval");
    } catch (err: any) {
      console.error(err);
      setError("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-huku-orange" /></div>;

  // VIEW 1: PENDING APPROVAL
  if (status === "pending_admin_approval") {
    return (
      <div className="max-w-2xl mx-auto text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm mt-8 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-orange-50 text-huku-orange rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3">Application Under Review</h2>
        <p className="text-slate-500 mb-6">
          Your KYC details have been securely submitted to HukuMarket. 
        </p>
        
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
          <h4 className="font-bold text-slate-900 mb-2">Final Step: Send Payment Proof</h4>
          <p className="text-sm text-slate-600 mb-4">
            We can only process your verification after receiving your <strong>$10 Annual Fee</strong> payment proof.
          </p>
          
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-green-200 w-full sm:w-auto"
          >
            Open WhatsApp to Send Proof
          </a>
        </div>
      </div>
    );
  }

  // VIEW 2: ALREADY VERIFIED
  if (status === "verified") {
    return (
      <div className="max-w-2xl mx-auto text-center p-8 bg-white rounded-3xl border border-blue-100 shadow-sm mt-8 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <BadgeCheck size={40} fill="currentColor" className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3">You are a Verified Farmer</h2>
        <p className="text-slate-500 mb-6">
          Your identity and farm details have been verified. The blue trust badge is currently active on all your listings.
        </p>
      </div>
    );
  }

  // VIEW 3: APPLICATION FORM (Idle / Expired)
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <BadgeCheck className="text-blue-500" /> Apply for Verification
        </h1>
        <p className="text-slate-500 mt-2">
          Earn the blue Verified Badge to build trust with buyers. Verification requires an identity check and a $10 annual fee.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex gap-2 items-center"><ShieldAlert size={18}/> {error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name (As on National ID)</label>
            <input 
              type="text" required 
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-huku-orange outline-none transition"
              value={fullName} onChange={(e) => setFullName(e.target.value)} 
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Active Phone Number</label>
            <input 
              type="tel" required 
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-huku-orange outline-none transition"
              value={phone} onChange={(e) => setPhone(e.target.value)} 
              placeholder="+263 77 000 0000"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Physical Farm Address</label>
            <textarea 
              required rows={3}
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-huku-orange outline-none transition resize-none"
              value={address} onChange={(e) => setAddress(e.target.value)} 
              placeholder="Detailed address or directions to the farm..."
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Upload National ID Photo</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                required
                onChange={(e) => setIdFile(e.target.files ? e.target.files[0] : null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                {idFile ? (
                  <>
                    <CheckCircle2 className="text-green-500" size={32} />
                    <span className="font-bold text-slate-700">{idFile.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="text-slate-400" size={32} />
                    <span className="font-bold text-slate-500">Tap to upload picture</span>
                    <span className="text-xs text-slate-400">JPG, PNG (Max 5MB)</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <h4 className="font-bold text-slate-900 mb-2">Payment Required</h4>
          <p className="text-sm text-slate-600 mb-3">
            To complete your application, please send the <strong>$10 Annual Fee</strong> via Innbucks or EcoCash to: <strong className="text-slate-900">{adminPhone}</strong>
          </p>
          <p className="text-xs text-slate-500">
            Clicking the button below will save your details. If WhatsApp doesn't open automatically, a button will appear on the next screen.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl font-black text-lg shadow-lg shadow-slate-200 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="animate-spin" /> : "Submit & Pay $10"}
        </button>

      </form>
    </div>
  );
}
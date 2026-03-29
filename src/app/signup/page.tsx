"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Phone, Lock, User } from "lucide-react";
import { updateUserProfile } from "@/lib/db-service";

export default function Signup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  // 🪄 The Pseudo-Email Magic Formatting
  const formatPhone = (p: string) => {
    let cleaned = p.replace(/\D/g, ''); 
    if (cleaned.startsWith('0')) cleaned = '263' + cleaned.substring(1); 
    return cleaned;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (pin.length !== 4) {
      return setError("PIN must be exactly 4 digits.");
    }

    setLoading(true);
    
    const pseudoEmail = `${formatPhone(phone)}@hukumarket.com`;
    const pseudoPassword = `${pin}HUKU!`; // Pads the PIN to meet Firebase's 6-char rule

    try {
      const userCredential = await signup(pseudoEmail, pseudoPassword);
      
      // Save their actual details to your database
      await updateUserProfile(userCredential.user.uid, {
        displayName: name,
        phone: formatPhone(phone),
        isVerified: false,
        subscriptionStatus: "trial",
        role: "farmer"
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError("Failed to create account. This number might already be registered.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      const cred = await loginWithGoogle();
      await updateUserProfile(cred.user.uid, {
        displayName: cred.user.displayName || "Farmer",
        email: cred.user.email,
        isVerified: false,
        subscriptionStatus: "trial"
      });
      router.push("/dashboard");
    } catch (err) {
      setError("Google sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-black text-slate-900 mb-2 text-center">Join HukuMarket</h1>
        <p className="text-slate-500 text-center mb-8">Create your free farmer account</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100 text-center">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name or Farm Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="text" required className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 ring-orange-100 bg-slate-50" placeholder="e.g. Sekuru John" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="tel" required className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 ring-orange-100 bg-slate-50" placeholder="0771 234 567" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Create a 4-Digit PIN</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="password" required maxLength={4} inputMode="numeric" pattern="\d{4}" className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 ring-orange-100 bg-slate-50 text-center text-xl tracking-widest font-black" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">Remember this PIN! You will use it to log in.</p>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-huku-orange text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition flex justify-center items-center shadow-lg shadow-orange-200">
            {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm mb-4">Admin or early user?</p>
          <button onClick={handleGoogleSignup} type="button" className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition flex justify-center items-center gap-2">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>

        <p className="text-center mt-6 text-sm text-slate-500 font-medium">
          Already have an account? <Link href="/login" className="text-huku-orange font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
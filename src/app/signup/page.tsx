"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, User, Tractor } from "lucide-react"; // Tractor icon for Farmer

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // 👇 New State for Role
  const [role, setRole] = useState<"buyer" | "farmer">("buyer");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Display Name
      await updateProfile(user, { displayName: name });

      // 3. Save to Firestore with Role & Status
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        createdAt: serverTimestamp(),
        role: role, // 👈 Saved here
        // If Farmer, status is 'inactive'. If Buyer, 'active' (free)
        subscriptionStatus: role === 'farmer' ? 'inactive' : 'active' 
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 mb-2 text-center">Join HukuMarket 🐔</h1>
        
        {/* 👇 ROLE SELECTOR UI */}
        <div className="flex gap-4 mb-6 mt-6">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`flex-1 p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
              role === "buyer" 
                ? "border-huku-orange bg-orange-50 text-huku-orange" 
                : "border-slate-100 text-slate-400 hover:border-slate-300"
            }`}
          >
            <User size={24} />
            <span className="font-bold text-sm">I'm a Buyer</span>
          </button>
          
          <button
            type="button"
            onClick={() => setRole("farmer")}
            className={`flex-1 p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
              role === "farmer" 
                ? "border-huku-orange bg-orange-50 text-huku-orange" 
                : "border-slate-100 text-slate-400 hover:border-slate-300"
            }`}
          >
            <Tractor size={24} />
            <span className="font-bold text-sm">I'm a Farmer</span>
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
           {/* ... Input fields for Name, Email, Password (same as before) ... */}
           <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
            <input type="text" required className="w-full p-3 rounded-xl border border-slate-200" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
            <input type="email" required className="w-full p-3 rounded-xl border border-slate-200" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input type="password" required className="w-full p-3 rounded-xl border border-slate-200" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-huku-orange text-white p-4 rounded-xl font-bold mt-2">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
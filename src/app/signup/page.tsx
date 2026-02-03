"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "BUYER" // Default role
  });

  // Helper: Save user data to Firestore
  const saveUserToDb = async (user: any, name: string, role: string) => {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: name,
      email: user.email,
      role: role,
      createdAt: new Date().toISOString(),
    });
  };

  // 1. Email/Password Signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.fullName });
      
      // Save to DB
      await saveUserToDb(userCredential.user, formData.fullName, formData.role);
      
      router.push("/"); // Redirect home
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Signup
  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Save to DB (Defaulting to Buyer for Google logins)
      await saveUserToDb(result.user, result.user.displayName || "User", "BUYER");
      router.push("/");
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border border-slate-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500">Join Zimbabwe's #1 Poultry Marketplace</p>
        </div>

        {/* Google Button */}
        <button 
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 p-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition mb-6"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
          Sign up with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400">Or register with email</span></div>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" required placeholder="John Doe"
              className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-orange-500 outline-none transition"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" required placeholder="you@example.com"
              className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-orange-500 outline-none transition"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input 
              type="password" required placeholder="••••••••" minLength={6}
              className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-orange-500 outline-none transition"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-3 rounded-xl font-medium border ${formData.role === "BUYER" ? "bg-orange-50 border-orange-500 text-orange-700" : "bg-white border-slate-200 text-slate-500"}`}
                onClick={() => setFormData({...formData, role: "BUYER"})}
              >
                Buyer 🛒
              </button>
              <button
                type="button"
                className={`p-3 rounded-xl font-medium border ${formData.role === "SELLER" ? "bg-orange-50 border-orange-500 text-orange-700" : "bg-white border-slate-200 text-slate-500"}`}
                onClick={() => setFormData({...formData, role: "SELLER"})}
              >
                Farmer 🐔
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-700 text-white p-4 rounded-xl font-bold hover:bg-green-800 transition flex justify-center items-center shadow-lg shadow-green-700/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Account →"}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-500">
          Already have an account? <Link href="/login" className="text-orange-600 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
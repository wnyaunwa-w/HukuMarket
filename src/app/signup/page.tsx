"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, User, Tractor, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"buyer" | "farmer">("buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper to save user to DB
  const saveUserToDB = async (user: any) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // Only set if new, or update role if missing
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || name,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        role: role, // 👈 Saves the selected role (Buyer/Farmer)
        subscriptionStatus: role === 'farmer' ? 'inactive' : 'active',
        isBlocked: false,
        agreedToTerms: true // Record consent
      });
    }
  };

  // 📧 Email Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      await saveUserToDB(user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🇬 Google Signup
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserToDB(result.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 mb-2 text-center flex items-center justify-center gap-2">
          Join HukuMarket 🐔
        </h1>
        <p className="text-center text-slate-500 text-sm mb-8">Zimbabwe's #1 Poultry Marketplace</p>
        
        {/* ROLE SELECTOR */}
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              role === "buyer" 
                ? "border-huku-orange bg-orange-50 text-huku-orange ring-4 ring-orange-100" 
                : "border-slate-100 text-slate-400 hover:border-slate-200"
            }`}
          >
            <User size={24} />
            <span className="font-bold text-sm">I'm a Buyer</span>
          </button>
          
          <button
            type="button"
            onClick={() => setRole("farmer")}
            className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              role === "farmer" 
                ? "border-huku-orange bg-orange-50 text-huku-orange ring-4 ring-orange-100" 
                : "border-slate-100 text-slate-400 hover:border-slate-200"
            }`}
          >
            <Tractor size={24} />
            <span className="font-bold text-sm">I'm a Farmer</span>
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold text-center">{error}</div>}

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
            <input type="text" required placeholder="John Doe" className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-huku-orange outline-none transition" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email</label>
            <input type="email" required placeholder="john@example.com" className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-huku-orange outline-none transition" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Password</label>
            <input type="password" required placeholder="••••••••" className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-huku-orange outline-none transition" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {/* LEGAL CONSENT CHECKBOX */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="mt-1">
              <CheckCircle2 className="text-green-500 fill-green-50" size={18} />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
              By creating this account, you agree to HukuMarket's 
              <Link href="/terms" className="text-huku-orange font-bold hover:underline mx-1">Terms of Service</Link> 
              and 
              <Link href="/privacy" className="text-huku-orange font-bold hover:underline mx-1">Privacy Policy</Link>.
            </p>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-huku-orange hover:bg-orange-600 text-white p-4 rounded-2xl font-black text-lg shadow-lg shadow-orange-100 transition active:scale-[0.98] flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
        </div>

        {/* GOOGLE BUTTON */}
        <button 
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-700 p-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
          Sign up with Google
        </button>

        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          Already have an account? <Link href="/login" className="text-huku-orange font-bold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}
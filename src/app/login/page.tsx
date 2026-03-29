"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Phone, Lock } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const formatPhone = (p: string) => {
    let cleaned = p.replace(/\D/g, ''); 
    if (cleaned.startsWith('0')) cleaned = '263' + cleaned.substring(1); 
    return cleaned;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const pseudoEmail = `${formatPhone(phone)}@hukumarket.com`;
    const pseudoPassword = `${pin}HUKU!`;

    try {
      await login(pseudoEmail, pseudoPassword);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Incorrect phone number or PIN.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError("Google sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-100">
          <span className="text-3xl">🐔</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 text-center">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-8">Enter your mobile number and PIN</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="tel" required className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 ring-orange-100 bg-slate-50" placeholder="0771 234 567" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">4-Digit PIN</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="password" required maxLength={4} inputMode="numeric" pattern="\d{4}" className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 ring-orange-100 bg-slate-50 text-center text-xl tracking-widest font-black" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition flex justify-center items-center shadow-lg">
            {loading ? <Loader2 className="animate-spin" /> : "Log In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm mb-4">Admin or early user?</p>
          <button onClick={handleGoogleLogin} type="button" className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition flex justify-center items-center gap-2">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>

        <p className="text-center mt-6 text-sm text-slate-500 font-medium">
          New to HukuMarket? <Link href="/signup" className="text-huku-orange font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
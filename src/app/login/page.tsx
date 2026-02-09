"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"; // 👈 Added signInWithPopup
import { auth, googleProvider } from "@/lib/firebase"; // 👈 Added googleProvider
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { resetPassword } = useAuth(); 
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // 🟢 DIRECT GOOGLE LOGIN HANDLER
  const handleGoogleLogin = async () => {
    setError("");
    try {
      // Use the provider we explicitly exported in firebase.ts
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError("Google Login failed. Please try again.");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address above to reset your password.");
      return;
    }
    
    try {
      setLoading(true);
      await resetPassword(email);
      setResetSent(true);
      setError("");
    } catch (err: any) {
      setError("Failed to send reset email. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl border border-slate-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome Back 👋</h1>
          <p className="text-slate-500">Login to manage your HukuMarket account.</p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin} // 👈 Updated handler
          type="button" // 👈 Prevent form submission
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition mb-6"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-6 w-6" alt="Google" />
          Login with Google
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-sm">Or login with email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}

        {resetSent && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 text-center font-medium">
             ✅ Password reset email sent! Check your inbox.
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-huku-orange outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. farmer@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} 
                required
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-huku-orange outline-none transition pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <div className="flex justify-end mt-2">
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-bold text-huku-orange hover:text-orange-700 transition"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex justify-center mt-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Login"}
          </button>
        </form>

        <p className="text-center text-slate-500 mt-8">
          No account?{" "}
          <Link href="/signup" className="text-huku-orange font-bold hover:underline">
            Get Started
          </Link>
        </p>
      </div>
    </div>
  );
}
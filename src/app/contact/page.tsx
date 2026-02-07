"use client";

import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert("Message sent! We will get back to you shortly.");
    setLoading(false);
    // In a real app, you would connect this to an API route or EmailJS
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Let's Chat 🐔</h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            Whether you need help creating a listing, have questions about a seller, or just want to partner with HukuMarket, we'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* LEFT COLUMN: Contact Info */}
          <div className="space-y-6">
            
            {/* Email Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-full text-huku-orange shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">Email Us</h3>
                <p className="text-slate-500 text-sm mb-2">Our friendly team is here to help.</p>
                <a href="mailto:admin@hukumarket.com" className="font-bold text-huku-orange hover:underline">
                  admin@hukumarket.com
                </a>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-full text-huku-orange shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">Call Us</h3>
                <p className="text-slate-500 text-sm mb-2">Mon-Fri from 8am to 5pm.</p>
                <a href="tel:+263784567174" className="font-bold text-huku-orange hover:underline">
                  +263 78 456 7174
                </a>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-full text-huku-orange shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">Visit Us</h3>
                <p className="text-slate-500 text-sm mb-2">Come say hello at our HQ.</p>
                <p className="font-bold text-slate-700 max-w-xs leading-relaxed">
                  Sub Division H, Binda Estate, Goromonzi, Zimbabwe
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Contact Form */}
          <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">First name</label>
                  <input 
                    type="text" 
                    placeholder="Jane" 
                    required 
                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-huku-orange focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Last name</label>
                  <input 
                    type="text" 
                    placeholder="Doe" 
                    required 
                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-huku-orange focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input 
                  type="email" 
                  placeholder="jane@example.com" 
                  required 
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-huku-orange focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                <textarea 
                  rows={4}
                  placeholder="How can we help you?" 
                  required 
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-huku-orange focus:border-transparent outline-none transition resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-huku-orange hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Send Message <Send size={18} /></>}
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
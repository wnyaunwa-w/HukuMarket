"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-slate-500 hover:text-huku-orange font-bold transition">
            <ArrowLeft size={20} className="mr-2" /> Back to Home
          </Link>
        </div>

        {/* Document Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={200} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-4 relative z-10">Privacy Policy</h1>
            <p className="text-slate-400 font-medium relative z-10">
              Last Updated: <span className="text-huku-orange">February 7, 2026</span>
            </p>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-10 text-slate-600 leading-relaxed">
            
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Introduction
              </h2>
              <p>
                At HukuMarket, we value your privacy. This policy explains how we collect, use, and protect your 
                personal information when you visit <strong>www.hukumarket.com</strong>. By using our service, you agree to the 
                collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Information We Collect
              </h2>
              <p className="mb-3">To facilitate the trade of live birds, we collect the following types of information:</p>
              <ul className="list-disc pl-5 space-y-2 marker:text-huku-orange">
                <li><strong>Personal Identification:</strong> Name, email address, phone number, and physical address (for sellers).</li>
                <li><strong>Listing Data:</strong> Photos of livestock, descriptions, and pricing information.</li>
                <li><strong>Technical Data:</strong> IP addresses, browser type, and usage patterns through cookies to improve website performance.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-5 space-y-2 marker:text-huku-orange">
                <li><strong>Connect Users:</strong> Enable buyers to contact sellers regarding bird listings.</li>
                <li><strong>Account Management:</strong> Maintain your profile and listing history.</li>
                <li><strong>Communication:</strong> Send you updates, security alerts, and administrative messages.</li>
                <li><strong>Safety:</strong> Prevent fraud and ensure a secure marketplace environment.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                Information Sharing and Disclosure
              </h2>
              
              <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 mb-4">
                <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-2">
                  <Eye size={20} /> Crucial Note
                </h3>
                <p className="text-yellow-700 text-sm">
                  When a seller posts an ad, their contact details (phone number/location) are made publicly visible to potential buyers. 
                  Users should exercise caution regarding the amount of personal information shared in public descriptions.
                </p>
              </div>

              <ul className="list-disc pl-5 space-y-2 marker:text-huku-orange">
                <li>We do not sell your personal data to third-party marketers.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required by Zimbabwean law or in response to valid requests by public authorities (e.g., Department of Veterinary Services).</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
                Data Security
              </h2>
              <p className="flex items-start gap-3">
                <Lock className="text-slate-400 mt-1 shrink-0" size={20} />
                <span>
                  We implement industry-standard security measures to protect your data. However, please remember that no method 
                  of transmission over the internet is 100% secure. We encourage users to use strong passwords and avoid sharing account access.
                </span>
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
                Cookies and Tracking
              </h2>
              <p>
                HukuMarket uses cookies to enhance your experience. You can choose to disable cookies in your browser settings, 
                though some features of the marketplace may not function properly as a result.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">7</span>
                Your Rights
              </h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-5 space-y-2 marker:text-huku-orange">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Ask us to update or fix inaccurate information.</li>
                <li><strong>Deletion:</strong> Request that we delete your account and associated data (subject to legal record-keeping requirements).</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">8</span>
                Third-Party Links
              </h2>
              <p>
                Our website may contain links to external sites (such as transport services or poultry supplies). 
                We are not responsible for the privacy practices or content of these third-party websites.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">9</span>
                Changes to This Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            {/* Section 10 */}
            <section className="border-t border-slate-200 pt-8 mt-8">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">10</span>
                Contact Us
              </h2>
              <p className="mb-4">If you have questions about your data privacy, please reach out to our Data Officer:</p>
              <div className="bg-slate-50 p-6 rounded-2xl space-y-2 text-sm font-medium border border-slate-200">
                <p>📧 <span className="text-slate-500">Email:</span> <a href="mailto:admin@hukumarket.com" className="text-huku-orange hover:underline">admin@hukumarket.com</a></p>
                <p>📞 <span className="text-slate-500">Phone:</span> <a href="tel:+263784567174" className="text-huku-orange hover:underline">+263 78 456 7174</a></p>
                <p>📍 <span className="text-slate-500">Address:</span> Subdivision H, Binda Estate, Goromonzi, Zimbabwe.</p>
              </div>
            </section>

          </div>
        </div>
        
      </div>
    </div>
  );
}
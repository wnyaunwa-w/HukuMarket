"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
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
              <FileText size={200} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-4 relative z-10">Terms and Conditions</h1>
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
                Welcome to HukuMarket (www.hukumarket.com). These Terms and Conditions govern your use of our platform. 
                By accessing our website, you agree to comply with these terms. HukuMarket is owned and operated from 
                <strong> Subdivision H, Binda Estate, Goromonzi, Zimbabwe</strong>.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Nature of Service
              </h2>
              <p className="mb-3">HukuMarket is a digital marketplace designed specifically to link buyers and sellers of live birds.</p>
              <ul className="list-disc pl-5 space-y-2 marker:text-huku-orange">
                <li><strong>Intermediary Role:</strong> We provide the platform for advertisement and discovery only.</li>
                <li><strong>No Ownership:</strong> HukuMarket does not own, inspect, house, or sell any birds listed on the site.</li>
                <li><strong>No Agency:</strong> We are not an agent, auctioneer, or broker for any user.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                User Eligibility and Registration
              </h2>
              <ul className="list-disc pl-5 space-y-2 marker:text-huku-orange">
                <li>Users must be at least 18 years old to create an account.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>All information provided during registration must be accurate and updated.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                Listing and Selling Guidelines
              </h2>
              <p className="mb-3">Sellers are solely responsible for the content of their listings. By listing a bird on HukuMarket, you warrant that:</p>
              <ul className="list-disc pl-5 space-y-2 marker:text-huku-orange">
                <li>You have the legal right to sell the livestock.</li>
                <li>The birds are healthy to the best of your knowledge and comply with Zimbabwean veterinary and livestock movement regulations.</li>
                <li>The images and descriptions used are honest and not misleading.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
                Transactions and Payments
              </h2>
              <ul className="list-disc pl-5 space-y-2 marker:text-huku-orange">
                <li><strong>Direct Interaction:</strong> All negotiations, payments, and delivery arrangements happen directly between the buyer and the seller.</li>
                <li><strong>No Escrow:</strong> HukuMarket does not currently handle payments or provide escrow services. We are not responsible for financial losses resulting from fraudulent transactions.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <h2 className="text-xl font-black text-red-800 mb-4 flex items-center gap-3">
                <span className="bg-red-200 text-red-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
                Health and Safety Disclaimer
              </h2>
              <p className="text-red-700 font-medium">
                Important: HukuMarket does not verify the health, vaccination status, or breed purity of any birds listed. 
                We strongly advise buyers to inspect livestock in person and request relevant veterinary permits 
                (e.g., Department of Veterinary Services movement permits) before completing a purchase.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">7</span>
                Prohibited Activities
              </h2>
              <p className="mb-3">Users may not:</p>
              <ul className="list-disc pl-5 space-y-2 marker:text-huku-orange">
                <li>List endangered species or birds prohibited by Zimbabwean law.</li>
                <li>Use the platform for any fraudulent or illegal activity.</li>
                <li>Post spam, viruses, or any content that harms the functionality of the website.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">8</span>
                Limitation of Liability
              </h2>
              <p className="mb-3">To the maximum extent permitted by law, HukuMarket shall not be liable for:</p>
              <ul className="list-disc pl-5 space-y-2 marker:text-huku-orange">
                <li>The death or illness of birds post-transaction.</li>
                <li>Misrepresentations made by sellers.</li>
                <li>Personal injury or property damage occurring during a physical meet-up between users.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">9</span>
                Governing Law
              </h2>
              <p>
                These terms are governed by and construed in accordance with the laws of Zimbabwe. 
                Any disputes shall be subject to the exclusive jurisdiction of the courts in Zimbabwe.
              </p>
            </section>

            {/* Section 10 */}
            <section className="border-t border-slate-200 pt-8 mt-8">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-orange-100 text-huku-orange w-8 h-8 rounded-full flex items-center justify-center text-sm">10</span>
                Contact Information
              </h2>
              <p className="mb-4">For any queries regarding these terms, please contact us:</p>
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
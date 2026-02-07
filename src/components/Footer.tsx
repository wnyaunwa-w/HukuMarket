import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-huku-orange text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tight">HukuMarket 🐔</h2>
            <p className="text-orange-100 text-sm">
              The #1 marketplace for poultry farmers and buyers in Zimbabwe.
            </p>
            <p className="text-orange-200 text-xs font-medium">
              © 2026 All rights reserved.
            </p>
          </div>

          {/* Column 2: Legal Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-orange-50 font-medium">
              <li>
                <Link href="/privacy" className="hover:text-white hover:underline transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white hover:underline transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline transition">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Socials */}
          <div>
            <h3 className="text-lg font-bold mb-4">Connect</h3>
            <div className="flex items-center gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-orange-500/50 p-3 rounded-full hover:bg-white hover:text-huku-orange transition duration-300"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-orange-500/50 p-3 rounded-full hover:bg-white hover:text-huku-orange transition duration-300"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-orange-500/50 p-3 rounded-full hover:bg-white hover:text-huku-orange transition duration-300"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 1. We import the provider we built
import { AuthProvider } from "@/context/AuthContext"; 
import { Footer } from "@/components/Footer"; // 👈 Import Footer

const inter = Inter({ subsets: ["latin"] });

// 2. NEW: Add Viewport settings for PWA (Mobile App Feel)
export const viewport: Viewport = {
  themeColor: "#FB8500",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming like a website, feels like an app
};

// 3. UPDATED: Metadata with PWA Manifest
export const metadata: Metadata = {
  title: "HukuMarket",
  description: "Connect directly with local broiler producers in Zimbabwe.",
  manifest: "/manifest.json", // Links to the file you created
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HukuMarket",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 4. Layout Structure: flex-col ensures footer stays at bottom */}
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50`}>
        
        {/* 5. We WRAP the app with the Provider here */}
        <AuthProvider>
          
          {/* Main Content Area (grows to fill space) */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer Component */}
          <Footer />
          
        </AuthProvider>
      </body>
    </html>
  );
}
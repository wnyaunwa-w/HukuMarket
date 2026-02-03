// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 1. We import the provider we built
import { AuthProvider } from "@/context/AuthContext"; 

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
      <body className={inter.className}>
        {/* 4. We WRAP the app with the Provider here */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
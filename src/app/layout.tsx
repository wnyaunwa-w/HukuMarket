import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; 
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#FB8500",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "HukuMarket 🐔",
  description: "Connect directly with local broiler producers in Zimbabwe.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",          // 👈 Standard favicon/icon
    apple: "/apple-icon.png",   // 👈 Apple home screen icon
    shortcut: "/icon.png",      // 👈 Shortcut icon
  },
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
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50`}>
        <AuthProvider>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
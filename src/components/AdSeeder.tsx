"use client";
import { createAd } from "@/lib/db-service";

export function AdSeeder() {
  const seed = async () => {
    // Ad 1: National Foods
    await createAd({
      title: "Get 10% Off Grower Pellets",
      description: "Exclusive to HukuMarket farmers. Buy 20 bags from National Foods.",
      imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200",
      link: "https://wa.me/263770000000",
      ctaText: "Claim Offer",
      type: "dashboard_banner",
      active: true
    });

    // Ad 2: ProFeeds
    await createAd({
      title: "ProFeeds Summer Special",
      description: "Free delivery on all broiler starter kits this month only.",
      imageUrl: "https://images.unsplash.com/photo-1605000797499-95a059e69528?q=80&w=1200",
      link: "https://profeeds.co.zw",
      ctaText: "Order Now",
      type: "dashboard_banner",
      active: true
    });

    // Ad 3: Solar Incubators
    await createAd({
      title: "Solar Incubators for Sale",
      description: "Stop worrying about ZESA. Hatch 500 eggs with pure solar power.",
      imageUrl: "https://images.unsplash.com/photo-1518390938-16b7d4bb2347?q=80&w=1200",
      link: "https://solar.co.zw",
      ctaText: "View Specs",
      type: "dashboard_banner",
      active: true
    });

    alert("3 Ads Created! Check your dashboard.");
  };

  return <button onClick={seed} className="fixed bottom-4 left-4 bg-red-500 text-white p-2 rounded text-xs z-50">Seed Ads</button>;
}
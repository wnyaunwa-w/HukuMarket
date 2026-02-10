"use client";

import { useEffect, useState } from "react";
import { getUserProfile } from "@/lib/db-service";
import { BadgeCheck } from "lucide-react";

export function FarmerBadge({ userId }: { userId: string }) {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (userId) {
      getUserProfile(userId).then((profile) => {
        if (profile?.isVerified) {
          setIsVerified(true);
        }
      });
    }
  }, [userId]);

  if (!isVerified) return null;

  return (
    <div title="Verified Farmer" className="inline-flex items-center justify-center ml-1">
      {/* fill-blue-600: Solid Dark Blue Background
          text-white: White Checkmark & Outline 
          size={20}: Increased from 16 to 20
      */}
      <BadgeCheck size={20} className="text-white fill-blue-600" />
    </div>
  );
}
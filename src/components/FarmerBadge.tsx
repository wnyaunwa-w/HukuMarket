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
      <BadgeCheck size={16} className="text-blue-500 fill-blue-100" />
    </div>
  );
}
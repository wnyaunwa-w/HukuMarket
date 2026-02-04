import { differenceInDays, parseISO } from "date-fns";

// 1. Defined Breeds
export const BREEDS: Record<string, { name: string; daysToMaturity: number }> = {
  "COBB_500": { name: "Cobb 500 (Broiler)", daysToMaturity: 42 },
  "ROSS_308": { name: "Ross 308 (Broiler)", daysToMaturity: 42 },
  "SASSO": { name: "Sasso (Free Range)", daysToMaturity: 70 },
  "INDIGENOUS": { name: "Road Runner (Hardbody)", daysToMaturity: 120 },
};

// 2. The Growth Stage Logic (Used by Listing Card)
export function getGrowthStage(hatchDate: string) {
  const start = parseISO(hatchDate);
  const today = new Date();
  
  // Calculate days elapsed
  const daysOld = differenceInDays(today, start);
  
  // Standard maturity for broilers is approx 42 days (6 weeks)
  const targetDays = 42; 

  const progress = Math.min((daysOld / targetDays) * 100, 100);
  const daysLeft = Math.max(targetDays - daysOld, 0);

  let stage = "Chicks";
  if (daysOld > 14) stage = "Growing";
  if (daysOld >= targetDays) stage = "Market Ready";

  return { stage, progress, daysLeft, daysOld };
}

// 3. RESTORED: Batch Metrics Logic (Used by Dashboard)
// This was missing and caused the error. We re-use getGrowthStage logic here.
export function calculateBatchMetrics(batch: { hatchDate: string; count: number }) {
    const { daysOld, daysLeft, stage, progress } = getGrowthStage(batch.hatchDate);

    return {
        ageInDays: daysOld,
        ageInWeeks: Math.floor(daysOld / 7),
        daysRemaining: daysLeft,
        stage: stage,
        progress: progress,
        // Default values to prevent dashboard crashes if these aren't in DB yet
        mortalityRate: 0, 
        feedConversion: 1.5 
    };
}
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

// 3. Batch Metrics Logic (Universal Fix)
// Now accepts either (hatchDate string) OR (batch object) to prevent errors
export function calculateBatchMetrics(input: any, breed?: string) {
    // Handle if input is a whole batch object OR just a date string
    const hatchDate = input?.hatchDate ? input.hatchDate : input;
    
    // Safety check: if date is missing, return safe defaults
    if (!hatchDate || typeof hatchDate !== 'string') {
        return {
            ageInDays: 0,
            ageInWeeks: 0,
            daysRemaining: 0,
            stage: "Unknown",
            progress: 0,
            mortalityRate: 0, 
            feedConversion: 0 
        };
    }

    const { daysOld, daysLeft, stage, progress } = getGrowthStage(hatchDate);

    return {
        ageInDays: daysOld,
        ageInWeeks: Math.floor(daysOld / 7),
        daysRemaining: daysLeft,
        stage: stage,
        progress: progress,
        mortalityRate: 0, 
        feedConversion: 1.5 
    };
}
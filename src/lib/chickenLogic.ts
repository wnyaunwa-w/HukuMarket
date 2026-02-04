import { differenceInDays, parseISO, addDays, format } from "date-fns";

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

// 3. Batch Metrics Logic (Updated with Market Ready Date)
export function calculateBatchMetrics(input: any, breed?: string) {
    const hatchDate = input?.hatchDate ? input.hatchDate : input;
    
    // Safety check defaults
    if (!hatchDate || typeof hatchDate !== 'string') {
        return {
            ageInDays: 0,
            ageInWeeks: 0,
            daysRemaining: 0,
            stage: "Unknown",
            progress: 0,
            status: "Unknown",
            statusColor: "bg-gray-100 text-gray-500",
            marketReadyDate: "N/A", // 👈 Added default
            mortalityRate: 0, 
            feedConversion: 0 
        };
    }

    const { daysOld, daysLeft, stage, progress } = getGrowthStage(hatchDate);

    // 🎨 Determine Colors based on Stage
    let statusColor = "bg-blue-100 text-blue-700"; // Default (Growing)
    let statusText = stage;

    if (stage === "Market Ready") {
        statusColor = "bg-green-100 text-green-700";
        statusText = "Ready for Market";
    } else if (stage === "Chicks") {
        statusColor = "bg-yellow-100 text-yellow-700";
    }

    // 📅 Calculate the exact Market Ready Date
    // We assume 42 days maturity for broilers by default
    const maturityDate = addDays(parseISO(hatchDate), 42);
    const formattedReadyDate = format(maturityDate, "d MMM yyyy");

    return {
        ageInDays: daysOld,
        ageInWeeks: Math.floor(daysOld / 7),
        daysRemaining: daysLeft,
        stage: stage,
        progress: progress,
        status: statusText,
        statusColor: statusColor,
        marketReadyDate: formattedReadyDate, // 👈 The missing field fixing your error
        mortalityRate: 0, 
        feedConversion: 1.5 
    };
}
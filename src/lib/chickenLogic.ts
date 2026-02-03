import { addDays, differenceInDays, format } from "date-fns";

export const BREEDS = {
  COBB_500: { name: "Cobb 500 (Broiler)", daysToMaturity: 42 },
  ROSS_308: { name: "Ross 308 (Broiler)", daysToMaturity: 42 },
  ROADRUNNER: { name: "Indigenous (Roadrunner)", daysToMaturity: 90 },
  LAYER: { name: "Layers (Eggs)", daysToMaturity: 120 },
};

export function calculateBatchMetrics(hatchDateStr: string, breedKey: string) {
  const hatchDate = new Date(hatchDateStr);
  const today = new Date();
  
  // 1. Current Age
  const ageInDays = differenceInDays(today, hatchDate);
  
  // 2. Target Market Date
  const maturityDays = BREEDS[breedKey as keyof typeof BREEDS]?.daysToMaturity || 42;
  const marketReadyDate = addDays(hatchDate, maturityDays);
  
  // 3. Status Calculation
  let status: "BROODING" | "GROWING" | "READY" | "OVERDUE" = "GROWING";
  let color = "bg-blue-100 text-blue-800"; 

  if (ageInDays < 14) {
    status = "BROODING";
    color = "bg-yellow-100 text-yellow-800"; 
  } else if (ageInDays >= maturityDays && ageInDays < maturityDays + 7) {
    status = "READY";
    color = "bg-green-100 text-green-800"; 
  } else if (ageInDays >= maturityDays + 7) {
    status = "OVERDUE";
    color = "bg-red-100 text-red-800"; 
  }

  const progress = Math.min(100, Math.max(0, (ageInDays / maturityDays) * 100));

  return {
    ageInDays,
    marketReadyDate: format(marketReadyDate, "dd MMM yyyy"),
    status,
    statusColor: color,
    progress
  };
}
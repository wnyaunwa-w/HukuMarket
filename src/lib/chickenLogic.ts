import { differenceInDays, parseISO, addDays } from "date-fns";

export const BREEDS: Record<string, { name: string; daysToMaturity: number }> = {
  "COBB_500": { name: "Cobb 500 (Broiler)", daysToMaturity: 42 },
  "ROSS_308": { name: "Ross 308 (Broiler)", daysToMaturity: 42 },
  "SASSO": { name: "Sasso (Free Range)", daysToMaturity: 70 },
  "INDIGENOUS": { name: "Road Runner (Hardbody)", daysToMaturity: 120 },
};

export function getGrowthStage(hatchDate: string) {
  const start = parseISO(hatchDate);
  const today = new Date();
  
  // Calculate days elapsed
  const daysOld = differenceInDays(today, start);
  
  // Standard maturity for broilers is approx 42 days (6 weeks)
  // You can adjust this default or make it dynamic based on breed if needed
  const targetDays = 42; 

  const progress = Math.min((daysOld / targetDays) * 100, 100);
  const daysLeft = Math.max(targetDays - daysOld, 0);

  let stage = "Chicks";
  if (daysOld > 14) stage = "Growing";
  if (daysOld >= targetDays) stage = "Market Ready";

  return { stage, progress, daysLeft, daysOld };
}
import { differenceInDays, addDays, format } from "date-fns";

export const BREEDS = {
  COBB_500: { name: "Cobb 500", daysToMaturity: 42 },
  ROSS_308: { name: "Ross 308", daysToMaturity: 42 },
  SASSO: { name: "Sasso", daysToMaturity: 63 },
  ROAD_RUNNER: { name: "Road Runner", daysToMaturity: 112 },
};

export function getGrowthStage(hatchDateStr: string, breedKey: string = "COBB_500") {
  const hatchDate = new Date(hatchDateStr);
  const today = new Date();
  
  // 1. Calculate basic stats
  const daysOld = differenceInDays(today, hatchDate);
  const maturityDays = BREEDS[breedKey as keyof typeof BREEDS]?.daysToMaturity || 42;
  
  // 2. Calculate Progress
  let progress = (daysOld / maturityDays) * 100;
  if (progress > 100) progress = 100;
  if (progress < 0) progress = 0;

  // 3. Determine Stage
  let stage = "Brooding";
  if (daysOld >= 14) stage = "Growing";
  if (daysOld >= maturityDays - 7) stage = "Finishing";
  if (daysOld >= maturityDays) stage = "Market Ready";

  // 4. Calculate Days Left
  const daysLeft = maturityDays - daysOld;

  // 5. Calculate Exact "Ready Date" (Fix for your error)
  const readyDateObj = addDays(hatchDate, maturityDays);
  const marketReadyDate = format(readyDateObj, "d MMM yyyy"); // e.g., "12 Feb 2026"

  return {
    stage,
    progress,
    daysLeft,
    daysOld,
    marketReadyDate // 👈 Added this missing field
  };
}
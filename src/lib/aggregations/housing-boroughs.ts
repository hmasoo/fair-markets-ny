import { boroughToFips } from "@/lib/geography/crosswalks";

interface Neighborhood {
  name: string;
  borough: string;
  totalUnits: number;
  hhi: number;
  cr4: number;
  nychaUnits: number;
  nychaShare: number;
  universityUnits: number;
  universityShare: number;
  stabilizedUnits: number;
  stabilizedShare: number;
  medianIncome: number | null;
  rentBurdenPct: number | null;
}

export interface BoroughSummary {
  borough: string;
  fips: string;
  totalUnits: number;
  neighborhoods: number;
  hhi: number;
  cr4: number;
  nychaUnits: number;
  nychaShare: number;
  universityUnits: number;
  universityShare: number;
  stabilizedUnits: number;
  stabilizedShare: number;
  medianIncome: number | null;
  rentBurdenPct: number | null;
}

/**
 * Aggregate neighborhood-level housing data to borough level.
 * HHI and CR4 are unit-weighted averages. Income and rent burden
 * are simple averages of neighborhoods that have data.
 */
export function aggregateByBorough(neighborhoods: Neighborhood[]): BoroughSummary[] {
  const byBorough = new Map<string, Neighborhood[]>();

  for (const n of neighborhoods) {
    const list = byBorough.get(n.borough) ?? [];
    list.push(n);
    byBorough.set(n.borough, list);
  }

  const summaries: BoroughSummary[] = [];

  for (const [borough, hoods] of byBorough) {
    const fips = boroughToFips(borough) ?? "";
    const totalUnits = hoods.reduce((s, n) => s + n.totalUnits, 0);
    const nychaUnits = hoods.reduce((s, n) => s + n.nychaUnits, 0);
    const universityUnits = hoods.reduce((s, n) => s + n.universityUnits, 0);
    const stabilizedUnits = hoods.reduce((s, n) => s + n.stabilizedUnits, 0);

    // Unit-weighted average HHI and CR4
    const weightedHHI = totalUnits > 0
      ? hoods.reduce((s, n) => s + n.hhi * n.totalUnits, 0) / totalUnits
      : 0;
    const weightedCR4 = totalUnits > 0
      ? hoods.reduce((s, n) => s + n.cr4 * n.totalUnits, 0) / totalUnits
      : 0;

    // Simple average income/rent burden for hoods with data
    const withIncome = hoods.filter((n) => n.medianIncome && n.medianIncome > 0);
    const medianIncome = withIncome.length > 0
      ? Math.round(withIncome.reduce((s, n) => s + n.medianIncome!, 0) / withIncome.length)
      : null;
    const withRent = hoods.filter((n) => n.rentBurdenPct !== null && n.rentBurdenPct !== undefined);
    const rentBurdenPct = withRent.length > 0
      ? Math.round(withRent.reduce((s, n) => s + n.rentBurdenPct!, 0) / withRent.length * 10) / 10
      : null;

    summaries.push({
      borough,
      fips,
      totalUnits,
      neighborhoods: hoods.length,
      hhi: Math.round(weightedHHI),
      cr4: Math.round(weightedCR4 * 10) / 10,
      nychaUnits,
      nychaShare: totalUnits > 0 ? Math.round((nychaUnits / totalUnits) * 1000) / 10 : 0,
      universityUnits,
      universityShare: totalUnits > 0 ? Math.round((universityUnits / totalUnits) * 1000) / 10 : 0,
      stabilizedUnits,
      stabilizedShare: totalUnits > 0 ? Math.round((stabilizedUnits / totalUnits) * 1000) / 10 : 0,
      medianIncome,
      rentBurdenPct,
    });
  }

  return summaries.sort((a, b) => b.hhi - a.hhi);
}

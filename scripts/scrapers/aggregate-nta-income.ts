/**
 * Aggregate Census ACS tract-level income data to NTA level.
 *
 * Reads:
 *   data/raw/acs-income-tracts-2023.json (from download-acs-income.ts)
 *   data/crosswalks/nta-to-census-tract.json
 *
 * Output:
 *   data/income/nyc-nta-income.json (committed)
 *
 * Aggregation methods:
 *   - MHI: Household-weighted average of tract medians
 *   - Rent burden %: Sum rent-burdened HHs / sum total renter HHs
 *   - Total households: Sum across tracts
 *
 * Usage:
 *   npx tsx scripts/scrapers/aggregate-nta-income.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");

interface TractRecord {
  geoid: string;
  countyFips: string;
  countyName: string;
  tract: string;
  medianIncome: number | null;
  moe: number | null;
  totalHouseholds: number;
  renterHouseholds: number;
  rentBurdened30to35: number;
  rentBurdened35to40: number;
  rentBurdened40to50: number;
  rentBurdened50plus: number;
}

interface CrosswalkEntry {
  geoid: string;
  ntaCode: string;
  ntaName: string;
  boroCode: string;
  boroName: string;
  countyFips: string;
}

interface NTAIncome {
  ntaCode: string;
  ntaName: string;
  boroName: string;
  medianIncome: number;
  rentBurdenPct: number;
  totalHouseholds: number;
  tractCount: number;
}

function main() {
  // Load tract income data
  const tractPath = join(ROOT, "data/raw/acs-income-tracts-2023.json");
  let tracts: TractRecord[];
  try {
    tracts = JSON.parse(readFileSync(tractPath, "utf-8"));
  } catch {
    console.error(`Error: Could not read ${tractPath}`);
    console.error("Run download-acs-income.ts first:");
    console.error("  npx tsx scripts/scrapers/download-acs-income.ts");
    process.exit(1);
  }

  // Load crosswalk
  const crosswalkPath = join(ROOT, "data/crosswalks/nta-to-census-tract.json");
  const crosswalk: CrosswalkEntry[] = JSON.parse(readFileSync(crosswalkPath, "utf-8"));

  console.log(`Loaded ${tracts.length} tracts, ${crosswalk.length} crosswalk entries\n`);

  // Index tracts by geoid
  const tractMap = new Map<string, TractRecord>();
  for (const t of tracts) {
    tractMap.set(t.geoid, t);
  }

  // Group crosswalk entries by NTA
  const ntaGroups = new Map<string, { entries: CrosswalkEntry[]; tracts: TractRecord[] }>();
  let matchedTracts = 0;
  let unmatchedTracts = 0;

  for (const entry of crosswalk) {
    if (!ntaGroups.has(entry.ntaCode)) {
      ntaGroups.set(entry.ntaCode, { entries: [], tracts: [] });
    }
    const group = ntaGroups.get(entry.ntaCode)!;
    group.entries.push(entry);

    const tract = tractMap.get(entry.geoid);
    if (tract) {
      group.tracts.push(tract);
      matchedTracts++;
    } else {
      unmatchedTracts++;
    }
  }

  console.log(`Matched ${matchedTracts} tracts to NTAs, ${unmatchedTracts} unmatched`);
  console.log(`${ntaGroups.size} unique NTAs in crosswalk\n`);

  // Aggregate per NTA
  const results: NTAIncome[] = [];

  for (const [ntaCode, group] of ntaGroups) {
    const { entries, tracts: ntaTracts } = group;
    if (ntaTracts.length === 0) continue;

    const ntaName = entries[0].ntaName;
    const boroName = entries[0].boroName;

    // MHI: Household-weighted average of tract medians
    let weightedIncomeSum = 0;
    let householdWeightSum = 0;
    for (const t of ntaTracts) {
      if (t.medianIncome !== null && t.totalHouseholds > 0) {
        weightedIncomeSum += t.medianIncome * t.totalHouseholds;
        householdWeightSum += t.totalHouseholds;
      }
    }
    const medianIncome = householdWeightSum > 0
      ? Math.round(weightedIncomeSum / householdWeightSum)
      : 0;

    // Rent burden %: sum rent-burdened HHs / sum renter HHs
    let totalRenterHH = 0;
    let totalBurdenedHH = 0;
    for (const t of ntaTracts) {
      totalRenterHH += t.renterHouseholds;
      totalBurdenedHH += t.rentBurdened30to35 + t.rentBurdened35to40 + t.rentBurdened40to50 + t.rentBurdened50plus;
    }
    const rentBurdenPct = totalRenterHH > 0
      ? Math.round((totalBurdenedHH / totalRenterHH) * 1000) / 10
      : 0;

    // Total households
    const totalHouseholds = ntaTracts.reduce((sum, t) => sum + t.totalHouseholds, 0);

    if (medianIncome > 0) {
      results.push({
        ntaCode,
        ntaName,
        boroName,
        medianIncome,
        rentBurdenPct,
        totalHouseholds,
        tractCount: ntaTracts.length,
      });
    }
  }

  results.sort((a, b) => a.ntaCode.localeCompare(b.ntaCode));

  // Write output
  const outDir = join(ROOT, "data/income");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "nyc-nta-income.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2));

  console.log(`Saved ${outPath}`);
  console.log(`  ${results.length} NTAs with income data`);

  // Summary stats
  const incomes = results.map((r) => r.medianIncome).sort((a, b) => a - b);
  const burdens = results.map((r) => r.rentBurdenPct).sort((a, b) => a - b);

  console.log(`\nIncome range: $${incomes[0].toLocaleString()} – $${incomes[incomes.length - 1].toLocaleString()}`);
  console.log(`Median MHI: $${incomes[Math.floor(incomes.length / 2)].toLocaleString()}`);
  console.log(`Rent burden range: ${burdens[0]}% – ${burdens[burdens.length - 1]}%`);

  // Borough breakdown
  const byBoro = new Map<string, number[]>();
  for (const r of results) {
    if (!byBoro.has(r.boroName)) byBoro.set(r.boroName, []);
    byBoro.get(r.boroName)!.push(r.medianIncome);
  }
  console.log("\nBy borough:");
  for (const [boro, incomes] of [...byBoro].sort()) {
    const med = incomes.sort((a, b) => a - b)[Math.floor(incomes.length / 2)];
    console.log(`  ${boro}: ${incomes.length} NTAs, median MHI $${med.toLocaleString()}`);
  }

  console.log("\nDone.");
}

main();

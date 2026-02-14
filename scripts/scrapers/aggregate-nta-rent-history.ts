/**
 * Aggregate ACS median rent data from multiple vintages to NTA level.
 *
 * Reads:
 *   data/raw/acs-rent-tracts-2019.json
 *   data/raw/acs-rent-tracts-2023.json
 *   data/crosswalks/nta-to-census-tract.json
 *   data/geography/nyc-ntas-2020.json
 *
 * Output:
 *   data/concentration/rent-history-neighborhoods.json
 *
 * Aggregation: renter-household-weighted average of tract median rents per NTA.
 * Computes rentGrowthPct as percentage change from 2019 to 2023.
 *
 * Usage:
 *   npx tsx scripts/scrapers/aggregate-nta-rent-history.ts
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");

interface RentTractRecord {
  geoid: string;
  countyFips: string;
  medianRent: number | null;
  renterHouseholds: number;
}

interface CrosswalkEntry {
  geoid: string;
  ntaCode: string;
  ntaName: string;
  boroCode: string;
  boroName: string;
  countyFips: string;
}

interface NTARef {
  ntaCode: string;
  ntaName: string;
  boroName: string;
  countyFips: string;
}

interface RentHistoryEntry {
  year: number;
  medianRent: number;
}

interface NeighborhoodRentHistory {
  ntaCode: string;
  name: string;
  slug: string;
  borough: string;
  rentHistory: RentHistoryEntry[];
  rentGrowthPct: number | null;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const VINTAGES = [2019, 2023];

function main() {
  // Load crosswalk
  const crosswalkPath = join(ROOT, "data/crosswalks/nta-to-census-tract.json");
  const crosswalk: CrosswalkEntry[] = JSON.parse(readFileSync(crosswalkPath, "utf-8"));

  // Load NTA reference data
  const ntaRefPath = join(ROOT, "data/geography/nyc-ntas-2020.json");
  const ntaRefs: NTARef[] = JSON.parse(readFileSync(ntaRefPath, "utf-8"));
  const ntaRefMap = new Map<string, NTARef>();
  for (const ref of ntaRefs) {
    ntaRefMap.set(ref.ntaCode, ref);
  }

  // Build NTA → list of geoids
  const ntaToGeoids = new Map<string, string[]>();
  for (const entry of crosswalk) {
    if (!ntaToGeoids.has(entry.ntaCode)) {
      ntaToGeoids.set(entry.ntaCode, []);
    }
    ntaToGeoids.get(entry.ntaCode)!.push(entry.geoid);
  }

  // Load tract data for each vintage
  const vintageData = new Map<number, Map<string, RentTractRecord>>();

  for (const year of VINTAGES) {
    const path = join(ROOT, `data/raw/acs-rent-tracts-${year}.json`);
    if (!existsSync(path)) {
      console.error(`Error: Missing ${path}`);
      console.error("Run download-acs-rent-history.ts first:");
      console.error("  npx tsx scripts/scrapers/download-acs-rent-history.ts");
      process.exit(1);
    }
    const tracts: RentTractRecord[] = JSON.parse(readFileSync(path, "utf-8"));
    const tractMap = new Map<string, RentTractRecord>();
    for (const t of tracts) {
      tractMap.set(t.geoid, t);
    }
    vintageData.set(year, tractMap);
    console.log(`Loaded ${tracts.length} tracts for ${year}`);
  }

  // Aggregate to NTA level per vintage
  const neighborhoods: NeighborhoodRentHistory[] = [];

  for (const [ntaCode, geoids] of ntaToGeoids) {
    const ref = ntaRefMap.get(ntaCode);
    if (!ref) continue;

    const rentHistory: RentHistoryEntry[] = [];

    for (const year of VINTAGES) {
      const tractMap = vintageData.get(year)!;
      let weightedRentSum = 0;
      let renterWeightSum = 0;

      for (const geoid of geoids) {
        const tract = tractMap.get(geoid);
        if (!tract) continue;
        if (tract.medianRent !== null && tract.renterHouseholds > 0) {
          weightedRentSum += tract.medianRent * tract.renterHouseholds;
          renterWeightSum += tract.renterHouseholds;
        }
      }

      if (renterWeightSum > 0) {
        rentHistory.push({
          year,
          medianRent: Math.round(weightedRentSum / renterWeightSum),
        });
      }
    }

    // Only include NTAs with data for both vintages
    if (rentHistory.length < 2) continue;

    const rent2019 = rentHistory.find((r) => r.year === 2019)?.medianRent;
    const rent2023 = rentHistory.find((r) => r.year === 2023)?.medianRent;

    let rentGrowthPct: number | null = null;
    if (rent2019 && rent2023 && rent2019 > 0) {
      rentGrowthPct = Math.round(((rent2023 - rent2019) / rent2019) * 1000) / 10;
    }

    neighborhoods.push({
      ntaCode,
      name: ref.ntaName,
      slug: toSlug(ref.ntaName),
      borough: ref.boroName,
      rentHistory,
      rentGrowthPct,
    });
  }

  // Sort by NTA code
  neighborhoods.sort((a, b) => a.ntaCode.localeCompare(b.ntaCode));

  const output = {
    source: "U.S. Census Bureau, ACS 5-Year Estimates, Table B25064",
    vintages: VINTAGES.map(String),
    neighborhoods,
  };

  const outPath = join(ROOT, "data/concentration/rent-history-neighborhoods.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`\nSaved ${outPath}`);
  console.log(`  ${neighborhoods.length} NTAs with rent data for both vintages`);

  // Summary stats
  const growths = neighborhoods
    .filter((n) => n.rentGrowthPct !== null)
    .map((n) => n.rentGrowthPct!)
    .sort((a, b) => a - b);

  if (growths.length > 0) {
    console.log(`\nRent growth 2019–2023:`);
    console.log(`  Median: ${growths[Math.floor(growths.length / 2)]}%`);
    console.log(`  Range: ${growths[0]}% – ${growths[growths.length - 1]}%`);
  }

  // Top 5 fastest growing
  const topGrowing = [...neighborhoods]
    .filter((n) => n.rentGrowthPct !== null)
    .sort((a, b) => b.rentGrowthPct! - a.rentGrowthPct!)
    .slice(0, 5);
  console.log("\nTop 5 fastest rent growth:");
  for (const n of topGrowing) {
    const r2019 = n.rentHistory.find((r) => r.year === 2019)?.medianRent;
    const r2023 = n.rentHistory.find((r) => r.year === 2023)?.medianRent;
    console.log(`  ${n.name} (${n.borough}): $${r2019} → $${r2023} (+${n.rentGrowthPct}%)`);
  }

  console.log("\nDone.");
}

main();

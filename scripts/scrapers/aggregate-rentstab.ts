/**
 * Aggregate rent-stabilized unit counts to per-NTA metrics.
 *
 * Reads:
 *   data/raw/rentstab-2023.json (from download-rentstab.ts)
 *   data/raw/pluto-residential.json (for BBL → bct2020 mapping)
 *   data/crosswalks/nta-to-census-tract.json (for geoid → NTA)
 *   data/concentration/housing-neighborhoods.json (to update)
 *
 * Pipeline:
 *   1. Build BBL → bct2020 lookup from PLUTO
 *   2. Map bct2020 → geoid → NTA (same pattern as aggregate-hpd-violations.ts)
 *   3. Sum stabilized units per NTA
 *   4. Compute stabilizedShare = stabilizedUnits / totalUnits for each neighborhood
 *   5. Write updated housing-neighborhoods.json
 *
 * Usage:
 *   npx tsx scripts/scrapers/aggregate-rentstab.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");

// --- Types ---

interface RentStabRecord {
  bbl: string;
  stabilizedUnits: number;
}

interface PlutoRecord {
  ownername: string;
  unitsres: string;
  bct2020: string;
  borocode: string;
  bbl: string;
}

interface CrosswalkEntry {
  geoid: string;
  ntaCode: string;
  ntaName: string;
  boroCode: string;
  boroName: string;
  countyFips: string;
}

interface TopLandlord {
  name: string;
  units: number;
  share: number;
}

interface NeighborhoodEntry {
  name: string;
  slug: string;
  borough: string;
  fips: string;
  ntaCodes: string[];
  totalUnits: number;
  hhi: number;
  cr4: number;
  topLandlords: TopLandlord[];
  nychaUnits: number;
  nychaShare: number;
  universityUnits: number;
  universityShare: number;
  topUniversity: string | null;
  hpdViolationsPerUnit: number;
  stabilizedUnits: number;
  stabilizedShare: number;
  medianRent: number;
  medianIncome: number | null;
  rentBurdenPct: number | null;
}

interface HousingData {
  sector: string;
  geography: string;
  ntaVersion: string;
  source: string;
  incomeSource: string;
  neighborhoods: NeighborhoodEntry[];
}

// Borough code → county FIPS (same as aggregate-hpd-violations.ts)
const BORO_TO_COUNTY_FIPS: Record<string, string> = {
  "1": "061", // Manhattan → New York County
  "2": "005", // Bronx
  "3": "047", // Brooklyn → Kings County
  "4": "081", // Queens
  "5": "085", // Staten Island → Richmond County
};

/**
 * Normalize PLUTO's decimal BBL (e.g. "1000050010.00000000") to 10-digit string.
 */
function normalizePlutoBbl(bbl: string): string {
  const intPart = bbl.split(".")[0];
  return intPart.padStart(10, "0");
}

function main() {
  // Load rent-stabilized data
  const rentstabPath = join(ROOT, "data/raw/rentstab-2023.json");
  let rentstabRecords: RentStabRecord[];
  try {
    rentstabRecords = JSON.parse(readFileSync(rentstabPath, "utf-8"));
  } catch {
    console.error(`Error: Could not read ${rentstabPath}`);
    console.error("Run download-rentstab.ts first:");
    console.error("  npx tsx scripts/scrapers/download-rentstab.ts");
    process.exit(1);
  }

  // Load PLUTO data (for BBL → bct2020 mapping)
  const plutoPath = join(ROOT, "data/raw/pluto-residential.json");
  let plutoRecords: PlutoRecord[];
  try {
    plutoRecords = JSON.parse(readFileSync(plutoPath, "utf-8"));
  } catch {
    console.error(`Error: Could not read ${plutoPath}`);
    console.error("Run download-pluto.ts first:");
    console.error("  npx tsx scripts/scrapers/download-pluto.ts");
    process.exit(1);
  }

  // Load crosswalk (geoid → NTA)
  const crosswalkPath = join(ROOT, "data/crosswalks/nta-to-census-tract.json");
  const crosswalk: CrosswalkEntry[] = JSON.parse(
    readFileSync(crosswalkPath, "utf-8")
  );

  // Load existing housing-neighborhoods.json
  const housingPath = join(ROOT, "data/concentration/housing-neighborhoods.json");
  const housingData: HousingData = JSON.parse(
    readFileSync(housingPath, "utf-8")
  );

  console.log(
    `Loaded ${rentstabRecords.length.toLocaleString()} rent-stabilized buildings`
  );
  console.log(`Loaded ${plutoRecords.length.toLocaleString()} PLUTO parcels`);
  console.log(`Loaded ${crosswalk.length} crosswalk entries`);
  console.log(`Loaded ${housingData.neighborhoods.length} neighborhoods\n`);

  // Step 1: Build BBL → bct2020 lookup from PLUTO
  const bblToBct = new Map<string, string>();
  for (const record of plutoRecords) {
    if (!record.bbl || !record.bct2020) continue;
    const bbl = normalizePlutoBbl(record.bbl);
    bblToBct.set(bbl, record.bct2020);
  }
  console.log(
    `BBL → bct2020 lookup: ${bblToBct.size.toLocaleString()} entries`
  );

  // Step 2: Build geoid → NTA lookup from crosswalk
  const geoidToNta = new Map<string, string>();
  for (const entry of crosswalk) {
    geoidToNta.set(entry.geoid, entry.ntaCode);
  }

  // Step 3: Map each rentstab BBL → bct2020 → geoid → NTA, sum per NTA
  const ntaStabilized = new Map<string, number>();
  let matched = 0;
  let unmatchedBbl = 0;
  let unmatchedNta = 0;
  let totalUnitsMatched = 0;

  for (const record of rentstabRecords) {
    const bbl = record.bbl.padStart(10, "0");
    const bct = bblToBct.get(bbl);
    if (!bct) {
      unmatchedBbl++;
      continue;
    }

    // bct2020 → geoid → NTA
    if (bct.length < 7) {
      unmatchedNta++;
      continue;
    }

    const boroCode = bct.charAt(0);
    const tract = bct.substring(1);
    const countyFips = BORO_TO_COUNTY_FIPS[boroCode];
    if (!countyFips) {
      unmatchedNta++;
      continue;
    }

    const geoid = `36${countyFips}${tract}`;
    const ntaCode = geoidToNta.get(geoid);
    if (!ntaCode) {
      unmatchedNta++;
      continue;
    }

    ntaStabilized.set(
      ntaCode,
      (ntaStabilized.get(ntaCode) || 0) + record.stabilizedUnits
    );
    matched++;
    totalUnitsMatched += record.stabilizedUnits;
  }

  console.log(`\nRent-stabilized buildings:`);
  console.log(`  Matched to NTA: ${matched.toLocaleString()}`);
  console.log(
    `  Unmatched BBL (not in PLUTO): ${unmatchedBbl.toLocaleString()}`
  );
  console.log(
    `  Unmatched NTA (no crosswalk): ${unmatchedNta.toLocaleString()}`
  );
  console.log(
    `  Total stabilized units matched: ${totalUnitsMatched.toLocaleString()}`
  );

  // Step 4: Update each neighborhood's stabilized fields
  // Build NTA code → neighborhood index for fast lookup
  const ntaToNeighborhood = new Map<string, number>();
  for (let i = 0; i < housingData.neighborhoods.length; i++) {
    const n = housingData.neighborhoods[i];
    for (const code of n.ntaCodes) {
      ntaToNeighborhood.set(code, i);
    }
  }

  let updated = 0;
  for (const n of housingData.neighborhoods) {
    // Sum stabilized units across all NTA codes for this neighborhood
    let stabUnits = 0;
    for (const code of n.ntaCodes) {
      stabUnits += ntaStabilized.get(code) || 0;
    }

    n.stabilizedUnits = stabUnits;
    n.stabilizedShare =
      n.totalUnits > 0
        ? Math.round((stabUnits / n.totalUnits) * 1000) / 10
        : 0;

    if (stabUnits > 0) updated++;
  }

  // Write updated file
  writeFileSync(housingPath, JSON.stringify(housingData, null, 2));

  console.log(
    `\nUpdated ${updated} neighborhoods in housing-neighborhoods.json`
  );

  // Top 10 by stabilized share
  const ranked = [...housingData.neighborhoods]
    .filter((n) => n.stabilizedShare > 0)
    .sort((a, b) => b.stabilizedShare - a.stabilizedShare);

  console.log(`\nTop 10 neighborhoods by rent-stabilized share:`);
  for (const n of ranked.slice(0, 10)) {
    console.log(
      `  ${n.name} (${n.borough}): ${n.stabilizedShare}% (${n.stabilizedUnits.toLocaleString()} units of ${n.totalUnits.toLocaleString()})`
    );
  }

  // Borough breakdown
  const boroStats = new Map<
    string,
    { stabilized: number; total: number }
  >();
  for (const n of housingData.neighborhoods) {
    if (!boroStats.has(n.borough)) {
      boroStats.set(n.borough, { stabilized: 0, total: 0 });
    }
    const stats = boroStats.get(n.borough)!;
    stats.stabilized += n.stabilizedUnits;
    stats.total += n.totalUnits;
  }

  console.log("\nBorough breakdown:");
  for (const [boro, stats] of [...boroStats].sort()) {
    const share =
      stats.total > 0
        ? (Math.round((stats.stabilized / stats.total) * 1000) / 10).toFixed(1)
        : "0.0";
    console.log(
      `  ${boro}: ${stats.stabilized.toLocaleString()} stabilized of ${stats.total.toLocaleString()} total (${share}%)`
    );
  }

  // Summary
  const withData = housingData.neighborhoods.filter(
    (n) => n.stabilizedUnits > 0
  ).length;
  const withoutData = housingData.neighborhoods.length - withData;
  console.log(
    `\nNeighborhoods with stabilized data: ${withData}, without: ${withoutData}`
  );

  console.log("\nDone.");
}

main();

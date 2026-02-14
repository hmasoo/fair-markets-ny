/**
 * Aggregate HPD violations to per-NTA violations-per-unit metrics.
 *
 * Reads:
 *   data/raw/hpd-violations.json (from download-hpd-violations.ts)
 *   data/raw/pluto-residential.json (for BBL → bct2020 mapping)
 *   data/crosswalks/nta-to-census-tract.json (for geoid → NTA)
 *   data/concentration/housing-neighborhoods.json (to update)
 *
 * Pipeline:
 *   1. Build BBL → bct2020 lookup from PLUTO
 *   2. Map bct2020 → geoid → NTA (same pattern as aggregate-pluto-ownership.ts)
 *   3. Count Class B+C violations per NTA
 *   4. Compute hpdViolationsPerUnit = classBC / totalUnits for each neighborhood
 *   5. Write updated housing-neighborhoods.json
 *
 * Usage:
 *   npx tsx scripts/scrapers/aggregate-hpd-violations.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");

// --- Types ---

interface HpdViolationRecord {
  boroid: string;
  block: string;
  lot: string;
  class: string;
  inspectiondate: string;
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
  hpdViolationsPerUnit: number;
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

// Borough code → county FIPS (same as aggregate-pluto-ownership.ts)
const BORO_TO_COUNTY_FIPS: Record<string, string> = {
  "1": "061", // Manhattan → New York County
  "2": "005", // Bronx
  "3": "047", // Brooklyn → Kings County
  "4": "081", // Queens
  "5": "085", // Staten Island → Richmond County
};

/**
 * Build a 10-digit BBL string from HPD fields.
 * boroid (1 digit) + block (zero-padded to 5) + lot (zero-padded to 4)
 */
function buildBbl(boroid: string, block: string, lot: string): string {
  return boroid + block.padStart(5, "0") + lot.padStart(4, "0");
}

/**
 * Normalize PLUTO's decimal BBL (e.g. "1000050010.00000000") to 10-digit string.
 */
function normalizePlutoBbl(bbl: string): string {
  const intPart = bbl.split(".")[0];
  return intPart.padStart(10, "0");
}

function main() {
  // Load HPD violations
  const hpdPath = join(ROOT, "data/raw/hpd-violations.json");
  let hpdRecords: HpdViolationRecord[];
  try {
    hpdRecords = JSON.parse(readFileSync(hpdPath, "utf-8"));
  } catch {
    console.error(`Error: Could not read ${hpdPath}`);
    console.error("Run download-hpd-violations.ts first:");
    console.error("  npx tsx scripts/scrapers/download-hpd-violations.ts");
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
  const crosswalk: CrosswalkEntry[] = JSON.parse(readFileSync(crosswalkPath, "utf-8"));

  // Load existing housing-neighborhoods.json
  const housingPath = join(ROOT, "data/concentration/housing-neighborhoods.json");
  const housingData: HousingData = JSON.parse(readFileSync(housingPath, "utf-8"));

  console.log(`Loaded ${hpdRecords.length.toLocaleString()} HPD violations`);
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
  console.log(`BBL → bct2020 lookup: ${bblToBct.size.toLocaleString()} entries`);

  // Step 2: Build geoid → NTA lookup from crosswalk
  const geoidToNta = new Map<string, string>();
  for (const entry of crosswalk) {
    geoidToNta.set(entry.geoid, entry.ntaCode);
  }

  // Step 3: Count Class B+C violations per NTA
  const ntaViolations = new Map<string, number>();
  let matched = 0;
  let unmatchedBbl = 0;
  let unmatchedNta = 0;
  let skippedClassA = 0;

  for (const record of hpdRecords) {
    // Only count Class B (hazardous) and Class C (immediately hazardous)
    const cls = (record.class || "").toUpperCase();
    if (cls !== "B" && cls !== "C") {
      skippedClassA++;
      continue;
    }

    const bbl = buildBbl(record.boroid, record.block, record.lot);
    const bct = bblToBct.get(bbl);
    if (!bct) {
      unmatchedBbl++;
      continue;
    }

    // bct2020 → geoid → NTA (same logic as aggregate-pluto-ownership.ts)
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

    ntaViolations.set(ntaCode, (ntaViolations.get(ntaCode) || 0) + 1);
    matched++;
  }

  console.log(`\nClass B+C violations: ${(matched + unmatchedBbl + unmatchedNta).toLocaleString()}`);
  console.log(`  Matched to NTA: ${matched.toLocaleString()}`);
  console.log(`  Unmatched BBL (not in PLUTO): ${unmatchedBbl.toLocaleString()}`);
  console.log(`  Unmatched NTA (no crosswalk): ${unmatchedNta.toLocaleString()}`);
  console.log(`  Skipped Class A: ${skippedClassA.toLocaleString()}`);

  // Step 4: Update each neighborhood's hpdViolationsPerUnit
  // Build NTA code → neighborhood index for fast lookup
  const ntaToNeighborhood = new Map<string, number>();
  for (let i = 0; i < housingData.neighborhoods.length; i++) {
    const n = housingData.neighborhoods[i];
    for (const code of n.ntaCodes) {
      ntaToNeighborhood.set(code, i);
    }
  }

  let updated = 0;
  for (const [ntaCode, violations] of ntaViolations) {
    const idx = ntaToNeighborhood.get(ntaCode);
    if (idx === undefined) continue;

    const neighborhood = housingData.neighborhoods[idx];
    if (neighborhood.totalUnits > 0) {
      neighborhood.hpdViolationsPerUnit =
        Math.round((violations / neighborhood.totalUnits) * 100) / 100;
      updated++;
    }
  }

  // Write updated file
  writeFileSync(housingPath, JSON.stringify(housingData, null, 2));

  console.log(`\nUpdated ${updated} neighborhoods in housing-neighborhoods.json`);

  // Top 10 by violations/unit
  const ranked = [...housingData.neighborhoods]
    .filter((n) => n.hpdViolationsPerUnit > 0)
    .sort((a, b) => b.hpdViolationsPerUnit - a.hpdViolationsPerUnit);

  console.log(`\nTop 10 neighborhoods by HPD violations/unit (Class B+C):`);
  for (const n of ranked.slice(0, 10)) {
    const ntaCode = n.ntaCodes[0];
    const count = ntaViolations.get(ntaCode) || 0;
    console.log(
      `  ${n.name} (${n.borough}): ${n.hpdViolationsPerUnit} violations/unit (${count.toLocaleString()} violations, ${n.totalUnits.toLocaleString()} units)`
    );
  }

  // Borough breakdown
  const boroStats = new Map<string, { violations: number; units: number }>();
  for (const n of housingData.neighborhoods) {
    if (!boroStats.has(n.borough)) {
      boroStats.set(n.borough, { violations: 0, units: 0 });
    }
    const stats = boroStats.get(n.borough)!;
    for (const code of n.ntaCodes) {
      stats.violations += ntaViolations.get(code) || 0;
    }
    stats.units += n.totalUnits;
  }

  console.log("\nBorough breakdown:");
  for (const [boro, stats] of [...boroStats].sort()) {
    const rate =
      stats.units > 0
        ? (Math.round((stats.violations / stats.units) * 100) / 100).toFixed(2)
        : "0.00";
    console.log(
      `  ${boro}: ${stats.violations.toLocaleString()} violations, ${stats.units.toLocaleString()} units, ${rate} violations/unit`
    );
  }

  // Summary
  const withData = housingData.neighborhoods.filter(
    (n) => n.hpdViolationsPerUnit > 0
  ).length;
  const withoutData = housingData.neighborhoods.length - withData;
  console.log(
    `\nNeighborhoods with violation data: ${withData}, without: ${withoutData}`
  );

  console.log("\nDone.");
}

main();

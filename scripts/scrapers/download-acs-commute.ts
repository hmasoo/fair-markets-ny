/**
 * Download ACS 2023 5-year tract-level commute data for NYC.
 *
 * Source: U.S. Census Bureau — American Community Survey 5-Year Estimates
 * Variables:
 *   B08301_001E — Total workers 16+ (means of transportation universe)
 *   B08301_010E — Public transportation (excluding taxicab)
 *   B08301_002E — Car, truck, or van (total)
 *   B08301_003E — Drove alone
 *   B08301_004E — Carpooled
 *   B08301_018E — Bicycle
 *   B08301_019E — Walked
 *   B08301_021E — Worked from home
 *   B08013_001E — Aggregate travel time to work (minutes)
 *   B08303_001E — Total workers (travel time universe)
 *   B25044_001E — Total occupied housing units (vehicles available universe)
 *   B25044_003E — Renter: no vehicle available
 *   B25044_010E — Owner: no vehicle available
 *   B25044_002E — Owner-occupied total
 *   B25044_009E — Renter-occupied total
 *
 * Requires: CENSUS_API_KEY env var (free from https://api.census.gov/data/key_signup.html)
 *
 * Output: data/raw/acs-commute-tracts-2023.json (gitignored)
 *
 * Usage:
 *   npx tsx scripts/scrapers/download-acs-commute.ts
 */

import "dotenv/config";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");
const RAW_DIR = join(ROOT, "data/raw");

const API_KEY = process.env.CENSUS_API_KEY;
if (!API_KEY) {
  console.error("Error: CENSUS_API_KEY env var is required.");
  console.error("Get a free key at https://api.census.gov/data/key_signup.html");
  process.exit(1);
}

// NYC county FIPS codes (within NY state FIPS 36)
const NYC_COUNTIES: Record<string, string> = {
  "061": "New York (Manhattan)",
  "005": "Bronx",
  "047": "Kings (Brooklyn)",
  "081": "Queens",
  "085": "Richmond (Staten Island)",
};

const VARIABLES = [
  "B08301_001E", // Total workers 16+
  "B08301_010E", // Public transportation
  "B08301_003E", // Drove alone
  "B08301_004E", // Carpooled
  "B08301_018E", // Bicycle
  "B08301_019E", // Walked
  "B08301_021E", // Worked from home
  "B08013_001E", // Aggregate travel time (minutes)
  "B08303_001E", // Total workers (travel time universe)
  "B25044_001E", // Total occupied units (vehicles universe)
  "B25044_003E", // Renter: no vehicle
  "B25044_010E", // Owner: no vehicle
  "B25044_002E", // Owner-occupied total
  "B25044_009E", // Renter-occupied total
].join(",");

const BASE_URL = "https://api.census.gov/data/2023/acs/acs5";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface TractCommute {
  geoid: string;
  countyFips: string;
  countyName: string;
  tract: string;
  totalWorkers: number;
  transitWorkers: number;
  droveAlone: number;
  carpooled: number;
  bicycle: number;
  walked: number;
  wfh: number;
  aggTravelTime: number;
  travelTimeWorkers: number;
  totalOccupiedUnits: number;
  renterNoVehicle: number;
  ownerNoVehicle: number;
  ownerOccupied: number;
  renterOccupied: number;
}

function parseNum(val: string | null | undefined): number | null {
  if (val === null || val === undefined || val === "" || val === "-666666666") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

async function fetchCounty(countyFips: string, countyName: string): Promise<TractCommute[]> {
  const url = `${BASE_URL}?get=NAME,${VARIABLES}&for=tract:*&in=state:36+county:${countyFips}&key=${API_KEY}`;

  console.log(`  Fetching ${countyName} (county ${countyFips})...`);

  const res = await fetch(url, {
    headers: { "User-Agent": "FairMarketsNY/0.1 (civic data project)" },
  });

  if (!res.ok) {
    throw new Error(`Census API error for county ${countyFips}: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as string[][];
  const headers = data[0];
  const rows = data.slice(1);

  console.log(`    ${rows.length} tracts`);

  return rows.map((row) => {
    const get = (col: string) => row[headers.indexOf(col)];
    const state = get("state");
    const county = get("county");
    const tract = get("tract");

    return {
      geoid: `${state}${county}${tract}`,
      countyFips: county,
      countyName,
      tract,
      totalWorkers: parseNum(get("B08301_001E")) ?? 0,
      transitWorkers: parseNum(get("B08301_010E")) ?? 0,
      droveAlone: parseNum(get("B08301_003E")) ?? 0,
      carpooled: parseNum(get("B08301_004E")) ?? 0,
      bicycle: parseNum(get("B08301_018E")) ?? 0,
      walked: parseNum(get("B08301_019E")) ?? 0,
      wfh: parseNum(get("B08301_021E")) ?? 0,
      aggTravelTime: parseNum(get("B08013_001E")) ?? 0,
      travelTimeWorkers: parseNum(get("B08303_001E")) ?? 0,
      totalOccupiedUnits: parseNum(get("B25044_001E")) ?? 0,
      renterNoVehicle: parseNum(get("B25044_003E")) ?? 0,
      ownerNoVehicle: parseNum(get("B25044_010E")) ?? 0,
      ownerOccupied: parseNum(get("B25044_002E")) ?? 0,
      renterOccupied: parseNum(get("B25044_009E")) ?? 0,
    };
  });
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });

  console.log("Downloading ACS 2023 5-year tract-level commute data for NYC...\n");

  const allTracts: TractCommute[] = [];
  const counties = Object.entries(NYC_COUNTIES);

  for (let i = 0; i < counties.length; i++) {
    const [fips, name] = counties[i];
    const tracts = await fetchCounty(fips, name);
    allTracts.push(...tracts);

    // Rate limit: 1-second delay between requests
    if (i < counties.length - 1) await sleep(1000);
  }

  const outPath = join(RAW_DIR, "acs-commute-tracts-2023.json");
  writeFileSync(outPath, JSON.stringify(allTracts, null, 2));

  console.log(`\nSaved ${outPath}`);
  console.log(`Total: ${allTracts.length} tracts across ${counties.length} counties`);

  // Summary stats
  const withWorkers = allTracts.filter((t) => t.totalWorkers > 0);
  const totalWorkers = withWorkers.reduce((s, t) => s + t.totalWorkers, 0);
  const totalTransit = withWorkers.reduce((s, t) => s + t.transitWorkers, 0);
  const totalDrove = withWorkers.reduce((s, t) => s + t.droveAlone, 0);
  const totalWfh = withWorkers.reduce((s, t) => s + t.wfh, 0);

  console.log(`\nTracts with worker data: ${withWorkers.length}/${allTracts.length}`);
  console.log(`Total workers: ${totalWorkers.toLocaleString()}`);
  console.log(`  Transit: ${((totalTransit / totalWorkers) * 100).toFixed(1)}%`);
  console.log(`  Drove alone: ${((totalDrove / totalWorkers) * 100).toFixed(1)}%`);
  console.log(`  WFH: ${((totalWfh / totalWorkers) * 100).toFixed(1)}%`);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

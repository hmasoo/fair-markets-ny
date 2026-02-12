/**
 * Download ACS 2023 5-year tract-level income and rent burden data for NYC.
 *
 * Source: U.S. Census Bureau — American Community Survey 5-Year Estimates
 * Variables:
 *   B19013_001E — Median household income (estimate)
 *   B19013_001M — Median household income (margin of error)
 *   B11001_001E — Total households
 *   B25070_001E — Total renter-occupied units (gross rent as % of income universe)
 *   B25070_007E — Rent 30.0 to 34.9%
 *   B25070_008E — Rent 35.0 to 39.9%
 *   B25070_009E — Rent 40.0 to 49.9%
 *   B25070_010E — Rent 50.0% or more
 *
 * Requires: CENSUS_API_KEY env var (free from https://api.census.gov/data/key_signup.html)
 *
 * Output: data/raw/acs-income-tracts-2023.json (gitignored)
 *
 * Usage:
 *   npx tsx scripts/scrapers/download-acs-income.ts
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
  "B19013_001E", // Median household income
  "B19013_001M", // MHI margin of error
  "B11001_001E", // Total households
  "B25070_001E", // Renter HHs (gross rent % income universe)
  "B25070_007E", // Rent 30.0–34.9%
  "B25070_008E", // Rent 35.0–39.9%
  "B25070_009E", // Rent 40.0–49.9%
  "B25070_010E", // Rent 50.0% or more
].join(",");

const BASE_URL = "https://api.census.gov/data/2023/acs/acs5";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

function parseNum(val: string | null | undefined): number | null {
  if (val === null || val === undefined || val === "" || val === "-666666666") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

async function fetchCounty(countyFips: string, countyName: string): Promise<TractRecord[]> {
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
      medianIncome: parseNum(get("B19013_001E")),
      moe: parseNum(get("B19013_001M")),
      totalHouseholds: parseNum(get("B11001_001E")) ?? 0,
      renterHouseholds: parseNum(get("B25070_001E")) ?? 0,
      rentBurdened30to35: parseNum(get("B25070_007E")) ?? 0,
      rentBurdened35to40: parseNum(get("B25070_008E")) ?? 0,
      rentBurdened40to50: parseNum(get("B25070_009E")) ?? 0,
      rentBurdened50plus: parseNum(get("B25070_010E")) ?? 0,
    };
  });
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });

  console.log("Downloading ACS 2023 5-year tract-level income data for NYC...\n");

  const allTracts: TractRecord[] = [];
  const counties = Object.entries(NYC_COUNTIES);

  for (let i = 0; i < counties.length; i++) {
    const [fips, name] = counties[i];
    const tracts = await fetchCounty(fips, name);
    allTracts.push(...tracts);

    // Rate limit: 1-second delay between requests
    if (i < counties.length - 1) await sleep(1000);
  }

  const outPath = join(RAW_DIR, "acs-income-tracts-2023.json");
  writeFileSync(outPath, JSON.stringify(allTracts, null, 2));

  console.log(`\nSaved ${outPath}`);
  console.log(`Total: ${allTracts.length} tracts across ${counties.length} counties`);

  // Summary stats
  const withIncome = allTracts.filter((t) => t.medianIncome !== null);
  const incomes = withIncome.map((t) => t.medianIncome!).sort((a, b) => a - b);
  console.log(`\nTracts with income data: ${withIncome.length}/${allTracts.length}`);
  if (incomes.length > 0) {
    console.log(`  Median of medians: $${incomes[Math.floor(incomes.length / 2)].toLocaleString()}`);
    console.log(`  Range: $${incomes[0].toLocaleString()} – $${incomes[incomes.length - 1].toLocaleString()}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

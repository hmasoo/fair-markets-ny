/**
 * Download ACS tract-level median rent data for multiple vintages (NYC).
 *
 * Fetches B25064_001E (median gross rent) for 2019 and 2023 ACS 5-year
 * estimates, plus B25070_001E (renter households) for weighting.
 *
 * These two non-overlapping windows give a clean pre-COVID vs. latest
 * comparison without the noise of overlapping intermediate years.
 *
 * Source: U.S. Census Bureau — American Community Survey 5-Year Estimates
 *
 * Requires: CENSUS_API_KEY env var
 *
 * Output: data/raw/acs-rent-tracts-{year}.json (one file per vintage)
 *
 * Usage:
 *   npx tsx scripts/scrapers/download-acs-rent-history.ts
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

const VINTAGES = [2019, 2023];

const VARIABLES = [
  "B25064_001E", // Median gross rent
  "B25070_001E", // Renter households (for weighting)
].join(",");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RentTractRecord {
  geoid: string;
  countyFips: string;
  countyName: string;
  tract: string;
  medianRent: number | null;
  renterHouseholds: number;
}

function parseNum(val: string | null | undefined): number | null {
  if (val === null || val === undefined || val === "" || val === "-666666666") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

async function fetchCounty(
  year: number,
  countyFips: string,
  countyName: string,
): Promise<RentTractRecord[]> {
  const baseUrl = `https://api.census.gov/data/${year}/acs/acs5`;
  const url = `${baseUrl}?get=NAME,${VARIABLES}&for=tract:*&in=state:36+county:${countyFips}&key=${API_KEY}`;

  console.log(`  Fetching ${countyName} (county ${countyFips})...`);

  const res = await fetch(url, {
    headers: { "User-Agent": "FairMarketsNY/0.1 (civic data project)" },
  });

  if (!res.ok) {
    throw new Error(`Census API error for county ${countyFips} year ${year}: ${res.status} ${res.statusText}`);
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
      medianRent: parseNum(get("B25064_001E")),
      renterHouseholds: parseNum(get("B25070_001E")) ?? 0,
    };
  });
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });

  for (const year of VINTAGES) {
    console.log(`\nDownloading ACS ${year} 5-year median rent data for NYC...\n`);

    const allTracts: RentTractRecord[] = [];
    const counties = Object.entries(NYC_COUNTIES);

    for (let i = 0; i < counties.length; i++) {
      const [fips, name] = counties[i];
      const tracts = await fetchCounty(year, fips, name);
      allTracts.push(...tracts);

      // Rate limit: 1-second delay between requests
      if (i < counties.length - 1) await sleep(1000);
    }

    const outPath = join(RAW_DIR, `acs-rent-tracts-${year}.json`);
    writeFileSync(outPath, JSON.stringify(allTracts, null, 2));

    console.log(`\nSaved ${outPath}`);
    console.log(`Total: ${allTracts.length} tracts across ${counties.length} counties`);

    // Summary stats
    const withRent = allTracts.filter((t) => t.medianRent !== null);
    const rents = withRent.map((t) => t.medianRent!).sort((a, b) => a - b);
    console.log(`Tracts with rent data: ${withRent.length}/${allTracts.length}`);
    if (rents.length > 0) {
      console.log(`  Median of medians: $${rents[Math.floor(rents.length / 2)].toLocaleString()}`);
      console.log(`  Range: $${rents[0].toLocaleString()} – $${rents[rents.length - 1].toLocaleString()}`);
    }

    // Delay between vintages
    if (year !== VINTAGES[VINTAGES.length - 1]) {
      console.log("\nWaiting before next vintage...");
      await sleep(2000);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

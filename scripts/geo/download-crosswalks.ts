/**
 * Download NTA-to-census-tract crosswalk from NYC Open Data (Socrata API).
 *
 * Source: NYC DCP — 2020 Census Tracts to 2020 NTAs and CDTAs Equivalency
 * Dataset: https://data.cityofnewyork.us/City-Government/2020-Census-Tracts-to-2020-NTAs-and-CDTAs-Equivale/hm78-6dwm
 *
 * Output:
 *   data/crosswalks/nta-to-census-tract.json
 *
 * Usage:
 *   npx tsx scripts/geo/download-crosswalks.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");
const CROSSWALK_DIR = join(ROOT, "data/crosswalks");

const ENDPOINT = "https://data.cityofnewyork.us/resource/hm78-6dwm.json";

async function main() {
  mkdirSync(CROSSWALK_DIR, { recursive: true });

  console.log("Fetching NTA-to-census-tract crosswalk from NYC Open Data...");

  const url = `${ENDPOINT}?$limit=5000`;
  const res = await fetch(url, {
    headers: { "User-Agent": "FairMarketsNY/0.1 (civic data project)" },
  });

  if (!res.ok) {
    throw new Error(`Socrata API error: ${res.status} ${res.statusText}`);
  }

  const raw = (await res.json()) as Record<string, unknown>[];
  console.log(`  Received ${raw.length} tract-to-NTA records`);

  // Standardize field names (handle varying Socrata casing)
  const records = raw.map((r) => ({
    geoid: String(r.geoid ?? r.GEOID ?? ""),
    ntaCode: String(r.ntacode ?? r.ntaCode ?? r.nta2020 ?? ""),
    ntaName: String(r.ntaname ?? r.NTAName ?? ""),
    boroCode: String(r.borocode ?? r.BoroCode ?? ""),
    boroName: String(r.boroname ?? r.BoroName ?? ""),
    countyFips: String(r.countyfips ?? r.CountyFIPS ?? ""),
  }));

  records.sort(
    (a, b) => a.ntaCode.localeCompare(b.ntaCode) || a.geoid.localeCompare(b.geoid)
  );

  const outPath = join(CROSSWALK_DIR, "nta-to-census-tract.json");
  writeFileSync(outPath, JSON.stringify(records, null, 2));
  console.log(`  Saved ${outPath} (${records.length} records)`);

  const ntaCodes = new Set(records.map((r) => r.ntaCode));
  console.log(`  ${ntaCodes.size} unique NTA codes, ${records.length} census tracts`);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

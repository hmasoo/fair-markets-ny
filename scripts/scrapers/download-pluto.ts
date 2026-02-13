/**
 * Download residential parcels from NYC MapPLUTO via Socrata API.
 *
 * Source: NYC Dept. of City Planning — MapPLUTO 24v4
 * Dataset: 64uk-42ks (PLUTO latest)
 *
 * Filters to parcels with at least 1 residential unit (unitsres > 0).
 * Selects minimal columns: ownername, unitsres, bct2020, borocode, bbl
 *
 * Output: data/raw/pluto-residential.json (gitignored)
 *
 * Usage:
 *   npx tsx scripts/scrapers/download-pluto.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");
const RAW_DIR = join(ROOT, "data/raw");

const DATASET_ID = "64uk-42ks";
const BASE_URL = `https://data.cityofnewyork.us/resource/${DATASET_ID}.json`;

const PAGE_SIZE = 50000;
const USER_AGENT = "FairMarketsNY/0.1 (civic data project)";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PlutoRecord {
  ownername: string;
  unitsres: string; // Socrata returns numbers as strings
  bct2020: string;
  borocode: string;
  bbl: string;
}

async function fetchPage(offset: number): Promise<PlutoRecord[]> {
  const params = new URLSearchParams({
    $where: "unitsres > 0",
    $select: "ownername,unitsres,bct2020,borocode,bbl",
    $order: "bbl",
    $limit: String(PAGE_SIZE),
    $offset: String(offset),
  });

  const url = `${BASE_URL}?${params}`;
  console.log(`  Fetching offset ${offset}...`);

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Socrata API error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as PlutoRecord[];
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });

  console.log("Downloading residential parcels from MapPLUTO (Socrata)...\n");

  const allRecords: PlutoRecord[] = [];
  let offset = 0;
  let page = 1;

  while (true) {
    const records = await fetchPage(offset);
    console.log(`    Page ${page}: ${records.length} records`);

    allRecords.push(...records);

    if (records.length < PAGE_SIZE) break;

    offset += PAGE_SIZE;
    page++;

    // Rate limit: 1-second delay between requests
    await sleep(1000);
  }

  const outPath = join(RAW_DIR, "pluto-residential.json");
  writeFileSync(outPath, JSON.stringify(allRecords, null, 2));

  console.log(`\nSaved ${outPath}`);
  console.log(`Total: ${allRecords.length} residential parcels across ${page} pages`);

  // Summary stats
  const totalUnits = allRecords.reduce(
    (sum, r) => sum + (parseInt(r.unitsres, 10) || 0),
    0
  );
  const uniqueOwners = new Set(allRecords.map((r) => r.ownername)).size;
  const boroCounts = new Map<string, number>();
  for (const r of allRecords) {
    boroCounts.set(r.borocode, (boroCounts.get(r.borocode) || 0) + 1);
  }

  console.log(`Total residential units: ${totalUnits.toLocaleString()}`);
  console.log(`Unique owner names (raw): ${uniqueOwners.toLocaleString()}`);
  console.log("\nBy borough code:");
  for (const [boro, count] of [...boroCounts].sort()) {
    const boroNames: Record<string, string> = {
      "1": "Manhattan",
      "2": "Bronx",
      "3": "Brooklyn",
      "4": "Queens",
      "5": "Staten Island",
    };
    console.log(`  ${boroNames[boro] || boro}: ${count.toLocaleString()} parcels`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

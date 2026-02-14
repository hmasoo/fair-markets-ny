/**
 * Download HPD violations from NYC Open Data via Socrata API.
 *
 * Source: NYC Dept. of Housing Preservation & Development — Housing Maintenance Code Violations
 * Dataset: wvxf-dwi5
 *
 * Filters to violations with inspectiondate >= 2023-01-01 (last 3 years).
 * Selects: boroid, block, lot, class, inspectiondate
 *
 * Output: data/raw/hpd-violations.json (gitignored)
 *
 * Usage:
 *   npx tsx scripts/scrapers/download-hpd-violations.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");
const RAW_DIR = join(ROOT, "data/raw");

const DATASET_ID = "wvxf-dwi5";
const BASE_URL = `https://data.cityofnewyork.us/resource/${DATASET_ID}.json`;

const PAGE_SIZE = 50000;
const USER_AGENT = "FairMarketsNY/0.1 (civic data project)";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface HpdViolationRecord {
  boroid: string;
  block: string;
  lot: string;
  class: string;
  inspectiondate: string;
}

async function fetchPage(offset: number): Promise<HpdViolationRecord[]> {
  const params = new URLSearchParams({
    $where: "inspectiondate >= '2023-01-01'",
    $select: "boroid,block,lot,class,inspectiondate",
    $order: "violationid",
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

  return (await res.json()) as HpdViolationRecord[];
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });

  console.log("Downloading HPD violations from NYC Open Data (Socrata)...\n");

  const allRecords: HpdViolationRecord[] = [];
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

  const outPath = join(RAW_DIR, "hpd-violations.json");
  writeFileSync(outPath, JSON.stringify(allRecords, null, 2));

  console.log(`\nSaved ${outPath}`);
  console.log(`Total: ${allRecords.length.toLocaleString()} violations across ${page} pages`);

  // Summary: breakdown by class
  const classCounts = new Map<string, number>();
  for (const r of allRecords) {
    const cls = (r.class || "Unknown").toUpperCase();
    classCounts.set(cls, (classCounts.get(cls) || 0) + 1);
  }

  console.log("\nBy violation class:");
  for (const [cls, count] of [...classCounts].sort()) {
    console.log(`  Class ${cls}: ${count.toLocaleString()}`);
  }

  // Summary: breakdown by borough
  const boroCounts = new Map<string, number>();
  for (const r of allRecords) {
    boroCounts.set(r.boroid, (boroCounts.get(r.boroid) || 0) + 1);
  }

  const boroNames: Record<string, string> = {
    "1": "Manhattan",
    "2": "Bronx",
    "3": "Brooklyn",
    "4": "Queens",
    "5": "Staten Island",
  };

  console.log("\nBy borough:");
  for (const [boro, count] of [...boroCounts].sort()) {
    console.log(`  ${boroNames[boro] || boro}: ${count.toLocaleString()}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

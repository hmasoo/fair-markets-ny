/**
 * Download SPARCS Hospital Inpatient Cost Transparency data for target DRGs.
 *
 * Source: NYS DOH — Hospital Inpatient Cost Transparency (SPARCS)
 * Endpoint: https://health.data.ny.gov/resource/7dtz-qxmr.json
 * Years available: 2009–2017, 2021 (no 2018–2020)
 *
 * Target DRGs:
 *   560 — Vaginal Delivery
 *   540 — Cesarean Delivery
 *   326 — Knee Joint Replacement
 *   324 — Hip Joint Replacement
 *   194 — Heart Failure
 *   139 — Other Pneumonia
 *
 * No API key required (Socrata open data).
 *
 * Output: data/raw/sparcs-hospital-costs.json (gitignored)
 *
 * Usage:
 *   npx tsx scripts/scrapers/download-sparcs-pricing.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");
const RAW_DIR = join(ROOT, "data/raw");

const ENDPOINT = "https://health.data.ny.gov/resource/7dtz-qxmr.json";
const TARGET_DRGS = ["560", "540", "326", "324", "194", "139"];
const PAGE_SIZE = 50000;

interface SparcsRecord {
  year: string;
  pfi: string;
  facility_name: string;
  apr_drg_code: string;
  apr_drg_description: string;
  apr_severity_of_illness_code: string;
  apr_severity_of_illness_description: string;
  apr_medical_surgical_code: string;
  apr_medical_surgical_description: string;
  discharges: string;
  mean_charge: string;
  median_charge: string;
  mean_cost: string;
  median_cost: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(offset: number): Promise<SparcsRecord[]> {
  const drgFilter = TARGET_DRGS.map((d) => `'${d}'`).join(",");
  const where = `apr_drg_code in (${drgFilter})`;
  const url = `${ENDPOINT}?$where=${encodeURIComponent(where)}&$limit=${PAGE_SIZE}&$offset=${offset}&$order=year,pfi,apr_drg_code,apr_severity_of_illness_code`;

  const res = await fetch(url, {
    headers: { "User-Agent": "FairMarketsNY/0.1 (civic data project)" },
  });

  if (!res.ok) {
    throw new Error(`SPARCS API error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as SparcsRecord[];
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });

  console.log("Downloading SPARCS Hospital Inpatient Cost Transparency data...");
  console.log(`Target DRGs: ${TARGET_DRGS.join(", ")}\n`);

  const allRecords: SparcsRecord[] = [];
  let offset = 0;
  let page = 1;

  while (true) {
    console.log(`  Page ${page} (offset ${offset})...`);
    const records = await fetchPage(offset);
    console.log(`    ${records.length} records`);
    allRecords.push(...records);

    if (records.length < PAGE_SIZE) break;

    offset += PAGE_SIZE;
    page++;
    await sleep(1000);
  }

  const outPath = join(RAW_DIR, "sparcs-hospital-costs.json");
  writeFileSync(outPath, JSON.stringify(allRecords, null, 2));

  console.log(`\nSaved ${outPath}`);
  console.log(`Total: ${allRecords.length} records`);

  // Summary
  const years = new Set(allRecords.map((r) => r.year));
  const hospitals = new Set(allRecords.map((r) => r.pfi));
  const drgs = new Set(allRecords.map((r) => r.apr_drg_code));
  console.log(`\nYears: ${[...years].sort().join(", ")}`);
  console.log(`Hospitals: ${hospitals.size}`);
  console.log(`DRGs: ${[...drgs].sort().join(", ")}`);

  // Per-DRG counts for 2021
  const records2021 = allRecords.filter((r) => r.year === "2021");
  console.log(`\n2021 records by DRG:`);
  for (const drg of TARGET_DRGS) {
    const drgRecords = records2021.filter((r) => r.apr_drg_code === drg);
    const desc = drgRecords[0]?.apr_drg_description ?? "Unknown";
    console.log(`  ${drg} (${desc}): ${drgRecords.length} records`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

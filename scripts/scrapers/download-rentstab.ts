/**
 * Download rent-stabilized unit counts from JustFixNYC/nyc-doffer compiled data.
 *
 * Source: NYC Dept. of Finance tax bill PDFs, scraped by JustFixNYC
 * CSV: https://s3.amazonaws.com/justfix-data/rentstab_counts_from_doffer_2023.csv
 *
 * Columns: ucbbl (10-digit BBL), uc2018–uc2023 (unit counts per year)
 * We extract ucbbl + uc2023 only, skip rows where uc2023 is NA or empty.
 *
 * Output: data/raw/rentstab-2023.json (gitignored)
 *
 * Usage:
 *   npx tsx scripts/scrapers/download-rentstab.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");
const RAW_DIR = join(ROOT, "data/raw");

const CSV_URL =
  "https://s3.amazonaws.com/justfix-data/rentstab_counts_from_doffer_2023.csv";
const USER_AGENT = "FairMarketsNY/0.1 (civic data project)";

interface RentStabRecord {
  bbl: string;
  stabilizedUnits: number;
}

async function main() {
  console.log("Downloading rent-stabilized unit counts from JustFixNYC...");
  console.log(`  URL: ${CSV_URL}\n`);

  const res = await fetch(CSV_URL, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  }

  const csv = await res.text();
  const lines = csv.split("\n");

  // Parse header to find column indices
  const header = lines[0].split(",");
  const bblIdx = header.indexOf("ucbbl");
  const uc2023Idx = header.indexOf("uc2023");

  if (bblIdx === -1 || uc2023Idx === -1) {
    throw new Error(
      `Expected columns ucbbl and uc2023 in header: ${header.join(", ")}`
    );
  }

  console.log(`  Header columns: ${header.length}`);
  console.log(`  ucbbl at index ${bblIdx}, uc2023 at index ${uc2023Idx}`);

  // Parse data rows
  const records: RentStabRecord[] = [];
  let skippedNA = 0;
  let skippedZero = 0;
  const boroCounts: Record<string, { buildings: number; units: number }> = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(",");
    const bbl = cols[bblIdx]?.trim();
    const uc2023Raw = cols[uc2023Idx]?.trim();

    if (!bbl || !uc2023Raw || uc2023Raw === "NA" || uc2023Raw === "") {
      skippedNA++;
      continue;
    }

    const units = parseInt(uc2023Raw, 10);
    if (isNaN(units) || units <= 0) {
      skippedZero++;
      continue;
    }

    records.push({ bbl, stabilizedUnits: units });

    // Borough breakdown (first digit of BBL)
    const boro = bbl.charAt(0);
    const boroName =
      boro === "1"
        ? "Manhattan"
        : boro === "2"
        ? "Bronx"
        : boro === "3"
        ? "Brooklyn"
        : boro === "4"
        ? "Queens"
        : boro === "5"
        ? "Staten Island"
        : `Unknown (${boro})`;

    if (!boroCounts[boroName]) {
      boroCounts[boroName] = { buildings: 0, units: 0 };
    }
    boroCounts[boroName].buildings++;
    boroCounts[boroName].units += units;
  }

  // Write output
  mkdirSync(RAW_DIR, { recursive: true });
  const outPath = join(RAW_DIR, "rentstab-2023.json");
  writeFileSync(outPath, JSON.stringify(records, null, 2));

  // Summary
  const totalUnits = records.reduce((s, r) => s + r.stabilizedUnits, 0);
  console.log(`\nResults:`);
  console.log(`  Total buildings with stabilized units: ${records.length.toLocaleString()}`);
  console.log(`  Total stabilized units (2023): ${totalUnits.toLocaleString()}`);
  console.log(`  Skipped (NA/empty): ${skippedNA.toLocaleString()}`);
  console.log(`  Skipped (zero/invalid): ${skippedZero.toLocaleString()}`);

  console.log(`\nBorough breakdown:`);
  for (const [boro, stats] of Object.entries(boroCounts).sort()) {
    console.log(
      `  ${boro}: ${stats.buildings.toLocaleString()} buildings, ${stats.units.toLocaleString()} units`
    );
  }

  console.log(`\nSaved to ${outPath}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

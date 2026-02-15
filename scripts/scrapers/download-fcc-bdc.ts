/**
 * Parse FCC BDC bulk CSV into compact JSON of block-level broadband data.
 *
 * The FCC BDC bulk CSV must be manually downloaded from:
 *   https://broadbandmap.fcc.gov/data-download/fixed
 *   State = New York, Technology = All Fixed, Period = December 2024
 *
 * Place the CSV in data/raw/ (gitignored). The file is hundreds of MB.
 *
 * Processing:
 *   - Stream-parse CSV via readline (memory efficient)
 *   - Extract: block_geoid, brand_name, max_advertised_download_speed, technology
 *   - Exclude satellite (technology code 60) — available everywhere, inflates counts
 *   - Deduplicate: one record per (block_geoid, brand_name), keep highest speed
 *   - Normalize provider names via mapping table
 *
 * Output: data/raw/fcc-bdc-ny-blocks.json (gitignored)
 *
 * Usage:
 *   npx tsx scripts/scrapers/download-fcc-bdc.ts data/raw/fcc-bdc-ny-fixed-dec2024.csv
 */

import { createReadStream, writeFileSync, mkdirSync, existsSync } from "fs";
import { createInterface } from "readline";
import { join } from "path";

const ROOT = join(__dirname, "../..");
const RAW_DIR = join(ROOT, "data/raw");

// FCC uses legal/corporate names — map to consumer-facing brands
const PROVIDER_NAMES: Record<string, string> = {
  // Cable
  "Charter Communications Inc": "Spectrum",
  "Charter Communications": "Spectrum",
  "Spectrum": "Spectrum",
  // Altice / Optimum
  "Altice USA": "Optimum",
  "Altice USA, Inc.": "Optimum",
  "CSC Holdings, LLC": "Optimum",
  "Cablevision Systems Corporation": "Optimum",
  "Cablevision Lightpath": "Optimum",
  "Optimum": "Optimum",
  // Verizon
  "Verizon New York Inc.": "Verizon FiOS",
  "Verizon New York Inc": "Verizon FiOS",
  "Verizon": "Verizon FiOS",
  "MCI Communications Services LLC": "Verizon FiOS",
  "Cellco Partnership": "Verizon FiOS",
  // T-Mobile (fixed wireless)
  "T-Mobile USA, Inc.": "T-Mobile",
  "T-Mobile US, Inc.": "T-Mobile",
  "T-Mobile": "T-Mobile",
  // Frontier
  "Frontier Communications": "Frontier",
  "Frontier Communications of New York, Inc.": "Frontier",
  "Citizens Telephone Company of New York, Inc.": "Frontier",
  "Frontier": "Frontier",
  // Regional / smaller ISPs
  "Greenlight Networks": "Greenlight Networks",
  "Windstream": "Windstream",
  "Windstream New York, Inc.": "Windstream",
  "Windstream Holdings": "Windstream",
  "Slic Network Solutions, Inc.": "Slic Network",
  "Slic Network": "Slic Network",
  "RCN Corporation": "RCN",
  "RCN Telecom Services, LLC": "RCN",
  "Consolidated Communications": "Consolidated Communications",
  "TDS Telecom": "TDS Telecom",
  "Empire Access": "Empire Access",
  "Mid-Hudson Cablevision": "Mid-Hudson Cablevision",
  "Comcast Corporation": "Comcast",
};

// Satellite technology codes to exclude
const SATELLITE_TECH_CODES = new Set(["60", "61"]);

interface BlockRecord {
  blockGeoid: string;
  provider: string;
  maxDownload: number;
}

function normalizeProvider(brandName: string): string {
  // Try exact match first
  if (PROVIDER_NAMES[brandName]) return PROVIDER_NAMES[brandName];

  // Try case-insensitive partial match
  const lower = brandName.toLowerCase();
  for (const [key, value] of Object.entries(PROVIDER_NAMES)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return value;
    }
  }

  // Return original name if no mapping found
  return brandName.trim();
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npx tsx scripts/scrapers/download-fcc-bdc.ts <path-to-csv>");
    console.error("  e.g. npx tsx scripts/scrapers/download-fcc-bdc.ts data/raw/fcc-bdc-ny-fixed-dec2024.csv");
    process.exit(1);
  }

  const fullPath = csvPath.startsWith("/") ? csvPath : join(ROOT, csvPath);
  if (!existsSync(fullPath)) {
    console.error(`Error: File not found: ${fullPath}`);
    console.error("\nDownload the FCC BDC bulk CSV from:");
    console.error("  https://broadbandmap.fcc.gov/data-download/fixed");
    console.error("  State = New York, Technology = All Fixed, Period = December 2024");
    process.exit(1);
  }

  mkdirSync(RAW_DIR, { recursive: true });

  console.log(`Parsing FCC BDC CSV: ${fullPath}\n`);

  // Stream-parse the CSV
  const rl = createInterface({
    input: createReadStream(fullPath, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  let headers: string[] = [];
  let lineCount = 0;
  let satelliteSkipped = 0;
  let totalRows = 0;

  // Deduplicate: key = "blockGeoid|provider", keep highest speed
  const blockProviderMap = new Map<string, BlockRecord>();
  // Track raw provider names for diagnostics
  const rawProviderCounts = new Map<string, number>();

  for await (const line of rl) {
    lineCount++;

    if (lineCount === 1) {
      // Parse header row
      headers = line.split(",").map((h) => h.trim().replace(/"/g, ""));
      console.log(`CSV columns: ${headers.join(", ")}`);
      continue;
    }

    totalRows++;

    // Parse CSV row (handle quoted fields)
    const fields = parseCSVLine(line);
    const get = (col: string) => {
      const idx = headers.indexOf(col);
      return idx >= 0 ? fields[idx]?.trim().replace(/"/g, "") : "";
    };

    const techCode = get("technology");
    if (SATELLITE_TECH_CODES.has(techCode)) {
      satelliteSkipped++;
      continue;
    }

    const blockGeoid = get("block_geoid");
    const brandName = get("brand_name");
    const maxDownload = Number(get("max_advertised_download_speed")) || 0;

    if (!blockGeoid || !brandName) continue;

    // Track raw provider names
    rawProviderCounts.set(brandName, (rawProviderCounts.get(brandName) ?? 0) + 1);

    const provider = normalizeProvider(brandName);
    const key = `${blockGeoid}|${provider}`;

    const existing = blockProviderMap.get(key);
    if (!existing || maxDownload > existing.maxDownload) {
      blockProviderMap.set(key, { blockGeoid, provider, maxDownload });
    }

    if (totalRows % 500_000 === 0) {
      console.log(`  Processed ${(totalRows / 1_000_000).toFixed(1)}M rows...`);
    }
  }

  console.log(`\nParsed ${totalRows.toLocaleString()} data rows`);
  console.log(`  Satellite records skipped: ${satelliteSkipped.toLocaleString()}`);
  console.log(`  Unique block+provider records: ${blockProviderMap.size.toLocaleString()}`);

  // Show top raw provider names for verification
  const sortedProviders = [...rawProviderCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  console.log("\nTop 20 raw brand_name values:");
  for (const [name, count] of sortedProviders) {
    const normalized = normalizeProvider(name);
    const suffix = normalized !== name ? ` → ${normalized}` : "";
    console.log(`  ${count.toLocaleString().padStart(10)} ${name}${suffix}`);
  }

  // Convert to array
  const records = [...blockProviderMap.values()];

  // Summary: unique blocks, unique providers
  const uniqueBlocks = new Set(records.map((r) => r.blockGeoid));
  const uniqueProviders = new Set(records.map((r) => r.provider));

  console.log(`\nUnique census blocks: ${uniqueBlocks.size.toLocaleString()}`);
  console.log(`Unique providers (normalized): ${uniqueProviders.size}`);
  console.log("Providers:", [...uniqueProviders].sort().join(", "));

  // Write output
  const outPath = join(RAW_DIR, "fcc-bdc-ny-blocks.json");
  writeFileSync(outPath, JSON.stringify(records, null, 2));
  console.log(`\nSaved ${outPath}`);
  console.log(`  ${records.length.toLocaleString()} records`);
  console.log("\nDone.");
}

/**
 * Parse a CSV line handling quoted fields (FCC CSV uses double-quote quoting).
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

/**
 * Aggregate block-level FCC broadband data to NTA neighborhood level.
 *
 * Reads:
 *   data/raw/fcc-bdc-ny-blocks.json (from download-fcc-bdc.ts)
 *   data/crosswalks/nta-to-census-tract.json
 *   data/concentration/broadband-pricing.json (for cheapest price lookup)
 *   data/concentration/housing-neighborhoods.json (for slug/name consistency)
 *
 * Output:
 *   data/concentration/broadband-neighborhoods.json (committed)
 *
 * Block→NTA mapping:
 *   Truncate 15-digit block GEOID to 11 digits → tract GEOID
 *   Tract → NTA via crosswalk
 *   Blocks outside NYC (no matching tract) silently skipped
 *
 * Usage:
 *   npx tsx scripts/scrapers/aggregate-broadband-nta.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BlockRecord {
  blockGeoid: string;
  provider: string;
  maxDownload: number;
}

interface CrosswalkEntry {
  geoid: string;
  ntaCode: string;
  ntaName: string;
  boroCode: string;
  boroName: string;
  countyFips: string;
}

interface BoroughCountyEntry {
  borough: string;
  boroCode: number;
  county: string;
  fips: string;
}

interface HousingNeighborhood {
  name: string;
  slug: string;
  borough: string;
  fips: string;
  ntaCodes: string[];
}

interface PricingData {
  providers: Record<string, { cheapest100: number }>;
}

interface NTAProvider {
  name: string;
  blockCoveragePct: number;
  maxDownload: number;
}

interface BroadbandNeighborhood {
  name: string;
  slug: string;
  borough: string;
  fips: string;
  ntaCode: string;
  totalBlocks: number;
  providersAt100Mbps: number;
  medianProviderCount: number;
  zeroPctBlocks: number;
  zeroAt100PctBlocks: number;
  onePctBlocks: number;
  topProviders: NTAProvider[];
  cheapest100Mbps: number | null;
  cheapest100Provider: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  // Load block-level data
  const blocksPath = join(ROOT, "data/raw/fcc-bdc-ny-blocks.json");
  let blocks: BlockRecord[];
  try {
    blocks = JSON.parse(readFileSync(blocksPath, "utf-8"));
  } catch {
    console.error(`Error: Could not read ${blocksPath}`);
    console.error("Run download-fcc-bdc.ts first:");
    console.error("  npx tsx scripts/scrapers/download-fcc-bdc.ts data/raw/fcc-bdc-ny-fixed-dec2024.csv");
    process.exit(1);
  }

  // Load crosswalk (tract → NTA)
  const crosswalkPath = join(ROOT, "data/crosswalks/nta-to-census-tract.json");
  const crosswalk: CrosswalkEntry[] = JSON.parse(readFileSync(crosswalkPath, "utf-8"));

  // Load pricing data
  const pricingPath = join(ROOT, "data/concentration/broadband-pricing.json");
  const pricing: PricingData = JSON.parse(readFileSync(pricingPath, "utf-8"));

  // Load housing neighborhoods for slug consistency
  const housingPath = join(ROOT, "data/concentration/housing-neighborhoods.json");
  const housingData = JSON.parse(readFileSync(housingPath, "utf-8"));
  const housingNeighborhoods: HousingNeighborhood[] = housingData.neighborhoods;

  // Load borough-county crosswalk for FIPS
  const boroCountyPath = join(ROOT, "data/crosswalks/borough-county-fips.json");
  const boroCounty: BoroughCountyEntry[] = JSON.parse(readFileSync(boroCountyPath, "utf-8"));
  const boroToFips = new Map<string, string>();
  for (const b of boroCounty) {
    boroToFips.set(b.borough, b.fips);
  }

  console.log(`Loaded ${blocks.length.toLocaleString()} block records`);
  console.log(`Loaded ${crosswalk.length} crosswalk entries`);
  console.log(`Loaded ${housingNeighborhoods.length} housing neighborhoods for slug lookup\n`);

  // Build tract → NTA mapping from crosswalk
  const tractToNTA = new Map<string, CrosswalkEntry>();
  for (const entry of crosswalk) {
    tractToNTA.set(entry.geoid, entry);
  }

  // Build slug lookup from housing: ntaCode → { name, slug }
  const ntaSlugMap = new Map<string, { name: string; slug: string }>();
  for (const n of housingNeighborhoods) {
    for (const code of n.ntaCodes) {
      ntaSlugMap.set(code, { name: n.name, slug: n.slug });
    }
  }

  // Group blocks by NTA
  // Per NTA, track: set of blocks, per-block provider sets, per-provider block counts + max speed
  interface NTAAccumulator {
    ntaCode: string;
    ntaName: string;
    boroName: string;
    countyFips: string;
    blocks: Map<string, { providers: Map<string, number> }>; // blockGeoid → provider → maxDownload
  }

  const ntaAccum = new Map<string, NTAAccumulator>();
  let matched = 0;
  let unmatched = 0;

  for (const block of blocks) {
    // Truncate 15-digit block GEOID to 11-digit tract GEOID
    const tractGeoid = block.blockGeoid.slice(0, 11);
    const ntaEntry = tractToNTA.get(tractGeoid);

    if (!ntaEntry) {
      unmatched++;
      continue;
    }
    matched++;

    const { ntaCode, ntaName, boroName, countyFips } = ntaEntry;

    if (!ntaAccum.has(ntaCode)) {
      ntaAccum.set(ntaCode, {
        ntaCode,
        ntaName,
        boroName,
        countyFips,
        blocks: new Map(),
      });
    }

    const accum = ntaAccum.get(ntaCode)!;
    if (!accum.blocks.has(block.blockGeoid)) {
      accum.blocks.set(block.blockGeoid, { providers: new Map() });
    }

    const blockData = accum.blocks.get(block.blockGeoid)!;
    const existing = blockData.providers.get(block.provider) ?? 0;
    if (block.maxDownload > existing) {
      blockData.providers.set(block.provider, block.maxDownload);
    }
  }

  console.log(`Block records matched to NTAs: ${matched.toLocaleString()}`);
  console.log(`Block records outside NYC (skipped): ${unmatched.toLocaleString()}`);
  console.log(`NTAs with broadband data: ${ntaAccum.size}\n`);

  // Aggregate per NTA
  const neighborhoods: BroadbandNeighborhood[] = [];

  for (const [ntaCode, accum] of ntaAccum) {
    const totalBlocks = accum.blocks.size;
    if (totalBlocks === 0) continue;

    // Per-block: count providers at 100+ Mbps and at any speed
    let zeroProviderBlocks = 0;
    let zeroAt100Blocks = 0;
    let oneAt100Blocks = 0;
    const providerCountsAt100: number[] = [];

    // Track per-provider: how many blocks they cover, max speed across NTA
    const providerBlockCount = new Map<string, number>();
    const providerMaxSpeed = new Map<string, number>();

    // Set of all providers with ≥100 Mbps in any block
    const providersAt100Set = new Set<string>();

    for (const [, blockData] of accum.blocks) {
      const allProviders = [...blockData.providers.entries()];
      const at100 = allProviders.filter(([, speed]) => speed >= 100);

      if (allProviders.length === 0) {
        zeroProviderBlocks++;
      }
      if (at100.length === 0) {
        zeroAt100Blocks++;
      }
      if (at100.length === 1) {
        oneAt100Blocks++;
      }

      providerCountsAt100.push(at100.length);

      for (const [provider, speed] of allProviders) {
        providerBlockCount.set(provider, (providerBlockCount.get(provider) ?? 0) + 1);
        const existing = providerMaxSpeed.get(provider) ?? 0;
        if (speed > existing) providerMaxSpeed.set(provider, speed);

        if (speed >= 100) {
          providersAt100Set.add(provider);
        }
      }
    }

    // Top 5 providers by block coverage
    const topProviders: NTAProvider[] = [...providerBlockCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        blockCoveragePct: round1((count / totalBlocks) * 100),
        maxDownload: providerMaxSpeed.get(name) ?? 0,
      }));

    // Find cheapest 100 Mbps price among top providers
    let cheapest100Mbps: number | null = null;
    let cheapest100Provider: string | null = null;
    for (const tp of topProviders) {
      const providerPricing = pricing.providers[tp.name];
      if (providerPricing && tp.maxDownload >= 100) {
        if (cheapest100Mbps === null || providerPricing.cheapest100 < cheapest100Mbps) {
          cheapest100Mbps = providerPricing.cheapest100;
          cheapest100Provider = tp.name;
        }
      }
    }

    // Slug: reuse from housing if available
    const slugInfo = ntaSlugMap.get(ntaCode);
    const name = slugInfo?.name ?? accum.ntaName;
    const slug = slugInfo?.slug ?? slugify(accum.ntaName);
    const fips = boroToFips.get(accum.boroName) ?? `36${accum.countyFips}`;

    neighborhoods.push({
      name,
      slug,
      borough: accum.boroName,
      fips,
      ntaCode,
      totalBlocks,
      providersAt100Mbps: providersAt100Set.size,
      medianProviderCount: median(providerCountsAt100),
      zeroPctBlocks: round1((zeroProviderBlocks / totalBlocks) * 100),
      zeroAt100PctBlocks: round1((zeroAt100Blocks / totalBlocks) * 100),
      onePctBlocks: round1((oneAt100Blocks / totalBlocks) * 100),
      topProviders,
      cheapest100Mbps,
      cheapest100Provider,
    });
  }

  neighborhoods.sort((a, b) => a.ntaCode.localeCompare(b.ntaCode));

  // Build output JSON
  const output = {
    sector: "Broadband Internet Access",
    geography: "NYC Neighborhoods",
    ntaVersion: "2020",
    source: "FCC Broadband Data Collection (BDC), December 2024",
    pricingSource: "ISP published rate cards, February 2026",
    neighborhoods,
  };

  const outPath = join(ROOT, "data/concentration/broadband-neighborhoods.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`Saved ${outPath}`);
  console.log(`  ${neighborhoods.length} neighborhoods\n`);

  // Summary stats
  const providerCounts = neighborhoods.map((n) => n.medianProviderCount);
  const sorted = [...providerCounts].sort((a, b) => a - b);
  console.log(`Median provider count range: ${sorted[0]} – ${sorted[sorted.length - 1]}`);
  console.log(`Citywide median of medians: ${median(providerCounts)}`);

  const zeroBlocks = neighborhoods.filter((n) => n.zeroPctBlocks > 0);
  console.log(`Neighborhoods with any zero-broadband blocks: ${zeroBlocks.length}`);

  const oneProvider = neighborhoods.filter((n) => n.medianProviderCount <= 1);
  console.log(`Neighborhoods with median ≤1 provider at 100 Mbps: ${oneProvider.length}`);

  // Borough breakdown
  const byBoro = new Map<string, BroadbandNeighborhood[]>();
  for (const n of neighborhoods) {
    if (!byBoro.has(n.borough)) byBoro.set(n.borough, []);
    byBoro.get(n.borough)!.push(n);
  }
  console.log("\nBy borough:");
  for (const [boro, hoods] of [...byBoro].sort()) {
    const medians = hoods.map((h) => h.medianProviderCount);
    const boroMedian = median(medians);
    console.log(`  ${boro}: ${hoods.length} neighborhoods, median providers: ${boroMedian}`);
  }

  console.log("\nDone.");
}

main();

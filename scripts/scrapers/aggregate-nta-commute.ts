/**
 * Aggregate Census ACS tract-level commute data to neighborhood (NTA) level.
 *
 * Reads:
 *   data/raw/acs-commute-tracts-2023.json (from download-acs-commute.ts)
 *   data/crosswalks/nta-to-census-tract.json
 *   data/crosswalks/neighborhood-to-nta.json
 *
 * Output:
 *   data/concentration/transportation-neighborhoods.json (committed)
 *
 * Aggregation methods:
 *   - Mode percentages: Sum mode workers / sum total workers
 *   - Avg commute: Sum aggregate travel time / sum travel-time workers
 *   - Zero-car %: Sum (renter + owner no vehicle) / sum total occupied units
 *   - Est. monthly cost: transit% × $132 MetroCard + drove% × $780 AAA vehicle cost
 *
 * Usage:
 *   npx tsx scripts/scrapers/aggregate-nta-commute.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");

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

interface CrosswalkEntry {
  geoid: string;
  ntaCode: string;
  ntaName: string;
  boroCode: string;
  boroName: string;
  countyFips: string;
}

interface NeighborhoodMapping {
  slug: string;
  name: string;
  borough: string;
  fips: string;
  ntaCodes: string[];
  ntaNames: string[];
}

// Cost model constants
const METROCARD_MONTHLY = 132;
const VEHICLE_MONTHLY = 780; // AAA Your Driving Costs 2024, Northeast
const MIN_WORKERS = 200; // Skip parks, cemeteries, and other very small NTAs

function main() {
  // Load tract commute data
  const tractPath = join(ROOT, "data/raw/acs-commute-tracts-2023.json");
  let tracts: TractCommute[];
  try {
    tracts = JSON.parse(readFileSync(tractPath, "utf-8"));
  } catch {
    console.error(`Error: Could not read ${tractPath}`);
    console.error("Run download-acs-commute.ts first:");
    console.error("  npx tsx scripts/scrapers/download-acs-commute.ts");
    process.exit(1);
  }

  // Load crosswalk (tract → NTA)
  const crosswalkPath = join(ROOT, "data/crosswalks/nta-to-census-tract.json");
  const crosswalk: CrosswalkEntry[] = JSON.parse(readFileSync(crosswalkPath, "utf-8"));

  // Load neighborhood mapping (neighborhood → NTA codes)
  const neighborhoodPath = join(ROOT, "data/crosswalks/neighborhood-to-nta.json");
  const neighborhoodMappings: NeighborhoodMapping[] = JSON.parse(
    readFileSync(neighborhoodPath, "utf-8"),
  );

  console.log(
    `Loaded ${tracts.length} tracts, ${crosswalk.length} crosswalk entries, ${neighborhoodMappings.length} neighborhoods\n`,
  );

  // Index tracts by geoid
  const tractMap = new Map<string, TractCommute>();
  for (const t of tracts) {
    tractMap.set(t.geoid, t);
  }

  // Group crosswalk entries by NTA
  const ntaTracts = new Map<string, TractCommute[]>();
  let matchedTracts = 0;

  for (const entry of crosswalk) {
    const tract = tractMap.get(entry.geoid);
    if (!tract) continue;
    if (!ntaTracts.has(entry.ntaCode)) {
      ntaTracts.set(entry.ntaCode, []);
    }
    ntaTracts.get(entry.ntaCode)!.push(tract);
    matchedTracts++;
  }

  console.log(`Matched ${matchedTracts} tracts to NTAs`);

  // Load income data from housing neighborhoods for median income merge
  const housingPath = join(ROOT, "data/concentration/housing-neighborhoods.json");
  let incomeBySlug = new Map<string, number>();
  try {
    const housingData = JSON.parse(readFileSync(housingPath, "utf-8"));
    for (const n of housingData.neighborhoods) {
      if (n.medianIncome) {
        incomeBySlug.set(n.slug, n.medianIncome);
      }
    }
    console.log(`Loaded income data for ${incomeBySlug.size} neighborhoods`);
  } catch {
    console.warn("Warning: Could not load housing-neighborhoods.json for income merge");
  }

  // Aggregate per neighborhood (using neighborhood-to-NTA mapping)
  interface NeighborhoodCommute {
    name: string;
    slug: string;
    borough: string;
    ntaCodes: string[];
    workers: number;
    transitPct: number;
    drovePct: number;
    carpoolPct: number;
    walkBikePct: number;
    wfhPct: number;
    zeroCarPct: number;
    avgCommuteMins: number;
    medianIncome: number | null;
    estMonthlyCost: number;
  }

  const results: NeighborhoodCommute[] = [];

  for (const mapping of neighborhoodMappings) {
    // Gather all tracts for this neighborhood's NTAs
    const neighborhoodTracts: TractCommute[] = [];
    for (const ntaCode of mapping.ntaCodes) {
      const nTracts = ntaTracts.get(ntaCode);
      if (nTracts) neighborhoodTracts.push(...nTracts);
    }

    if (neighborhoodTracts.length === 0) continue;

    // Sum across tracts
    let totalWorkers = 0;
    let totalTransit = 0;
    let totalDrove = 0;
    let totalCarpool = 0;
    let totalBicycle = 0;
    let totalWalked = 0;
    let totalWfh = 0;
    let totalAggTime = 0;
    let totalTimeWorkers = 0;
    let totalOccupied = 0;
    let totalNoVehicle = 0;

    for (const t of neighborhoodTracts) {
      totalWorkers += t.totalWorkers;
      totalTransit += t.transitWorkers;
      totalDrove += t.droveAlone;
      totalCarpool += t.carpooled;
      totalBicycle += t.bicycle;
      totalWalked += t.walked;
      totalWfh += t.wfh;
      totalAggTime += t.aggTravelTime;
      totalTimeWorkers += t.travelTimeWorkers;
      totalOccupied += t.totalOccupiedUnits;
      totalNoVehicle += t.renterNoVehicle + t.ownerNoVehicle;
    }

    if (totalWorkers < MIN_WORKERS) continue;

    const transitPct = round1((totalTransit / totalWorkers) * 100);
    const drovePct = round1((totalDrove / totalWorkers) * 100);
    const carpoolPct = round1((totalCarpool / totalWorkers) * 100);
    const walkBikePct = round1(((totalBicycle + totalWalked) / totalWorkers) * 100);
    const wfhPct = round1((totalWfh / totalWorkers) * 100);
    const zeroCarPct =
      totalOccupied > 0 ? round1((totalNoVehicle / totalOccupied) * 100) : 0;
    const avgCommuteMins =
      totalTimeWorkers > 0 ? Math.round(totalAggTime / totalTimeWorkers) : 0;

    // Estimated monthly commute cost
    const estMonthlyCost = Math.round(
      (transitPct / 100) * METROCARD_MONTHLY + (drovePct / 100) * VEHICLE_MONTHLY,
    );

    const medianIncome = incomeBySlug.get(mapping.slug) ?? null;

    results.push({
      name: mapping.name,
      slug: mapping.slug,
      borough: mapping.borough,
      ntaCodes: mapping.ntaCodes,
      workers: totalWorkers,
      transitPct,
      drovePct,
      carpoolPct,
      walkBikePct,
      wfhPct,
      zeroCarPct,
      avgCommuteMins,
      medianIncome,
      estMonthlyCost,
    });
  }

  // Also process NTAs that don't map to a named neighborhood (1:1 NTA = neighborhood)
  const mappedNtaCodes = new Set(neighborhoodMappings.flatMap((m) => m.ntaCodes));

  for (const [ntaCode, nTracts] of ntaTracts) {
    if (mappedNtaCodes.has(ntaCode)) continue;

    let totalWorkers = 0;
    let totalTransit = 0;
    let totalDrove = 0;
    let totalCarpool = 0;
    let totalBicycle = 0;
    let totalWalked = 0;
    let totalWfh = 0;
    let totalAggTime = 0;
    let totalTimeWorkers = 0;
    let totalOccupied = 0;
    let totalNoVehicle = 0;

    for (const t of nTracts) {
      totalWorkers += t.totalWorkers;
      totalTransit += t.transitWorkers;
      totalDrove += t.droveAlone;
      totalCarpool += t.carpooled;
      totalBicycle += t.bicycle;
      totalWalked += t.walked;
      totalWfh += t.wfh;
      totalAggTime += t.aggTravelTime;
      totalTimeWorkers += t.travelTimeWorkers;
      totalOccupied += t.totalOccupiedUnits;
      totalNoVehicle += t.renterNoVehicle + t.ownerNoVehicle;
    }

    if (totalWorkers < MIN_WORKERS) continue;

    // Get NTA name from crosswalk
    const cwEntry = crosswalk.find((e) => e.ntaCode === ntaCode);
    if (!cwEntry) continue;

    const ntaName = cwEntry.ntaName;
    const borough = cwEntry.boroName;
    const slug = ntaName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");

    const transitPct = round1((totalTransit / totalWorkers) * 100);
    const drovePct = round1((totalDrove / totalWorkers) * 100);
    const carpoolPct = round1((totalCarpool / totalWorkers) * 100);
    const walkBikePct = round1(((totalBicycle + totalWalked) / totalWorkers) * 100);
    const wfhPct = round1((totalWfh / totalWorkers) * 100);
    const zeroCarPct =
      totalOccupied > 0 ? round1((totalNoVehicle / totalOccupied) * 100) : 0;
    const avgCommuteMins =
      totalTimeWorkers > 0 ? Math.round(totalAggTime / totalTimeWorkers) : 0;

    const estMonthlyCost = Math.round(
      (transitPct / 100) * METROCARD_MONTHLY + (drovePct / 100) * VEHICLE_MONTHLY,
    );

    const medianIncome = incomeBySlug.get(slug) ?? null;

    results.push({
      name: ntaName,
      slug,
      borough,
      ntaCodes: [ntaCode],
      workers: totalWorkers,
      transitPct,
      drovePct,
      carpoolPct,
      walkBikePct,
      wfhPct,
      zeroCarPct,
      avgCommuteMins,
      medianIncome,
      estMonthlyCost,
    });
  }

  results.sort((a, b) => b.estMonthlyCost - a.estMonthlyCost);

  // Write output
  const output = {
    sector: "Transportation",
    geography: "NYC Neighborhoods",
    source:
      "U.S. Census Bureau, ACS 2023 5-Year Estimates (Tables B08301, B08013, B25044)",
    costModel: {
      description:
        "Estimated monthly commute cost = transit% \u00d7 $132 (monthly MetroCard) + drove% \u00d7 $780 (AAA monthly vehicle cost)",
      metroCardMonthly: METROCARD_MONTHLY,
      vehicleMonthlyCost: VEHICLE_MONTHLY,
      sources: {
        metroCard: "MTA fare schedule, effective August 2023",
        vehicleCost: "AAA Your Driving Costs 2024, Northeast region",
      },
    },
    neighborhoods: results,
  };

  const outPath = join(ROOT, "data/concentration/transportation-neighborhoods.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`\nSaved ${outPath}`);
  console.log(`  ${results.length} neighborhoods`);

  // Summary stats
  const transitPcts = results.map((r) => r.transitPct).sort((a, b) => a - b);
  const drovePcts = results.map((r) => r.drovePct).sort((a, b) => a - b);
  const costs = results.map((r) => r.estMonthlyCost).sort((a, b) => a - b);

  console.log(`\nTransit %: ${transitPcts[0]}% – ${transitPcts[transitPcts.length - 1]}%`);
  console.log(`Drove %: ${drovePcts[0]}% – ${drovePcts[drovePcts.length - 1]}%`);
  console.log(`Est. cost range: $${costs[0]} – $${costs[costs.length - 1]}/mo`);

  // Borough breakdown
  const byBoro = new Map<string, { transit: number[]; cost: number[] }>();
  for (const r of results) {
    if (!byBoro.has(r.borough)) byBoro.set(r.borough, { transit: [], cost: [] });
    const b = byBoro.get(r.borough)!;
    b.transit.push(r.transitPct);
    b.cost.push(r.estMonthlyCost);
  }
  console.log("\nBy borough:");
  for (const [boro, data] of [...byBoro].sort()) {
    const medTransit =
      data.transit.sort((a, b) => a - b)[Math.floor(data.transit.length / 2)];
    const medCost = data.cost.sort((a, b) => a - b)[Math.floor(data.cost.length / 2)];
    console.log(
      `  ${boro}: ${data.transit.length} neighborhoods, median transit ${medTransit}%, median cost $${medCost}/mo`,
    );
  }

  console.log("\nDone.");
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

main();

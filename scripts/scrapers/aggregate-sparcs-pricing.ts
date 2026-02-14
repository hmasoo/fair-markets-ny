/**
 * Aggregate SPARCS hospital pricing data to region/system/hospital level per DRG.
 *
 * Reads:
 *   data/raw/sparcs-hospital-costs.json (from download-sparcs-pricing.ts)
 *   data/crosswalks/hospital-to-system.json
 *
 * Output:
 *   data/concentration/healthcare-pricing.json (committed)
 *
 * Uses severity level 2 ("Moderate") for apples-to-apples comparison.
 * All severity levels are preserved in the per-hospital detail.
 *
 * Usage:
 *   npx tsx scripts/scrapers/aggregate-sparcs-pricing.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");

// --- Types ---

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

interface CrosswalkEntry {
  pfi: string;
  facilityName: string;
  system: string;
  county: string;
  regionSlug: string;
}

// --- Output types ---

interface HospitalPricing {
  pfi: string;
  name: string;
  system: string;
  meanCharge: number;
  medianCharge: number;
  meanCost: number;
  medianCost: number;
  discharges: number;
}

interface RegionPricing {
  regionSlug: string;
  regionName: string;
  meanCharge: number;
  meanCost: number;
  discharges: number;
  hospitals: HospitalPricing[];
  chargeRange: { min: number; max: number };
}

interface ProcedureData {
  drgCode: string;
  drgDescription: string;
  type: string;
  statewideMeanCharge: number;
  statewideMeanCost: number;
  totalDischarges: number;
  hospitalCount: number;
  byRegion: RegionPricing[];
}

// --- Region slug → display name ---

const REGION_NAMES: Record<string, string> = {
  "nyc-metro": "NYC Metro",
  "long-island": "Long Island",
  "hudson-valley": "Hudson Valley",
  "capital-district": "Capital District",
  "central-ny": "Central NY",
  "western-ny": "Western NY",
  "finger-lakes": "Finger Lakes",
  "north-country": "North Country",
  "southern-tier": "Southern Tier",
  "mohawk-valley": "Mohawk Valley",
};

// --- DRG metadata ---

const DRG_TYPE: Record<string, string> = {
  "560": "Surgical",
  "540": "Surgical",
  "326": "Surgical",
  "324": "Surgical",
  "194": "Medical",
  "139": "Medical",
};

function parseNum(val: string | undefined): number {
  if (!val) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function main() {
  // Load raw SPARCS data
  const rawPath = join(ROOT, "data/raw/sparcs-hospital-costs.json");
  let rawRecords: SparcsRecord[];
  try {
    rawRecords = JSON.parse(readFileSync(rawPath, "utf-8"));
  } catch {
    console.error(`Error: Could not read ${rawPath}`);
    console.error("Run download-sparcs-pricing.ts first:");
    console.error("  npx tsx scripts/scrapers/download-sparcs-pricing.ts");
    process.exit(1);
  }

  // Load crosswalk
  const crosswalkPath = join(ROOT, "data/crosswalks/hospital-to-system.json");
  const crosswalk: CrosswalkEntry[] = JSON.parse(readFileSync(crosswalkPath, "utf-8"));
  const pfiMap = new Map<string, CrosswalkEntry>();
  for (const entry of crosswalk) {
    pfiMap.set(entry.pfi, entry);
  }

  console.log(`Loaded ${rawRecords.length} SPARCS records, ${crosswalk.length} crosswalk entries\n`);

  // Filter to latest year (2021) and severity level 2 (Moderate) for main comparison
  const latestYear = "2021";
  const moderateSeverity = "2";

  const records2021 = rawRecords.filter((r) => r.year === latestYear);
  const recordsMod = records2021.filter(
    (r) => r.apr_severity_of_illness_code === moderateSeverity,
  );

  console.log(`2021 records: ${records2021.length}`);
  console.log(`2021 severity 2 (Moderate): ${recordsMod.length}\n`);

  // Group by DRG
  const byDrg = new Map<string, SparcsRecord[]>();
  for (const r of recordsMod) {
    const drg = r.apr_drg_code;
    if (!byDrg.has(drg)) byDrg.set(drg, []);
    byDrg.get(drg)!.push(r);
  }

  const procedures: ProcedureData[] = [];

  for (const [drgCode, drgRecords] of byDrg) {
    const drgDesc = drgRecords[0].apr_drg_description;

    // Compute statewide discharge-weighted averages
    let totalDischarges = 0;
    let weightedCharge = 0;
    let weightedCost = 0;
    let hospitalCount = 0;

    // Group by region
    const regionHospitals = new Map<string, HospitalPricing[]>();

    for (const r of drgRecords) {
      const discharges = parseNum(r.discharges);
      const meanCharge = parseNum(r.mean_charge);
      const meanCost = parseNum(r.mean_cost);
      const medianCharge = parseNum(r.median_charge);
      const medianCost = parseNum(r.median_cost);

      if (discharges <= 0 || meanCharge <= 0) continue;

      totalDischarges += discharges;
      weightedCharge += meanCharge * discharges;
      weightedCost += meanCost * discharges;
      hospitalCount++;

      const xw = pfiMap.get(r.pfi);
      const regionSlug = xw?.regionSlug ?? "unknown";
      const system = xw?.system ?? "Unknown";
      const name = xw?.facilityName ?? r.facility_name;

      if (!regionHospitals.has(regionSlug)) {
        regionHospitals.set(regionSlug, []);
      }

      regionHospitals.get(regionSlug)!.push({
        pfi: r.pfi,
        name,
        system,
        meanCharge: Math.round(meanCharge),
        medianCharge: Math.round(medianCharge),
        meanCost: Math.round(meanCost),
        medianCost: Math.round(medianCost),
        discharges,
      });
    }

    const statewideMeanCharge =
      totalDischarges > 0 ? Math.round(weightedCharge / totalDischarges) : 0;
    const statewideMeanCost =
      totalDischarges > 0 ? Math.round(weightedCost / totalDischarges) : 0;

    // Build region summaries
    const byRegion: RegionPricing[] = [];

    for (const [regionSlug, hospitals] of regionHospitals) {
      if (regionSlug === "unknown") continue;

      // Sort hospitals by mean charge descending
      hospitals.sort((a, b) => b.meanCharge - a.meanCharge);

      // Discharge-weighted region averages
      const regionDischarges = hospitals.reduce((s, h) => s + h.discharges, 0);
      const regionWeightedCharge = hospitals.reduce(
        (s, h) => s + h.meanCharge * h.discharges,
        0,
      );
      const regionWeightedCost = hospitals.reduce(
        (s, h) => s + h.meanCost * h.discharges,
        0,
      );

      const charges = hospitals.map((h) => h.meanCharge);

      byRegion.push({
        regionSlug,
        regionName: REGION_NAMES[regionSlug] ?? regionSlug,
        meanCharge: Math.round(regionWeightedCharge / regionDischarges),
        meanCost: Math.round(regionWeightedCost / regionDischarges),
        discharges: regionDischarges,
        hospitals,
        chargeRange: {
          min: Math.min(...charges),
          max: Math.max(...charges),
        },
      });
    }

    // Sort regions by discharge volume descending
    byRegion.sort((a, b) => b.discharges - a.discharges);

    procedures.push({
      drgCode,
      drgDescription: formatDrgDescription(drgDesc),
      type: DRG_TYPE[drgCode] ?? "Unknown",
      statewideMeanCharge,
      statewideMeanCost,
      totalDischarges,
      hospitalCount,
      byRegion,
    });

    console.log(
      `DRG ${drgCode} (${formatDrgDescription(drgDesc)}): ${hospitalCount} hospitals, ${totalDischarges.toLocaleString()} discharges, mean charge $${statewideMeanCharge.toLocaleString()}`,
    );
  }

  // Sort procedures by total discharges descending
  procedures.sort((a, b) => b.totalDischarges - a.totalDischarges);

  const output = {
    source: "NYS DOH SPARCS Hospital Inpatient Cost Transparency",
    sourceUrl: "https://health.data.ny.gov/Health/Hospital-Inpatient-Cost-Transparency-Beginning-200/7dtz-qxmr",
    latestYear: 2021,
    severityLevel: "2 - Moderate",
    notes: "Charges reflect hospital list prices (chargemaster), not negotiated rates paid by insurers. Mean cost reflects estimated resource use from Institutional Cost Reports. Severity level 2 (Moderate) used for apples-to-apples comparison across hospitals.",
    procedures,
  };

  const outPath = join(ROOT, "data/concentration/healthcare-pricing.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`\nSaved ${outPath}`);
  console.log(`${procedures.length} procedures across ${Object.keys(REGION_NAMES).length} regions`);
  console.log("\nDone.");
}

/** Clean up DRG description — title case, remove trailing codes */
function formatDrgDescription(desc: string): string {
  // The SPARCS descriptions are like "VAGINAL DELIVERY" — convert to title case
  return desc
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length <= 2 && w !== "of" && w !== "or" ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

main();

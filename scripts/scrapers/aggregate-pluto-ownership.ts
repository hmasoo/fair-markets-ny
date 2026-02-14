/**
 * Aggregate PLUTO ownership data to per-NTA concentration metrics.
 *
 * Reads:
 *   data/raw/pluto-residential.json (from download-pluto.ts)
 *   data/crosswalks/nta-to-census-tract.json
 *   data/geography/nyc-ntas-2020.json
 *   data/raw/acs-income-tracts-2023.json (optional — from download-acs-income.ts)
 *
 * Output:
 *   data/concentration/housing-neighborhoods.json (committed)
 *
 * Pipeline:
 *   1. Map PLUTO bct2020 → census tract geoid → NTA code
 *   2. Normalize owner names (trim, uppercase, strip suffixes)
 *   3. Compute per-NTA: HHI, CR4, top 4 landlords, total units
 *   4. Merge ACS income data if available
 *   5. Write updated housing-neighborhoods.json
 *
 * Usage:
 *   npx tsx scripts/scrapers/aggregate-pluto-ownership.ts
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");

// --- Types ---

interface PlutoRecord {
  ownername: string;
  unitsres: string;
  bct2020: string;
  borocode: string;
  bbl: string;
}

interface CrosswalkEntry {
  geoid: string;
  ntaCode: string;
  ntaName: string;
  boroCode: string;
  boroName: string;
  countyFips: string;
}

interface NTARef {
  ntaCode: string;
  ntaName: string;
  boroName: string;
  countyFips: string;
}

interface TractRecord {
  geoid: string;
  countyFips: string;
  medianIncome: number | null;
  totalHouseholds: number;
  renterHouseholds: number;
  rentBurdened30to35: number;
  rentBurdened35to40: number;
  rentBurdened40to50: number;
  rentBurdened50plus: number;
}

interface TopLandlord {
  name: string;
  units: number;
  share: number;
}

interface NeighborhoodEntry {
  name: string;
  slug: string;
  borough: string;
  fips: string;
  ntaCodes: string[];
  totalUnits: number;
  hhi: number;
  cr4: number;
  topLandlords: TopLandlord[];
  nychaUnits: number;
  nychaShare: number;
  universityUnits: number;
  universityShare: number;
  topUniversity: string | null;
  hpdViolationsPerUnit: number;
  stabilizedUnits: number;
  stabilizedShare: number;
  medianRent: number;
  medianIncome: number | null;
  rentBurdenPct: number | null;
}

// --- Borough code → county FIPS ---

const BORO_TO_COUNTY_FIPS: Record<string, string> = {
  "1": "061", // Manhattan → New York County
  "2": "005", // Bronx
  "3": "047", // Brooklyn → Kings County
  "4": "081", // Queens
  "5": "085", // Staten Island → Richmond County
};

// --- Owner name normalization ---

// PLUTO placeholder names that don't represent real owners
const PLACEHOLDER_OWNERS = new Set([
  "UNAVAILABLE OWNER",
  "OWNER/AGENT",
  "UNKNOWN OWNER",
  "NOT AVAILABLE",
  "N/A",
  "NA",
  "",
]);

const SUFFIX_PATTERN = /\b(LLC|L\.?L\.?C\.?|INC\.?|INCORPORATED|CORP\.?|CORPORATION|L\.?P\.?|LTD\.?|CO\.?|COMPANY|ASSOCIATES|ASSOC\.?|HOLDINGS|HOLDING|PROPERTIES|PROPERTY|REALTY|MGMT|MANAGEMENT|GROUP|PARTNERS|PARTNERSHIP|TRUST|ESTATE|ENTERPRISES?|DEVELOPMENT|DEV|HDFC)\b/g;

// NYCHA entity resolution: consolidate known NYCHA owner-name variants
// into a single canonical name before general normalization.
// Keeps HPD, HDC, Housing Partnership, and other city agencies separate.
const NYCHA_CANONICAL = "NYC HOUSING AUTHORITY";
const NYCHA_PATTERNS: RegExp[] = [
  /^NYC\s+HOUSING\s+AUTHORITY/,      // main entity (~176K units)
  /^NYCHA\b/,                         // PACT/RAD entities (e.g. NYCHA TRIBOROUGH PRESERVATION HDFC)
];

function resolveNYCHA(name: string): string {
  const upper = name.trim().toUpperCase();
  // Exclude known non-NYCHA city entities that contain "NYC HOUSING"
  if (/^NYC\s+HOUSING\s+PRESERVATION/.test(upper)) return upper; // HPD
  if (/^NYC\s+HOUSING\s+DEVELOPMENT/.test(upper)) return upper;  // HDC
  if (/^NYC\s+HOUSING\s+PARTNERSHIP/.test(upper)) return upper;  // separate program
  for (const pat of NYCHA_PATTERNS) {
    if (pat.test(upper)) return NYCHA_CANONICAL;
  }
  return upper;
}

// University entity resolution: consolidate university owner-name variants
const UNIVERSITY_MAP: [string, RegExp[]][] = [
  ["COLUMBIA UNIVERSITY", [/^COLUMBIA\s+UNIV/, /^THE\s+TRUSTEES\s+OF\s+COLUMBIA/]],
  ["NEW YORK UNIVERSITY", [/^NEW\s+YORK\s+UNIV/, /^NYU\b/]],
  ["CUNY", [/^CUNY\b/, /^CITY\s+UNIV/]],
  ["SUNY", [/^SUNY\b/, /^STATE\s+UNIV.*NEW\s+YORK/]],
  ["FORDHAM UNIVERSITY", [/^FORDHAM\s+UNIV/]],
  ["ST JOHNS UNIVERSITY", [/^ST\.?\s+JOHN'?S?\s+UNIV/]],
  ["LONG ISLAND UNIVERSITY", [/^LONG\s+ISLAND\s+UNIV/, /^LIU\b/]],
  ["COOPER UNION", [/^COOPER\s+UNION/]],
  ["THE NEW SCHOOL", [/^THE\s+NEW\s+SCHOOL/, /^NEW\s+SCHOOL\s+UNIV/]],
  ["PRATT INSTITUTE", [/^PRATT\s+INST/]],
  ["PACE UNIVERSITY", [/^PACE\s+UNIV/]],
  ["YESHIVA UNIVERSITY", [/^YESHIVA\s+UNIV/]],
  ["NEW YORK INSTITUTE OF TECHNOLOGY", [/^NEW\s+YORK\s+INST.*TECH/, /^NYIT\b/]],
];

const UNIVERSITY_CANONICALS = new Set(UNIVERSITY_MAP.map(([name]) => name));

function resolveUniversity(name: string): string | null {
  const upper = name.trim().toUpperCase();
  for (const [canonical, patterns] of UNIVERSITY_MAP) {
    for (const pat of patterns) {
      if (pat.test(upper)) return canonical;
    }
  }
  return null;
}

function isPlaceholderOwner(raw: string): boolean {
  return PLACEHOLDER_OWNERS.has(raw.trim().toUpperCase());
}

function normalizeOwnerName(raw: string): string {
  // Resolve NYCHA variants before general normalization
  let name = resolveNYCHA(raw);

  // Resolve university variants before general normalization
  const uni = resolveUniversity(name);
  if (uni) return uni;

  // Remove suffixes
  name = name.replace(SUFFIX_PATTERN, "");

  // Remove leading/trailing punctuation and whitespace
  name = name.replace(/^[\s,.\-]+|[\s,.\-]+$/g, "");

  // Collapse multiple spaces
  name = name.replace(/\s+/g, " ");

  return name;
}

// --- Slug generation ---

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// --- Main ---

function main() {
  // Load PLUTO data
  const plutoPath = join(ROOT, "data/raw/pluto-residential.json");
  let plutoRecords: PlutoRecord[];
  try {
    plutoRecords = JSON.parse(readFileSync(plutoPath, "utf-8"));
  } catch {
    console.error(`Error: Could not read ${plutoPath}`);
    console.error("Run download-pluto.ts first:");
    console.error("  npx tsx scripts/scrapers/download-pluto.ts");
    process.exit(1);
  }

  // Load crosswalk (geoid → NTA)
  const crosswalkPath = join(ROOT, "data/crosswalks/nta-to-census-tract.json");
  const crosswalk: CrosswalkEntry[] = JSON.parse(readFileSync(crosswalkPath, "utf-8"));

  // Load NTA reference data
  const ntaRefPath = join(ROOT, "data/geography/nyc-ntas-2020.json");
  const ntaRefs: NTARef[] = JSON.parse(readFileSync(ntaRefPath, "utf-8"));

  // Optionally load ACS income data
  const acsPath = join(ROOT, "data/raw/acs-income-tracts-2023.json");
  let acsTracts: TractRecord[] | null = null;
  if (existsSync(acsPath)) {
    acsTracts = JSON.parse(readFileSync(acsPath, "utf-8"));
    console.log(`Loaded ACS income data: ${acsTracts!.length} tracts`);
  } else {
    console.log("No ACS income data found — income fields will be null");
  }

  console.log(`Loaded ${plutoRecords.length} PLUTO parcels, ${crosswalk.length} crosswalk entries, ${ntaRefs.length} NTAs\n`);

  // Build geoid → NTA lookup from crosswalk
  const geoidToNta = new Map<string, string>();
  for (const entry of crosswalk) {
    geoidToNta.set(entry.geoid, entry.ntaCode);
  }

  // Build NTA reference lookup
  const ntaRefMap = new Map<string, NTARef>();
  for (const ref of ntaRefs) {
    ntaRefMap.set(ref.ntaCode, ref);
  }

  // Build ACS tract lookup if available
  const acsTractMap = new Map<string, TractRecord>();
  if (acsTracts) {
    for (const t of acsTracts) {
      acsTractMap.set(t.geoid, t);
    }
  }

  // Build crosswalk: NTA → list of geoids (for income aggregation)
  const ntaToGeoids = new Map<string, string[]>();
  for (const entry of crosswalk) {
    if (!ntaToGeoids.has(entry.ntaCode)) {
      ntaToGeoids.set(entry.ntaCode, []);
    }
    ntaToGeoids.get(entry.ntaCode)!.push(entry.geoid);
  }

  // Map PLUTO records to NTAs and accumulate ownership
  // ntaOwnership: ntaCode → Map<normalizedOwner, totalUnits>
  const ntaOwnership = new Map<string, Map<string, number>>();
  let mapped = 0;
  let unmapped = 0;

  for (const record of plutoRecords) {
    const units = parseInt(record.unitsres, 10) || 0;
    if (units <= 0) continue;

    // bct2020 format: first digit = boroCode, remaining = tract (6 digits)
    const bct = record.bct2020;
    if (!bct || bct.length < 7) {
      unmapped++;
      continue;
    }

    const boroCode = bct.charAt(0);
    const tract = bct.substring(1); // 6-digit tract

    const countyFips = BORO_TO_COUNTY_FIPS[boroCode];
    if (!countyFips) {
      unmapped++;
      continue;
    }

    const geoid = `36${countyFips}${tract}`;
    const ntaCode = geoidToNta.get(geoid);
    if (!ntaCode) {
      unmapped++;
      continue;
    }

    // Skip placeholder/missing owner names
    if (isPlaceholderOwner(record.ownername || "")) {
      mapped++; // Still count as mapped for unit totals
      // Track units separately for total count
      if (!ntaOwnership.has(ntaCode)) {
        ntaOwnership.set(ntaCode, new Map());
      }
      const owners = ntaOwnership.get(ntaCode)!;
      owners.set("__UNATTRIBUTED__", (owners.get("__UNATTRIBUTED__") || 0) + units);
      continue;
    }

    const owner = normalizeOwnerName(record.ownername);

    if (!ntaOwnership.has(ntaCode)) {
      ntaOwnership.set(ntaCode, new Map());
    }
    const owners = ntaOwnership.get(ntaCode)!;
    owners.set(owner, (owners.get(owner) || 0) + units);

    mapped++;
  }

  console.log(`Mapped ${mapped.toLocaleString()} parcels to NTAs, ${unmapped.toLocaleString()} unmapped\n`);

  // Compute concentration metrics per NTA
  const MIN_UNITS = 100;
  const neighborhoods: NeighborhoodEntry[] = [];

  for (const [ntaCode, ownerMap] of ntaOwnership) {
    const totalUnits = [...ownerMap.values()].reduce((a, b) => a + b, 0);
    if (totalUnits < MIN_UNITS) continue;

    const ref = ntaRefMap.get(ntaCode);
    if (!ref) continue;

    // Sort real owners by units descending (exclude unattributed placeholder)
    const sortedOwners = [...ownerMap.entries()]
      .filter(([name]) => name !== "__UNATTRIBUTED__")
      .sort(([, a], [, b]) => b - a);

    // Compute market shares (against total units including unattributed)
    const shares = sortedOwners.map(([, units]) => units / totalUnits);

    // HHI = sum of squared shares × 10000
    const hhi = Math.round(
      shares.reduce((sum, s) => sum + s * s, 0) * 10000
    );

    // CR4 = sum of top 4 shares as percentage
    const cr4 = Math.round(
      shares.slice(0, 4).reduce((sum, s) => sum + s, 0) * 1000
    ) / 10;

    // Top 4 landlords
    const topLandlords: TopLandlord[] = sortedOwners
      .slice(0, 4)
      .map(([name, units]) => ({
        name: titleCase(name),
        units,
        share: Math.round((units / totalUnits) * 1000) / 10,
      }));

    // NYCHA presence in this NTA
    const nychaUnits = ownerMap.get(NYCHA_CANONICAL) || 0;
    const nychaShare = totalUnits > 0
      ? Math.round((nychaUnits / totalUnits) * 1000) / 10
      : 0;

    // University presence in this NTA
    let universityUnits = 0;
    let topUniversity: string | null = null;
    let topUniversityUnits = 0;
    for (const canonical of UNIVERSITY_CANONICALS) {
      const units = ownerMap.get(canonical) || 0;
      if (units > 0) {
        universityUnits += units;
        if (units > topUniversityUnits) {
          topUniversityUnits = units;
          topUniversity = titleCase(canonical);
        }
      }
    }
    const universityShare = totalUnits > 0
      ? Math.round((universityUnits / totalUnits) * 1000) / 10
      : 0;

    // Income data (from ACS if available)
    let medianIncome: number | null = null;
    let rentBurdenPct: number | null = null;

    if (acsTracts && ntaToGeoids.has(ntaCode)) {
      const geoids = ntaToGeoids.get(ntaCode)!;
      let weightedIncomeSum = 0;
      let householdWeightSum = 0;
      let totalRenterHH = 0;
      let totalBurdenedHH = 0;

      for (const geoid of geoids) {
        const tract = acsTractMap.get(geoid);
        if (!tract) continue;

        if (tract.medianIncome !== null && tract.totalHouseholds > 0) {
          weightedIncomeSum += tract.medianIncome * tract.totalHouseholds;
          householdWeightSum += tract.totalHouseholds;
        }
        totalRenterHH += tract.renterHouseholds;
        totalBurdenedHH +=
          tract.rentBurdened30to35 +
          tract.rentBurdened35to40 +
          tract.rentBurdened40to50 +
          tract.rentBurdened50plus;
      }

      if (householdWeightSum > 0) {
        medianIncome = Math.round(weightedIncomeSum / householdWeightSum);
      }
      if (totalRenterHH > 0) {
        rentBurdenPct =
          Math.round((totalBurdenedHH / totalRenterHH) * 1000) / 10;
      }
    }

    neighborhoods.push({
      name: ref.ntaName,
      slug: toSlug(ref.ntaName),
      borough: ref.boroName,
      fips: ref.countyFips.startsWith("36") ? ref.countyFips : `36${ref.countyFips}`,
      ntaCodes: [ntaCode],
      totalUnits,
      hhi,
      cr4,
      topLandlords,
      nychaUnits,
      nychaShare,
      universityUnits,
      universityShare,
      topUniversity,
      hpdViolationsPerUnit: 0,
      stabilizedUnits: 0,
      stabilizedShare: 0,
      medianRent: 0,
      medianIncome,
      rentBurdenPct,
    });
  }

  // Sort by NTA code for consistent output
  neighborhoods.sort((a, b) => a.ntaCodes[0].localeCompare(b.ntaCodes[0]));

  const output = {
    sector: "Residential Rental Housing",
    geography: "NYC Neighborhoods",
    ntaVersion: "2020",
    source: "NYC Dept. of City Planning — MapPLUTO 24v4; ACRIS ownership records",
    incomeSource: "U.S. Census Bureau, ACS 2023 5-Year Estimates (Tables B19013, B25070)",
    neighborhoods,
  };

  const outPath = join(ROOT, "data/concentration/housing-neighborhoods.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`Saved ${outPath}`);
  console.log(`  ${neighborhoods.length} NTAs with >= ${MIN_UNITS} residential units`);

  // Summary stats
  const hhis = neighborhoods.map((n) => n.hhi).sort((a, b) => a - b);
  const cr4s = neighborhoods.map((n) => n.cr4).sort((a, b) => a - b);

  console.log(`\nHHI range: ${hhis[0]} – ${hhis[hhis.length - 1]}`);
  console.log(`Median HHI: ${hhis[Math.floor(hhis.length / 2)]}`);
  console.log(`CR4 range: ${cr4s[0]}% – ${cr4s[cr4s.length - 1]}%`);

  // Borough breakdown
  const byBoro = new Map<string, number>();
  for (const n of neighborhoods) {
    byBoro.set(n.borough, (byBoro.get(n.borough) || 0) + 1);
  }
  console.log("\nBy borough:");
  for (const [boro, count] of [...byBoro].sort()) {
    console.log(`  ${boro}: ${count} NTAs`);
  }

  // Top 5 most concentrated
  const topConcentrated = [...neighborhoods].sort((a, b) => b.hhi - a.hhi).slice(0, 5);
  console.log("\nTop 5 most concentrated NTAs:");
  for (const n of topConcentrated) {
    console.log(`  ${n.name} (${n.borough}): HHI ${n.hhi}, CR4 ${n.cr4}%`);
  }

  // NYCHA summary
  const nychaNeighborhoods = neighborhoods.filter((n) => n.nychaUnits > 0);
  const totalNychaUnits = nychaNeighborhoods.reduce((sum, n) => sum + n.nychaUnits, 0);
  const topNycha = [...nychaNeighborhoods].sort((a, b) => b.nychaShare - a.nychaShare).slice(0, 5);
  console.log(`\nNYCHA: ${totalNychaUnits.toLocaleString()} units across ${nychaNeighborhoods.length} NTAs`);
  console.log("Top 5 NYCHA NTAs by share:");
  for (const n of topNycha) {
    console.log(`  ${n.name} (${n.borough}): ${n.nychaUnits.toLocaleString()} units, ${n.nychaShare}%`);
  }

  // University summary
  const uniNeighborhoods = neighborhoods.filter((n) => n.universityUnits > 0);
  const totalUniUnits = uniNeighborhoods.reduce((sum, n) => sum + n.universityUnits, 0);
  const topUni = [...uniNeighborhoods].sort((a, b) => b.universityShare - a.universityShare).slice(0, 5);
  console.log(`\nUniversities: ${totalUniUnits.toLocaleString()} units across ${uniNeighborhoods.length} NTAs`);
  console.log("Top 5 university NTAs by share:");
  for (const n of topUni) {
    console.log(`  ${n.name} (${n.borough}): ${n.universityUnits.toLocaleString()} units, ${n.universityShare}% — ${n.topUniversity}`);
  }

  console.log("\nDone.");
}

/** Convert UPPERCASE name to Title Case */
function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.length <= 2 && word !== "a") return word.toUpperCase(); // Keep short words like "NY" uppercase
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

main();

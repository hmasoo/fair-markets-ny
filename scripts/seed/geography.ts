import { readFileSync } from "fs";
import { join } from "path";

const DRY_RUN = process.argv.includes("--dry-run");

const JURISDICTION = "us-ny";
const COUNTRY_CODE = "us";

interface CountyRef {
  fips: string;
  name: string;
  nycBorough?: string;
}

interface NeighborhoodEntry {
  name: string;
  slug: string;
  borough: string;
  fips: string;
  ntaCodes: string[];
}

interface NeighborhoodFile {
  neighborhoods: NeighborhoodEntry[];
}

interface NTARef {
  ntaCode: string;
  ntaName: string;
  ntaAbbrev: string;
  boroCode: string;
  boroName: string;
  countyFips: string;
  cdta: string;
}

function readJson<T>(relativePath: string): T {
  const fullPath = join(process.cwd(), relativePath);
  return JSON.parse(readFileSync(fullPath, "utf-8"));
}

async function main() {
  console.log(`Geography seed ${DRY_RUN ? "(DRY RUN)" : ""}\n`);

  const counties = readJson<CountyRef[]>("data/geography/nys-counties.json");
  const neighborhoods = readJson<NeighborhoodFile>(
    "data/concentration/housing-neighborhoods.json"
  );
  const ntas = readJson<NTARef[]>("data/geography/nyc-ntas-2020.json");

  // Build borough name → NTA list for hierarchy display
  const ntasByBoro = new Map<string, NTARef[]>();
  for (const nta of ntas) {
    const list = ntasByBoro.get(nta.boroName) ?? [];
    list.push(nta);
    ntasByBoro.set(nta.boroName, list);
  }

  if (DRY_RUN) {
    // Preview the hierarchy without any DB connection
    console.log("COUNTRY: United States (code: us)");
    console.log("  STATE: New York State (fips: 36)");
    console.log("    CITY: New York City (fips: 3651000)");

    const nycBoroughs = counties.filter((c) => c.nycBorough);
    for (const c of nycBoroughs) {
      const boroNTAs = ntasByBoro.get(c.nycBorough!) ?? [];
      console.log(`      BOROUGH: ${c.nycBorough} (fips: ${c.fips})`);
      console.log(`        NTAs: ${boroNTAs.length}`);
      for (const nta of boroNTAs.slice(0, 3)) {
        console.log(`          ${nta.ntaCode}: ${nta.ntaName}`);
      }
      if (boroNTAs.length > 3) {
        console.log(`          ... and ${boroNTAs.length - 3} more`);
      }
    }

    const upstate = counties.filter((c) => !c.nycBorough);
    console.log(`    COUNTY: ${upstate.length} non-NYC counties`);
    for (const c of upstate.slice(0, 5)) {
      console.log(`      ${c.name} (fips: ${c.fips})`);
    }
    if (upstate.length > 5) {
      console.log(`      ... and ${upstate.length - 5} more`);
    }

    console.log(`    NEIGHBORHOOD: ${neighborhoods.neighborhoods.length} neighborhoods`);
    for (const n of neighborhoods.neighborhoods) {
      console.log(`      ${n.name} → ${n.borough} (ntaCodes: ${n.ntaCodes.join(", ")})`);
    }

    // +1 for country, +1 for state
    const total = 1 + 1 + 1 + nycBoroughs.length + ntas.length + upstate.length + neighborhoods.neighborhoods.length;
    console.log(`\nTotal: ${total} geography records would be created`);
    console.log(`  (1 country + 1 state + 1 city + ${nycBoroughs.length} boroughs + ${ntas.length} NTAs + ${upstate.length} counties + ${neighborhoods.neighborhoods.length} neighborhoods)`);
    console.log("Dry run complete — no database connection needed.");
    return;
  }

  // Live mode — connect to database
  const { prisma } = await import("../lib/db");

  async function findOrCreate(
    slug: string,
    data: {
      name: string;
      slug: string;
      type: "COUNTRY" | "STATE" | "CITY" | "BOROUGH" | "COUNTY" | "NTA" | "NEIGHBORHOOD";
      jurisdiction: string;
      countryCode: string;
      fipsCode?: string | null;
      parentId?: string | null;
    }
  ) {
    const existing = await prisma.geography.findFirst({ where: { slug } });
    if (existing) return existing;
    return await prisma.geography.create({ data });
  }

  // 0. United States (COUNTRY root)
  const us = await findOrCreate("united-states", {
    name: "United States",
    slug: "united-states",
    type: "COUNTRY",
    jurisdiction: JURISDICTION,
    countryCode: COUNTRY_CODE,
    fipsCode: "us",
  });
  console.log("COUNTRY: United States");

  // 1. New York State
  const nys = await findOrCreate("new-york-state", {
    name: "New York State",
    slug: "new-york-state",
    type: "STATE",
    jurisdiction: JURISDICTION,
    countryCode: COUNTRY_CODE,
    fipsCode: "36",
    parentId: us.id,
  });
  console.log("STATE: New York State (fips: 36)");

  // 2. New York City
  const nyc = await findOrCreate("nyc", {
    name: "New York City",
    slug: "nyc",
    type: "CITY",
    jurisdiction: JURISDICTION,
    countryCode: COUNTRY_CODE,
    fipsCode: "3651000",
    parentId: nys.id,
  });
  console.log("CITY: New York City (fips: 3651000, parent: NYS)");

  // 3. NYC boroughs (BOROUGH type, using county FIPS)
  const nycCountyFips = new Set<string>();
  const boroughIds: Record<string, string> = {};
  let boroughCount = 0;

  for (const county of counties) {
    if (county.nycBorough) {
      nycCountyFips.add(county.fips);
      const slug = county.nycBorough.toLowerCase().replace(/\s+/g, "-");
      const boro = await findOrCreate(slug, {
        name: county.nycBorough,
        slug,
        type: "BOROUGH",
        jurisdiction: JURISDICTION,
        countryCode: COUNTRY_CODE,
        fipsCode: county.fips,
        parentId: nyc.id,
      });
      boroughIds[county.nycBorough] = boro.id;
      boroughCount++;
    }
  }
  console.log(`BOROUGH: ${boroughCount} NYC boroughs`);

  // 4. NTAs (NTA type, parent = their borough)
  let ntaCount = 0;
  for (const nta of ntas) {
    const parentId = boroughIds[nta.boroName];
    if (!parentId) {
      console.warn(`  Warning: no borough found for NTA "${nta.ntaCode}" (${nta.boroName})`);
      continue;
    }
    const slug = `nta-${nta.ntaCode.toLowerCase()}`;
    await findOrCreate(slug, {
      name: nta.ntaName,
      slug,
      type: "NTA",
      jurisdiction: JURISDICTION,
      countryCode: COUNTRY_CODE,
      fipsCode: nta.ntaCode,
      parentId,
    });
    ntaCount++;
  }
  console.log(`NTA: ${ntaCount} Neighborhood Tabulation Areas`);

  // 5. Upstate counties (COUNTY type)
  let upstateCount = 0;
  for (const county of counties) {
    if (nycCountyFips.has(county.fips)) continue;
    const slug = county.name
      .toLowerCase()
      .replace(/\s+county$/i, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    await findOrCreate(`county-${slug}`, {
      name: county.name,
      slug: `county-${slug}`,
      type: "COUNTY",
      jurisdiction: JURISDICTION,
      countryCode: COUNTRY_CODE,
      fipsCode: county.fips,
      parentId: nys.id,
    });
    upstateCount++;
  }
  console.log(`COUNTY: ${upstateCount} non-NYC counties`);

  // 6. Neighborhoods (NEIGHBORHOOD type, parent = their borough)
  let neighborhoodCount = 0;
  for (const n of neighborhoods.neighborhoods) {
    const parentId = boroughIds[n.borough];
    if (!parentId) {
      console.warn(`  Warning: no borough found for "${n.borough}"`);
      continue;
    }
    await findOrCreate(n.slug, {
      name: n.name,
      slug: n.slug,
      type: "NEIGHBORHOOD",
      jurisdiction: JURISDICTION,
      countryCode: COUNTRY_CODE,
      parentId,
    });
    neighborhoodCount++;
  }
  console.log(`NEIGHBORHOOD: ${neighborhoodCount} neighborhoods`);

  console.log(`\nTotal: 1 country + 1 state + 1 city + ${boroughCount} boroughs + ${ntaCount} NTAs + ${upstateCount} counties + ${neighborhoodCount} neighborhoods`);
  console.log("Geography seed complete.");

  await prisma.$disconnect();
}

main().catch(console.error);

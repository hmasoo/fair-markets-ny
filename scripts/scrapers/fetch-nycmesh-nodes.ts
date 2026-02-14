/**
 * Fetch NYC Mesh node data from the public MeshDB API
 *
 * Usage:
 *   npx tsx scripts/scrapers/fetch-nycmesh-nodes.ts [--dry-run]
 *
 * Source: https://db.nycmesh.net/api/v1/mapdata/nodes/
 */

import { writeFileSync } from "fs";
import { join } from "path";

const API_URL = "https://db.nycmesh.net/api/v1/mapdata/nodes/";
const USER_AGENT = "FairMarketsNY/0.1 (civic data project)";
const OUTPUT_PATH = join(__dirname, "../../data/concentration/nycmesh-nodes.json");

const DRY_RUN = process.argv.includes("--dry-run");

interface MeshNode {
  id: number;
  name: string | null;
  status: string;
  coordinates: [number, number, number]; // [lng, lat, alt]
  notes: string | null;
}

interface BoroughData {
  borough: string;
  slug: string;
  fips: string;
  activeNodes: number;
  supernodes: number;
  hubs: number;
}

// Approximate bounding boxes for NYC boroughs (lng/lat)
const BOROUGH_BOUNDS: {
  name: string;
  slug: string;
  fips: string;
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}[] = [
  {
    name: "Manhattan",
    slug: "new-york",
    fips: "36061",
    minLng: -74.02,
    maxLng: -73.90,
    minLat: 40.70,
    maxLat: 40.88,
  },
  {
    name: "Brooklyn",
    slug: "kings",
    fips: "36047",
    minLng: -74.05,
    maxLng: -73.83,
    minLat: 40.57,
    maxLat: 40.74,
  },
  {
    name: "Queens",
    slug: "queens",
    fips: "36081",
    minLng: -73.96,
    maxLng: -73.70,
    minLat: 40.54,
    maxLat: 40.80,
  },
  {
    name: "Bronx",
    slug: "bronx",
    fips: "36005",
    minLng: -73.93,
    maxLng: -73.75,
    minLat: 40.79,
    maxLat: 40.92,
  },
  {
    name: "Staten Island",
    slug: "richmond",
    fips: "36085",
    minLng: -74.26,
    maxLng: -74.05,
    minLat: 40.49,
    maxLat: 40.65,
  },
];

function assignBorough(lng: number, lat: number): string | null {
  for (const b of BOROUGH_BOUNDS) {
    if (lng >= b.minLng && lng <= b.maxLng && lat >= b.minLat && lat <= b.maxLat) {
      return b.name;
    }
  }
  return null;
}

function classifyNode(notes: string | null): "supernode" | "hub" | "other" {
  if (!notes) return "other";
  const lower = notes.toLowerCase();
  if (lower.includes("supernode")) return "supernode";
  if (lower.includes("hub")) return "hub";
  return "other";
}

async function main() {
  console.log("Fetching NYC Mesh node data...");
  console.log(`API: ${API_URL}`);
  if (DRY_RUN) console.log("(dry run — no file will be written)\n");

  const res = await fetch(API_URL, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const nodes: MeshNode[] = await res.json();
  console.log(`Total nodes from API: ${nodes.length}`);

  // Filter to installed nodes only
  const installed = nodes.filter((n) => n.status === "Installed");
  console.log(`Installed nodes: ${installed.length}`);

  // Classify and assign boroughs
  const boroughCounts = new Map<string, { active: number; supernodes: number; hubs: number }>();
  let unassigned = 0;
  let totalSupernodes = 0;
  let totalHubs = 0;

  for (const node of installed) {
    const [lng, lat] = node.coordinates;
    const borough = assignBorough(lng, lat);
    const type = classifyNode(node.notes);

    if (type === "supernode") totalSupernodes++;
    if (type === "hub") totalHubs++;

    if (!borough) {
      unassigned++;
      continue;
    }

    const counts = boroughCounts.get(borough) ?? { active: 0, supernodes: 0, hubs: 0 };
    counts.active++;
    if (type === "supernode") counts.supernodes++;
    if (type === "hub") counts.hubs++;
    boroughCounts.set(borough, counts);
  }

  // Build borough data
  const boroughs: BoroughData[] = BOROUGH_BOUNDS
    .map((b) => {
      const counts = boroughCounts.get(b.name) ?? { active: 0, supernodes: 0, hubs: 0 };
      return {
        borough: b.name,
        slug: b.slug,
        fips: b.fips,
        activeNodes: counts.active,
        supernodes: counts.supernodes,
        hubs: counts.hubs,
      };
    })
    .filter((b) => b.activeNodes > 0)
    .sort((a, b) => b.activeNodes - a.activeNodes);

  const output = {
    source: "NYC Mesh MeshDB — Public Map Data API",
    sourceUrl: "https://db.nycmesh.net/api/v1/mapdata/nodes/",
    lastUpdated: new Date().toISOString().split("T")[0],
    notes:
      "Borough assignment via coordinate bounding boxes. Only nodes with status 'Installed'.",
    citywide: {
      activeNodes: installed.length,
      supernodes: totalSupernodes,
      hubs: totalHubs,
    },
    boroughs,
  };

  // Summary
  console.log("\n--- Summary ---");
  console.log(`Active nodes: ${output.citywide.activeNodes}`);
  console.log(`Supernodes: ${output.citywide.supernodes}`);
  console.log(`Hubs: ${output.citywide.hubs}`);
  console.log(`Unassigned to borough: ${unassigned}`);
  console.log("\nBy borough:");
  for (const b of boroughs) {
    console.log(
      `  ${b.borough}: ${b.activeNodes} nodes (${b.supernodes} supernodes, ${b.hubs} hubs)`,
    );
  }

  if (!DRY_RUN) {
    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");
    console.log(`\nWrote ${OUTPUT_PATH}`);
  } else {
    console.log("\n(dry run — skipped file write)");
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

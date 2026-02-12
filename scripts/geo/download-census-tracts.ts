/**
 * Download 2020 Census Tract boundaries for NYC from NYC Open Data (Socrata API).
 *
 * Source: NYC DCP — 2020 Census Tracts (Clipped to Shoreline)
 * Dataset: https://data.cityofnewyork.us/City-Government/2020-Census-Tracts-Clipped-to-Shoreline-/63ge-mke6
 *
 * Output:
 *   data/geography/nyc-census-tracts-2020.geojson (gitignored — large file)
 *
 * Usage:
 *   npx tsx scripts/geo/download-census-tracts.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");
const GEO_DIR = join(ROOT, "data/geography");

const ENDPOINT = "https://data.cityofnewyork.us/resource/63ge-mke6.geojson";

interface GeoJSONFeature {
  type: "Feature";
  geometry: unknown;
  properties: Record<string, unknown>;
}

interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

async function main() {
  mkdirSync(GEO_DIR, { recursive: true });

  console.log("Fetching 2020 Census Tract boundaries from NYC Open Data...");

  const url = `${ENDPOINT}?$limit=3000`;
  const res = await fetch(url, {
    headers: { "User-Agent": "FairMarketsNY/0.1 (civic data project)" },
  });

  if (!res.ok) {
    throw new Error(`Socrata API error: ${res.status} ${res.statusText}`);
  }

  const raw = (await res.json()) as GeoJSONCollection;
  console.log(`  Received ${raw.features.length} census tract features`);

  // Standardize properties
  const standardized: GeoJSONCollection = {
    type: "FeatureCollection",
    features: raw.features.map((f) => {
      const p = f.properties;
      return {
        type: "Feature",
        geometry: f.geometry,
        properties: {
          GEOID: String(p.geoid ?? p.GEOID ?? ""),
          NAME: String(p.ctlabel ?? p.CTLabel ?? p.geoid ?? ""),
          BoroCode: String(p.borocode ?? p.BoroCode ?? ""),
          BoroName: String(p.boroname ?? p.BoroName ?? ""),
          NTA2020: String(p.nta2020 ?? p.NTA2020 ?? ""),
          NTAName: String(p.ntaname ?? p.NTAName ?? ""),
        },
      };
    }),
  };

  const outPath = join(GEO_DIR, "nyc-census-tracts-2020.geojson");
  writeFileSync(outPath, JSON.stringify(standardized, null, 2));
  const sizeKB = (Buffer.byteLength(JSON.stringify(standardized)) / 1024).toFixed(0);
  console.log(`  Saved ${outPath} (${standardized.features.length} features, ${sizeKB} KB)`);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

/**
 * Download 2020 NTA boundaries from NYC Open Data (Socrata API).
 *
 * Source: NYC Department of City Planning — 2020 Neighborhood Tabulation Areas (NTAs)
 * Dataset: https://data.cityofnewyork.us/City-Government/2020-Neighborhood-Tabulation-Areas-NTAs-/9nt8-h7nd
 *
 * Outputs:
 *   data/geography/nyc-ntas-2020.geojson — Full GeoJSON with geometry (gitignored)
 *   data/geography/nyc-ntas-2020.json    — Lightweight reference, no geometry (committed)
 *
 * Usage:
 *   npx tsx scripts/geo/download-nta-boundaries.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../..");
const GEO_DIR = join(ROOT, "data/geography");

const ENDPOINT = "https://data.cityofnewyork.us/resource/9nt8-h7nd.geojson";

const BORO_NAMES: Record<string, string> = {
  "1": "Manhattan",
  "2": "Bronx",
  "3": "Brooklyn",
  "4": "Queens",
  "5": "Staten Island",
};

const BORO_FIPS: Record<string, string> = {
  "1": "36061",
  "2": "36005",
  "3": "36047",
  "4": "36081",
  "5": "36085",
};

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

  console.log("Fetching 2020 NTA boundaries from NYC Open Data...");

  const url = `${ENDPOINT}?$limit=500`;
  const res = await fetch(url, {
    headers: { "User-Agent": "FairMarketsNY/0.1 (civic data project)" },
  });

  if (!res.ok) {
    throw new Error(`Socrata API error: ${res.status} ${res.statusText}`);
  }

  const raw = (await res.json()) as GeoJSONCollection;
  console.log(`  Received ${raw.features.length} total NTA features`);

  // Filter to residential NTAs (ntatype = 0), excluding parks/airports/cemeteries
  const residential = raw.features.filter((f) => {
    const p = f.properties;
    const ntatype = String(p.ntatype ?? p.NTAType ?? "");
    return ntatype === "0";
  });
  console.log(`  Filtered to ${residential.length} residential NTAs`);

  // Standardize properties
  const standardized: GeoJSONCollection = {
    type: "FeatureCollection",
    features: residential.map((f) => {
      const p = f.properties;
      const boroCode = String(p.borocode ?? p.BoroCode ?? "");
      return {
        type: "Feature",
        geometry: f.geometry,
        properties: {
          GEOID: p.nta2020 ?? p.NTA2020 ?? "",
          NAME: p.ntaname ?? p.NTAName ?? "",
          NTAAbbrev: p.ntaabbrev ?? p.NTAAbbrev ?? "",
          BoroCode: boroCode,
          BoroName: BORO_NAMES[boroCode] ?? String(p.boroname ?? ""),
          CountyFIPS: BORO_FIPS[boroCode] ?? String(p.countyfips ?? ""),
          CDTA: p.cdta2020 ?? p.CDTA2020 ?? "",
        },
      };
    }),
  };

  // Save full GeoJSON (gitignored — can be re-downloaded)
  const geojsonPath = join(GEO_DIR, "nyc-ntas-2020.geojson");
  writeFileSync(geojsonPath, JSON.stringify(standardized, null, 2));
  const sizeKB = (Buffer.byteLength(JSON.stringify(standardized)) / 1024).toFixed(0);
  console.log(`  Saved ${geojsonPath} (${sizeKB} KB)`);

  // Save lightweight reference JSON (no geometry — committed)
  const reference = standardized.features
    .map((f) => ({
      ntaCode: f.properties.GEOID as string,
      ntaName: f.properties.NAME as string,
      ntaAbbrev: f.properties.NTAAbbrev as string,
      boroCode: f.properties.BoroCode as string,
      boroName: f.properties.BoroName as string,
      countyFips: f.properties.CountyFIPS as string,
      cdta: f.properties.CDTA as string,
    }))
    .sort((a, b) => a.ntaCode.localeCompare(b.ntaCode));

  const refPath = join(GEO_DIR, "nyc-ntas-2020.json");
  writeFileSync(refPath, JSON.stringify(reference, null, 2));
  console.log(`  Saved ${refPath} (${reference.length} NTAs)`);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

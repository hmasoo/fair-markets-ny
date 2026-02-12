/**
 * Build TopoJSON boundary files from GeoJSON sources.
 *
 * Converts GeoJSON files to TopoJSON for smaller bundles and standardizes
 * property names (GEOID, NAME, BoroName) across all layers.
 *
 * Prerequisites:
 *   - Borough/county sources: public/geo/nyc-boroughs.json, nys-counties.json
 *   - NTA/tract sources: run download scripts first to populate data/geography/
 *
 * Usage:
 *   npx tsx scripts/geo/build-boundaries.ts
 *
 * Outputs:
 *   public/geo/nyc-boroughs.topojson       — 5 NYC boroughs keyed by GEOID
 *   public/geo/nys-counties.topojson       — 62 NYS counties keyed by GEOID
 *   public/geo/nyc-ntas.topojson           — ~197 residential NTAs keyed by GEOID
 *   public/geo/nyc-census-tracts.topojson  — ~2,100 NYC census tracts keyed by GEOID
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import * as topojson from "topojson-server";
import type { FeatureCollection } from "geojson";

const ROOT = join(__dirname, "../..");
const OUT_DIR = join(ROOT, "public/geo");
const DATA_GEO_DIR = join(ROOT, "data/geography");

// Borough name → county FIPS for standardized GEOID property
const BOROUGH_FIPS: Record<string, string> = {
  Manhattan: "36061",
  Bronx: "36005",
  Brooklyn: "36047",
  Queens: "36081",
  "Staten Island": "36085",
};

function logResult(name: string, featureCount: number, topo: unknown) {
  const sizeKB = (Buffer.byteLength(JSON.stringify(topo)) / 1024).toFixed(1);
  console.log(`  ${name}: ${featureCount} features, ${sizeKB} KB`);
}

function buildBoroughs() {
  const srcPath = join(OUT_DIR, "nyc-boroughs.json");
  if (!existsSync(srcPath)) {
    console.log("  nyc-boroughs: skipped (source not found)");
    return;
  }

  const raw = JSON.parse(readFileSync(srcPath, "utf-8")) as FeatureCollection;

  for (const feature of raw.features) {
    const props = feature.properties ?? {};
    const boroName = props.BoroName as string;
    feature.properties = {
      GEOID: BOROUGH_FIPS[boroName] ?? "",
      NAME: boroName,
      BoroName: boroName,
      BoroCode: props.BoroCode,
    };
  }

  const topo = topojson.topology({ boroughs: raw });
  writeFileSync(join(OUT_DIR, "nyc-boroughs.topojson"), JSON.stringify(topo));
  logResult("nyc-boroughs.topojson", raw.features.length, topo);
}

function buildCounties() {
  const srcPath = join(OUT_DIR, "nys-counties.json");
  if (!existsSync(srcPath)) {
    console.log("  nys-counties: skipped (source not found)");
    return;
  }

  const raw = JSON.parse(readFileSync(srcPath, "utf-8")) as FeatureCollection;

  for (const feature of raw.features) {
    const props = feature.properties ?? {};
    const geoid = (props.geoid as string)?.replace("05000US", "") ?? "";
    const name = (props.name as string) ?? "";
    feature.properties = {
      GEOID: geoid,
      NAME: name,
    };
  }

  const topo = topojson.topology({ counties: raw });
  writeFileSync(join(OUT_DIR, "nys-counties.topojson"), JSON.stringify(topo));
  logResult("nys-counties.topojson", raw.features.length, topo);
}

function buildNTAs() {
  const srcPath = join(DATA_GEO_DIR, "nyc-ntas-2020.geojson");
  if (!existsSync(srcPath)) {
    console.log("  nyc-ntas: skipped (run download-nta-boundaries first)");
    return;
  }

  const raw = JSON.parse(readFileSync(srcPath, "utf-8")) as FeatureCollection;

  // Properties are already standardized by the download script (GEOID, NAME, etc.)
  const topo = topojson.topology({ ntas: raw });
  writeFileSync(join(OUT_DIR, "nyc-ntas.topojson"), JSON.stringify(topo));
  logResult("nyc-ntas.topojson", raw.features.length, topo);
}

function buildCensusTracts() {
  const srcPath = join(DATA_GEO_DIR, "nyc-census-tracts-2020.geojson");
  if (!existsSync(srcPath)) {
    console.log("  nyc-census-tracts: skipped (run download-census-tracts first)");
    return;
  }

  const raw = JSON.parse(readFileSync(srcPath, "utf-8")) as FeatureCollection;

  // Properties are already standardized by the download script (GEOID, NAME, etc.)
  const topo = topojson.topology({ tracts: raw });
  writeFileSync(join(OUT_DIR, "nyc-census-tracts.topojson"), JSON.stringify(topo));
  logResult("nyc-census-tracts.topojson", raw.features.length, topo);
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log("Building TopoJSON boundary files...\n");

  buildBoroughs();
  buildCounties();
  buildNTAs();
  buildCensusTracts();

  console.log("\nDone.");
}

main();

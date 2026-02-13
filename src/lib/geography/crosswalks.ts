import { z } from "zod/v4";
import type {
  TractNTACrosswalkEntry,
  BoroughCountyEntry,
  NeighborhoodNTAEntry,
} from "./types";

import ntaTractRaw from "../../../data/crosswalks/nta-to-census-tract.json";
import boroughFipsRaw from "../../../data/crosswalks/borough-county-fips.json";
import neighborhoodNtaRaw from "../../../data/crosswalks/neighborhood-to-nta.json";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const TractNTASchema = z.array(
  z.object({
    geoid: z.string(),
    ntaCode: z.string(),
    ntaName: z.string(),
    boroCode: z.string(),
    boroName: z.string(),
    countyFips: z.string(),
  }),
);

const BoroughCountySchema = z.array(
  z.object({
    borough: z.string(),
    boroCode: z.number(),
    county: z.string(),
    fips: z.string(),
  }),
);

const NeighborhoodNTASchema = z.array(
  z.object({
    slug: z.string(),
    name: z.string(),
    borough: z.string(),
    fips: z.string(),
    ntaVersion: z.string(),
    ntaCodes: z.array(z.string()),
    ntaNames: z.array(z.string()),
  }),
);

// ---------------------------------------------------------------------------
// Validated exports
// ---------------------------------------------------------------------------

export const tractNTACrosswalk: TractNTACrosswalkEntry[] =
  TractNTASchema.parse(ntaTractRaw);
export const boroughCountyCrosswalk: BoroughCountyEntry[] =
  BoroughCountySchema.parse(boroughFipsRaw);
export const neighborhoodNTACrosswalk: NeighborhoodNTAEntry[] =
  NeighborhoodNTASchema.parse(neighborhoodNtaRaw);

// ---------------------------------------------------------------------------
// Lookup utilities (pre-built Maps for O(1) access)
// ---------------------------------------------------------------------------

const _tractToNTA = new Map<string, string>();
const _ntaToTracts = new Map<string, string[]>();
for (const entry of tractNTACrosswalk) {
  _tractToNTA.set(entry.geoid, entry.ntaCode);
  const list = _ntaToTracts.get(entry.ntaCode) ?? [];
  list.push(entry.geoid);
  _ntaToTracts.set(entry.ntaCode, list);
}

const _fipsToBorough = new Map<string, string>();
const _boroughToFips = new Map<string, string>();
for (const entry of boroughCountyCrosswalk) {
  _fipsToBorough.set(entry.fips, entry.borough);
  _boroughToFips.set(entry.borough, entry.fips);
}

const _neighborhoodToNTAs = new Map<string, string[]>();
for (const entry of neighborhoodNTACrosswalk) {
  _neighborhoodToNTAs.set(entry.slug, entry.ntaCodes);
}

/** Get the NTA code for a census tract GEOID */
export function tractToNTA(geoid: string): string | undefined {
  return _tractToNTA.get(geoid);
}

/** Get all census tract GEOIDs within an NTA */
export function ntaToTracts(ntaCode: string): string[] {
  return _ntaToTracts.get(ntaCode) ?? [];
}

/** Get the borough name for a county FIPS code */
export function fipsToBorough(fips: string): string | undefined {
  return _fipsToBorough.get(fips);
}

/** Get the county FIPS code for a borough name */
export function boroughToFips(borough: string): string | undefined {
  return _boroughToFips.get(borough);
}

/** Get all NTA codes for a neighborhood slug */
export function neighborhoodToNTACodes(slug: string): string[] {
  return _neighborhoodToNTAs.get(slug) ?? [];
}

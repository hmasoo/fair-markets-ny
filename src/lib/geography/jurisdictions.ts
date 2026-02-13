import type { JurisdictionConfig, GeographyLevel } from "./types";

export const US_NY: JurisdictionConfig = {
  code: "us-ny",
  country: "us",
  name: "New York State",
  shortName: "NY",
  stateCode: "36",
  levels: [
    { level: "COUNTRY", parentLevel: null, idField: "fips" },
    { level: "STATE", parentLevel: "COUNTRY", idField: "fips" },
    {
      level: "COUNTY",
      parentLevel: "STATE",
      idField: "fips",
      topoJsonPath: "/geo/nys-counties.topojson",
      objectName: "counties",
    },
    { level: "CITY", parentLevel: "STATE", idField: "fips" },
    {
      level: "BOROUGH",
      parentLevel: "CITY",
      idField: "fips",
      topoJsonPath: "/geo/nyc-boroughs.topojson",
      objectName: "boroughs",
    },
    {
      level: "NTA",
      parentLevel: "BOROUGH",
      idField: "ntaCode",
      topoJsonPath: "/geo/nyc-ntas.topojson",
      objectName: "ntas",
    },
    {
      level: "CENSUS_TRACT",
      parentLevel: "COUNTY",
      idField: "geoid",
      topoJsonPath: "/geo/nyc-census-tracts.topojson",
      objectName: "tracts",
    },
  ],
};

/** Registry of all configured jurisdictions */
export const JURISDICTIONS: Record<string, JurisdictionConfig> = {
  "us-ny": US_NY,
};

export const DEFAULT_JURISDICTION = US_NY;

export function getJurisdiction(code: string): JurisdictionConfig {
  const j = JURISDICTIONS[code];
  if (!j) throw new Error(`Unknown jurisdiction: ${code}`);
  return j;
}

/** Get the TopoJSON path for a given level in a jurisdiction */
export function getTopoJsonPath(
  jurisdiction: JurisdictionConfig,
  level: GeographyLevel,
): string | undefined {
  return jurisdiction.levels.find((l) => l.level === level)?.topoJsonPath;
}

/** Get the TopoJSON object name for a given level in a jurisdiction */
export function getObjectName(
  jurisdiction: JurisdictionConfig,
  level: GeographyLevel,
): string | undefined {
  return jurisdiction.levels.find((l) => l.level === level)?.objectName;
}

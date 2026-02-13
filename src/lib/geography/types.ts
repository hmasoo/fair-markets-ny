// Jurisdiction identification — extensible string literals
export type CountryCode = "us" | "ca";
export type JurisdictionCode = `${CountryCode}-${string}`; // "us-ny", "ca-on", etc.

// Mirror of Prisma GeographyType enum for use in non-Prisma contexts
export type GeographyLevel =
  | "COUNTRY"
  | "STATE"
  | "COUNTY"
  | "BOROUGH"
  | "CITY"
  | "NEIGHBORHOOD"
  | "NTA"
  | "COMMUNITY_DISTRICT"
  | "CENSUS_TRACT"
  | "CENSUS_BLOCK_GROUP"
  | "CENSUS_BLOCK"
  | "ZCTA";

// Hierarchy definition for one level within a jurisdiction
export interface GeographyLevelConfig {
  level: GeographyLevel;
  parentLevel: GeographyLevel | null;
  /** Property name used to join map features to data ("fips", "geoid", "ntaCode") */
  idField: string;
  /** Path in /public, if map boundary file exists */
  topoJsonPath?: string;
  /** TopoJSON object name inside the file */
  objectName?: string;
}

// Full config for a jurisdiction
export interface JurisdictionConfig {
  code: JurisdictionCode;
  country: CountryCode;
  name: string; // "New York State"
  shortName: string; // "NY"
  /** FIPS code for US states, province code for CA, etc. */
  stateCode: string;
  levels: GeographyLevelConfig[];
}

// Typed crosswalk entry shapes (match the JSON files in data/crosswalks/)

export interface TractNTACrosswalkEntry {
  geoid: string;
  ntaCode: string;
  ntaName: string;
  boroCode: string;
  boroName: string;
  countyFips: string;
}

export interface BoroughCountyEntry {
  borough: string;
  boroCode: number;
  county: string;
  fips: string;
}

export interface NeighborhoodNTAEntry {
  slug: string;
  name: string;
  borough: string;
  fips: string;
  ntaVersion: string;
  ntaCodes: string[];
  ntaNames: string[];
}

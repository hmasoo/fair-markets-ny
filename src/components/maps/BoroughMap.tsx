"use client";

import { ChoroplethMap, type ChoroplethMapProps } from "./ChoroplethMap";
import {
  DEFAULT_JURISDICTION,
  getTopoJsonPath,
  getObjectName,
} from "@/lib/geography/jurisdictions";

const BOROUGH_ABBREVIATIONS: Record<string, string> = {
  "Staten Island": "SI",
  Manhattan: "MN",
  Brooklyn: "BK",
  Queens: "QN",
  Bronx: "BX",
};

type BoroughMapProps = Omit<
  ChoroplethMapProps,
  "topoJsonPath" | "objectName" | "featureKeyProp" | "featureLabelProp" | "showLabels" | "labelAbbreviations"
>;

export function BoroughMap(props: BoroughMapProps) {
  const topoJsonPath =
    getTopoJsonPath(DEFAULT_JURISDICTION, "BOROUGH") ??
    "/geo/nyc-boroughs.topojson";
  const objectName =
    getObjectName(DEFAULT_JURISDICTION, "BOROUGH") ?? "boroughs";

  return (
    <ChoroplethMap
      topoJsonPath={topoJsonPath}
      objectName={objectName}
      featureKeyProp="GEOID"
      featureLabelProp="NAME"
      showLabels
      labelAbbreviations={BOROUGH_ABBREVIATIONS}
      width={600}
      height={500}
      {...props}
    />
  );
}

"use client";

import { useMemo } from "react";
import { ChoroplethMap } from "./ChoroplethMap";
import type { ColorStop } from "@/lib/colorScales";
import {
  DEFAULT_JURISDICTION,
  getTopoJsonPath,
  getObjectName,
} from "@/lib/geography/jurisdictions";
import { tractNTACrosswalk } from "@/lib/geography/crosswalks";

interface CensusTractMapProps {
  /** Optional county FIPS to filter tracts (keeps SVG feature count manageable) */
  countyFips?: string;
  /** GEOID → numeric metric value */
  data: Record<string, number>;
  colorScale: ColorStop[];
  legendTitle?: string;
  tooltipContent?: (
    key: string,
    label: string,
    value: number | undefined,
  ) => React.ReactNode;
  onFeatureClick?: (key: string) => void;
  width?: number;
  height?: number;
}

export function CensusTractMap({
  countyFips,
  data,
  colorScale,
  legendTitle,
  tooltipContent,
  onFeatureClick,
  width,
  height,
}: CensusTractMapProps) {
  const topoJsonPath = getTopoJsonPath(DEFAULT_JURISDICTION, "CENSUS_TRACT");
  const objectName = getObjectName(DEFAULT_JURISDICTION, "CENSUS_TRACT");

  // If filtering by county, build a set of GEOIDs in that county
  const filteredData = useMemo(() => {
    if (!countyFips) return data;
    const tractGeoids = new Set(
      tractNTACrosswalk
        .filter((t) => t.countyFips === countyFips)
        .map((t) => t.geoid),
    );
    const filtered: Record<string, number> = {};
    for (const [geoid, value] of Object.entries(data)) {
      if (tractGeoids.has(geoid)) {
        filtered[geoid] = value;
      }
    }
    return filtered;
  }, [countyFips, data]);

  if (!topoJsonPath || !objectName) {
    return (
      <div className="text-sm text-fm-sage">
        Census tract map not configured for this jurisdiction.
      </div>
    );
  }

  return (
    <ChoroplethMap
      topoJsonPath={topoJsonPath}
      objectName={objectName}
      featureKeyProp="GEOID"
      featureLabelProp="NAME"
      data={filteredData}
      colorScale={colorScale}
      legendTitle={legendTitle}
      tooltipContent={tooltipContent}
      onFeatureClick={onFeatureClick}
      width={width}
      height={height}
    />
  );
}

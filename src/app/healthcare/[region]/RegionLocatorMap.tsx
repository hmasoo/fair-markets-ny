"use client";

import { useMemo } from "react";
import { geoPath, geoMercator } from "d3-geo";
import { useTopoJson } from "@/lib/useTopoJson";

import crosswalkRaw from "../../../../data/crosswalks/healthcare-region-counties.json";

interface Props {
  regionSlug: string;
  name: string;
}

const WIDTH = 280;
const HEIGHT = 280;

export function RegionLocatorMap({ regionSlug, name }: Props) {
  const geoData = useTopoJson("/geo/nys-counties.topojson", "counties");

  const regionFips = useMemo(() => {
    const set = new Set<string>();
    for (const entry of crosswalkRaw) {
      if (entry.regionSlug === regionSlug) set.add(entry.fips);
    }
    return set;
  }, [regionSlug]);

  const { pathGenerator, features } = useMemo(() => {
    if (!geoData) return { pathGenerator: null, features: [] };
    const projection = geoMercator().fitSize(
      [WIDTH - 16, HEIGHT - 16],
      geoData
    );
    projection.translate([
      (projection.translate()[0] ?? 0) + 8,
      (projection.translate()[1] ?? 0) + 8,
    ]);
    return {
      pathGenerator: geoPath(projection),
      features: geoData.features,
    };
  }, [geoData]);

  if (!pathGenerator || features.length === 0) {
    return <div className="w-[280px] h-[280px] bg-gray-50 rounded-lg animate-pulse" />;
  }

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Map showing ${name} counties highlighted within New York State`}
      className="shrink-0"
    >
      {features.map((f) => {
        const geoid = f.properties?.GEOID as string;
        const isHighlighted = regionFips.has(geoid);
        return (
          <path
            key={geoid}
            d={pathGenerator(f) || ""}
            fill={isHighlighted ? "#2B7A65" : "#e8edeb"}
            stroke={isHighlighted ? "#1B3B36" : "#d1d9d5"}
            strokeWidth={isHighlighted ? 1.5 : 0.5}
          />
        );
      })}
    </svg>
  );
}

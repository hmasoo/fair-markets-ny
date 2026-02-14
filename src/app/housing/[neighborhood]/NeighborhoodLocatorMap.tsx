"use client";

import { useMemo } from "react";
import { geoPath, geoMercator } from "d3-geo";
import { useTopoJson } from "@/lib/useTopoJson";

interface Props {
  /** NTA codes belonging to this neighborhood */
  ntaCodes: string[];
  /** Neighborhood name for accessible label */
  name: string;
}

const WIDTH = 240;
const HEIGHT = 280;

export function NeighborhoodLocatorMap({ ntaCodes, name }: Props) {
  const geoData = useTopoJson("/geo/nyc-ntas.topojson", "ntas");

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
    return <div className="w-[240px] h-[280px] bg-gray-50 rounded-lg animate-pulse" />;
  }

  const ntaSet = new Set(ntaCodes);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Map showing ${name} highlighted within New York City`}
      className="shrink-0"
    >
      {features.map((f) => {
        const code = f.properties?.GEOID as string;
        const isHighlighted = ntaSet.has(code);
        return (
          <path
            key={code}
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

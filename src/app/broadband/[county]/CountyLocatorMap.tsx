"use client";

import { useMemo } from "react";
import { geoPath, geoMercator } from "d3-geo";
import { useTopoJson } from "@/lib/useTopoJson";

interface Props {
  /** 5-digit county FIPS to highlight */
  fips: string;
  /** County name for accessible label */
  name: string;
}

const WIDTH = 200;
const HEIGHT = 280;

export function CountyLocatorMap({ fips, name }: Props) {
  const geoData = useTopoJson("/geo/nys-counties.topojson", "counties");

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
    return <div className="w-[200px] h-[280px] bg-gray-50 rounded-lg animate-pulse" />;
  }

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Map showing ${name} highlighted within New York State`}
      className="shrink-0"
    >
      {features.map((f) => {
        const code = f.properties?.GEOID as string;
        const isHighlighted = code === fips;
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

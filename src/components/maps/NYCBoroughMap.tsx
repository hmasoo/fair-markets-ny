"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { geoPath, geoMercator } from "d3-geo";
import type { FeatureCollection } from "geojson";

interface BoroughHHI {
  borough: string;
  hhi: number;
  totalUnits: number;
  neighborhoodCount: number;
}

interface NYCBoroughMapProps {
  boroughData: BoroughHHI[];
}

// Colorblind-safe sequential scale (light blue → dark blue)
function hhiColor(hhi: number): string {
  if (hhi <= 0) return "#e5e7eb";
  if (hhi < 400) return "#c6dbef";
  if (hhi < 600) return "#9ecae1";
  if (hhi < 800) return "#6baed6";
  if (hhi < 1000) return "#3182bd";
  if (hhi < 1500) return "#08519c";
  return "#08306b";
}

export function NYCBoroughMap({ boroughData }: NYCBoroughMapProps) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);

  useEffect(() => {
    fetch("/geo/nyc-boroughs.json")
      .then((r) => r.json())
      .then(setGeoData);
  }, []);

  const hhiByBorough = useMemo(() => {
    const map: Record<string, BoroughHHI> = {};
    for (const b of boroughData) {
      map[b.borough] = b;
    }
    return map;
  }, [boroughData]);

  const width = 600;
  const height = 500;

  const { pathGenerator, features } = useMemo(() => {
    if (!geoData) return { pathGenerator: null, features: [] };
    const projection = geoMercator().fitSize(
      [width - 40, height - 40],
      geoData
    );
    projection.translate([
      (projection.translate()[0] ?? 0) + 20,
      (projection.translate()[1] ?? 0) + 20,
    ]);
    return {
      pathGenerator: geoPath().projection(projection),
      features: geoData.features,
    };
  }, [geoData]);

  const handleMouseEnter = useCallback(
    (name: string) => setHoveredBorough(name),
    []
  );
  const handleMouseLeave = useCallback(() => setHoveredBorough(null), []);

  if (!geoData || !pathGenerator) {
    return (
      <div className="h-[500px] flex items-center justify-center text-fm-sage text-sm">
        Loading map...
      </div>
    );
  }

  const hoveredData = hoveredBorough ? hhiByBorough[hoveredBorough] : null;

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Housing Concentration by Borough
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        Aggregated HHI across sampled neighborhoods. Darker colors indicate
        higher ownership concentration.
      </p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {features.map((feature) => {
              const name = feature.properties?.BoroName as string;
              const data = hhiByBorough[name];
              const fill = data ? hhiColor(data.hhi) : "#e5e7eb";
              const isHovered = hoveredBorough === name;
              return (
                <g key={name}>
                  <path
                    d={pathGenerator(feature) ?? ""}
                    fill={fill}
                    stroke={isHovered ? "#1B3B36" : "#fff"}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    opacity={
                      hoveredBorough && !isHovered && data ? 0.6 : 1
                    }
                    onMouseEnter={() => handleMouseEnter(name)}
                    onMouseLeave={handleMouseLeave}
                    className="transition-opacity cursor-pointer"
                  />
                  {pathGenerator.centroid(feature) && (
                    <text
                      x={pathGenerator.centroid(feature)[0]}
                      y={pathGenerator.centroid(feature)[1]}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight={600}
                      fill="#1B3B36"
                      pointerEvents="none"
                    >
                      {name === "Staten Island" ? "S.I." : name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="lg:w-56 space-y-3">
          {hoveredData ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-bold text-fm-patina">
                {hoveredBorough}
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div>
                  HHI:{" "}
                  <strong>{hoveredData.hhi.toLocaleString()}</strong>
                </div>
                <div>
                  Units:{" "}
                  <strong>
                    {hoveredData.totalUnits.toLocaleString()}
                  </strong>
                </div>
                <div>
                  Neighborhoods:{" "}
                  <strong>{hoveredData.neighborhoodCount}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-fm-sage">
              Hover over a borough to see details
            </div>
          )}
          {/* Legend */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-semibold text-fm-sage uppercase mb-2">
              HHI Scale
            </div>
            <div className="space-y-1">
              {[
                { color: "#c6dbef", label: "< 400 Competitive" },
                { color: "#9ecae1", label: "400–600" },
                { color: "#6baed6", label: "600–800" },
                { color: "#3182bd", label: "800–1,000" },
                { color: "#08519c", label: "1,000–1,500" },
                { color: "#08306b", label: "> 1,500 Concentrated" },
                { color: "#e5e7eb", label: "No data" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="w-4 h-3 rounded-sm inline-block border border-gray-200"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-fm-sage">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

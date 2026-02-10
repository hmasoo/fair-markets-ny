"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { geoPath, geoMercator } from "d3-geo";
import type { FeatureCollection } from "geojson";

interface CountyData {
  name: string;
  slug: string;
  fips: string;
  hhi: number;
  cr4: number;
  totalHouseholds: number;
  providersAt100Mbps: number;
  zeroPctBlocks: number;
  onePctBlocks: number;
}

interface NYSCountyMapProps {
  countyData: CountyData[];
  metric?: "hhi" | "providers" | "zeroPct";
}

// Colorblind-safe sequential scale (light purple → dark purple)
function broadbandColor(hhi: number): string {
  if (hhi <= 0) return "#f3f4f6";
  if (hhi < 3000) return "#dadaeb";
  if (hhi < 3500) return "#bcbddc";
  if (hhi < 4000) return "#9e9ac8";
  if (hhi < 5000) return "#807dba";
  if (hhi < 6000) return "#6a51a3";
  return "#3f007d";
}

// Colorblind-safe sequential scale (light → dark blue-orange)
function providersColor(count: number): string {
  if (count >= 4) return "#56B4E9";
  if (count >= 3) return "#9ecae1";
  if (count >= 2) return "#E69F00";
  if (count >= 1) return "#D55E00";
  return "#7f2704";
}

export function NYSCountyMap({
  countyData,
  metric = "hhi",
}: NYSCountyMapProps) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);

  useEffect(() => {
    fetch("/geo/nys-counties.json")
      .then((r) => r.json())
      .then(setGeoData);
  }, []);

  const dataByFips = useMemo(() => {
    const map: Record<string, CountyData> = {};
    for (const c of countyData) {
      map[c.fips] = c;
    }
    return map;
  }, [countyData]);

  const width = 700;
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
    (fips: string) => setHoveredCounty(fips),
    []
  );
  const handleMouseLeave = useCallback(() => setHoveredCounty(null), []);

  if (!geoData || !pathGenerator) {
    return (
      <div className="h-[500px] flex items-center justify-center text-fm-sage text-sm">
        Loading map...
      </div>
    );
  }

  const hoveredData = hoveredCounty ? dataByFips[hoveredCounty] : null;
  const hoveredFeatureName = hoveredCounty
    ? geoData.features.find(
        (f) =>
          (f.properties?.geoid as string)?.replace("05000US", "") ===
          hoveredCounty
      )?.properties?.name
    : null;

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Broadband Concentration Across NYS
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        Counties with data are colored by HHI. Higher concentration means fewer
        ISP choices for residents.
      </p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {features.map((feature) => {
              const geoid = feature.properties?.geoid as string;
              const fips = geoid?.replace("05000US", "") ?? "";
              const countyName = feature.properties?.name as string;
              const data = dataByFips[fips];
              const isHovered = hoveredCounty === fips;

              let fill = "#f3f4f6"; // default gray for no data
              if (data) {
                fill =
                  metric === "providers"
                    ? providersColor(data.providersAt100Mbps)
                    : broadbandColor(data.hhi);
              }

              return (
                <path
                  key={geoid}
                  d={pathGenerator(feature) ?? ""}
                  fill={fill}
                  stroke={isHovered && data ? "#1B3B36" : "#d1d5db"}
                  strokeWidth={isHovered && data ? 2 : 0.5}
                  opacity={hoveredCounty && !isHovered && data ? 0.7 : 1}
                  onMouseEnter={() => handleMouseEnter(fips)}
                  onMouseLeave={handleMouseLeave}
                  className="transition-opacity cursor-pointer"
                >
                  <title>{countyName}</title>
                </path>
              );
            })}
          </svg>
        </div>
        <div className="lg:w-64 space-y-3">
          {hoveredData ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-bold text-fm-patina">
                {hoveredData.name}
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div>
                  HHI:{" "}
                  <strong>{hoveredData.hhi.toLocaleString()}</strong>
                </div>
                <div>
                  CR4: <strong>{hoveredData.cr4}%</strong>
                </div>
                <div>
                  Providers (100+ Mbps):{" "}
                  <strong>{hoveredData.providersAt100Mbps}</strong>
                </div>
                <div>
                  Households:{" "}
                  <strong>
                    {hoveredData.totalHouseholds.toLocaleString()}
                  </strong>
                </div>
                <div>
                  Zero-provider blocks:{" "}
                  <strong>{hoveredData.zeroPctBlocks}%</strong>
                </div>
              </div>
            </div>
          ) : hoveredFeatureName ? (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-fm-sage">
              <div className="font-medium text-fm-patina">
                {hoveredFeatureName}
              </div>
              <div className="mt-1">No detailed data yet</div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-fm-sage">
              Hover over a county to see details
            </div>
          )}
          {/* Legend */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-semibold text-fm-sage uppercase mb-2">
              {metric === "hhi" ? "HHI Scale" : "Providers at 100+ Mbps"}
            </div>
            {metric === "hhi" ? (
              <div className="space-y-1">
                {[
                  { color: "#dadaeb", label: "< 3,000 (Less concentrated)" },
                  { color: "#bcbddc", label: "3,000–3,500" },
                  { color: "#9e9ac8", label: "3,500–4,000" },
                  { color: "#807dba", label: "4,000–5,000" },
                  { color: "#6a51a3", label: "5,000–6,000" },
                  { color: "#3f007d", label: "> 6,000 (Near monopoly)" },
                  { color: "#f3f4f6", label: "No data" },
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
            ) : (
              <div className="space-y-1">
                {[
                  { color: "#56B4E9", label: "4+ providers" },
                  { color: "#9ecae1", label: "3 providers" },
                  { color: "#E69F00", label: "2 providers" },
                  { color: "#D55E00", label: "1 provider" },
                  { color: "#7f2704", label: "0 providers" },
                  { color: "#f3f4f6", label: "No data" },
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

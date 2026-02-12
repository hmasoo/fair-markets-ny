"use client";

import { useMemo, useCallback, useState } from "react";
import { geoPath, geoMercator } from "d3-geo";
import { useTopoJson } from "@/lib/useTopoJson";
import { type ColorStop, getColor, getLegendItems } from "@/lib/colorScales";

export interface ChoroplethMapProps {
  /** Path to TopoJSON file in /public */
  topoJsonPath: string;
  /** Object name inside the TopoJSON topology */
  objectName: string;
  /** Which feature property to join data on (e.g. "GEOID") */
  featureKeyProp: string;
  /** Which feature property to use for display labels */
  featureLabelProp: string;
  /** Data keyed by the join property value → numeric metric */
  data: Record<string, number>;
  /** Threshold-based color scale */
  colorScale: ColorStop[];
  /** Title for the legend */
  legendTitle?: string;
  /** Custom tooltip renderer; receives the feature key, label, and data value */
  tooltipContent?: (key: string, label: string, value: number | undefined) => React.ReactNode;
  /** Called when a feature is clicked */
  onFeatureClick?: (key: string) => void;
  /** SVG viewBox dimensions */
  width?: number;
  height?: number;
  /** Abbreviation map for label text on small features */
  labelAbbreviations?: Record<string, string>;
  /** Whether to show labels on features */
  showLabels?: boolean;
}

export function ChoroplethMap({
  topoJsonPath,
  objectName,
  featureKeyProp,
  featureLabelProp,
  data,
  colorScale,
  legendTitle = "Scale",
  tooltipContent,
  onFeatureClick,
  width = 700,
  height = 500,
  labelAbbreviations,
  showLabels = false,
}: ChoroplethMapProps) {
  const geoData = useTopoJson(topoJsonPath, objectName);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

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
  }, [geoData, width, height]);

  const handleMouseEnter = useCallback(
    (key: string) => setHoveredKey(key),
    []
  );
  const handleMouseLeave = useCallback(() => setHoveredKey(null), []);

  if (!geoData || !pathGenerator) {
    return (
      <div
        className="flex items-center justify-center text-fm-sage text-sm"
        style={{ height }}
      >
        Loading map...
      </div>
    );
  }

  const hoveredLabel = hoveredKey
    ? features.find((f) => f.properties?.[featureKeyProp] === hoveredKey)
        ?.properties?.[featureLabelProp] as string | undefined
    : undefined;
  const hoveredValue = hoveredKey ? data[hoveredKey] : undefined;

  const legendItems = getLegendItems(colorScale);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {features.map((feature) => {
            const key = feature.properties?.[featureKeyProp] as string;
            const label = feature.properties?.[featureLabelProp] as string;
            const value = data[key];
            const fill = getColor(value, colorScale);
            const isHovered = hoveredKey === key;
            const hasData = value !== undefined;

            return (
              <g key={key}>
                <path
                  d={pathGenerator(feature) ?? ""}
                  fill={fill}
                  stroke={isHovered && hasData ? "#1B3B36" : hasData ? "#fff" : "#d1d5db"}
                  strokeWidth={isHovered && hasData ? 2.5 : hasData ? 1.5 : 0.5}
                  opacity={hoveredKey && !isHovered && hasData ? 0.6 : 1}
                  onMouseEnter={() => handleMouseEnter(key)}
                  onMouseLeave={handleMouseLeave}
                  onClick={
                    onFeatureClick ? () => onFeatureClick(key) : undefined
                  }
                  className={`transition-opacity ${onFeatureClick || hasData ? "cursor-pointer" : ""}`}
                />
                {showLabels && pathGenerator.centroid(feature) && (
                  <text
                    x={pathGenerator.centroid(feature)[0]}
                    y={pathGenerator.centroid(feature)[1]}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="#1B3B36"
                    pointerEvents="none"
                  >
                    {labelAbbreviations?.[label] ?? label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="lg:w-64 space-y-3">
        {hoveredKey && hoveredLabel ? (
          <div className="p-3 bg-gray-50 rounded-lg">
            {tooltipContent ? (
              tooltipContent(hoveredKey, hoveredLabel, hoveredValue)
            ) : (
              <>
                <div className="font-bold text-fm-patina">{hoveredLabel}</div>
                {hoveredValue !== undefined ? (
                  <div className="mt-2 text-sm">
                    Value: <strong>{hoveredValue.toLocaleString()}</strong>
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-fm-sage">
                    No detailed data yet
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-fm-sage">
            Hover over the map to see details
          </div>
        )}
        {/* Legend */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-semibold text-fm-sage uppercase mb-2">
            {legendTitle}
          </div>
          <div className="space-y-1">
            {legendItems.map((item) => (
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
  );
}

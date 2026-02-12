"use client";

import { useState } from "react";
import { ConcentrationTimeSeries } from "@/components/charts/ConcentrationTimeSeries";
import { MarketShareChart } from "@/components/charts/MarketShareChart";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { getHHIColor } from "@/lib/colorScales";
import {
  linearScale,
  bandScale,
  niceLinearTicks,
  roundedRightRect,
} from "@/lib/chart-utils";

interface Region {
  name: string;
  slug: string;
  totalBeds: number;
  totalFacilities: number;
  hhi: number;
  cr4: number;
  topSystems: { name: string; beds: number; facilities: number; share: number }[];
}

interface YearData {
  year: number;
  hhi: number;
  cr4: number;
}

interface MarketShareEntry {
  company: string;
  share: number;
  source: string;
}

export function RegionalConcentrationChart({
  regions,
}: {
  regions: Region[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sorted = [...regions].sort((a, b) => b.hhi - a.hhi);
  const chartHeight = sorted.length * 56 + 40;
  const margin = { top: 10, right: 30, bottom: 30, left: 160 };

  // X domain from data
  const maxHHI = Math.max(...sorted.map((r) => r.hhi));
  const xTicks = niceLinearTicks(0, maxHHI * 1.1, 6);
  const xDomain: [number, number] = [0, xTicks[xTicks.length - 1]];

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Hospital Concentration by Region
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        HHI measures how concentrated hospital beds are among health systems.
        Higher values mean fewer systems control more beds.
      </p>
      <ChartContainer height={chartHeight} margin={margin}>
        {({ svgWidth, svgHeight, width, height, margin: m }) => {
          const xScale = linearScale(xDomain, [0, width]);
          const { scale: yScale, bandwidth } = bandScale(
            sorted.map((r) => r.name),
            [0, height],
            0.3,
          );

          return (
            <>
              <svg width={svgWidth} height={svgHeight}>
                <g transform={`translate(${m.left},${m.top})`}>
                  {/* Vertical grid lines */}
                  {xTicks.map((tick) => (
                    <line
                      key={tick}
                      x1={xScale(tick)}
                      y1={0}
                      x2={xScale(tick)}
                      y2={height}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                  ))}

                  {/* Reference lines */}
                  {xDomain[1] >= 1500 && (
                    <>
                      <line
                        x1={xScale(1500)}
                        y1={0}
                        x2={xScale(1500)}
                        y2={height}
                        stroke="#E69F00"
                        strokeDasharray="5 5"
                      />
                      <text
                        x={xScale(1500)}
                        y={-4}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#E69F00"
                      >
                        Moderate
                      </text>
                    </>
                  )}
                  {xDomain[1] >= 2500 && (
                    <>
                      <line
                        x1={xScale(2500)}
                        y1={0}
                        x2={xScale(2500)}
                        y2={height}
                        stroke="#D55E00"
                        strokeDasharray="5 5"
                      />
                      <text
                        x={xScale(2500)}
                        y={-4}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#D55E00"
                      >
                        Highly Concentrated
                      </text>
                    </>
                  )}

                  {/* Bars */}
                  {sorted.map((r, i) => (
                    <path
                      key={i}
                      d={roundedRightRect(
                        0,
                        yScale(i),
                        xScale(r.hhi),
                        bandwidth,
                        4,
                      )}
                      fill={getHHIColor(r.hhi)}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}

                  {/* X-axis */}
                  <line
                    x1={0}
                    y1={height}
                    x2={width}
                    y2={height}
                    stroke="#cbd5e1"
                  />
                  {xTicks.map((tick) => (
                    <text
                      key={tick}
                      x={xScale(tick)}
                      y={height + 18}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#64748b"
                    >
                      {tick.toLocaleString()}
                    </text>
                  ))}

                  {/* Y-axis labels */}
                  {sorted.map((r, i) => (
                    <text
                      key={i}
                      x={-8}
                      y={yScale(i) + bandwidth / 2}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={13}
                      fill="#64748b"
                    >
                      {r.name}
                    </text>
                  ))}
                </g>
              </svg>

              {/* Tooltip */}
              {hoveredIndex !== null && sorted[hoveredIndex] && (() => {
                const d = sorted[hoveredIndex];
                return (
                  <ChartTooltip
                    x={m.left + xScale(d.hhi)}
                    y={m.top + yScale(hoveredIndex) + bandwidth / 2}
                  >
                    <div className="font-bold text-fm-patina">{d.name}</div>
                    <div className="space-y-1 mt-1">
                      <div>HHI: <strong>{d.hhi.toLocaleString()}</strong></div>
                      <div>CR4: <strong>{d.cr4}%</strong></div>
                      <div>Beds: <strong>{d.totalBeds.toLocaleString()}</strong></div>
                      <div>Facilities: <strong>{d.totalFacilities}</strong></div>
                      <div className="text-xs text-fm-sage mt-1">
                        Top system: {d.topSystems[0]?.name} ({d.topSystems[0]?.share}%)
                      </div>
                    </div>
                  </ChartTooltip>
                );
              })()}
            </>
          );
        }}
      </ChartContainer>
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-fm-sage">
        {[
          { color: "#009E73", label: "Competitive (< 1,500)" },
          { color: "#E69F00", label: "Moderate (1,500\u20132,500)" },
          { color: "#D55E00", label: "Highly Concentrated (> 2,500)" },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StatewideCharts({
  timeSeriesData,
  marketShareData,
  marketShareYear,
}: {
  timeSeriesData: YearData[];
  marketShareData: MarketShareEntry[];
  marketShareYear: number;
}) {
  const [tab, setTab] = useState<"trend" | "topSystems">("trend");

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-fm-patina">
            Statewide Trend
          </h2>
          <p className="text-sm text-fm-sage">
            NYS hospital market — moderate overall, rising steadily
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab("trend")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "trend"
                ? "bg-white text-fm-patina shadow-sm"
                : "text-fm-sage hover:text-fm-patina"
            }`}
          >
            HHI Over Time
          </button>
          <button
            onClick={() => setTab("topSystems")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "topSystems"
                ? "bg-white text-fm-patina shadow-sm"
                : "text-fm-sage hover:text-fm-patina"
            }`}
          >
            Top Health Systems
          </button>
        </div>
      </div>
      <div key={tab}>
        {tab === "trend" ? (
          <ConcentrationTimeSeries data={timeSeriesData} metric="hhi" />
        ) : (
          <MarketShareChart
            data={marketShareData}
            title="Largest Health Systems by Bed Share"
            year={marketShareYear}
          />
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-fm-sage">
        <p>
          Source: NYS DOH SPARCS hospital discharge data; AHA Annual Survey;
          NYS CON filings. Statewide HHI is moderate because NYC{"'"}s large,
          multi-system market dilutes the overall figure. Regional markets tell
          the real story.
        </p>
      </div>
    </div>
  );
}

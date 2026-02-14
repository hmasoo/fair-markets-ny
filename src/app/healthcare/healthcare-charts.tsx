"use client";

import { useState } from "react";
import { ConcentrationTimeSeries } from "@/components/charts/ConcentrationTimeSeries";
import { MarketShareChart } from "@/components/charts/MarketShareChart";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
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

function getDominanceColor(share: number): string {
  if (share >= 50) return "#D55E00";
  if (share >= 30) return "#E69F00";
  return "#009E73";
}

export function RegionalConcentrationChart({
  regions,
}: {
  regions: Region[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // Sort by dominant system share
  const sorted = [...regions].sort(
    (a, b) => (b.topSystems[0]?.share ?? 0) - (a.topSystems[0]?.share ?? 0),
  );
  const chartHeight = sorted.length * 56 + 40;
  const margin = { top: 10, right: 30, bottom: 30, left: 160 };

  // X domain: dominant system share (0–100%)
  const maxShare = Math.max(...sorted.map((r) => r.topSystems[0]?.share ?? 0));
  const xTicks = niceLinearTicks(0, Math.min(maxShare * 1.1, 100), 6);
  const xDomain: [number, number] = [0, xTicks[xTicks.length - 1]];

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        How dominant is the largest system?
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        Share of hospital beds controlled by the single largest health system
        in each region. When one system holds a majority of beds, patients
        have fewer alternatives.
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

                  {/* Reference line at 50% */}
                  {xDomain[1] >= 50 && (
                    <>
                      <line
                        x1={xScale(50)}
                        y1={0}
                        x2={xScale(50)}
                        y2={height}
                        stroke="#D55E00"
                        strokeDasharray="5 5"
                      />
                      <text
                        x={xScale(50)}
                        y={-4}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#D55E00"
                      >
                        Majority control
                      </text>
                    </>
                  )}

                  {/* Bars */}
                  {sorted.map((r, i) => {
                    const share = r.topSystems[0]?.share ?? 0;
                    return (
                      <path
                        key={i}
                        d={roundedRightRect(
                          0,
                          yScale(i),
                          xScale(share),
                          bandwidth,
                          4,
                        )}
                        fill={getDominanceColor(share)}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{ cursor: "pointer" }}
                      />
                    );
                  })}

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
                      {tick}%
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
                const topSystem = d.topSystems[0];
                return (
                  <ChartTooltip
                    x={m.left + xScale(topSystem?.share ?? 0)}
                    y={m.top + yScale(hoveredIndex) + bandwidth / 2}
                  >
                    <div className="font-bold text-fm-patina">{d.name}</div>
                    <div className="space-y-1 mt-1">
                      <div>Largest system: <strong>{topSystem?.name}</strong></div>
                      <div>Their share: <strong>{topSystem?.share}%</strong> of beds</div>
                      <div>Total beds: <strong>{d.totalBeds.toLocaleString()}</strong></div>
                      <div>Facilities: <strong>{d.totalFacilities}</strong></div>
                      <div className="text-fm-sage text-xs pt-1 border-t border-gray-100">
                        Top 4 systems: {d.cr4}% of beds
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
          { color: "#D55E00", label: "\u226550% Majority control" },
          { color: "#E69F00", label: "30\u201350% Dominant" },
          { color: "#009E73", label: "<30% Competitive" },
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
            Statewide consolidation trend
          </h2>
          <p className="text-sm text-fm-sage">
            How hospital system concentration has changed across New York
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
            Concentration Trend
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

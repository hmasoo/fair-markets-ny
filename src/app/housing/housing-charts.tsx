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

interface Neighborhood {
  name: string;
  slug: string;
  borough: string;
  totalUnits: number;
  hhi: number;
  cr4: number;
  hpdViolationsPerUnit: number;
  medianRent: number;
  medianIncome?: number | null;
  rentBurdenPct?: number | null;
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

// Okabe-Ito colorblind-safe palette for categorical borough data
const BOROUGH_COLORS: Record<string, string> = {
  Manhattan: "#E69F00",
  Brooklyn: "#56B4E9",
  Bronx: "#0072B2",
  Queens: "#CC79A7",
  "Staten Island": "#009E73",
};

export function NeighborhoodConcentrationChart({
  neighborhoods,
}: {
  neighborhoods: Neighborhood[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sorted = [...neighborhoods].sort((a, b) => b.hhi - a.hhi);
  const chartHeight = sorted.length * 56 + 40;
  const margin = { top: 10, right: 30, bottom: 30, left: 200 };

  // X domain from data
  const maxHHI = Math.max(...sorted.map((n) => n.hhi));
  const xTicks = niceLinearTicks(0, maxHHI * 1.1, 6);
  const xDomain: [number, number] = [0, xTicks[xTicks.length - 1]];

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Landlord Concentration by Neighborhood
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        HHI measures ownership concentration. Higher values mean fewer landlords
        control more units.
      </p>
      <ChartContainer height={chartHeight} margin={margin}>
        {({ svgWidth, svgHeight, width, height, margin: m }) => {
          const xScale = linearScale(xDomain, [0, width]);
          const { scale: yScale, bandwidth } = bandScale(
            sorted.map((n) => n.name),
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

                  {/* Reference line at 1500 */}
                  {xDomain[1] >= 1500 && (
                    <>
                      <line
                        x1={xScale(1500)}
                        y1={0}
                        x2={xScale(1500)}
                        y2={height}
                        stroke="#D55E00"
                        strokeDasharray="5 5"
                      />
                      <text
                        x={xScale(1500)}
                        y={-4}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#D55E00"
                      >
                        Moderate
                      </text>
                    </>
                  )}

                  {/* Bars */}
                  {sorted.map((n, i) => (
                    <path
                      key={i}
                      d={roundedRightRect(
                        0,
                        yScale(i),
                        xScale(n.hhi),
                        bandwidth,
                        4,
                      )}
                      fill={getHHIColor(n.hhi)}
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
                  {sorted.map((n, i) => (
                    <text
                      key={i}
                      x={-8}
                      y={yScale(i) + bandwidth / 2}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={13}
                      fill="#64748b"
                    >
                      {n.name}
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
                    <div className="text-fm-sage text-xs mb-2">{d.borough}</div>
                    <div className="space-y-1">
                      <div>HHI: <strong>{d.hhi.toLocaleString()}</strong></div>
                      <div>CR4: <strong>{d.cr4}%</strong> (top 4 landlords)</div>
                      <div>Units: <strong>{d.totalUnits.toLocaleString()}</strong></div>
                      {d.hpdViolationsPerUnit > 0 && (
                        <div>HPD violations/unit: <strong>{d.hpdViolationsPerUnit}</strong></div>
                      )}
                      {d.medianRent > 0 && (
                        <div>Median rent: <strong>${d.medianRent.toLocaleString()}</strong></div>
                      )}
                      {d.medianIncome && (
                        <div>MHI: <strong>${d.medianIncome.toLocaleString()}</strong></div>
                      )}
                      {d.rentBurdenPct && (
                        <div>Rent-burdened: <strong>{d.rentBurdenPct}%</strong></div>
                      )}
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
          { color: "#009E73", label: "Competitive (\u22641,500)" },
          { color: "#E69F00", label: "Moderate (1,500\u20132,500)" },
          { color: "#D55E00", label: "Highly Concentrated (>2,500)" },
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

export function ViolationsVsConcentrationChart({
  neighborhoods,
}: {
  neighborhoods: Neighborhood[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const margin = { top: 10, right: 20, bottom: 45, left: 65 };

  // Domains
  const hhiValues = neighborhoods.map((n) => n.hhi);
  const violValues = neighborhoods.map((n) => n.hpdViolationsPerUnit);
  const xTicks = niceLinearTicks(0, Math.max(...hhiValues) * 1.1, 6);
  const maxViol = Math.max(...violValues);
  const yTicks = niceLinearTicks(0, maxViol > 0 ? maxViol * 1.1 : 1, 6);
  const xDomain: [number, number] = [xTicks[0], xTicks[xTicks.length - 1]];
  const yDomain: [number, number] = [yTicks[0], yTicks[yTicks.length - 1]];

  // Bubble radius scale (sqrt so area is proportional)
  const unitValues = neighborhoods.map((n) => n.totalUnits);
  const minUnits = Math.min(...unitValues);
  const maxUnits = Math.max(...unitValues);
  const radiusScale = (units: number) => {
    if (maxUnits === minUnits) return 10;
    const t =
      (Math.sqrt(units) - Math.sqrt(minUnits)) /
      (Math.sqrt(maxUnits) - Math.sqrt(minUnits));
    return 6 + t * 12;
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Concentration vs. Housing Violations
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        Do more concentrated neighborhoods have worse housing conditions? Bubble
        size shows total rental units.
      </p>
      <ChartContainer height={350} margin={margin}>
        {({ svgWidth, svgHeight, width, height, margin: m }) => {
          const xScale = linearScale(xDomain, [0, width]);
          const yScale = linearScale(yDomain, [height, 0]);

          return (
            <>
              <svg width={svgWidth} height={svgHeight}>
                <g transform={`translate(${m.left},${m.top})`}>
                  {/* Grid */}
                  {yTicks.map((tick) => (
                    <line
                      key={`gy-${tick}`}
                      x1={0}
                      y1={yScale(tick)}
                      x2={width}
                      y2={yScale(tick)}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                  ))}
                  {xTicks.map((tick) => (
                    <line
                      key={`gx-${tick}`}
                      x1={xScale(tick)}
                      y1={0}
                      x2={xScale(tick)}
                      y2={height}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                  ))}

                  {/* Data points */}
                  {neighborhoods.map((n, i) => (
                    <circle
                      key={i}
                      cx={xScale(n.hhi)}
                      cy={yScale(n.hpdViolationsPerUnit)}
                      r={radiusScale(n.totalUnits)}
                      fill={BOROUGH_COLORS[n.borough] || "#6A8C7E"}
                      fillOpacity={0.8}
                      stroke={BOROUGH_COLORS[n.borough] || "#6A8C7E"}
                      strokeWidth={1}
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
                      y={height + 16}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#64748b"
                    >
                      {tick.toLocaleString()}
                    </text>
                  ))}
                  <text
                    x={width / 2}
                    y={height + 35}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#6A8C7E"
                  >
                    HHI (Ownership Concentration)
                  </text>

                  {/* Y-axis */}
                  <line x1={0} y1={0} x2={0} y2={height} stroke="#cbd5e1" />
                  {yTicks.map((tick) => (
                    <text
                      key={tick}
                      x={-8}
                      y={yScale(tick)}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={12}
                      fill="#64748b"
                    >
                      {tick}
                    </text>
                  ))}
                  <text
                    x={-50}
                    y={height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={12}
                    fill="#6A8C7E"
                    transform={`rotate(-90, -50, ${height / 2})`}
                  >
                    HPD Violations per Unit
                  </text>
                </g>
              </svg>

              {/* Tooltip */}
              {hoveredIndex !== null && neighborhoods[hoveredIndex] && (() => {
                const d = neighborhoods[hoveredIndex];
                return (
                  <ChartTooltip
                    x={m.left + xScale(d.hhi)}
                    y={m.top + yScale(d.hpdViolationsPerUnit)}
                  >
                    <div className="font-bold text-fm-patina">{d.name}</div>
                    <div className="text-fm-sage text-xs mb-2">{d.borough}</div>
                    <div className="space-y-1">
                      <div>HHI: <strong>{d.hhi.toLocaleString()}</strong></div>
                      {d.hpdViolationsPerUnit > 0 && (
                        <div>Violations/unit: <strong>{d.hpdViolationsPerUnit}</strong></div>
                      )}
                      <div>Units: <strong>{d.totalUnits.toLocaleString()}</strong></div>
                      {d.medianRent > 0 && (
                        <div>Median rent: <strong>${d.medianRent.toLocaleString()}</strong></div>
                      )}
                    </div>
                  </ChartTooltip>
                );
              })()}
            </>
          );
        }}
      </ChartContainer>
      <p className="mt-3 text-xs text-fm-sage italic">
        Note: High violations per unit can reflect extractive ownership{" "}
        <em>and</em> chronic underinvestment in buildings where regulated rents
        haven{"'"}t kept pace with operating costs — two problems that often
        coexist in the same building (
        <a
          href="https://niskanencenter.org/wp-content/uploads/2025/06/Armlovich-RGB-Testimony-June-2025.pdf"
          className="text-fm-teal hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Armlovich, RGB June 2025
        </a>
        ).
      </p>
    </div>
  );
}

export function ConcentrationVsIncomeChart({
  neighborhoods,
}: {
  neighborhoods: Neighborhood[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const data = neighborhoods.filter((n) => n.medianIncome && n.medianIncome > 0);

  if (data.length === 0) return null;

  const margin = { top: 10, right: 20, bottom: 45, left: 75 };

  // Domains
  const hhiValues = data.map((n) => n.hhi);
  const incomeValues = data.map((n) => n.medianIncome!);
  const xTicks = niceLinearTicks(0, Math.max(...hhiValues) * 1.1, 6);
  const yTicks = niceLinearTicks(
    Math.min(...incomeValues) * 0.9,
    Math.max(...incomeValues) * 1.1,
    6,
  );
  const xDomain: [number, number] = [xTicks[0], xTicks[xTicks.length - 1]];
  const yDomain: [number, number] = [yTicks[0], yTicks[yTicks.length - 1]];

  // Bubble radius scale
  const unitValues = data.map((n) => n.totalUnits);
  const minUnits = Math.min(...unitValues);
  const maxUnits = Math.max(...unitValues);
  const radiusScale = (units: number) => {
    if (maxUnits === minUnits) return 10;
    const t =
      (Math.sqrt(units) - Math.sqrt(minUnits)) /
      (Math.sqrt(maxUnits) - Math.sqrt(minUnits));
    return 6 + t * 12;
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Concentration vs. Household Income
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        Does landlord concentration correlate with lower incomes? Bubble size
        shows total rental units; color shows borough.
      </p>
      <ChartContainer height={350} margin={margin}>
        {({ svgWidth, svgHeight, width, height, margin: m }) => {
          const xScale = linearScale(xDomain, [0, width]);
          const yScale = linearScale(yDomain, [height, 0]);

          return (
            <>
              <svg width={svgWidth} height={svgHeight}>
                <g transform={`translate(${m.left},${m.top})`}>
                  {/* Grid */}
                  {yTicks.map((tick) => (
                    <line
                      key={`gy-${tick}`}
                      x1={0}
                      y1={yScale(tick)}
                      x2={width}
                      y2={yScale(tick)}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                  ))}
                  {xTicks.map((tick) => (
                    <line
                      key={`gx-${tick}`}
                      x1={xScale(tick)}
                      y1={0}
                      x2={xScale(tick)}
                      y2={height}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                  ))}

                  {/* Data points */}
                  {data.map((n, i) => (
                    <circle
                      key={i}
                      cx={xScale(n.hhi)}
                      cy={yScale(n.medianIncome!)}
                      r={radiusScale(n.totalUnits)}
                      fill={BOROUGH_COLORS[n.borough] || "#6A8C7E"}
                      fillOpacity={0.8}
                      stroke={BOROUGH_COLORS[n.borough] || "#6A8C7E"}
                      strokeWidth={1}
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
                      y={height + 16}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#64748b"
                    >
                      {tick.toLocaleString()}
                    </text>
                  ))}
                  <text
                    x={width / 2}
                    y={height + 35}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#6A8C7E"
                  >
                    HHI (Ownership Concentration)
                  </text>

                  {/* Y-axis */}
                  <line x1={0} y1={0} x2={0} y2={height} stroke="#cbd5e1" />
                  {yTicks.map((tick) => (
                    <text
                      key={tick}
                      x={-8}
                      y={yScale(tick)}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={12}
                      fill="#64748b"
                    >
                      ${(tick / 1000).toFixed(0)}k
                    </text>
                  ))}
                  <text
                    x={-58}
                    y={height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={12}
                    fill="#6A8C7E"
                    transform={`rotate(-90, -58, ${height / 2})`}
                  >
                    Median Household Income
                  </text>
                </g>
              </svg>

              {/* Tooltip */}
              {hoveredIndex !== null && data[hoveredIndex] && (() => {
                const d = data[hoveredIndex];
                return (
                  <ChartTooltip
                    x={m.left + xScale(d.hhi)}
                    y={m.top + yScale(d.medianIncome!)}
                  >
                    <div className="font-bold text-fm-patina">{d.name}</div>
                    <div className="text-fm-sage text-xs mb-2">{d.borough}</div>
                    <div className="space-y-1">
                      <div>HHI: <strong>{d.hhi.toLocaleString()}</strong></div>
                      <div>MHI: <strong>${d.medianIncome?.toLocaleString()}</strong></div>
                      {d.rentBurdenPct && (
                        <div>Rent-burdened: <strong>{d.rentBurdenPct}%</strong></div>
                      )}
                      <div>Units: <strong>{d.totalUnits.toLocaleString()}</strong></div>
                      {d.medianRent > 0 && (
                        <div>Median rent: <strong>${d.medianRent.toLocaleString()}</strong></div>
                      )}
                    </div>
                  </ChartTooltip>
                );
              })()}
            </>
          );
        }}
      </ChartContainer>
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-fm-sage">
        {Object.entries(BOROUGH_COLORS)
          .filter(([borough]) => data.some((n) => n.borough === borough))
          .map(([borough, color]) => (
            <span key={borough} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ backgroundColor: color }}
              />
              {borough}
            </span>
          ))}
      </div>
    </div>
  );
}

export function CitywideCharts({
  timeSeriesData,
  marketShareData,
  marketShareYear,
}: {
  timeSeriesData: YearData[];
  marketShareData: MarketShareEntry[];
  marketShareYear: number;
}) {
  const [tab, setTab] = useState<"trend" | "topLandlords">("trend");

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-fm-patina">
            Citywide Trend
          </h2>
          <p className="text-sm text-fm-sage">
            All NYC — low overall, but growing
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
            onClick={() => setTab("topLandlords")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "topLandlords"
                ? "bg-white text-fm-patina shadow-sm"
                : "text-fm-sage hover:text-fm-patina"
            }`}
          >
            Top Landlords
          </button>
        </div>
      </div>
      <div key={tab}>
        {tab === "trend" ? (
          <ConcentrationTimeSeries data={timeSeriesData} metric="hhi" />
        ) : (
          <MarketShareChart
            data={marketShareData}
            title="Largest Landlords by Unit Share"
            year={marketShareYear}
          />
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-fm-sage">
        <p>
          Source: NYC Rent Guidelines Board Annual Reports; ACRIS/PLUTO analysis.
          Citywide HHI is low because the market is fragmented across ~30,000
          landlords. Neighborhood-level concentration above tells the real story.
        </p>
      </div>
    </div>
  );
}

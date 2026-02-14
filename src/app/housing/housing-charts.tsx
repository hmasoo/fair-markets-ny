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
  nychaShare: number;
  stabilizedShare: number;
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

const BAR_CHART_LIMIT = 25;

function getRentBurdenColor(pct: number): string {
  if (pct >= 50) return "#D55E00";
  if (pct >= 40) return "#E69F00";
  return "#009E73";
}

export function NeighborhoodRentBurdenChart({
  neighborhoods,
}: {
  neighborhoods: Neighborhood[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const sorted = [...neighborhoods]
    .filter((n) => n.rentBurdenPct && n.rentBurdenPct > 0)
    .sort((a, b) => b.rentBurdenPct! - a.rentBurdenPct!);
  const visible = showAll ? sorted : sorted.slice(0, BAR_CHART_LIMIT);
  const hasMore = sorted.length > BAR_CHART_LIMIT;
  const chartHeight = visible.length * 56 + 40;
  const margin = { top: 10, right: 30, bottom: 30, left: 200 };

  // X domain from data
  const maxPct = Math.max(...sorted.map((n) => n.rentBurdenPct!));
  const xTicks = niceLinearTicks(0, Math.min(maxPct * 1.1, 100), 6);
  const xDomain: [number, number] = [0, xTicks[xTicks.length - 1]];

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Where is rent most burdensome?
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        Share of households spending 30% or more of their income on rent.
      </p>
      <ChartContainer height={chartHeight} margin={margin}>
        {({ svgWidth, svgHeight, width, height, margin: m }) => {
          const xScale = linearScale(xDomain, [0, width]);
          const { scale: yScale, bandwidth } = bandScale(
            visible.map((n) => n.name),
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

                  {/* Reference line at 50% — severely burdened */}
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
                        Severely Burdened
                      </text>
                    </>
                  )}

                  {/* Bars */}
                  {visible.map((n, i) => (
                    <path
                      key={i}
                      d={roundedRightRect(
                        0,
                        yScale(i),
                        xScale(n.rentBurdenPct!),
                        bandwidth,
                        4,
                      )}
                      fill={getRentBurdenColor(n.rentBurdenPct!)}
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
                      {tick}%
                    </text>
                  ))}
                  {/* Y-axis labels */}
                  {visible.map((n, i) => (
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
              {hoveredIndex !== null && visible[hoveredIndex] && (() => {
                const d = visible[hoveredIndex];
                return (
                  <ChartTooltip
                    x={m.left + xScale(d.rentBurdenPct!)}
                    y={m.top + yScale(hoveredIndex) + bandwidth / 2}
                  >
                    <div className="font-bold text-fm-patina">{d.name}</div>
                    <div className="text-fm-sage text-xs mb-2">{d.borough}</div>
                    <div className="space-y-1">
                      <div>Rent-burdened: <strong>{d.rentBurdenPct}%</strong></div>
                      {d.medianIncome && (
                        <div>Median income: <strong>${d.medianIncome.toLocaleString()}</strong></div>
                      )}
                      {d.medianRent > 0 && (
                        <div>Median rent: <strong>${d.medianRent.toLocaleString()}</strong></div>
                      )}
                      <div className="text-fm-sage text-xs pt-1 border-t border-gray-100">
                        Top 4 landlords: <strong>{d.cr4}%</strong> of rentals
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
          { color: "#D55E00", label: "\u226550% Severely Burdened" },
          { color: "#E69F00", label: "40\u201350% Heavily Burdened" },
          { color: "#009E73", label: "<40%" },
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
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-fm-teal hover:underline font-medium"
        >
          {showAll
            ? "Show top 25 only"
            : `Show all ${sorted.length} neighborhoods`}
        </button>
      )}
    </div>
  );
}

type MetricKey = "medianIncome" | "rentBurdenPct" | "medianRent" | "hpdViolationsPerUnit" | "totalUnits" | "stabilizedShare" | "nychaShare" | "cr4" | "hhi";

interface MetricConfig {
  key: MetricKey;
  label: string;
  format: (v: number) => string;
  domainMin: "zero" | "data";
  nullable?: boolean;
}

const METRICS: MetricConfig[] = [
  { key: "medianIncome", label: "Median Household Income", format: (v) => `$${(v / 1000).toFixed(0)}k`, domainMin: "data", nullable: true },
  { key: "rentBurdenPct", label: "Rent-Burdened Households (%)", format: (v) => `${v}%`, domainMin: "zero", nullable: true },
  { key: "medianRent", label: "Median Rent", format: (v) => `$${v.toLocaleString()}`, domainMin: "zero" },
  { key: "hpdViolationsPerUnit", label: "HPD Violations / Unit", format: (v) => v.toFixed(2), domainMin: "zero" },
  { key: "totalUnits", label: "Total Housing Units", format: (v) => v.toLocaleString(), domainMin: "zero" },
  { key: "stabilizedShare", label: "Rent-Stabilized Share (%)", format: (v) => `${v}%`, domainMin: "zero" },
  { key: "nychaShare", label: "NYCHA Footprint (%)", format: (v) => `${v}%`, domainMin: "zero" },
  { key: "cr4", label: "Top-4 Landlord Share (CR4 %)", format: (v) => `${v}%`, domainMin: "zero" },
  { key: "hhi", label: "Ownership Concentration (HHI)", format: (v) => v.toLocaleString(), domainMin: "zero" },
];

function getMetricValue(n: Neighborhood, key: MetricKey): number | null {
  const v = n[key];
  if (v == null || v === 0) {
    const metric = METRICS.find((m) => m.key === key);
    if (metric?.nullable) return null;
  }
  return v as number;
}

export function NeighborhoodExplorerChart({
  neighborhoods,
}: {
  neighborhoods: Neighborhood[];
}) {
  const [xMetric, setXMetric] = useState<MetricKey>("medianIncome");
  const [yMetric, setYMetric] = useState<MetricKey>("rentBurdenPct");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const margin = { top: 10, right: 20, bottom: 45, left: 75 };

  const xConfig = METRICS.find((m) => m.key === xMetric)!;
  const yConfig = METRICS.find((m) => m.key === yMetric)!;

  // Filter to neighborhoods with valid values for both axes
  const data = neighborhoods.filter((n) => {
    const xVal = getMetricValue(n, xMetric);
    const yVal = getMetricValue(n, yMetric);
    return xVal != null && yVal != null;
  });

  if (data.length === 0) return null;

  // Domains
  const xValues = data.map((n) => n[xMetric] as number);
  const yValues = data.map((n) => n[yMetric] as number);

  const xMin = xConfig.domainMin === "zero" ? 0 : Math.min(...xValues) * 0.9;
  const yMin = yConfig.domainMin === "zero" ? 0 : Math.min(...yValues) * 0.9;

  const xTicks = niceLinearTicks(xMin, Math.max(...xValues) * 1.1, 6);
  const yTicks = niceLinearTicks(yMin, Math.max(...yValues) * 1.1, 6);
  const xDomain: [number, number] = [xTicks[0], xTicks[xTicks.length - 1]];
  const yDomain: [number, number] = [yTicks[0], yTicks[yTicks.length - 1]];

  // Bubble radius scale (sqrt so area is proportional)
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

  const handleAxisChange = (axis: "x" | "y", key: MetricKey) => {
    if (axis === "x") setXMetric(key);
    else setYMetric(key);
    setHoveredIndex(null);
    try {
      import("@vercel/analytics").then(({ track }) => {
        track("chart_axis_change", { chart: "neighborhood-explorer", axis, metric: key });
      });
    } catch { /* analytics optional */ }
  };

  // Boroughs present in filtered data
  const activeBoroughs = Object.entries(BOROUGH_COLORS).filter(([borough]) =>
    data.some((n) => n.borough === borough),
  );

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Explore the data
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        Each bubble is a neighborhood, sized by rental units. The default view
        shows income vs. rent burden. Switch axes to explore other patterns.
      </p>

      {/* Axis selectors */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label className="flex items-center gap-2 text-sm text-fm-sage">
          <span className="font-medium whitespace-nowrap">X axis:</span>
          <select
            value={xMetric}
            onChange={(e) => handleAxisChange("x", e.target.value as MetricKey)}
            className="border border-gray-200 rounded-md px-2 py-1.5 text-sm text-fm-patina bg-white"
          >
            {METRICS.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-fm-sage">
          <span className="font-medium whitespace-nowrap">Y axis:</span>
          <select
            value={yMetric}
            onChange={(e) => handleAxisChange("y", e.target.value as MetricKey)}
            className="border border-gray-200 rounded-md px-2 py-1.5 text-sm text-fm-patina bg-white"
          >
            {METRICS.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </label>
        <span className="text-xs text-fm-sage self-center">
          Showing {data.length} of {neighborhoods.length} neighborhoods
        </span>
      </div>

      <ChartContainer height={350} margin={margin} key={`${xMetric}-${yMetric}`}>
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
                      cx={xScale(n[xMetric] as number)}
                      cy={yScale(n[yMetric] as number)}
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
                      {xConfig.format(tick)}
                    </text>
                  ))}
                  <text
                    x={width / 2}
                    y={height + 35}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#6A8C7E"
                  >
                    {xConfig.label}
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
                      {yConfig.format(tick)}
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
                    {yConfig.label}
                  </text>
                </g>
              </svg>

              {/* Tooltip */}
              {hoveredIndex !== null && data[hoveredIndex] && (() => {
                const d = data[hoveredIndex];
                return (
                  <ChartTooltip
                    x={m.left + xScale(d[xMetric] as number)}
                    y={m.top + yScale(d[yMetric] as number)}
                  >
                    <div className="font-bold text-fm-patina">{d.name}</div>
                    <div className="text-fm-sage text-xs mb-2">{d.borough}</div>
                    <div className="space-y-1">
                      <div>{xConfig.label}: <strong>{xConfig.format(d[xMetric] as number)}</strong></div>
                      <div>{yConfig.label}: <strong>{yConfig.format(d[yMetric] as number)}</strong></div>
                      <div>Units: <strong>{d.totalUnits.toLocaleString()}</strong></div>
                    </div>
                  </ChartTooltip>
                );
              })()}
            </>
          );
        }}
      </ChartContainer>

      {/* Borough legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-fm-sage">
        {activeBoroughs.map(([borough, color]) => (
          <span key={borough} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: color }}
            />
            {borough}
          </span>
        ))}
      </div>

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
            Citywide ownership trend
          </h2>
          <p className="text-sm text-fm-sage">
            How ownership concentration has changed across the five boroughs
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
            initialLimit={15}
          />
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-fm-sage">
        <p>
          Source: NYC Rent Guidelines Board Annual Reports; ACRIS/PLUTO analysis.
          At the citywide level, the market looks fragmented across ~30,000
          landlords — the neighborhood-level data above tells the real story.
        </p>
      </div>
    </div>
  );
}

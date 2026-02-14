"use client";

import { useState } from "react";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  linearScale,
  bandScale,
  niceLinearTicks,
} from "@/lib/chart-utils";

// ---------- Fare History Chart ----------

interface FareEntry {
  year: number;
  effectiveDate: string;
  baseFare: number;
  monthlyPass: number;
  baseFareReal2024: number;
  monthlyPassReal2024: number;
}

export function FareHistoryChart({ fares }: { fares: FareEntry[] }) {
  const [metric, setMetric] = useState<"baseFare" | "monthlyPass">("monthlyPass");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const nominalKey = metric;
  const realKey = metric === "baseFare" ? "baseFareReal2024" : "monthlyPassReal2024";
  const label = metric === "baseFare" ? "Single Ride" : "Monthly Pass";

  const margin = { top: 20, right: 20, bottom: 35, left: 55 };

  const allValues = fares.flatMap((f) => [f[nominalKey], f[realKey]]);
  const yTicks = niceLinearTicks(0, Math.max(...allValues) * 1.1, 6);
  const yDomain: [number, number] = [0, yTicks[yTicks.length - 1]];
  const xDomain: [number, number] = [fares[0].year, fares[fares.length - 1].year];

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-fm-patina">
            MTA fare history
          </h2>
          <p className="text-sm text-fm-sage">
            Nominal fare vs. inflation-adjusted (2024 dollars)
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => { setMetric("monthlyPass"); setHoveredIndex(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              metric === "monthlyPass"
                ? "bg-white text-fm-patina shadow-sm"
                : "text-fm-sage hover:text-fm-patina"
            }`}
          >
            Monthly Pass
          </button>
          <button
            onClick={() => { setMetric("baseFare"); setHoveredIndex(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              metric === "baseFare"
                ? "bg-white text-fm-patina shadow-sm"
                : "text-fm-sage hover:text-fm-patina"
            }`}
          >
            Single Ride
          </button>
        </div>
      </div>

      <ChartContainer height={300} margin={margin} key={metric}>
        {({ svgWidth, svgHeight, width, height, margin: m }) => {
          const xScale = linearScale(xDomain, [0, width]);
          const yScale = linearScale(yDomain, [height, 0]);

          // Build path strings
          const nominalPath = fares
            .map((f, i) => `${i === 0 ? "M" : "L"} ${xScale(f.year)} ${yScale(f[nominalKey])}`)
            .join(" ");
          const realPath = fares
            .map((f, i) => `${i === 0 ? "M" : "L"} ${xScale(f.year)} ${yScale(f[realKey])}`)
            .join(" ");

          return (
            <>
              <svg width={svgWidth} height={svgHeight}>
                <g transform={`translate(${m.left},${m.top})`}>
                  {/* Grid */}
                  {yTicks.map((tick) => (
                    <line
                      key={tick}
                      x1={0} y1={yScale(tick)}
                      x2={width} y2={yScale(tick)}
                      stroke="#e2e8f0" strokeDasharray="3 3"
                    />
                  ))}

                  {/* Lines */}
                  <path d={nominalPath} fill="none" stroke="#2B7A65" strokeWidth={2.5} />
                  <path d={realPath} fill="none" stroke="#B07834" strokeWidth={2.5} strokeDasharray="6 3" />

                  {/* Data points (nominal) */}
                  {fares.map((f, i) => (
                    <circle
                      key={`n-${i}`}
                      cx={xScale(f.year)} cy={yScale(f[nominalKey])}
                      r={hoveredIndex === i ? 6 : 4}
                      fill="#2B7A65"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                  {/* Data points (real) */}
                  {fares.map((f, i) => (
                    <circle
                      key={`r-${i}`}
                      cx={xScale(f.year)} cy={yScale(f[realKey])}
                      r={hoveredIndex === i ? 6 : 4}
                      fill="#B07834"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}

                  {/* X-axis */}
                  <line x1={0} y1={height} x2={width} y2={height} stroke="#cbd5e1" />
                  {fares.map((f) => (
                    <text
                      key={f.year}
                      x={xScale(f.year)} y={height + 18}
                      textAnchor="middle" fontSize={11} fill="#64748b"
                    >
                      {f.year}
                    </text>
                  ))}

                  {/* Y-axis */}
                  <line x1={0} y1={0} x2={0} y2={height} stroke="#cbd5e1" />
                  {yTicks.map((tick) => (
                    <text
                      key={tick}
                      x={-8} y={yScale(tick)}
                      textAnchor="end" dominantBaseline="middle"
                      fontSize={12} fill="#64748b"
                    >
                      ${tick}
                    </text>
                  ))}
                </g>
              </svg>

              {/* Tooltip */}
              {hoveredIndex !== null && fares[hoveredIndex] && (() => {
                const f = fares[hoveredIndex];
                return (
                  <ChartTooltip
                    x={m.left + xScale(f.year)}
                    y={m.top + Math.min(yScale(f[nominalKey]), yScale(f[realKey]))}
                  >
                    <div className="font-bold text-fm-patina">{label} — {f.year}</div>
                    <div className="space-y-1 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-0.5 bg-fm-teal inline-block" />
                        Nominal: <strong>${f[nominalKey].toFixed(2)}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "#B07834" }} />
                        2024 dollars: <strong>${f[realKey].toFixed(2)}</strong>
                      </div>
                    </div>
                  </ChartTooltip>
                );
              })()}
            </>
          );
        }}
      </ChartContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-fm-sage">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-fm-teal inline-block" />
          Nominal fare
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "#B07834" }} />
          Inflation-adjusted (2024 $)
        </span>
      </div>
      <p className="mt-3 text-xs text-fm-sage">
        Source: MTA Board Resolutions; BLS CPI-U for inflation adjustment.
      </p>
    </div>
  );
}

// ---------- Commute Mode Chart ----------

// Okabe-Ito colorblind-safe palette
const MODE_COLORS = {
  transit: "#0072B2",
  drove: "#E69F00",
  carpool: "#CC79A7",
  walkBike: "#009E73",
  wfh: "#56B4E9",
  other: "#D4D4D4",
};

interface NeighborhoodCommute {
  name: string;
  slug: string;
  borough: string;
  workers: number;
  transitPct: number;
  drovePct: number;
  carpoolPct: number;
  walkBikePct: number;
  wfhPct: number;
}

const BAR_CHART_LIMIT = 25;

export function CommuteModeChart({
  neighborhoods,
}: {
  neighborhoods: NeighborhoodCommute[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Sort by transit % descending
  const sorted = [...neighborhoods].sort((a, b) => b.transitPct - a.transitPct);
  const visible = showAll ? sorted : sorted.slice(0, BAR_CHART_LIMIT);
  const hasMore = sorted.length > BAR_CHART_LIMIT;

  const chartHeight = visible.length * 28 + 40;
  const margin = { top: 10, right: 30, bottom: 30, left: 180 };

  const modes: { key: keyof typeof MODE_COLORS; label: string; pctKey: keyof NeighborhoodCommute }[] = [
    { key: "transit", label: "Public Transit", pctKey: "transitPct" },
    { key: "drove", label: "Drove Alone", pctKey: "drovePct" },
    { key: "carpool", label: "Carpool", pctKey: "carpoolPct" },
    { key: "walkBike", label: "Walk/Bike", pctKey: "walkBikePct" },
    { key: "wfh", label: "Work from Home", pctKey: "wfhPct" },
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        How do people get to work?
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        Commute mode by neighborhood, sorted by transit ridership. Manhattan neighborhoods have more walkers and work-from-home; Staten Island and outer Queens rely heavily on cars.
      </p>

      <ChartContainer height={chartHeight} margin={margin}>
        {({ svgWidth, svgHeight, width, height, margin: m }) => {
          const xScale = linearScale([0, 100], [0, width]);
          const { scale: yScale, bandwidth } = bandScale(
            visible.map((n) => n.name),
            [0, height],
            0.25,
          );

          return (
            <>
              <svg width={svgWidth} height={svgHeight}>
                <g transform={`translate(${m.left},${m.top})`}>
                  {/* Vertical grid lines */}
                  {[0, 25, 50, 75, 100].map((tick) => (
                    <line
                      key={tick}
                      x1={xScale(tick)} y1={0}
                      x2={xScale(tick)} y2={height}
                      stroke="#e2e8f0" strokeDasharray="3 3"
                    />
                  ))}

                  {/* Stacked bars */}
                  {visible.map((n, i) => {
                    let cumX = 0;
                    return (
                      <g
                        key={i}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{ cursor: "pointer" }}
                      >
                        {modes.map((mode) => {
                          const pct = n[mode.pctKey] as number;
                          const x = xScale(cumX);
                          const w = xScale(cumX + pct) - x;
                          cumX += pct;
                          if (pct <= 0) return null;
                          return (
                            <rect
                              key={mode.key}
                              x={x}
                              y={yScale(i)}
                              width={w}
                              height={bandwidth}
                              fill={MODE_COLORS[mode.key]}
                              rx={0}
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                  {/* X-axis */}
                  <line x1={0} y1={height} x2={width} y2={height} stroke="#cbd5e1" />
                  {[0, 25, 50, 75, 100].map((tick) => (
                    <text
                      key={tick}
                      x={xScale(tick)} y={height + 18}
                      textAnchor="middle" fontSize={12} fill="#64748b"
                    >
                      {tick}%
                    </text>
                  ))}

                  {/* Y-axis labels */}
                  {visible.map((n, i) => (
                    <text
                      key={i}
                      x={-6} y={yScale(i) + bandwidth / 2}
                      textAnchor="end" dominantBaseline="middle"
                      fontSize={11} fill="#64748b"
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
                    x={m.left + xScale(50)}
                    y={m.top + yScale(hoveredIndex) + bandwidth / 2}
                  >
                    <div className="font-bold text-fm-patina">{d.name}</div>
                    <div className="text-fm-sage text-xs mb-2">{d.borough}</div>
                    <div className="space-y-0.5 text-xs">
                      {modes.map((mode) => {
                        const pct = d[mode.pctKey] as number;
                        return (
                          <div key={mode.key} className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                              style={{ backgroundColor: MODE_COLORS[mode.key] }}
                            />
                            {mode.label}: <strong>{pct}%</strong>
                          </div>
                        );
                      })}
                      <div className="pt-1 border-t border-gray-100 text-fm-sage">
                        {d.workers.toLocaleString()} workers
                      </div>
                    </div>
                  </ChartTooltip>
                );
              })()}
            </>
          );
        }}
      </ChartContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-fm-sage">
        {modes.map((mode) => (
          <span key={mode.key} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: MODE_COLORS[mode.key] }}
            />
            {mode.label}
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

      <p className="mt-3 text-xs text-fm-sage">
        Source: U.S. Census Bureau, ACS 2023 5-Year Estimates, Table B08301.
      </p>
    </div>
  );
}

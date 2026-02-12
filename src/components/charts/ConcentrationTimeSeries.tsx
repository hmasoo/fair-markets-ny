"use client";

import { useState } from "react";
import { ChartContainer } from "./ChartContainer";
import { ChartTooltip } from "./ChartTooltip";
import { linearScale, niceLinearTicks } from "@/lib/chart-utils";

interface YearData {
  year: number;
  hhi?: number;
  cr4?: number;
}

interface ConcentrationTimeSeriesProps {
  data: YearData[];
  metric: "hhi" | "cr4";
  title?: string;
}

const HHI_THRESHOLDS = {
  unconcentrated: 1500,
  moderatelyConcentrated: 2500,
};

export function ConcentrationTimeSeries({
  data,
  metric,
  title,
}: ConcentrationTimeSeriesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isHHI = metric === "hhi";
  const color = isHHI ? "#B07834" : "#2B7A65";

  // Compute Y domain (same logic as original)
  const yDomain: [number, number] = (() => {
    if (!isHHI) return [0, 100];
    const values = data.map((d) => d.hhi ?? 0).filter(Boolean);
    if (values.length === 0) return [0, 3000];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const ceilingCandidates = [
      HHI_THRESHOLDS.unconcentrated,
      HHI_THRESHOLDS.moderatelyConcentrated,
      Math.ceil(max / 500) * 500 + 500,
    ];
    const ceiling =
      ceilingCandidates.find((c) => c > max * 1.1) ??
      Math.ceil((max * 1.3) / 500) * 500;
    const floor = min > 500 ? Math.floor((min * 0.8) / 500) * 500 : 0;
    return [floor, ceiling];
  })();

  const years = data.map((d) => d.year);
  const xDomain: [number, number] = [Math.min(...years), Math.max(...years)];
  const yTicks = niceLinearTicks(yDomain[0], yDomain[1], 6);
  const margin = { top: 10, right: 20, bottom: 30, left: 55 };

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-fm-patina mb-4">{title}</h3>
      )}
      <ChartContainer height={350} margin={margin}>
        {({ svgWidth, svgHeight, width, height, margin: m }) => {
          const xScale = linearScale(xDomain, [0, width]);
          const yScale = linearScale(yDomain, [height, 0]);
          const points = data
            .map((d, i) => ({
              x: xScale(d.year),
              y: yScale(d[metric] ?? 0),
              value: d[metric] ?? 0,
              year: d.year,
              index: i,
            }))
            .filter((p) => p.value !== 0);
          const polylinePoints = points
            .map((p) => `${p.x},${p.y}`)
            .join(" ");

          return (
            <>
              <svg width={svgWidth} height={svgHeight} overflow="visible">
                <g transform={`translate(${m.left},${m.top})`}>
                  {/* Grid lines */}
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
                  {years.map((year) => (
                    <line
                      key={`gx-${year}`}
                      x1={xScale(year)}
                      y1={0}
                      x2={xScale(year)}
                      y2={height}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                  ))}

                  {/* Reference lines (HHI only) */}
                  {isHHI &&
                    HHI_THRESHOLDS.unconcentrated >= yDomain[0] &&
                    HHI_THRESHOLDS.unconcentrated <= yDomain[1] && (
                      <>
                        <line
                          x1={0}
                          y1={yScale(HHI_THRESHOLDS.unconcentrated)}
                          x2={width}
                          y2={yScale(HHI_THRESHOLDS.unconcentrated)}
                          stroke="#56B4E9"
                          strokeDasharray="5 5"
                        />
                        <text
                          x={width + 4}
                          y={yScale(HHI_THRESHOLDS.unconcentrated)}
                          fontSize={10}
                          fill="#56B4E9"
                          dominantBaseline="middle"
                        >
                          Unconcentrated
                        </text>
                      </>
                    )}
                  {isHHI &&
                    HHI_THRESHOLDS.moderatelyConcentrated >= yDomain[0] &&
                    HHI_THRESHOLDS.moderatelyConcentrated <= yDomain[1] && (
                      <>
                        <line
                          x1={0}
                          y1={yScale(HHI_THRESHOLDS.moderatelyConcentrated)}
                          x2={width}
                          y2={yScale(HHI_THRESHOLDS.moderatelyConcentrated)}
                          stroke="#D55E00"
                          strokeDasharray="5 5"
                        />
                        <text
                          x={width + 4}
                          y={yScale(HHI_THRESHOLDS.moderatelyConcentrated)}
                          fontSize={10}
                          fill="#D55E00"
                          dominantBaseline="middle"
                        >
                          Highly Concentrated
                        </text>
                      </>
                    )}

                  {/* Data line */}
                  {points.length > 1 && (
                    <polyline
                      points={polylinePoints}
                      fill="none"
                      stroke={color}
                      strokeWidth={2}
                    />
                  )}

                  {/* Data dots */}
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={hoveredIndex === i ? 6 : 4}
                      fill={color}
                      stroke="white"
                      strokeWidth={hoveredIndex === i ? 2 : 0}
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
                  {years.map((year) => (
                    <text
                      key={`xl-${year}`}
                      x={xScale(year)}
                      y={height + 18}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#64748b"
                    >
                      {year}
                    </text>
                  ))}

                  {/* Y-axis */}
                  <line x1={0} y1={0} x2={0} y2={height} stroke="#cbd5e1" />
                  {yTicks.map((tick) => (
                    <text
                      key={`yl-${tick}`}
                      x={-8}
                      y={yScale(tick)}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={12}
                      fill="#64748b"
                    >
                      {tick.toLocaleString()}
                    </text>
                  ))}
                  <text
                    x={-40}
                    y={height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={12}
                    fill="#6A8C7E"
                    transform={`rotate(-90, -40, ${height / 2})`}
                  >
                    {isHHI ? "HHI" : "CR4 (%)"}
                  </text>
                </g>
              </svg>

              {/* Tooltip */}
              {hoveredIndex !== null && points[hoveredIndex] && (
                <ChartTooltip
                  x={m.left + points[hoveredIndex].x}
                  y={m.top + points[hoveredIndex].y}
                >
                  <div className="font-medium">
                    {points[hoveredIndex].year}
                  </div>
                  <div>
                    {isHHI ? "HHI" : "CR4 (%)"}:{" "}
                    <strong>
                      {points[hoveredIndex].value.toLocaleString()}
                    </strong>
                  </div>
                </ChartTooltip>
              )}
            </>
          );
        }}
      </ChartContainer>
      {isHHI && (
        <div className="flex items-center gap-4 mt-3 text-xs text-fm-sage">
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-0.5 inline-block"
              style={{ backgroundColor: "#56B4E9" }}
            />{" "}
            &lt;1,500: Competitive
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-0.5 inline-block"
              style={{ backgroundColor: "#E69F00" }}
            />{" "}
            1,500–2,500: Moderate
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-0.5 inline-block"
              style={{ backgroundColor: "#D55E00" }}
            />{" "}
            &gt;2,500: Highly Concentrated
          </span>
        </div>
      )}
    </div>
  );
}

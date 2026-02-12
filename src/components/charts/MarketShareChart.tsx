"use client";

import { useState } from "react";
import { ChartContainer } from "./ChartContainer";
import { ChartTooltip } from "./ChartTooltip";
import {
  linearScale,
  bandScale,
  niceLinearTicks,
  roundedRightRect,
} from "@/lib/chart-utils";

interface MarketShareEntry {
  company: string;
  share: number;
  source?: string;
}

interface MarketShareChartProps {
  data: MarketShareEntry[];
  title?: string;
  year?: number;
}

// Okabe-Ito colorblind-safe categorical palette
const COLORS = [
  "#E69F00",
  "#56B4E9",
  "#009E73",
  "#0072B2",
  "#D55E00",
  "#CC79A7",
  "#F0E442",
  "#000000",
];

export function MarketShareChart({
  data,
  title,
  year,
}: MarketShareChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartHeight = Math.max(250, data.length * 45);
  const margin = { top: 5, right: 30, bottom: 30, left: 140 };
  const xTicks = niceLinearTicks(0, 100, 6);

  return (
    <div>
      {(title || year) && (
        <h3 className="text-lg font-semibold text-fm-patina mb-4">
          {title}
          {year && (
            <span className="text-fm-sage font-normal ml-2">({year})</span>
          )}
        </h3>
      )}
      <ChartContainer height={chartHeight} margin={margin}>
        {({ svgWidth, svgHeight, width, height, margin: m }) => {
          const xScale = linearScale([0, 100], [0, width]);
          const { scale: yScale, bandwidth } = bandScale(
            data.map((d) => d.company),
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

                  {/* Bars */}
                  {data.map((d, i) => (
                    <path
                      key={i}
                      d={roundedRightRect(
                        0,
                        yScale(i),
                        xScale(d.share),
                        bandwidth,
                        4,
                      )}
                      fill={COLORS[i % COLORS.length]}
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
                  {data.map((d, i) => (
                    <text
                      key={i}
                      x={-8}
                      y={yScale(i) + bandwidth / 2}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={12}
                      fill="#64748b"
                    >
                      {d.company}
                    </text>
                  ))}
                </g>
              </svg>

              {/* Tooltip */}
              {hoveredIndex !== null && data[hoveredIndex] && (
                <ChartTooltip
                  x={m.left + xScale(data[hoveredIndex].share)}
                  y={m.top + yScale(hoveredIndex) + bandwidth / 2}
                >
                  <div className="font-medium">
                    {data[hoveredIndex].company}
                  </div>
                  <div>
                    Market Share:{" "}
                    <strong>{data[hoveredIndex].share.toFixed(1)}%</strong>
                  </div>
                </ChartTooltip>
              )}
            </>
          );
        }}
      </ChartContainer>
    </div>
  );
}

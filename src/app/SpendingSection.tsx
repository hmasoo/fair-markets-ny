"use client";

import { useState } from "react";
import Link from "next/link";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltip } from "@/components/charts/ChartTooltip";

interface SpendingCategory {
  name: string;
  amount: number;
  tracked: boolean;
  href?: string;
}

interface SpendingData {
  source: string;
  sourceUrl: string;
  pressRelease: string;
  nyMetro: {
    geography: string;
    table: string;
    period: string;
    totalExpenditure: number;
    categories: SpendingCategory[];
  };
}

const TRACKED_COLORS: Record<string, string> = {
  Housing: "#B07834",
  Transportation: "#C4883E",
  Groceries: "#D49A5A",
  Healthcare: "#2B7A65",
  "Broadband & Telecom": "#6A8C7E",
};

const UNTRACKED_GRAYS = [
  "#94A3B8",
  "#A3B1C0",
  "#B0BCC7",
  "#BDC7CF",
  "#CAD2D8",
  "#D7DDE1",
  "#E2E8F0",
];

function getColor(cat: SpendingCategory, untrackedIdx: number): string {
  if (cat.tracked) return TRACKED_COLORS[cat.name] ?? "#B07834";
  return UNTRACKED_GRAYS[untrackedIdx % UNTRACKED_GRAYS.length];
}

interface SpendingSectionProps {
  data: SpendingData;
}

export function SpendingSection({ data }: SpendingSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { categories, totalExpenditure, period } = data.nyMetro;

  // Order: tracked first (by amount desc), then untracked (by amount desc)
  const tracked = categories
    .filter((c) => c.tracked)
    .sort((a, b) => b.amount - a.amount);
  const untracked = categories
    .filter((c) => !c.tracked)
    .sort((a, b) => b.amount - a.amount);
  const ordered = [...tracked, ...untracked];

  // Assign colors
  let untrackedIdx = 0;
  const colored = ordered.map((cat) => {
    const color = getColor(cat, cat.tracked ? 0 : untrackedIdx);
    if (!cat.tracked) untrackedIdx++;
    return { ...cat, color };
  });

  const trackedTotal = tracked.reduce((sum, c) => sum + c.amount, 0);
  const trackedPct = Math.round((trackedTotal / totalExpenditure) * 100);

  const BAR_HEIGHT = 48;

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-fm-patina mb-3">
          Where does a New York household&#39;s money go?
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl mb-8">
          The average household in the New York metro area spends $
          {totalExpenditure.toLocaleString()} per year. The highlighted sectors
          below are markets where Fair Markets NY tracks ownership and
          competition data.
        </p>

        {/* Stacked bar */}
        <ChartContainer
          height={BAR_HEIGHT}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          {({ svgWidth, svgHeight, width }) => {
            let x = 0;
            const segments = colored.map((cat, i) => {
              const w = (cat.amount / totalExpenditure) * width;
              const seg = { ...cat, x, w, index: i };
              x += w;
              return seg;
            });

            return (
              <>
                <svg width={svgWidth} height={svgHeight}>
                  <defs>
                    <clipPath id="spending-bar-clip">
                      <rect
                        x={0}
                        y={0}
                        width={width}
                        height={svgHeight}
                        rx={6}
                      />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#spending-bar-clip)">
                    {segments.map((seg, i) => (
                      <rect
                        key={i}
                        x={seg.x}
                        y={0}
                        width={Math.max(seg.w, 0)}
                        height={svgHeight}
                        fill={seg.color}
                        stroke="white"
                        strokeWidth={1}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                    {/* Inline labels for wide segments */}
                    {segments.map(
                      (seg, i) =>
                        seg.w > 60 && (
                          <text
                            key={`label-${i}`}
                            x={seg.x + seg.w / 2}
                            y={svgHeight / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={11}
                            fontWeight={seg.tracked ? 600 : 400}
                            fill="white"
                            pointerEvents="none"
                          >
                            {seg.name}
                          </text>
                        ),
                    )}
                  </g>
                </svg>

                {/* Tooltip */}
                {hoveredIndex !== null && segments[hoveredIndex] && (
                  <ChartTooltip
                    x={
                      segments[hoveredIndex].x +
                      segments[hoveredIndex].w / 2
                    }
                    y={0}
                  >
                    <div className="font-medium">
                      {segments[hoveredIndex].name}
                    </div>
                    <div>
                      $
                      {segments[hoveredIndex].amount.toLocaleString()}
                      /yr{" "}
                      <span className="text-fm-sage">
                        (
                        {(
                          (segments[hoveredIndex].amount / totalExpenditure) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                    {segments[hoveredIndex].tracked && (
                      <div className="text-xs text-fm-teal mt-1">
                        Tracked by Fair Markets NY
                      </div>
                    )}
                  </ChartTooltip>
                )}
              </>
            );
          }}
        </ChartContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-xs text-fm-sage">
          {colored
            .filter((c) => c.tracked)
            .map((cat) => (
              <span key={cat.name} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm inline-block shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.href ? (
                  <Link
                    href={cat.href}
                    className="text-fm-teal hover:underline"
                  >
                    {cat.name}
                  </Link>
                ) : (
                  cat.name
                )}
              </span>
            ))}
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm inline-block shrink-0"
              style={{ backgroundColor: "#B0BCC7" }}
            />
            Other household spending
          </span>
        </div>

        {/* Stat callout */}
        <div className="mt-8 bg-[#F6F9F8] rounded-lg p-6 border border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-fm-copper">
              {trackedPct}%
            </span>
            <span className="text-lg text-fm-patina font-semibold">
              of household spending
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            ${trackedTotal.toLocaleString()} per year goes to markets where Fair
            Markets NY tracks concentration — housing, transportation,
            groceries, healthcare, and broadband.
          </p>
        </div>

        {/* Source */}
        <p className="text-xs text-fm-sage mt-6">
          Source:{" "}
          <a
            href={data.sourceUrl}
            className="text-fm-teal hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.source}
          </a>
          , Table {data.nyMetro.table} ({period}). Telecom & internet separated
          from BLS Housing category. See also:{" "}
          <a
            href={data.pressRelease}
            className="text-fm-teal hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            NY Metro press release
          </a>
          .
        </p>
      </div>
    </section>
  );
}

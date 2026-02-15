"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltip } from "@/components/charts/ChartTooltip";

interface SpendingCategory {
  name: string;
  amount: number;
  tracked: boolean;
  href?: string;
  coming?: boolean;
}

interface GeographyData {
  geography: string;
  table: string;
  period: string;
  totalExpenditure: number;
  meanIncomeBefore: number;
  categories: SpendingCategory[];
}

interface SpendingData {
  source: string;
  sourceUrl: string;
  pressRelease: string;
  nyMetro: GeographyData;
  national: GeographyData;
  nyState?: GeographyData | null;
}

type GeoKey = "nyMetro" | "nyState" | "national";

const GEO_LABELS: Record<GeoKey, string> = {
  nyMetro: "NY Metro",
  nyState: "New York State",
  national: "National",
};

const GEO_HEADINGS: Record<GeoKey, string> = {
  nyMetro: "New York",
  nyState: "New York State",
  national: "American",
};

const TRACKED_COLOR = "#B07834";
const COMING_COLOR = "#C4B49E";
const UNTRACKED_COLOR = "#CBD5E1";

interface SpendingSectionProps {
  data: SpendingData;
}

export function SpendingSection({ data }: SpendingSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeGeo, setActiveGeo] = useState<GeoKey>("nyMetro");
  const router = useRouter();

  const geoKeys: GeoKey[] = ["nyMetro", ...(data.nyState ? ["nyState" as GeoKey] : []), "national"];
  const geo = data[activeGeo] as GeographyData | null | undefined;

  if (!geo) return null;

  const { categories, totalExpenditure, meanIncomeBefore, period } = geo;

  // Order: tracked first (by amount desc), then untracked (by amount desc)
  const tracked = categories
    .filter((c) => c.tracked)
    .sort((a, b) => b.amount - a.amount);
  const untracked = categories
    .filter((c) => !c.tracked)
    .sort((a, b) => b.amount - a.amount);
  const ordered = [...tracked, ...untracked];

  const colored = ordered.map((cat) => ({
    ...cat,
    color: cat.coming ? COMING_COLOR : cat.tracked ? TRACKED_COLOR : UNTRACKED_COLOR,
  }));

  const trackedTotal = tracked.reduce((sum, c) => sum + c.amount, 0);
  const trackedPct = Math.round((trackedTotal / totalExpenditure) * 100);

  const BAR_HEIGHT = 48;

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-3">
          <h2 className="text-2xl font-bold text-fm-patina">
            Where does a {GEO_HEADINGS[activeGeo]} household&#39;s money go?
          </h2>
          <div className="flex gap-1">
            {geoKeys.map((key) => (
              <button
                key={key}
                onClick={() => {
                  setActiveGeo(key);
                  setHoveredIndex(null);
                }}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  activeGeo === key
                    ? "bg-fm-patina text-white"
                    : "bg-gray-100 text-fm-sage hover:bg-gray-200"
                }`}
              >
                {GEO_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl mb-6">
          ${totalExpenditure.toLocaleString()}/yr average spending.
          The {trackedPct}% in copper is what this site covers — click
          any segment.
        </p>

        {/* Single spending bar */}
        <ChartContainer
          key={activeGeo}
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
                    <clipPath id="bar-clip">
                      <rect
                        x={0}
                        y={0}
                        width={width}
                        height={BAR_HEIGHT}
                        rx={6}
                      />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#bar-clip)">
                    {segments.map((seg, i) => (
                      <rect
                        key={i}
                        x={seg.x}
                        y={0}
                        width={Math.max(seg.w, 0)}
                        height={BAR_HEIGHT}
                        fill={seg.color}
                        stroke="white"
                        strokeWidth={1}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => seg.href && router.push(seg.href)}
                        style={{ cursor: seg.href ? "pointer" : "default" }}
                      />
                    ))}
                    {segments.map(
                      (seg, i) =>
                        seg.w > 60 && (
                          <text
                            key={`label-${i}`}
                            x={seg.x + seg.w / 2}
                            y={BAR_HEIGHT / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={11}
                            fontWeight={seg.tracked ? 600 : 400}
                            fill="white"
                            pointerEvents="none"
                          >
                            {seg.name}{seg.coming ? " (soon)" : ""}
                          </text>
                        ),
                    )}
                  </g>
                </svg>

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
                      ${segments[hoveredIndex].amount.toLocaleString()}/yr
                      {" "}
                      <span className="text-fm-sage">
                        ({((segments[hoveredIndex].amount / totalExpenditure) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    {segments[hoveredIndex].href && (
                      <div className="text-xs text-fm-teal mt-1">
                        Click to see the data &rarr;
                      </div>
                    )}
                    {segments[hoveredIndex].coming && (
                      <div className="text-xs text-fm-sage mt-1 italic">
                        Coming soon
                      </div>
                    )}
                  </ChartTooltip>
                )}
              </>
            );
          }}
        </ChartContainer>

        <p className="text-xs text-fm-sage mt-4">
          Source:{" "}
          <a
            href={data.sourceUrl}
            className="text-fm-teal hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.source}
          </a>
          , Table {geo.table} ({period}).
        </p>
      </div>
    </section>
  );
}

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
  const [activeGeo, setActiveGeo] = useState<GeoKey>("nyMetro");

  const geoKeys: GeoKey[] = ["nyMetro", ...(data.nyState ? ["nyState" as GeoKey] : []), "national"];
  const geo = data[activeGeo] as GeographyData | null | undefined;

  // Fallback if somehow the active geo doesn't exist
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

  // Assign colors
  let untrackedIdx = 0;
  const colored = ordered.map((cat) => {
    const color = getColor(cat, cat.tracked ? 0 : untrackedIdx);
    if (!cat.tracked) untrackedIdx++;
    return { ...cat, color };
  });

  const trackedTotal = tracked.reduce((sum, c) => sum + c.amount, 0);
  const trackedPctOfSpending = Math.round((trackedTotal / totalExpenditure) * 100);
  const trackedPctOfIncome = Math.round((trackedTotal / meanIncomeBefore) * 100);
  const spendingPctOfIncome = totalExpenditure / meanIncomeBefore;

  const SPENDING_BAR_HEIGHT = 48;
  const INCOME_BAR_HEIGHT = 32;
  const BAR_GAP = 12;
  const LABEL_HEIGHT = 18;
  const TOTAL_HEIGHT = LABEL_HEIGHT + SPENDING_BAR_HEIGHT + BAR_GAP + LABEL_HEIGHT + INCOME_BAR_HEIGHT;

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-fm-patina mb-3">
          Where does a {GEO_HEADINGS[activeGeo]} household&#39;s money go?
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl mb-5">
          The average household in the {geo.geography} earns $
          {meanIncomeBefore.toLocaleString()} and spends $
          {totalExpenditure.toLocaleString()} per year. The highlighted sectors
          are markets where Fair Markets NY tracks ownership and competition data.
        </p>

        {/* Geography toggle */}
        <div className="flex gap-1 mb-6">
          {geoKeys.map((key) => (
            <button
              key={key}
              onClick={() => {
                setActiveGeo(key);
                setHoveredIndex(null);
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                activeGeo === key
                  ? "bg-fm-patina text-white"
                  : "bg-gray-100 text-fm-sage hover:bg-gray-200"
              }`}
            >
              {GEO_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Dual bars */}
        <ChartContainer
          key={activeGeo}
          height={TOTAL_HEIGHT}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          {({ svgWidth, svgHeight, width }) => {
            // Spending bar: scaled to income (full width = income)
            const spendingBarWidth = spendingPctOfIncome * width;
            let x = 0;
            const segments = colored.map((cat, i) => {
              const w = (cat.amount / meanIncomeBefore) * width;
              const seg = { ...cat, x, w, index: i };
              x += w;
              return seg;
            });

            // Income bar
            const trackedIncomeWidth = (trackedTotal / meanIncomeBefore) * width;

            const spendingBarY = LABEL_HEIGHT;
            const incomeLabelY = spendingBarY + SPENDING_BAR_HEIGHT + BAR_GAP;
            const incomeBarY = incomeLabelY + LABEL_HEIGHT;

            return (
              <>
                <svg width={svgWidth} height={svgHeight}>
                  {/* Spending label */}
                  <text
                    x={0}
                    y={LABEL_HEIGHT - 4}
                    fontSize={12}
                    fontWeight={500}
                    fill="#6A8C7E"
                  >
                    Spending
                  </text>
                  <text
                    x={spendingBarWidth}
                    y={LABEL_HEIGHT - 4}
                    fontSize={11}
                    fill="#94A3B8"
                    textAnchor="end"
                  >
                    ${totalExpenditure.toLocaleString()}
                  </text>

                  {/* Spending bar background (full width = income) */}
                  <rect
                    x={0}
                    y={spendingBarY}
                    width={width}
                    height={SPENDING_BAR_HEIGHT}
                    rx={6}
                    fill="#F1F5F9"
                  />

                  {/* Spending bar segments */}
                  <defs>
                    <clipPath id="spending-bar-clip">
                      <rect
                        x={0}
                        y={spendingBarY}
                        width={spendingBarWidth}
                        height={SPENDING_BAR_HEIGHT}
                        rx={6}
                      />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#spending-bar-clip)">
                    {segments.map((seg, i) => (
                      <rect
                        key={i}
                        x={seg.x}
                        y={spendingBarY}
                        width={Math.max(seg.w, 0)}
                        height={SPENDING_BAR_HEIGHT}
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
                            y={spendingBarY + SPENDING_BAR_HEIGHT / 2}
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

                  {/* Income label */}
                  <text
                    x={0}
                    y={incomeLabelY + LABEL_HEIGHT - 4}
                    fontSize={12}
                    fontWeight={500}
                    fill="#6A8C7E"
                  >
                    Income
                  </text>
                  <text
                    x={width}
                    y={incomeLabelY + LABEL_HEIGHT - 4}
                    fontSize={11}
                    fill="#94A3B8"
                    textAnchor="end"
                  >
                    ${meanIncomeBefore.toLocaleString()}
                  </text>

                  {/* Income bar */}
                  <rect
                    x={0}
                    y={incomeBarY}
                    width={width}
                    height={INCOME_BAR_HEIGHT}
                    rx={5}
                    fill="#E8EDEB"
                  />
                  <defs>
                    <clipPath id="income-bar-clip">
                      <rect
                        x={0}
                        y={incomeBarY}
                        width={width}
                        height={INCOME_BAR_HEIGHT}
                        rx={5}
                      />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#income-bar-clip)">
                    <rect
                      x={0}
                      y={incomeBarY}
                      width={trackedIncomeWidth}
                      height={INCOME_BAR_HEIGHT}
                      fill="#B07834"
                    />
                  </g>
                  {/* Income bar label */}
                  {trackedIncomeWidth > 120 && (
                    <text
                      x={trackedIncomeWidth / 2}
                      y={incomeBarY + INCOME_BAR_HEIGHT / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={11}
                      fontWeight={600}
                      fill="white"
                      pointerEvents="none"
                    >
                      {trackedPctOfIncome}% of income
                    </text>
                  )}
                </svg>

                {/* Tooltip */}
                {hoveredIndex !== null && segments[hoveredIndex] && (
                  <ChartTooltip
                    x={
                      segments[hoveredIndex].x +
                      segments[hoveredIndex].w / 2
                    }
                    y={spendingBarY}
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
                        % of spending)
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {((segments[hoveredIndex].amount / meanIncomeBefore) * 100).toFixed(1)}% of income
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
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm inline-block shrink-0"
              style={{ backgroundColor: "#F1F5F9" }}
            />
            Unspent income
          </span>
        </div>

        {/* Stat callout */}
        <div className="mt-8 bg-[#F6F9F8] rounded-lg p-6 border border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-fm-copper">
              {trackedPctOfIncome} cents
            </span>
            <span className="text-lg text-fm-patina font-semibold">
              of every dollar earned
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            go to the sectors this site covers — housing, transportation,
            groceries, healthcare, and broadband. That&#39;s $
            {trackedTotal.toLocaleString()} per year, or {trackedPctOfSpending}%
            of total household spending.
          </p>
        </div>

        {/* Source */}
        <p className="text-xs text-fm-sage mt-6">
          Spending:{" "}
          <a
            href={data.sourceUrl}
            className="text-fm-teal hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.source}
          </a>
          , Table {geo.table} ({period}). Income: BLS CEX Table {geo.table} (
          mean income before taxes). Telecom &amp; internet separated from BLS
          Housing category.
        </p>
      </div>
    </section>
  );
}

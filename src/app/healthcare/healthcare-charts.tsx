"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { ConcentrationTimeSeries } from "@/components/charts/ConcentrationTimeSeries";
import { MarketShareChart } from "@/components/charts/MarketShareChart";
import { getHHIColor } from "@/lib/colorScales";

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
  const sorted = [...regions].sort((a, b) => b.hhi - a.hhi);

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Hospital Concentration by Region
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        HHI measures how concentrated hospital beds are among health systems.
        Higher values mean fewer systems control more beds.
      </p>
      <ResponsiveContainer width="100%" height={sorted.length * 56 + 40}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            label={{
              value: "HHI",
              position: "insideBottomRight",
              offset: -5,
              style: { fontSize: 12, fill: "#6A8C7E" },
            }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 13 }}
            width={160}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as Region;
              return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-sm">
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
                </div>
              );
            }}
          />
          <ReferenceLine
            x={1500}
            stroke="#E69F00"
            strokeDasharray="5 5"
            label={{ value: "Moderate", position: "top", fontSize: 10 }}
          />
          <ReferenceLine
            x={2500}
            stroke="#D55E00"
            strokeDasharray="5 5"
            label={{ value: "Highly Concentrated", position: "top", fontSize: 10 }}
          />
          <Bar dataKey="hhi" radius={[0, 4, 4, 0]}>
            {sorted.map((r, i) => (
              <Cell key={i} fill={getHHIColor(r.hhi)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-fm-sage">
        {[
          { color: "#009E73", label: "Competitive (< 1,500)" },
          { color: "#E69F00", label: "Moderate (1,500–2,500)" },
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

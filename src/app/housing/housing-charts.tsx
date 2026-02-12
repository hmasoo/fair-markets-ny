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
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
} from "recharts";
import { ConcentrationTimeSeries } from "@/components/charts/ConcentrationTimeSeries";
import { MarketShareChart } from "@/components/charts/MarketShareChart";
import { getHHIColor } from "@/lib/colorScales";

interface Neighborhood {
  name: string;
  slug: string;
  borough: string;
  totalUnits: number;
  hhi: number;
  cr4: number;
  hpdViolationsPerUnit: number;
  medianRent: number;
  medianIncome?: number;
  rentBurdenPct?: number;
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
  const sorted = [...neighborhoods].sort((a, b) => b.hhi - a.hhi);

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Landlord Concentration by Neighborhood
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        HHI measures ownership concentration. Higher values mean fewer landlords
        control more units.
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
            width={200}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as Neighborhood;
              return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-sm">
                  <div className="font-bold text-fm-patina">{d.name}</div>
                  <div className="text-fm-sage text-xs mb-2">{d.borough}</div>
                  <div className="space-y-1">
                    <div>HHI: <strong>{d.hhi.toLocaleString()}</strong></div>
                    <div>CR4: <strong>{d.cr4}%</strong> (top 4 landlords)</div>
                    <div>Units: <strong>{d.totalUnits.toLocaleString()}</strong></div>
                    <div>HPD violations/unit: <strong>{d.hpdViolationsPerUnit}</strong></div>
                    <div>Median rent: <strong>${d.medianRent.toLocaleString()}</strong></div>
                    {d.medianIncome && (
                      <div>MHI: <strong>${d.medianIncome.toLocaleString()}</strong></div>
                    )}
                    {d.rentBurdenPct && (
                      <div>Rent-burdened: <strong>{d.rentBurdenPct}%</strong></div>
                    )}
                  </div>
                </div>
              );
            }}
          />
          <ReferenceLine
            x={1500}
            stroke="#D55E00"
            strokeDasharray="5 5"
            label={{ value: "Moderate", position: "top", fontSize: 10 }}
          />
          <Bar dataKey="hhi" radius={[0, 4, 4, 0]}>
            {sorted.map((n, i) => (
              <Cell key={i} fill={getHHIColor(n.hhi)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-fm-sage">
        {[
          { color: "#009E73", label: "Competitive (≤1,500)" },
          { color: "#E69F00", label: "Moderate (1,500–2,500)" },
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
  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Concentration vs. Housing Violations
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        Do more concentrated neighborhoods have worse housing conditions? Bubble
        size shows total rental units.
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            dataKey="hhi"
            name="HHI"
            tick={{ fontSize: 12 }}
            label={{
              value: "HHI (Ownership Concentration)",
              position: "insideBottom",
              offset: -10,
              style: { fontSize: 12, fill: "#6A8C7E" },
            }}
          />
          <YAxis
            type="number"
            dataKey="hpdViolationsPerUnit"
            name="Violations/Unit"
            tick={{ fontSize: 12 }}
            label={{
              value: "HPD Violations per Unit",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12, fill: "#6A8C7E" },
            }}
          />
          <ZAxis
            type="number"
            dataKey="totalUnits"
            range={[200, 800]}
            name="Total Units"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as Neighborhood;
              return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-sm">
                  <div className="font-bold text-fm-patina">{d.name}</div>
                  <div className="text-fm-sage text-xs mb-2">{d.borough}</div>
                  <div className="space-y-1">
                    <div>HHI: <strong>{d.hhi.toLocaleString()}</strong></div>
                    <div>Violations/unit: <strong>{d.hpdViolationsPerUnit}</strong></div>
                    <div>Units: <strong>{d.totalUnits.toLocaleString()}</strong></div>
                    <div>Median rent: <strong>${d.medianRent.toLocaleString()}</strong></div>
                  </div>
                </div>
              );
            }}
          />
          <Scatter data={neighborhoods}>
            {neighborhoods.map((n, i) => (
              <Cell
                key={i}
                fill={BOROUGH_COLORS[n.borough] || "#6A8C7E"}
                fillOpacity={0.8}
                stroke={BOROUGH_COLORS[n.borough] || "#6A8C7E"}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConcentrationVsIncomeChart({
  neighborhoods,
}: {
  neighborhoods: Neighborhood[];
}) {
  const data = neighborhoods.filter((n) => n.medianIncome && n.medianIncome > 0);

  if (data.length === 0) return null;

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Concentration vs. Household Income
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        Does landlord concentration correlate with lower incomes? Bubble size
        shows total rental units; color shows borough.
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            dataKey="hhi"
            name="HHI"
            tick={{ fontSize: 12 }}
            label={{
              value: "HHI (Ownership Concentration)",
              position: "insideBottom",
              offset: -10,
              style: { fontSize: 12, fill: "#6A8C7E" },
            }}
          />
          <YAxis
            type="number"
            dataKey="medianIncome"
            name="MHI"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            label={{
              value: "Median Household Income",
              angle: -90,
              position: "insideLeft",
              offset: -5,
              style: { fontSize: 12, fill: "#6A8C7E" },
            }}
          />
          <ZAxis
            type="number"
            dataKey="totalUnits"
            range={[200, 800]}
            name="Total Units"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as Neighborhood;
              return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-sm">
                  <div className="font-bold text-fm-patina">{d.name}</div>
                  <div className="text-fm-sage text-xs mb-2">{d.borough}</div>
                  <div className="space-y-1">
                    <div>HHI: <strong>{d.hhi.toLocaleString()}</strong></div>
                    <div>MHI: <strong>${d.medianIncome?.toLocaleString()}</strong></div>
                    <div>Rent-burdened: <strong>{d.rentBurdenPct}%</strong></div>
                    <div>Units: <strong>{d.totalUnits.toLocaleString()}</strong></div>
                    <div>Median rent: <strong>${d.medianRent.toLocaleString()}</strong></div>
                  </div>
                </div>
              );
            }}
          />
          <Scatter data={data}>
            {data.map((n, i) => (
              <Cell
                key={i}
                fill={BOROUGH_COLORS[n.borough] || "#6A8C7E"}
                fillOpacity={0.8}
                stroke={BOROUGH_COLORS[n.borough] || "#6A8C7E"}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
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

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

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

export function MarketShareChart({ data, title, year }: MarketShareChartProps) {
  return (
    <div>
      {(title || year) && (
        <h3 className="text-lg font-semibold text-fm-patina mb-4">
          {title}
          {year && <span className="text-fm-sage font-normal ml-2">({year})</span>}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={Math.max(250, data.length * 45)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="company"
            tick={{ fontSize: 12 }}
            width={140}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(1)}%`, "Market Share"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          />
          <Bar dataKey="share" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

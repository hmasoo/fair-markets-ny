"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

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
  const isHHI = metric === "hhi";
  const color = isHHI ? "#B07834" : "#2B7A65";

  // Compute a Y-axis range that fits the data while showing relevant
  // DOJ/FTC threshold lines for context.
  const hhiDomain: [number, number] = (() => {
    if (!isHHI) return [0, 100];
    const values = data.map((d) => d.hhi ?? 0).filter(Boolean);
    if (values.length === 0) return [0, 3000];
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Extend range to include the nearest threshold above the data so
    // viewers see where the data sits relative to DOJ benchmarks.
    const ceilingCandidates = [
      HHI_THRESHOLDS.unconcentrated,
      HHI_THRESHOLDS.moderatelyConcentrated,
      Math.ceil(max / 500) * 500 + 500, // fallback: next 500-rounded step
    ];
    const ceiling = ceilingCandidates.find((c) => c > max * 1.1)
      ?? Math.ceil(max * 1.3 / 500) * 500;

    // Floor: 0 if data is near zero, otherwise give a little breathing room
    const floor = min > 500 ? Math.floor(min * 0.8 / 500) * 500 : 0;

    return [floor, ceiling];
  })();

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-fm-patina mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis
            domain={hhiDomain}
            tick={{ fontSize: 12 }}
            label={{
              value: isHHI ? "HHI" : "CR4 (%)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12, fill: "#6A8C7E" },
            }}
          />
          <Tooltip
            formatter={(value) => [
              Number(value).toLocaleString(),
              isHHI ? "HHI" : "CR4 (%)",
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          />
          <Legend />
          {isHHI &&
            HHI_THRESHOLDS.unconcentrated >= hhiDomain[0] &&
            HHI_THRESHOLDS.unconcentrated <= hhiDomain[1] && (
              <ReferenceLine
                y={HHI_THRESHOLDS.unconcentrated}
                stroke="#56B4E9"
                strokeDasharray="5 5"
                label={{ value: "Unconcentrated", position: "right", fontSize: 10 }}
              />
            )}
          {isHHI &&
            HHI_THRESHOLDS.moderatelyConcentrated >= hhiDomain[0] &&
            HHI_THRESHOLDS.moderatelyConcentrated <= hhiDomain[1] && (
              <ReferenceLine
                y={HHI_THRESHOLDS.moderatelyConcentrated}
                stroke="#D55E00"
                strokeDasharray="5 5"
                label={{ value: "Highly Concentrated", position: "right", fontSize: 10 }}
              />
            )}
          <Line
            type="monotone"
            dataKey={metric}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: color }}
            activeDot={{ r: 6 }}
            name={isHHI ? "HHI" : "CR4 (%)"}
          />
        </LineChart>
      </ResponsiveContainer>
      {isHHI && (
        <div className="flex items-center gap-4 mt-3 text-xs text-fm-sage">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "#56B4E9" }} /> &lt;1,500: Competitive
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "#E69F00" }} /> 1,500–2,500: Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "#D55E00" }} /> &gt;2,500: Highly Concentrated
          </span>
        </div>
      )}
    </div>
  );
}

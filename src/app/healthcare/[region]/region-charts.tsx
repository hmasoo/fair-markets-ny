"use client";

import { MarketShareChart } from "@/components/charts/MarketShareChart";

interface TopSystem {
  name: string;
  beds: number;
  facilities: number;
  share: number;
}

export function RegionCharts({
  regionName,
  topSystems,
}: {
  regionName: string;
  topSystems: TopSystem[];
}) {
  const chartData = topSystems.map((s) => ({
    company: s.name,
    share: s.share,
  }));

  return (
    <div className="card">
      <MarketShareChart
        data={chartData}
        title={`Health System Market Share in ${regionName}`}
        year={2024}
      />
    </div>
  );
}

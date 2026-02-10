"use client";

import { MarketShareChart } from "@/components/charts/MarketShareChart";

interface Provider {
  name: string;
  share: number;
  maxDownload: number;
}

export function CountyCharts({
  countyName,
  topProviders,
}: {
  countyName: string;
  topProviders: Provider[];
}) {
  const chartData = topProviders.map((p) => ({
    company: p.name,
    share: p.share,
  }));

  return (
    <div className="card">
      <MarketShareChart
        data={chartData}
        title={`ISP Market Share in ${countyName}`}
        year={2024}
      />
    </div>
  );
}

"use client";

import { MarketShareChart } from "@/components/charts/MarketShareChart";

interface Landlord {
  name: string;
  units: number;
  share: number;
}

export function NeighborhoodCharts({
  neighborhoodName,
  topLandlords,
}: {
  neighborhoodName: string;
  topLandlords: Landlord[];
}) {
  const chartData = topLandlords.map((l) => ({
    company: l.name,
    share: l.share,
  }));

  return (
    <div className="card">
      <MarketShareChart
        data={chartData}
        title={`Top Landlords in ${neighborhoodName}`}
        year={2024}
      />
    </div>
  );
}

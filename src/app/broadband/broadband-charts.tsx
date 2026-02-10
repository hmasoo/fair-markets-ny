"use client";

import { ConcentrationSection } from "@/components/charts/ConcentrationSection";

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

export function BroadbandCharts({
  timeSeriesData,
  marketShareData,
  marketShareYear,
  hhi,
  cr4,
}: {
  timeSeriesData: YearData[];
  marketShareData: MarketShareEntry[];
  marketShareYear: number;
  hhi: number;
  cr4: number;
}) {
  return (
    <ConcentrationSection
      sectorName="Broadband Internet Access"
      geography="New York State"
      timeSeriesData={timeSeriesData}
      marketShareData={marketShareData}
      marketShareYear={marketShareYear}
      hhi={hhi}
      cr4={cr4}
      source="FCC Broadband Data Collection (BDC), ISP 10-K filings"
      notes="HHI has remained above 3,000 for a decade, firmly in 'highly concentrated' territory. T-Mobile's fixed wireless service has provided marginal competition since 2021."
    />
  );
}

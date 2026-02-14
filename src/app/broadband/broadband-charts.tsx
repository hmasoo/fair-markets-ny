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
      sectorName="Statewide ISP market share"
      geography="New York State"
      timeSeriesData={timeSeriesData}
      marketShareData={marketShareData}
      marketShareYear={marketShareYear}
      hhi={hhi}
      cr4={cr4}
      source="FCC Broadband Data Collection (BDC), ISP 10-K filings"
      notes="Four ISPs have controlled nearly 90% of the market for over a decade. T-Mobile's fixed wireless service has provided marginal competition since 2021, but most households still choose between one or two wired options."
    />
  );
}

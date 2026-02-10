"use client";

import { useState } from "react";
import { ConcentrationTimeSeries } from "./ConcentrationTimeSeries";
import { MarketShareChart } from "./MarketShareChart";

interface YearData {
  year: number;
  hhi?: number;
  cr4?: number;
}

interface MarketShareEntry {
  company: string;
  share: number;
  source?: string;
}

interface ConcentrationSectionProps {
  sectorName: string;
  geography: string;
  timeSeriesData: YearData[];
  marketShareData: MarketShareEntry[];
  marketShareYear: number;
  hhi?: number;
  cr4?: number;
  source?: string;
  notes?: string;
}

export function ConcentrationSection({
  sectorName,
  geography,
  timeSeriesData,
  marketShareData,
  marketShareYear,
  hhi,
  cr4,
  source,
  notes,
}: ConcentrationSectionProps) {
  const [tab, setTab] = useState<"hhi" | "marketShare">("hhi");

  return (
    <div className="card" key={`${sectorName}-${geography}-${tab}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-fm-patina">{sectorName}</h2>
          <p className="text-sm text-fm-sage">{geography}</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab("hhi")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "hhi"
                ? "bg-white text-fm-patina shadow-sm"
                : "text-fm-sage hover:text-fm-patina"
            }`}
          >
            Concentration (HHI)
          </button>
          <button
            onClick={() => setTab("marketShare")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "marketShare"
                ? "bg-white text-fm-patina shadow-sm"
                : "text-fm-sage hover:text-fm-patina"
            }`}
          >
            Market Shares
          </button>
        </div>
      </div>

      {/* Summary stats */}
      {(hhi || cr4) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {hhi && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-fm-sage uppercase tracking-wider">HHI</div>
              <div className="text-2xl font-bold text-fm-patina">{hhi.toLocaleString()}</div>
              <div className="text-xs text-fm-sage">
                {hhi > 2500
                  ? "Highly Concentrated"
                  : hhi > 1500
                  ? "Moderately Concentrated"
                  : "Competitive"}
              </div>
            </div>
          )}
          {cr4 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-fm-sage uppercase tracking-wider">CR4</div>
              <div className="text-2xl font-bold text-fm-patina">{cr4}%</div>
              <div className="text-xs text-fm-sage">Top 4 firms</div>
            </div>
          )}
        </div>
      )}

      {tab === "hhi" ? (
        <ConcentrationTimeSeries data={timeSeriesData} metric="hhi" />
      ) : (
        <MarketShareChart
          data={marketShareData}
          title="Market Share by Company"
          year={marketShareYear}
        />
      )}

      {(source || notes) && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-fm-sage">
          {source && <p>Source: {source}</p>}
          {notes && <p className="mt-1">{notes}</p>}
        </div>
      )}
    </div>
  );
}

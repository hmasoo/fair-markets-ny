import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { HHITooltip } from "@/components/ui/HHITooltip";
import { getHHITextClass } from "@/lib/colorScales";
import dynamic from "next/dynamic";

const RegionalConcentrationChart = dynamic(
  () => import("./healthcare-charts").then((m) => m.RegionalConcentrationChart),
);
const StatewideCharts = dynamic(
  () => import("./healthcare-charts").then((m) => m.StatewideCharts),
);

import timeSeriesData from "../../../data/concentration/healthcare-nys.json";
import marketShareData from "../../../data/concentration/healthcare-nys-market-shares.json";
import regionData from "../../../data/concentration/healthcare-regions.json";

export const metadata: Metadata = {
  title: "Your Doctor's Boss — Healthcare Consolidation",
  description:
    "Hospital system consolidation across New York State — tracking mergers, bed counts, and regional concentration using DOH and AHA data.",
};

export default function HealthcarePage() {
  const { regions } = regionData;
  const sorted = [...regions].sort((a, b) => b.hhi - a.hhi);
  const highestHHI = sorted[0];
  const highestCR4 = [...regions].sort((a, b) => b.cr4 - a.cr4)[0];
  const totalSystems = new Set(
    regions.flatMap((r) => r.topSystems.map((s) => s.name))
  ).size;
  const singleDominantRegions = regions.filter(
    (r) => r.topSystems[0] && r.topSystems[0].share >= 40
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Healthcare" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">
          Your Doctor{"'"}s Boss
        </h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          Statewide, New York{"'"}s hospital market looks moderately
          concentrated (<HHITooltip>HHI</HHITooltip>{" "}
          {timeSeriesData.years[timeSeriesData.years.length - 1].hhi.toLocaleString()}).
          But zoom into individual regions and the picture is stark — most of
          upstate New York is a one- or two-system market where a single health
          network controls 40–60% of all hospital beds.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className={`text-3xl font-bold ${getHHITextClass(highestHHI.hhi)}`}>
            {highestHHI.hhi.toLocaleString()}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            Highest Regional <HHITooltip>HHI</HHITooltip>
          </div>
          <div className="text-xs text-fm-sage">{highestHHI.name}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {highestCR4.cr4}%
          </div>
          <div className="text-sm text-fm-sage mt-1">
            Highest CR4 (Top 4 Systems)
          </div>
          <div className="text-xs text-fm-sage">{highestCR4.name}</div>
          <div className={`text-xs mt-1 font-medium ${getHHITextClass(highestCR4.hhi)}`}>
            ~{Math.round(highestCR4.cr4)} in every 100 beds
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {totalSystems}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            Named Health Systems
          </div>
          <div className="text-xs text-fm-sage">Across 10 regions</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {singleDominantRegions.length}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            Single-Dominant Regions
          </div>
          <div className="text-xs text-fm-sage">
            One system holds 40%+ of beds
          </div>
        </div>
      </div>

      {/* Regional bar chart */}
      <RegionalConcentrationChart regions={regions} />

      {/* Region detail table */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-4">
          All Regions
        </h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Region
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Beds
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Facilities
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  <HHITooltip>HHI</HHITooltip>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  CR4 (Top 4)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Top System
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((r) => (
                <tr
                  key={r.slug}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/healthcare/${r.slug}`}
                      className="text-fm-teal hover:underline font-medium"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {r.totalBeds.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {r.totalFacilities}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <Badge
                      variant={
                        r.hhi > 2500
                          ? "red"
                          : r.hhi > 1500
                          ? "yellow"
                          : "green"
                      }
                    >
                      {r.hhi.toLocaleString()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {r.cr4}%
                    <div className="text-xs font-normal text-fm-sage">
                      ~{Math.round(r.cr4)} in 100 beds
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-fm-sage">
                    {r.topSystems[0]?.name} ({r.topSystems[0]?.share}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-fm-sage">
          Source: NYS DOH SPARCS hospital discharge data; AHA Annual Survey;
          NYS CON filings; health system disclosures. Bed counts reflect
          licensed acute-care beds.
        </p>
      </div>

      {/* Statewide trend charts */}
      <div className="mt-8">
        <StatewideCharts
          timeSeriesData={timeSeriesData.years}
          marketShareData={marketShareData.marketShares.filter(
            (s) => s.company !== "All other systems"
          )}
          marketShareYear={marketShareData.year}
        />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import {
  NeighborhoodConcentrationChart,
  ViolationsVsConcentrationChart,
  CitywideCharts,
} from "./housing-charts";
import { HousingNTAMap } from "./HousingNTAMap";

import timeSeriesData from "../../../data/concentration/housing-nyc.json";
import marketShareData from "../../../data/concentration/housing-nyc-market-shares.json";
import neighborhoodData from "../../../data/concentration/housing-neighborhoods.json";

export const metadata: Metadata = {
  title: "The New Landlords — Housing Concentration",
  description:
    "Mapping residential ownership concentration across NYC neighborhoods using ACRIS, PLUTO, and Local Law 18 data.",
};

export default function HousingPage() {
  const { neighborhoods } = neighborhoodData;
  const sorted = [...neighborhoods].sort((a, b) => b.hhi - a.hhi);
  const highestHHI = sorted[0];
  const highestCR4 = [...neighborhoods].sort((a, b) => b.cr4 - a.cr4)[0];
  const highestViolations = [...neighborhoods].sort(
    (a, b) => b.hpdViolationsPerUnit - a.hpdViolationsPerUnit
  )[0];

  // Build NTA-keyed data for the choropleth map
  // Each NTA code in a neighborhood gets that neighborhood's HHI
  const ntaHHI: Record<string, number> = {};
  const ntaDetails: Record<string, { name: string; slug: string; hhi: number; cr4: number; totalUnits: number }> = {};
  for (const n of neighborhoods) {
    for (const ntaCode of n.ntaCodes) {
      ntaHHI[ntaCode] = n.hhi;
      ntaDetails[ntaCode] = {
        name: n.name,
        slug: n.slug,
        hhi: n.hhi,
        cr4: n.cr4,
        totalUnits: n.totalUnits,
      };
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Housing" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">The New Landlords</h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          Citywide, NYC{"'"}s rental market looks fragmented (HHI 228 across
          ~30,000 landlords). Zoom into neighborhoods and the picture changes
          dramatically — a handful of landlords dominate entire communities.
        </p>
      </div>

      {/* Geographic stats — the real story */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {highestHHI.hhi.toLocaleString()}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            Highest Neighborhood HHI
          </div>
          <div className="text-xs text-fm-sage">{highestHHI.name}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {highestCR4.cr4}%
          </div>
          <div className="text-sm text-fm-sage mt-1">
            Highest CR4 (Top 4 Landlords)
          </div>
          <div className="text-xs text-fm-sage">{highestCR4.name}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {highestViolations.hpdViolationsPerUnit}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            Worst HPD Violations/Unit
          </div>
          <div className="text-xs text-fm-sage">{highestViolations.name}</div>
        </div>
      </div>

      {/* NTA-level concentration map */}
      <div className="card">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          Housing Concentration by Neighborhood
        </h2>
        <p className="text-sm text-fm-sage mb-4">
          Ownership concentration (HHI) across NYC{"'"}s 2020 Neighborhood
          Tabulation Areas. Colored NTAs have data; click to explore.
        </p>
        <HousingNTAMap data={ntaHHI} details={ntaDetails} />
      </div>

      {/* Primary chart: neighborhood HHI comparison */}
      <div className="mt-8">
        <NeighborhoodConcentrationChart neighborhoods={neighborhoods} />
      </div>

      {/* Scatter: violations vs concentration */}
      <div className="mt-8">
        <ViolationsVsConcentrationChart neighborhoods={neighborhoods} />
      </div>

      {/* Neighborhood detail table */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-4">
          All Neighborhoods
        </h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Neighborhood
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Borough
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Units
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  HHI
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  CR4
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Violations/Unit
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Median Rent
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((n) => (
                <tr
                  key={n.slug}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/housing/${n.slug}`}
                      className="text-fm-teal hover:underline font-medium"
                    >
                      {n.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-fm-sage">
                    {n.borough}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {n.totalUnits.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <Badge
                      variant={
                        n.hhi > 2500
                          ? "red"
                          : n.hhi > 1500
                          ? "yellow"
                          : "green"
                      }
                    >
                      {n.hhi.toLocaleString()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {n.cr4}%
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {n.hpdViolationsPerUnit}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    ${n.medianRent.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-fm-sage">
          Source: ACRIS/PLUTO analysis; Local Law 18 beneficial ownership
          filings; HPD violations data via NYC Open Data.
        </p>
      </div>

      {/* Secondary: citywide trend (demoted) */}
      <div className="mt-8">
        <CitywideCharts
          timeSeriesData={timeSeriesData.years}
          marketShareData={marketShareData.marketShares.filter(
            (s) => s.company !== "All other landlords"
          )}
          marketShareYear={marketShareData.year}
        />
      </div>
    </div>
  );
}

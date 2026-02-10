import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { BroadbandCharts } from "./broadband-charts";
import { NYSCountyMap } from "@/components/maps/NYSCountyMap";

import timeSeriesData from "../../../data/concentration/broadband-nys.json";
import marketShareData from "../../../data/concentration/broadband-nys-market-shares.json";
import countyData from "../../../data/concentration/broadband-counties.json";

export const metadata: Metadata = {
  title: "One Wire — Broadband Competition",
  description:
    "How many real choices do you have for internet? FCC data reveals a broadband duopoly across most of New York State.",
};

export default function BroadbandPage() {
  const { counties } = countyData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Broadband" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">One Wire</h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          How many real internet choices do you have? FCC Broadband Data
          Collection reveals a duopoly across most of New York State, with large
          rural areas served by only one wired provider.
        </p>
      </div>

      {/* Key findings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">3,250</div>
          <div className="text-sm text-fm-sage mt-1">Statewide HHI</div>
          <div className="text-xs text-fm-sage">
            Highly concentrated (&gt;2,500)
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">87.9%</div>
          <div className="text-sm text-fm-sage mt-1">CR4 (Statewide)</div>
          <div className="text-xs text-fm-sage">
            Top 4 ISPs control nearly all subscriptions
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">$1B</div>
          <div className="text-sm text-fm-sage mt-1">ConnectALL Investment</div>
          <div className="text-xs text-fm-sage">
            Hochul&apos;s public broadband commitment
          </div>
        </div>
      </div>

      {/* State map */}
      <NYSCountyMap countyData={counties} />

      {/* Charts */}
      <div className="mt-8">
        <BroadbandCharts
        timeSeriesData={timeSeriesData.years}
        marketShareData={marketShareData.marketShares}
        marketShareYear={marketShareData.year}
        hhi={marketShareData.hhi}
        cr4={marketShareData.cr4}
      />
      </div>

      {/* County table */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-4">
          Competition by County
        </h2>
        <p className="text-sm text-fm-sage mb-4">
          Rural upstate counties face near-monopoly conditions, with some having
          15%+ of census blocks with zero broadband providers at 100 Mbps.
        </p>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  County
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Households
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  100+ Mbps Providers
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  HHI
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Zero-Provider Blocks
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  One-Provider Blocks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {counties
                .sort((a, b) => b.hhi - a.hhi)
                .map((c) => (
                  <tr
                    key={c.slug}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/broadband/${c.slug}`}
                        className="text-fm-teal hover:underline font-medium"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {c.totalHouseholds.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {c.providersAt100Mbps}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <Badge
                        variant={
                          c.hhi > 5000
                            ? "red"
                            : c.hhi > 2500
                            ? "yellow"
                            : "green"
                        }
                      >
                        {c.hhi.toLocaleString()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {c.zeroPctBlocks}%
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {c.onePctBlocks}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-fm-sage">
          Source: FCC Broadband Data Collection (BDC), December 2024 filing.
          Providers counted at 100+ Mbps download threshold.
        </p>
      </div>
    </div>
  );
}

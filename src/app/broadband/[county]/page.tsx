import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import dynamic from "next/dynamic";

const CountyCharts = dynamic(
  () => import("./county-charts").then((m) => m.CountyCharts),
);

import countyData from "../../../../data/concentration/broadband-counties.json";
import nycMeshData from "../../../../data/concentration/nycmesh-nodes.json";
import { CommunityBroadbandNote } from "./CommunityBroadbandNote";

interface Props {
  params: Promise<{ county: string }>;
}

export async function generateStaticParams() {
  return countyData.counties.map((c) => ({
    county: c.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { county: slug } = await params;
  const c = countyData.counties.find((c) => c.slug === slug);
  if (!c) return { title: "Not Found" };
  return {
    title: `${c.name} — Broadband Availability`,
    description: `Internet choices in ${c.name}: ${c.providersAt100Mbps} providers at 100+ Mbps, ${c.zeroPctBlocks}% of blocks with no broadband option.`,
  };
}

function getHHILabel(hhi: number): string {
  if (hhi > 5000) return "Near-Monopoly";
  if (hhi > 2500) return "Highly Concentrated";
  return "Moderate";
}

export default async function CountyPage({ params }: Props) {
  const { county: slug } = await params;
  const county = countyData.counties.find((c) => c.slug === slug);

  if (!county) notFound();

  // Determine the dominant provider
  const topProvider = county.topProviders[0];
  const noChoicePct = county.zeroPctBlocks + county.onePctBlocks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Broadband", href: "/broadband" },
          { label: county.name },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">{county.name}</h1>
        <p className="mt-1 text-fm-sage">
          {county.totalHouseholds.toLocaleString()} households
        </p>
      </div>

      {/* Stats — lead with coverage gaps and choices */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="card text-center">
          <div className={`text-2xl font-bold ${county.zeroPctBlocks >= 10 ? "text-red-600" : "text-fm-patina"}`}>
            {county.zeroPctBlocks}%
          </div>
          <div className="text-xs text-fm-sage mt-1">
            of blocks with no broadband
          </div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-copper">
            {noChoicePct}%
          </div>
          <div className="text-xs text-fm-sage mt-1">
            with zero or one provider
          </div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-patina">
            {county.providersAt100Mbps}
          </div>
          <div className="text-xs text-fm-sage mt-1">
            providers at 100+ Mbps
          </div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-copper">
            {topProvider.share}%
          </div>
          <div className="text-xs text-fm-sage mt-1">
            market share ({topProvider.name})
          </div>
        </div>
      </div>

      {/* Collapsible technical details */}
      <details className="mb-8 text-sm">
        <summary className="text-fm-sage cursor-pointer hover:text-fm-patina font-medium">
          Technical metrics (for researchers)
        </summary>
        <div className="mt-2 pl-4 border-l-2 border-gray-200 space-y-1 text-fm-sage">
          <p>
            HHI: <strong className="text-fm-patina">{county.hhi.toLocaleString()}</strong> — {getHHILabel(county.hhi)}
          </p>
          <p>
            One-provider blocks: <strong className="text-fm-patina">{county.onePctBlocks}%</strong>
          </p>
        </div>
      </details>

      {/* Provider chart */}
      <CountyCharts
        countyName={county.name}
        topProviders={county.topProviders}
      />

      {/* Provider table */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-4">
          ISP Availability in {county.name}
        </h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Market Share
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Max Download (Mbps)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {county.topProviders.map((provider) => (
                <tr
                  key={provider.name}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-fm-patina">
                    {provider.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {provider.share}%
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {provider.maxDownload >= 100 ? (
                      <span className="text-green-700">
                        {provider.maxDownload.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-red-600">
                        {provider.maxDownload} (below 100 Mbps)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-fm-sage">
          Source: FCC Broadband Data Collection (BDC), December 2024 filing.
        </p>
      </div>

      {/* NYC Mesh note for NYC boroughs only */}
      {(() => {
        const meshBorough = nycMeshData.boroughs.find(
          (b) => b.slug === county.slug,
        );
        return meshBorough ? (
          <CommunityBroadbandNote
            boroughName={county.name}
            data={meshBorough}
          />
        ) : null;
      })()}
    </div>
  );
}

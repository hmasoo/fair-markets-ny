import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import dynamic from "next/dynamic";

const RegionCharts = dynamic(
  () => import("./region-charts").then((m) => m.RegionCharts),
);
const RegionPricingTable = dynamic(
  () => import("../pricing-charts").then((m) => m.RegionPricingTable),
);
const RegionLocatorMap = dynamic(
  () => import("./RegionLocatorMap").then((m) => m.RegionLocatorMap),
);

import regionData from "../../../../data/concentration/healthcare-regions.json";
import pricingData from "../../../../data/concentration/healthcare-pricing.json";

interface Props {
  params: Promise<{ region: string }>;
}

export async function generateStaticParams() {
  return regionData.regions.map((r) => ({
    region: r.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: slug } = await params;
  const r = regionData.regions.find((r) => r.slug === slug);
  if (!r) return { title: "Not Found" };
  const topSystem = r.topSystems[0];
  return {
    title: `${r.name} — Hospital Systems`,
    description: `Hospital systems in ${r.name}: ${r.totalBeds.toLocaleString()} beds across ${r.totalFacilities} facilities. ${topSystem?.name} holds ${topSystem?.share}% of beds.`,
  };
}

function getHHILabel(hhi: number): string {
  if (hhi > 2500) return "Highly Concentrated";
  if (hhi > 1500) return "Moderately Concentrated";
  return "Competitive";
}

export default async function RegionPage({ params }: Props) {
  const { region: slug } = await params;
  const region = regionData.regions.find((r) => r.slug === slug);

  if (!region) notFound();

  const topSystem = region.topSystems[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Healthcare", href: "/healthcare" },
          { label: region.name },
        ]}
      />

      <div className="mb-8 flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-fm-patina">{region.name}</h1>
          <p className="mt-1 text-fm-sage">
            {region.totalFacilities} hospital facilities &middot;{" "}
            {region.totalBeds.toLocaleString()} licensed beds
          </p>
        </div>
        <RegionLocatorMap regionSlug={slug} name={region.name} />
      </div>

      {/* Stats — lead with dominant system */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="card text-center">
          <div className={`text-2xl font-bold ${(topSystem?.share ?? 0) >= 50 ? "text-red-600" : "text-fm-copper"}`}>
            {topSystem?.share}%
          </div>
          <div className="text-xs text-fm-sage mt-1">
            of beds ({topSystem?.name})
          </div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-copper">
            {region.cr4}%
          </div>
          <div className="text-xs text-fm-sage mt-1">
            held by top 4 systems
          </div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-patina">
            {region.totalBeds.toLocaleString()}
          </div>
          <div className="text-xs text-fm-sage mt-1">Licensed Beds</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-patina">
            {region.totalFacilities}
          </div>
          <div className="text-xs text-fm-sage mt-1">Facilities</div>
        </div>
      </div>

      {/* Collapsible technical details */}
      <details className="mb-8 text-sm">
        <summary className="text-fm-sage cursor-pointer hover:text-fm-patina font-medium">
          Technical metrics (for researchers)
        </summary>
        <div className="mt-2 pl-4 border-l-2 border-gray-200 space-y-1 text-fm-sage">
          <p>
            HHI: <strong className="text-fm-patina">{region.hhi.toLocaleString()}</strong> — {getHHILabel(region.hhi)}
          </p>
          <p>
            CR4: <strong className="text-fm-patina">{region.cr4}%</strong> — the top 4 systems{"'"} combined bed share
          </p>
        </div>
      </details>

      {/* Market share chart */}
      <RegionCharts
        regionName={region.name}
        topSystems={region.topSystems}
      />

      {/* Hospital pricing comparison */}
      <div className="mt-8">
        <RegionPricingTable
          procedures={pricingData.procedures}
          regionSlug={slug}
          dominantSystem={topSystem?.name}
        />
      </div>

      {/* System detail table */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-4">
          Health Systems in {region.name}
        </h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Health System
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Beds
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Facilities
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Market Share
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {region.topSystems.map((system) => (
                <tr
                  key={system.name}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-fm-patina">
                    {system.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {system.beds.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {system.facilities}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {system.share}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-fm-sage">
          Source: NYS DOH SPARCS; AHA Annual Survey; health system disclosures.
          Bed counts reflect licensed acute-care hospital beds.
        </p>
      </div>
    </div>
  );
}

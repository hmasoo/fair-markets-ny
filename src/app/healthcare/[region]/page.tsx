import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { getHHITextClass } from "@/lib/colorScales";
import { RegionCharts } from "./region-charts";

import regionData from "../../../../data/concentration/healthcare-regions.json";

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
  return {
    title: `${r.name} — Healthcare Concentration`,
    description: `Hospital concentration in ${r.name}: ${r.totalBeds.toLocaleString()} beds across ${r.totalFacilities} facilities, HHI ${r.hhi}.`,
  };
}

export default async function RegionPage({ params }: Props) {
  const { region: slug } = await params;
  const region = regionData.regions.find((r) => r.slug === slug);

  if (!region) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Healthcare", href: "/healthcare" },
          { label: region.name },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">{region.name}</h1>
        <p className="mt-1 text-fm-sage">
          {region.totalFacilities} hospital facilities &middot;{" "}
          {region.totalBeds.toLocaleString()} licensed beds
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-patina">
            {region.totalBeds.toLocaleString()}
          </div>
          <div className="text-xs text-fm-sage mt-1">Licensed Beds</div>
        </div>
        <div className="card text-center">
          <div className={`text-2xl font-bold ${getHHITextClass(region.hhi)}`}>
            {region.hhi.toLocaleString()}
          </div>
          <div className="text-xs text-fm-sage mt-1">HHI</div>
          <Badge
            variant={
              region.hhi > 2500
                ? "red"
                : region.hhi > 1500
                ? "yellow"
                : "green"
            }
          >
            {region.hhi > 2500
              ? "Highly Concentrated"
              : region.hhi > 1500
              ? "Moderate"
              : "Competitive"}
          </Badge>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-copper">
            {region.cr4}%
          </div>
          <div className="text-xs text-fm-sage mt-1">CR4 (Top 4 Systems)</div>
          <div className="text-xs text-fm-sage">
            ~{Math.round(region.cr4)} in 100 beds
          </div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-patina">
            {region.totalFacilities}
          </div>
          <div className="text-xs text-fm-sage mt-1">Facilities</div>
        </div>
      </div>

      {/* Market share chart */}
      <RegionCharts
        regionName={region.name}
        topSystems={region.topSystems}
      />

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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { NeighborhoodCharts } from "./neighborhood-charts";

import neighborhoodData from "../../../../data/concentration/housing-neighborhoods.json";

interface Props {
  params: Promise<{ neighborhood: string }>;
}

export async function generateStaticParams() {
  return neighborhoodData.neighborhoods.map((n) => ({
    neighborhood: n.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { neighborhood: slug } = await params;
  const n = neighborhoodData.neighborhoods.find((n) => n.slug === slug);
  if (!n) return { title: "Not Found" };
  return {
    title: `${n.name} — Landlord Concentration`,
    description: `Top landlords, ownership concentration (HHI: ${n.hhi}), and HPD violations data for ${n.name}, ${n.borough}.`,
  };
}

export default async function NeighborhoodPage({ params }: Props) {
  const { neighborhood: slug } = await params;
  const neighborhood = neighborhoodData.neighborhoods.find(
    (n) => n.slug === slug
  );

  if (!neighborhood) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Housing", href: "/housing" },
          { label: neighborhood.name },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">{neighborhood.name}</h1>
        <p className="mt-1 text-fm-sage">{neighborhood.borough}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-patina">
            {neighborhood.totalUnits.toLocaleString()}
          </div>
          <div className="text-xs text-fm-sage mt-1">Rental Units</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-copper">
            {neighborhood.hhi.toLocaleString()}
          </div>
          <div className="text-xs text-fm-sage mt-1">HHI (Concentration)</div>
          <Badge
            variant={
              neighborhood.hhi > 2500
                ? "red"
                : neighborhood.hhi > 1500
                ? "yellow"
                : "green"
            }
          >
            {neighborhood.hhi > 2500
              ? "Highly Concentrated"
              : neighborhood.hhi > 1500
              ? "Moderately Concentrated"
              : "Competitive"}
          </Badge>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-patina">
            {neighborhood.cr4}%
          </div>
          <div className="text-xs text-fm-sage mt-1">CR4 (Top 4 Landlords)</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-patina">
            {neighborhood.hpdViolationsPerUnit}
          </div>
          <div className="text-xs text-fm-sage mt-1">HPD Violations/Unit</div>
        </div>
        {neighborhood.medianIncome && (
          <div className="card text-center">
            <div className="text-2xl font-bold text-fm-copper">
              ${neighborhood.medianIncome.toLocaleString()}
            </div>
            <div className="text-xs text-fm-sage mt-1">
              Median Household Income
            </div>
          </div>
        )}
        {neighborhood.rentBurdenPct && (
          <div className="card text-center">
            <div
              className={`text-2xl font-bold ${
                neighborhood.rentBurdenPct >= 50
                  ? "text-red-600"
                  : "text-fm-copper"
              }`}
            >
              {neighborhood.rentBurdenPct}%
            </div>
            <div className="text-xs text-fm-sage mt-1">Rent-Burdened</div>
            <div className="text-xs text-fm-sage">
              (paying &ge;30% of income)
            </div>
          </div>
        )}
      </div>

      {/* Market share chart */}
      <NeighborhoodCharts
        neighborhoodName={neighborhood.name}
        topLandlords={neighborhood.topLandlords}
      />

      {/* Landlord detail table */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-4">
          Top Landlords in {neighborhood.name}
        </h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Landlord
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Units
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Market Share
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {neighborhood.topLandlords.map((landlord) => (
                <tr
                  key={landlord.name}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-fm-patina">
                    {landlord.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {landlord.units.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {landlord.share}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-fm-sage space-y-1">
          <p>
            Median rent in {neighborhood.name}: $
            {neighborhood.medianRent.toLocaleString()}/month
          </p>
          {neighborhood.medianIncome && (
            <p>
              Median household income: $
              {neighborhood.medianIncome.toLocaleString()}/year — rent-to-income
              ratio:{" "}
              {(
                ((neighborhood.medianRent * 12) / neighborhood.medianIncome) *
                100
              ).toFixed(0)}
              %
            </p>
          )}
        </div>
        <p className="mt-2 text-xs text-fm-sage">
          Source: ACRIS/PLUTO analysis; Local Law 18 beneficial ownership
          filings; HPD violations data via NYC Open Data. Income data from U.S.
          Census Bureau ACS 2023 5-Year Estimates.
        </p>
      </div>
    </div>
  );
}

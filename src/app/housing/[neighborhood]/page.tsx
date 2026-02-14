import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import dynamic from "next/dynamic";

const NeighborhoodCharts = dynamic(
  () => import("./neighborhood-charts").then((m) => m.NeighborhoodCharts),
);

import neighborhoodDataRaw from "../../../../data/concentration/housing-neighborhoods.json";
import rentHistoryRaw from "../../../../data/concentration/rent-history-neighborhoods.json";

interface Neighborhood {
  name: string;
  slug: string;
  borough: string;
  fips: string;
  ntaCodes: string[];
  totalUnits: number;
  hhi: number;
  cr4: number;
  topLandlords: { name: string; units: number; share: number }[];
  nychaUnits: number;
  nychaShare: number;
  universityUnits: number;
  universityShare: number;
  topUniversity: string | null;
  hpdViolationsPerUnit: number;
  stabilizedUnits: number;
  stabilizedShare: number;
  medianRent: number;
  medianIncome: number | null;
  rentBurdenPct: number | null;
}

const neighborhoodData = neighborhoodDataRaw as {
  sector: string;
  geography: string;
  ntaVersion: string;
  source: string;
  incomeSource: string;
  neighborhoods: Neighborhood[];
};

interface RentHistoryNeighborhood {
  slug: string;
  rentHistory: { year: number; medianRent: number }[];
  rentGrowthPct: number | null;
}

const rentHistoryData = rentHistoryRaw as {
  neighborhoods: RentHistoryNeighborhood[];
};

const rentHistoryBySlug = new Map<string, RentHistoryNeighborhood>();
for (const n of rentHistoryData.neighborhoods) {
  rentHistoryBySlug.set(n.slug, n);
}

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
    title: `${n.name} — Rental Ownership Data`,
    description: `Rent, income, landlords, and housing violations data for ${n.name}, ${n.borough}. Top 4 landlords own ${n.cr4}% of rentals.`,
  };
}

function getHHILabel(hhi: number): string {
  if (hhi > 2500) return "Highly Concentrated";
  if (hhi > 1500) return "Moderately Concentrated";
  return "Competitive";
}

export default async function NeighborhoodPage({ params }: Props) {
  const { neighborhood: slug } = await params;
  const neighborhood = neighborhoodData.neighborhoods.find(
    (n) => n.slug === slug
  );

  if (!neighborhood) notFound();

  const topLandlordName = neighborhood.topLandlords[0]?.name;
  const rentHistory = rentHistoryBySlug.get(slug);
  const rentGrowthPct = rentHistory?.rentGrowthPct ?? null;
  const rent2019 = rentHistory?.rentHistory.find((r) => r.year === 2019)?.medianRent;
  const rent2023 = rentHistory?.rentHistory.find((r) => r.year === 2023)?.medianRent;

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

      {/* Stats — lead with income/rent/burden */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
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
        {neighborhood.medianRent > 0 && (
          <div className="card text-center">
            <div className="text-2xl font-bold text-fm-patina">
              ${neighborhood.medianRent.toLocaleString()}
            </div>
            <div className="text-xs text-fm-sage mt-1">Median Rent</div>
          </div>
        )}
        {rentGrowthPct !== null && rent2019 && rent2023 && (
          <div className="card text-center">
            <div className={`text-2xl font-bold ${rentGrowthPct > 0 ? "text-fm-copper" : "text-fm-teal"}`}>
              {rentGrowthPct > 0 ? "+" : ""}{rentGrowthPct}%
            </div>
            <div className="text-xs text-fm-sage mt-1">
              Rent Growth 2019{"\u2013"}2023
            </div>
            <div className="text-xs text-fm-sage">
              ${rent2019.toLocaleString()} {"\u2192"} ${rent2023.toLocaleString()}
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
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-patina">
            {neighborhood.hpdViolationsPerUnit > 0
              ? neighborhood.hpdViolationsPerUnit
              : "\u2014"}
          </div>
          <div className="text-xs text-fm-sage mt-1">HPD Violations/Unit</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-patina">
            {neighborhood.totalUnits.toLocaleString()}
          </div>
          <div className="text-xs text-fm-sage mt-1">Rental Units</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-fm-copper">
            {neighborhood.cr4}%
          </div>
          <div className="text-xs text-fm-sage mt-1">
            owned by the top 4 landlords
          </div>
          {topLandlordName && (
            <div className="text-xs text-fm-sage mt-1">
              Largest: {topLandlordName}
            </div>
          )}
        </div>
        {neighborhood.nychaUnits > 0 && (
          <div className="card text-center border-fm-patina/30 bg-fm-patina/5">
            <div className="text-2xl font-bold text-fm-patina">
              {neighborhood.nychaUnits.toLocaleString()}
            </div>
            <div className="text-xs text-fm-sage mt-1">
              NYCHA Units — {neighborhood.nychaShare}% of housing stock
            </div>
          </div>
        )}
        {neighborhood.universityUnits > 0 && (
          <div className="card text-center border-fm-copper/30 bg-fm-copper/5">
            <div className="text-2xl font-bold text-fm-copper">
              {neighborhood.universityUnits.toLocaleString()}
            </div>
            <div className="text-xs text-fm-sage mt-1">
              University-Owned Units — {neighborhood.universityShare}% of housing stock
            </div>
            {neighborhood.topUniversity && (
              <div className="text-xs text-fm-copper mt-1">
                {neighborhood.topUniversity}
              </div>
            )}
          </div>
        )}
        {neighborhood.stabilizedUnits > 0 && (
          <div className="card text-center border-fm-teal/30 bg-fm-teal/5">
            <div className="text-2xl font-bold text-fm-teal">
              {neighborhood.stabilizedUnits.toLocaleString()}
            </div>
            <div className="text-xs text-fm-sage mt-1">
              Rent-Stabilized Units — {neighborhood.stabilizedShare}% of housing stock
            </div>
          </div>
        )}
      </div>

      {/* Collapsible technical details */}
      <details className="mb-8 text-sm">
        <summary className="text-fm-sage cursor-pointer hover:text-fm-patina font-medium">
          Technical metrics (for researchers)
        </summary>
        <div className="mt-2 pl-4 border-l-2 border-gray-200 space-y-1 text-fm-sage">
          <p>
            HHI: <strong className="text-fm-patina">{neighborhood.hhi.toLocaleString()}</strong> — {getHHILabel(neighborhood.hhi)}
          </p>
          <p>
            CR4: <strong className="text-fm-patina">{neighborhood.cr4}%</strong> — the top 4 landlords{"'"} combined share
          </p>
        </div>
      </details>

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
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Concentration
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
                  <td className="px-4 py-3 text-sm text-right text-fm-sage">
                    ~1 in {Math.round(100 / landlord.share)} units
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-fm-sage">
          Source: NYC Dept. of City Planning MapPLUTO 24v4; ACRIS ownership
          records; HPD violations data via NYC Open Data. Income, median rent,
          and rent burden from U.S. Census Bureau ACS 5-Year Estimates (2019, 2023).
        </p>
      </div>
    </div>
  );
}

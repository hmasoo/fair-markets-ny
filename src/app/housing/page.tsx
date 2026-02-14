import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import dynamic from "next/dynamic";

const NeighborhoodConcentrationChart = dynamic(
  () => import("./housing-charts").then((m) => m.NeighborhoodConcentrationChart),
);
const NeighborhoodExplorerChart = dynamic(
  () => import("./housing-charts").then((m) => m.NeighborhoodExplorerChart),
);
const CitywideCharts = dynamic(
  () => import("./housing-charts").then((m) => m.CitywideCharts),
);
import { HousingMapSection } from "./HousingMapSection";
import { HousingTable } from "./HousingTable";
import { getCR4TextClass } from "@/lib/colorScales";
import { aggregateByBorough } from "@/lib/aggregations/housing-boroughs";

import timeSeriesData from "../../../data/concentration/housing-nyc.json";
import marketShareData from "../../../data/concentration/housing-nyc-market-shares.json";
import neighborhoodDataRaw from "../../../data/concentration/housing-neighborhoods.json";

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
  medianRent: number;
  medianIncome: number | null;
  rentBurdenPct: number | null;
}

const neighborhoodData = neighborhoodDataRaw as {
  neighborhoods: Neighborhood[];
  [key: string]: unknown;
};

export const metadata: Metadata = {
  title: "Who Owns the Apartments in Your Neighborhood?",
  description:
    "Ownership concentration, housing quality, and affordability across 197 NYC neighborhoods — data from ACRIS, PLUTO, HPD, and the Census Bureau.",
};

export default function HousingPage() {
  const { neighborhoods } = neighborhoodData;
  const highestCR4 = [...neighborhoods].sort((a, b) => b.cr4 - a.cr4)[0];
  const highestViolations = [...neighborhoods]
    .filter((n) => n.hpdViolationsPerUnit > 0)
    .sort((a, b) => b.hpdViolationsPerUnit - a.hpdViolationsPerUnit)[0];
  const lowestIncome = [...neighborhoods]
    .filter((n) => n.medianIncome && n.medianIncome > 0)
    .sort((a, b) => a.medianIncome! - b.medianIncome!)[0];
  const highestRentBurden = [...neighborhoods]
    .filter((n) => n.rentBurdenPct && n.rentBurdenPct > 0)
    .sort((a, b) => b.rentBurdenPct! - a.rentBurdenPct!)[0];

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

  // Borough-level aggregation (unit-weighted averages)
  const boroughSummaries = aggregateByBorough(neighborhoods);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Housing" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">Who owns the apartments in your neighborhood?</h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          In some NYC neighborhoods, a handful of landlords control most
          apartments. In others, ownership is spread across thousands.
          We combined city ownership records, HPD housing violations, and
          Census income data to show what{"'"}s happening in all 197
          neighborhoods — who owns the buildings, how well they{"'"}re
          maintained, and whether people can afford to live there.
        </p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {highestViolations && (
          <div className="card text-center">
            <div className="text-3xl font-bold text-fm-copper">
              {highestViolations.hpdViolationsPerUnit}
            </div>
            <div className="text-sm text-fm-sage mt-1">
              hazardous violations per apartment
            </div>
            <div className="text-xs text-fm-sage">{highestViolations.name}</div>
          </div>
        )}
        {highestRentBurden && (
          <div className="card text-center">
            <div className="text-3xl font-bold text-fm-copper">
              {highestRentBurden.rentBurdenPct}%
            </div>
            <div className="text-sm text-fm-sage mt-1">
              of income goes to rent
            </div>
            <div className="text-xs text-fm-sage">{highestRentBurden.name}</div>
          </div>
        )}
        <div className="card text-center">
          <div className={`text-3xl font-bold ${getCR4TextClass(highestCR4.cr4)}`}>
            {highestCR4.cr4}%
          </div>
          <div className="text-sm text-fm-sage mt-1">
            of apartments controlled by 4 landlords
          </div>
          <div className="text-xs text-fm-sage">{highestCR4.name}</div>
        </div>
        {lowestIncome && (
          <div className="card text-center">
            <div className="text-3xl font-bold text-fm-patina">
              ${lowestIncome.medianIncome!.toLocaleString()}
            </div>
            <div className="text-sm text-fm-sage mt-1">
              median household income
            </div>
            <div className="text-xs text-fm-sage">
              {lowestIncome.name} ({lowestIncome.rentBurdenPct}% rent-burdened)
            </div>
          </div>
        )}
      </div>

      {/* Context note on outliers */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-8 text-sm text-sky-900">
        <strong>A note on reading this data:</strong> High concentration
        doesn{"'"}t always mean bad outcomes. Stuyvesant Town (HHI 6,553) is
        entirely rent-stabilized with binding affordability commitments.
        Co-op City (HHI 4,713) is resident-governed. Parkchester{"'"}s top
        {'"'}landlord{'"'} is a condominium association. Concentration
        metrics measure ownership structure — not tenant protections, housing
        quality, or affordability.{" "}
        <a href="/about#understanding-concentration" className="text-fm-teal hover:underline">
          Learn more
        </a>
      </div>

      {/* Concentration map with NTA/Borough toggle */}
      <div className="card">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          Who owns the buildings in your neighborhood?
        </h2>
        <p className="text-sm text-fm-sage mb-4">
          Darker colors mean fewer landlords control more apartments.
          Toggle between neighborhood and borough views.
        </p>
        <HousingMapSection
          ntaHHI={ntaHHI}
          ntaDetails={ntaDetails}
          boroughSummaries={boroughSummaries}
        />
      </div>

      {/* Affordability framing */}
      {highestRentBurden && (
        <div className="card mt-8">
          <h2 className="text-xl font-bold text-fm-patina mb-2">
            Can people afford it?
          </h2>
          <p className="text-sm text-gray-700">
            Across NYC, many neighborhoods have a majority of renters spending
            more than 30% of their income on housing — the federal threshold
            for being {'"'}rent-burdened.{'"'} In {highestRentBurden.name},{" "}
            <strong>{highestRentBurden.rentBurdenPct}%</strong> of households
            cross that line. Concentration doesn{"'"}t cause high rents on its
            own, but when fewer landlords control more apartments, tenants have
            fewer options — and less leverage — when rents climb.
          </p>
        </div>
      )}

      {/* Primary chart: neighborhood HHI comparison */}
      <div className="mt-8">
        <NeighborhoodConcentrationChart neighborhoods={neighborhoods} />
      </div>

      {/* Neighborhood Explorer: toggleable scatter chart */}
      <div className="mt-8">
        <NeighborhoodExplorerChart neighborhoods={neighborhoods} />
      </div>

      {/* Neighborhood detail table */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-4">
          All neighborhoods
        </h2>
        <HousingTable neighborhoods={neighborhoods} />
        <p className="mt-4 text-xs text-fm-sage">
          Source: NYC Dept. of City Planning MapPLUTO 24v4; ACRIS ownership
          records; HPD violations data via NYC Open Data. Income and rent burden
          from U.S. Census Bureau ACS 2023 5-Year Estimates.
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

      {/* Supply-side synthesis */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-3">
          What{"'"}s driving this?
        </h2>
        <p className="text-sm text-gray-700">
          Researchers point to several contributing factors: zoning and
          permitting limits on new construction, acquisition strategies by
          larger owners, and regulatory conditions that affect landlord
          economics. The relative contribution of each is an active area of
          policy research. The most concentrated neighborhoods tend to be
          the ones where new construction is hardest to permit — though the
          causal relationship is debated.
        </p>
        <p className="mt-3 text-xs text-fm-sage">
          Further reading:{" "}
          <a
            href="https://niskanencenter.org/senate-banking-housing-testimony-2025/"
            className="text-fm-teal hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Niskanen Center Senate testimony on housing supply barriers
          </a>
        </p>
      </div>
    </div>
  );
}

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
import { HHITooltip } from "@/components/ui/HHITooltip";
import { getHHITextClass, getCR4TextClass } from "@/lib/colorScales";
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
  title: "Rental Ownership — Housing Market Data",
  description:
    "Rental ownership patterns and housing supply conditions in NYC — neighborhood-level data from ACRIS, PLUTO, and Local Law 18.",
};

export default function HousingPage() {
  const { neighborhoods } = neighborhoodData;
  const sorted = [...neighborhoods].sort((a, b) => b.hhi - a.hhi);
  const highestHHI = sorted[0];
  const highestCR4 = [...neighborhoods].sort((a, b) => b.cr4 - a.cr4)[0];
  const highestViolations = [...neighborhoods]
    .filter((n) => n.hpdViolationsPerUnit > 0)
    .sort((a, b) => b.hpdViolationsPerUnit - a.hpdViolationsPerUnit)[0];
  const lowestIncome = [...neighborhoods]
    .filter((n) => n.medianIncome && n.medianIncome > 0)
    .sort((a, b) => a.medianIncome! - b.medianIncome!)[0];
  const highestNycha = [...neighborhoods]
    .filter((n) => n.nychaShare > 0)
    .sort((a, b) => b.nychaShare - a.nychaShare)[0];

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
        <h1 className="text-3xl font-bold text-fm-patina">Rental Ownership in NYC</h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          Citywide, NYC{"'"}s rental market appears fragmented (<HHITooltip>HHI</HHITooltip> 228
          across ~30,000 landlords). At the neighborhood level, ownership is
          often significantly more concentrated. Factors including zoning
          restrictions, permitting timelines, and acquisition patterns all
          play a role. Explore the data below to see how ownership and supply
          conditions vary across neighborhoods.
        </p>
      </div>

      {/* Geographic stats — the real story */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="card text-center">
          <div className={`text-3xl font-bold ${getHHITextClass(highestHHI.hhi)}`}>
            {highestHHI.hhi.toLocaleString()}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            Highest Neighborhood <HHITooltip>HHI</HHITooltip>
          </div>
          <div className="text-xs text-fm-sage">{highestHHI.name}</div>
        </div>
        <div className="card text-center">
          <div className={`text-3xl font-bold ${getCR4TextClass(highestCR4.cr4)}`}>
            {highestCR4.cr4}%
          </div>
          <div className="text-sm text-fm-sage mt-1">
            Highest CR4 (Top 4 Landlords)
          </div>
          <div className="text-xs text-fm-sage">{highestCR4.name}</div>
          <div className={`text-xs mt-1 font-medium ${getHHITextClass(highestCR4.hhi)}`}>
            ~1 in every {Math.round(100 / highestCR4.cr4)} units
          </div>
        </div>
        {highestViolations && (
          <div className="card text-center">
            <div className="text-3xl font-bold text-fm-copper">
              {highestViolations.hpdViolationsPerUnit}
            </div>
            <div className="text-sm text-fm-sage mt-1">
              Most HPD Violations/Unit
            </div>
            <div className="text-xs text-fm-sage">{highestViolations.name}</div>
          </div>
        )}
        {lowestIncome && (
          <div className="card text-center">
            <div className="text-3xl font-bold text-fm-copper">
              ${lowestIncome.medianIncome!.toLocaleString()}
            </div>
            <div className="text-sm text-fm-sage mt-1">
              Lowest MHI
            </div>
            <div className="text-xs text-fm-sage">
              {lowestIncome.name} ({lowestIncome.rentBurdenPct}% rent-burdened)
            </div>
          </div>
        )}
        {highestNycha && (
          <div className="card text-center">
            <div className="text-3xl font-bold text-fm-patina">
              {highestNycha.nychaShare}%
            </div>
            <div className="text-sm text-fm-sage mt-1">
              NYCHA Footprint
            </div>
            <div className="text-xs text-fm-sage">
              {highestNycha.name} — {highestNycha.nychaUnits.toLocaleString()} units
            </div>
          </div>
        )}
      </div>

      {/* Concentration map with NTA/Borough toggle */}
      <div className="card">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          Housing Concentration Map
        </h2>
        <p className="text-sm text-fm-sage mb-4">
          Ownership concentration (<HHITooltip>HHI</HHITooltip>) across NYC.
          Toggle between neighborhood-level (NTA) and borough-level views.
        </p>
        <HousingMapSection
          ntaHHI={ntaHHI}
          ntaDetails={ntaDetails}
          boroughSummaries={boroughSummaries}
        />
      </div>

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
          All Neighborhoods
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
          Ownership Concentration and Housing Supply
        </h2>
        <p className="text-sm text-gray-700">
          Researchers point to several contributing factors: zoning and
          permitting limits on new construction, acquisition strategies by
          larger owners, and regulatory conditions that affect landlord
          economics. The relative contribution of each is an active area of
          policy research. The neighborhoods with the highest HHI tend to
          also be the ones where new construction is hardest to permit —
          though the causal relationship is debated.
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

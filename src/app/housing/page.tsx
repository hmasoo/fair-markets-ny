import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import dynamic from "next/dynamic";

const NeighborhoodRentBurdenChart = dynamic(
  () => import("./housing-charts").then((m) => m.NeighborhoodRentBurdenChart),
);
const NeighborhoodExplorerChart = dynamic(
  () => import("./housing-charts").then((m) => m.NeighborhoodExplorerChart),
);
const CitywideCharts = dynamic(
  () => import("./housing-charts").then((m) => m.CitywideCharts),
);
import { HousingMapSection } from "./HousingMapSection";
import { HousingTable } from "./HousingTable";
import { aggregateByBorough } from "@/lib/aggregations/housing-boroughs";

import timeSeriesData from "../../../data/concentration/housing-nyc.json";
import marketShareData from "../../../data/concentration/housing-nyc-market-shares.json";
import neighborhoodDataRaw from "../../../data/concentration/housing-neighborhoods.json";
import rentHistoryRaw from "../../../data/concentration/rent-history-neighborhoods.json";

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
  rentGrowthPct?: number | null;
}

const neighborhoodData = neighborhoodDataRaw as {
  neighborhoods: Neighborhood[];
  [key: string]: unknown;
};

// Build rent growth lookup from rent history data
const rentGrowthBySlug = new Map<string, number>();
for (const n of (rentHistoryRaw as { neighborhoods: { slug: string; rentGrowthPct: number | null }[] }).neighborhoods) {
  if (n.rentGrowthPct !== null) {
    rentGrowthBySlug.set(n.slug, n.rentGrowthPct);
  }
}

export const metadata: Metadata = {
  title: "What Does It Cost to Rent in Your Neighborhood?",
  description:
    "Rent, income, housing quality, and ownership data across 197 NYC neighborhoods — joined from ACRIS, PLUTO, HPD, and the Census Bureau.",
};

export default function HousingPage() {
  // Merge rent growth data into neighborhood objects
  const neighborhoods = neighborhoodData.neighborhoods.map((n) => ({
    ...n,
    rentGrowthPct: rentGrowthBySlug.get(n.slug) ?? null,
  }));

  // Cost/outcome stat computations
  const withRent = neighborhoods.filter((n) => n.medianRent > 0);
  const totalUnitsWithRent = withRent.reduce((s, n) => s + n.totalUnits, 0);
  const weightedRentSum = withRent.reduce((s, n) => s + n.medianRent * n.totalUnits, 0);
  const citywideMedianRent = Math.round(weightedRentSum / totalUnitsWithRent);

  const highestRentGrowth = [...neighborhoods]
    .filter((n) => n.rentGrowthPct != null && n.rentGrowthPct > 0)
    .sort((a, b) => b.rentGrowthPct! - a.rentGrowthPct!)[0];
  const highestRentBurden = [...neighborhoods]
    .filter((n) => n.rentBurdenPct && n.rentBurdenPct > 0)
    .sort((a, b) => b.rentBurdenPct! - a.rentBurdenPct!)[0];
  const lowestIncome = [...neighborhoods]
    .filter((n) => n.medianIncome && n.medianIncome > 0)
    .sort((a, b) => a.medianIncome! - b.medianIncome!)[0];

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

      {/* ── Section 1: What do you pay? ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">What does it cost to rent in your neighborhood?</h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          Rent, income, housing quality, and ownership across 197 NYC
          neighborhoods — joined from four public datasets that are normally
          siloed: city ownership records (ACRIS/PLUTO), HPD housing violations,
          Census income surveys, and rent stabilization filings.
        </p>
      </div>

      {/* Key stats — all cost/outcome focused */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            ${citywideMedianRent.toLocaleString()}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            citywide median rent
          </div>
          <div className="text-xs text-fm-sage">unit-weighted average across neighborhoods</div>
        </div>
        {highestRentGrowth && (
          <div className="card text-center">
            <div className="text-3xl font-bold text-fm-copper">
              +{highestRentGrowth.rentGrowthPct}%
            </div>
            <div className="text-sm text-fm-sage mt-1">
              rent growth, 2019–2023
            </div>
            <div className="text-xs text-fm-sage">{highestRentGrowth.name}</div>
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

      {/* Rent burden chart — first visual */}
      <div>
        <NeighborhoodRentBurdenChart neighborhoods={neighborhoods} />
      </div>

      {/* Neighborhood Explorer scatter chart — second visual */}
      <div className="mt-8">
        <NeighborhoodExplorerChart neighborhoods={neighborhoods} />
      </div>

      {/* ── Section 2: What drives those costs? ── */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-3">
          What drives those costs?
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Housing affordability in New York is shaped by several overlapping
          forces. Their relative importance varies neighborhood by neighborhood —
          and getting the diagnosis right matters for choosing the right policy
          response.
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">1. Income levels</h3>
            <p className="text-sm text-gray-700 mt-1">
              Low incomes drive high rent burden even when rents are relatively
              low. The data on this page shows it clearly: neighborhoods like
              West Farms and Mott Haven have below-median rents but among the
              highest burden rates, because household incomes are so low that
              even moderate rents consume most of the paycheck.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">2. Supply and zoning constraints</h3>
            <p className="text-sm text-gray-700 mt-1">
              NYC approves fewer housing units per capita than comparable cities.
              Zoning limits density across much of the city, concentrating
              development pressure into the neighborhoods that allow it — which
              pushes rents up in high-demand areas and limits options everywhere
              else.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">3. Rent stabilization</h3>
            <p className="text-sm text-gray-700 mt-1">
              Roughly one million NYC apartments are rent-stabilized, protecting
              existing tenants from market-rate increases. The effect on new
              supply is debated: stabilization preserves affordability for
              current residents, but may reduce incentives to build or maintain
              buildings in some market conditions.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">4. Ownership structure</h3>
            <p className="text-sm text-gray-700 mt-1">
              One input to analysis, not a diagnosis by itself. High
              concentration doesn{"'"}t predict high rents — Stuyvesant Town (HHI
              6,553) is entirely rent-stabilized with good outcomes; Co-op City
              (HHI 4,713) is resident-governed. The ownership map below provides
              context on who owns what, not a conclusion about why rents are
              high.
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-fm-sage">
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

      {/* ── Section 3: Who owns what? (demoted, reframed) ── */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          Who owns what?
        </h2>
        <p className="text-sm text-fm-sage mb-4">
          Ownership structure is one lens on the housing market. Darker colors
          mean fewer landlords control more apartments. This map measures
          structure, not rents or housing quality directly.
        </p>
        <HousingMapSection
          ntaHHI={ntaHHI}
          ntaDetails={ntaDetails}
          boroughSummaries={boroughSummaries}
        />
      </div>

      {/* Context note on outliers */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mt-8 mb-8 text-sm text-sky-900">
        <strong>Context matters:</strong> High concentration
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

      {/* Citywide ownership trend — collapsed by default */}
      <details className="mt-8">
        <summary className="cursor-pointer text-sm font-medium text-fm-teal hover:underline">
          Show citywide ownership trends over time
        </summary>
        <div className="mt-4">
          <CitywideCharts
            timeSeriesData={timeSeriesData.years}
            marketShareData={marketShareData.marketShares.filter(
              (s) => s.company !== "All other landlords"
            )}
            marketShareYear={marketShareData.year}
          />
        </div>
      </details>

      {/* ── Section 4: All 197 neighborhoods ── */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-4">
          All 197 neighborhoods
        </h2>
        <HousingTable neighborhoods={neighborhoods} />
        <p className="mt-4 text-xs text-fm-sage">
          Source: NYC Dept. of City Planning MapPLUTO 24v4; ACRIS ownership
          records; HPD violations data via NYC Open Data. Income, median rent,
          and rent burden from U.S. Census Bureau ACS 2023 5-Year Estimates.
        </p>
      </div>

      {/* ── Section 5: What has been tried? What could help? ── */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-3">
          What has been tried? What could help?
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Different neighborhoods face different mixes of problems, which means
          there{"'"}s no single policy lever that fixes affordability everywhere.
          Three broad approaches, each with real tradeoffs:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">More supply</h3>
            <p className="text-sm text-gray-700 mt-1">
              Zoning reform, 421-a successor programs, and streamlined
              permitting can increase the total number of housing units. New
              construction is market-rate by default, so supply increases help
              most where demand pressure is highest — but don{"'"}t directly
              address affordability in neighborhoods where low incomes are the
              core problem.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">Stronger tenant protections</h3>
            <p className="text-sm text-gray-700 mt-1">
              Rent stabilization, expanded code enforcement, and good-cause
              eviction laws protect existing tenants from displacement and
              neglect. They preserve affordability in place, but may reduce
              investment incentives if rent adjustments don{"'"}t keep pace with
              building operating costs.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">Ownership transparency and competition policy</h3>
            <p className="text-sm text-gray-700 mt-1">
              Relevant where ownership concentration is genuinely high and
              demonstrably linked to outcomes — higher rents, worse maintenance,
              or more evictions than comparable buildings. Ownership transparency
              (Local Law 18 beneficial-ownership disclosure) is a precondition
              for knowing whether concentration is a problem in a given
              neighborhood.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-700">
          These aren{"'"}t mutually exclusive. A neighborhood with low incomes,
          restricted supply, and a concentrated landlord base may benefit from
          all three approaches simultaneously — but diagnosing which factors
          matter most is the first step toward effective intervention.
        </p>
      </div>
    </div>
  );
}

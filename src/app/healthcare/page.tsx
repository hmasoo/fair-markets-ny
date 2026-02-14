import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { HHITooltip } from "@/components/ui/HHITooltip";
import dynamic from "next/dynamic";

const RegionalConcentrationChart = dynamic(
  () => import("./healthcare-charts").then((m) => m.RegionalConcentrationChart),
);
const StatewideCharts = dynamic(
  () => import("./healthcare-charts").then((m) => m.StatewideCharts),
);
const HealthcareCountyMap = dynamic(
  () => import("./HealthcareCountyMap").then((m) => m.HealthcareCountyMap),
);

import timeSeriesData from "../../../data/concentration/healthcare-nys.json";
import marketShareData from "../../../data/concentration/healthcare-nys-market-shares.json";
import regionData from "../../../data/concentration/healthcare-regions.json";

export const metadata: Metadata = {
  title: "Who Runs the Hospitals in Your Region?",
  description:
    "Hospital system dominance across New York State — which systems control the most beds, and how many choices patients have, by region.",
};

export default function HealthcarePage() {
  const { regions } = regionData;

  // Sort by dominant system share for display
  const sortedByDominance = [...regions].sort(
    (a, b) => (b.topSystems[0]?.share ?? 0) - (a.topSystems[0]?.share ?? 0),
  );
  const mostDominant = sortedByDominance[0];
  const mostDominantSystem = mostDominant.topSystems[0];

  const singleDominantRegions = regions.filter(
    (r) => r.topSystems[0] && r.topSystems[0].share >= 40,
  );
  const totalBeds = regions.reduce((sum, r) => sum + r.totalBeds, 0);
  const totalFacilities = regions.reduce((sum, r) => sum + r.totalFacilities, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Healthcare" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">
          Who runs the hospitals in your region?
        </h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          New York has {totalFacilities} hospital facilities with{" "}
          {totalBeds.toLocaleString()} beds across 10 health planning regions.
          In parts of upstate New York, a single health system accounts for
          40–60% of all hospital beds — limiting where patients can go for
          care.
        </p>
      </div>

      {/* Stats grid — lead with patient experience */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {mostDominantSystem.share}%
          </div>
          <div className="text-sm text-fm-sage mt-1">
            of beds held by one system
          </div>
          <div className="text-xs text-fm-sage">
            {mostDominantSystem.name} ({mostDominant.name})
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {singleDominantRegions.length}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            regions with a dominant system
          </div>
          <div className="text-xs text-fm-sage">
            One system holds 40%+ of beds
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-patina">
            {totalFacilities}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            hospital facilities statewide
          </div>
          <div className="text-xs text-fm-sage">
            {totalBeds.toLocaleString()} licensed beds
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-patina">
            10
          </div>
          <div className="text-sm text-fm-sage mt-1">
            health planning regions
          </div>
          <div className="text-xs text-fm-sage">
            NYS DOH planning areas
          </div>
        </div>
      </div>

      {/* What this data shows — and what it doesn't */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          What this data shows — and what it doesn{"\u2019"}t
        </h2>
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            Bed share measures <strong>ownership structure</strong>: which
            systems control the most hospital beds in a region. It does not
            directly measure what patients pay or the quality of care they
            receive. Patients don{"\u2019"}t choose hospitals by bed count — they
            choose by location, insurance network, specialty, and reputation.
          </p>
          <p>
            That said, the academic evidence on hospital consolidation is
            substantial. Studies by{" "}
            <a
              href="https://www.aeaweb.org/articles?id=10.1257/aer.p20191020"
              className="text-fm-teal hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Gaynor (2019)
            </a>
            ,{" "}
            <a
              href="https://www.journals.uchicago.edu/doi/10.1086/704088"
              className="text-fm-teal hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cooper et al. (2019)
            </a>
            , and Craig et al. consistently find that hospital mergers lead to
            higher prices for commercially insured patients — typically 5–20%
            increases. Whether that pattern holds in specific New York regions
            requires price data we don{"\u2019"}t yet have. NYS SPARCS discharge
            data and CMS transparency files could fill this gap.
          </p>
        </div>
      </div>

      {/* County map colored by region HHI */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          Hospital competition by region
        </h2>
        <p className="text-sm text-fm-sage mb-4">
          Counties colored by how concentrated their health planning region is.
          Click any county to explore its region.
        </p>
        <HealthcareCountyMap regions={regions} />
      </div>

      {/* Regional bar chart — now shows dominant system share */}
      <RegionalConcentrationChart regions={regions} />

      {/* Region detail table */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-4">
          All 10 regions
        </h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Dominant System
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Their Share
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Beds
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Facilities
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  Top 4 Share
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                  <HHITooltip>HHI</HHITooltip>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedByDominance.map((r) => (
                <tr
                  key={r.slug}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/healthcare/${r.slug}`}
                      className="text-fm-teal hover:underline font-medium"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-fm-sage">
                    {r.topSystems[0]?.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span
                      className={
                        (r.topSystems[0]?.share ?? 0) >= 50
                          ? "text-red-600 font-medium"
                          : (r.topSystems[0]?.share ?? 0) >= 30
                          ? "text-amber-600 font-medium"
                          : "font-medium"
                      }
                    >
                      {r.topSystems[0]?.share}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {r.totalBeds.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {r.totalFacilities}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {r.cr4}%
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <Badge
                      variant={
                        r.hhi > 2500
                          ? "red"
                          : r.hhi > 1500
                          ? "yellow"
                          : "green"
                      }
                    >
                      {r.hhi.toLocaleString()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-fm-sage">
          Source: NYS DOH SPARCS hospital discharge data; AHA Annual Survey;
          NYS CON filings; health system disclosures. Bed counts reflect
          licensed acute-care beds.
        </p>
      </div>

      {/* Statewide trend charts */}
      <div className="mt-8">
        <StatewideCharts
          timeSeriesData={timeSeriesData.years}
          marketShareData={marketShareData.marketShares.filter(
            (s) => s.company !== "All other systems"
          )}
          marketShareYear={marketShareData.year}
        />
      </div>
    </div>
  );
}

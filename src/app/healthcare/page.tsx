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
const HealthcareMapSection = dynamic(
  () => import("./HealthcareMapSection").then((m) => m.HealthcareMapSection),
);
const PricingSection = dynamic(
  () => import("./pricing-charts").then((m) => m.PricingSection),
);

import timeSeriesData from "../../../data/concentration/healthcare-nys.json";
import marketShareData from "../../../data/concentration/healthcare-nys-market-shares.json";
import regionData from "../../../data/concentration/healthcare-regions.json";
import pricingData from "../../../data/concentration/healthcare-pricing.json";

export const metadata: Metadata = {
  title: "What Does Hospital Care Cost in New York?",
  description:
    "Hospital charges, costs, and ownership across 10 health planning regions — joined from NYS SPARCS discharge data, AHA hospital surveys, and health system disclosures.",
};

export default function HealthcarePage() {
  const { regions } = regionData;

  // Sort by dominant system share for display
  const sortedByDominance = [...regions].sort(
    (a, b) => (b.topSystems[0]?.share ?? 0) - (a.topSystems[0]?.share ?? 0),
  );

  const singleDominantRegions = regions.filter(
    (r) => r.topSystems[0] && r.topSystems[0].share >= 40,
  );

  // Compute charge variation for the default procedure (vaginal delivery, DRG 560)
  const defaultProc = pricingData.procedures[0];
  const downstateSlugs = new Set(["nyc-metro", "long-island", "hudson-valley"]);
  const downstateCharges: number[] = [];
  const upstateCharges: number[] = [];
  for (const r of defaultProc.byRegion) {
    for (const h of r.hospitals) {
      if (downstateSlugs.has(r.regionSlug)) {
        downstateCharges.push(h.meanCharge);
      } else {
        upstateCharges.push(h.meanCharge);
      }
    }
  }
  const allCharges = [...downstateCharges, ...upstateCharges];
  const chargeVariation = (Math.max(...allCharges) / Math.min(...allCharges)).toFixed(1);
  const downstateMean = Math.round(
    downstateCharges.reduce((a, b) => a + b, 0) / downstateCharges.length
  );
  const upstateMean = Math.round(
    upstateCharges.reduce((a, b) => a + b, 0) / upstateCharges.length
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Healthcare" }]} />

      {/* ── Hero — cost-first framing ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">
          What does hospital care cost in New York?
        </h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          Hospital charges, costs, and ownership across 10 health planning
          regions — joined from NYS SPARCS discharge data, AHA hospital surveys,
          and health system disclosures.
        </p>
      </div>

      {/* ── Stats grid — cost-focused ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            ${defaultProc.statewideMeanCharge.toLocaleString()}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            statewide mean hospital charge
          </div>
          <div className="text-xs text-fm-sage">
            vaginal delivery, severity level 2
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {chargeVariation}&times;
          </div>
          <div className="text-sm text-fm-sage mt-1">
            hospital-to-hospital charge variation
          </div>
          <div className="text-xs text-fm-sage">
            driven primarily by geography, not concentration
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-patina">
            ${defaultProc.statewideMeanCost.toLocaleString()}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            statewide mean cost (resource use)
          </div>
          <div className="text-xs text-fm-sage">
            the charge-to-cost gap is the story
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-patina">
            ${downstateMean.toLocaleString()} vs ${upstateMean.toLocaleString()}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            downstate vs upstate mean charge
          </div>
          <div className="text-xs text-fm-sage">
            geography explains most of the variation
          </div>
        </div>
      </div>

      {/* ── Section 1: Hospital pricing (promoted — first visual) ── */}
      <PricingSection procedures={pricingData.procedures} />

      {/* ── Section 2: What drives hospital costs? ── */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-3">
          What drives hospital costs?
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Hospital pricing in New York is shaped by several overlapping forces.
          Understanding which ones dominate in a given region matters for choosing
          the right policy response.
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">
              1. Insurance and payment structure
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              Most patients don{"\u2019"}t pay list prices. Commercially insured
              patients pay negotiated rates; uninsured patients may face full
              charges; Medicare and Medicaid rates are government-set. The gap
              between charges and costs reflects bargaining dynamics between
              hospitals and insurers — not the price most patients actually pay.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">
              2. Geography and access
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              This page{"\u2019"}s own data shows it: for a vaginal delivery at
              the same severity, downstate hospitals (NYC, Long Island, Hudson
              Valley) charge ${downstateMean.toLocaleString()} on average vs $
              {upstateMean.toLocaleString()} upstate — a{" "}
              {(downstateMean / upstateMean).toFixed(1)}&times; gap. Higher
              operating costs (land, labor, cost of living) drive most of this
              difference, not market concentration. NYC Metro has the lowest
              HHI of any region but the highest charges.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">
              3. Regulation (Certificate of Need)
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              New York{"\u2019"}s CON process requires state approval to open,
              expand, or close hospitals. This protects existing facilities from
              competition but also prevents oversupply in areas where demand
              doesn{"\u2019"}t justify additional capacity.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">
              4. Market structure (consolidation)
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              Academic evidence consistently finds hospital mergers lead to higher
              prices for commercially insured patients — typically 5{"\u2013"}20%
              increases.{" "}
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
              , and Craig et al. document this pattern across U.S. markets.
              The{" "}
              <a
                href="https://www.rand.org/pubs/research_reports/RRA1144-2-v2.html"
                className="text-fm-teal hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                RAND Hospital Price Transparency Study (2024)
              </a>{" "}
              found that New York commercial prices exceed 300% of Medicare
              rates, and that most price variation is explained by hospital
              market power — not payer mix or cost of care. NYS statewide HHI
              rose 63% since 2015 (680 to 1,105).
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">
              5. What we don{"\u2019"}t yet have
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              This page currently shows list prices (SPARCS) and estimated
              resource costs, not insurer-negotiated rates or out-of-pocket
              costs. <strong>Coming soon:</strong> facility-level
              relative-to-Medicare pricing from the RAND Hospital Price
              Transparency Study, which measures what commercial insurers
              actually pay — controlling for geographic cost differences that
              dominate the SPARCS charge data above. That will let us connect
              ownership structure to actual pricing outcomes, rather than list
              prices that few patients pay.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 3: Who runs the hospitals? (demoted) ── */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          Who runs the hospitals?
        </h2>
        <p className="text-sm text-fm-sage mb-4">
          In {singleDominantRegions.length} of 10 health planning regions, a
          single system controls 40% or more of hospital beds. Ownership
          structure is one lens on hospital markets — when paired with the
          pricing data above, concentration patterns help explain variation, but
          don{"\u2019"}t automatically predict what patients pay. The most
          competitive region (NYC Metro) has the highest charges; the most
          concentrated regions charge the least, largely because they{"\u2019"}re
          upstate.
        </p>
        <HealthcareMapSection regions={regions} />
      </div>

      {/* Regional bar chart */}
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

      {/* ── Section 4: What has been tried? What could help? ── */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-3">
          What has been tried? What could help?
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Hospital costs are shaped by regulation, market structure, and payment
          systems simultaneously. Three broad approaches, each with real
          tradeoffs:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">
              Price transparency
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              Federal rules (2021, strengthened 2024) require hospitals to
              publish negotiated rates. Compliance is uneven — CMS reports that
              as of 2024, only about 70% of hospitals fully comply. NYS SPARCS
              data (used on this page) is a partial substitute: it captures
              charges and estimated costs but not insurer-negotiated rates.
              Transparency enables comparison where data is available.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">
              Merger review
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              The NY Attorney General and FTC review hospital mergers for
              competitive effects. The challenge: many mergers are framed as
              {"\u201C"}saving a failing hospital{"\u201D"} where the realistic
              alternative is closure, not competition. This makes prospective
              review difficult — blocking a merger may mean losing a facility
              entirely.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fm-patina">
              Rate regulation and public options
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              New York does not regulate commercial hospital rates (unlike
              Maryland{"\u2019"}s all-payer model, which sets uniform rates
              regardless of insurer). NYC Health + Hospitals provides a public
              option in the metro area. Medicare and Medicaid rates are
              administered and don{"\u2019"}t respond to local concentration.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-700">
          These aren{"\u2019"}t mutually exclusive. A region with a dominant
          system, limited alternatives, and high charges may benefit from all
          three — but diagnosing which factors matter most is the first step.
        </p>
      </div>

      {/* ── Statewide trends (collapsed) ── */}
      <details className="mt-8">
        <summary className="cursor-pointer text-sm font-medium text-fm-teal hover:underline">
          Show statewide consolidation trends over time
        </summary>
        <div className="mt-4">
          <StatewideCharts
            timeSeriesData={timeSeriesData.years}
            marketShareData={marketShareData.marketShares.filter(
              (s) => s.company !== "All other systems"
            )}
            marketShareYear={marketShareData.year}
          />
        </div>
      </details>
    </div>
  );
}

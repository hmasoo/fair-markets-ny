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
  return {
    title: `${r.name} — Hospital Costs & Systems`,
    description: `Hospital pricing and ownership in ${r.name} — charges, costs, and health system concentration across ${r.totalFacilities} facilities with ${r.totalBeds.toLocaleString()} licensed beds.`,
  };
}

function getHHILabel(hhi: number): string {
  if (hhi > 2500) return "Highly Concentrated";
  if (hhi > 1500) return "Moderately Concentrated";
  return "Competitive";
}

/** Auto-generate a context paragraph from region data */
function getRegionContext(
  regionName: string,
  topSystemName: string,
  topSystemShare: number,
  cr4: number,
): string {
  if (topSystemShare >= 50) {
    return `${topSystemName} controls a majority (${topSystemShare}%) of hospital beds in ${regionName}. Research suggests this level of dominance can lead to higher negotiated prices for commercially insured patients.`;
  }
  if (topSystemShare >= 30) {
    return `${topSystemName} is the largest system with ${topSystemShare}% of beds. The top 4 systems account for ${cr4}% of capacity.`;
  }
  return `${regionName} is relatively competitive, with no single system controlling more than ${topSystemShare}% of beds.`;
}

export default async function RegionPage({ params }: Props) {
  const { region: slug } = await params;
  const region = regionData.regions.find((r) => r.slug === slug);

  if (!region) notFound();

  const topSystem = region.topSystems[0];

  // Extract region pricing from the default procedure (vaginal delivery, DRG 560)
  const defaultProc = pricingData.procedures[0];
  const regionPricing = defaultProc.byRegion.find(
    (r) => r.regionSlug === slug,
  );

  // Compute charge range for this region
  let minCharge = 0;
  let maxCharge = 0;
  let hospitalCount = 0;
  if (regionPricing) {
    const charges = regionPricing.hospitals.map((h) => h.meanCharge);
    minCharge = Math.min(...charges);
    maxCharge = Math.max(...charges);
    hospitalCount = regionPricing.hospitals.length;
  }

  const formatK = (n: number) =>
    n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n.toLocaleString()}`;

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
            Hospital pricing and ownership in {region.name} &middot;{" "}
            {region.totalBeds.toLocaleString()} beds across{" "}
            {region.totalFacilities} facilities
          </p>
        </div>
        <RegionLocatorMap regionSlug={slug} name={region.name} />
      </div>

      {/* Stats — cost-first */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {regionPricing ? (
          <>
            <div className="card text-center">
              <div className="text-2xl font-bold text-fm-copper">
                ${regionPricing.meanCharge.toLocaleString()}
              </div>
              <div className="text-xs text-fm-sage mt-1">
                mean hospital charge
              </div>
              <div className="text-xs text-fm-sage">vaginal delivery</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-fm-copper">
                {formatK(minCharge)} – {formatK(maxCharge)}
              </div>
              <div className="text-xs text-fm-sage mt-1">
                hospital-to-hospital variation
              </div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-fm-patina">
                ${regionPricing.meanCost.toLocaleString()}
              </div>
              <div className="text-xs text-fm-sage mt-1">
                mean cost (resource use)
              </div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-fm-patina">
                {hospitalCount}
              </div>
              <div className="text-xs text-fm-sage mt-1">
                hospitals with pricing data
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card text-center col-span-2">
              <div className="text-sm text-fm-sage">
                No SPARCS pricing data available for this region
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
          </>
        )}
      </div>

      {/* Collapsible technical metrics */}
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
          <p>
            Dominant system: <strong className="text-fm-patina">{topSystem?.name}</strong> — {topSystem?.share}% of beds
          </p>
          <p>
            Total beds: <strong className="text-fm-patina">{region.totalBeds.toLocaleString()}</strong> &middot; Facilities: <strong className="text-fm-patina">{region.totalFacilities}</strong>
          </p>
        </div>
      </details>

      {/* Hospital pricing comparison (promoted — first visual) */}
      <RegionPricingTable
        procedures={pricingData.procedures}
        regionSlug={slug}
        dominantSystem={topSystem?.name}
      />

      {/* Region context paragraph */}
      {topSystem && (
        <p className="mt-6 mb-2 text-sm text-gray-700">
          {getRegionContext(
            region.name,
            topSystem.name,
            topSystem.share,
            region.cr4,
          )}
        </p>
      )}

      {/* Market share chart — reframed */}
      <div className="mt-4">
        <h2 className="text-xl font-bold text-fm-patina mb-1">
          Who runs the hospitals in {region.name}?
        </h2>
        <p className="text-sm text-fm-sage mb-4">
          Ownership structure provides context for the pricing data above — it
          helps explain variation but doesn{"\u2019"}t predict it on its own.
        </p>
        <RegionCharts
          regionName={region.name}
          topSystems={region.topSystems}
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

"use client";

import { useState } from "react";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  linearScale,
  bandScale,
  niceLinearTicks,
  roundedRightRect,
} from "@/lib/chart-utils";

// --- Types matching healthcare-pricing.json ---

interface HospitalPricing {
  pfi: string;
  name: string;
  system: string;
  meanCharge: number;
  medianCharge: number;
  meanCost: number;
  medianCost: number;
  discharges: number;
}

interface RegionPricing {
  regionSlug: string;
  regionName: string;
  meanCharge: number;
  meanCost: number;
  discharges: number;
  hospitals: HospitalPricing[];
  chargeRange: { min: number; max: number };
}

interface ProcedureData {
  drgCode: string;
  drgDescription: string;
  type: string;
  statewideMeanCharge: number;
  statewideMeanCost: number;
  totalDischarges: number;
  hospitalCount: number;
  byRegion: RegionPricing[];
}

// --- System color mapping ---

const SYSTEM_COLORS: Record<string, string> = {
  "Northwell Health": "#0868AC",
  "NYU Langone Health": "#7B2D8E",
  "NewYork-Presbyterian": "#D55E00",
  "Mount Sinai Health System": "#009E73",
  "Montefiore Health System": "#E69F00",
  "NYC Health + Hospitals": "#56B4E9",
  "Kaleida Health": "#CC79A7",
  "UR Medicine (Strong Memorial)": "#0072B2",
  "Rochester Regional Health": "#F0E442",
  "Catholic Health": "#882255",
  "Catholic Health (Buffalo)": "#AA4499",
  "WMCHealth": "#332288",
  "St. Peter's Health Partners (Trinity Health)": "#88CCEE",
};

function getSystemColor(system: string): string {
  return SYSTEM_COLORS[system] ?? "#94a3b8"; // slate-400 for independents/other
}

// --- Format helpers ---

function formatDollars(n: number): string {
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n.toLocaleString()}`;
}

function formatDollarsFull(n: number): string {
  return `$${n.toLocaleString()}`;
}

// --- Procedure selector tabs ---

const PROCEDURE_ORDER = ["560", "540", "326", "324", "194", "139"];

const PROCEDURE_INFO: Record<string, { label: string; tag: string }> = {
  "560": { label: "Vaginal Delivery", tag: "shoppable" },
  "540": { label: "C-Section", tag: "shoppable" },
  "326": { label: "Knee Replacement", tag: "elective" },
  "324": { label: "Hip Replacement", tag: "elective" },
  "194": { label: "Heart Failure", tag: "emergency" },
  "139": { label: "Pneumonia", tag: "emergency" },
};

const TAG_STYLES: Record<string, string> = {
  shoppable: "bg-emerald-100 text-emerald-700",
  elective: "bg-emerald-100 text-emerald-700",
  emergency: "bg-amber-100 text-amber-700",
};

// --- Hospital Pricing Bar Chart ---

function HospitalPricingChart({
  hospitals,
  statewideMean,
}: {
  hospitals: HospitalPricing[];
  statewideMean: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take top 15 by mean charge
  const top = hospitals.slice(0, 15);
  const chartHeight = top.length * 44 + 40;
  const margin = { top: 10, right: 30, bottom: 30, left: 240 };

  const maxCharge = Math.max(...top.map((h) => h.meanCharge));
  const xTicks = niceLinearTicks(0, maxCharge * 1.05, 5);
  const xDomain: [number, number] = [0, xTicks[xTicks.length - 1]];

  return (
    <ChartContainer height={chartHeight} margin={margin}>
      {({ svgWidth, svgHeight, width, height, margin: m }) => {
        const xScale = linearScale(xDomain, [0, width]);
        const { scale: yScale, bandwidth } = bandScale(
          top.map((h) => h.name),
          [0, height],
          0.25,
        );

        return (
          <>
            <svg width={svgWidth} height={svgHeight}>
              <g transform={`translate(${m.left},${m.top})`}>
                {/* Grid lines */}
                {xTicks.map((tick) => (
                  <line
                    key={tick}
                    x1={xScale(tick)}
                    y1={0}
                    x2={xScale(tick)}
                    y2={height}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                  />
                ))}

                {/* Statewide mean reference line */}
                <line
                  x1={xScale(statewideMean)}
                  y1={0}
                  x2={xScale(statewideMean)}
                  y2={height}
                  stroke="#1B3B36"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                />
                <text
                  x={xScale(statewideMean)}
                  y={-4}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#1B3B36"
                  fontWeight="bold"
                >
                  State avg
                </text>

                {/* Bars */}
                {top.map((h, i) => (
                  <path
                    key={h.pfi}
                    d={roundedRightRect(
                      0,
                      yScale(i),
                      xScale(h.meanCharge),
                      bandwidth,
                      3,
                    )}
                    fill={getSystemColor(h.system)}
                    opacity={hoveredIndex === null || hoveredIndex === i ? 1 : 0.4}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                  />
                ))}

                {/* X-axis */}
                <line
                  x1={0}
                  y1={height}
                  x2={width}
                  y2={height}
                  stroke="#cbd5e1"
                />
                {xTicks.map((tick) => (
                  <text
                    key={tick}
                    x={xScale(tick)}
                    y={height + 18}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#64748b"
                  >
                    {formatDollars(tick)}
                  </text>
                ))}

                {/* Y-axis labels */}
                {top.map((h, i) => (
                  <text
                    key={h.pfi}
                    x={-6}
                    y={yScale(i) + bandwidth / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={11}
                    fill="#64748b"
                  >
                    {truncateLabel(h.name, 32)}
                  </text>
                ))}
              </g>
            </svg>

            {/* Tooltip */}
            {hoveredIndex !== null && top[hoveredIndex] && (() => {
              const h = top[hoveredIndex];
              return (
                <ChartTooltip
                  x={m.left + xScale(h.meanCharge)}
                  y={m.top + yScale(hoveredIndex) + bandwidth / 2}
                >
                  <div className="font-bold text-fm-patina">{h.name}</div>
                  <div className="text-xs text-fm-sage mb-1">{h.system}</div>
                  <div className="space-y-0.5 text-sm">
                    <div>
                      Mean charge: <strong>{formatDollarsFull(h.meanCharge)}</strong>
                    </div>
                    <div>
                      Mean cost: <strong>{formatDollarsFull(h.meanCost)}</strong>
                    </div>
                    <div>
                      Discharges: <strong>{h.discharges.toLocaleString()}</strong>
                    </div>
                  </div>
                </ChartTooltip>
              );
            })()}
          </>
        );
      }}
    </ChartContainer>
  );
}

function truncateLabel(label: string, max: number): string {
  if (label.length <= max) return label;
  return label.slice(0, max - 1) + "\u2026";
}

// --- Main exported component ---

export function PricingSection({
  procedures,
}: {
  procedures: ProcedureData[];
}) {
  const [selectedDrg, setSelectedDrg] = useState("560");

  const procedure = procedures.find((p) => p.drgCode === selectedDrg);
  if (!procedure) return null;

  // Flatten all hospitals across regions, sorted by charge descending
  const allHospitals = procedure.byRegion
    .flatMap((r) => r.hospitals)
    .sort((a, b) => b.meanCharge - a.meanCharge);

  const minCharge = allHospitals.length > 0
    ? allHospitals[allHospitals.length - 1].meanCharge
    : 0;
  const maxCharge = allHospitals.length > 0 ? allHospitals[0].meanCharge : 0;

  // Collect distinct systems that appear in top 15 for legend
  const top15 = allHospitals.slice(0, 15);
  const systemsInChart = [...new Set(top15.map((h) => h.system))].filter(
    (s) => s !== "Independent",
  );

  return (
    <div className="card mb-8">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        What do hospitals charge?
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        Hospital charges vary dramatically — even for the same procedure at the
        same severity level within the same region. These are list prices
        (chargemaster rates), not what insurers actually pay, but the variation
        reflects differences in pricing power across hospitals.
      </p>

      {/* Lead stat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-fm-copper">
            {formatDollarsFull(procedure.statewideMeanCharge)}
          </div>
          <div className="text-xs text-fm-sage mt-1">
            statewide mean charge
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-fm-patina">
            {formatDollarsFull(procedure.statewideMeanCost)}
          </div>
          <div className="text-xs text-fm-sage mt-1">
            statewide mean cost
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-fm-copper">
            {formatDollarsFull(minCharge)} – {formatDollarsFull(maxCharge)}
          </div>
          <div className="text-xs text-fm-sage mt-1">
            charge range across hospitals
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-fm-patina">
            {procedure.hospitalCount}
          </div>
          <div className="text-xs text-fm-sage mt-1">
            hospitals reporting
          </div>
        </div>
      </div>

      {/* Procedure tabs */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {PROCEDURE_ORDER.filter((code) =>
          procedures.some((p) => p.drgCode === code),
        ).map((code) => {
          const info = PROCEDURE_INFO[code];
          return (
            <button
              key={code}
              onClick={() => setSelectedDrg(code)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                selectedDrg === code
                  ? "bg-fm-patina text-white"
                  : "bg-gray-100 text-fm-sage hover:bg-gray-200 hover:text-fm-patina"
              }`}
            >
              {info?.label ?? code}
              {info && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    selectedDrg === code
                      ? "bg-white/20 text-white"
                      : TAG_STYLES[info.tag] ?? ""
                  }`}
                >
                  {info.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-fm-sage mb-6">
        Six high-volume DRGs chosen for comparability: deliveries and joint
        replacements are shoppable (patients can choose where to go), while
        heart failure and pneumonia are emergencies (patients go to the nearest
        hospital). Price variation means something different when you can
        {"\u2019"}t shop.
      </p>

      {/* Bar chart */}
      <div key={selectedDrg}>
        <h3 className="text-sm font-semibold text-fm-patina mb-1">
          Top 15 hospitals by mean charge — {procedure.drgDescription}
        </h3>
        <p className="text-xs text-fm-sage mb-3">
          Severity level 2 (Moderate), {procedure.totalDischarges.toLocaleString()} total
          discharges statewide (2021)
        </p>
        <HospitalPricingChart
          hospitals={allHospitals}
          statewideMean={procedure.statewideMeanCharge}
        />
      </div>

      {/* Legend */}
      {systemsInChart.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-fm-sage">
          {systemsInChart.map((system) => (
            <span key={system} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ backgroundColor: getSystemColor(system) }}
              />
              {system}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: "#94a3b8" }}
            />
            Independent / Other
          </span>
        </div>
      )}

      {/* Source citation */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-fm-sage space-y-2">
        <p>
          Source: NYS DOH SPARCS Hospital Inpatient Cost Transparency, 2021.
          Severity level 2 (Moderate) for apples-to-apples comparison.
        </p>
        <p>
          <strong>Important:</strong> Charges are hospital list prices
          (chargemaster rates). Commercially insured patients typically pay
          negotiated rates that can be 40–60% lower. Cost figures (from
          Institutional Cost Reports) reflect estimated resource use and are
          more comparable across hospitals. Even so, charge variation within a
          region signals differences in hospital pricing strategies.
        </p>
      </div>
    </div>
  );
}

// --- Region pricing table (for drill-down pages) ---

export function RegionPricingTable({
  procedures,
  regionSlug,
  dominantSystem,
}: {
  procedures: ProcedureData[];
  regionSlug: string;
  dominantSystem?: string;
}) {
  const [selectedDrg, setSelectedDrg] = useState("560");

  const procedure = procedures.find((p) => p.drgCode === selectedDrg);
  const regionData = procedure?.byRegion.find(
    (r) => r.regionSlug === regionSlug,
  );

  if (!procedure || !regionData || regionData.hospitals.length === 0) {
    return (
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          Hospital pricing comparison
        </h2>
        <p className="text-sm text-fm-sage">
          No pricing data available for this region.
        </p>
      </div>
    );
  }

  // Find which procedures have data for this region
  const availableDrgs = PROCEDURE_ORDER.filter((code) => {
    const p = procedures.find((pr) => pr.drgCode === code);
    return p?.byRegion.some(
      (r) => r.regionSlug === regionSlug && r.hospitals.length > 0,
    );
  });

  return (
    <div className="card mb-8">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Hospital pricing comparison
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        What hospitals in this region charge for common procedures.
        Severity level 2 (Moderate) for apples-to-apples comparison.
      </p>

      {/* Procedure tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {availableDrgs.map((code) => {
          const info = PROCEDURE_INFO[code];
          return (
            <button
              key={code}
              onClick={() => setSelectedDrg(code)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                selectedDrg === code
                  ? "bg-fm-patina text-white"
                  : "bg-gray-100 text-fm-sage hover:bg-gray-200 hover:text-fm-patina"
              }`}
            >
              {info?.label ?? code}
              {info && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    selectedDrg === code
                      ? "bg-white/20 text-white"
                      : TAG_STYLES[info.tag] ?? ""
                  }`}
                >
                  {info.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-fm-copper">
            {formatDollarsFull(regionData.meanCharge)}
          </div>
          <div className="text-xs text-fm-sage">region mean charge</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-fm-patina">
            {formatDollarsFull(regionData.meanCost)}
          </div>
          <div className="text-xs text-fm-sage">region mean cost</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-fm-copper">
            {formatDollarsFull(regionData.chargeRange.min)} –{" "}
            {formatDollarsFull(regionData.chargeRange.max)}
          </div>
          <div className="text-xs text-fm-sage">charge range</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-fm-patina">
            {regionData.hospitals.length}
          </div>
          <div className="text-xs text-fm-sage">hospitals</div>
        </div>
      </div>

      {/* Hospital table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                System
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Mean Charge
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Mean Cost
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Discharges
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {regionData.hospitals.map((h) => (
              <tr
                key={h.pfi}
                className={`hover:bg-gray-50 transition-colors ${
                  dominantSystem && h.system === dominantSystem
                    ? "bg-amber-50/50"
                    : ""
                }`}
              >
                <td className="px-4 py-3 text-sm font-medium">{h.name}</td>
                <td className="px-4 py-3 text-sm text-fm-sage">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                      style={{ backgroundColor: getSystemColor(h.system) }}
                    />
                    {h.system}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  {formatDollarsFull(h.meanCharge)}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {formatDollarsFull(h.meanCost)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-fm-sage">
                  {h.discharges.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-fm-sage">
        Source: NYS DOH SPARCS Hospital Inpatient Cost Transparency, 2021.
        Sorted by mean charge (highest first).
        {dominantSystem && (
          <> Highlighted rows belong to {dominantSystem}, the dominant system in this region.</>
        )}
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { HHITooltip } from "@/components/ui/HHITooltip";

interface Neighborhood {
  name: string;
  slug: string;
  borough: string;
  totalUnits: number;
  hhi: number;
  cr4: number;
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

const DEFAULT_ROWS = 20;

export function HousingTable({ neighborhoods }: { neighborhoods: Neighborhood[] }) {
  const [showAll, setShowAll] = useState(false);
  // Sort by rent burden descending; nulls to bottom
  const sorted = [...neighborhoods].sort((a, b) => {
    const aBurden = a.rentBurdenPct ?? -1;
    const bBurden = b.rentBurdenPct ?? -1;
    return bBurden - aBurden;
  });
  const visible = showAll ? sorted : sorted.slice(0, DEFAULT_ROWS);
  const hasMore = sorted.length > DEFAULT_ROWS;

  return (
    <>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Neighborhood
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Borough
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Median Income
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Median Rent
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Rent Burden
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Violations/Unit
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Units
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Stabilized %
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                NYCHA %
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                University %
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
            {visible.map((n) => (
              <tr
                key={n.slug}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/housing/${n.slug}`}
                    className="text-fm-teal hover:underline font-medium"
                  >
                    {n.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-fm-sage">
                  {n.borough}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {n.medianIncome
                    ? `$${n.medianIncome.toLocaleString()}`
                    : "\u2014"}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {n.medianRent > 0 ? `$${n.medianRent.toLocaleString()}` : "\u2014"}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {n.rentBurdenPct ? (
                    <span
                      className={
                        n.rentBurdenPct >= 50
                          ? "text-red-600 font-medium"
                          : n.rentBurdenPct >= 40
                          ? "text-amber-600"
                          : ""
                      }
                    >
                      {n.rentBurdenPct}%
                    </span>
                  ) : (
                    "\u2014"
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {n.hpdViolationsPerUnit > 0 ? n.hpdViolationsPerUnit : "\u2014"}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {n.totalUnits.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {n.stabilizedShare > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-fm-teal rounded-full"
                          style={{ width: `${Math.min(n.stabilizedShare, 100)}%` }}
                        />
                      </div>
                      <span className="text-fm-teal font-medium">{n.stabilizedShare}%</span>
                    </div>
                  ) : (
                    <span className="text-gray-300">&mdash;</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {n.nychaShare > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-fm-patina rounded-full"
                          style={{ width: `${Math.min(n.nychaShare, 100)}%` }}
                        />
                      </div>
                      <span className="text-fm-patina font-medium">{n.nychaShare}%</span>
                    </div>
                  ) : (
                    <span className="text-gray-300">&mdash;</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {n.universityShare > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-fm-copper rounded-full"
                          style={{ width: `${Math.min(n.universityShare, 100)}%` }}
                        />
                      </div>
                      <span className="text-fm-copper font-medium">{n.universityShare}%</span>
                    </div>
                  ) : (
                    <span className="text-gray-300">&mdash;</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  {n.cr4}%
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <Badge
                    variant={
                      n.hhi > 2500
                        ? "red"
                        : n.hhi > 1500
                        ? "yellow"
                        : "green"
                    }
                  >
                    {n.hhi.toLocaleString()}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-fm-teal hover:underline font-medium"
        >
          {showAll
            ? "Show fewer"
            : `Show all ${sorted.length} neighborhoods`}
        </button>
      )}
    </>
  );
}

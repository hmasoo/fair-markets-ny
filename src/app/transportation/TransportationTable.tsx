"use client";

import { useState } from "react";

interface Neighborhood {
  name: string;
  slug: string;
  borough: string;
  workers: number;
  transitPct: number;
  drovePct: number;
  zeroCarPct: number;
  avgCommuteMins: number;
  estMonthlyCost: number;
}

type SortKey = "estMonthlyCost" | "transitPct" | "drovePct" | "zeroCarPct" | "avgCommuteMins" | "workers";

const DEFAULT_ROWS = 20;

export function TransportationTable({
  neighborhoods,
}: {
  neighborhoods: Neighborhood[];
}) {
  const [showAll, setShowAll] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("estMonthlyCost");
  const [sortDesc, setSortDesc] = useState(true);

  const sorted = [...neighborhoods].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    return sortDesc ? bv - av : av - bv;
  });

  const visible = showAll ? sorted : sorted.slice(0, DEFAULT_ROWS);
  const hasMore = sorted.length > DEFAULT_ROWS;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDesc ? " \u25BC" : " \u25B2";
  };

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
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider cursor-pointer hover:text-fm-patina"
                onClick={() => handleSort("transitPct")}
              >
                Transit%{sortIndicator("transitPct")}
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider cursor-pointer hover:text-fm-patina"
                onClick={() => handleSort("drovePct")}
              >
                Drove%{sortIndicator("drovePct")}
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider cursor-pointer hover:text-fm-patina"
                onClick={() => handleSort("zeroCarPct")}
              >
                Zero-Car%{sortIndicator("zeroCarPct")}
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider cursor-pointer hover:text-fm-patina"
                onClick={() => handleSort("avgCommuteMins")}
              >
                Commute{sortIndicator("avgCommuteMins")}
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider cursor-pointer hover:text-fm-patina"
                onClick={() => handleSort("estMonthlyCost")}
              >
                Est. Monthly Cost{sortIndicator("estMonthlyCost")}
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider cursor-pointer hover:text-fm-patina"
                onClick={() => handleSort("workers")}
              >
                Workers{sortIndicator("workers")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.map((n) => (
              <tr
                key={n.slug}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-fm-patina">
                  {n.name}
                </td>
                <td className="px-4 py-3 text-sm text-fm-sage">
                  {n.borough}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {n.transitPct}%
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span
                    className={
                      n.drovePct >= 50
                        ? "text-amber-600 font-medium"
                        : ""
                    }
                  >
                    {n.drovePct}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span
                    className={
                      n.zeroCarPct >= 60
                        ? "text-fm-teal font-medium"
                        : ""
                    }
                  >
                    {n.zeroCarPct}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {n.avgCommuteMins} min
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  <span
                    className={
                      n.estMonthlyCost >= 400
                        ? "text-red-600"
                        : n.estMonthlyCost >= 250
                        ? "text-amber-600"
                        : "text-fm-patina"
                    }
                  >
                    ${n.estMonthlyCost}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {n.workers.toLocaleString()}
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

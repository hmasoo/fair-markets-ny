"use client";

import { useState } from "react";
import Link from "next/link";

interface County {
  name: string;
  slug: string;
  fips: string;
  totalHouseholds: number;
  providersAt100Mbps: number;
  hhi: number;
  zeroPctBlocks: number;
  onePctBlocks: number;
  cheapest100Mbps: number | null;
  cheapest100Provider: string | null;
}

const DEFAULT_ROWS = 20;

export function BroadbandTable({ counties }: { counties: County[] }) {
  const [showAll, setShowAll] = useState(false);
  // Sort by zero-provider blocks descending (worst-served first)
  const sorted = [...counties].sort((a, b) => b.zeroPctBlocks - a.zeroPctBlocks);
  const visible = showAll ? sorted : sorted.slice(0, DEFAULT_ROWS);
  const hasMore = sorted.length > DEFAULT_ROWS;

  return (
    <>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-fm-sage uppercase tracking-wider">
                County
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Zero-Provider Blocks
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                One-Provider Blocks
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                100+ Mbps Providers
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Cheapest 100 Mbps
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-fm-sage uppercase tracking-wider">
                Households
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.map((c) => (
              <tr
                key={c.slug}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/broadband/${c.slug}`}
                    className="text-fm-teal hover:underline font-medium"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span
                    className={
                      c.zeroPctBlocks >= 20
                        ? "text-red-600 font-medium"
                        : c.zeroPctBlocks >= 10
                        ? "text-amber-600"
                        : ""
                    }
                  >
                    {c.zeroPctBlocks}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {c.onePctBlocks}%
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  {c.providersAt100Mbps}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {c.cheapest100Mbps != null ? (
                    <div>
                      <span className="font-medium">${c.cheapest100Mbps}/mo</span>
                      <span className="text-fm-sage">*</span>
                      {c.cheapest100Provider && (
                        <div className="text-xs text-fm-sage">{c.cheapest100Provider}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-fm-sage">{"\u2014"}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {c.totalHouseholds.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-fm-sage">
        * Introductory rate; regular price may be higher. Prices are published
        plan rates as of February 2026 and exclude equipment fees.
      </p>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-fm-teal hover:underline font-medium"
        >
          {showAll
            ? "Show fewer"
            : `Show all ${sorted.length} counties`}
        </button>
      )}
    </>
  );
}

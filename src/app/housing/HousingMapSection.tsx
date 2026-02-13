"use client";

import { useState } from "react";
import { HousingNTAMap } from "./HousingNTAMap";
import { HousingBoroughMap } from "./HousingBoroughMap";
import type { BoroughSummary } from "@/lib/aggregations/housing-boroughs";

type ViewMode = "neighborhoods" | "boroughs";

interface HousingMapSectionProps {
  ntaHHI: Record<string, number>;
  ntaDetails: Record<string, { name: string; slug: string; hhi: number; cr4: number; totalUnits: number }>;
  boroughSummaries: BoroughSummary[];
}

export function HousingMapSection({ ntaHHI, ntaDetails, boroughSummaries }: HousingMapSectionProps) {
  const [view, setView] = useState<ViewMode>("neighborhoods");

  return (
    <div>
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setView("neighborhoods")}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            view === "neighborhoods"
              ? "bg-fm-patina text-white"
              : "bg-gray-100 text-fm-sage hover:bg-gray-200"
          }`}
        >
          Neighborhoods
        </button>
        <button
          onClick={() => setView("boroughs")}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            view === "boroughs"
              ? "bg-fm-patina text-white"
              : "bg-gray-100 text-fm-sage hover:bg-gray-200"
          }`}
        >
          Boroughs
        </button>
      </div>

      {view === "neighborhoods" ? (
        <HousingNTAMap data={ntaHHI} details={ntaDetails} />
      ) : (
        <HousingBoroughMap boroughs={boroughSummaries} />
      )}
    </div>
  );
}

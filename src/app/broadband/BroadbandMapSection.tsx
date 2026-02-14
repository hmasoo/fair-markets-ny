"use client";

import { useState } from "react";
import { BroadbandCountyMap } from "./BroadbandCountyMap";
import { BroadbandBoroughMap } from "./BroadbandBoroughMap";

type ViewMode = "statewide" | "nyc";

interface CountyEntry {
  name: string;
  slug: string;
  fips: string;
  hhi: number;
  cr4: number;
  totalHouseholds: number;
  providersAt100Mbps: number;
  zeroPctBlocks: number;
  onePctBlocks: number;
}

interface BroadbandMapSectionProps {
  counties: CountyEntry[];
}

export function BroadbandMapSection({ counties }: BroadbandMapSectionProps) {
  const [view, setView] = useState<ViewMode>("nyc");

  return (
    <div>
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setView("statewide")}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            view === "statewide"
              ? "bg-fm-patina text-white"
              : "bg-gray-100 text-fm-sage hover:bg-gray-200"
          }`}
        >
          Statewide
        </button>
        <button
          onClick={() => setView("nyc")}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            view === "nyc"
              ? "bg-fm-patina text-white"
              : "bg-gray-100 text-fm-sage hover:bg-gray-200"
          }`}
        >
          NYC Boroughs
        </button>
      </div>

      {view === "statewide" ? (
        <BroadbandCountyMap counties={counties} />
      ) : (
        <BroadbandBoroughMap counties={counties} />
      )}
    </div>
  );
}

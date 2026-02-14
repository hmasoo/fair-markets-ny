"use client";

import { useState } from "react";
import { HealthcareCountyMap } from "./HealthcareCountyMap";
import { HealthcareBoroughMap } from "./HealthcareBoroughMap";

type ViewMode = "statewide" | "nyc";

interface RegionEntry {
  name: string;
  slug: string;
  hhi: number;
  cr4: number;
  totalBeds: number;
  totalFacilities: number;
  topSystems: { name: string; share: number; beds: number; facilities: number }[];
}

interface HealthcareMapSectionProps {
  regions: RegionEntry[];
}

export function HealthcareMapSection({ regions }: HealthcareMapSectionProps) {
  const [view, setView] = useState<ViewMode>("statewide");

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
        <HealthcareCountyMap regions={regions} />
      ) : (
        <HealthcareBoroughMap regions={regions} />
      )}
    </div>
  );
}

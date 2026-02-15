"use client";

import { useState } from "react";
import { BroadbandCountyMap } from "./BroadbandCountyMap";
import { BroadbandBoroughMap } from "./BroadbandBoroughMap";
import { BroadbandNTAMap, type BroadbandNTADetail } from "./BroadbandNTAMap";

type ViewMode = "statewide" | "neighborhoods" | "nyc";

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

interface BoroughMeshData {
  borough: string;
  slug: string;
  fips: string;
  activeNodes: number;
  supernodes: number;
  hubs: number;
}

interface NycMeshData {
  source: string;
  sourceUrl: string;
  lastUpdated: string;
  notes: string;
  citywide: {
    activeNodes: number;
    supernodes: number;
    hubs: number;
  };
  boroughs: BoroughMeshData[];
}

interface BroadbandMapSectionProps {
  counties: CountyEntry[];
  nycMeshData?: NycMeshData;
  ntaProviders?: Record<string, number>;
  ntaDetails?: Record<string, BroadbandNTADetail>;
}

export function BroadbandMapSection({
  counties,
  nycMeshData,
  ntaProviders,
  ntaDetails,
}: BroadbandMapSectionProps) {
  const hasNTAData = ntaProviders && ntaDetails && Object.keys(ntaProviders).length > 0;
  const [view, setView] = useState<ViewMode>(hasNTAData ? "neighborhoods" : "nyc");

  const buttons: { mode: ViewMode; label: string }[] = [
    { mode: "statewide", label: "Statewide" },
    ...(hasNTAData ? [{ mode: "neighborhoods" as ViewMode, label: "Neighborhoods" }] : []),
    { mode: "nyc", label: "NYC Boroughs" },
  ];

  const showNYCMesh = view === "neighborhoods" || view === "nyc";

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {buttons.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setView(mode)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              view === mode
                ? "bg-fm-patina text-white"
                : "bg-gray-100 text-fm-sage hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "statewide" && (
        <BroadbandCountyMap counties={counties} />
      )}

      {view === "neighborhoods" && hasNTAData && (
        <BroadbandNTAMap data={ntaProviders} details={ntaDetails} />
      )}

      {view === "nyc" && (
        <BroadbandBoroughMap counties={counties} />
      )}

      {/* NYC Mesh — appears in neighborhood and borough views */}
      {showNYCMesh && nycMeshData && (
        <div className="mt-6 p-4 bg-fm-patina/5 rounded-lg border border-fm-teal/20">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-fm-patina mb-1">
                A cheaper alternative: NYC Mesh
              </h3>
              <p className="text-sm text-gray-700">
                NYC Mesh is a volunteer-run community network offering internet
                at <strong className="text-fm-teal">$20{"\u2013"}$50/mo</strong> (suggested,
                sliding scale) — less than most commercial plans. It{"\u2019"}s
                concentrated in Manhattan ({nycMeshData.boroughs.find(b => b.borough === "Manhattan")?.activeNodes.toLocaleString()} nodes)
                and Brooklyn ({nycMeshData.boroughs.find(b => b.borough === "Brooklyn")?.activeNodes.toLocaleString()} nodes),
                with limited coverage elsewhere.
              </p>
            </div>
            <div className="shrink-0 text-center sm:text-right">
              <div className="text-2xl font-bold text-fm-teal">
                {nycMeshData.citywide.activeNodes.toLocaleString()}
              </div>
              <div className="text-xs text-fm-sage">active nodes citywide</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fm-sage">
            <span>{nycMeshData.citywide.hubs} hubs · {nycMeshData.citywide.supernodes} supernodes</span>
            <a
              href="https://www.nycmesh.net/join"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fm-teal hover:underline"
            >
              Check if you can join
            </a>
            <span>
              Source:{" "}
              <a
                href={nycMeshData.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                NYC Mesh MeshDB
              </a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChoroplethMap } from "@/components/maps/ChoroplethMap";
import { healthcareHHIScale } from "@/lib/colorScales";
import {
  DEFAULT_JURISDICTION,
  getTopoJsonPath,
  getObjectName,
} from "@/lib/geography/jurisdictions";

import crosswalkRaw from "../../../data/crosswalks/healthcare-region-counties.json";

interface RegionEntry {
  name: string;
  slug: string;
  hhi: number;
  cr4: number;
  totalBeds: number;
  topSystems: { name: string; share: number }[];
}

interface HealthcareCountyMapProps {
  regions: RegionEntry[];
}

export function HealthcareCountyMap({ regions }: HealthcareCountyMapProps) {
  const router = useRouter();

  const { hhiByFips, detailsByFips } = useMemo(() => {
    const regionBySlug = new Map<string, RegionEntry>();
    for (const r of regions) {
      regionBySlug.set(r.slug, r);
    }

    const hhi: Record<string, number> = {};
    const details: Record<string, { region: RegionEntry; county: string }> = {};

    for (const entry of crosswalkRaw) {
      const region = regionBySlug.get(entry.regionSlug);
      if (!region) continue;
      hhi[entry.fips] = region.hhi;
      details[entry.fips] = { region, county: entry.county };
    }

    return { hhiByFips: hhi, detailsByFips: details };
  }, [regions]);

  const topoJsonPath =
    getTopoJsonPath(DEFAULT_JURISDICTION, "COUNTY") ??
    "/geo/nys-counties.topojson";
  const objectName =
    getObjectName(DEFAULT_JURISDICTION, "COUNTY") ?? "counties";

  return (
    <ChoroplethMap
      topoJsonPath={topoJsonPath}
      objectName={objectName}
      featureKeyProp="GEOID"
      featureLabelProp="NAME"
      data={hhiByFips}
      colorScale={healthcareHHIScale}
      legendTitle="Regional HHI"
      onFeatureClick={(fips) => {
        const d = detailsByFips[fips];
        if (d) router.push(`/healthcare/${d.region.slug}`);
      }}
      tooltipContent={(fips, label, _value) => {
        const d = detailsByFips[fips];
        if (!d) {
          return (
            <>
              <div className="font-bold text-fm-patina">{label}</div>
              <div className="mt-1 text-sm text-fm-sage">No data yet</div>
            </>
          );
        }
        return (
          <>
            <div className="font-bold text-fm-patina">{label} County</div>
            <div className="text-xs text-fm-sage">{d.region.name} region</div>
            <div className="mt-2 space-y-1 text-sm">
              <div>
                Regional HHI: <strong>{d.region.hhi.toLocaleString()}</strong>
              </div>
              <div>
                CR4: <strong>{d.region.cr4}%</strong>
              </div>
              <div>
                Beds: <strong>{d.region.totalBeds.toLocaleString()}</strong>
              </div>
              {d.region.topSystems[0] && (
                <div>
                  Top system: <strong>{d.region.topSystems[0].name}</strong>{" "}
                  ({d.region.topSystems[0].share}%)
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-fm-teal">Click to explore region</div>
          </>
        );
      }}
    />
  );
}

"use client";

import { useMemo } from "react";
import { ChoroplethMap } from "@/components/maps/ChoroplethMap";
import { providerCountScale } from "@/lib/colorScales";
import {
  DEFAULT_JURISDICTION,
  getTopoJsonPath,
  getObjectName,
} from "@/lib/geography/jurisdictions";

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

interface BroadbandCountyMapProps {
  counties: CountyEntry[];
}

export function BroadbandCountyMap({ counties }: BroadbandCountyMapProps) {
  const { providersByFips, detailsByFips } = useMemo(() => {
    const providers: Record<string, number> = {};
    const details: Record<string, CountyEntry> = {};
    for (const c of counties) {
      providers[c.fips] = c.providersAt100Mbps;
      details[c.fips] = c;
    }
    return { providersByFips: providers, detailsByFips: details };
  }, [counties]);

  const topoJsonPath = getTopoJsonPath(DEFAULT_JURISDICTION, "COUNTY") ?? "/geo/nys-counties.topojson";
  const objectName = getObjectName(DEFAULT_JURISDICTION, "COUNTY") ?? "counties";

  return (
    <ChoroplethMap
      topoJsonPath={topoJsonPath}
      objectName={objectName}
      featureKeyProp="GEOID"
      featureLabelProp="NAME"
      data={providersByFips}
      colorScale={providerCountScale}
      legendTitle="Internet choices"
      tooltipContent={(key, label) => {
        const d = detailsByFips[key];
        if (!d) {
          return (
            <>
              <div className="font-bold text-fm-patina">{label}</div>
              <div className="mt-1 text-sm text-fm-sage">No detailed data yet</div>
            </>
          );
        }
        return (
          <>
            <div className="font-bold text-fm-patina">{d.name}</div>
            <div className="mt-2 space-y-1 text-sm">
              <div>
                Providers at 100+ Mbps: <strong>{d.providersAt100Mbps}</strong>
              </div>
              <div>
                No-broadband blocks: <strong>{d.zeroPctBlocks}%</strong>
              </div>
              <div>
                Households: <strong>{d.totalHouseholds.toLocaleString()}</strong>
              </div>
            </div>
          </>
        );
      }}
    />
  );
}

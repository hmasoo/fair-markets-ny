"use client";

import { useMemo } from "react";
import { ChoroplethMap } from "@/components/maps/ChoroplethMap";
import { broadbandHHIScale } from "@/lib/colorScales";

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
  const { hhiByFips, detailsByFips } = useMemo(() => {
    const hhi: Record<string, number> = {};
    const details: Record<string, CountyEntry> = {};
    for (const c of counties) {
      hhi[c.fips] = c.hhi;
      details[c.fips] = c;
    }
    return { hhiByFips: hhi, detailsByFips: details };
  }, [counties]);

  return (
    <ChoroplethMap
      topoJsonPath="/geo/nys-counties.topojson"
      objectName="counties"
      featureKeyProp="GEOID"
      featureLabelProp="NAME"
      data={hhiByFips}
      colorScale={broadbandHHIScale}
      legendTitle="HHI Scale"
      tooltipContent={(key, label, _value) => {
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
                HHI: <strong>{d.hhi.toLocaleString()}</strong>
              </div>
              <div>
                CR4: <strong>{d.cr4}%</strong>
              </div>
              <div>
                Providers (100+ Mbps): <strong>{d.providersAt100Mbps}</strong>
              </div>
              <div>
                Households: <strong>{d.totalHouseholds.toLocaleString()}</strong>
              </div>
              <div>
                Zero-provider blocks: <strong>{d.zeroPctBlocks}%</strong>
              </div>
            </div>
          </>
        );
      }}
    />
  );
}

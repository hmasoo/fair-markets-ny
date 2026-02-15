"use client";

import { useMemo } from "react";
import { BoroughMap } from "@/components/maps/BoroughMap";
import { providerCountScale } from "@/lib/colorScales";
import { boroughCountyCrosswalk } from "@/lib/geography/crosswalks";

const NYC_FIPS = new Set(boroughCountyCrosswalk.map((b) => b.fips));

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

interface BroadbandBoroughMapProps {
  counties: CountyEntry[];
}

export function BroadbandBoroughMap({ counties }: BroadbandBoroughMapProps) {
  const nycCounties = useMemo(
    () => counties.filter((c) => NYC_FIPS.has(c.fips)),
    [counties],
  );

  const { providersByFips, detailsByFips } = useMemo(() => {
    const providers: Record<string, number> = {};
    const details: Record<string, CountyEntry> = {};
    for (const c of nycCounties) {
      providers[c.fips] = c.providersAt100Mbps;
      details[c.fips] = c;
    }
    return { providersByFips: providers, detailsByFips: details };
  }, [nycCounties]);

  // Guard: need at least 4 boroughs to render a meaningful map
  if (nycCounties.length < 4) return null;

  return (
    <BoroughMap
      data={providersByFips}
      colorScale={providerCountScale}
      legendTitle="Internet choices"
      tooltipContent={(fips, label) => {
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
            <div className="font-bold text-fm-patina">{label}</div>
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

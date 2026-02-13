"use client";

import { useMemo } from "react";
import { BoroughMap } from "@/components/maps/BoroughMap";
import { housingHHIScale } from "@/lib/colorScales";
import type { BoroughSummary } from "@/lib/aggregations/housing-boroughs";

interface HousingBoroughMapProps {
  boroughs: BoroughSummary[];
}

export function HousingBoroughMap({ boroughs }: HousingBoroughMapProps) {
  const { hhiByFips, detailsByFips } = useMemo(() => {
    const hhi: Record<string, number> = {};
    const details: Record<string, BoroughSummary> = {};
    for (const b of boroughs) {
      hhi[b.fips] = b.hhi;
      details[b.fips] = b;
    }
    return { hhiByFips: hhi, detailsByFips: details };
  }, [boroughs]);

  return (
    <BoroughMap
      data={hhiByFips}
      colorScale={housingHHIScale}
      legendTitle="HHI Scale"
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
            <div className="font-bold text-fm-patina">{d.borough}</div>
            <div className="mt-2 space-y-1 text-sm">
              <div>
                HHI: <strong>{d.hhi.toLocaleString()}</strong>
              </div>
              <div>
                CR4: <strong>{d.cr4}%</strong>
              </div>
              <div>
                Units: <strong>{d.totalUnits.toLocaleString()}</strong>
              </div>
              <div>
                Neighborhoods: <strong>{d.neighborhoods}</strong>
              </div>
              {d.nychaUnits > 0 && (
                <div>
                  NYCHA: <strong>{d.nychaUnits.toLocaleString()}</strong> units ({d.nychaShare}%)
                </div>
              )}
              {d.medianIncome && (
                <div>
                  Avg MHI: <strong>${d.medianIncome.toLocaleString()}</strong>
                </div>
              )}
            </div>
          </>
        );
      }}
    />
  );
}

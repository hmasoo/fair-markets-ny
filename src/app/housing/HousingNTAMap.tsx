"use client";

import { useRouter } from "next/navigation";
import { ChoroplethMap } from "@/components/maps/ChoroplethMap";
import { housingHHIScale } from "@/lib/colorScales";
import {
  DEFAULT_JURISDICTION,
  getTopoJsonPath,
  getObjectName,
} from "@/lib/geography/jurisdictions";

interface NeighborhoodDetail {
  name: string;
  slug: string;
  hhi: number;
  cr4: number;
  totalUnits: number;
}

interface HousingNTAMapProps {
  /** NTA code → HHI value for coloring */
  data: Record<string, number>;
  /** NTA code → neighborhood detail for tooltip */
  details: Record<string, NeighborhoodDetail>;
}

export function HousingNTAMap({ data, details }: HousingNTAMapProps) {
  const router = useRouter();
  const topoJsonPath = getTopoJsonPath(DEFAULT_JURISDICTION, "NTA") ?? "/geo/nyc-ntas.topojson";
  const objectName = getObjectName(DEFAULT_JURISDICTION, "NTA") ?? "ntas";

  return (
    <ChoroplethMap
      topoJsonPath={topoJsonPath}
      objectName={objectName}
      featureKeyProp="GEOID"
      featureLabelProp="NAME"
      data={data}
      colorScale={housingHHIScale}
      legendTitle="HHI Scale"
      width={700}
      height={600}
      onFeatureClick={(key) => {
        const d = details[key];
        if (d) router.push(`/housing/${d.slug}`);
      }}
      tooltipContent={(key, label) => {
        const d = details[key];
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
            <div className="font-bold text-fm-patina">{d.name}</div>
            <div className="text-xs text-fm-sage">{label}</div>
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
            </div>
            <div className="mt-2 text-xs text-fm-teal">Click to explore</div>
          </>
        );
      }}
    />
  );
}

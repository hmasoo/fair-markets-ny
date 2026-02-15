"use client";

import { useRouter } from "next/navigation";
import { ChoroplethMap } from "@/components/maps/ChoroplethMap";
import { providerCountScale } from "@/lib/colorScales";
import {
  DEFAULT_JURISDICTION,
  getTopoJsonPath,
  getObjectName,
} from "@/lib/geography/jurisdictions";
import { boroughCountyCrosswalk } from "@/lib/geography/crosswalks";

interface NTAProviderDetail {
  name: string;
  blockCoveragePct: number;
  maxDownload: number;
}

export interface BroadbandNTADetail {
  name: string;
  slug: string;
  borough: string;
  fips: string;
  medianProviderCount: number;
  providersAt100Mbps: number;
  zeroPctBlocks: number;
  zeroAt100PctBlocks: number;
  onePctBlocks: number;
  topProviders: NTAProviderDetail[];
  cheapest100Mbps: number | null;
  cheapest100Provider: string | null;
}

interface BroadbandNTAMapProps {
  /** NTA code → median provider count for coloring */
  data: Record<string, number>;
  /** NTA code → full neighborhood detail for tooltip */
  details: Record<string, BroadbandNTADetail>;
}

// Borough → county slug mapping for click navigation
const fipsToCountySlug = new Map<string, string>();
for (const b of boroughCountyCrosswalk) {
  // Borough names map to county slugs used in /broadband/[county] routes
  const slug = b.borough.toLowerCase().replace(/ /g, "-");
  fipsToCountySlug.set(b.fips, slug);
}

export function BroadbandNTAMap({ data, details }: BroadbandNTAMapProps) {
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
      colorScale={providerCountScale}
      legendTitle="Internet choices"
      width={700}
      height={600}
      onFeatureClick={(key) => {
        const d = details[key];
        if (d) {
          const countySlug = fipsToCountySlug.get(d.fips);
          if (countySlug) router.push(`/broadband/${countySlug}`);
        }
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
            <div className="text-xs text-fm-sage">{d.borough}</div>
            <div className="mt-2 space-y-1 text-sm">
              {d.cheapest100Mbps !== null && (
                <div>
                  Cheapest 100 Mbps:{" "}
                  <strong className="text-fm-teal">
                    ${d.cheapest100Mbps}/mo
                  </strong>
                  <span className="text-fm-sage"> ({d.cheapest100Provider})</span>
                </div>
              )}
              <div>
                Typical choices:{" "}
                <strong>{d.medianProviderCount} provider{d.medianProviderCount !== 1 ? "s" : ""}</strong>
              </div>
              {d.zeroPctBlocks > 0 && (
                <div>
                  No-broadband blocks: <strong>{d.zeroPctBlocks}%</strong>
                </div>
              )}
              {d.onePctBlocks > 0 && (
                <div>
                  One-provider blocks: <strong>{d.onePctBlocks}%</strong>
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-fm-teal">Click for county details</div>
          </>
        );
      }}
    />
  );
}

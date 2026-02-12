import { useEffect, useState } from "react";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection, Feature, Position } from "geojson";

/**
 * Compute the signed area of a ring using the shoelace formula.
 * Positive = clockwise in lon/lat space, negative = counterclockwise.
 */
function ringSignedArea(ring: Position[]): number {
  let area = 0;
  for (let i = 0, n = ring.length; i < n - 1; i++) {
    area += (ring[i + 1][0] - ring[i][0]) * (ring[i + 1][1] + ring[i][1]);
  }
  return area / 2;
}

/**
 * Rewind polygon rings so d3-geo renders them correctly.
 *
 * d3-geo uses spherical geometry where winding order determines which side
 * of a polygon boundary is the interior. After a TopoJSON round-trip,
 * some small polygon parts can end up with reversed winding, causing d3
 * to interpret them as covering the entire sphere.
 *
 * Fix: exterior rings (index 0) must be clockwise (positive signed area),
 * interior rings (holes, index > 0) must be counterclockwise (negative).
 */
function rewindFeature(f: Feature): Feature {
  const geom = f.geometry;
  if (!geom) return f;

  if (geom.type === "Polygon") {
    return { ...f, geometry: { ...geom, coordinates: rewindPolygon(geom.coordinates) } };
  }

  if (geom.type === "MultiPolygon") {
    return {
      ...f,
      geometry: {
        ...geom,
        coordinates: geom.coordinates.map(rewindPolygon),
      },
    };
  }

  return f;
}

function rewindPolygon(rings: Position[][]): Position[][] {
  return rings.map((ring, i) => {
    const area = ringSignedArea(ring);
    // Exterior ring (i=0): should be CW (positive area)
    // Interior rings (holes): should be CCW (negative area)
    if (i === 0 && area < 0) return [...ring].reverse();
    if (i > 0 && area > 0) return [...ring].reverse();
    return ring;
  });
}

/**
 * Fetches a TopoJSON file and converts a named object to GeoJSON FeatureCollection.
 * Rewinds polygon rings to ensure correct d3-geo rendering.
 */
export function useTopoJson(path: string, objectName: string) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(path)
      .then((r) => r.json())
      .then((topo: Topology) => {
        if (cancelled) return;
        const obj = topo.objects[objectName];
        if (!obj) {
          console.error(`Object "${objectName}" not found in TopoJSON`);
          return;
        }
        const fc = feature(topo, obj) as FeatureCollection;
        // Rewind rings to fix d3-geo spherical winding interpretation
        fc.features = fc.features.map(rewindFeature);
        setGeoData(fc);
      })
      .catch((err) => {
        if (!cancelled) console.error("Failed to load TopoJSON:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [path, objectName]);

  return geoData;
}

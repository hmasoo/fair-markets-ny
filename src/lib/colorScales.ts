export interface ColorStop {
  threshold: number;
  color: string;
  label: string;
}

/**
 * Housing HHI — sequential blue scale (colorblind-safe)
 */
export const housingHHIScale: ColorStop[] = [
  { threshold: 0, color: "#e5e7eb", label: "No data" },
  { threshold: 1, color: "#c6dbef", label: "< 400 Competitive" },
  { threshold: 400, color: "#9ecae1", label: "400\u2013600" },
  { threshold: 600, color: "#6baed6", label: "600\u2013800" },
  { threshold: 800, color: "#3182bd", label: "800\u20131,000" },
  { threshold: 1000, color: "#08519c", label: "1,000\u20131,500" },
  { threshold: 1500, color: "#08306b", label: "> 1,500 Concentrated" },
];

/**
 * Broadband HHI — sequential purple scale (colorblind-safe)
 */
export const broadbandHHIScale: ColorStop[] = [
  { threshold: 0, color: "#f3f4f6", label: "No data" },
  { threshold: 1, color: "#dadaeb", label: "< 3,000 (Less concentrated)" },
  { threshold: 3000, color: "#bcbddc", label: "3,000\u20133,500" },
  { threshold: 3500, color: "#9e9ac8", label: "3,500\u20134,000" },
  { threshold: 4000, color: "#807dba", label: "4,000\u20135,000" },
  { threshold: 5000, color: "#6a51a3", label: "5,000\u20136,000" },
  { threshold: 6000, color: "#3f007d", label: "> 6,000 (Near monopoly)" },
];

/**
 * Broadband provider count — diverging blue-orange (colorblind-safe)
 */
export const providerCountScale: ColorStop[] = [
  { threshold: -Infinity, color: "#7f2704", label: "0 providers" },
  { threshold: 1, color: "#D55E00", label: "1 provider" },
  { threshold: 2, color: "#E69F00", label: "2 providers" },
  { threshold: 3, color: "#9ecae1", label: "3 providers" },
  { threshold: 4, color: "#56B4E9", label: "4+ providers" },
];

/**
 * Look up color for a value using a threshold-based scale.
 * Walks the scale in reverse to find the highest matching threshold.
 */
export function getColor(value: number | undefined, scale: ColorStop[]): string {
  if (value === undefined || value === null) return scale[0].color;
  // Walk thresholds in reverse to find highest matching
  for (let i = scale.length - 1; i >= 0; i--) {
    if (value >= scale[i].threshold) return scale[i].color;
  }
  return scale[0].color;
}

/**
 * Get legend items from a scale (excluding the "no data" entry at index 0).
 * Returns items in display order (low → high) with no-data appended at end.
 */
export function getLegendItems(scale: ColorStop[]) {
  const items = scale.slice(1).map((s) => ({ color: s.color, label: s.label }));
  items.push({ color: scale[0].color, label: scale[0].label });
  return items;
}

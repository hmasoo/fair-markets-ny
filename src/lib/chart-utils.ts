/**
 * Pure math utilities for SVG charts — zero dependencies.
 */

/** Returns a function mapping values from [d0, d1] to [r0, r1] */
export function linearScale(
  domain: [number, number],
  range: [number, number],
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const ratio = d1 !== d0 ? (r1 - r0) / (d1 - d0) : 0;
  return (value: number) => r0 + (value - d0) * ratio;
}

/** Band scale for categorical axes. Returns position fn + bandwidth. */
export function bandScale(
  labels: string[],
  range: [number, number],
  padding = 0.2,
): { scale: (index: number) => number; bandwidth: number } {
  const [r0, r1] = range;
  const n = labels.length;
  if (n === 0) return { scale: () => r0, bandwidth: 0 };
  const totalRange = r1 - r0;
  const slotWidth = totalRange / n;
  const bandwidth = slotWidth * (1 - padding);
  const offset = slotWidth * padding / 2;
  return {
    scale: (index: number) => r0 + index * slotWidth + offset,
    bandwidth,
  };
}

/** Generate human-friendly linear axis ticks between min and max */
export function niceLinearTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const range = max - min;
  const roughStep = range / Math.max(count - 1, 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;
  let step: number;
  if (normalized <= 1.5) step = magnitude;
  else if (normalized <= 3.5) step = 2 * magnitude;
  else if (normalized <= 7.5) step = 5 * magnitude;
  else step = 10 * magnitude;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= end + step * 0.001; t += step) {
    ticks.push(Math.round(t * 1e10) / 1e10);
  }
  return ticks;
}

/** Format number with locale-aware thousand separators */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/** SVG path for a rect with only the right corners rounded */
export function roundedRightRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  if (w <= 0) return "";
  r = Math.min(r, w / 2, h / 2);
  return [
    `M ${x},${y}`,
    `H ${x + w - r}`,
    `Q ${x + w},${y} ${x + w},${y + r}`,
    `V ${y + h - r}`,
    `Q ${x + w},${y + h} ${x + w - r},${y + h}`,
    `H ${x}`,
    `Z`,
  ].join(" ");
}

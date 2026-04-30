// Shared geometry helpers: the step-trace and the pen overlay both use
// the same conversion functions so the pen tip always equals the line end.

export const VIEW_W = 1000;
export const VIEW_H = 300;
export const STEP_PX = 4; // visual rise per response
export const PIP_PX = 10; // reinforcer pip length (downward)
export const BASE_Y = VIEW_H - 20;

export function timeToX(t: number, xMin: number, windowSec: number): number {
  return ((t - xMin) / windowSec) * VIEW_W;
}

export function countToY(count: number): number {
  return Math.max(20, BASE_Y - count * STEP_PX);
}

export function autoWindow(maxT: number): number {
  const target = Math.max(120, maxT * 1.1);
  for (const s of [30, 60, 120, 300, 600, 1200, 1800, 3600]) {
    if (s >= target) return s;
  }
  return Math.ceil(target / 600) * 600;
}

// Cumulative count at wall time ``t`` given the response-time series.
export function countAt(responses: readonly number[], t: number): number {
  let c = 0;
  for (const r of responses) {
    if (r <= t) c += 1;
    else break;
  }
  return c;
}

export type TracePoint = { x: number; y: number };

// Build the ``d`` attribute for a step-after SVG path. The returned
// ``endpoint`` is what the pen overlay should be pinned to.
export function buildTrace(
  responses: readonly number[],
  maxT: number,
  xMin: number,
  windowSec: number,
): { d: string; endpoint: TracePoint } {
  let d = "";
  let count = 0;
  let py = countToY(0);
  const x0 = timeToX(xMin, xMin, windowSec);
  d += `M ${x0.toFixed(2)} ${py.toFixed(2)} `;
  for (const t of responses) {
    const x = timeToX(t, xMin, windowSec);
    count += 1;
    d += `L ${x.toFixed(2)} ${py.toFixed(2)} `;
    py = countToY(count);
    d += `L ${x.toFixed(2)} ${py.toFixed(2)} `;
  }
  const xEnd = timeToX(Math.min(maxT, xMin + windowSec), xMin, windowSec);
  d += `L ${xEnd.toFixed(2)} ${py.toFixed(2)}`;
  return { d, endpoint: { x: xEnd, y: py } };
}

"use client";

import { useMemo } from "react";
import type { Snapshot } from "./useSnapshotStream";
import {
  BASE_Y,
  PIP_PX,
  VIEW_H,
  VIEW_W,
  autoWindow,
  buildTrace,
  countAt,
  countToY,
  timeToX,
} from "./geometry";

type Props = {
  snapshot: Snapshot | null;
  connectionState: "idle" | "connecting" | "live" | "stale";
};

// Photo-realistic kymograph shell whose pen tip is glued to the trace
// endpoint. Responses, pips, and pen position are all derived from the
// same snapshot in the same render.
export function RecorderShell({ snapshot, connectionState }: Props) {
  const { d, endpoint, pips, windowLabel } = useMemo(() => {
    const responses = snapshot?.response_times ?? [];
    const rfs = snapshot?.reinforcement_times ?? [];
    const wallT = snapshot?.last_event_time ?? 0;
    const maxT = Math.max(
      wallT ?? 0,
      responses.length ? responses[responses.length - 1] : 0,
      rfs.length ? rfs[rfs.length - 1] : 0,
    );
    const windowSec = autoWindow(maxT);
    const xMin = Math.max(0, maxT - windowSec);
    const { d, endpoint } = buildTrace(responses, maxT, xMin, windowSec);
    const pips = rfs
      .filter((t) => t >= xMin)
      .map((t) => ({
        x: timeToX(t, xMin, windowSec),
        y: countToY(countAt(responses, t)),
      }));
    const windowLabel = `${xMin.toFixed(0)} – ${(xMin + windowSec).toFixed(0)} s`;
    return { d, endpoint, pips, windowLabel };
  }, [snapshot]);

  return (
    <section className="relative overflow-hidden rounded-xl border border-[#221612] bg-gradient-to-b from-[#6b4a2e] to-[#3a2a1b] shadow-lg">
      <header className="flex items-center justify-between border-b-2 border-[#4a4d54] bg-gradient-to-b from-[#d7d9dd] to-[#8e9197] px-5 py-2 text-[12px] tracking-[0.2em] text-[#1a1a1a]">
        <span className="font-bold">CUMULATIVE RECORDER</span>
        <span className="text-[10px] text-[#55585e]">MODEL OK-1</span>
      </header>

      <div className="grid grid-cols-[56px_1fr] gap-3 px-6 py-5">
        <div className="relative rounded-[28px] border border-[#3b3e44] shadow-inner" style={drumStyle} />
        <div className="relative aspect-[1000/300] overflow-hidden rounded-sm border border-[#5a432a] bg-[#f4e8c8] shadow-inner">
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className="block h-full w-full">
            <defs>
              <pattern id="crec-grid" width="50" height="25" patternUnits="userSpaceOnUse">
                <path d="M50 0H0V25" fill="none" stroke="#d8c9a7" strokeWidth="0.4" />
              </pattern>
              <pattern id="crec-grid-major" width="250" height="100" patternUnits="userSpaceOnUse">
                <path d="M250 0H0V100" fill="none" stroke="#b49663" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="#f4e8c8" />
            <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#crec-grid)" />
            <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#crec-grid-major)" />
            <path d={d} fill="none" stroke="#1a1a1a" strokeWidth={1.4} strokeLinejoin="miter" />
            {pips.map((p, i) => (
              <line
                key={i}
                x1={p.x}
                x2={p.x}
                y1={p.y}
                y2={p.y + PIP_PX}
                stroke="#b2400e"
                strokeWidth={1.6}
              />
            ))}
            {/* Pen overlay: pinned exactly to the trace endpoint. */}
            <g transform={`translate(${endpoint.x},${endpoint.y})`}>
              <line x1={0} y1={Math.min(0, -60)} x2={0} y2={Math.max(0, BASE_Y - endpoint.y)} stroke="#555" strokeWidth={1} />
              <circle cx={0} cy={-60} r={4} fill="#888" stroke="#222" strokeWidth={0.5} />
              <circle cx={0} cy={0} r={2} fill="#1a1a1a" />
            </g>
          </svg>
          <span className="pointer-events-none absolute bottom-1 right-2 font-mono text-[10px] tracking-wider text-[#5a432a]">
            {windowLabel}
          </span>
        </div>
      </div>

      <footer className="flex items-center gap-4 px-6 pb-3 text-[11px] text-[#f1e4bd]">
        <span><span className="mr-1 inline-block h-2 w-3 bg-black align-middle" />response (step)</span>
        <span><span className="mr-1 inline-block h-2 w-[2px] border-l-2 border-[#b2400e] align-middle" />reinforcer (pip)</span>
        <span className={`ml-auto opacity-70 ${connectionState === "live" ? "text-emerald-300" : connectionState === "stale" ? "text-red-300" : ""}`}>
          {connectionState}
        </span>
      </footer>
    </section>
  );
}

const drumStyle = {
  background:
    "repeating-linear-gradient(90deg,#b8babf 0 2px,#7d8087 2px 4px), linear-gradient(180deg,#dcdee2 0%,#888b91 100%)",
  boxShadow: "inset 0 0 12px rgba(0,0,0,0.6), 2px 2px 8px rgba(0,0,0,0.5)",
} as const;

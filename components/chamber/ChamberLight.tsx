"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ChamberLightProps } from "./types";

export function ChamberLight({
  state,
  cx = 0,
  cy = 0,
  r = 10,
}: ChamberLightProps & { cx?: number; cy?: number; r?: number }) {
  const reduce = useReducedMotion();
  const on = state === "on" || state === "blink";

  const animate =
    state === "blink" && !reduce
      ? { opacity: [1, 0.25, 1] }
      : { opacity: 1 };

  const transition =
    state === "blink" && !reduce
      ? { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
      : { duration: 0.12 };

  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* Base socket */}
      <circle r={r + 3} fill="#0f1114" />
      <circle r={r + 2} fill="#1e2126" stroke="#0a0b0e" strokeWidth="0.5" />

      {/* Bulb */}
      <motion.circle
        r={r}
        fill={on ? "#e8b755" : "#2a2d31"}
        style={{
          filter: on ? "drop-shadow(0 0 8px #e8b755)" : "none",
        }}
        animate={animate}
        transition={transition}
      />
      {/* Highlight */}
      {on && (
        <circle
          cx={-r / 3}
          cy={-r / 3}
          r={r / 3.5}
          fill="#fff6d6"
          opacity="0.55"
        />
      )}
    </g>
  );
}

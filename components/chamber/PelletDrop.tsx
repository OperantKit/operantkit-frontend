"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PelletDropProps } from "./types";

type Props = PelletDropProps & {
  originX: number;
  originY: number;
  dishX: number;
  dishY: number;
};

export function PelletDrop({ trigger, originX, originY, dishX, dishY }: Props) {
  const reduce = useReducedMotion();
  if (trigger <= 0) return null;

  const midX = originX + (dishX - originX) * 0.25;
  const midY = originY + (dishY - originY) * 0.25;

  const anim = reduce
    ? {
        cx: [originX, dishX],
        cy: [originY, dishY],
        opacity: [0, 1, 1],
        transition: { duration: 0.016, times: [0, 0.5, 1] },
      }
    : {
        cx: [originX, originX, midX, dishX],
        cy: [originY, originY, midY, dishY],
        opacity: [0, 1, 1, 1],
        transition: {
          duration: 1.69,
          times: [0, 0.29, 0.41, 1.0],
          ease: "easeIn" as const,
        },
      };

  return (
    <motion.g key={trigger}>
      <motion.circle
        r={4}
        fill="#d4a373"
        stroke="#8a5a2e"
        strokeWidth="0.5"
        initial={{ opacity: 0, cx: originX, cy: originY }}
        animate={anim}
        onAnimationComplete={() => {
          /* hidden after completion via opacity final state */
        }}
      />
      <motion.circle
        r={1.2}
        fill="#f3d8a8"
        opacity="0.7"
        initial={{ opacity: 0 }}
        animate={{
          cx: reduce ? [originX - 1, dishX - 1] : [originX - 1, originX - 1, midX - 1, dishX - 1],
          cy: reduce ? [originY - 1, dishY - 1] : [originY - 1, originY - 1, midY - 1, dishY - 1],
          opacity: [0, 0.7, 0.7, 0.7],
          transition: reduce
            ? { duration: 0.016 }
            : { duration: 1.69, times: [0, 0.29, 0.41, 1.0], ease: "easeIn" as const },
        }}
      />
    </motion.g>
  );
}

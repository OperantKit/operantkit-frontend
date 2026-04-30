"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { useChamberAudio } from "../../hooks/useChamberAudio";
import type { ChamberLeverProps } from "./types";

type Props = ChamberLeverProps & {
  x?: number;
  y?: number;
  scale?: number;
};

export function ChamberLever({
  disabled = false,
  pressed: pressedProp,
  onPress,
  onRelease,
  ariaLabel = "Operant lever",
  x = 0,
  y = 0,
  scale = 1,
}: Props) {
  const reduce = useReducedMotion();
  const audio = useChamberAudio();
  const [selfPressed, setSelfPressed] = useState(false);
  const pressed = pressedProp ?? selfPressed;

  const handleDown = () => {
    if (disabled) return;
    audio.playLeverDown();
    setSelfPressed(true);
    onPress?.();
  };
  const handleUp = () => {
    if (disabled) return;
    audio.playLeverUp();
    setSelfPressed(false);
    onRelease?.();
  };

  const pressedAnim = reduce
    ? { scaleY: pressed ? 0.9 : 1 }
    : pressed
      ? { scaleY: 0.9, y: 6, rotate: -3 }
      : { scaleY: 1, y: 0, rotate: 0 };

  const idleAnim =
    !pressed && !disabled && !reduce ? { opacity: [0.92, 1] } : { opacity: 1 };

  return (
    <foreignObject
      x={x}
      y={y}
      width={64 * scale}
      height={96 * scale}
      style={{ overflow: "visible" }}
    >
      <motion.button
        type="button"
        aria-pressed={pressed}
        aria-label={`${ariaLabel}${disabled ? " (disabled)" : pressed ? " (pressed)" : " (active)"}`}
        disabled={disabled}
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerLeave={() => pressed && handleUp()}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !pressed) {
            e.preventDefault();
            handleDown();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleUp();
          }
        }}
        animate={{ ...idleAnim, ...pressedAnim }}
        transition={{
          scaleY: { type: "spring", stiffness: 400, damping: 20 },
          y: { type: "spring", stiffness: 400, damping: 20 },
          rotate: { type: "spring", stiffness: 400, damping: 20 },
          opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: disabled ? "not-allowed" : "pointer",
          minWidth: 44,
          minHeight: 44,
          width: 64 * scale,
          height: 96 * scale,
          touchAction: "none",
          opacity: disabled ? 0.35 : 1,
          transformOrigin: "50% 90%",
        }}
      >
        <svg
          viewBox="0 0 64 96"
          width={64 * scale}
          height={96 * scale}
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="leverMetal" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#6b7078" />
              <stop offset="50%" stopColor="#b8bdc4" />
              <stop offset="100%" stopColor="#6b7078" />
            </linearGradient>
          </defs>
          {/* Mount plate */}
          <rect x="14" y="76" width="36" height="16" rx="2" fill="#1a1c20" />
          <rect x="16" y="78" width="32" height="12" rx="1" fill="#2a2d31" />
          {/* Lever arm */}
          <rect
            x="28"
            y="20"
            width="8"
            height="62"
            rx="3"
            fill="url(#leverMetal)"
            stroke="#2a2d31"
            strokeWidth="0.5"
          />
          {/* Tip knob */}
          <circle cx="32" cy="20" r="9" fill="#4a4e55" stroke="#1a1c20" strokeWidth="1" />
          <circle cx="30" cy="18" r="3" fill="#c8ccd3" opacity="0.6" />
          {/* Pivot */}
          <circle cx="32" cy="84" r="3" fill="#0a0b0e" />
        </svg>
      </motion.button>
    </foreignObject>
  );
}

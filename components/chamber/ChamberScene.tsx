"use client";

import { motion } from "framer-motion";
import { ChamberDish } from "./ChamberDish";
import { ChamberFeeder } from "./ChamberFeeder";
import { ChamberFrame } from "./ChamberFrame";
import { ChamberLever } from "./ChamberLever";
import { ChamberLight } from "./ChamberLight";
import { ChamberWall } from "./ChamberWall";
import { PelletDrop } from "./PelletDrop";
import { IMPLEMENTED_KINDS, type ChamberSceneProps } from "./types";

function ComingSoon({ kind }: { kind: string }) {
  return (
    <ChamberFrame>
      <ChamberWall>
        <g opacity="0.35">
          {/* Ghost silhouette of lever + light */}
          <circle cx="200" cy="60" r="8" fill="#2a2d31" />
          <rect x="300" y="140" width="8" height="60" rx="3" fill="#2a2d31" />
        </g>
        <text
          x="200"
          y="160"
          textAnchor="middle"
          fontSize="18"
          fontFamily="system-ui, sans-serif"
          fill="#4a4e55"
          letterSpacing="2"
        >
          {kind}
        </text>
        <text
          x="200"
          y="185"
          textAnchor="middle"
          fontSize="11"
          fontFamily="system-ui, sans-serif"
          fill="#3a3d42"
          letterSpacing="4"
        >
          COMING SOON
        </text>
      </ChamberWall>
    </ChamberFrame>
  );
}

function SingleLeverScene({
  onResponse,
  reinforcedSeq,
  disabled,
  decor,
}: {
  onResponse: (side?: "L" | "R") => void;
  reinforcedSeq: number;
  disabled?: boolean;
  decor?: "clock" | null;
}) {
  const feederCx = 200;
  const feederCy = 210;
  const dishCx = 200;
  const dishCy = 258;

  return (
    <ChamberFrame>
      <ChamberWall>
        {/* Optional decor */}
        {decor === "clock" && (
          <g opacity="0.18" transform="translate(80 70)">
            <circle r="22" fill="none" stroke="#4a4e55" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="-16" stroke="#4a4e55" strokeWidth="1.2" />
            <line x1="0" y1="0" x2="12" y2="4" stroke="#4a4e55" strokeWidth="1" />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * Math.PI) / 6;
              return (
                <line
                  key={i}
                  x1={Math.sin(a) * 20}
                  y1={-Math.cos(a) * 20}
                  x2={Math.sin(a) * 22}
                  y2={-Math.cos(a) * 22}
                  stroke="#4a4e55"
                  strokeWidth="0.8"
                />
              );
            })}
          </g>
        )}

        {/* Lights: SD always on (center), decor on sides */}
        <ChamberLight state="off" cx={120} cy={48} r={8} />
        <ChamberLight state="on" cx={200} cy={48} r={10} />
        <ChamberLight state="off" cx={280} cy={48} r={8} />

        {/* Reinforcer flash — key-driven, re-mounts on every reinforcement */}
        {reinforcedSeq > 0 && (
          <motion.circle
            key={`flash-${reinforcedSeq}`}
            cx={200}
            cy={48}
            r={30}
            fill="#e8b755"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ filter: "blur(6px)", pointerEvents: "none" }}
          />
        )}

        {/* Feeder + Dish */}
        <ChamberFeeder cx={feederCx} cy={feederCy} />
        <ChamberDish cx={dishCx} cy={dishCy} />

        {/* Pellet drop from feeder to dish */}
        <PelletDrop
          trigger={reinforcedSeq}
          originX={feederCx}
          originY={feederCy + 7}
          dishX={dishCx}
          dishY={dishCy - 2}
        />

        {/* Single lever on right side */}
        <ChamberLever
          x={296}
          y={126}
          disabled={disabled}
          onPress={() => onResponse()}
          ariaLabel="Right lever"
        />
      </ChamberWall>
    </ChamberFrame>
  );
}

export function ChamberScene({
  kind,
  onResponse,
  reinforcedSeq,
  disabled,
}: ChamberSceneProps) {
  if (!IMPLEMENTED_KINDS.includes(kind)) {
    return <ComingSoon kind={kind} />;
  }

  const decor = kind === "FI" || kind === "VI" ? "clock" : null;

  return (
    <SingleLeverScene
      onResponse={onResponse}
      reinforcedSeq={reinforcedSeq}
      disabled={disabled}
      decor={decor}
    />
  );
}

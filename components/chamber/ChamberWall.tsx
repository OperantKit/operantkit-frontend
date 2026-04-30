import type { ReactNode } from "react";

export function ChamberWall({ children }: { children?: ReactNode }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Operant chamber interior"
    >
      <defs>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1f24" />
          <stop offset="100%" stopColor="#2a2d31" />
        </linearGradient>
        <pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="1.2" fill="#0c0d10" />
        </pattern>
        <filter id="innerShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
          <feOffset dy="4" result="off" />
          <feComposite
            in="off"
            in2="SourceAlpha"
            operator="arithmetic"
            k2="-1"
            k3="1"
            result="shadow"
          />
          <feColorMatrix
            in="shadow"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"
          />
          <feComposite in2="SourceGraphic" operator="over" />
        </filter>
      </defs>

      <rect x="0" y="0" width="400" height="300" fill="url(#wallGrad)" />

      {/* Ceiling vents */}
      <g opacity="0.55">
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x={60 + i * 35}
            y={14}
            width="22"
            height="4"
            rx="1"
            fill="#0a0b0e"
          />
        ))}
      </g>

      {/* Floor: punched metal */}
      <rect x="0" y="240" width="400" height="60" fill="#17191d" />
      <rect x="0" y="240" width="400" height="60" fill="url(#grid)" />
      <rect
        x="0"
        y="238"
        width="400"
        height="2"
        fill="#3a3d42"
        opacity="0.6"
      />

      {/* Inner shadow frame */}
      <rect
        x="4"
        y="4"
        width="392"
        height="292"
        fill="transparent"
        stroke="#000"
        strokeOpacity="0.6"
        strokeWidth="1"
        filter="url(#innerShadow)"
      />

      {children}
    </svg>
  );
}

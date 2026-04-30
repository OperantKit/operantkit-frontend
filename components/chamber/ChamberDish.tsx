export function ChamberDish({
  cx = 200,
  cy = 258,
}: {
  cx?: number;
  cy?: number;
}) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <defs>
        <radialGradient id="dishGrad" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#3a3d42" />
          <stop offset="100%" stopColor="#14161a" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="0" rx="24" ry="6" fill="url(#dishGrad)" />
      <ellipse cx="0" cy="-1" rx="20" ry="4" fill="#0a0b0e" opacity="0.6" />
    </g>
  );
}

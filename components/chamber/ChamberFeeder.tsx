export function ChamberFeeder({
  cx = 200,
  cy = 200,
}: {
  cx?: number;
  cy?: number;
}) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* Feeder housing */}
      <rect x="-22" y="-18" width="44" height="36" rx="3" fill="#0f1114" />
      <rect x="-20" y="-16" width="40" height="32" rx="2" fill="#1a1c20" />
      {/* Aperture (dark mouth) */}
      <rect x="-14" y="0" width="28" height="14" rx="2" fill="#050607" />
      <rect x="-13" y="1" width="26" height="2" fill="#0a0b0e" />
      {/* Magazine light hint (small dim bulb above aperture) */}
      <circle cx="0" cy="-6" r="2.5" fill="#2a2d31" />
    </g>
  );
}

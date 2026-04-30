import type { ReactNode } from "react";

export function ChamberFrame({ children }: { children?: ReactNode }) {
  return (
    <div
      className="relative rounded-2xl bg-[#16191e] shadow-[inset_0_4px_24px_rgba(0,0,0,0.6),0_10px_40px_rgba(0,0,0,0.5)] ring-1 ring-black/50 overflow-hidden"
      style={{ aspectRatio: "4 / 3" }}
    >
      {children}
    </div>
  );
}

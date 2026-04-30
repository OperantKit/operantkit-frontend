"use client";

// Cumulative-recorder simulator page.
//
// Connects to the Python-side cumulative-recorder-sim FastAPI backend
// (default http://127.0.0.1:8765). The backend owns the Session and
// schedule engine; this page only renders and forwards button presses.

import { useCallback, useEffect, useMemo, useState } from "react";
import { RecorderShell } from "@/components/CumulativeRecorder/RecorderShell";
import { useSnapshotStream } from "@/components/CumulativeRecorder/useSnapshotStream";

const PRESETS = ["FR5", "FR10", "VR5", "VR10", "FI10s", "VI10s", "VI30s", "CRF", "EXT"] as const;

const DEFAULT_BACKEND = "http://127.0.0.1:8765";

type Status = {
  schedule: string;
  response_count: number;
  reinforcement_count: number;
  elapsed: number;
};

export default function CumulativeRecorderPage() {
  const [backend, setBackend] = useState(DEFAULT_BACKEND);
  const [status, setStatus] = useState<Status | null>(null);
  const eventsUrl = useMemo(() => `${backend}/viz/events`, [backend]);
  const { snapshot, connectionState } = useSnapshotStream(eventsUrl);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`${backend}/status`);
      if (r.ok) setStatus(await r.json());
    } catch {
      /* ignore */
    }
  }, [backend]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const post = useCallback(
    async (path: string, body?: unknown) => {
      try {
        await fetch(`${backend}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } catch {
        /* ignore */
      }
      refresh();
    },
    [backend, refresh],
  );

  // Nudge tick so interval schedules can arm.
  useEffect(() => {
    const id = setInterval(() => {
      fetch(`${backend}/tick`, { method: "POST" }).catch(() => {});
    }, 500);
    return () => clearInterval(id);
  }, [backend]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        post("/response");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [post]);

  const responses = snapshot?.response_times.length ?? status?.response_count ?? 0;
  const reinforcers = snapshot?.reinforcement_times.length ?? status?.reinforcement_count ?? 0;
  const elapsedMin = Math.max(1e-6, (snapshot?.last_event_time ?? status?.elapsed ?? 0) / 60);
  const rate = (responses / elapsedMin).toFixed(1);

  return (
    <main className="grid min-h-screen grid-cols-1 gap-6 bg-[#0c0e12] p-6 text-[#e8e6df] md:grid-cols-[360px_1fr]">
      <section className="flex flex-col gap-4 rounded-xl border border-[#2a3038] bg-[#1b1f27] p-5">
        <div className="flex items-baseline justify-between border-b border-[#2a3038] pb-2">
          <span className="text-[11px] tracking-[0.18em] text-[#9aa0ab]">SCHEDULE</span>
          <span className="font-mono text-[22px] text-[#e8a44c]">{status?.schedule ?? "—"}</span>
        </div>

        <button
          type="button"
          aria-label="Response"
          onClick={() => post("/response")}
          className="relative aspect-square w-full rounded-full shadow-xl transition active:scale-[0.97]"
          style={buttonStyle}
        >
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[14px] font-bold tracking-[0.25em] text-[#3a2407]">
            RESPOND
          </span>
        </button>

        <div className="grid grid-cols-3 gap-2">
          <Counter label="RESPONSES" value={responses} />
          <Counter label="REINFORCERS" value={reinforcers} tint />
          <Counter label="RATE /min" value={rate} />
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {PRESETS.map((token) => (
            <button
              key={token}
              type="button"
              onClick={() => post("/select", { token })}
              className={`rounded border border-[#2a3038] py-2 font-mono text-[12px] transition ${
                status?.schedule === token
                  ? "border-[#e8a44c] bg-[#e8a44c] text-[#2a1805]"
                  : "bg-[#13161c] text-[#e8e6df] hover:bg-[#1f242c]"
              }`}
            >
              {token}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => post("/reset")}
            className="flex-1 rounded border border-[#2a3038] py-2 text-[12px] tracking-[0.15em] hover:bg-[#1f242c]"
          >
            RESET
          </button>
        </div>

        <label className="flex flex-col gap-1 text-[10px] tracking-[0.15em] text-[#9aa0ab]">
          BACKEND
          <input
            value={backend}
            onChange={(e) => setBackend(e.target.value)}
            className="rounded border border-[#2a3038] bg-[#13161c] px-2 py-1 font-mono text-[11px]"
          />
        </label>
      </section>

      <RecorderShell snapshot={snapshot} connectionState={connectionState} />
    </main>
  );
}

function Counter({ label, value, tint = false }: { label: string; value: number | string; tint?: boolean }) {
  return (
    <div className="flex flex-col rounded border border-[#2a3038] bg-[#13161c] p-2">
      <span className="text-[10px] tracking-[0.15em] text-[#9aa0ab]">{label}</span>
      <span className={`font-mono text-[22px] ${tint ? "text-[#efc65b]" : "text-[#e8e6df]"}`}>{value}</span>
    </div>
  );
}

const buttonStyle = {
  background:
    "radial-gradient(circle at 30% 28%,#f4c66a 0%,#d88a1f 55%,#7c4b0f 100%), radial-gradient(circle at 30% 25%,#555 0%,#222 50%,#0a0a0a 100%)",
  boxShadow: "inset 0 -8px 16px rgba(0,0,0,0.4), inset 0 4px 10px rgba(255,220,160,0.4), 0 8px 18px rgba(0,0,0,0.45)",
  cursor: "pointer",
  border: "none",
} as const;

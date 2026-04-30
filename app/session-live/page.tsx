"use client";

// Live session dashboard. Subscribes to the session-visualizer SSE
// endpoint (default http://127.0.0.1:8765/events) and renders a
// cumulative response record plus the current snapshot metadata.
//
// The page is purely a *consumer*: it never writes back to the experiment
// process, so any lag here has zero effect on session correctness.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SinkStats = {
  emitted: number;
  enqueued: number;
  dropped: number;
};

type FitResult = {
  name: string;
  value: unknown | null;
  error: string | null;
};

type Snapshot = {
  wall_clock: number;
  last_event_time: number | null;
  response_times: number[];
  reinforcement_times: number[];
  state: string;
  sink_stats: SinkStats;
  fits: Record<string, FitResult> | null;
};

type CumulativePoint = { t: number; n: number };

const DEFAULT_URL =
  process.env.NEXT_PUBLIC_SESSION_VISUALIZER_URL ??
  "http://127.0.0.1:8765/events";

function toCumulative(times: readonly number[]): CumulativePoint[] {
  if (times.length === 0) return [];
  const out: CumulativePoint[] = [{ t: times[0], n: 0 }];
  for (let i = 0; i < times.length; i += 1) {
    out.push({ t: times[i], n: i + 1 });
  }
  return out;
}

export default function SessionLivePage() {
  const [url, setUrl] = useState<string>(DEFAULT_URL);
  const [connected, setConnected] = useState<boolean>(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;
    const es = new EventSource(url);
    esRef.current = es;
    es.addEventListener("open", () => setConnected(true));
    es.addEventListener("error", () => setConnected(false));
    es.addEventListener("snapshot", (ev: MessageEvent) => {
      try {
        const parsed = JSON.parse(ev.data) as Snapshot;
        setSnapshot(parsed);
      } catch {
        // best-effort: drop malformed messages silently
      }
    });
    return () => {
      es.close();
      esRef.current = null;
    };
  }, [url]);

  const cumulative = useMemo(
    () => toCumulative(snapshot?.response_times ?? []),
    [snapshot?.response_times],
  );
  const reinforcementPoints = useMemo(
    () =>
      (snapshot?.reinforcement_times ?? []).map((t, i) => ({
        t,
        n: i + 1,
      })),
    [snapshot?.reinforcement_times],
  );

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Live session</h1>
        <p className="text-sm text-neutral-600">
          Non-blocking observer of a running OperantKit session. Reflects
          the current snapshot; cumulative events are authoritative, fit
          results are opportunistic.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="font-medium">SSE URL</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-80 rounded border border-neutral-300 px-2 py-1 font-mono"
          />
        </label>
        <span
          className={
            "rounded px-2 py-0.5 text-xs " +
            (connected
              ? "bg-emerald-100 text-emerald-800"
              : "bg-neutral-200 text-neutral-700")
          }
        >
          {connected ? "connected" : "disconnected"}
        </span>
        {snapshot && (
          <>
            <span>state: {snapshot.state}</span>
            <span>responses: {snapshot.response_times.length}</span>
            <span>reinforcers: {snapshot.reinforcement_times.length}</span>
            <span
              className={
                snapshot.sink_stats.dropped > 0
                  ? "text-amber-700 font-medium"
                  : "text-neutral-500"
              }
            >
              dropped: {snapshot.sink_stats.dropped}
            </span>
          </>
        )}
      </section>

      <section className="h-80 w-full">
        <h2 className="text-lg font-medium mb-2">Cumulative record</h2>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={cumulative}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              type="number"
              domain={["auto", "auto"]}
              label={{ value: "t (s)", position: "insideBottomRight" }}
            />
            <YAxis dataKey="n" />
            <Tooltip />
            <Line
              type="stepAfter"
              dataKey="n"
              stroke="#2563eb"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="h-40 w-full">
        <h2 className="text-lg font-medium mb-2">Reinforcement ticks</h2>
        <ResponsiveContainer width="100%" height="90%">
          <ScatterChart data={reinforcementPoints}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              type="number"
              domain={["auto", "auto"]}
              label={{ value: "t (s)", position: "insideBottomRight" }}
            />
            <YAxis dataKey="n" />
            <Tooltip />
            <Scatter dataKey="n" fill="#dc2626" />
          </ScatterChart>
        </ResponsiveContainer>
      </section>

      {snapshot?.fits && Object.keys(snapshot.fits).length > 0 && (
        <section>
          <h2 className="text-lg font-medium mb-2">Fits</h2>
          <pre className="bg-neutral-100 rounded p-3 text-xs overflow-auto">
            {JSON.stringify(snapshot.fits, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}

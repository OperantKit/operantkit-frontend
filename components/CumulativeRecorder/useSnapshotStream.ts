"use client";

import { useEffect, useRef, useState } from "react";

export type Snapshot = {
  wall_clock: number;
  last_event_time: number | null;
  response_times: number[];
  reinforcement_times: number[];
  state: string;
  sink_stats: { emitted: number; enqueued: number; dropped: number };
};

// Subscribes to the canonical session-visualizer SSE stream. The stream
// is the single source of truth for both the step-trace and the pen-tip
// position — the pen cannot drift from the line because they share a
// single snapshot per render.
export function useSnapshotStream(eventsUrl: string) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  // The state reported by the EventSource, tagged with the URL it belongs to.
  // A URL with no report yet is "connecting".
  const [reported, setReported] = useState<{ url: string; state: "live" | "stale" } | null>(null);
  const connectionState: "idle" | "connecting" | "live" | "stale" =
    reported !== null && reported.url === eventsUrl ? reported.state : "connecting";
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(eventsUrl);
    esRef.current = es;

    const handle = (ev: MessageEvent) => {
      try {
        const snap = JSON.parse(ev.data) as Snapshot;
        setSnapshot(snap);
      } catch {
        /* ignore */
      }
    };

    es.addEventListener("snapshot", handle as EventListener);
    es.onmessage = handle;
    es.onopen = () => setReported({ url: eventsUrl, state: "live" });
    es.onerror = () => setReported({ url: eventsUrl, state: "stale" });

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [eventsUrl]);

  return { snapshot, connectionState } as const;
}

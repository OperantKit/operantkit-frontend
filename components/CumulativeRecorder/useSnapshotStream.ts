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
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "live" | "stale">(
    "idle",
  );
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setConnectionState("connecting");
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
    es.onopen = () => setConnectionState("live");
    es.onerror = () => setConnectionState("stale");

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [eventsUrl]);

  return { snapshot, connectionState } as const;
}

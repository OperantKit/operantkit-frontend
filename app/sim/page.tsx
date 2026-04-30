"use client";

import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChamberScene } from "../../components/chamber/ChamberScene";
import type { SceneKind } from "../../components/chamber/types";
import { useChamberAudio } from "../../hooks/useChamberAudio";
import { loadContingency } from "../../lib/contingency";

type ContingencyModule = Awaited<ReturnType<typeof loadContingency>>;
type ScheduleInstance = ReturnType<ContingencyModule["Schedule"]["fr"]>;

type Point = { t: number; responses: number; reinforcers: number };

const ALL_KINDS: SceneKind[] = [
  "FR",
  "FI",
  "VI",
  "VR",
  "DRL",
  "DRH",
  "DRO",
  "CONC",
];

const SCHEDULE_CONFIGS: Record<
  string,
  {
    label: string;
    kind: SceneKind;
    build: (m: ContingencyModule) => ScheduleInstance;
  }
> = {
  FR5: { label: "FR 5", kind: "FR", build: (m) => m.Schedule.fr(5n) },
  FR10: { label: "FR 10", kind: "FR", build: (m) => m.Schedule.fr(10n) },
  FI15: { label: "FI 15s", kind: "FI", build: (m) => m.Schedule.fi(15) },
  VI10: { label: "VI 10s", kind: "VI", build: (m) => m.Schedule.vi(10, 12) },
  VI30: { label: "VI 30s", kind: "VI", build: (m) => m.Schedule.vi(30, 12) },
};

type ScheduleKey = keyof typeof SCHEDULE_CONFIGS;
const SCHEDULE_KEYS = Object.keys(SCHEDULE_CONFIGS) as ScheduleKey[];

export default function SimPage() {
  const [ready, setReady] = useState(false);
  const [scheduleKey, setScheduleKey] = useState<ScheduleKey>("FR5");
  const [previewKind, setPreviewKind] = useState<SceneKind | null>(null);
  const [responses, setResponses] = useState(0);
  const [reinforcers, setReinforcers] = useState(0);
  const [reinforcedSeq, setReinforcedSeq] = useState(0);
  const [points, setPoints] = useState<Point[]>([
    { t: 0, responses: 0, reinforcers: 0 },
  ]);

  const audio = useChamberAudio();
  const scheduleRef = useRef<ScheduleInstance | null>(null);
  const startedAtRef = useRef(0);
  const countsRef = useRef({ responses: 0, reinforcers: 0 });
  const modRef = useRef<ContingencyModule | null>(null);

  useEffect(() => {
    loadContingency().then((m) => {
      modRef.current = m;
      setReady(true);
    });
  }, []);

  const reset = () => {
    if (!modRef.current) return;
    scheduleRef.current?.free?.();
    scheduleRef.current = SCHEDULE_CONFIGS[scheduleKey].build(modRef.current);
    startedAtRef.current = performance.now() / 1000;
    countsRef.current = { responses: 0, reinforcers: 0 };
    setResponses(0);
    setReinforcers(0);
    setReinforcedSeq(0);
    setPoints([{ t: 0, responses: 0, reinforcers: 0 }]);
  };

  useEffect(() => {
    if (ready) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, scheduleKey]);

  const activeKind: SceneKind =
    previewKind ?? SCHEDULE_CONFIGS[scheduleKey].kind;
  const sceneDisabled = !ready || previewKind !== null;

  const handleResponse = () => {
    if (!scheduleRef.current || !modRef.current) return;
    const now = performance.now() / 1000 - startedAtRef.current;
    const ev = new modRef.current.ResponseEvent(now, undefined);
    const outcome = scheduleRef.current.step(now, ev);
    const counts = countsRef.current;
    counts.responses += 1;
    setResponses(counts.responses);
    let didReinforce = false;
    if (outcome.reinforced) {
      counts.reinforcers += 1;
      didReinforce = true;
      setReinforcers(counts.reinforcers);
      setReinforcedSeq((s) => s + 1);
      audio.playFeeder();
    }
    setPoints((prev) => [
      ...prev,
      { t: now, responses: counts.responses, reinforcers: counts.reinforcers },
    ]);
    outcome.free?.();
    ev.free?.();
    void didReinforce;
  };

  // Tick-only advance for interval schedules
  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      if (!scheduleRef.current) return;
      const now = performance.now() / 1000 - startedAtRef.current;
      const outcome = scheduleRef.current.step(now, undefined);
      if (outcome.reinforced) {
        const counts = countsRef.current;
        counts.reinforcers += 1;
        setReinforcers(counts.reinforcers);
        setReinforcedSeq((s) => s + 1);
        audio.playFeeder();
        setPoints((prev) => [
          ...prev,
          {
            t: now,
            responses: counts.responses,
            reinforcers: counts.reinforcers,
          },
        ]);
      }
      outcome.free?.();
    }, 250);
    return () => window.clearInterval(id);
  }, [ready, audio]);

  return (
    <div className="min-h-screen bg-[#0e1013] text-zinc-200">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            Operant Chamber
          </h1>
          <span className="text-sm text-zinc-400">
            — {SCHEDULE_CONFIGS[scheduleKey].label}
            {previewKind && previewKind !== SCHEDULE_CONFIGS[scheduleKey].kind
              ? ` (preview: ${previewKind})`
              : ""}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span
            className={`px-2 py-1 rounded ${
              ready
                ? "bg-[#4fd1c5]/20 text-[#4fd1c5]"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {ready ? "WASM ready" : "loading…"}
          </span>
          <button
            onClick={audio.toggleMute}
            className="px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500"
            aria-label={audio.muted ? "Unmute" : "Mute"}
          >
            {audio.muted ? "🔇 muted" : "🔊 sound"}
          </button>
        </div>
      </header>

      <main className="grid lg:grid-cols-2 gap-6 p-6">
        <div className="flex flex-col gap-4">
          <ChamberScene
            key={activeKind}
            kind={activeKind}
            onResponse={handleResponse}
            reinforcedSeq={reinforcedSeq}
            disabled={sceneDisabled}
          />

          <div className="flex flex-wrap gap-2">
            {ALL_KINDS.map((k) => {
              const active = k === activeKind;
              return (
                <button
                  key={k}
                  onClick={() => setPreviewKind(active ? null : k)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    active
                      ? "border-[#e8b755] text-[#e8b755] bg-[#e8b755]/10"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {k}
                </button>
              );
            })}
            {previewKind && (
              <button
                onClick={() => setPreviewKind(null)}
                className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-400 hover:border-zinc-500"
              >
                ← live
              </button>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="rounded-xl bg-[#16191e] p-4 border border-zinc-800">
            <h2 className="text-sm font-medium mb-3 text-zinc-300">Schedule</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {SCHEDULE_KEYS.map((key) => {
                const active = key === scheduleKey;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setPreviewKind(null);
                      setScheduleKey(key);
                    }}
                    disabled={!ready}
                    className={`text-sm px-3 py-1.5 rounded border transition-colors ${
                      active
                        ? "border-[#e8b755] text-[#e8b755] bg-[#e8b755]/10"
                        : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    {SCHEDULE_CONFIGS[key].label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={reset}
              disabled={!ready}
              className="text-sm px-3 py-1.5 rounded border border-zinc-700 text-zinc-300 hover:border-zinc-500 disabled:opacity-50"
            >
              Reset
            </button>
          </section>

          <section className="rounded-xl bg-[#16191e] p-4 border border-zinc-800 grid grid-cols-2 gap-4">
            <Counter label="Responses" value={responses} accent="#4fd1c5" />
            <Counter label="Reinforcers" value={reinforcers} accent="#e8b755" />
          </section>

          <section className="rounded-xl bg-[#16191e] p-4 border border-zinc-800">
            <h2 className="text-sm font-medium mb-2 text-zinc-300">
              Cumulative record
            </h2>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points}>
                  <CartesianGrid stroke="#2a2d31" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="t"
                    type="number"
                    stroke="#6b7078"
                    tickFormatter={(v) => v.toFixed(1)}
                    label={{
                      value: "Time (s)",
                      position: "insideBottom",
                      offset: -4,
                      fill: "#6b7078",
                    }}
                  />
                  <YAxis stroke="#6b7078" />
                  <Tooltip
                    contentStyle={{
                      background: "#0e1013",
                      border: "1px solid #2a2d31",
                      color: "#e5e7eb",
                    }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="responses"
                    stroke="#4fd1c5"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="reinforcers"
                    stroke="#e8b755"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

function Counter({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
        {label}
      </div>
      <div
        className="text-3xl font-mono tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </div>
    </div>
  );
}

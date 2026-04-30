"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ChamberAudio = {
  playLeverDown: () => void;
  playLeverUp: () => void;
  playFeeder: () => void;
  muted: boolean;
  toggleMute: () => void;
};

function isUserActivated(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
    .userActivation;
  return ua ? ua.hasBeenActive : true;
}

export function useChamberAudio(): ChamberAudio {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(false);

  const ensureCtx = useCallback((): AudioContext | null => {
    if (!isUserActivated()) return null;
    if (ctxRef.current) return ctxRef.current;
    if (typeof window === "undefined") return null;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctxRef.current = new AC();
    return ctxRef.current;
  }, []);

  const tone = useCallback(
    (freq: number, type: OscillatorType, durMs: number, gain = 0.08) => {
      if (muted) return;
      const ctx = ensureCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const now = ctx.currentTime;
      g.gain.setValueAtTime(gain, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + durMs / 1000);
      osc.connect(g).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + durMs / 1000);
    },
    [muted, ensureCtx]
  );

  const noiseBurst = useCallback(
    (durMs: number, gain = 0.05) => {
      if (muted) return;
      const ctx = ensureCtx();
      if (!ctx) return;
      const frames = Math.floor((ctx.sampleRate * durMs) / 1000);
      const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      g.gain.value = gain;
      src.buffer = buf;
      src.connect(g).connect(ctx.destination);
      src.start();
    },
    [muted, ensureCtx]
  );

  const playLeverDown = useCallback(() => {
    tone(200, "square", 30, 0.09);
    noiseBurst(20, 0.04);
  }, [tone, noiseBurst]);

  const playLeverUp = useCallback(() => {
    tone(400, "sine", 40, 0.06);
  }, [tone]);

  const playFeeder = useCallback(() => {
    tone(1000, "square", 12, 0.08);
    noiseBurst(80, 0.03);
  }, [tone, noiseBurst]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  return { playLeverDown, playLeverUp, playFeeder, muted, toggleMute };
}

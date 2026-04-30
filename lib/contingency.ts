// Client-side loader for the contingency WASM engine.
//
// wasm-pack --target web produces an ES module that requires calling
// init(url) once before any WASM export is usable. We wrap that in a
// memoised loader so pages can `await loadContingency()` freely.

import init, * as Contingency from "contingency";

let ready: Promise<typeof Contingency> | null = null;

export function loadContingency(): Promise<typeof Contingency> {
  if (!ready) {
    ready = init({ module_or_path: "/contingency_bg.wasm" }).then(
      () => Contingency,
    );
  }
  return ready;
}

export type { Outcome, Reinforcer, ResponseEvent } from "contingency";
export { Schedule } from "contingency";

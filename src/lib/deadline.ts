import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Wall-clock budget for one server-side request.
 *
 * The /api/process function runs on Vercel with a 300s hard limit. When the
 * platform kills a function that has not answered yet, the browser's fetch
 * fails at the transport level and the user only sees a bare "Failed to fetch".
 * Every Gemini call inside a request therefore shares one deadline, so the
 * handler always returns a response in time instead of being killed.
 *
 * A request can also run in phases (scoring → selection → content). A phase
 * gets a tighter deadline so that, when the AI is slow, the work that matters
 * most (the written content) still has time to finish.
 */
type Store = { deadline: number; phase: number | null };

const storage = new AsyncLocalStorage<Store>();

/** Run `fn` with a request deadline of `ms` milliseconds. */
export function withRequestDeadline<T>(ms: number, fn: () => Promise<T>): Promise<T> {
  return storage.run({ deadline: Date.now() + ms, phase: null }, fn);
}

/** Milliseconds left before the request deadline (Infinity when not set). */
export function remainingMs(): number {
  const store = storage.getStore();
  if (!store) return Infinity;
  return Math.max(0, store.deadline - Date.now());
}

/** True once the request has used up its time budget. */
export function deadlineExceeded(): boolean {
  return remainingMs() <= 0;
}

/** Start a phase with its own (tighter) deadline. */
export function beginPhase(ms: number): void {
  const store = storage.getStore();
  if (store) store.phase = Date.now() + ms;
}

/** End the current phase — the remaining request budget applies again. */
export function endPhase(): void {
  const store = storage.getStore();
  if (store) store.phase = null;
}

/** True once the current phase has used up its budget. */
export function phaseExceeded(): boolean {
  const store = storage.getStore();
  if (!store || store.phase === null) return false;
  return Date.now() >= store.phase;
}

/** Clamp a per-step budget to whatever is left of the request/phase budget. */
export function clampBudget(ms: number): number {
  const store = storage.getStore();
  if (!store) return ms;
  let left = store.deadline - Date.now();
  if (store.phase !== null) left = Math.min(left, store.phase - Date.now());
  return Math.max(0, Math.min(ms, left));
}

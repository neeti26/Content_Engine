import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Wall-clock budget for one server-side request.
 *
 * The /api/process function runs on Vercel with a 300s hard limit. When the
 * platform kills a function that has not answered yet, the browser's fetch
 * fails at the transport level and the user only sees a bare "Failed to fetch".
 * Every Gemini call inside a request therefore shares one deadline, so the
 * handler always returns a response in time instead of being killed.
 */
const storage = new AsyncLocalStorage<{ deadline: number }>();

/** Run `fn` with a request deadline of `ms` milliseconds. */
export function withRequestDeadline<T>(ms: number, fn: () => Promise<T>): Promise<T> {
  return storage.run({ deadline: Date.now() + ms }, fn);
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

/** Clamp a per-step budget to whatever is left of the request budget. */
export function clampBudget(ms: number): number {
  const left = remainingMs();
  if (left === Infinity) return ms;
  return Math.max(0, Math.min(ms, left));
}

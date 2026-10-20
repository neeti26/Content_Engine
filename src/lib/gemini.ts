import { GoogleGenAI } from "@google/genai";
import { clampBudget } from "./deadline";

// ─── Multi-key rotation ───────────────────────────────────────────────────────
// Supports GEMINI_API_KEY_1 … GEMINI_API_KEY_N plus the legacy GEMINI_API_KEY.
// Keys are tried in round-robin order. On a rate-limit hit the next key is used
// immediately instead of waiting, effectively multiplying the free-tier quota.

function getAvailableKeys(): string[] {
  const keys: string[] = [];
  // Numbered keys take priority (GEMINI_API_KEY_1, _2, _3 …)
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k?.trim()) keys.push(k.trim());
  }
  // Fallback: legacy single key
  const legacy = process.env.GEMINI_API_KEY?.trim();
  if (legacy && !keys.includes(legacy)) keys.push(legacy);
  return keys;
}

// Module-level round-robin index — persists across requests in the same serverless instance
let _keyIndex = 0;

function nextKey(): string {
  const keys = getAvailableKeys();
  if (keys.length === 0) throw new Error("No GEMINI_API_KEY configured. Add GEMINI_API_KEY_1 (and optionally _2, _3) to your Vercel environment variables.");
  const key = keys[_keyIndex % keys.length];
  _keyIndex = (_keyIndex + 1) % keys.length;
  return key;
}

function getAI(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({ apiKey });
}

export function hasAnyGeminiKey(): boolean {
  return getAvailableKeys().length > 0;
}

// ─── Models ───────────────────────────────────────────────────────────────────
// gemini-2.5-flash-lite / gemini-2.5-flash are no longer served to "new user"
// keys (they answer 404 "no longer available to new users"). The free tier also
// only allows 20 requests per DAY per key per model, so the load is spread
// over several models and exhausted ones are remembered and skipped.
export interface ModelSpec {
  id: string;
  // The lite models reject a thinkingConfig, the flash models accept it.
  supportsThinking: boolean;
}

const MODELS: ModelSpec[] = [
  { id: 'gemini-3.6-flash',         supportsThinking: true },
  { id: 'gemini-3.5-flash',         supportsThinking: true },
  { id: 'gemini-3.5-flash-lite',    supportsThinking: false },
  { id: 'gemini-flash-lite-latest', supportsThinking: false },
];

/** The models the app talks to, in the order it tries them. */
export const MODEL_IDS = MODELS.map(m => m.id);
const sleep  = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// (key, model) pairs whose daily free-tier quota is already spent — skipping
// them keeps a request from retrying a bucket that cannot succeed today.
const _exhaustedBuckets = new Set<string>();

/** True when the error is the "20 requests per day" free-tier limit. */
function isDailyQuotaError(msg: string): boolean {
  if (!/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) return false;
  return /PerDay|per day|RequestsPerDay/i.test(msg) || /retry in \d+h/i.test(msg);
}

/** e.g. "11h51m30s" — how long until the daily quota resets. */
function dailyQuotaReset(msg: string): string | null {
  const m = msg.match(/Please retry in ([0-9hms.\s]+)/i);
  return m ? m[1].trim() : null;
}

/**
 * Generation config for a model.
 * - JSON mode makes Gemini answer with a single JSON document (no markdown),
 *   which is what the parser below expects.
 * - The flash models spend part of the output budget on "thinking" tokens and
 *   then return truncated, unparseable JSON — switch thinking off for them.
 */
function buildConfig(
  base: { maxOutputTokens: number; temperature: number },
  model: ModelSpec
): Record<string, unknown> {
  const config: Record<string, unknown> = {
    ...base,
    responseMimeType: 'application/json',
  };
  if (model.supportsThinking) config.thinkingConfig = { thinkingBudget: 0 };
  return config;
}

// ─── JSON Parser ──────────────────────────────────────────────────────────────
function parseJSON<T>(text: string): T {
  if (!text?.trim()) throw new Error("Empty response from Gemini");

  // Strip <think>...</think> reasoning blocks
  const src = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // 1. Direct parse
  try { return JSON.parse(src) as T; } catch { /* next */ }

  // 2. Fenced code block
  const fenced = src.match(/```(?:json)?[\r\n]*([\s\S]*?)```/);
  if (fenced?.[1]) { try { return JSON.parse(fenced[1].trim()) as T; } catch { /* next */ } }

  // 3. Brace-depth scan — find outermost { }
  let depth = 0, start = -1, end = -1;
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "{") { if (!depth) start = i; depth++; }
    else if (src[i] === "}") { if (!--depth) { end = i; break; } }
  }
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(src.slice(start, end + 1)) as T; } catch { /* fail */ }
  }

  console.error("[Gemini] Cannot parse. Raw (600 chars):", text.slice(0, 600));
  throw new Error("Gemini returned invalid JSON: " + text.slice(0, 200));
}

// ─── Retry / Key+Model Fallback ───────────────────────────────────────────────
// Strategy: for each available key, try each model up to 3 times.
// On rate-limit: immediately rotate to the next key (no wait) — this is the main
// benefit of multi-key rotation. Only wait if we've exhausted all keys.
//
// Every call is capped by a wall-clock budget. Without it a request that hits
// free-tier rate limits can retry for minutes, the Vercel function gets killed
// at its 300s limit and the browser reports a bare "Failed to fetch".
const RETRY_BUDGET_MS = 20_000;      // max wall-clock for a single Gemini call
const RATE_LIMIT_BACKOFF_MS = 1_500; // short, bounded wait when every key is throttled

async function withRetry<T>(fn: (ai: GoogleGenAI, model: ModelSpec) => Promise<T>): Promise<T> {
  const keys = getAvailableKeys();
  if (!keys.length) throw new Error("No GEMINI_API_KEY configured");

  let lastErr: unknown;
  let rateLimitRound = 0;
  const deadline = Date.now() + clampBudget(RETRY_BUDGET_MS);

  // Outer loop: rotate through keys on rate-limit
  for (let keyTry = 0; keyTry < keys.length * 2; keyTry++) {
    if (Date.now() >= deadline) break;
    const keyIndex = (_keyIndex + keyTry) % keys.length;
    const apiKey = keys[keyIndex];
    const ai     = getAI(apiKey);

    for (const model of MODELS) {
      const bucket = `${keyIndex}:${model.id}`;
      if (_exhaustedBuckets.has(bucket)) continue; // daily quota already spent

      for (let attempt = 0; attempt < 3; attempt++) {
        if (Date.now() >= deadline) break; // out of time — stop burning the budget
        try {
          const result = await fn(ai, model);
          // Advance global index so next call starts from the next key
          _keyIndex = (_keyIndex + keyTry + 1) % keys.length;
          return result;
        } catch (err) {
          lastErr = err;
          const msg = String(err);

          // The free tier allows 20 requests per DAY per key per model. Retrying
          // cannot help — remember the bucket and move on to the next model.
          if (isDailyQuotaError(msg)) {
            const reset = dailyQuotaReset(msg);
            _exhaustedBuckets.add(bucket);
            console.warn(`[Gemini] Daily quota spent for key ${keyIndex + 1}/${keys.length} model=${model.id}${reset ? ` (resets in ${reset})` : ''}. Skipping.`);
            lastErr = new Error(
              `DAILY_QUOTA: The AI daily free-tier quota is used up${reset ? ` (resets in ${reset})` : ''}.`
            );
            break;
          }

          const isAuth      = msg.includes("401") || msg.includes("API_KEY") || msg.includes("UNAUTHENTICATED") || msg.includes("not configured");
          const isRateLimit = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("Too Many") || msg.includes("quota");
          // 503 = the model itself is overloaded right now — another model on the
          // same key is a better bet than retrying the same one.
          const isModelErr  = msg.includes("404") || msg.includes("not found") || msg.includes("deprecated") || msg.includes("INVALID_ARGUMENT")
            || msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand");

          if (isAuth) {
            console.error(`[Gemini] Auth error on key index ${keyIndex}: ${msg.slice(0, 120)}`);
            break; // try next key
          }
          if (isRateLimit) {
            rateLimitRound++;
            console.warn(`[Gemini] Rate limit on key ${keyIndex + 1}/${keys.length} model=${model.id}. Rotating key.`);
            // If we've tried all keys and still hitting limits, wait briefly before next round
            if (rateLimitRound >= keys.length && attempt < 2 && Date.now() + RATE_LIMIT_BACKOFF_MS < deadline) {
              await sleep(RATE_LIMIT_BACKOFF_MS);
            }
            break; // immediately try next key
          }
          if (isModelErr) {
            console.warn(`[Gemini] Model ${model.id} unavailable, trying next model`);
            break; // try next model
          }

          console.error(`[Gemini] Error key=${keyIndex} model=${model.id} attempt=${attempt + 1}: ${msg.slice(0, 150)}`);
          if (attempt < 2) await sleep(1500); // brief wait before retry on transient errors
        }
      }
      if (Date.now() >= deadline) break;
    }
  }

  throw lastErr ?? new Error('Gemini request exceeded its time budget');
}

// ─── Score & Describe Image ───────────────────────────────────────────────────
export async function scoreAndDescribeImage(
  base64Image: string,
  mimeType: string,
  eventContext: string
): Promise<{
  sharpness: number; composition: number; brandRelevance: number;
  humanEngagement: number; overall: number; reasoning: string; description: string;
}> {
  return withRetry(async (ai, model) => {
    const res = await ai.models.generateContent({
      model: model.id,
      contents: [{
        role: "user",
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: `Score this event photo for marketing use. Event: ${eventContext}\n\nRespond with ONLY this JSON (no extra text, no markdown):\n{"sharpness":7,"composition":8,"brandRelevance":6,"humanEngagement":9,"overall":7.5,"reasoning":"one sentence","description":"what you see in 10 words"}` },
        ],
      }],
      config: buildConfig({ maxOutputTokens: 600, temperature: 0.1 }, model),
    });

    const parsed = parseJSON<{
      sharpness: number; composition: number; brandRelevance: number;
      humanEngagement: number; overall: number; reasoning: string; description: string;
    }>(res.text ?? "");

    return {
      sharpness:       Number(parsed.sharpness)       || 5,
      composition:     Number(parsed.composition)     || 5,
      brandRelevance:  Number(parsed.brandRelevance)  || 5,
      humanEngagement: Number(parsed.humanEngagement) || 5,
      overall:         Number(parsed.overall)         || 5,
      reasoning:       parsed.reasoning   ?? "",
      description:     parsed.description ?? "Event photo",
    };
  });
}

// ─── Generate JSON Content ────────────────────────────────────────────────────
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 2000
): Promise<T> {
  return withRetry(async (ai, model) => {
    const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}\n\n---\n\nCRITICAL: Respond with a single valid JSON object only. Start with { end with }. No markdown, no code fences, no explanation.`;

    const res = await ai.models.generateContent({
      model: model.id,
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      config: buildConfig({ maxOutputTokens: maxTokens, temperature: 0.75 }, model),
    });

    const text = res.text ?? "";
    if (!text.trim()) throw new Error("Empty response from Gemini");
    return parseJSON<T>(text);
  });
}

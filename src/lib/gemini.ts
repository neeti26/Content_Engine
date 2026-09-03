import { GoogleGenAI } from "@google/genai";

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
// Current stable models as of Sep 2026 per https://ai.google.dev/gemini-api/docs/models
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const sleep  = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

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
async function withRetry<T>(fn: (ai: GoogleGenAI, model: string) => Promise<T>): Promise<T> {
  const keys = getAvailableKeys();
  if (!keys.length) throw new Error("No GEMINI_API_KEY configured");

  let lastErr: unknown;
  let rateLimitRound = 0;

  // Outer loop: rotate through keys on rate-limit
  for (let keyTry = 0; keyTry < keys.length * 2; keyTry++) {
    const apiKey = keys[(_keyIndex + keyTry) % keys.length];
    const ai     = getAI(apiKey);

    for (const model of MODELS) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const result = await fn(ai, model);
          // Advance global index so next call starts from the next key
          _keyIndex = (_keyIndex + keyTry + 1) % keys.length;
          return result;
        } catch (err) {
          lastErr = err;
          const msg = String(err);

          const isAuth      = msg.includes("401") || msg.includes("API_KEY") || msg.includes("UNAUTHENTICATED") || msg.includes("not configured");
          const isRateLimit = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("Too Many") || msg.includes("quota");
          const isModelErr  = msg.includes("404") || msg.includes("not found") || msg.includes("deprecated") || msg.includes("INVALID_ARGUMENT");

          if (isAuth) {
            console.error(`[Gemini] Auth error on key index ${keyTry}: ${msg.slice(0, 120)}`);
            break; // try next key
          }
          if (isRateLimit) {
            rateLimitRound++;
            console.warn(`[Gemini] Rate limit on key ${keyTry + 1}/${keys.length} model=${model}. Rotating key.`);
            // If we've tried all keys and still hitting limits, wait before next round
            if (rateLimitRound >= keys.length && attempt < 2) {
              await sleep(rateLimitRound * 5000);
            }
            break; // immediately try next key
          }
          if (isModelErr) {
            console.warn(`[Gemini] Model ${model} unavailable, trying next model`);
            break; // try next model
          }

          console.error(`[Gemini] Error key=${keyTry} model=${model} attempt=${attempt + 1}: ${msg.slice(0, 150)}`);
          if (attempt < 2) await sleep(1500); // brief wait before retry on transient errors
        }
      }
    }
  }

  throw lastErr;
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
      model,
      contents: [{
        role: "user",
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: `Score this event photo for marketing use. Event: ${eventContext}\n\nRespond with ONLY this JSON (no extra text, no markdown):\n{"sharpness":7,"composition":8,"brandRelevance":6,"humanEngagement":9,"overall":7.5,"reasoning":"one sentence","description":"what you see in 10 words"}` },
        ],
      }],
      config: { maxOutputTokens: 600, temperature: 0.1 },
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
      model,
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      config: { maxOutputTokens: maxTokens, temperature: 0.75 },
    });

    const text = res.text ?? "";
    if (!text.trim()) throw new Error("Empty response from Gemini");
    return parseJSON<T>(text);
  });
}

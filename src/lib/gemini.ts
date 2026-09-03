import { GoogleGenAI } from "@google/genai";

function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

// Models tried in order — flash is best quality, 8b is fallback
const MODELS = ["gemini-1.5-flash", "gemini-1.5-flash-8b"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── JSON Parser ──────────────────────────────────────────────────────────────
// Tries three strategies to extract valid JSON from Gemini's response.
function parseJSON<T>(text: string): T {
  if (!text || text.trim() === "") throw new Error("Empty response from Gemini");

  // 1. Strip <think>...</think> reasoning blocks (some model variants prepend these)
  const stripped = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const src = stripped || text.trim();

  // 2. Direct parse
  try { return JSON.parse(src) as T; } catch { /* try next */ }

  // 3. Extract from fenced code block
  const fenced = src.match(/```(?:json)?[\r\n]*([\s\S]*?)```/);
  if (fenced?.[1]) {
    try { return JSON.parse(fenced[1].trim()) as T; } catch { /* try next */ }
  }

  // 4. Brace-depth scan — find the outermost { } pair
  let depth = 0, start = -1, end = -1;
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "{") { if (depth === 0) start = i; depth++; }
    else if (src[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(src.slice(start, end + 1)) as T; } catch { /* fail below */ }
  }

  console.error("[Gemini] Cannot parse response. Raw (first 600 chars):", text.slice(0, 600));
  throw new Error("Gemini returned invalid JSON. Raw: " + text.slice(0, 200));
}

// ─── Retry / Model Fallback ───────────────────────────────────────────────────
async function withRetry<T>(fn: (model: string) => Promise<T>): Promise<T> {
  let lastErr: unknown;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await fn(model);
        if (attempt > 0 || model !== MODELS[0]) {
          console.log(`[Gemini] Success with model=${model} attempt=${attempt + 1}`);
        }
        return result;
      } catch (err) {
        lastErr = err;
        const msg = String(err);

        const isModelError = msg.includes("404") || msg.includes("not found") ||
          msg.includes("not supported") || msg.includes("INVALID_ARGUMENT") ||
          msg.includes("deprecated");

        const isRateLimit = msg.includes("429") || msg.includes("quota") ||
          msg.includes("Too Many") || msg.includes("RESOURCE_EXHAUSTED");

        const isAuth = msg.includes("401") || msg.includes("API key") ||
          msg.includes("UNAUTHENTICATED") || msg.includes("not configured");

        // Auth errors are fatal — no point retrying
        if (isAuth) {
          console.error(`[Gemini] Auth error — check GEMINI_API_KEY: ${msg}`);
          throw err;
        }

        // Model unavailable — skip to next model immediately
        if (isModelError) {
          console.warn(`[Gemini] Model ${model} unavailable, trying next`);
          break;
        }

        // Rate limit — exponential backoff then retry same model
        if (isRateLimit && attempt < 2) {
          const wait = (attempt + 1) * 8000;
          console.log(`[Gemini] Rate limit on ${model}, waiting ${wait / 1000}s (attempt ${attempt + 1})`);
          await sleep(wait);
          continue;
        }

        // Other errors — log and try next model
        console.error(`[Gemini] Error on model=${model} attempt=${attempt + 1}:`, msg.slice(0, 200));
        break;
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
  return withRetry(async (modelName) => {
    const res = await getAI().models.generateContent({
      model: modelName,
      contents: [{
        role: "user",
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          {
            text: `Score this event photo for marketing use. Event context: ${eventContext}

Respond with ONLY this JSON object (no extra text, no markdown):
{"sharpness":7,"composition":8,"brandRelevance":6,"humanEngagement":9,"overall":7.5,"reasoning":"one sentence","description":"what you see in 10 words"}`
          },
        ],
      }],
      config: { maxOutputTokens: 600, temperature: 0.1 },
    });

    const text = res.text ?? "";
    const parsed = parseJSON<{
      sharpness: number; composition: number; brandRelevance: number;
      humanEngagement: number; overall: number; reasoning: string; description: string;
    }>(text);

    // Ensure all numeric fields are valid numbers
    return {
      sharpness:       Number(parsed.sharpness)       || 5,
      composition:     Number(parsed.composition)     || 5,
      brandRelevance:  Number(parsed.brandRelevance)  || 5,
      humanEngagement: Number(parsed.humanEngagement) || 5,
      overall:         Number(parsed.overall)         || 5,
      reasoning:       parsed.reasoning  ?? '',
      description:     parsed.description ?? 'Event photo',
    };
  });
}

// ─── Generate JSON Content ────────────────────────────────────────────────────
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 2000
): Promise<T> {
  return withRetry(async (modelName) => {
    const fullPrompt = `${systemPrompt}

---

${userPrompt}

---

CRITICAL INSTRUCTION: Your entire response must be a single valid JSON object. Start with { and end with }. No text before or after. No markdown. No code fences. No explanation.`;

    const res = await getAI().models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      config: { maxOutputTokens: maxTokens, temperature: 0.75 },
    });

    const text = res.text ?? "";
    if (!text.trim()) throw new Error("Empty response from Gemini");

    return parseJSON<T>(text);
  });
}

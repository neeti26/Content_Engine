import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set. Get free key at https://aistudio.google.com/app/apikey");
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

// These are the confirmed working free-tier model IDs for @google/genai SDK
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseJSON<T>(text: string): T {
  if (!text || text.trim() === "") throw new Error("Empty response from Gemini");

  // 1. Direct parse
  try { return JSON.parse(text.trim()) as T; } catch { /* */ }

  // 2. Strip ```json ... ``` or ``` ... ``` fences
  const fenced = text.match(/```(?:json)?[\r\n]*([\s\S]*?)```/);
  if (fenced?.[1]) {
    try { return JSON.parse(fenced[1].trim()) as T; } catch { /* */ }
  }

  // 3. Find outermost complete { ... } — handles text before/after JSON
  let depth = 0, start = -1, end = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") { if (depth === 0) start = i; depth++; }
    else if (text[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(text.slice(start, end + 1)) as T; } catch { /* */ }
  }

  console.error("[Gemini] Cannot parse response. Raw (first 500 chars):", text.slice(0, 500));
  throw new Error("Gemini returned invalid JSON. Raw: " + text.slice(0, 200));
}

async function withRetry<T>(fn: (model: string) => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await fn(model);
      } catch (err) {
        lastErr = err;
        const msg = String(err);
        const isModelError = msg.includes("404") || msg.includes("not found") || msg.includes("not supported") || msg.includes("INVALID_ARGUMENT");
        const isRateLimit  = msg.includes("429") || msg.includes("quota") || msg.includes("Too Many") || msg.includes("RESOURCE_EXHAUSTED");
        if (isModelError) { console.log(`[Gemini] Model ${model} not available, trying next`); break; }
        if (isRateLimit && attempt < 2) { console.log(`[Gemini] Rate limit, waiting ${(attempt + 1) * 6}s...`); await sleep((attempt + 1) * 6000); continue; }
        if (!isRateLimit) break;
      }
    }
  }
  throw lastErr;
}

export async function scoreAndDescribeImage(
  base64Image: string,
  mimeType: string,
  eventContext: string
): Promise<{ sharpness: number; composition: number; brandRelevance: number; humanEngagement: number; overall: number; reasoning: string; description: string }> {
  return withRetry(async (modelName) => {
    const res = await getAI().models.generateContent({
      model: modelName,
      contents: [{
        role: "user",
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: `Score this event photo. Event: ${eventContext}\n\nRespond with ONLY this JSON object, nothing else:\n{"sharpness":7,"composition":8,"brandRelevance":6,"humanEngagement":9,"overall":7.5,"reasoning":"Brief reason","description":"What you see"}` },
        ],
      }],
      config: { maxOutputTokens: 400, temperature: 0.1 },
    });
    const text = res.text ?? "";
    return parseJSON(text);
  });
}

export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 2000
): Promise<T> {
  return withRetry(async (modelName) => {
    const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}\n\n---\n\nIMPORTANT: Your entire response must be a single valid JSON object. Do NOT include any text before or after the JSON. Do NOT use markdown code fences. Start your response with { and end with }.`;

    const res = await getAI().models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      config: { maxOutputTokens: maxTokens, temperature: 0.75 },
    });
    const text = res.text ?? "";
    return parseJSON<T>(text);
  });
}

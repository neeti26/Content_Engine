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

const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseJSON<T>(text: string): T {
  try { return JSON.parse(text.trim()) as T; } catch { /* */ }
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/s);
  if (fenced) { try { return JSON.parse(fenced[1].trim()) as T; } catch { /* */ } }
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s !== -1 && e > s) { try { return JSON.parse(text.slice(s, e + 1)) as T; } catch { /* */ } }
  console.error("Gemini raw:", text.slice(0, 400));
  throw new Error("Cannot parse JSON: " + text.slice(0, 150));
}

async function withRetry<T>(fn: (model: string) => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (const model of MODELS) {
    for (let i = 0; i < 2; i++) {
      try { return await fn(model); }
      catch (err) {
        lastErr = err;
        const m = String(err);
        if (m.includes("404") || m.includes("not found") || m.includes("not supported")) break;
        if ((m.includes("429") || m.includes("quota")) && i === 0) { await sleep(5000); continue; }
        break;
      }
    }
  }
  throw lastErr;
}

export async function scoreAndDescribeImage(
  base64Image: string, mimeType: string, eventContext: string
): Promise<{ sharpness: number; composition: number; brandRelevance: number; humanEngagement: number; overall: number; reasoning: string; description: string }> {
  return withRetry(async (modelName) => {
    const res = await getAI().models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "Analyze this event photo. Event: " + eventContext + "\n\nReturn ONLY this JSON (no markdown, no extra text):\n{\"sharpness\":7,\"composition\":8,\"brandRelevance\":6,\"humanEngagement\":9,\"overall\":7.5,\"reasoning\":\"One sentence\",\"description\":\"One sentence\"}" },
      ]}],
      config: { maxOutputTokens: 300, temperature: 0.1 },
    });
    return parseJSON(res.text ?? "{}");
  });
}

export async function generateJSON<T>(
  systemPrompt: string, userPrompt: string, maxTokens = 1200
): Promise<T> {
  return withRetry(async (modelName) => {
    const res = await getAI().models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: userPrompt + "\n\nReturn ONLY a valid JSON object. No markdown. Start with { end with }." }] }],
      config: {
        maxOutputTokens: maxTokens,
        temperature: 0.8,
        systemInstruction: systemPrompt + "\n\nIMPORTANT: Return ONLY valid JSON. No markdown fences. No explanation. Start with { end with }.",
      },
    });
    return parseJSON<T>(res.text ?? "{}");
  });
}
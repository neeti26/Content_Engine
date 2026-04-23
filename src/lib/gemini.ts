import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/app/apikey');
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

// Use gemini-2.5-flash — reliable free tier with JSON support
const MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash'];

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Robustly extract JSON from any Gemini response.
 * Handles: raw JSON, ```json fences, text before/after JSON.
 */
function parseGeminiJSON<T>(text: string): T {
  // 1. Try direct parse first
  try { return JSON.parse(text.trim()) as T; } catch { /* continue */ }

  // 2. Strip ```json ... ``` or ``` ... ``` fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/s);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()) as T; } catch { /* continue */ }
  }

  // 3. Find the outermost { ... } block
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)) as T; } catch { /* continue */ }
  }

  // 4. Log and throw with context
  console.error('Failed to parse Gemini response as JSON. Raw text:', text.slice(0, 500));
  throw new Error(`Invalid JSON from Gemini: ${text.slice(0, 200)}`);
}

async function withRetry<T>(fn: (model: string) => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await fn(model);
      } catch (err) {
        lastErr = err;
        const msg = String(err);
        const isRate   = msg.includes('429') || msg.includes('quota') || msg.includes('Too Many');
        const isModel  = msg.includes('404') || msg.includes('not found') || msg.includes('not supported');
        if (isModel) break; // try next model immediately
        if (isRate && attempt === 0) { await sleep(5000); continue; }
        break;
      }
    }
  }
  throw lastErr;
}

export async function scoreAndDescribeImage(
  base64Image: string,
  mimeType: string,
  eventContext: string
): Promise<{
  sharpness: number; composition: number; brandRelevance: number;
  humanEngagement: number; overall: number; reasoning: string; description: string;
}> {
  return withRetry(async (modelName) => {
    const model = getClient().getGenerativeModel({
      model: modelName,
      safetySettings,
      generationConfig: { maxOutputTokens: 300, temperature: 0.1 },
    });

    const prompt = `You are a marketing photo analyst. Analyze this event photo and return ONLY a JSON object, no other text.

Event context: ${eventContext}

Return this exact JSON structure with numbers 0-10:
{"sharpness":7,"composition":8,"brandRelevance":6,"humanEngagement":9,"overall":7.5,"reasoning":"Clear sharp image showing engaged crowd","description":"Energetic crowd at brand event stage"}`;

    const result = await model.generateContent([
      { inlineData: { data: base64Image, mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' } },
      prompt,
    ]);

    return parseGeminiJSON(result.response.text());
  });
}

export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1200
): Promise<T> {
  return withRetry(async (modelName) => {
    const model = getClient().getGenerativeModel({
      model: modelName,
      safetySettings,
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.8 },
      systemInstruction: systemPrompt + '\n\nIMPORTANT: Return ONLY a valid JSON object. No markdown, no explanation, no ```json fences. Start your response with { and end with }.',
    });

    const result = await model.generateContent(userPrompt + '\n\nRemember: return ONLY the JSON object, nothing else.');
    return parseGeminiJSON<T>(result.response.text());
  });
}

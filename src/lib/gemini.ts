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

// Gemini 2.5 Flash-Lite: free tier, 15 RPM, 1000 req/day, vision support
// Fallback: gemini-2.5-flash (10 RPM free)
const MODEL = 'gemini-2.5-flash-lite-preview-06-17';
const MODEL_FALLBACK = 'gemini-2.5-flash';

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry<T>(fn: (model: string) => Promise<T>): Promise<T> {
  const models = [MODEL, MODEL_FALLBACK];
  let lastErr: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await fn(model);
      } catch (err) {
        lastErr = err;
        const msg = String(err);
        const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('Too Many');
        const isNotFound  = msg.includes('404') || msg.includes('not found');
        if (isNotFound) break; // try next model
        if (isRateLimit && attempt < 2) {
          await sleep(4000 * (attempt + 1));
          continue;
        }
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
): Promise<{
  sharpness: number; composition: number; brandRelevance: number;
  humanEngagement: number; overall: number; reasoning: string; description: string;
}> {
  return withRetry(async (modelName) => {
    const model = getClient().getGenerativeModel({
      model: modelName,
      safetySettings,
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 250, temperature: 0.1 },
    });
    const prompt = `Event: ${eventContext}\nScore this photo (0-10 each) and describe it. JSON only:\n{"sharpness":<n>,"composition":<n>,"brandRelevance":<n>,"humanEngagement":<n>,"overall":<n>,"reasoning":"<1 sentence>","description":"<1 sentence>"}`;
    const result = await model.generateContent([
      { inlineData: { data: base64Image, mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' } },
      prompt,
    ]);
    const text = result.response.text();
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? text);
  });
}

export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1000
): Promise<T> {
  return withRetry(async (modelName) => {
    const model = getClient().getGenerativeModel({
      model: modelName,
      safetySettings,
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: maxTokens, temperature: 0.8 },
      systemInstruction: systemPrompt,
    });
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? text) as T;
  });
}

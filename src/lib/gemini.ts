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

// Free-tier models in order of preference (fastest → most capable)
// gemini-1.5-flash-8b: free, 15 RPM, vision support — best for scoring
// gemini-1.5-flash:    free, 15 RPM, vision support — fallback
const VISION_MODEL = 'gemini-1.5-flash-8b';
const TEXT_MODEL   = 'gemini-1.5-flash-8b';

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Retry wrapper — handles 429 rate limits automatically */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 5000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('Too Many');
      if (isRateLimit && i < retries - 1) {
        console.log(`Rate limit hit, waiting ${delayMs}ms before retry ${i + 1}/${retries - 1}...`);
        await sleep(delayMs);
        delayMs *= 1.5; // exponential backoff
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Score + describe an image using Gemini 1.5 Flash 8B (free tier, vision).
 */
export async function scoreAndDescribeImage(
  base64Image: string,
  mimeType: string,
  eventContext: string
): Promise<{
  sharpness: number; composition: number; brandRelevance: number;
  humanEngagement: number; overall: number; reasoning: string; description: string;
}> {
  return withRetry(async () => {
    const model = getClient().getGenerativeModel({
      model: VISION_MODEL,
      safetySettings,
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 250,
        temperature: 0.1,
      },
    });

    const prompt = `Event: ${eventContext}

Score this event photo (0-10 each) and describe it. Return JSON only:
{"sharpness":<0-10>,"composition":<0-10>,"brandRelevance":<0-10>,"humanEngagement":<0-10>,"overall":<weighted 0-10>,"reasoning":"<1 sentence>","description":"<1 sentence: people, energy, setting>"}`;

    const result = await model.generateContent([
      { inlineData: { data: base64Image, mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' } },
      prompt,
    ]);
    const text = result.response.text();
    const json = text.match(/\{[\s\S]*\}/)?.[0] ?? text;
    return JSON.parse(json);
  });
}

/**
 * Generate structured JSON using Gemini 1.5 Flash 8B (free tier, text).
 */
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1000
): Promise<T> {
  return withRetry(async () => {
    const model = getClient().getGenerativeModel({
      model: TEXT_MODEL,
      safetySettings,
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: maxTokens,
        temperature: 0.8,
      },
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    const json = text.match(/\{[\s\S]*\}/)?.[0] ?? text;
    return JSON.parse(json) as T;
  });
}

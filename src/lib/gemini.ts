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

// Safety settings — relaxed so marketing content isn't blocked
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Score + describe an image in ONE call using Gemini 2.0 Flash Vision.
 * Fast, free tier, vision support.
 */
export async function scoreAndDescribeImage(
  base64Image: string,
  mimeType: string,
  eventContext: string
): Promise<{
  sharpness: number; composition: number; brandRelevance: number;
  humanEngagement: number; overall: number; reasoning: string; description: string;
}> {
  const model = getClient().getGenerativeModel({
    model: 'gemini-2.0-flash',
    safetySettings,
    generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 300, temperature: 0.2 },
  });

  const prompt = `Event: ${eventContext}

Score this event photo (0-10 each) and describe it. JSON only:
{"sharpness":<0-10>,"composition":<0-10>,"brandRelevance":<0-10>,"humanEngagement":<0-10>,"overall":<weighted 0-10>,"reasoning":"<1 sentence>","description":"<1 sentence: people, energy, setting>"}`;

  try {
    const result = await model.generateContent([
      { inlineData: { data: base64Image, mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' } },
      prompt,
    ]);
    const text = result.response.text();
    const json = text.match(/\{[\s\S]*\}/)?.[0] ?? text;
    return JSON.parse(json);
  } catch {
    return { sharpness: 5, composition: 5, brandRelevance: 5, humanEngagement: 5, overall: 5, reasoning: 'Could not analyze', description: 'Event photo' };
  }
}

/**
 * Generate JSON content using Gemini 2.0 Flash (text only — very fast).
 */
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1200
): Promise<T> {
  const model = getClient().getGenerativeModel({
    model: 'gemini-2.0-flash',
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
}

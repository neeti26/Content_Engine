import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
    client = new OpenAI({ apiKey });
  }
  return client;
}

/** Vision call — use 'low' detail for scoring (fast), 'high' for content gen */
export async function analyzeImageWithVision(
  base64Image: string,
  mimeType: string,
  prompt: string,
  detail: 'low' | 'high' = 'low'
): Promise<string> {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}`, detail } },
        { type: 'text', text: prompt },
      ],
    }],
  });
  return response.choices[0]?.message?.content ?? '';
}

/** Score + describe image in ONE vision call */
export async function scoreAndDescribeImage(
  base64Image: string,
  mimeType: string,
  eventContext: string
): Promise<{ sharpness: number; composition: number; brandRelevance: number; humanEngagement: number; overall: number; reasoning: string; description: string }> {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 400,
    response_format: { type: 'json_object' },
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: 'low' } },
        { type: 'text', text: `Event: ${eventContext}

Score this event photo AND describe it. Return JSON only:
{
  "sharpness": <0-10>,
  "composition": <0-10>,
  "brandRelevance": <0-10>,
  "humanEngagement": <0-10>,
  "overall": <weighted 0-10>,
  "reasoning": "<1-2 sentences why>",
  "description": "<1 sentence: people, energy, setting, brand elements visible>"
}` },
      ],
    }],
  });
  const raw = response.choices[0]?.message?.content ?? '{}';
  try { return JSON.parse(raw); } catch { return { sharpness:5,composition:5,brandRelevance:5,humanEngagement:5,overall:5,reasoning:'',description:'' }; }
}

export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1500
): Promise<T> {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: maxTokens,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt + '\nRespond with valid JSON only.' },
      { role: 'user', content: userPrompt },
    ],
  });
  const content = response.choices[0]?.message?.content ?? '{}';
  return JSON.parse(content) as T;
}

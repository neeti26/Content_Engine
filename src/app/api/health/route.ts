import { NextResponse } from 'next/server';
import { hasAnyGeminiKey } from '@/lib/gemini';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  const geminiReady = hasAnyGeminiKey();
  const creatomateReady = !!process.env.CREATOMATE_API_KEY;

  // Quick Gemini connectivity test
  let geminiTest: string = 'not tested';
  if (geminiReady) {
    try {
      // Try the cheapest possible call — just get model info
      const key = process.env.GEMINI_API_KEY_1 ?? process.env.GEMINI_API_KEY ?? '';
      const ai = new GoogleGenAI({ apiKey: key });
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{ role: 'user', parts: [{ text: 'Reply with just the word: OK' }] }],
        config: { maxOutputTokens: 10, temperature: 0 },
      });
      geminiTest = res.text?.trim() ?? 'empty response';
    } catch (err) {
      geminiTest = `ERROR: ${String(err).slice(0, 200)}`;
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Content Engine',
    geminiConfigured: geminiReady,
    geminiTest,
    creatomateConfigured: creatomateReady,
  });
}

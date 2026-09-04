import { NextResponse } from 'next/server';
import { hasAnyGeminiKey } from '@/lib/gemini';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  const geminiReady = hasAnyGeminiKey();
  const creatomateReady = !!process.env.CREATOMATE_API_KEY;

  // Test each key until one works
  let geminiTest: string = 'not tested';
  if (geminiReady) {
    const keys: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const k = process.env[`GEMINI_API_KEY_${i}`];
      if (k?.trim()) keys.push(k.trim());
    }
    const legacy = process.env.GEMINI_API_KEY?.trim();
    if (legacy && !keys.includes(legacy)) keys.push(legacy);

    for (let ki = 0; ki < keys.length; ki++) {
      try {
        const ai = new GoogleGenAI({ apiKey: keys[ki] });
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash-lite',
          contents: [{ role: 'user', parts: [{ text: 'Reply with just the word: OK' }] }],
          config: { maxOutputTokens: 10, temperature: 0 },
        });
        geminiTest = `OK (key ${ki + 1} of ${keys.length})`;
        break;
      } catch (err) {
        const msg = String(err).slice(0, 120);
        geminiTest = `Key ${ki + 1} ERROR: ${msg}`;
        // continue to next key
      }
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Content Engine',
    geminiConfigured: geminiReady,
    geminiKeysConfigured: (() => {
      let count = 0;
      for (let i = 1; i <= 10; i++) { if (process.env[`GEMINI_API_KEY_${i}`]) count++; }
      if (process.env.GEMINI_API_KEY) count++;
      return count;
    })(),
    geminiTest,
    creatomateConfigured: creatomateReady,
  });
}

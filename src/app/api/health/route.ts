import { NextResponse } from 'next/server';
import { hasAnyGeminiKey, MODEL_IDS } from '@/lib/gemini';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  const geminiReady = hasAnyGeminiKey();
  const creatomateReady = !!process.env.CREATOMATE_API_KEY;

  // Test each key/model combination until one works
  let geminiTest: string = 'not tested';
  if (geminiReady) {
    const keys: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const k = process.env[`GEMINI_API_KEY_${i}`];
      if (k?.trim()) keys.push(k.trim());
    }
    const legacy = process.env.GEMINI_API_KEY?.trim();
    if (legacy && !keys.includes(legacy)) keys.push(legacy);

    outer:
    for (let ki = 0; ki < keys.length; ki++) {
      for (const model of MODEL_IDS) {
        try {
          const ai = new GoogleGenAI({ apiKey: keys[ki] });
          const res = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: 'Reply with just the word: OK' }] }],
            config: { maxOutputTokens: 10, temperature: 0 },
          });
          geminiTest = `OK (key ${ki + 1} of ${keys.length}, ${model})`;
          break outer;
        } catch (err) {
          const msg = String(err).slice(0, 120);
          geminiTest = `Key ${ki + 1} / ${model} ERROR: ${msg}`;
          // continue with the next key/model
        }
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

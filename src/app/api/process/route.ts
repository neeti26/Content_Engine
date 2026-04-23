import { NextRequest, NextResponse } from 'next/server';
import { EventBrief, MediaAsset } from '@/types';
import { runPipeline } from '@/lib/pipeline';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { brief: EventBrief; assets: MediaAsset[]; apiKey?: string };
    const { brief, assets, apiKey } = body;

    if (!brief || !assets || assets.length === 0) {
      return NextResponse.json({ error: 'Missing brief or assets' }, { status: 400 });
    }
    if (assets.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 images allowed' }, { status: 400 });
    }

    // Accept Gemini API key from request body
    if (apiKey) {
      process.env.GEMINI_API_KEY = apiKey;
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not set. Get a free key at https://aistudio.google.com/app/apikey and paste it in the input.' },
        { status: 400 }
      );
    }

    const result = await runPipeline(brief, assets);
    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    console.error('Pipeline error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Processing failed' }, { status: 500 });
  }
}

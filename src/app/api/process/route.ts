import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { EventBrief, MediaAsset } from '@/types';
import { createJob, updateJob, addStep } from '@/lib/jobStore';
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

    // Allow API key from request body (for demo/judge use without .env)
    if (apiKey) {
      process.env.OPENAI_API_KEY = apiKey;
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured. Add it in the app or set OPENAI_API_KEY env var.' }, { status: 400 });
    }

    const jobId = uuidv4();
    createJob(jobId);
    addStep(jobId, `Processing ${assets.length} photos`, 'done');

    runPipeline(jobId, brief, assets).catch((err) => {
      console.error(`Pipeline error [${jobId}]:`, err);
      updateJob(jobId, { status: 'error', error: err instanceof Error ? err.message : String(err) });
    });

    return NextResponse.json({ jobId }, { status: 202 });
  } catch (err) {
    console.error('Process API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

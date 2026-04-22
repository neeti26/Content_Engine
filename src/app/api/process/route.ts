import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { EventBrief, MediaAsset } from '@/types';
import { createJob, updateJob, addStep } from '@/lib/jobStore';
import { runPipeline } from '@/lib/pipeline';

export const maxDuration = 300; // 5 min timeout for Vercel Pro

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { brief: EventBrief; assets: MediaAsset[] };
    const { brief, assets } = body;

    if (!brief || !assets || assets.length === 0) {
      return NextResponse.json(
        { error: 'Missing brief or assets' },
        { status: 400 }
      );
    }

    if (assets.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 images allowed per submission' },
        { status: 400 }
      );
    }

    const jobId = uuidv4();
    createJob(jobId);
    addStep(jobId, 'Job created', 'done', `Processing ${assets.length} assets`);

    // Run pipeline async (fire and forget, poll via /api/status)
    runPipeline(jobId, brief, assets).catch((err) => {
      console.error(`Pipeline error for job ${jobId}:`, err);
      updateJob(jobId, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      addStep(jobId, 'Pipeline failed', 'error', String(err));
    });

    return NextResponse.json({ jobId }, { status: 202 });
  } catch (err) {
    console.error('Process API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

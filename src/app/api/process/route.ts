import { NextRequest, NextResponse } from 'next/server';
import { EventBrief, MediaAsset } from '@/types';
import { runPipeline } from '@/lib/pipeline';
import { hasAnyGeminiKey } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rateLimit';
import { withRequestDeadline } from '@/lib/deadline';
import { currentUserId } from '@/lib/auth';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// Wall-clock budget for the whole pipeline. The function is killed at 300s by
// the platform and a killed function reaches the browser as "Failed to fetch",
// so we always answer well before that.
const PIPELINE_BUDGET_MS = 150_000;
// Absolute stop — the response goes out even if the pipeline is still running.
const HARD_LIMIT_MS = 255_000;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function friendlyError(err: unknown): { message: string; retryable: boolean } {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes('PIPELINE_TIMEOUT')) {
    return {
      message: 'The AI took too long to answer. Please try again with fewer photos.',
      retryable: true,
    };
  }
  if (msg.includes('DAILY_QUOTA')) {
    const reset = msg.match(/resets in ([^)]+)\)?/)?.[1]?.trim();
    return {
      message: `The AI daily free-tier quota is used up. It resets in ${reset ?? 'about 24 hours'} — please try again later.`,
      retryable: true,
    };
  }
  if (msg.includes('GEMINI_API_KEY') || msg.includes('not configured')) {
    return {
      message: 'The AI service is not configured. Please add your GEMINI_API_KEY in Vercel environment variables.',
      retryable: false,
    };
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('429')) {
    return {
      message: "AI quota reached. This resets shortly — please try again in a few minutes.",
      retryable: true,
    };
  }
  if (msg.includes('Empty response') || msg.includes('invalid JSON') || msg.includes('Cannot parse')) {
    return {
      message: 'The AI returned an unexpected response. Please try again.',
      retryable: true,
    };
  }
  if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('network') || msg.includes('ETIMEDOUT')) {
    return {
      message: 'Could not reach the AI service. Please check your connection and try again.',
      retryable: true,
    };
  }
  if (msg.includes('Server error (413)') || msg.includes('Request Entity Too Large')) {
    return {
      message: 'Your images are too large to process. Please use fewer or smaller photos.',
      retryable: false,
    };
  }

  console.error('[Pipeline error] Unhandled:', msg);
  return {
    message: 'Something went wrong while generating your content. Please try again.',
    retryable: true,
  };
}

export async function POST(req: NextRequest) {
  // Log startup — visible in Vercel function logs
  const hasKey = hasAnyGeminiKey();
  console.log(`[Process] Request received. Gemini keys configured: ${hasKey}`);

  if (!hasKey) {
    console.error('[Config] No Gemini API key found. Add GEMINI_API_KEY_1 (and optionally _2, _3) to Vercel environment variables.');
    return NextResponse.json(
      { error: 'The AI service is not configured. Add GEMINI_API_KEY_1 to your Vercel environment variables, then redeploy.' },
      { status: 503 }
    );
  }

  const ip = getClientIp(req);
  // Use Clerk user ID for rate limiting when signed in (per-user, not per-IP)
  const userId = await currentUserId();
  const rateLimitKey = userId ?? ip;
  // The real limit is the AI provider's daily quota — this only stops a
  // runaway loop. 20 an hour per person is plenty to work with.
  const limit = checkRateLimit(rateLimitKey, 20, 60 * 60 * 1000);
  if (!limit.allowed) {
    const resetIn = Math.ceil((limit.resetAt - Date.now()) / 60000);
    return NextResponse.json(
      { error: `Rate limit reached — ${resetIn} minute${resetIn !== 1 ? 's' : ''} until reset.` },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  let body: { brief: EventBrief; assets: MediaAsset[] };
  try {
    body = await req.json() as { brief: EventBrief; assets: MediaAsset[] };
  } catch (e) {
    console.error('[Process] Failed to parse request body:', e);
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { brief, assets } = body;

  if (!brief) return NextResponse.json({ error: 'Missing event brief.' }, { status: 400 });
  if (!brief.eventName?.trim()) return NextResponse.json({ error: 'Event name is required.' }, { status: 400 });
  if (!brief.brandName?.trim()) return NextResponse.json({ error: 'Brand name is required.' }, { status: 400 });
  if (!assets || assets.length === 0) return NextResponse.json({ error: 'Please upload at least one photo.' }, { status: 400 });
  if (assets.length > 20) return NextResponse.json({ error: 'Maximum 20 files allowed.' }, { status: 400 });

  // Validate assets have base64 data
  const invalid = assets.filter(a => !a.base64 || a.base64.length < 100);
  if (invalid.length > 0) {
    return NextResponse.json({ error: `${invalid.length} file(s) failed to upload correctly. Please try again.` }, { status: 400 });
  }

  console.log(`[Process] Starting pipeline: ${assets.length} assets, event="${brief.eventName}", instagram=${brief.instagramType}`);

  // Hard stop well below the platform's 300s limit: if the pipeline somehow
  // runs over, answer anyway. A killed function never reaches the browser and
  // shows up there as a bare "Failed to fetch".
  let hardTimer: ReturnType<typeof setTimeout> | undefined;
  const hardLimit = new Promise<never>((_, reject) => {
    hardTimer = setTimeout(
      () => reject(new Error('PIPELINE_TIMEOUT: the pipeline exceeded its time limit')),
      HARD_LIMIT_MS
    );
  });

  try {
    const result = await Promise.race([
      withRequestDeadline(PIPELINE_BUDGET_MS, () => runPipeline(brief, assets)),
      hardLimit,
    ]);
    console.log(`[Process] Pipeline complete for "${brief.eventName}"`);
    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    console.error('[Pipeline error]', err);
    const { message, retryable } = friendlyError(err);
    // Always include raw error so we can debug from the browser network tab
    const rawMsg = String(err instanceof Error ? err.message : err).slice(0, 500);
    const status = rawMsg.includes('PIPELINE_TIMEOUT') ? 504 : 500;
    return NextResponse.json({ error: message, retryable, _debug: rawMsg }, { status });
  } finally {
    if (hardTimer) clearTimeout(hardTimer);
  }
}

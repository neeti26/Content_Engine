import { NextRequest, NextResponse } from 'next/server';
import { EventBrief, MediaAsset } from '@/types';
import { runPipeline } from '@/lib/pipeline';
import { checkRateLimit } from '@/lib/rateLimit';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('429')) {
    return "We've hit our AI quota for right now. This resets shortly — please try again in a few minutes.";
  }
  if (msg.includes('Empty response') || msg.includes('invalid JSON')) {
    return 'The AI returned an unexpected response. This is usually temporary — please try again.';
  }
  if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('network')) {
    return 'Could not reach the AI service. Please check your connection and try again.';
  }

  return 'Something went wrong while generating your content. Please try again.';
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Rate limit: 5 generations per IP per hour
  const limit = checkRateLimit(ip, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    const resetIn = Math.ceil((limit.resetAt - Date.now()) / 60000);
    return NextResponse.json(
      { error: `You've reached the limit of 5 generations per hour. Try again in ${resetIn} minute${resetIn !== 1 ? 's' : ''}.` },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  let body: { brief: EventBrief; assets: MediaAsset[] };
  try {
    body = await req.json() as { brief: EventBrief; assets: MediaAsset[] };
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { brief, assets } = body;

  if (!brief || !assets || assets.length === 0) {
    return NextResponse.json({ error: 'Missing event brief or photos.' }, { status: 400 });
  }
  if (assets.length > 20) {
    return NextResponse.json({ error: 'Maximum 20 photos allowed.' }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('[Config] GEMINI_API_KEY is not set in environment variables');
    return NextResponse.json(
      { error: 'Service is not configured yet. Please check back soon.' },
      { status: 503 }
    );
  }

  try {
    const result = await runPipeline(brief, assets);
    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    console.error('[Pipeline error]', err);
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}

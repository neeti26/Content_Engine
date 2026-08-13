import { NextRequest, NextResponse } from 'next/server';
import { EventBrief, MediaAsset } from '@/types';
import { runPipeline } from '@/lib/pipeline';
import { checkRateLimit } from '@/lib/rateLimit';

// Vercel max function duration (Pro: 300s, Hobby: 60s)
export const maxDuration = 300;

// Max body size — images are base64 so can be large
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

  if (msg.includes('API_KEY_INVALID') || msg.includes('invalid API key') || msg.includes('API key not valid')) {
    return 'Your Gemini API key is invalid. Double-check it at aistudio.google.com/app/apikey.';
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('429')) {
    return 'Your Gemini free-tier quota is exhausted for today. It resets at midnight Pacific time. Try again tomorrow or use a different API key.';
  }
  if (msg.includes('PERMISSION_DENIED')) {
    return 'Your Gemini API key does not have permission to use this model. Make sure the Gemini API is enabled in your Google AI Studio project.';
  }
  if (msg.includes('GEMINI_API_KEY not set')) {
    return 'No API key provided. Paste your free Gemini key from aistudio.google.com/app/apikey, or try Demo Mode.';
  }
  if (msg.includes('Empty response') || msg.includes('invalid JSON')) {
    return 'The AI returned an unexpected response. This is usually temporary — please try again.';
  }
  if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('network')) {
    return 'Could not reach the Gemini API. Check your internet connection and try again.';
  }

  return `Processing failed: ${msg.slice(0, 200)}`;
}

export async function POST(req: NextRequest) {
  // ── Rate limiting (only applies when no user key — i.e. using the hosted key) ──
  const ip = getClientIp(req);
  let body: { brief: EventBrief; assets: MediaAsset[]; apiKey?: string };

  try {
    body = await req.json() as { brief: EventBrief; assets: MediaAsset[]; apiKey?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { brief, assets, apiKey } = body;

  // Validate inputs
  if (!brief || !assets || assets.length === 0) {
    return NextResponse.json({ error: 'Missing event brief or photos.' }, { status: 400 });
  }
  if (assets.length > 20) {
    return NextResponse.json({ error: 'Maximum 20 photos allowed per generation.' }, { status: 400 });
  }

  // If no user key is provided, we use the hosted key — apply rate limiting
  const usingHostedKey = !apiKey && !!process.env.GEMINI_API_KEY;
  if (usingHostedKey) {
    // 5 generations per IP per hour when using the hosted key
    const limit = checkRateLimit(ip, 5, 60 * 60 * 1000);
    if (!limit.allowed) {
      const resetIn = Math.ceil((limit.resetAt - Date.now()) / 60000);
      return NextResponse.json(
        {
          error: `You've used all 5 free generations for this hour. Resets in ${resetIn} minute${resetIn !== 1 ? 's' : ''}. Or paste your own free Gemini key from aistudio.google.com/app/apikey to get unlimited generations.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(limit.resetAt),
            'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }
  }

  // Determine which API key to use — user-provided key takes priority
  const resolvedKey = apiKey || undefined; // undefined = pipeline will use process.env.GEMINI_API_KEY

  if (!resolvedKey && !process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'No API key found. Paste your free Gemini key from aistudio.google.com/app/apikey, or try Demo Mode.' },
      { status: 400 }
    );
  }

  try {
    const result = await runPipeline(brief, assets, resolvedKey);
    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    console.error('[Pipeline error]', err);
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}

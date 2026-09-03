import { NextRequest, NextResponse } from 'next/server';
import { fetchReelStatus } from '@/lib/creatomate';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ renderId: string }> }
) {
  const { renderId } = await params;

  if (!renderId || renderId === 'undefined') {
    return NextResponse.json({ error: 'Missing renderId' }, { status: 400 });
  }

  if (!process.env.CREATOMATE_API_KEY) {
    return NextResponse.json({ error: 'Creatomate not configured' }, { status: 503 });
  }

  try {
    const result = await fetchReelStatus(renderId);
    return NextResponse.json(result); // includes errorMessage field
  } catch (err) {
    console.error('[reel-status] Error:', err);
    return NextResponse.json({ error: String(err).slice(0, 300), status: 'failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { EventBrief, GeneratedContent } from '@/types';

export const dynamic = 'force-dynamic';

// POST /api/generations — save a generation
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    brief: EventBrief;
    content: GeneratedContent;
    assetCount: number;
  };

  const db = supabaseAdmin();
  const { data, error } = await db
    .from('generations')
    .insert({
      user_id:        userId,
      event_name:     body.brief.eventName,
      brand_name:     body.brief.brandName,
      event_type:     body.brief.eventType,
      location:       body.brief.location,
      date:           body.brief.date,
      key_highlights: body.brief.keyHighlights,
      instagram_type: body.brief.instagramType,
      content:        body.content as unknown as object,
      asset_count:    body.assetCount,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Generations] Save error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

// GET /api/generations — list user's generations
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from('generations')
    .select('id, event_name, brand_name, event_type, location, date, instagram_type, asset_count, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ generations: data });
}

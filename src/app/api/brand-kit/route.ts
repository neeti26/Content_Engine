import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin, BrandKit } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET — fetch user's brand kit
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from('brand_kits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ brandKit: data });
}

// POST — upsert user's brand kit
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as Partial<BrandKit>;

  const db = supabaseAdmin();
  const { data, error } = await db
    .from('brand_kits')
    .upsert({
      user_id:               userId,
      brand_name:            body.brand_name            ?? '',
      industry:              body.industry              ?? '',
      tone:                  body.tone                  ?? 'professional',
      target_audience:       body.target_audience       ?? '',
      brand_voice:           body.brand_voice           ?? '',
      past_content_examples: body.past_content_examples ?? '',
      updated_at:            new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ brandKit: data });
}

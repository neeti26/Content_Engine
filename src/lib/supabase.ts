import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase instance (uses anon key + RLS)
export const supabase = createClient(url, key);

// Server-side admin client (uses service role key, bypasses RLS)
export function supabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return supabase; // fallback to anon in dev
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export type Database = {
  public: {
    Tables: {
      generations: {
        Row: Generation;
        Insert: Omit<Generation, 'id' | 'created_at'>;
        Update: Partial<Generation>;
      };
      brand_kits: {
        Row: BrandKit;
        Insert: Omit<BrandKit, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<BrandKit>;
      };
    };
  };
};

export interface Generation {
  id: string;
  user_id: string;
  event_name: string;
  brand_name: string;
  event_type: string;
  location: string;
  date: string;
  key_highlights: string;
  instagram_type: 'post' | 'reel';
  content: object;          // GeneratedContent JSON
  asset_count: number;
  created_at: string;
}

export interface BrandKit {
  id: string;
  user_id: string;
  brand_name: string;
  industry: string;
  tone: string;
  target_audience: string;
  brand_voice: string;      // free-text guidelines
  past_content_examples: string; // newline-separated examples
  created_at: string;
  updated_at: string;
}

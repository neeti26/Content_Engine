/**
 * Creatomate integration — renders a real 9:16 1080×1920 Instagram Reel .mp4
 * from the AI-generated shot list + uploaded event assets.
 *
 * Flow:
 *  1. Map each ShotListItem to a Creatomate composition element (image/video clip + text overlay)
 *  2. Upload assets as base64 inline data URLs (Creatomate accepts data: URIs directly)
 *  3. Submit render asynchronously — returns a renderId immediately
 *  4. Client polls /api/reel-status/[renderId] until status = 'succeeded'
 *  5. On success, videoUrl is a direct .mp4 download link (Creatomate CDN, 7-day expiry)
 */

import { Client } from 'creatomate';
import { InstagramReelContent, ShotListItem, MediaAsset } from '@/types';

const REEL_WIDTH  = 1080;
const REEL_HEIGHT = 1920;

// Duration per shot in seconds — we distribute the 30s total evenly if not parseable
function parseShotDuration(durationStr: string): number {
  // e.g. "0-3s" → 3, "3-8s" → 5, "26-30s" → 4
  const match = durationStr.match(/(\d+)-(\d+)/);
  if (match) return Math.max(1, parseInt(match[2]) - parseInt(match[1]));
  // e.g. "5s" → 5
  const single = durationStr.match(/(\d+)/);
  if (single) return parseInt(single[1]);
  return 5; // fallback
}

// Convert a MediaAsset's base64 to a data URI Creatomate can use
function assetToDataUri(asset: MediaAsset): string {
  const mime = asset.type === 'video' ? asset.mimeType : (asset.mimeType || 'image/jpeg');
  return `data:${mime};base64,${asset.base64}`;
}

// Build one Creatomate composition element for a single shot
function buildShotElement(
  shot: ShotListItem,
  asset: MediaAsset,
  startTime: number,
  duration: number,
  brandColor: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any>[] {
  const elements = [];

  // Media clip (image or video)
  elements.push({
    type: asset.type === 'video' ? 'video' : 'image',
    source: assetToDataUri(asset),
    time: startTime,
    duration,
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    'fit': 'cover',
    'x_alignment': '50%',
    'y_alignment': '50%',
  });

  // Text overlay — only if there's on-screen text
  if (shot.onScreenText?.trim()) {
    elements.push({
      type: 'text',
      text: shot.onScreenText,
      time: startTime + 0.3,     // slight delay so it fades in after clip starts
      duration: duration - 0.5,
      width: REEL_WIDTH * 0.85,
      height: 'auto',
      'x': '50%',
      'y': '82%',
      'x_alignment': '50%',
      'y_alignment': '50%',
      'font_family': 'Montserrat',
      'font_weight': '800',
      'font_size': shot.shot === 1 ? 72 : 52,  // hook shot gets bigger text
      'font_color': '#FFFFFF',
      'background_color': shot.shot === 1 ? brandColor : 'rgba(0,0,0,0.55)',
      'background_x_padding': '8%',
      'background_y_padding': '4%',
      'background_border_radius': 12,
      'shadow_color': 'rgba(0,0,0,0.6)',
      'shadow_blur': 8,
    });
  }

  return elements;
}

export interface ReelRenderResult {
  renderId: string;
  status: 'pending' | 'rendering' | 'done' | 'failed';
  videoUrl?: string;
}

/**
 * Submit an async Creatomate render for the reel.
 * Returns immediately with a renderId — call fetchReelStatus() to poll.
 */
export async function submitReelRender(
  reel: InstagramReelContent,
  assets: MediaAsset[],
  brandName: string
): Promise<ReelRenderResult> {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) {
    console.warn('[Creatomate] CREATOMATE_API_KEY not set — skipping video render');
    return { renderId: '', status: 'failed' };
  }

  const client = new Client(apiKey);

  // Brand color — cycle through a set of premium defaults
  const brandColor = 'rgba(99,102,241,0.9)';  // indigo — matches app theme

  // Map shot list to timeline elements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allElements: Record<string, any>[] = [];
  let cursor = 0;

  reel.shotList.forEach((shot, i) => {
    const duration = parseShotDuration(shot.duration);
    // Pick asset: prefer in-order, cycle if fewer assets than shots
    const asset = assets[i % assets.length];
    const shotEls = buildShotElement(shot, asset, cursor, duration, brandColor);
    allElements.push(...shotEls);
    cursor += duration;
  });

  // Add a branded end card
  const totalDuration = cursor;
  allElements.push({
    type: 'rectangle',
    time: totalDuration - 2,
    duration: 2,
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    'fill_color': 'linear-gradient(135deg, rgba(99,102,241,0.95), rgba(124,58,237,0.95))',
  });
  allElements.push({
    type: 'text',
    text: brandName,
    time: totalDuration - 1.8,
    duration: 1.8,
    width: REEL_WIDTH * 0.8,
    height: 'auto',
    'x': '50%',
    'y': '50%',
    'x_alignment': '50%',
    'y_alignment': '50%',
    'font_family': 'Montserrat',
    'font_weight': '900',
    'font_size': 88,
    'font_color': '#FFFFFF',
    'letter_spacing': '2%',
  });

  const source = {
    output_format: 'mp4',
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    frame_rate: 30,
    duration: totalDuration,
    elements: allElements,
  };

  console.log(`[Creatomate] Submitting render — shots=${reel.shotList.length}, duration=${totalDuration}s`);

  const renders = await client.startRender({ source });
  const render  = renders[0];

  console.log(`[Creatomate] Render submitted — id=${render.id}, status=${render.status}`);

  return {
    renderId:  render.id,
    status:    render.status === 'succeeded' ? 'done'
             : render.status === 'failed'    ? 'failed'
             : 'pending',
    videoUrl:  render.status === 'succeeded' ? render.url : undefined,
  };
}

/**
 * Poll the status of an existing Creatomate render.
 */
export async function fetchReelStatus(renderId: string): Promise<ReelRenderResult> {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) return { renderId, status: 'failed' };

  const client = new Client(apiKey);
  const render  = await client.fetchRender(renderId);

  return {
    renderId:  render.id,
    status:    render.status === 'succeeded'  ? 'done'
             : render.status === 'failed'     ? 'failed'
             : render.status === 'planned' || render.status === 'waiting' || render.status === 'transcribing' ? 'pending'
             : 'rendering',
    videoUrl:  render.status === 'succeeded' ? render.url : undefined,
  };
}

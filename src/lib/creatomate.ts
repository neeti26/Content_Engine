/**
 * Creatomate integration — renders a real 9:16 1080×1920 Instagram Reel .mp4
 *
 * Architecture:
 * - Each ShotListItem becomes a Creatomate "composition" scene
 * - Each scene contains: a background media clip + text overlay
 * - Scenes are sequenced using track 1, with fade transitions between them
 * - A branded outro card is appended at the end
 * - Assets are passed as base64 data URIs (compressed copies from the server)
 */

import { Client } from 'creatomate';
import { InstagramReelContent, ShotListItem, MediaAsset } from '@/types';

const REEL_WIDTH  = 1080;
const REEL_HEIGHT = 1920;

// Parse "0-3s" → 3,  "3-8s" → 5,  "26-30s" → 4,  "5s" → 5
function parseDuration(str: string): number {
  const range = str.match(/(\d+)\s*-\s*(\d+)/);
  if (range) return Math.max(1, parseInt(range[2]) - parseInt(range[1]));
  const single = str.match(/(\d+)/);
  return single ? parseInt(single[1]) : 5;
}

// Asset → data URI Creatomate can embed inline
function toDataUri(asset: MediaAsset): string {
  const mime = asset.mimeType || 'image/jpeg';
  return `data:${mime};base64,${asset.base64}`;
}

// Build a single scene composition (one shot = one scene)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildScene(shot: ShotListItem, asset: MediaAsset, duration: number, isFirst: boolean): Record<string, any> {
  const isVideo = asset.type === 'video';
  const isHookShot = shot.shot === 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneElements: Record<string, any>[] = [
    // Background media
    {
      type: isVideo ? 'video' : 'image',
      track: 1,
      time: 0,
      duration: isVideo ? undefined : duration, // video uses its own duration
      ...(isVideo ? { trim_duration: duration } : {}),
      source: toDataUri(asset),
      fit: 'cover',
      x: '50%',
      y: '50%',
      width: '100%',
      height: '100%',
      x_anchor: '50%',
      y_anchor: '50%',
    },
  ];

  // Text overlay
  if (shot.onScreenText?.trim()) {
    sceneElements.push({
      type: 'text',
      track: 2,
      time: 0.2,
      duration: duration - 0.4,
      x: '50%',
      y: isHookShot ? '78%' : '82%',
      width: '86%',
      height: 'auto',
      x_anchor: '50%',
      y_anchor: '50%',
      x_alignment: '50%',
      y_alignment: '50%',
      text: shot.onScreenText,
      font_family: 'Montserrat',
      font_weight: '800',
      font_size: isHookShot ? 72 : 52,
      fill_color: '#ffffff',
      background_color: isHookShot ? 'rgba(99,102,241,0.88)' : 'rgba(0,0,0,0.6)',
      background_x_padding: '8%',
      background_y_padding: '5%',
      background_border_radius: 14,
      shadow_color: 'rgba(0,0,0,0.5)',
      shadow_blur: 6,
      animations: [
        {
          time: 0,
          duration: 0.4,
          easing: 'quadratic-out',
          type: 'text-slide',
          scope: 'split-clip',
          split: 'line',
          direction: 'up',
        },
      ],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scene: Record<string, any> = {
    type: 'composition',
    track: 1,
    duration,
    elements: sceneElements,
  };

  // Add fade-in transition on all scenes except the first
  if (!isFirst) {
    scene.animations = [
      {
        time: 0,
        duration: 0.5,
        transition: true,
        type: 'fade',
        easing: 'linear',
      },
    ];
  }

  return scene;
}

export interface ReelRenderResult {
  renderId: string;
  status: 'pending' | 'rendering' | 'done' | 'failed';
  videoUrl?: string;
}

/**
 * Submit an async Creatomate render.
 * Returns a renderId immediately — call fetchReelStatus() to poll completion.
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

  // Build scene compositions from shot list
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scenes: Record<string, any>[] = [];

  reel.shotList.forEach((shot, i) => {
    // Cycle through available assets — more assets = more variety in the reel
    const asset = assets[i % assets.length];
    const duration = parseDuration(shot.duration);
    scenes.push(buildScene(shot, asset, duration, i === 0));
  });

  // Branded outro scene (2 seconds)
  scenes.push({
    type: 'composition',
    track: 1,
    duration: 2,
    fill_color: 'rgba(15,4,32,1)',
    animations: [
      { time: 0, duration: 0.5, transition: true, type: 'fade', easing: 'linear' },
    ],
    elements: [
      // Brand name
      {
        type: 'text',
        track: 1,
        time: 0,
        x: '50%',
        y: '48%',
        width: '80%',
        height: 'auto',
        x_anchor: '50%',
        y_anchor: '50%',
        x_alignment: '50%',
        y_alignment: '50%',
        text: brandName,
        font_family: 'Montserrat',
        font_weight: '900',
        font_size: 88,
        fill_color: '#ffffff',
        letter_spacing: '2%',
        animations: [
          {
            time: 0,
            duration: 0.5,
            easing: 'quadratic-out',
            type: 'text-slide',
            scope: 'split-clip',
            split: 'line',
            direction: 'up',
          },
        ],
      },
      // Tagline
      {
        type: 'text',
        track: 2,
        time: 0.15,
        x: '50%',
        y: '60%',
        width: '70%',
        height: 'auto',
        x_anchor: '50%',
        y_anchor: '50%',
        x_alignment: '50%',
        y_alignment: '50%',
        text: reel.musicMood,
        font_family: 'Montserrat',
        font_weight: '400',
        font_size: 28,
        fill_color: 'rgba(192,132,252,1)',
        letter_spacing: '4%',
      },
      // Decorative line
      {
        type: 'rectangle',
        track: 3,
        time: 0,
        x: '50%',
        y: '55%',
        width: '60%',
        height: 2,
        x_anchor: '50%',
        y_anchor: '50%',
        fill_color: 'rgba(99,102,241,0.8)',
      },
    ],
  });

  const totalDuration = reel.shotList.reduce((sum, s) => sum + parseDuration(s.duration), 0) + 2;

  const source = {
    output_format: 'mp4',
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    frame_rate: 30,
    duration: totalDuration,
    fill_color: 'rgba(0,0,0,1)',
    elements: scenes,
  };

  console.log(`[Creatomate] Submitting — shots=${reel.shotList.length}, totalDuration=${totalDuration}s, assets=${assets.length}`);

  try {
    const renders = await client.startRender({ source });
    const render  = renders[0];
    console.log(`[Creatomate] Submitted — id=${render.id}, status=${render.status}`);

    return {
      renderId: render.id,
      status:   render.status === 'succeeded' ? 'done'
              : render.status === 'failed'    ? 'failed'
              : 'pending',
      videoUrl: render.status === 'succeeded' ? render.url : undefined,
    };
  } catch (err) {
    console.error('[Creatomate] startRender failed:', String(err).slice(0, 300));
    throw err;
  }
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
    renderId: render.id,
    status:   render.status === 'succeeded'  ? 'done'
            : render.status === 'failed'     ? 'failed'
            : render.status === 'planned' || render.status === 'waiting' || render.status === 'transcribing'
              ? 'pending'
              : 'rendering',
    videoUrl: render.status === 'succeeded' ? render.url : undefined,
  };
}

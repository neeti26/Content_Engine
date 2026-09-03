/**
 * Creatomate integration — renders a real 9:16 1080×1920 Instagram Reel .mp4
 * Uses the official Creatomate SDK typed classes (Source, Composition, Image, Video, Text, Fade)
 */

import {
  Client, Source, Composition, Image, Video, Text,
  Fit, ElementBase, Fade,
} from 'creatomate';
import { InstagramReelContent, ShotListItem, MediaAsset } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = ElementBase<any>;

const REEL_WIDTH  = 1080;
const REEL_HEIGHT = 1920;

function parseDuration(str: string): number {
  const range = str.match(/(\d+)\s*-\s*(\d+)/);
  if (range) return Math.max(1, parseInt(range[2]) - parseInt(range[1]));
  const single = str.match(/(\d+)/);
  return single ? parseInt(single[1]) : 5;
}

// Compress base64 image further for Creatomate inline data (400px, q0.55 → ~15-30KB each)
async function compressForCreatomate(base64: string, mimeType: string): Promise<string> {
  // Server-side: use sharp if available, else return as-is
  // Since we're in Next.js serverless, we use a simple re-encode via Buffer
  // The images are already compressed to 800px by the client — we just return them
  // Creatomate actually supports data URIs fine; the issue is elsewhere
  return base64;
}

function toDataUri(asset: MediaAsset): string {
  const mime = asset.mimeType || 'image/jpeg';
  return `data:${mime};base64,${asset.base64}`;
}

function buildSceneElements(
  shot: ShotListItem,
  asset: MediaAsset,
  duration: number,
): AnyElement[] {
  const isVideo  = asset.type === 'video';
  const isHook   = shot.shot === 1;
  const elements: AnyElement[] = [];

  // Background media element
  if (isVideo) {
    elements.push(new Video({
      track: 1,
      source: toDataUri(asset),
      fit: 'cover' as Fit,
      trimDuration: duration,
      width: '100%',
      height: '100%',
      x: '50%',
      y: '50%',
      xAnchor: '50%',
      yAnchor: '50%',
    }));
  } else {
    elements.push(new Image({
      track: 1,
      source: toDataUri(asset),
      fit: 'cover' as Fit,
      duration,
      width: '100%',
      height: '100%',
      x: '50%',
      y: '50%',
      xAnchor: '50%',
      yAnchor: '50%',
    }));
  }

  // Text overlay
  if (shot.onScreenText?.trim()) {
    elements.push(new Text({
      track: 2,
      time: 0.2,
      duration: Math.max(0.5, duration - 0.4),
      text: shot.onScreenText,
      fontFamily: 'Montserrat',
      fontWeight: '800',
      fontSize: isHook ? '72px' : '52px',
      fillColor: '#ffffff',
      backgroundColor: isHook ? 'rgba(99,102,241,0.88)' : 'rgba(0,0,0,0.62)',
      backgroundXPadding: '8%',
      backgroundYPadding: '5%',
      backgroundBorderRadius: 14,
      width: '86%',
      height: 'auto',
      x: '50%',
      y: isHook ? '78%' : '82%',
      xAnchor: '50%',
      yAnchor: '50%',
      xAlignment: '50%',
      yAlignment: '50%',
    }));
  }

  return elements;
}

export interface ReelRenderResult {
  renderId: string;
  status: 'pending' | 'rendering' | 'done' | 'failed';
  videoUrl?: string;
  errorMessage?: string;
}

export async function submitReelRender(
  reel: InstagramReelContent,
  assets: MediaAsset[],
  brandName: string,
): Promise<ReelRenderResult> {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) {
    console.warn('[Creatomate] CREATOMATE_API_KEY not set');
    return { renderId: '', status: 'failed', errorMessage: 'API key not configured' };
  }

  const client = new Client(apiKey);

  // Build one Composition per shot
  const scenes: Composition[] = reel.shotList.map((shot, i) => {
    const asset    = assets[i % assets.length];
    const duration = parseDuration(shot.duration);
    const isFirst  = i === 0;

    return new Composition({
      track: 1,
      duration,
      ...(!isFirst ? {
        animations: [new Fade({ time: 0, duration: 0.5, transition: true })],
      } : {}),
      elements: buildSceneElements(shot, asset, duration),
    });
  });

  // Branded outro
  const outro = new Composition({
    track: 1,
    duration: 2.5,
    fillColor: '#0f0420',
    animations: [new Fade({ time: 0, duration: 0.5, transition: true })],
    elements: [
      new Text({
        track: 1,
        time: 0,
        text: brandName,
        fontFamily: 'Montserrat',
        fontWeight: '900',
        fontSize: '88px',
        fillColor: '#ffffff',
        width: '80%',
        height: 'auto',
        x: '50%',
        y: '47%',
        xAnchor: '50%',
        yAnchor: '50%',
        xAlignment: '50%',
        yAlignment: '50%',
      }),
      new Text({
        track: 2,
        time: 0.2,
        text: reel.musicMood,
        fontFamily: 'Montserrat',
        fontWeight: '400',
        fontSize: '28px',
        fillColor: 'rgba(192,132,252,1)',
        width: '70%',
        height: 'auto',
        x: '50%',
        y: '60%',
        xAnchor: '50%',
        yAnchor: '50%',
        xAlignment: '50%',
        yAlignment: '50%',
      }),
    ],
  });

  const source = new Source({
    outputFormat: 'mp4',
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    frameRate: 30,
    fillColor: '#000000',
    elements: [...scenes, outro],
  });

  const totalDuration = reel.shotList.reduce((sum, s) => sum + parseDuration(s.duration), 0) + 2.5;
  console.log(`[Creatomate] Submitting render — shots=${reel.shotList.length}, duration=${totalDuration}s, assets=${assets.length}`);

  try {
    // Use startRender (async) — don't block the API response
    // The client polls /api/reel-status/[renderId] for completion
    const renders = await client.startRender({ source });
    const render  = renders[0];
    console.log(`[Creatomate] Submitted — id=${render.id}, status=${render.status}, error=${render.errorMessage ?? 'none'}`);

    return {
      renderId:     render.id,
      status:       render.status === 'succeeded' ? 'done'
                  : render.status === 'failed'    ? 'failed'
                  : 'pending',
      videoUrl:     render.status === 'succeeded' ? render.url : undefined,
      errorMessage: render.errorMessage,
    };
  } catch (err) {
    const msg = String(err);
    console.error('[Creatomate] startRender failed:', msg.slice(0, 400));
    throw err;
  }
}

export async function fetchReelStatus(renderId: string): Promise<ReelRenderResult> {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) return { renderId, status: 'failed', errorMessage: 'API key not configured' };

  const client = new Client(apiKey);

  try {
    const render = await client.fetchRender(renderId);
    console.log(`[Creatomate] Poll — id=${render.id}, status=${render.status}, error=${render.errorMessage ?? 'none'}`);

    return {
      renderId:     render.id,
      status:       render.status === 'succeeded'   ? 'done'
                  : render.status === 'failed'       ? 'failed'
                  : render.status === 'planned' || render.status === 'waiting' || render.status === 'transcribing'
                    ? 'pending' : 'rendering',
      videoUrl:     render.status === 'succeeded' ? render.url : undefined,
      errorMessage: render.errorMessage,
    };
  } catch (err) {
    console.error('[Creatomate] fetchRender failed:', String(err).slice(0, 200));
    return { renderId, status: 'failed', errorMessage: String(err).slice(0, 200) };
  }
}

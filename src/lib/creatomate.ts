/**
 * Creatomate integration — renders a real 9:16 1080×1920 Instagram Reel .mp4
 *
 * The Creatomate API is v2 (https://api.creatomate.com/v2). The v1 SDK that
 * was used here still talks to /v1, which now answers 404 for every endpoint
 * — that is why the reel render always failed. v2 takes a RenderScript
 * document directly, but it downloads every media source over HTTP, so the
 * uploaded photos are first put in Vercel Blob and referenced by their public
 * URL.
 */

import { put, del, list } from '@vercel/blob';
import { InstagramReelContent, ShotListItem, MediaAsset } from '@/types';

const REEL_WIDTH  = 1080;
const REEL_HEIGHT = 1920;
const CREATOMATE_API = 'https://api.creatomate.com/v2';

// Creatomate caps request bodies at 2 MB — keep the RenderScript well under it.
const MAX_BODY_BYTES = 1_800_000;

type RenderElement = Record<string, unknown>;

/** Blob paths per render id, so the uploads can be cleaned up afterwards. */
const uploadedAssets = new Map<string, string[]>();

function parseDuration(str: string): number {
  const range = str.match(/(\d+)\s*-\s*(\d+)/);
  if (range) return Math.max(1, parseInt(range[2]) - parseInt(range[1]));
  const single = str.match(/(\d+)/);
  return single ? parseInt(single[1]) : 5;
}

function isImageMime(mimeType: string): boolean {
  return !mimeType.startsWith('video/');
}

/**
 * Put an uploaded photo in Vercel Blob and return its public URL — Creatomate
 * fetches the media source over HTTP and cannot read a data: URI.
 */
async function uploadAsset(asset: MediaAsset, batchId: string, index: number): Promise<string> {
  const mime = asset.mimeType || 'image/jpeg';
  const ext = mime.startsWith('video/') ? 'mp4' : 'jpg';
  const pathname = `reel/${batchId}/${index}.${ext}`;

  const { url } = await put(pathname, Buffer.from(asset.base64, 'base64'), {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return url;
}

/**
 * Build the elements of one shot: the photo (or video) as a full-bleed
 * background plus the on-screen text.
 */
function buildSceneElements(
  shot: ShotListItem,
  assetUrl: string,
  isVideo: boolean,
  duration: number,
): RenderElement[] {
  const elements: RenderElement[] = [];

  elements.push({
    type: isVideo ? 'video' : 'image',
    name: `Media-${shot.shot}`,
    track: 1,
    source: assetUrl,
    fit: 'cover',
    duration,
    width: '100%',
    height: '100%',
    x: '50%',
    y: '50%',
    x_anchor: '50%',
    y_anchor: '50%',
  });

  if (shot.onScreenText?.trim()) {
    const isHook = shot.shot === 1;
    elements.push({
      type: 'text',
      name: `Caption-${shot.shot}`,
      track: 2,
      time: 0.2,
      duration: Math.max(0.5, duration - 0.4),
      text: shot.onScreenText,
      font_family: 'Montserrat',
      font_weight: '800',
      font_size: isHook ? '72px' : '52px',
      fill_color: '#ffffff',
      background_color: isHook ? 'rgba(99,102,241,0.88)' : 'rgba(0,0,0,0.62)',
      background_x_padding: '8%',
      background_y_padding: '5%',
      background_border_radius: 14,
      width: '86%',
      x: '50%',
      y: isHook ? '78%' : '82%',
      x_anchor: '50%',
      y_anchor: '50%',
      animations: [{ type: 'fade', time: 0, duration: 0.4 }],
    });
  }

  return elements;
}

/** The full RenderScript document for the reel. */
function buildRenderScript(
  reel: InstagramReelContent,
  assetUrls: string[],
  assetIsVideo: boolean[],
  brandName: string,
): Record<string, unknown> {
  const shots = reel.shotList ?? [];
  const usable = assetUrls.length > 0 ? assetUrls.length : 1;

  // One scene per shot; the photos are used round-robin.
  const scenes: RenderElement[] = shots.map((shot, i) => {
    const idx = i % usable;
    const duration = parseDuration(shot.duration);
    return {
      type: 'composition',
      name: `Scene-${shot.shot}`,
      track: 1,
      duration,
      elements: buildSceneElements(shot, assetUrls[idx], assetIsVideo[idx], duration),
    };
  });

  // Branded outro
  scenes.push({
    type: 'composition',
    name: 'Outro',
    track: 1,
    duration: 2.5,
    fill_color: '#0f0420',
    elements: [
      {
        type: 'text',
        name: 'Brand',
        track: 1,
        time: 0,
        text: brandName,
        font_family: 'Montserrat',
        font_weight: '900',
        font_size: '88px',
        fill_color: '#ffffff',
        width: '80%',
        x: '50%',
        y: '47%',
        x_anchor: '50%',
        y_anchor: '50%',
      },
      {
        type: 'text',
        name: 'Mood',
        track: 2,
        time: 0.2,
        text: reel.musicMood,
        font_family: 'Montserrat',
        font_weight: '400',
        font_size: '28px',
        fill_color: 'rgba(192,132,252,1)',
        width: '70%',
        x: '50%',
        y: '60%',
        x_anchor: '50%',
        y_anchor: '50%',
      },
    ],
  });

  return {
    output_format: 'mp4',
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    frame_rate: 30,
    fill_color: '#000000',
    elements: scenes,
  };
}

export interface ReelRenderResult {
  renderId: string;
  status: 'pending' | 'rendering' | 'done' | 'failed';
  videoUrl?: string;
  errorMessage?: string;
}

interface CreatomateRender {
  id?: string;
  status?: string;
  url?: string;
  error_message?: string;
  errorMessage?: string;
}

function mapStatus(status?: string): ReelRenderResult['status'] {
  switch (status) {
    case 'succeeded': return 'done';
    case 'failed':    return 'failed';
    case 'rendering':
    case 'transcribing': return 'rendering';
    default:          return 'pending';
  }
}

async function creatomateRequest<T>(
  path: string,
  apiKey: string,
  init?: { method?: string; body?: string },
): Promise<T> {
  const res = await fetch(`${CREATOMATE_API}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init?.body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Creatomate ${path} failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return await res.json() as T;
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
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('[Creatomate] BLOB_READ_WRITE_TOKEN not set — the renderer needs public media URLs');
    return { renderId: '', status: 'failed', errorMessage: 'Video rendering is not configured (BLOB_READ_WRITE_TOKEN missing)' };
  }
  if (!assets.length) {
    return { renderId: '', status: 'failed', errorMessage: 'No media to render' };
  }

  // Step 1: put the photos in Blob — Creatomate downloads every media source
  const batchId = crypto.randomUUID();
  const assetUrls: string[] = [];
  const assetIsVideo: boolean[] = [];
  console.log(`[Creatomate] Uploading ${assets.length} assets to Blob...`);
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    assetUrls.push(await uploadAsset(asset, batchId, i));
    assetIsVideo.push(!isImageMime(asset.mimeType || 'image/jpeg'));
  }
  console.log(`[Creatomate] Uploaded ${assetUrls.length} assets`);

  // Step 2: build the RenderScript
  const script = buildRenderScript(reel, assetUrls, assetIsVideo, brandName);
  let body = JSON.stringify(script);
  const elements = script.elements as RenderElement[];
  while (body.length > MAX_BODY_BYTES && elements.length > 2) {
    elements.pop();
    body = JSON.stringify(script);
  }
  console.log(`[Creatomate] RenderScript — scenes=${elements.length}, body=${Math.round(body.length / 1024)}KB`);

  try {
    const render = await creatomateRequest<CreatomateRender>('/renders', apiKey, {
      method: 'POST',
      body,
    });

    const id = render.id ?? '';
    const status = mapStatus(render.status);
    const errorMessage = render.error_message ?? render.errorMessage;

    if (id) uploadedAssets.set(id, assetUrls);

    console.log(`[Creatomate] Submitted — id=${id}, status=${render.status}, error=${errorMessage ?? 'none'}`);

    return {
      renderId: id,
      status,
      videoUrl: render.status === 'succeeded' ? render.url : undefined,
      errorMessage,
    };
  } catch (err) {
    const msg = String(err instanceof Error ? err.message : err);
    console.error('[Creatomate] startRender failed:', msg.slice(0, 400));
    // Nothing will be rendered — drop the uploads again
    await cleanupAssets(assetUrls);
    throw err;
  }
}

/** Remove the Blob uploads of a finished render. */
async function cleanupAssets(urls: string[]): Promise<void> {
  if (!urls.length) return;
  try {
    await del(urls, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (err) {
    console.warn('[Creatomate] Could not clean up uploads:', String(err).slice(0, 160));
  }
}

/**
 * The uploads of a render can only be deleted by the instance that made them,
 * so a poll on a different instance would leave them behind. Sweep the
 * leftovers: every upload older than an hour has served its render.
 */
async function sweepOldUploads(): Promise<void> {
  try {
    const { blobs } = await list({ prefix: 'reel/', token: process.env.BLOB_READ_WRITE_TOKEN });
    const cutoff = Date.now() - 60 * 60 * 1000;
    const stale = blobs
      .filter(b => new Date(b.uploadedAt).getTime() < cutoff)
      .map(b => b.url);
    if (stale.length) {
      await del(stale, { token: process.env.BLOB_READ_WRITE_TOKEN });
      console.log(`[Creatomate] Swept ${stale.length} expired upload(s)`);
    }
  } catch (err) {
    console.warn('[Creatomate] Upload sweep failed:', String(err).slice(0, 160));
  }
}

export async function fetchReelStatus(renderId: string): Promise<ReelRenderResult> {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) return { renderId, status: 'failed', errorMessage: 'API key not configured' };

  let render: CreatomateRender | null = null;
  try {
    render = await creatomateRequest<CreatomateRender>(`/renders/${renderId}`, apiKey);
    const errorMessage = render.error_message ?? render.errorMessage;
    console.log(`[Creatomate] Poll — id=${render.id ?? renderId}, status=${render.status}, error=${errorMessage ?? 'none'}`);

    return {
      renderId: render.id ?? renderId,
      status: mapStatus(render.status),
      videoUrl: render.status === 'succeeded' ? render.url : undefined,
      errorMessage,
    };
  } catch (err) {
    const msg = String(err instanceof Error ? err.message : err).slice(0, 200);
    console.error('[Creatomate] fetchRender failed:', msg);
    return { renderId, status: 'failed', errorMessage: msg };
  } finally {
    // The render is finished — the uploaded photos are no longer needed
    if (render && (render.status === 'succeeded' || render.status === 'failed')) {
      const urls = uploadedAssets.get(renderId);
      if (urls) {
        uploadedAssets.delete(renderId);
        await cleanupAssets(urls);
      }
      await sweepOldUploads();
    }
  }
}

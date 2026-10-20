import { MediaAsset, AssetScore } from '@/types';
import { scoreAndDescribeImages, scoreAndDescribeImage, generateJSON } from './gemini';
import { deadlineExceeded, phaseExceeded } from './deadline';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function scoreAllAssets(
  assets: MediaAsset[],
  eventContext: string
): Promise<Array<MediaAsset & { description: string }>> {
  const BATCH = 3;
  const scored: Array<MediaAsset & { description: string }> = [];

  for (let i = 0; i < assets.length; i += BATCH) {
    const batch = assets.slice(i, i + BATCH);

    // Out of time — score the rest with defaults so the request still finishes
    if (deadlineExceeded() || phaseExceeded()) {
      for (const asset of batch) scored.push(fallbackScored(asset));
      continue;
    }

    // One request for the whole batch — the free tier only allows 20 requests
    // per day per key per model, so every saved call matters.
    const payload = batch.map(a => ({
      base64: a.type === 'video' && a.thumbnailBase64 ? a.thumbnailBase64 : a.base64,
      mimeType: a.type === 'video' ? 'image/jpeg' : a.mimeType,
    }));

    let results: Array<{
      sharpness: number; composition: number; brandRelevance: number;
      humanEngagement: number; overall: number; reasoning: string; description: string;
    }> = [];
    try {
      results = await scoreAndDescribeImages(payload, eventContext);
    } catch (err) {
      const msg = String(err);
      // A quota/rate-limit problem will not get better by asking again, so only
      // fall back to one request per photo when the batch itself was rejected.
      if (!/429|quota|503|UNAVAILABLE|high demand|fetch failed/i.test(msg)) {
        console.warn('[Scorer] Batch request rejected, scoring photos one by one');
        try {
          results = await Promise.all(
            payload.map(p => scoreAndDescribeImage(p.base64, p.mimeType, eventContext))
          );
        } catch {
          results = [];
        }
      } else {
        console.error('[Scorer] Batch scoring failed, using default scores:', msg.slice(0, 160));
      }
    }

    for (let j = 0; j < batch.length; j++) {
      const asset = batch[j];
      const v = results[j];
      if (v) {
        scored.push({
          ...asset,
          description: v.description || (asset.type === 'video' ? 'Event video' : 'Event photo'),
          score: {
            sharpness:       clamp(v.sharpness, 0, 10),
            composition:     clamp(v.composition, 0, 10),
            brandRelevance:  clamp(v.brandRelevance, 0, 10),
            humanEngagement: clamp(v.humanEngagement, 0, 10),
            overall:         clamp(v.overall, 0, 10),
            reasoning:       v.reasoning ?? '',
          } as AssetScore,
        });
      } else {
        scored.push(fallbackScored(asset));
      }
    }
    if (i + BATCH < assets.length) await sleep(1500);
  }

  return scored;
}

function fallbackScored(asset: MediaAsset): MediaAsset & { description: string } {
  return {
    ...asset,
    description: asset.type === 'video' ? 'Event video' : 'Event photo',
    score: defaultScore(),
  };
}

export interface AssetSelection {
  linkedin: string; instagramPost: string;
  twitter: string; whatsapp: string; caseStudy: string[];
  instagramReel: string; rationale: Record<string, string>;
}

/**
 * Pick the assets without asking the AI — the best scored photo per platform.
 * Used when the selection call fails (e.g. the model is temporarily busy), so
 * a hiccup there never fails the whole request.
 */
export function fallbackSelection(
  assets: Array<MediaAsset & { description?: string }>
): AssetSelection {
  const scored = [...assets]
    .filter((a) => a.score)
    .sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));
  const bestVideo = assets.find(a => a.type === 'video');
  const ids = assets.map((a) => a.id);

  return {
    linkedin:      scored[0]?.id ?? ids[0] ?? '',
    instagramPost: scored[1]?.id ?? scored[0]?.id ?? ids[0] ?? '',
    instagramReel: bestVideo?.id ?? scored[0]?.id ?? ids[0] ?? '',
    twitter:       scored[1]?.id ?? scored[0]?.id ?? ids[0] ?? '',
    whatsapp:      scored[1]?.id ?? scored[0]?.id ?? ids[0] ?? '',
    caseStudy:     scored.slice(0, 4).map((a) => a.id),
    rationale:     {} as Record<string, string>,
  };
}

export async function selectBestAssets(
  assets: Array<MediaAsset & { description?: string }>,
  eventContext: string
): Promise<AssetSelection> {
  const scored = [...assets]
    .filter((a) => a.score)
    .sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));

  const bestVideo = assets.find(a => a.type === 'video');

  if (scored.length === 0) {
    return fallbackSelection(assets);
  }

  const summaries = scored.slice(0, 8).map((a) => ({
    id:         a.id,
    type:       a.type,
    desc:       (a as MediaAsset & { description?: string }).description ?? '',
    score:      a.score?.overall?.toFixed(1),
    engagement: a.score?.humanEngagement?.toFixed(1),
  }));

  const result = await generateJSON<{
    linkedin: string; instagramPost: string;
    twitter: string; whatsapp: string; caseStudy: string[];
    instagramReel: string; rationale: Record<string, string>;
  }>(
    'You are a marketing strategist. Select the best asset ID for each platform. Prefer video for instagramReel. Return only JSON.',
    `Event: ${eventContext}
Assets: ${JSON.stringify(summaries)}

Return this JSON:
{
  "linkedin": "asset_id",
  "instagramPost": "asset_id",
  "instagramReel": "asset_id — prefer video",
  "twitter": "asset_id",
  "whatsapp": "asset_id",
  "caseStudy": ["id1","id2","id3"],
  "rationale": {"linkedin":"why","instagramPost":"why","instagramReel":"why","twitter":"why","whatsapp":"why","caseStudy":"why"}
}`,
    700
  );

  return {
    linkedin:      result.linkedin      ?? scored[0]?.id ?? '',
    instagramPost: result.instagramPost ?? scored[1]?.id ?? scored[0]?.id ?? '',
    instagramReel: result.instagramReel ?? bestVideo?.id ?? scored[0]?.id ?? '',
    twitter:       result.twitter       ?? scored[1]?.id ?? scored[0]?.id ?? '',
    whatsapp:      result.whatsapp      ?? scored[1]?.id ?? scored[0]?.id ?? '',
    caseStudy:     result.caseStudy     ?? scored.slice(0, 4).map((a) => a.id),
    rationale:     (result.rationale    ?? {}) as Record<string, string>,
  };
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
function defaultScore(): AssetScore {
  return { sharpness: 5, composition: 5, brandRelevance: 5, humanEngagement: 5, overall: 5, reasoning: 'Could not analyze' };
}

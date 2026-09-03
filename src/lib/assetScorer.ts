import { MediaAsset, AssetScore } from '@/types';
import { scoreAndDescribeImage, generateJSON } from './gemini';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Score assets in batches of 3 to stay within free-tier rate limits (15 RPM).
 * For video assets we score the extracted thumbnail (thumbnailBase64) so we
 * never send a huge video file to Gemini inline data.
 */
export async function scoreAllAssets(
  assets: MediaAsset[],
  eventContext: string
): Promise<Array<MediaAsset & { description: string }>> {
  const BATCH = 3;
  const scored: Array<MediaAsset & { description: string }> = [];

  for (let i = 0; i < assets.length; i += BATCH) {
    const batch = assets.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map((a) => {
        // For video: score the thumbnail frame, not the raw video bytes
        const base64  = a.type === 'video' && a.thumbnailBase64 ? a.thumbnailBase64 : a.base64;
        const mime    = a.type === 'video' ? 'image/jpeg' : a.mimeType;
        const context = a.type === 'video'
          ? `${eventContext} (this is a video thumbnail frame)`
          : eventContext;
        return scoreAndDescribeImage(base64, mime, context);
      })
    );
    for (let j = 0; j < batch.length; j++) {
      const asset = batch[j];
      const r = results[j];
      if (r.status === 'fulfilled') {
        const v = r.value;
        scored.push({
          ...asset,
          description: v.description ?? (asset.type === 'video' ? 'Event video' : 'Event photo'),
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
        scored.push({
          ...asset,
          description: asset.type === 'video' ? 'Event video' : 'Event photo',
          score: defaultScore(),
        });
      }
    }
    if (i + BATCH < assets.length) await sleep(1500);
  }

  return scored;
}

export async function selectBestAssets(
  assets: Array<MediaAsset & { description?: string }>,
  eventContext: string
): Promise<{
  linkedin: string; instagramPost: string; instagramStory: string;
  twitter: string; whatsapp: string; caseStudy: string[];
  instagramReel: string; rationale: Record<string, string>;
}> {
  const scored = [...assets]
    .filter((a) => a.score)
    .sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));

  // Prefer a video asset for the reel slot; fall back to best image
  const bestVideo = assets.find(a => a.type === 'video');

  if (scored.length === 0) {
    const ids = assets.map((a) => a.id);
    return {
      linkedin:       ids[0] ?? '',
      instagramPost:  ids[1] ?? ids[0] ?? '',
      instagramStory: ids[2] ?? ids[0] ?? '',
      instagramReel:  bestVideo?.id ?? ids[0] ?? '',
      twitter:        ids[1] ?? ids[0] ?? '',
      whatsapp:       ids[1] ?? ids[0] ?? '',
      caseStudy:      ids.slice(0, 4),
      rationale:      {} as Record<string, string>,
    };
  }

  const summaries = scored.slice(0, 8).map((a) => ({
    id:          a.id,
    type:        a.type,
    desc:        (a as MediaAsset & { description?: string }).description ?? '',
    score:       a.score?.overall?.toFixed(1),
    engagement:  a.score?.humanEngagement?.toFixed(1),
  }));

  const result = await generateJSON<{
    linkedin: string; instagramPost: string; instagramStory: string;
    twitter: string; whatsapp: string; caseStudy: string[];
    instagramReel: string; rationale: Record<string, string>;
  }>(
    'You are a marketing strategist. Select the best asset ID for each platform. Prefer video assets for the instagramReel slot. Return only JSON.',
    `Event: ${eventContext}
Assets ranked best to worst: ${JSON.stringify(summaries)}

Return this JSON selecting the best asset ID for each platform:
{
  "linkedin": "asset_id_here",
  "instagramPost": "asset_id_here",
  "instagramStory": "asset_id_here",
  "instagramReel": "asset_id_here — prefer video type if available",
  "twitter": "asset_id_here",
  "whatsapp": "asset_id_here",
  "caseStudy": ["asset_id_1","asset_id_2","asset_id_3"],
  "rationale": {
    "linkedin": "why this asset",
    "instagramPost": "why this asset",
    "instagramStory": "why this asset",
    "instagramReel": "why this asset",
    "twitter": "why this asset",
    "whatsapp": "why this asset",
    "caseStudy": "why these assets"
  }
}`,
    900
  );

  return {
    linkedin:       result.linkedin       ?? scored[0]?.id ?? '',
    instagramPost:  result.instagramPost  ?? scored[1]?.id ?? scored[0]?.id ?? '',
    instagramStory: result.instagramStory ?? scored[2]?.id ?? scored[0]?.id ?? '',
    instagramReel:  result.instagramReel  ?? bestVideo?.id ?? scored[0]?.id ?? '',
    twitter:        result.twitter        ?? scored[1]?.id ?? scored[0]?.id ?? '',
    whatsapp:       result.whatsapp       ?? scored[1]?.id ?? scored[0]?.id ?? '',
    caseStudy:      result.caseStudy      ?? scored.slice(0, 4).map((a) => a.id),
    rationale:      (result.rationale     ?? {}) as Record<string, string>,
  };
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
function defaultScore(): AssetScore {
  return { sharpness: 5, composition: 5, brandRelevance: 5, humanEngagement: 5, overall: 5, reasoning: 'Could not analyze' };
}

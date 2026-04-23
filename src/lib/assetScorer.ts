import { MediaAsset, AssetScore } from '@/types';
import { scoreAndDescribeImage, generateJSON } from './gemini';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Score assets in batches of 3 to stay within free-tier rate limits (15 RPM).
 * 3 parallel + 1.5s gap = ~12 RPM — safely under the limit.
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
      batch.map((a) => scoreAndDescribeImage(a.base64, a.mimeType, eventContext))
    );
    for (let j = 0; j < batch.length; j++) {
      const asset = batch[j];
      const r = results[j];
      if (r.status === 'fulfilled') {
        const v = r.value;
        scored.push({
          ...asset,
          description: v.description ?? 'Event photo',
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
        scored.push({ ...asset, description: 'Event photo', score: defaultScore() });
      }
    }
    // Small gap between batches to avoid rate limit
    if (i + BATCH < assets.length) await sleep(1500);
  }

  return scored;
}

export async function selectBestAssets(
  assets: Array<MediaAsset & { description?: string }>,
  eventContext: string
): Promise<{
  linkedin: string; instagramPost: string; instagramStory: string;
  twitter: string; caseStudy: string[]; rationale: Record<string, string>;
}> {
  const scored = [...assets]
    .filter((a) => a.score)
    .sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));

  if (scored.length === 0) {
    const ids = assets.map((a) => a.id);
    return {
      linkedin: ids[0] ?? '', instagramPost: ids[1] ?? ids[0] ?? '',
      instagramStory: ids[2] ?? ids[0] ?? '', twitter: ids[1] ?? ids[0] ?? '',
      caseStudy: ids.slice(0, 4), rationale: {},
    };
  }

  const summaries = scored.slice(0, 8).map((a) => ({
    id: a.id,
    desc: (a as MediaAsset & { description?: string }).description ?? '',
    score: a.score?.overall?.toFixed(1),
    engagement: a.score?.humanEngagement?.toFixed(1),
  }));

  const result = await generateJSON<{
    linkedin: string; instagramPost: string; instagramStory: string;
    twitter: string; caseStudy: string[]; rationale: Record<string, string>;
  }>(
    'You are a marketing strategist. Select the best image ID for each platform. Return only JSON.',
    `Event: ${eventContext}
Assets ranked best to worst: ${JSON.stringify(summaries)}

Return this JSON selecting the best asset ID for each platform:
{
  "linkedin": "asset_id_here",
  "instagramPost": "asset_id_here",
  "instagramStory": "asset_id_here",
  "twitter": "asset_id_here",
  "caseStudy": ["asset_id_1","asset_id_2","asset_id_3"],
  "rationale": {
    "linkedin": "why this image",
    "instagramPost": "why this image",
    "instagramStory": "why this image",
    "twitter": "why this image",
    "caseStudy": "why these images"
  }
}`,
    800
  );

  return {
    linkedin:      result.linkedin      ?? scored[0]?.id ?? '',
    instagramPost: result.instagramPost ?? scored[1]?.id ?? scored[0]?.id ?? '',
    instagramStory:result.instagramStory?? scored[2]?.id ?? scored[0]?.id ?? '',
    twitter:       result.twitter       ?? scored[1]?.id ?? scored[0]?.id ?? '',
    caseStudy:     result.caseStudy     ?? scored.slice(0, 4).map((a) => a.id),
    rationale:     result.rationale     ?? {},
  };
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
function defaultScore(): AssetScore {
  return { sharpness: 5, composition: 5, brandRelevance: 5, humanEngagement: 5, overall: 5, reasoning: 'Could not analyze' };
}

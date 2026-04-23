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
    'Marketing strategist. Select best image ID per platform. Return JSON only.',
    `Event: ${eventContext}
Assets (best first): ${JSON.stringify(summaries)}
Return: {"linkedin":"<id>","instagramPost":"<id>","instagramStory":"<id>","twitter":"<id>","caseStudy":["<id>","<id>","<id>"],"rationale":{"linkedin":"<why>","instagramPost":"<why>","instagramStory":"<why>","twitter":"<why>","caseStudy":"<why>"}}`,
    350
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

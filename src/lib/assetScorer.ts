import { MediaAsset, AssetScore } from '@/types';
import { scoreAndDescribeImage, generateJSON } from './openai';

/** Score all assets in PARALLEL — 10x faster than sequential */
export async function scoreAllAssets(
  assets: MediaAsset[],
  eventContext: string
): Promise<Array<MediaAsset & { description: string }>> {
  const results = await Promise.allSettled(
    assets.map((asset) => scoreAndDescribeImage(asset.base64, asset.mimeType, eventContext))
  );

  return assets.map((asset, i) => {
    const r = results[i];
    if (r.status === 'fulfilled') {
      const v = r.value;
      return {
        ...asset,
        description: v.description ?? '',
        score: {
          sharpness: clamp(v.sharpness, 0, 10),
          composition: clamp(v.composition, 0, 10),
          brandRelevance: clamp(v.brandRelevance, 0, 10),
          humanEngagement: clamp(v.humanEngagement, 0, 10),
          overall: clamp(v.overall, 0, 10),
          reasoning: v.reasoning ?? '',
        } as AssetScore,
      };
    }
    return { ...asset, description: '', score: defaultScore() };
  });
}

export async function selectBestAssets(
  assets: Array<MediaAsset & { description?: string }>,
  eventContext: string
): Promise<{
  linkedin: string;
  instagramPost: string;
  instagramStory: string;
  twitter: string;
  caseStudy: string[];
  rationale: Record<string, string>;
}> {
  const scored = [...assets]
    .filter((a) => a.score)
    .sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));

  if (scored.length === 0) {
    const ids = assets.map((a) => a.id);
    return { linkedin: ids[0]??'', instagramPost: ids[1]??ids[0]??'', instagramStory: ids[2]??ids[0]??'', twitter: ids[1]??ids[0]??'', caseStudy: ids.slice(0,4), rationale: {} };
  }

  const summaries = scored.slice(0, 10).map((a) => ({
    id: a.id,
    name: a.name,
    description: (a as MediaAsset & { description?: string }).description ?? '',
    score: a.score,
  }));

  const result = await generateJSON<{
    linkedin: string; instagramPost: string; instagramStory: string;
    twitter: string; caseStudy: string[]; rationale: Record<string, string>;
  }>(
    'You are a marketing strategist. Select the best image ID for each platform.',
    `Event: ${eventContext}

Assets (sorted best→worst):
${JSON.stringify(summaries, null, 2)}

Rules:
- linkedin: professional, brand-forward, high overall score
- instagramPost: visually striking, colorful, high engagement score
- instagramStory: bold, works cropped to 9:16, high composition score
- twitter: dynamic, shareable, tells a story instantly
- caseStudy: pick 3-4 diverse images showing different aspects

Return JSON:
{"linkedin":"<id>","instagramPost":"<id>","instagramStory":"<id>","twitter":"<id>","caseStudy":["<id>","<id>","<id>"],"rationale":{"linkedin":"<why>","instagramPost":"<why>","instagramStory":"<why>","twitter":"<why>","caseStudy":"<why>"}}`
  );

  return {
    linkedin: result.linkedin ?? scored[0]?.id ?? '',
    instagramPost: result.instagramPost ?? scored[1]?.id ?? scored[0]?.id ?? '',
    instagramStory: result.instagramStory ?? scored[2]?.id ?? scored[0]?.id ?? '',
    twitter: result.twitter ?? scored[1]?.id ?? scored[0]?.id ?? '',
    caseStudy: result.caseStudy ?? scored.slice(0, 4).map((a) => a.id),
    rationale: result.rationale ?? {},
  };
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
function defaultScore(): AssetScore { return { sharpness:5, composition:5, brandRelevance:5, humanEngagement:5, overall:5, reasoning:'Could not analyze' }; }

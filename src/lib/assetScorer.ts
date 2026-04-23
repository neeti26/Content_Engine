import { MediaAsset, AssetScore } from '@/types';
import { scoreAndDescribeImage, generateJSON } from './gemini';

export async function scoreAllAssets(
  assets: MediaAsset[],
  eventContext: string
): Promise<Array<MediaAsset & { description: string }>> {
  // All images scored in parallel — Gemini Flash handles this fast
  const results = await Promise.allSettled(
    assets.map((a) => scoreAndDescribeImage(a.base64, a.mimeType, eventContext))
  );

  return assets.map((asset, i) => {
    const r = results[i];
    if (r.status === 'fulfilled') {
      const v = r.value;
      return {
        ...asset,
        description: v.description ?? 'Event photo',
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
    return { ...asset, description: 'Event photo', score: defaultScore() };
  });
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
    return { linkedin: ids[0]??'', instagramPost: ids[1]??ids[0]??'', instagramStory: ids[2]??ids[0]??'', twitter: ids[1]??ids[0]??'', caseStudy: ids.slice(0,4), rationale: {} };
  }

  const summaries = scored.slice(0, 10).map((a) => ({
    id: a.id,
    desc: (a as MediaAsset & { description?: string }).description ?? '',
    score: a.score?.overall?.toFixed(1),
    sharpness: a.score?.sharpness?.toFixed(1),
    engagement: a.score?.humanEngagement?.toFixed(1),
  }));

  const result = await generateJSON<{
    linkedin: string; instagramPost: string; instagramStory: string;
    twitter: string; caseStudy: string[]; rationale: Record<string, string>;
  }>(
    'Marketing strategist. Select best image ID per platform. Return JSON only.',
    `Event: ${eventContext}
Assets (best→worst): ${JSON.stringify(summaries)}
Rules: linkedin=professional+brand, instagramPost=colorful+engaging, instagramStory=bold+vertical, twitter=dynamic+shareable, caseStudy=3-4 diverse
Return: {"linkedin":"<id>","instagramPost":"<id>","instagramStory":"<id>","twitter":"<id>","caseStudy":["<id>","<id>","<id>"],"rationale":{"linkedin":"<why>","instagramPost":"<why>","instagramStory":"<why>","twitter":"<why>","caseStudy":"<why>"}}`,
    400
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

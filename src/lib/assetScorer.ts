import { MediaAsset, AssetScore } from '@/types';
import { analyzeImageWithVision, generateJSON } from './openai';

interface ScoringResult {
  sharpness: number;
  composition: number;
  brandRelevance: number;
  humanEngagement: number;
  overall: number;
  reasoning: string;
}

export async function scoreAsset(
  asset: MediaAsset,
  eventContext: string
): Promise<AssetScore> {
  const prompt = `You are an expert marketing photographer and content strategist.

Analyze this event photo for marketing use. Score it on these dimensions (0-10 each):

1. **Sharpness & Technical Quality**: Is the image sharp, well-lit, properly exposed?
2. **Composition**: Is the framing good? Rule of thirds, visual balance, focal point?
3. **Brand Relevance**: Does it show brand elements, stage, banners, or key moments?
4. **Human Engagement**: Does it show people engaged, excited, or in meaningful interaction?

Event Context: ${eventContext}

Respond with JSON:
{
  "sharpness": <0-10>,
  "composition": <0-10>,
  "brandRelevance": <0-10>,
  "humanEngagement": <0-10>,
  "overall": <0-10, weighted average>,
  "reasoning": "<2-3 sentence explanation of why this image was scored this way>"
}`;

  try {
    const result = await analyzeImageWithVision(
      asset.base64,
      asset.mimeType,
      prompt
    );

    // Parse JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return getDefaultScore();
    }

    const parsed = JSON.parse(jsonMatch[0]) as ScoringResult;
    return {
      sharpness: clamp(parsed.sharpness, 0, 10),
      composition: clamp(parsed.composition, 0, 10),
      brandRelevance: clamp(parsed.brandRelevance, 0, 10),
      humanEngagement: clamp(parsed.humanEngagement, 0, 10),
      overall: clamp(parsed.overall, 0, 10),
      reasoning: parsed.reasoning || 'No reasoning provided',
    };
  } catch {
    return getDefaultScore();
  }
}

export async function selectBestAssets(
  assets: MediaAsset[],
  eventContext: string
): Promise<{
  linkedin: string;
  instagramPost: string;
  instagramStory: string;
  caseStudy: string[];
  rationale: Record<string, string>;
}> {
  // Sort by overall score
  const scored = assets
    .filter((a) => a.score)
    .sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));

  if (scored.length === 0) {
    const ids = assets.map((a) => a.id);
    return {
      linkedin: ids[0] ?? '',
      instagramPost: ids[1] ?? ids[0] ?? '',
      instagramStory: ids[2] ?? ids[0] ?? '',
      caseStudy: ids.slice(0, 4),
      rationale: {},
    };
  }

  // Use AI to make final selection decisions
  const assetSummaries = scored.slice(0, Math.min(scored.length, 10)).map((a) => ({
    id: a.id,
    name: a.name,
    score: a.score,
  }));

  const result = await generateJSON<{
    linkedin: string;
    instagramPost: string;
    instagramStory: string;
    caseStudy: string[];
    rationale: Record<string, string>;
  }>(
    `You are a marketing content strategist. Select the best images for each platform based on scores and context.`,
    `Event Context: ${eventContext}

Available assets with scores:
${JSON.stringify(assetSummaries, null, 2)}

Select the best asset ID for each platform:
- LinkedIn: needs professional, high-quality, brand-forward image
- Instagram Post: needs visually striking, engaging, colorful image  
- Instagram Story: needs vertical-friendly, bold, high-energy image
- Case Study: needs 3-5 diverse images showing different aspects

Return JSON:
{
  "linkedin": "<asset_id>",
  "instagramPost": "<asset_id>",
  "instagramStory": "<asset_id>",
  "caseStudy": ["<asset_id>", ...],
  "rationale": {
    "linkedin": "<why this image for LinkedIn>",
    "instagramPost": "<why this image for Instagram Post>",
    "instagramStory": "<why this image for Instagram Story>",
    "caseStudy": "<why these images for Case Study>"
  }
}`
  );

  return {
    linkedin: result.linkedin ?? scored[0]?.id ?? '',
    instagramPost: result.instagramPost ?? scored[1]?.id ?? scored[0]?.id ?? '',
    instagramStory: result.instagramStory ?? scored[2]?.id ?? scored[0]?.id ?? '',
    caseStudy: result.caseStudy ?? scored.slice(0, 4).map((a) => a.id),
    rationale: result.rationale ?? {},
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getDefaultScore(): AssetScore {
  return {
    sharpness: 5,
    composition: 5,
    brandRelevance: 5,
    humanEngagement: 5,
    overall: 5,
    reasoning: 'Default score — could not analyze image',
  };
}

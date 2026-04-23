import {
  EventBrief, MediaAsset, LinkedInContent, InstagramPostContent,
  InstagramStoryContent, TwitterContent, CaseStudyContent,
} from '@/types';
import { generateJSON } from './openai';

type AssetWithDesc = MediaAsset & { description?: string };

// ─── LinkedIn ────────────────────────────────────────────────────────────────

export async function generateLinkedInContent(
  brief: EventBrief,
  asset: AssetWithDesc
): Promise<LinkedInContent> {
  const result = await generateJSON<LinkedInContent>(
    `Senior B2B marketing copywriter. Write LinkedIn posts that drive engagement. Tone: ${brief.tone}. Never start with "We" or "I".`,
    `Event: ${brief.eventName} by ${brief.brandName} (${brief.eventType}, ${brief.location}, ${brief.date})
Highlights: ${brief.keyHighlights}
Audience: ${brief.targetAudience}
Photo shows: ${asset.description ?? 'event highlights'}

Write a LinkedIn post. Return JSON:
{
  "headline": "<punchy 1-liner, max 100 chars>",
  "body": "<3-4 paragraphs storytelling, specific details, ends with insight/question, use \\n for breaks>",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7"],
  "callToAction": "<specific CTA>",
  "selectedImageId": "${asset.id}",
  "characterCount": 0
}`
  );
  return { ...result, selectedImageId: asset.id, characterCount: ((result.headline??'')+(result.body??'')).length };
}

// ─── Instagram Post ──────────────────────────────────────────────────────────

export async function generateInstagramPostContent(
  brief: EventBrief,
  asset: AssetWithDesc
): Promise<InstagramPostContent> {
  const result = await generateJSON<InstagramPostContent>(
    `Instagram content strategist. Write scroll-stopping captions. Tone: ${brief.tone}. Use emojis strategically.`,
    `Event: ${brief.eventName} by ${brief.brandName}
Highlights: ${brief.keyHighlights}
Photo vibe: ${asset.description ?? 'energetic event moment'}

Write an Instagram caption. Return JSON:
{
  "caption": "<hook first line that stops scroll, then 150-200 words with 5-6 emojis woven in, end with question>",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10","#tag11","#tag12","#tag13","#tag14","#tag15","#tag16","#tag17","#tag18","#tag19","#tag20","#tag21","#tag22","#tag23","#tag24","#tag25"],
  "emojis": ["🔥","✨","💫","🎯","🚀"],
  "selectedImageId": "${asset.id}",
  "characterCount": 0
}`
  );
  return { ...result, selectedImageId: asset.id, characterCount: result.caption?.length ?? 0 };
}

// ─── Instagram Story ─────────────────────────────────────────────────────────

export async function generateInstagramStoryContent(
  brief: EventBrief,
  asset: AssetWithDesc
): Promise<InstagramStoryContent> {
  const result = await generateJSON<InstagramStoryContent>(
    `Instagram Story designer. Text must be SHORT and HIGH IMPACT. Think billboard, not paragraph.`,
    `Event: ${brief.eventName} by ${brief.brandName}. Tone: ${brief.tone}.
Highlights: ${brief.keyHighlights}

Return JSON:
{
  "headline": "<MAX 4 WORDS ALL CAPS — e.g. WE MADE HISTORY>",
  "subtext": "<max 8 words supporting context>",
  "ctaText": "<max 3 words — e.g. See More>",
  "selectedImageId": "${asset.id}",
  "overlayStyle": "gradient"
}`
  );
  return { ...result, selectedImageId: asset.id };
}

// ─── Twitter/X Thread ────────────────────────────────────────────────────────

export async function generateTwitterContent(
  brief: EventBrief,
  asset: AssetWithDesc
): Promise<TwitterContent> {
  const result = await generateJSON<TwitterContent>(
    `Viral Twitter/X strategist. Write threads that get retweeted. Each tweet punchy, standalone, builds on previous.`,
    `Event: ${brief.eventName} by ${brief.brandName} (${brief.eventType})
Highlights: ${brief.keyHighlights}
Tone: ${brief.tone}

Write a 5-tweet thread. Each tweet MAX 260 chars. Return JSON:
{
  "threadHook": "<tweet 1 — bold hook ending with 🧵>",
  "tweets": [
    "<tweet 1: bold hook + 🧵>",
    "<tweet 2: the story, what happened>",
    "<tweet 3: key insight or surprising stat>",
    "<tweet 4: impact + numbers>",
    "<tweet 5: CTA + hashtags>"
  ],
  "selectedImageId": "${asset.id}"
}`
  );
  return { ...result, selectedImageId: asset.id };
}

// ─── Case Study ──────────────────────────────────────────────────────────────

export async function generateCaseStudyContent(
  brief: EventBrief,
  selectedAssetIds: string[]
): Promise<CaseStudyContent> {
  const result = await generateJSON<CaseStudyContent>(
    `Senior marketing strategist. Write data-informed, narrative-driven case studies. Be specific with numbers.`,
    `Event: ${brief.eventName} by ${brief.brandName} (${brief.eventType}, ${brief.location}, ${brief.date})
Highlights: ${brief.keyHighlights}
Audience: ${brief.targetAudience}

Return JSON:
{
  "title": "<compelling case study title>",
  "executiveSummary": "<2-3 sentences with specific outcomes>",
  "eventOverview": "<2 vivid paragraphs>",
  "keyHighlights": ["<highlight with number>","<highlight>","<highlight>","<highlight>","<highlight>"],
  "impactMetrics": [
    {"label":"Attendees","value":"500+","icon":"👥"},
    {"label":"Social Reach","value":"50K+","icon":"📱"},
    {"label":"Media Coverage","value":"12 outlets","icon":"📰"},
    {"label":"Engagement Rate","value":"8.4%","icon":"📈"}
  ],
  "brandNarrative": "<2 paragraphs on brand story and positioning>",
  "conclusion": "<1 forward-looking paragraph>",
  "selectedImageIds": ${JSON.stringify(selectedAssetIds)}
}`,
    2000
  );
  return { ...result, selectedImageIds: selectedAssetIds };
}

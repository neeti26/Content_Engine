import {
  EventBrief,
  MediaAsset,
  LinkedInContent,
  InstagramPostContent,
  InstagramStoryContent,
  TwitterContent,
  CaseStudyContent,
} from '@/types';
import { generateJSON, analyzeImageWithVision } from './openai';

// ─── LinkedIn ────────────────────────────────────────────────────────────────

export async function generateLinkedInContent(
  brief: EventBrief,
  selectedAsset: MediaAsset
): Promise<LinkedInContent> {
  const imageContext = await analyzeImageWithVision(
    selectedAsset.base64,
    selectedAsset.mimeType,
    'Describe what you see in this event photo in 2-3 sentences. Focus on the people, energy, setting, and any visible brand elements.'
  );

  const result = await generateJSON<LinkedInContent>(
    `You are a senior B2B marketing copywriter specializing in LinkedIn content for experiential marketing brands.
Write compelling, professional LinkedIn posts that drive engagement and showcase brand authority.
Always write in ${brief.tone} tone. Never start with "We" or "I".`,
    `Create a LinkedIn post for this event:

Event: ${brief.eventName}
Brand: ${brief.brandName}
Type: ${brief.eventType}
Location: ${brief.location}
Date: ${brief.date}
Key Highlights: ${brief.keyHighlights}
Target Audience: ${brief.targetAudience}
Image Description: ${imageContext}

Requirements:
- Headline: 1 punchy line (max 100 chars), no generic openers
- Body: 3-4 paragraphs, storytelling format, professional yet human, specific details
- End with a thought-provoking question or insight
- 6-8 relevant hashtags (mix of brand + industry + niche)
- Clear, specific call to action

Return JSON:
{
  "headline": "<headline>",
  "body": "<full post body with line breaks as \\n>",
  "hashtags": ["#tag1", "#tag2"],
  "callToAction": "<CTA text>",
  "selectedImageId": "${selectedAsset.id}",
  "characterCount": 0
}`
  );

  const charCount = ((result.headline ?? '') + (result.body ?? '')).length;
  return { ...result, selectedImageId: selectedAsset.id, characterCount: charCount };
}

// ─── Instagram Post ──────────────────────────────────────────────────────────

export async function generateInstagramPostContent(
  brief: EventBrief,
  selectedAsset: MediaAsset
): Promise<InstagramPostContent> {
  const imageContext = await analyzeImageWithVision(
    selectedAsset.base64,
    selectedAsset.mimeType,
    'Describe the vibe, energy, and visual elements of this event photo in 1-2 sentences. What emotion does it evoke?'
  );

  const result = await generateJSON<InstagramPostContent>(
    `You are a creative Instagram content strategist for a top experiential marketing agency.
You write captions that stop the scroll, drive saves, and build community.
Use emojis strategically. Write in ${brief.tone} tone.`,
    `Create an Instagram post caption for this event:

Event: ${brief.eventName}
Brand: ${brief.brandName}
Type: ${brief.eventType}
Key Highlights: ${brief.keyHighlights}
Image Vibe: ${imageContext}

Requirements:
- Opening hook: first line must stop the scroll (bold statement, question, or surprising fact)
- Caption: 150-220 words, conversational, energetic, specific
- Use 5-7 relevant emojis naturally within text (not just at end)
- 22-28 hashtags (mix: 5 mega, 8 mid, 10 niche, 5 brand-specific)
- End with a question to drive comments

Return JSON:
{
  "caption": "<full caption with emojis>",
  "hashtags": ["#tag1"],
  "emojis": ["🔥"],
  "selectedImageId": "${selectedAsset.id}",
  "characterCount": 0
}`
  );

  return { ...result, selectedImageId: selectedAsset.id, characterCount: result.caption?.length ?? 0 };
}

// ─── Instagram Story ─────────────────────────────────────────────────────────

export async function generateInstagramStoryContent(
  brief: EventBrief,
  selectedAsset: MediaAsset
): Promise<InstagramStoryContent> {
  const result = await generateJSON<InstagramStoryContent>(
    `You are a visual content designer for Instagram Stories. 
Text must be SHORT and HIGH IMPACT — stories are consumed in 3 seconds.
Think billboard, not paragraph.`,
    `Create Instagram Story text overlay for:

Event: ${brief.eventName}
Brand: ${brief.brandName}
Tone: ${brief.tone}
Key Highlights: ${brief.keyHighlights}

Requirements:
- Headline: MAX 4 words, ALL CAPS, punchy statement (e.g. "WE MADE HISTORY", "THIS CHANGED EVERYTHING")
- Subtext: MAX 8 words, supporting context
- CTA: MAX 3 words (e.g. "See More", "Watch Now", "Link in Bio")
- Overlay style: choose "dark", "light", or "gradient"

Return JSON:
{
  "headline": "<MAX 4 WORDS ALL CAPS>",
  "subtext": "<max 8 words>",
  "ctaText": "<max 3 words>",
  "selectedImageId": "${selectedAsset.id}",
  "overlayStyle": "gradient"
}`
  );

  return { ...result, selectedImageId: selectedAsset.id };
}

// ─── Twitter/X Thread ────────────────────────────────────────────────────────

export async function generateTwitterContent(
  brief: EventBrief,
  selectedAsset: MediaAsset
): Promise<TwitterContent> {
  const result = await generateJSON<TwitterContent>(
    `You are a viral Twitter/X content strategist. You write threads that get retweeted.
Each tweet must be punchy, standalone, and build on the previous one.
Use numbers, bold claims, and specific details. No fluff.`,
    `Create a 5-tweet Twitter/X thread for this event:

Event: ${brief.eventName}
Brand: ${brief.brandName}
Type: ${brief.eventType}
Key Highlights: ${brief.keyHighlights}
Tone: ${brief.tone}

Requirements:
- Tweet 1 (hook): Bold opening statement that makes people want to read more. End with "🧵"
- Tweet 2: The story / what happened
- Tweet 3: Key insight or surprising fact from the event
- Tweet 4: Impact / results / numbers
- Tweet 5 (CTA): Call to action, tag relevant people, relevant hashtags

Each tweet MAX 260 characters. Use line breaks for readability.

Return JSON:
{
  "threadHook": "<tweet 1 text>",
  "tweets": ["<tweet 1>", "<tweet 2>", "<tweet 3>", "<tweet 4>", "<tweet 5>"],
  "selectedImageId": "${selectedAsset.id}"
}`
  );

  return { ...result, selectedImageId: selectedAsset.id };
}

// ─── Case Study ──────────────────────────────────────────────────────────────

export async function generateCaseStudyContent(
  brief: EventBrief,
  selectedAssetIds: string[]
): Promise<CaseStudyContent> {
  const result = await generateJSON<CaseStudyContent>(
    `You are a senior marketing strategist writing professional case studies for an experiential marketing agency.
Case studies must be data-informed, narrative-driven, and showcase measurable impact.
Write in a professional, authoritative tone. Be specific — use numbers and concrete outcomes.`,
    `Write a comprehensive case study for:

Event: ${brief.eventName}
Brand: ${brief.brandName}
Event Type: ${brief.eventType}
Location: ${brief.location}
Date: ${brief.date}
Key Highlights: ${brief.keyHighlights}
Target Audience: ${brief.targetAudience}

Return JSON:
{
  "title": "<compelling case study title>",
  "executiveSummary": "<2-3 sentences, specific outcomes>",
  "eventOverview": "<2 paragraphs, vivid description>",
  "keyHighlights": ["<specific highlight 1>", "<specific highlight 2>", "<highlight 3>", "<highlight 4>", "<highlight 5>"],
  "impactMetrics": [
    {"label": "Attendees", "value": "500+", "icon": "users"},
    {"label": "Social Reach", "value": "50K+", "icon": "share"},
    {"label": "Media Coverage", "value": "12 outlets", "icon": "newspaper"},
    {"label": "Engagement Rate", "value": "8.4%", "icon": "trending-up"}
  ],
  "brandNarrative": "<2 paragraphs on brand story and positioning>",
  "conclusion": "<1 paragraph, forward-looking>",
  "selectedImageIds": ${JSON.stringify(selectedAssetIds)}
}`
  );

  return { ...result, selectedImageIds: selectedAssetIds };
}

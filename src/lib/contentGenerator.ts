import {
  EventBrief,
  MediaAsset,
  LinkedInContent,
  InstagramPostContent,
  InstagramStoryContent,
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
Always write in ${brief.tone} tone.`,
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
- Headline: 1 punchy line (max 100 chars)
- Body: 3-4 paragraphs, storytelling format, professional yet human
- Include specific details from the event highlights
- End with a thought-provoking question or insight
- 5-8 relevant hashtags
- Clear call to action

Return JSON:
{
  "headline": "<headline>",
  "body": "<full post body with line breaks as \\n>",
  "hashtags": ["#tag1", "#tag2", ...],
  "callToAction": "<CTA text>",
  "selectedImageId": "${selectedAsset.id}",
  "characterCount": <number>
}`
  );

  return {
    ...result,
    selectedImageId: selectedAsset.id,
    characterCount: (result.headline + result.body).length,
  };
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
- Opening hook: first line must stop the scroll (no "We" starts)
- Caption: 150-220 words, conversational, energetic
- Use 4-6 relevant emojis naturally within text
- 20-25 hashtags (mix of popular + niche)
- Include a question or CTA to drive comments

Return JSON:
{
  "caption": "<full caption with emojis>",
  "hashtags": ["#tag1", ...],
  "emojis": ["emoji1", ...],
  "selectedImageId": "${selectedAsset.id}",
  "characterCount": <number>
}`
  );

  return {
    ...result,
    selectedImageId: selectedAsset.id,
    characterCount: result.caption?.length ?? 0,
  };
}

// ─── Instagram Story ─────────────────────────────────────────────────────────

export async function generateInstagramStoryContent(
  brief: EventBrief,
  selectedAsset: MediaAsset
): Promise<InstagramStoryContent> {
  const result = await generateJSON<InstagramStoryContent>(
    `You are a visual content designer for Instagram Stories. 
You create bold, punchy text overlays that work on top of event photos.
Text must be SHORT and HIGH IMPACT — stories are consumed in 3 seconds.`,
    `Create Instagram Story text overlay for:

Event: ${brief.eventName}
Brand: ${brief.brandName}
Tone: ${brief.tone}
Key Highlights: ${brief.keyHighlights}

Requirements:
- Headline: MAX 5 words, all caps, bold statement
- Subtext: MAX 10 words, supporting context
- CTA: MAX 4 words (e.g., "Swipe Up", "Link in Bio", "Watch Now")
- Overlay style: "dark", "light", or "gradient" (choose based on typical event photo)

Return JSON:
{
  "headline": "<MAX 5 WORDS>",
  "subtext": "<max 10 words>",
  "ctaText": "<max 4 words>",
  "selectedImageId": "${selectedAsset.id}",
  "overlayStyle": "dark"
}`
  );

  return {
    ...result,
    selectedImageId: selectedAsset.id,
  };
}

// ─── Case Study ──────────────────────────────────────────────────────────────

export async function generateCaseStudyContent(
  brief: EventBrief,
  selectedAssetIds: string[]
): Promise<CaseStudyContent> {
  const result = await generateJSON<CaseStudyContent>(
    `You are a senior marketing strategist writing professional case studies for an experiential marketing agency.
Case studies must be data-informed, narrative-driven, and showcase measurable impact.
Write in a professional, authoritative tone.`,
    `Write a comprehensive case study for:

Event: ${brief.eventName}
Brand: ${brief.brandName}
Event Type: ${brief.eventType}
Location: ${brief.location}
Date: ${brief.date}
Key Highlights: ${brief.keyHighlights}
Target Audience: ${brief.targetAudience}

Create a full case study with:
- Title: compelling case study title
- Executive Summary: 2-3 sentences
- Event Overview: 2 paragraphs
- Key Highlights: 5-6 bullet points
- Impact Metrics: 4-5 measurable outcomes (estimate realistically based on event type)
- Brand Narrative: 2 paragraphs on brand story and positioning
- Conclusion: 1 paragraph

Return JSON:
{
  "title": "<case study title>",
  "executiveSummary": "<2-3 sentences>",
  "eventOverview": "<2 paragraphs>",
  "keyHighlights": ["<highlight 1>", "<highlight 2>", ...],
  "impactMetrics": [
    {"label": "Attendees", "value": "500+", "icon": "users"},
    {"label": "Social Reach", "value": "50K+", "icon": "share"},
    ...
  ],
  "brandNarrative": "<2 paragraphs>",
  "conclusion": "<1 paragraph>",
  "selectedImageIds": ${JSON.stringify(selectedAssetIds)}
}`
  );

  return {
    ...result,
    selectedImageIds: selectedAssetIds,
  };
}

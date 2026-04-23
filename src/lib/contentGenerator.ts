import {
  EventBrief, MediaAsset, LinkedInContent, InstagramPostContent,
  InstagramStoryContent, TwitterContent, CaseStudyContent,
} from '@/types';
import { generateJSON } from './gemini';

type AssetWithDesc = MediaAsset & { description?: string };

// ─── LinkedIn ────────────────────────────────────────────────────────────────
export async function generateLinkedInContent(brief: EventBrief, asset: AssetWithDesc): Promise<LinkedInContent> {
  const result = await generateJSON<LinkedInContent>(
    `You are a B2B LinkedIn copywriter. Tone: ${brief.tone}. Never start with "We", "I", "Our", or "Excited". Write a hook-first post with short paragraphs.`,
    `Write a LinkedIn post for this event:
Event: ${brief.eventName} by ${brief.brandName}
Type: ${brief.eventType}, Location: ${brief.location}
Highlights: ${brief.keyHighlights}
Audience: ${brief.targetAudience}
Photo context: ${asset.description ?? "event highlights"}

Return this JSON:
{
  "headline": "one punchy hook line under 100 chars",
  "body": "3 short paragraphs separated by newlines, ends with a question",
  "hashtags": ["#Marketing","#Events","#Brand","#Innovation","#Leadership","#EventMarketing","#BrandActivation"],
  "callToAction": "specific call to action",
  "selectedImageId": "${asset.id}",
  "characterCount": 0
}`,
    1500
  );
  return { ...result, selectedImageId: asset.id, characterCount: ((result.headline ?? '') + (result.body ?? '')).length };
}

// ─── Instagram Post ──────────────────────────────────────────────────────────
export async function generateInstagramPostContent(brief: EventBrief, asset: AssetWithDesc): Promise<InstagramPostContent> {
  const result = await generateJSON<InstagramPostContent>(
    `You are an Instagram content strategist. Write scroll-stopping captions. Tone: ${brief.tone}.`,
    `Write an Instagram caption for this event:
Event: ${brief.eventName} by ${brief.brandName}
Highlights: ${brief.keyHighlights}
Photo: ${asset.description ?? "energetic event moment"}

Return this JSON:
{
  "caption": "hook line that stops scroll, then 2 short paragraphs with emojis, ends with question — total 150 words",
  "hashtags": ["#Events","#Marketing","#Brand","#Innovation","#EventMarketing","#BrandActivation","#Networking","#Leadership","#Growth","#Business","#Community","#Inspiration","#Success","#TeamWork","#Conference","#Launch","#Celebration","#Milestone","#Together","#Future"],
  "emojis": ["🔥","✨","🎯","💡","🚀"],
  "selectedImageId": "${asset.id}",
  "characterCount": 0
}`,
    1200
  );
  return { ...result, selectedImageId: asset.id, characterCount: result.caption?.length ?? 0 };
}

// ─── Instagram Story ─────────────────────────────────────────────────────────
export async function generateInstagramStoryContent(brief: EventBrief, asset: AssetWithDesc): Promise<InstagramStoryContent> {
  const result = await generateJSON<InstagramStoryContent>(
    `You design Instagram Story text overlays. Keep it SHORT and BOLD. Think billboard.`,
    `Create a Story overlay for: ${brief.eventName} by ${brief.brandName}. Tone: ${brief.tone}.
Highlight: ${brief.keyHighlights.split(',')[0]?.trim() ?? brief.keyHighlights}

Return this JSON:
{
  "headline": "3 TO 4 WORDS ALL CAPS",
  "subtext": "6 to 8 words of context",
  "ctaText": "2 to 3 words",
  "selectedImageId": "${asset.id}",
  "overlayStyle": "gradient"
}`,
    300
  );
  return { ...result, selectedImageId: asset.id };
}

// ─── Twitter/X Thread ────────────────────────────────────────────────────────
export async function generateTwitterContent(brief: EventBrief, asset: AssetWithDesc): Promise<TwitterContent> {
  const result = await generateJSON<TwitterContent>(
    `You write viral Twitter/X threads. Each tweet max 260 chars. Structure: hook, story, insight, proof, CTA.`,
    `Write a 5-tweet thread for: ${brief.eventName} by ${brief.brandName}
Highlights: ${brief.keyHighlights}. Tone: ${brief.tone}

Return this JSON:
{
  "threadHook": "bold hook tweet ending with thread emoji",
  "tweets": [
    "tweet 1: bold hook with thread emoji",
    "tweet 2: what happened, the story",
    "tweet 3: key insight or surprising fact",
    "tweet 4: impact and numbers",
    "tweet 5: call to action with hashtags"
  ],
  "selectedImageId": "${asset.id}"
}`,
    800
  );
  return { ...result, selectedImageId: asset.id };
}

// ─── Case Study ──────────────────────────────────────────────────────────────
export async function generateCaseStudyContent(brief: EventBrief, selectedAssetIds: string[]): Promise<CaseStudyContent> {
  const result = await generateJSON<CaseStudyContent>(
    `You write marketing case studies. Be specific with numbers. Structure: challenge, execution, results.`,
    `Write a case study for: ${brief.eventName} by ${brief.brandName}
Type: ${brief.eventType}, Location: ${brief.location}, Date: ${brief.date}
Highlights: ${brief.keyHighlights}
Audience: ${brief.targetAudience}

Return this JSON:
{
  "title": "compelling case study title",
  "executiveSummary": "2 sentences with specific outcomes and numbers",
  "eventOverview": "paragraph 1 about context and objectives. paragraph 2 about execution.",
  "keyHighlights": ["highlight with number","highlight","highlight","highlight","highlight"],
  "impactMetrics": [
    {"label":"Attendees","value":"500+","icon":"👥"},
    {"label":"Social Reach","value":"50K+","icon":"📱"},
    {"label":"Media Coverage","value":"12 outlets","icon":"📰"},
    {"label":"Satisfaction","value":"94%","icon":"⭐"}
  ],
  "brandNarrative": "paragraph 1 about brand positioning. paragraph 2 about market impact.",
  "conclusion": "forward-looking paragraph about next steps",
  "selectedImageIds": ${JSON.stringify(selectedAssetIds)}
}`,
    2000
  );
  return { ...result, selectedImageIds: selectedAssetIds };
}

// ─── WhatsApp Status ─────────────────────────────────────────────────────────
export async function generateWhatsAppContent(brief: EventBrief, asset: AssetWithDesc): Promise<import('@/types').WhatsAppContent> {
  const result = await generateJSON<import('@/types').WhatsAppContent>(
    `You write WhatsApp Status updates. Short, punchy, personal. Max 700 chars. No hashtags. Conversational.`,
    `Write a WhatsApp Status update for: ${brief.eventName} by ${brief.brandName}
Highlights: ${brief.keyHighlights}. Tone: ${brief.tone}

Return this JSON:
{
  "statusText": "short punchy status under 100 chars — e.g. Just wrapped TechSummit 2025. Mind = blown. 🔥",
  "caption": "personal message to share with contacts, 2-3 sentences, conversational, no hashtags, max 500 chars",
  "selectedImageId": "${asset.id}"
}`,
    400
  );
  return { ...result, selectedImageId: asset.id };
}

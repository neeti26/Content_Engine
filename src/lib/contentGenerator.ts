import {
  EventBrief, MediaAsset, LinkedInContent, InstagramPostContent,
  InstagramReelContent, TwitterContent,
  CaseStudyContent, WhatsAppContent,
} from '@/types';
import { generateJSON } from './gemini';

type AssetWithDesc = MediaAsset & { description?: string };

// ─── LinkedIn ────────────────────────────────────────────────────────────────
export async function generateLinkedInContent(brief: EventBrief, asset: AssetWithDesc): Promise<LinkedInContent> {
  const result = await generateJSON<LinkedInContent>(
    `You are a senior B2B LinkedIn content strategist. Tone: ${brief.tone}.
RULES:
- Never open with "We", "I", "Our", "Excited", or "Thrilled"
- Open with a bold hook: a surprising stat, a provocative question, or a one-line story
- Write in short paragraphs (2-3 sentences max each), separated by blank lines
- Include at least ONE specific number, metric, or concrete detail from the highlights
- The body must be 200-280 words — substantial enough to drive real engagement
- End with an open-ended question that invites comments
- Hashtags: mix of 3 broad + 4 specific to the event/industry`,
    `Write a full LinkedIn post for this event:

Event: ${brief.eventName}
Brand: ${brief.brandName}
Type: ${brief.eventType}
Location: ${brief.location}
Date: ${brief.date}
Key Highlights: ${brief.keyHighlights}
Target Audience: ${brief.targetAudience}
Visual: ${asset.description ?? 'event highlights photo'}

Return ONLY this JSON:
{
  "headline": "Hook line — one sentence, under 120 chars, stops the scroll",
  "body": "Full post body — 200 to 280 words across 4-5 short paragraphs. Include specific details from the highlights. First paragraph sets the scene. Second paragraph shares the key insight or moment. Third paragraph zooms into impact or numbers. Fourth paragraph connects it to a bigger trend or lesson. Final line is a genuine open question to the audience.",
  "hashtags": ["#EventMarketing","#BrandActivation","#Marketing","#Leadership","#Innovation","#Networking","#Growth"],
  "callToAction": "specific, action-oriented CTA (e.g. 'Drop your biggest takeaway below 👇')",
  "selectedImageId": "${asset.id}",
  "characterCount": 0
}`,
    2000
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
export async function generateWhatsAppContent(brief: EventBrief, asset: AssetWithDesc): Promise<WhatsAppContent> {
  const result = await generateJSON<WhatsAppContent>(
    `You write WhatsApp Status updates. Short, punchy, personal. Max 700 chars. No hashtags. Conversational.`,
    `Write a WhatsApp Status update for: ${brief.eventName} by ${brief.brandName}
Highlights: ${brief.keyHighlights}. Tone: ${brief.tone}

Return this JSON:
{
  "statusText": "short punchy status under 100 chars — e.g. Just wrapped TechSummit 2026. Mind = blown. 🔥",
  "caption": "personal message to share with contacts, 2-3 sentences, conversational, no hashtags, max 500 chars",
  "selectedImageId": "${asset.id}"
}`,
    400
  );
  return { ...result, selectedImageId: asset.id };
}

// ─── Instagram Reel ──────────────────────────────────────────────────────────
export async function generateInstagramReelContent(brief: EventBrief, asset: AssetWithDesc): Promise<InstagramReelContent> {
  const result = await generateJSON<InstagramReelContent>(
    `You are a world-class Instagram Reel director. You create viral, emotionally engaging 30-second Reels for brand events. Tone: ${brief.tone}.`,
    `Create a production-ready 30-second Instagram Reel script for this event.

EVENT DETAILS:
- Name: ${brief.eventName}
- Brand: ${brief.brandName}
- Type: ${brief.eventType}
- Location: ${brief.location}
- Date: ${brief.date}
- Highlights: ${brief.keyHighlights}
- Target Audience: ${brief.targetAudience}
- Visual available: ${asset.description ?? 'event photos and video clips'}

INSTRUCTIONS:
- Hook (shot 1): 3 seconds, ALL CAPS, scroll-stopping
- Each shot description: exact clip/photo type to use
- On-screen text: max 6 words, bold, high energy
- Voiceover: match timing to each shot precisely
- Music mood: specific style matching brand tone
- Caption: personal, ends with question to drive comments

Return ONLY this JSON:
{
  "hook": "ALL CAPS scroll-stopping text, max 8 words",
  "duration": "30s",
  "shotList": [
    {"shot": 1, "duration": "0-3s",  "description": "Dramatic reveal — hero image or opening clip, full frame", "onScreenText": "HOOK TEXT"},
    {"shot": 2, "duration": "3-8s",  "description": "Crowd/attendee energy — faces, reactions, excitement", "onScreenText": "Punchy text"},
    {"shot": 3, "duration": "8-14s", "description": "Key moment — keynote, demo, or standout visual", "onScreenText": "Key stat"},
    {"shot": 4, "duration": "14-20s","description": "Behind scenes — authentic, candid, human moments", "onScreenText": "Brand voice"},
    {"shot": 5, "duration": "20-26s","description": "Brand showcase — logo, stage, banners", "onScreenText": "Brand tagline"},
    {"shot": 6, "duration": "26-30s","description": "Epic closing — best group photo or wide shot", "onScreenText": "Follow us"}
  ],
  "voiceoverScript": "Punchy 30-second voiceover matched to each shot. Short sentences. Builds to climax. Ends with CTA.",
  "musicMood": "Specific music style matching brand tone",
  "caption": "Hook emoji + 2 punchy sentences about actual highlights + question. Max 80 words.",
  "hashtags": ["#Reels","#${brief.brandName.replace(/\s+/g, '')}","#${brief.eventName.replace(/\s+/g, '')}","#EventMarketing","#BehindTheScenes","#Marketing","#Brand","#Innovation","#Leadership","#Growth","#Viral","#ContentCreator","#BusinessEvents","#Networking","#${brief.eventType.replace(/\s+/g, '')}"],
  "selectedImageId": "${asset.id}"
}`,
    2000
  );
  return { ...result, selectedImageId: asset.id };
}

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
  const toneGuide = {
    professional: 'authoritative, data-driven, thought leadership. Use industry terminology. No exclamation marks.',
    energetic: 'high-energy, action-oriented, punchy sentences. Short paragraphs. Momentum-building.',
    inspirational: 'story-first, emotionally resonant, aspirational. Paint a picture before making a point.',
    casual: 'conversational, warm, like a smart colleague sharing a win. Contractions OK.',
  }[brief.tone];

  const result = await generateJSON<LinkedInContent>(
    `You are a senior B2B content strategist who has written viral LinkedIn posts for Fortune 500 CMOs and experiential marketing agencies. You understand that LinkedIn rewards specificity, storytelling, and genuine insight — not corporate speak.

Tone guide: ${toneGuide}

Rules:
- NEVER start with "We", "I", "Our", "Excited to", "Thrilled to", "Proud to"
- First line must be a standalone hook that works without context
- Use white space aggressively — short paragraphs, line breaks
- Include ONE specific number or data point from the highlights
- End with a genuine question that invites professional debate, not just "thoughts?"`,

    `Event: ${brief.eventName}
Brand: ${brief.brandName}
Type: ${brief.eventType}
Location: ${brief.location}
Date: ${brief.date}
Key Highlights: ${brief.keyHighlights}
Target Audience: ${brief.targetAudience}
Photo context: ${asset.description ?? 'event highlights and key moments'}

Write a LinkedIn post that a senior marketing professional would genuinely want to share. Return JSON:
{
  "headline": "<standalone hook, max 100 chars, no generic openers>",
  "body": "<3-4 short paragraphs with \\n\\n between them. Specific. Human. Ends with a real question.>",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8"],
  "callToAction": "<specific, non-generic CTA that fits the post naturally>",
  "selectedImageId": "${asset.id}",
  "characterCount": 0
}`
  );
  return { ...result, selectedImageId: asset.id, characterCount: ((result.headline ?? '') + (result.body ?? '')).length };
}

// ─── Instagram Post ──────────────────────────────────────────────────────────

export async function generateInstagramPostContent(
  brief: EventBrief,
  asset: AssetWithDesc
): Promise<InstagramPostContent> {
  const result = await generateJSON<InstagramPostContent>(
    `You are a top-tier Instagram content strategist for experiential marketing brands. You've grown accounts from 10K to 500K. You know that the first line is everything — it's what shows before "more". You write captions that get saved, shared, and commented on.

Rules:
- First line: bold statement, surprising fact, or provocative question. MAX 8 words. No hashtags in first line.
- Body: conversational, specific, uses "you" to speak directly to the reader
- Emojis: woven naturally into text, not dumped at the end
- End with a question that's easy to answer (drives comments)
- Hashtags: mix of mega (1M+), mid (100K-1M), niche (10K-100K), and brand-specific`,

    `Event: ${brief.eventName} by ${brief.brandName}
Type: ${brief.eventType}
Highlights: ${brief.keyHighlights}
Photo vibe: ${asset.description ?? 'energetic event moment'}
Tone: ${brief.tone}

Return JSON:
{
  "caption": "<first line hook\\n\\nbody paragraph 1\\n\\nbody paragraph 2\\n\\nclosing question>",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10","#tag11","#tag12","#tag13","#tag14","#tag15","#tag16","#tag17","#tag18","#tag19","#tag20","#tag21","#tag22","#tag23","#tag24","#tag25","#tag26","#tag27","#tag28","#tag29","#tag30"],
  "emojis": ["🔥","✨","🎯","💡","🚀"],
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
    `You design Instagram Story text overlays for major brand events. Stories are consumed in 3 seconds. Every word must earn its place. Think outdoor billboard, not email newsletter.`,

    `Event: ${brief.eventName} by ${brief.brandName}
Tone: ${brief.tone}
Key moment: ${brief.keyHighlights.split(',')[0]?.trim() ?? brief.keyHighlights}

Design a Story overlay. Return JSON:
{
  "headline": "<3-4 WORDS ALL CAPS — punchy, bold, memorable. Examples: WE MADE HISTORY / THIS CHANGED EVERYTHING / THE FUTURE IS NOW>",
  "subtext": "<6-8 words of supporting context — specific, not generic>",
  "ctaText": "<2-3 words — action-oriented. Examples: Watch Now / See More / Full Story>",
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
    `You write viral Twitter/X threads for marketing events. Your threads get 1000+ retweets because they deliver real value, not just hype. You understand thread structure: hook → story → insight → proof → CTA.

Rules:
- Tweet 1: Hook that makes people NEED to read more. Specific number or bold claim. End with 🧵
- Tweet 2: Set the scene. What happened. Make it vivid.
- Tweet 3: The insight. What does this MEAN? Why should anyone care?
- Tweet 4: The proof. Numbers, reactions, outcomes.
- Tweet 5: The takeaway + CTA. What should readers do with this?
- Each tweet: max 260 chars. Use line breaks for readability. No filler.`,

    `Event: ${brief.eventName} by ${brief.brandName} (${brief.eventType})
Highlights: ${brief.keyHighlights}
Tone: ${brief.tone}

Return JSON:
{
  "threadHook": "<tweet 1 text>",
  "tweets": ["<tweet 1>","<tweet 2>","<tweet 3>","<tweet 4>","<tweet 5>"],
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
    `You are a senior marketing strategist at a top experiential marketing agency. You write case studies that win new business. Your case studies are specific, credible, and tell a clear story of challenge → execution → results.

Rules:
- Every claim needs a number or specific detail
- Executive summary: what was the challenge, what was done, what was the result — in 2 sentences
- Avoid vague words: "amazing", "incredible", "successful" — replace with specifics
- Impact metrics: realistic estimates based on event type and scale described
- Brand narrative: position the brand as a category leader, not just an event organizer`,

    `Event: ${brief.eventName} by ${brief.brandName}
Type: ${brief.eventType}, Location: ${brief.location}, Date: ${brief.date}
Highlights: ${brief.keyHighlights}
Audience: ${brief.targetAudience}

Return JSON:
{
  "title": "<case study title that a CMO would click on>",
  "executiveSummary": "<challenge + execution + result in 2 specific sentences>",
  "eventOverview": "<paragraph 1: context and objectives>\\n\\n<paragraph 2: execution and experience>",
  "keyHighlights": ["<specific highlight with number>","<highlight>","<highlight>","<highlight>","<highlight>","<highlight>"],
  "impactMetrics": [
    {"label":"Attendees","value":"<realistic number>","icon":"👥"},
    {"label":"Social Impressions","value":"<realistic number>","icon":"📱"},
    {"label":"Media Coverage","value":"<realistic number>","icon":"📰"},
    {"label":"NPS Score","value":"<realistic score>","icon":"⭐"},
    {"label":"Partnerships Formed","value":"<realistic number>","icon":"🤝"}
  ],
  "brandNarrative": "<paragraph 1: brand positioning>\\n\\n<paragraph 2: market impact>",
  "conclusion": "<forward-looking paragraph with specific next steps or goals>",
  "selectedImageIds": ${JSON.stringify(selectedAssetIds)}
}`,
    2000
  );
  return { ...result, selectedImageIds: selectedAssetIds };
}

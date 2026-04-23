import {
  EventBrief, MediaAsset, LinkedInContent, InstagramPostContent,
  InstagramStoryContent, TwitterContent, CaseStudyContent,
} from '@/types';
import { generateJSON } from './gemini';

type AssetWithDesc = MediaAsset & { description?: string };

export async function generateLinkedInContent(brief: EventBrief, asset: AssetWithDesc): Promise<LinkedInContent> {
  const result = await generateJSON<LinkedInContent>(
    `Expert B2B LinkedIn copywriter for experiential marketing. Tone: ${brief.tone}. Rules: never start with We/I/Our/Excited. Hook first. Short paragraphs. One specific number. End with debate question.`,
    `Event: ${brief.eventName} by ${brief.brandName} (${brief.eventType}, ${brief.location}, ${brief.date})
Highlights: ${brief.keyHighlights}
Audience: ${brief.targetAudience}
Photo: ${asset.description ?? 'event highlights'}
Return JSON: {"headline":"<hook max 100 chars>","body":"<3-4 short paragraphs with \\n\\n, specific details, ends with question>","hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8"],"callToAction":"<specific CTA>","selectedImageId":"${asset.id}","characterCount":0}`,
    900
  );
  return { ...result, selectedImageId: asset.id, characterCount: ((result.headline??'')+(result.body??'')).length };
}

export async function generateInstagramPostContent(brief: EventBrief, asset: AssetWithDesc): Promise<InstagramPostContent> {
  const result = await generateJSON<InstagramPostContent>(
    `Top Instagram content strategist. Hook-first. Emojis woven in naturally. Speaks to reader with "you". Tone: ${brief.tone}.`,
    `Event: ${brief.eventName} by ${brief.brandName}
Highlights: ${brief.keyHighlights}
Photo vibe: ${asset.description ?? 'energetic event moment'}
Return JSON: {"caption":"<hook line\\n\\nparagraph 1\\n\\nparagraph 2\\n\\nclosing question — 150-200 words total with 5-6 emojis>","hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10","#tag11","#tag12","#tag13","#tag14","#tag15","#tag16","#tag17","#tag18","#tag19","#tag20","#tag21","#tag22","#tag23","#tag24","#tag25","#tag26","#tag27","#tag28","#tag29","#tag30"],"emojis":["🔥","✨","🎯","💡","🚀"],"selectedImageId":"${asset.id}","characterCount":0}`,
    900
  );
  return { ...result, selectedImageId: asset.id, characterCount: result.caption?.length ?? 0 };
}

export async function generateInstagramStoryContent(brief: EventBrief, asset: AssetWithDesc): Promise<InstagramStoryContent> {
  const result = await generateJSON<InstagramStoryContent>(
    'Instagram Story designer. Billboard thinking. 3 seconds. Every word earns its place.',
    `Event: ${brief.eventName} by ${brief.brandName}. Tone: ${brief.tone}. Highlight: ${brief.keyHighlights.split(',')[0]?.trim()}
Return JSON: {"headline":"<3-4 WORDS ALL CAPS e.g. WE MADE HISTORY>","subtext":"<6-8 words specific context>","ctaText":"<2-3 words action>","selectedImageId":"${asset.id}","overlayStyle":"gradient"}`,
    150
  );
  return { ...result, selectedImageId: asset.id };
}

export async function generateTwitterContent(brief: EventBrief, asset: AssetWithDesc): Promise<TwitterContent> {
  const result = await generateJSON<TwitterContent>(
    'Viral Twitter/X thread writer. Structure: hook→scene→insight→proof→CTA. Real value, not hype. Max 260 chars per tweet.',
    `Event: ${brief.eventName} by ${brief.brandName} (${brief.eventType})
Highlights: ${brief.keyHighlights}. Tone: ${brief.tone}
Return JSON: {"threadHook":"<tweet 1>","tweets":["<hook+🧵>","<scene>","<insight>","<proof+numbers>","<CTA+hashtags>"],"selectedImageId":"${asset.id}"}`,
    700
  );
  return { ...result, selectedImageId: asset.id };
}

export async function generateCaseStudyContent(brief: EventBrief, selectedAssetIds: string[]): Promise<CaseStudyContent> {
  const result = await generateJSON<CaseStudyContent>(
    'Senior marketing strategist. Case studies that win business. Challenge→execution→results. Every claim has a number.',
    `Event: ${brief.eventName} by ${brief.brandName} (${brief.eventType}, ${brief.location}, ${brief.date})
Highlights: ${brief.keyHighlights}. Audience: ${brief.targetAudience}
Return JSON: {"title":"<CMO-worthy title>","executiveSummary":"<challenge+execution+result in 2 specific sentences>","eventOverview":"<para1>\\n\\n<para2>","keyHighlights":["<with number>","<highlight>","<highlight>","<highlight>","<highlight>","<highlight>"],"impactMetrics":[{"label":"Attendees","value":"<realistic>","icon":"👥"},{"label":"Social Reach","value":"<realistic>","icon":"📱"},{"label":"Media Coverage","value":"<realistic>","icon":"📰"},{"label":"NPS Score","value":"<realistic>","icon":"⭐"},{"label":"Partnerships","value":"<realistic>","icon":"🤝"}],"brandNarrative":"<para1>\\n\\n<para2>","conclusion":"<forward-looking>","selectedImageIds":${JSON.stringify(selectedAssetIds)}}`,
    1500
  );
  return { ...result, selectedImageIds: selectedAssetIds };
}

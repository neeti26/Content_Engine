import { EventBrief, MediaAsset, GeneratedContent } from '@/types';
import { scoreAllAssets, selectBestAssets } from './assetScorer';
import {
  generateLinkedInContent, generateInstagramPostContent,
  generateInstagramStoryContent, generateTwitterContent,
  generateCaseStudyContent, generateWhatsAppContent,
} from './contentGenerator';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runPipeline(
  brief: EventBrief,
  assets: MediaAsset[],
  apiKey?: string
): Promise<GeneratedContent> {
  const ctx = `${brief.eventName} by ${brief.brandName} — ${brief.eventType} in ${brief.location}. ${brief.keyHighlights}`;

  // Step 1: Score all images (batched, rate-limit safe)
  const scoredAssets = await scoreAllAssets(assets, ctx, apiKey);

  // Step 2: Select best asset per platform
  const selection = await selectBestAssets(scoredAssets, ctx, apiKey);

  const find = (id: string) => scoredAssets.find((a) => a.id === id) ?? scoredAssets[0];

  const twitterId  = selection.twitter  ?? selection.instagramPost;
  const whatsappId = selection.whatsapp ?? selection.instagramPost;

  // Step 3: Generate content sequentially (rate limit safe)
  const linkedin       = await generateLinkedInContent(brief, find(selection.linkedin), apiKey);
  await sleep(1000);
  const instagramPost  = await generateInstagramPostContent(brief, find(selection.instagramPost), apiKey);
  await sleep(1000);
  const instagramStory = await generateInstagramStoryContent(brief, find(selection.instagramStory), apiKey);
  await sleep(1000);
  const twitter        = await generateTwitterContent(brief, find(twitterId), apiKey);
  await sleep(1000);
  const whatsapp       = await generateWhatsAppContent(brief, find(whatsappId), apiKey);
  await sleep(1000);
  const caseStudy      = await generateCaseStudyContent(brief, selection.caseStudy, apiKey);

  return {
    linkedin, instagramPost, instagramStory, twitter, whatsapp, caseStudy,
    selectedAssets: {
      linkedin:      selection.linkedin,
      instagramPost: selection.instagramPost,
      instagramStory:selection.instagramStory,
      twitter:       twitterId,
      whatsapp:      whatsappId,
      caseStudy:     selection.caseStudy,
      selectionRationale: selection.rationale,
    },
    processingLog: [],
  };
}

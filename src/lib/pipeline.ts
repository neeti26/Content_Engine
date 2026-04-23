import { EventBrief, MediaAsset, GeneratedContent } from '@/types';
import { scoreAllAssets, selectBestAssets } from './assetScorer';
import {
  generateLinkedInContent, generateInstagramPostContent,
  generateInstagramStoryContent, generateTwitterContent, generateCaseStudyContent,
} from './contentGenerator';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runPipeline(
  brief: EventBrief,
  assets: MediaAsset[]
): Promise<GeneratedContent> {
  const ctx = `${brief.eventName} by ${brief.brandName} — ${brief.eventType} in ${brief.location}. ${brief.keyHighlights}`;

  // Step 1: Score all images (batched to respect rate limits)
  const scoredAssets = await scoreAllAssets(assets, ctx);

  // Step 2: Select best asset per platform
  const selection = await selectBestAssets(scoredAssets, ctx);

  const find = (id: string) => scoredAssets.find((a) => a.id === id) ?? scoredAssets[0];
  const twitterId = selection.twitter ?? selection.instagramPost;

  // Step 3: Generate content SEQUENTIALLY to avoid rate limits
  // Each call has a small gap between them
  const linkedin = await generateLinkedInContent(brief, find(selection.linkedin));
  await sleep(1000);

  const instagramPost = await generateInstagramPostContent(brief, find(selection.instagramPost));
  await sleep(1000);

  const instagramStory = await generateInstagramStoryContent(brief, find(selection.instagramStory));
  await sleep(1000);

  const twitter = await generateTwitterContent(brief, find(twitterId));
  await sleep(1000);

  const caseStudy = await generateCaseStudyContent(brief, selection.caseStudy);

  return {
    linkedin, instagramPost, instagramStory, twitter, caseStudy,
    selectedAssets: {
      linkedin: selection.linkedin,
      instagramPost: selection.instagramPost,
      instagramStory: selection.instagramStory,
      twitter: twitterId,
      caseStudy: selection.caseStudy,
      selectionRationale: selection.rationale,
    },
    processingLog: [],
  };
}

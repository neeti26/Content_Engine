import { EventBrief, MediaAsset, GeneratedContent } from '@/types';
import { scoreAllAssets, selectBestAssets } from './assetScorer';
import {
  generateLinkedInContent, generateInstagramPostContent,
  generateInstagramStoryContent, generateTwitterContent, generateCaseStudyContent,
} from './contentGenerator';

export async function runPipeline(
  brief: EventBrief,
  assets: MediaAsset[]
): Promise<GeneratedContent> {
  const ctx = `${brief.eventName} by ${brief.brandName} — ${brief.eventType} in ${brief.location}. ${brief.keyHighlights}`;

  // Step 1: Score all images in parallel (Gemini Flash Vision)
  const scoredAssets = await scoreAllAssets(assets, ctx);

  // Step 2: Select best per platform
  const selection = await selectBestAssets(scoredAssets, ctx);

  const find = (id: string) => scoredAssets.find((a) => a.id === id) ?? scoredAssets[0];
  const twitterId = selection.twitter ?? selection.instagramPost;

  // Step 3: Generate all 5 outputs in parallel (Gemini Flash text)
  const [linkedin, instagramPost, instagramStory, twitter, caseStudy] = await Promise.all([
    generateLinkedInContent(brief, find(selection.linkedin)),
    generateInstagramPostContent(brief, find(selection.instagramPost)),
    generateInstagramStoryContent(brief, find(selection.instagramStory)),
    generateTwitterContent(brief, find(twitterId)),
    generateCaseStudyContent(brief, selection.caseStudy),
  ]);

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

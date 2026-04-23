import { EventBrief, MediaAsset, GeneratedContent } from '@/types';
import { scoreAllAssets, selectBestAssets } from './assetScorer';
import {
  generateLinkedInContent,
  generateInstagramPostContent,
  generateInstagramStoryContent,
  generateTwitterContent,
  generateCaseStudyContent,
} from './contentGenerator';
import { updateJob, addStep } from './jobStore';

export async function runPipeline(
  jobId: string,
  brief: EventBrief,
  assets: MediaAsset[]
): Promise<GeneratedContent> {
  const ctx = `${brief.eventName} by ${brief.brandName} — ${brief.eventType} in ${brief.location}. ${brief.keyHighlights}`;

  // ── STEP 1: Score ALL assets in PARALLEL ─────────────────────────────────
  addStep(jobId, 'Scoring all photos simultaneously', 'processing');
  updateJob(jobId, { status: 'processing', progress: 5 });

  const scoredAssets = await scoreAllAssets(assets, ctx);

  addStep(jobId, 'Scoring all photos simultaneously', 'done', `${scoredAssets.length} assets scored`);
  updateJob(jobId, { progress: 35 });

  // ── STEP 2: Select best asset per platform ────────────────────────────────
  addStep(jobId, 'Selecting best asset per platform', 'processing');

  const selection = await selectBestAssets(scoredAssets, ctx);

  addStep(jobId, 'Selecting best asset per platform', 'done');
  updateJob(jobId, { progress: 45 });

  const find = (id: string) => scoredAssets.find((a) => a.id === id) ?? scoredAssets[0];

  // ── STEP 3: Generate ALL content in PARALLEL ──────────────────────────────
  addStep(jobId, 'Generating all platform content in parallel', 'processing');
  updateJob(jobId, { progress: 50 });

  const twitterAssetId = selection.twitter ?? selection.instagramPost;

  const [linkedin, instagramPost, instagramStory, twitter, caseStudy] = await Promise.all([
    generateLinkedInContent(brief, find(selection.linkedin)),
    generateInstagramPostContent(brief, find(selection.instagramPost)),
    generateInstagramStoryContent(brief, find(selection.instagramStory)),
    generateTwitterContent(brief, find(twitterAssetId)),
    generateCaseStudyContent(brief, selection.caseStudy),
  ]);

  addStep(jobId, 'Generating all platform content in parallel', 'done', '5 outputs ready');
  updateJob(jobId, { progress: 98 });

  const result: GeneratedContent = {
    linkedin,
    instagramPost,
    instagramStory,
    twitter,
    caseStudy,
    selectedAssets: {
      linkedin: selection.linkedin,
      instagramPost: selection.instagramPost,
      instagramStory: selection.instagramStory,
      twitter: twitterAssetId,
      caseStudy: selection.caseStudy,
      selectionRationale: selection.rationale,
    },
    processingLog: [],
  };

  updateJob(jobId, { status: 'done', progress: 100, result });
  return result;
}

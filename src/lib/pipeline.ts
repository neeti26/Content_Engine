import { EventBrief, MediaAsset, GeneratedContent } from '@/types';
import { scoreAsset, selectBestAssets } from './assetScorer';
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
  const eventContext = `${brief.eventName} by ${brief.brandName} — ${brief.eventType} in ${brief.location} on ${brief.date}. ${brief.keyHighlights}`;

  // ── Step 1: Score all assets ──────────────────────────────────────────────
  addStep(jobId, 'Scoring media assets with AI Vision', 'processing');
  updateJob(jobId, { status: 'processing', progress: 5 });

  const scoredAssets: MediaAsset[] = [];
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    try {
      const score = await scoreAsset(asset, eventContext);
      scoredAssets.push({ ...asset, score });
    } catch {
      scoredAssets.push({ ...asset });
    }
    updateJob(jobId, { progress: 5 + Math.floor((i / assets.length) * 20) });
  }

  addStep(jobId, 'Scoring media assets with AI Vision', 'done', `${scoredAssets.length} assets scored`);

  // ── Step 2: Select best assets ────────────────────────────────────────────
  addStep(jobId, 'Selecting best assets per platform', 'processing');
  updateJob(jobId, { progress: 28 });

  const selection = await selectBestAssets(scoredAssets, eventContext);

  addStep(jobId, 'Selecting best assets per platform', 'done', 'Selection rationale documented');
  updateJob(jobId, { progress: 35 });

  const findAsset = (id: string): MediaAsset =>
    scoredAssets.find((a) => a.id === id) ?? scoredAssets[0];

  // ── Step 3: LinkedIn ──────────────────────────────────────────────────────
  addStep(jobId, 'Generating LinkedIn post', 'processing');
  updateJob(jobId, { progress: 40 });
  const linkedin = await generateLinkedInContent(brief, findAsset(selection.linkedin));
  addStep(jobId, 'Generating LinkedIn post', 'done');
  updateJob(jobId, { progress: 52 });

  // ── Step 4: Instagram Post ────────────────────────────────────────────────
  addStep(jobId, 'Generating Instagram post', 'processing');
  const instagramPost = await generateInstagramPostContent(brief, findAsset(selection.instagramPost));
  addStep(jobId, 'Generating Instagram post', 'done');
  updateJob(jobId, { progress: 63 });

  // ── Step 5: Instagram Story ───────────────────────────────────────────────
  addStep(jobId, 'Generating Instagram story overlay', 'processing');
  const instagramStory = await generateInstagramStoryContent(brief, findAsset(selection.instagramStory));
  addStep(jobId, 'Generating Instagram story overlay', 'done');
  updateJob(jobId, { progress: 72 });

  // ── Step 6: Twitter/X Thread ──────────────────────────────────────────────
  addStep(jobId, 'Generating Twitter/X thread', 'processing');
  const twitterAssetId = selection.twitter ?? selection.instagramPost;
  const twitter = await generateTwitterContent(brief, findAsset(twitterAssetId));
  addStep(jobId, 'Generating Twitter/X thread', 'done');
  updateJob(jobId, { progress: 82 });

  // ── Step 7: Case Study ────────────────────────────────────────────────────
  addStep(jobId, 'Generating case study draft', 'processing');
  const caseStudy = await generateCaseStudyContent(brief, selection.caseStudy);
  addStep(jobId, 'Generating case study draft', 'done');
  updateJob(jobId, { progress: 96 });

  // ── Step 8: Finalize ──────────────────────────────────────────────────────
  addStep(jobId, 'Packaging all outputs', 'processing');

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

  addStep(jobId, 'Packaging all outputs', 'done');
  updateJob(jobId, { status: 'done', progress: 100, result });

  return result;
}

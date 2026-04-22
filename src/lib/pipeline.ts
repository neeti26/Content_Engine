import { EventBrief, MediaAsset, GeneratedContent } from '@/types';
import { scoreAsset, selectBestAssets } from './assetScorer';
import {
  generateLinkedInContent,
  generateInstagramPostContent,
  generateInstagramStoryContent,
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
  addStep(jobId, 'Scoring media assets', 'processing');
  updateJob(jobId, { status: 'processing', progress: 10 });

  const scoredAssets: MediaAsset[] = [];
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    try {
      const score = await scoreAsset(asset, eventContext);
      scoredAssets.push({ ...asset, score });
    } catch {
      scoredAssets.push({ ...asset });
    }
    updateJob(jobId, {
      progress: 10 + Math.floor((i / assets.length) * 20),
    });
  }

  addStep(jobId, 'Scoring media assets', 'done', `Scored ${scoredAssets.length} assets`);

  // ── Step 2: Select best assets ────────────────────────────────────────────
  addStep(jobId, 'Selecting best assets per platform', 'processing');
  updateJob(jobId, { progress: 30 });

  const selection = await selectBestAssets(scoredAssets, eventContext);

  addStep(jobId, 'Selecting best assets per platform', 'done', 'Assets selected with rationale');
  updateJob(jobId, { progress: 40 });

  // Helper to find asset by id
  const findAsset = (id: string): MediaAsset =>
    scoredAssets.find((a) => a.id === id) ?? scoredAssets[0];

  // ── Step 3: Generate LinkedIn content ─────────────────────────────────────
  addStep(jobId, 'Generating LinkedIn post', 'processing');
  updateJob(jobId, { progress: 45 });

  const linkedinAsset = findAsset(selection.linkedin);
  const linkedin = await generateLinkedInContent(brief, linkedinAsset);

  addStep(jobId, 'Generating LinkedIn post', 'done');
  updateJob(jobId, { progress: 58 });

  // ── Step 4: Generate Instagram Post ───────────────────────────────────────
  addStep(jobId, 'Generating Instagram post', 'processing');

  const igPostAsset = findAsset(selection.instagramPost);
  const instagramPost = await generateInstagramPostContent(brief, igPostAsset);

  addStep(jobId, 'Generating Instagram post', 'done');
  updateJob(jobId, { progress: 70 });

  // ── Step 5: Generate Instagram Story ──────────────────────────────────────
  addStep(jobId, 'Generating Instagram story', 'processing');

  const igStoryAsset = findAsset(selection.instagramStory);
  const instagramStory = await generateInstagramStoryContent(brief, igStoryAsset);

  addStep(jobId, 'Generating Instagram story', 'done');
  updateJob(jobId, { progress: 80 });

  // ── Step 6: Generate Case Study ───────────────────────────────────────────
  addStep(jobId, 'Generating case study draft', 'processing');

  const caseStudy = await generateCaseStudyContent(brief, selection.caseStudy);

  addStep(jobId, 'Generating case study draft', 'done');
  updateJob(jobId, { progress: 95 });

  // ── Step 7: Assemble result ───────────────────────────────────────────────
  addStep(jobId, 'Finalizing outputs', 'processing');

  const result: GeneratedContent = {
    linkedin,
    instagramPost,
    instagramStory,
    caseStudy,
    selectedAssets: {
      linkedin: selection.linkedin,
      instagramPost: selection.instagramPost,
      instagramStory: selection.instagramStory,
      caseStudy: selection.caseStudy,
      selectionRationale: selection.rationale,
    },
    processingLog: [],
  };

  addStep(jobId, 'Finalizing outputs', 'done');
  updateJob(jobId, { status: 'done', progress: 100, result });

  return result;
}

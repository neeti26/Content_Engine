import { EventBrief, MediaAsset, GeneratedContent } from '@/types';
import { scoreAllAssets, selectBestAssets } from './assetScorer';
import {
  generateLinkedInContent,
  generateInstagramPostContent,
  generateInstagramReelContent,
  generateInstagramStoryContent,
  generateTwitterContent,
  generateCaseStudyContent,
  generateWhatsAppContent,
} from './contentGenerator';

export async function runPipeline(
  brief: EventBrief,
  assets: MediaAsset[]
): Promise<GeneratedContent> {
  const ctx = `${brief.eventName} by ${brief.brandName} — ${brief.eventType} in ${brief.location}. ${brief.keyHighlights}`;

  // Step 1: Score all images/videos in batches (rate-limit safe, parallel within batch)
  const scoredAssets = await scoreAllAssets(assets, ctx);

  // Step 2: Select best asset per platform (single Gemini call)
  const selection = await selectBestAssets(scoredAssets, ctx);

  const find = (id: string) => scoredAssets.find((a) => a.id === id) ?? scoredAssets[0];

  const twitterId  = selection.twitter  ?? selection.instagramPost;
  const whatsappId = selection.whatsapp ?? selection.instagramPost;
  const reelAsset  = find(selection.instagramReel ?? selection.instagramPost);
  const isReel     = brief.instagramType === 'reel';

  // Step 3: Run all content generators in PARALLEL — ~4-8s instead of 15s+
  // We stagger launch by 150ms to spread API pressure without serializing
  const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  type InstagramResult = Awaited<ReturnType<typeof generateInstagramPostContent>>
                       | Awaited<ReturnType<typeof generateInstagramReelContent>>;

  const [
    linkedin,
    instagramResult,
    instagramStory,
    twitter,
    whatsapp,
    caseStudy,
  ] = await Promise.all([
    generateLinkedInContent(brief, find(selection.linkedin)),
    delay(150).then((): Promise<InstagramResult> =>
      isReel
        ? generateInstagramReelContent(brief, reelAsset)
        : generateInstagramPostContent(brief, find(selection.instagramPost))
    ),
    delay(300).then(() => generateInstagramStoryContent(brief, find(selection.instagramStory))),
    delay(450).then(() => generateTwitterContent(brief, find(twitterId))),
    delay(600).then(() => generateWhatsAppContent(brief, find(whatsappId))),
    delay(750).then(() => generateCaseStudyContent(brief, selection.caseStudy)),
  ]);

  return {
    linkedin,
    instagramPost: isReel
      ? { caption: '', hashtags: [], emojis: [], selectedImageId: reelAsset.id, characterCount: 0 }
      : (instagramResult as Awaited<ReturnType<typeof generateInstagramPostContent>>),
    instagramReel: isReel
      ? (instagramResult as unknown as Awaited<ReturnType<typeof generateInstagramReelContent>>)
      : undefined,
    instagramStory,
    twitter,
    whatsapp,
    caseStudy,
    selectedAssets: {
      linkedin:       selection.linkedin,
      instagramPost:  selection.instagramPost,
      instagramStory: selection.instagramStory,
      twitter:        twitterId,
      whatsapp:       whatsappId,
      caseStudy:      selection.caseStudy,
      selectionRationale: selection.rationale,
    },
    processingLog: [],
  };
}

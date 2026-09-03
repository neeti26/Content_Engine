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

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// Wrap a generator so a single failure returns a fallback instead of crashing the whole pipeline
async function safe<T>(name: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[Pipeline] Generator "${name}" failed, using fallback:`, String(err).slice(0, 200));
    return fallback;
  }
}

export async function runPipeline(
  brief: EventBrief,
  assets: MediaAsset[]
): Promise<GeneratedContent> {
  const ctx = `${brief.eventName} by ${brief.brandName} — ${brief.eventType} in ${brief.location}. ${brief.keyHighlights}`;

  console.log(`[Pipeline] Starting — ${assets.length} assets, instagramType=${brief.instagramType}`);

  // Step 1: Score all assets in batches (parallel within batch, rate-limit safe)
  const scoredAssets = await scoreAllAssets(assets, ctx);
  console.log(`[Pipeline] Scored ${scoredAssets.length} assets`);

  // Step 2: Select best asset per platform (1 Gemini call)
  const selection = await selectBestAssets(scoredAssets, ctx);
  console.log(`[Pipeline] Asset selection complete`);

  const find = (id: string) => scoredAssets.find((a) => a.id === id) ?? scoredAssets[0];

  const twitterId  = selection.twitter  ?? selection.instagramPost;
  const whatsappId = selection.whatsapp ?? selection.instagramPost;
  const reelAssetId = selection.instagramReel ?? selection.instagramPost;
  const reelAsset   = find(reelAssetId);
  const isReel      = brief.instagramType === 'reel';

  // Fallbacks used if a generator fails — always return something usable
  const fallbackId = scoredAssets[0]?.id ?? '';

  // Step 3: All generators run in parallel with 150ms stagger
  type InstagramResult =
    | Awaited<ReturnType<typeof generateInstagramPostContent>>
    | Awaited<ReturnType<typeof generateInstagramReelContent>>;

  const [linkedin, instagramResult, instagramStory, twitter, whatsapp, caseStudy] =
    await Promise.all([
      safe('linkedin', () => generateLinkedInContent(brief, find(selection.linkedin)), {
        headline: `${brief.eventName} — A Defining Moment for ${brief.brandName}`,
        body: brief.keyHighlights,
        hashtags: ['#Events', '#Marketing', '#Brand'],
        callToAction: 'Learn more on our website.',
        selectedImageId: fallbackId,
        characterCount: 0,
      }),

      delay(150).then((): Promise<InstagramResult> =>
        isReel
          ? safe('instagram-reel', () => generateInstagramReelContent(brief, reelAsset), {
              hook: `${brief.eventName.toUpperCase()} — YOU MISSED THIS`,
              duration: '30s',
              shotList: [
                { shot: 1, duration: '0-5s',  description: 'Opening wide shot of event', onScreenText: brief.eventName },
                { shot: 2, duration: '5-10s', description: 'Crowd energy shots',          onScreenText: 'The energy was unreal' },
                { shot: 3, duration: '10-20s',description: 'Key moments highlights',       onScreenText: brief.keyHighlights.split(',')[0] ?? '' },
                { shot: 4, duration: '20-25s',description: 'Brand showcase moments',       onScreenText: brief.brandName },
                { shot: 5, duration: '25-30s',description: 'Closing shot with logo',       onScreenText: 'Follow for more' },
              ],
              voiceoverScript: `${brief.eventName} by ${brief.brandName}. ${brief.keyHighlights}. Don't miss our next event.`,
              musicMood: 'Upbeat corporate pop',
              caption: `${brief.eventName} was incredible! ${brief.keyHighlights.split(',')[0]}. Were you there?`,
              hashtags: ['#Reels', '#Events', '#Marketing', '#Brand'],
              selectedImageId: reelAsset.id,
            })
          : safe('instagram-post', () => generateInstagramPostContent(brief, find(selection.instagramPost)), {
              caption: `${brief.eventName} by ${brief.brandName}. ${brief.keyHighlights}`,
              hashtags: ['#Events', '#Marketing', '#Brand', '#Innovation'],
              emojis: ['🔥', '✨', '🎯'],
              selectedImageId: fallbackId,
              characterCount: 0,
            })
      ),

      delay(300).then(() => safe('story', () => generateInstagramStoryContent(brief, find(selection.instagramStory)), {
        headline: brief.eventName.toUpperCase().slice(0, 20),
        subtext: brief.brandName,
        ctaText: 'Swipe Up',
        selectedImageId: fallbackId,
        overlayStyle: 'gradient' as const,
      })),

      delay(450).then(() => safe('twitter', () => generateTwitterContent(brief, find(twitterId)), {
        threadHook: `${brief.eventName} just happened and here's what you missed 🧵`,
        tweets: [
          `${brief.eventName} by ${brief.brandName} — here's a thread 🧵`,
          brief.keyHighlights,
          `Thanks to everyone who made it happen. More soon.`,
        ],
        selectedImageId: fallbackId,
      })),

      delay(600).then(() => safe('whatsapp', () => generateWhatsAppContent(brief, find(whatsappId)), {
        statusText: `${brief.eventName} — done! 🔥`,
        caption: `Just wrapped ${brief.eventName} by ${brief.brandName}. ${brief.keyHighlights}`,
        selectedImageId: fallbackId,
      })),

      delay(750).then(() => safe('case-study', () => generateCaseStudyContent(brief, selection.caseStudy), {
        title: `${brief.eventName}: Event Recap`,
        executiveSummary: `${brief.brandName} hosted ${brief.eventName}. ${brief.keyHighlights}`,
        eventOverview: `${brief.eventType} held in ${brief.location} on ${brief.date}.`,
        keyHighlights: brief.keyHighlights.split(',').map(s => s.trim()).filter(Boolean),
        impactMetrics: [{ label: 'Event', value: brief.eventName, icon: '🎯' }],
        brandNarrative: `${brief.brandName} continues to lead through impactful events.`,
        conclusion: 'More events coming soon.',
        selectedImageIds: selection.caseStudy,
      })),
    ]);

  console.log(`[Pipeline] All generators complete`);

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

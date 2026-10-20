import { EventBrief, MediaAsset, GeneratedContent } from '@/types';
import { scoreAllAssets, selectBestAssets, fallbackSelection } from './assetScorer';
import { submitReelRender } from './creatomate';
import { beginPhase, endPhase, remainingMs } from './deadline';
import {
  generateLinkedInContent,
  generateInstagramPostContent,
  generateInstagramReelContent,
  generateTwitterContent,
  generateCaseStudyContent,
  generateWhatsAppContent,
} from './contentGenerator';

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

async function safe<T>(name: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[Pipeline] "${name}" failed, using fallback:`, String(err).slice(0, 200));
    return fallback;
  }
}

export async function runPipeline(
  brief: EventBrief,
  assets: MediaAsset[]
): Promise<GeneratedContent> {
  const ctx = `${brief.eventName} by ${brief.brandName} — ${brief.eventType} in ${brief.location}. ${brief.keyHighlights}`;

  console.log(`[Pipeline] Starting — ${assets.length} assets, instagramType=${brief.instagramType}`);

  // The request budget is split: scoring the photos and picking the assets
  // are the first to be cut short when the AI is slow — the written content
  // is what the user came for.
  const total = remainingMs();
  const scoringBudget = total === Infinity ? 60_000 : Math.max(10_000, total * 0.4);
  beginPhase(scoringBudget);
  const scoredAssets = await scoreAllAssets(assets, ctx);
  endPhase();
  console.log(`[Pipeline] Scored ${scoredAssets.length} assets`);

  const selectionBudget = remainingMs() === Infinity ? 30_000 : Math.max(8_000, remainingMs() * 0.3);
  beginPhase(selectionBudget);
  // A busy model must not fail the whole request — fall back to the best
  // scored photo per platform.
  const selection = await safe(
    'asset-selection',
    () => selectBestAssets(scoredAssets, ctx),
    fallbackSelection(scoredAssets)
  );
  endPhase();
  console.log(`[Pipeline] Selection complete`);

  const find = (id: string) => scoredAssets.find((a) => a.id === id) ?? scoredAssets[0];

  const twitterId   = selection.twitter  ?? selection.instagramPost;
  const whatsappId  = selection.whatsapp ?? selection.instagramPost;
  const reelAssetId = selection.instagramReel ?? selection.instagramPost;
  const reelAsset   = find(reelAssetId);
  const isReel      = brief.instagramType === 'reel';
  const fallbackId  = scoredAssets[0]?.id ?? '';

  type InstagramResult =
    | Awaited<ReturnType<typeof generateInstagramPostContent>>
    | Awaited<ReturnType<typeof generateInstagramReelContent>>;

  const [linkedin, instagramResult, twitter, whatsapp, caseStudy] =
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
                { shot: 1, duration: '0-3s',  description: 'Opening hero shot', onScreenText: brief.eventName },
                { shot: 2, duration: '3-8s',  description: 'Crowd energy',      onScreenText: 'The energy was unreal' },
                { shot: 3, duration: '8-14s', description: 'Key moment',        onScreenText: brief.keyHighlights.split(',')[0] ?? '' },
                { shot: 4, duration: '14-20s',description: 'Candid moments',    onScreenText: brief.brandName },
                { shot: 5, duration: '20-26s',description: 'Brand showcase',    onScreenText: 'Follow for more' },
                { shot: 6, duration: '26-30s',description: 'Closing shot',      onScreenText: 'Follow us' },
              ],
              voiceoverScript: `${brief.eventName} by ${brief.brandName}. ${brief.keyHighlights}. Don't miss the next one.`,
              musicMood: 'Upbeat corporate pop',
              caption: `${brief.eventName} was incredible! Were you there?`,
              hashtags: ['#Reels', '#Events', '#Marketing'],
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

      delay(300).then(() => safe('twitter', () => generateTwitterContent(brief, find(twitterId)), {
        threadHook: `${brief.eventName} just happened and here's what you missed 🧵`,
        tweets: [
          `${brief.eventName} by ${brief.brandName} — here's a thread 🧵`,
          brief.keyHighlights,
          `Thanks to everyone who made it happen.`,
        ],
        selectedImageId: fallbackId,
      })),

      delay(450).then(() => safe('whatsapp', () => generateWhatsAppContent(brief, find(whatsappId)), {
        statusText: `${brief.eventName} — done! 🔥`,
        caption: `Just wrapped ${brief.eventName} by ${brief.brandName}. ${brief.keyHighlights}`,
        selectedImageId: fallbackId,
      })),

      delay(600).then(() => safe('case-study', () => generateCaseStudyContent(brief, selection.caseStudy), {
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

  // Submit Creatomate render for reel
  let finalReelContent = isReel
    ? (instagramResult as unknown as Awaited<ReturnType<typeof generateInstagramReelContent>>)
    : undefined;

  if (isReel && finalReelContent) {
    const hasCreatomateKey = !!process.env.CREATOMATE_API_KEY;
    console.log(`[Pipeline] Reel mode — CREATOMATE_API_KEY present: ${hasCreatomateKey}`);

    if (hasCreatomateKey) {
      try {
        console.log('[Pipeline] Submitting Creatomate render...');
        const renderResult = await submitReelRender(finalReelContent, assets, brief.brandName);
        finalReelContent = {
          ...finalReelContent,
          renderId:     renderResult.renderId || 'attempted',
          renderStatus: renderResult.status,
          videoUrl:     renderResult.videoUrl,
          renderError:  renderResult.errorMessage,
        };
        console.log(`[Pipeline] Creatomate: id=${renderResult.renderId}, status=${renderResult.status}, error=${renderResult.errorMessage ?? 'none'}`);
      } catch (err) {
        const errMsg = String(err).slice(0, 300);
        console.error('[Pipeline] Creatomate render submission failed:', errMsg);
        finalReelContent = {
          ...finalReelContent,
          renderId:     'failed',
          renderStatus: 'failed',
          renderError:  errMsg,
        };
      }
    } else {
      finalReelContent = {
        ...finalReelContent,
        renderId:     '',
        renderStatus: 'failed',
        renderError:  'CREATOMATE_API_KEY not configured in environment variables',
      };
    }
  }

  return {
    linkedin,
    instagramPost: isReel
      ? { caption: '', hashtags: [], emojis: [], selectedImageId: reelAsset.id, characterCount: 0 }
      : (instagramResult as Awaited<ReturnType<typeof generateInstagramPostContent>>),
    instagramReel: isReel ? finalReelContent : undefined,
    twitter,
    whatsapp,
    caseStudy,
    selectedAssets: {
      linkedin:           selection.linkedin,
      instagramPost:      selection.instagramPost,
      twitter:            twitterId,
      whatsapp:           whatsappId,
      caseStudy:          selection.caseStudy,
      selectionRationale: selection.rationale,
    },
    processingLog: [],
  };
}

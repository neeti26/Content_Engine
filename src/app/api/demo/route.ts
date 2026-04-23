import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createJob, updateJob, addStep } from '@/lib/jobStore';
import type { GeneratedContent } from '@/types';

/** Demo mode — instant results without OpenAI API */
export async function POST() {
  const jobId = uuidv4();
  createJob(jobId);

  // Simulate processing
  setTimeout(() => {
    addStep(jobId, 'Demo mode activated', 'done');
    updateJob(jobId, { progress: 30 });
  }, 500);

  setTimeout(() => {
    addStep(jobId, 'Loading sample outputs', 'done');
    updateJob(jobId, { progress: 70 });
  }, 1000);

  setTimeout(() => {
    const demoResult: GeneratedContent = {
      linkedin: {
        headline: 'When 500+ marketers gathered to redefine experiential marketing',
        body: `The energy was electric. TechSummit 2025 brought together India's top marketing minds for 3 days of innovation, collaboration, and breakthrough thinking.\n\nFrom the opening keynote on AI-powered brand experiences to the closing panel on measuring experiential ROI, every session challenged conventional wisdom. The product demo of our new AI platform drew standing ovations — twice.\n\nBut what stood out most? The conversations. The connections. The ideas sparked over coffee that will become campaigns next quarter.\n\nThis is what happens when you bring the right people together with the right purpose.`,
        hashtags: ['#ExperientialMarketing', '#TechSummit2025', '#MarketingInnovation', '#BrandExperience', '#EventMarketing', '#MarketingLeadership', '#AIMarketing'],
        callToAction: 'What was your biggest takeaway from this year's summit? Drop it in the comments.',
        selectedImageId: 'demo-1',
        characterCount: 687,
      },
      instagramPost: {
        caption: `500+ marketing leaders. 3 days. Infinite ideas. 🔥\n\nTechSummit 2025 wasn't just another conference — it was a movement. From AI-powered brand activations to measuring experiential ROI, we dove deep into what's next for marketing.\n\nThe energy? Unmatched. The insights? Game-changing. The connections? Priceless. ✨\n\nSwipe to see the moments that made this summit unforgettable. From keynote standing ovations to late-night strategy sessions, this is what happens when the best minds in marketing come together.\n\nAlready counting down to next year. Who's with us? 🚀`,
        hashtags: ['#TechSummit2025', '#ExperientialMarketing', '#MarketingEvent', '#BrandActivation', '#EventMarketing', '#MarketingLeaders', '#Innovation', '#AIMarketing', '#MarketingStrategy', '#EventProfs', '#BrandExperience', '#MarketingConference', '#NetworkingEvent', '#MarketingCommunity', '#EventIndustry', '#MarketingTrends', '#FutureOfMarketing', '#MarketingInsights', '#EventPlanning', '#BrandStrategy', '#MarketingGoals', '#EventSuccess', '#MarketingInspiration', '#EventLife', '#MarketingMagic'],
        emojis: ['🔥', '✨', '🚀', '💡', '🎯'],
        selectedImageId: 'demo-2',
        characterCount: 512,
      },
      instagramStory: {
        headline: 'WE MADE HISTORY',
        subtext: '500+ leaders, 3 days, infinite ideas',
        ctaText: 'See More',
        selectedImageId: 'demo-3',
        overlayStyle: 'gradient',
      },
      twitter: {
        threadHook: 'TechSummit 2025 just wrapped and I'm still processing what happened. 500+ marketing leaders. 3 days. Here's what you missed 🧵',
        tweets: [
          'TechSummit 2025 just wrapped and I'm still processing what happened.\n\n500+ marketing leaders. 3 days of pure innovation.\n\nHere's what you missed 🧵',
          'Day 1: The keynote on AI-powered brand experiences got TWO standing ovations.\n\nThe demo showed how AI can personalize experiential marketing at scale.\n\nMinds = blown.',
          'Day 2: The panel on measuring experiential ROI finally answered the question every CMO asks:\n\n"How do we prove events drive revenue?"\n\nSpoiler: It's not about impressions. It's about intent signals.',
          'Day 3: The networking sessions were where the real magic happened.\n\n12 new partnerships formed.\n8 co-marketing campaigns planned.\nCountless ideas that will become reality next quarter.',
          'TechSummit 2025 proved one thing:\n\nExperiential marketing isn't dying. It's evolving.\n\nAnd the brands that embrace AI + human connection will win the next decade.\n\nSee you at TechSummit 2026. 🚀\n\n#TechSummit2025 #ExperientialMarketing',
        ],
        selectedImageId: 'demo-2',
      },
      caseStudy: {
        title: 'TechSummit 2025: Redefining Experiential Marketing Through AI and Human Connection',
        executiveSummary: 'TechSummit 2025 brought together 500+ marketing leaders for a 3-day deep dive into the future of experiential marketing. The event generated 50K+ social impressions, 12 media placements, and sparked 8 immediate co-marketing partnerships.',
        eventOverview: 'TechSummit 2025 was designed to answer one question: How can brands create memorable experiences at scale in an AI-powered world? Over three days in Mumbai, 500+ CMOs, brand directors, and marketing innovators gathered to explore the intersection of technology and human connection.\n\nThe summit featured 12 keynote sessions, 8 panel discussions, live product demos, and curated networking experiences. From AI-powered personalization to measuring experiential ROI, every session was built to deliver actionable insights that attendees could implement immediately.',
        keyHighlights: [
          '500+ attendees from 200+ brands across India',
          'Keynote on AI-powered brand experiences received two standing ovations',
          '12 media outlets covered the event, reaching 2M+ readers',
          '8 co-marketing partnerships formed during networking sessions',
          '94% of attendees rated the event "excellent" or "outstanding"',
        ],
        impactMetrics: [
          { label: 'Attendees', value: '500+', icon: '👥' },
          { label: 'Social Reach', value: '50K+', icon: '📱' },
          { label: 'Media Placements', value: '12', icon: '📰' },
          { label: 'Satisfaction', value: '94%', icon: '⭐' },
        ],
        brandNarrative: 'TechSummit has established itself as India's premier gathering for marketing innovation. This year's focus on AI and experiential marketing positioned the event at the forefront of industry conversation.\n\nBy bringing together practitioners, technology providers, and brand leaders, TechSummit created a unique environment where theory met practice. The result: actionable strategies that attendees are already implementing.',
        conclusion: 'TechSummit 2025 proved that experiential marketing's future lies at the intersection of AI-powered personalization and authentic human connection. The brands that master this balance will define the next decade of marketing. TechSummit 2026 will build on this foundation, diving even deeper into implementation and measurement.',
        selectedImageIds: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
      },
      selectedAssets: {
        linkedin: 'demo-1',
        instagramPost: 'demo-2',
        instagramStory: 'demo-3',
        twitter: 'demo-2',
        caseStudy: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
        selectionRationale: {
          linkedin: 'Professional wide shot showing scale and brand presence — perfect for B2B audience',
          instagramPost: 'High-energy crowd shot with visible excitement — drives engagement',
          instagramStory: 'Bold stage moment with strong visual impact — works in vertical crop',
          twitter: 'Dynamic moment that tells a story at a glance — highly shareable',
          caseStudy: 'Diverse set showing keynote, networking, product demo, and closing — comprehensive story',
        },
      },
      processingLog: [],
    };

    addStep(jobId, 'Demo complete', 'done');
    updateJob(jobId, { status: 'done', progress: 100, result: demoResult });
  }, 1500);

  return NextResponse.json({ jobId }, { status: 202 });
}

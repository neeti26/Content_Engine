import { NextResponse } from 'next/server';
import type { GeneratedContent } from '@/types';

export async function POST() {
  const result: GeneratedContent = {
    linkedin: {
      headline: 'When 500+ marketers gathered to redefine experiential marketing',
      body: `The energy was electric.\n\nTechSummit 2025 brought together India's top marketing minds for 3 days of innovation, collaboration, and breakthrough thinking. 500+ CMOs. 12 keynotes. One shared mission: figure out what's next.\n\nFrom the opening keynote on AI-powered brand experiences to the closing panel on measuring experiential ROI, every session challenged conventional wisdom. The product demo drew standing ovations — twice.\n\nBut what stood out most? The conversations. The connections. The ideas sparked over coffee that will become campaigns next quarter.\n\nWhat's the one insight from this year that changed how you think about events?`,
      hashtags: ['#ExperientialMarketing','#TechSummit2025','#MarketingInnovation','#BrandExperience','#EventMarketing','#MarketingLeadership','#AIMarketing','#EventProfs'],
      callToAction: 'Drop your biggest takeaway in the comments — let\'s keep the conversation going.',
      selectedImageId: 'demo-1',
      characterCount: 720,
    },
    instagramPost: {
      caption: `500+ marketing leaders. 3 days. Infinite ideas. 🔥\n\nTechSummit 2025 wasn't just another conference — it was a movement. We dove deep into AI-powered brand activations, measuring experiential ROI, and what it actually takes to create moments people remember. ✨\n\nThe energy? Unmatched. The insights? Game-changing. The connections made over those 3 days? Priceless. 💡\n\nFrom keynote standing ovations to late-night strategy sessions, this is what happens when the best minds in marketing come together with one goal: push the industry forward.\n\nAlready counting down to next year. Who's with us? 🚀`,
      hashtags: ['#TechSummit2025','#ExperientialMarketing','#MarketingEvent','#BrandActivation','#EventMarketing','#MarketingLeaders','#Innovation','#AIMarketing','#MarketingStrategy','#EventProfs','#BrandExperience','#MarketingConference','#NetworkingEvent','#MarketingCommunity','#EventIndustry','#MarketingTrends','#FutureOfMarketing','#MarketingInsights','#EventPlanning','#BrandStrategy','#MarketingGoals','#EventSuccess','#MarketingInspiration','#EventLife','#MarketingMagic','#CMO','#ContentMarketing','#DigitalMarketing','#GrowthMarketing','#MarketingROI'],
      emojis: ['🔥','✨','💡','🚀','🎯'],
      selectedImageId: 'demo-2',
      characterCount: 498,
    },
    instagramStory: {
      headline: 'WE MADE HISTORY',
      subtext: '500+ leaders, 3 days, infinite ideas',
      ctaText: 'See More',
      selectedImageId: 'demo-3',
      overlayStyle: 'gradient',
    },
    twitter: {
      threadHook: 'TechSummit 2025 just wrapped. 500+ marketing leaders. 3 days. Here\'s what you missed 🧵',
      tweets: [
        'TechSummit 2025 just wrapped.\n\n500+ marketing leaders. 3 days of pure innovation.\n\nHere\'s what you missed 🧵',
        'Day 1: The keynote on AI-powered brand experiences got TWO standing ovations.\n\nThe demo showed how AI personalizes experiential marketing at scale.\n\nMinds = blown.',
        'Day 2: The panel on measuring experiential ROI finally answered the CMO question:\n\n"How do we prove events drive revenue?"\n\nSpoiler: It\'s not about impressions. It\'s about intent signals.',
        'Day 3: Networking sessions where the real magic happened.\n\n12 new partnerships formed.\n8 co-marketing campaigns planned.\n94% satisfaction rate.\n\nNumbers don\'t lie.',
        'TechSummit 2025 proved one thing:\n\nExperiential marketing isn\'t dying. It\'s evolving.\n\nBrands that embrace AI + human connection will win the next decade.\n\nSee you at TechSummit 2026. 🚀\n\n#TechSummit2025 #ExperientialMarketing',
      ],
      selectedImageId: 'demo-2',
    },
    caseStudy: {
      title: 'TechSummit 2025: How StepOne Turned a 3-Day Conference Into a Marketing Movement',
      executiveSummary: 'StepOne faced the challenge of creating a flagship event that would position them as India\'s leading experiential marketing authority. TechSummit 2025 delivered: 500+ attendees, 50K+ social impressions, 12 media placements, and 8 immediate co-marketing partnerships — all within 72 hours.',
      eventOverview: 'TechSummit 2025 was designed to answer one question: How can brands create memorable experiences at scale in an AI-powered world? Over three days in Mumbai, 500+ CMOs, brand directors, and marketing innovators gathered to explore the intersection of technology and human connection.\n\nThe summit featured 12 keynote sessions, 8 panel discussions, live product demos, and curated networking experiences. Every touchpoint was intentional — from the AI-personalized welcome kits to the data-driven session recommendations that ensured every attendee found maximum value.',
      keyHighlights: [
        '500+ attendees from 200+ brands across India — 40% increase from 2024',
        'Keynote on AI-powered brand experiences received two standing ovations',
        '12 media outlets covered the event, reaching an estimated 2M+ readers',
        '8 co-marketing partnerships formed during structured networking sessions',
        '94% of attendees rated the event "excellent" or "outstanding" in post-event survey',
        'Product demo generated 150+ qualified leads for StepOne\'s AI platform',
      ],
      impactMetrics: [
        { label: 'Attendees', value: '500+', icon: '👥' },
        { label: 'Social Reach', value: '50K+', icon: '📱' },
        { label: 'Media Placements', value: '12', icon: '📰' },
        { label: 'NPS Score', value: '72', icon: '⭐' },
        { label: 'Partnerships', value: '8', icon: '🤝' },
      ],
      brandNarrative: 'TechSummit has established StepOne as India\'s premier convener of marketing innovation. By consistently bringing together practitioners, technology providers, and brand leaders, StepOne has created a unique platform where industry direction is set — not just discussed.\n\nThis year\'s focus on AI and experiential marketing positioned StepOne at the forefront of the industry\'s most important conversation. The result: a brand that doesn\'t just execute events, but shapes the future of marketing.',
      conclusion: 'TechSummit 2025 proved that experiential marketing\'s future lies at the intersection of AI-powered personalization and authentic human connection. StepOne\'s next milestone: scaling this model to 5 cities across India in 2026, with AI-driven personalization at every touchpoint.',
      selectedImageIds: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
    },
    selectedAssets: {
      linkedin: 'demo-1',
      instagramPost: 'demo-2',
      instagramStory: 'demo-3',
      twitter: 'demo-2',
      caseStudy: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
      selectionRationale: {
        linkedin: 'Wide professional shot showing event scale and brand presence — ideal for B2B audience',
        instagramPost: 'High-energy crowd moment with visible excitement — maximizes engagement',
        instagramStory: 'Bold stage moment with strong visual impact — works perfectly in vertical crop',
        twitter: 'Dynamic shareable moment that tells the story at a glance',
        caseStudy: 'Diverse set covering keynote, networking, product demo, and closing ceremony',
      },
    },
    processingLog: [],
  };

  return NextResponse.json({ result }, { status: 200 });
}

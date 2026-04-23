import { NextResponse } from "next/server";
import type { GeneratedContent } from "@/types";

export async function POST() {
  const result: GeneratedContent = {
    linkedin: {
      headline: "When 500+ marketers gathered to redefine experiential marketing",
      body: "The energy was electric.\n\nTechSummit 2025 brought together India's top marketing minds for 3 days of innovation, collaboration, and breakthrough thinking. 500+ CMOs. 12 keynotes. One shared mission.\n\nFrom the opening keynote on AI-powered brand experiences to the closing panel on measuring experiential ROI, every session challenged conventional wisdom. The product demo drew standing ovations — twice.\n\nWhat's the one insight from this year that changed how you think about events?",
      hashtags: ["#ExperientialMarketing","#TechSummit2025","#MarketingInnovation","#BrandExperience","#EventMarketing","#MarketingLeadership","#AIMarketing","#EventProfs"],
      callToAction: "Drop your biggest takeaway in the comments.",
      selectedImageId: "demo-1",
      characterCount: 720,
    },
    instagramPost: {
      caption: "500+ marketing leaders. 3 days. Infinite ideas. 🔥\n\nTechSummit 2025 wasn't just another conference — it was a movement. We dove deep into AI-powered brand activations, measuring experiential ROI, and what it takes to create moments people remember. ✨\n\nThe energy? Unmatched. The insights? Game-changing. The connections? Priceless. 💡\n\nAlready counting down to next year. Who's with us? 🚀",
      hashtags: ["#TechSummit2025","#ExperientialMarketing","#MarketingEvent","#BrandActivation","#EventMarketing","#MarketingLeaders","#Innovation","#AIMarketing","#MarketingStrategy","#EventProfs","#BrandExperience","#MarketingConference","#NetworkingEvent","#MarketingCommunity","#EventIndustry","#MarketingTrends","#FutureOfMarketing","#MarketingInsights","#EventPlanning","#BrandStrategy"],
      emojis: ["🔥","✨","💡","🚀","🎯"],
      selectedImageId: "demo-2",
      characterCount: 498,
    },
    instagramStory: {
      headline: "WE MADE HISTORY",
      subtext: "500+ leaders, 3 days, infinite ideas",
      ctaText: "See More",
      selectedImageId: "demo-3",
      overlayStyle: "gradient",
    },
    twitter: {
      threadHook: "TechSummit 2025 just wrapped. 500+ marketing leaders. 3 days. Here's what you missed 🧵",
      tweets: [
        "TechSummit 2025 just wrapped.\n\n500+ marketing leaders. 3 days of pure innovation.\n\nHere's what you missed 🧵",
        "Day 1: The keynote on AI-powered brand experiences got TWO standing ovations.\n\nThe demo showed how AI personalizes experiential marketing at scale.\n\nMinds = blown.",
        "Day 2: The panel on measuring experiential ROI finally answered the CMO question:\n\nHow do we prove events drive revenue?\n\nSpoiler: It's not about impressions. It's about intent signals.",
        "Day 3: Networking sessions where the real magic happened.\n\n12 new partnerships formed.\n8 co-marketing campaigns planned.\n94% satisfaction rate.",
        "TechSummit 2025 proved one thing:\n\nExperiential marketing isn't dying. It's evolving.\n\nSee you at TechSummit 2026. 🚀\n\n#TechSummit2025 #ExperientialMarketing",
      ],
      selectedImageId: "demo-2",
    },
    whatsapp: {
      statusText: "Just wrapped TechSummit 2025. Mind = blown. 🔥",
      caption: "Just got back from TechSummit 2025 and honestly — this was something else. 500+ marketing leaders, 3 days of real conversations, and ideas that are going to change how we work. If you missed it, let's catch up soon!",
      selectedImageId: "demo-2",
    },
    caseStudy: {
      title: "TechSummit 2025: How StepOne Turned a 3-Day Conference Into a Marketing Movement",
      executiveSummary: "StepOne faced the challenge of creating a flagship event to position them as India's leading experiential marketing authority. TechSummit 2025 delivered: 500+ attendees, 50K+ social impressions, 12 media placements, and 8 co-marketing partnerships.",
      eventOverview: "TechSummit 2025 was designed to answer one question: How can brands create memorable experiences at scale in an AI-powered world? Over three days in Mumbai, 500+ CMOs and marketing innovators gathered to explore the intersection of technology and human connection.\n\nThe summit featured 12 keynote sessions, 8 panel discussions, live product demos, and curated networking experiences. Every touchpoint was intentional — from AI-personalized welcome kits to data-driven session recommendations.",
      keyHighlights: [
        "500+ attendees from 200+ brands across India — 40% increase from 2024",
        "Keynote on AI-powered brand experiences received two standing ovations",
        "12 media outlets covered the event, reaching 2M+ readers",
        "8 co-marketing partnerships formed during networking sessions",
        "94% of attendees rated the event excellent or outstanding",
      ],
      impactMetrics: [
        { label: "Attendees", value: "500+", icon: "👥" },
        { label: "Social Reach", value: "50K+", icon: "📱" },
        { label: "Media Placements", value: "12", icon: "📰" },
        { label: "NPS Score", value: "72", icon: "⭐" },
        { label: "Partnerships", value: "8", icon: "🤝" },
      ],
      brandNarrative: "TechSummit has established StepOne as India's premier convener of marketing innovation. By bringing together practitioners, technology providers, and brand leaders, StepOne created a platform where industry direction is set — not just discussed.\n\nThis year's focus on AI and experiential marketing positioned StepOne at the forefront of the industry's most important conversation.",
      conclusion: "TechSummit 2025 proved that experiential marketing's future lies at the intersection of AI-powered personalization and authentic human connection. StepOne's next milestone: scaling this model to 5 cities across India in 2026.",
      selectedImageIds: ["demo-1","demo-2","demo-3","demo-4"],
    },
    selectedAssets: {
      linkedin: "demo-1",
      instagramPost: "demo-2",
      instagramStory: "demo-3",
      twitter: "demo-2",
      whatsapp: "demo-2",
      caseStudy: ["demo-1","demo-2","demo-3","demo-4"],
      selectionRationale: {
        linkedin: "Professional wide shot showing event scale — ideal for B2B audience",
        instagramPost: "High-energy crowd moment with visible excitement — maximizes engagement",
        instagramStory: "Bold stage moment with strong visual impact — works in vertical crop",
        twitter: "Dynamic shareable moment that tells the story at a glance",
        whatsapp: "Warm personal moment that feels authentic for WhatsApp sharing",
        caseStudy: "Diverse set covering keynote, networking, product demo, and closing",
      },
    },
    processingLog: [],
  };

  return NextResponse.json({ result }, { status: 200 });
}
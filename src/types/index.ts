export interface EventBrief {
  eventName: string;
  brandName: string;
  eventType: string;
  location: string;
  date: string;
  keyHighlights: string;
  targetAudience: string;
  tone: 'professional' | 'energetic' | 'inspirational' | 'casual';
  instagramType: 'post' | 'reel';
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video';
  base64: string;          // full quality — display only, never sent to server
  apiBase64?: string;      // compressed copy sent to API (≤80KB each)
  mimeType: string;
  size: number;
  score?: AssetScore;
  /** For video assets: a base64 JPEG thumbnail extracted client-side */
  thumbnailBase64?: string;
}

export interface AssetScore {
  overall: number;
  sharpness: number;
  composition: number;
  brandRelevance: number;
  humanEngagement: number;
  reasoning: string;
}

export interface GeneratedContent {
  linkedin: LinkedInContent;
  instagramPost: InstagramPostContent;
  instagramReel?: InstagramReelContent;
  instagramStory: InstagramStoryContent;
  twitter: TwitterContent;
  whatsapp: WhatsAppContent;
  caseStudy: CaseStudyContent;
  selectedAssets: SelectedAssets;
  processingLog: ProcessingStep[];
}

export interface WhatsAppContent {
  statusText: string;
  caption: string;
  selectedImageId: string;
}

export interface LinkedInContent {
  headline: string;
  body: string;
  hashtags: string[];
  callToAction: string;
  selectedImageId: string;
  characterCount: number;
}

export interface InstagramPostContent {
  caption: string;
  hashtags: string[];
  emojis: string[];
  selectedImageId: string;
  characterCount: number;
}

export interface InstagramReelContent {
  hook: string;
  duration: string;
  shotList: ShotListItem[];
  voiceoverScript: string;
  musicMood: string;
  caption: string;
  hashtags: string[];
  selectedImageId: string;
}

export interface ShotListItem {
  shot: number;
  duration: string;
  description: string;
  onScreenText: string;
}

export interface InstagramStoryContent {
  headline: string;
  subtext: string;
  ctaText: string;
  selectedImageId: string;
  overlayStyle: 'dark' | 'light' | 'gradient';
  storyImageBase64?: string;
}

export interface TwitterContent {
  tweets: string[];
  selectedImageId: string;
  threadHook: string;
}

export interface CaseStudyContent {
  title: string;
  executiveSummary: string;
  eventOverview: string;
  keyHighlights: string[];
  impactMetrics: ImpactMetric[];
  brandNarrative: string;
  conclusion: string;
  selectedImageIds: string[];
}

export interface ImpactMetric {
  label: string;
  value: string;
  icon: string;
}

export interface SelectedAssets {
  linkedin: string;
  instagramPost: string;
  instagramStory: string;
  twitter: string;
  whatsapp: string;
  caseStudy: string[];
  selectionRationale: Record<string, string>;
}

export interface ProcessingStep {
  step: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  detail?: string;
  timestamp: number;
}

export interface ProcessingStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  progress: number;
  currentStep: string;
  steps: ProcessingStep[];
  result?: GeneratedContent;
  error?: string;
}

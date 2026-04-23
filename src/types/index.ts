export interface EventBrief {
  eventName: string;
  brandName: string;
  eventType: string;
  location: string;
  date: string;
  keyHighlights: string;
  targetAudience: string;
  tone: 'professional' | 'energetic' | 'inspirational' | 'casual';
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video';
  base64: string;
  mimeType: string;
  size: number;
  score?: AssetScore;
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
  instagramStory: InstagramStoryContent;
  twitter: TwitterContent;
  caseStudy: CaseStudyContent;
  selectedAssets: SelectedAssets;
  processingLog: ProcessingStep[];
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

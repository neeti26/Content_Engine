'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Linkedin, Instagram, FileText, RotateCcw, Copy, Check,
  Download, Star, ChevronDown, ChevronUp, Zap, Image as ImageIcon,
  BarChart2, BookOpen
} from 'lucide-react';
import { GeneratedContent, MediaAsset, EventBrief } from '@/types';
import { getStoryOverlayConfig } from '@/lib/storyImageGenerator';
import { generateStoryImageCanvas } from '@/lib/storyImageGenerator';

interface Props {
  content: GeneratedContent;
  assets: MediaAsset[];
  brief: EventBrief;
  onReset: () => void;
}

type Tab = 'linkedin' | 'instagram' | 'story' | 'casestudy' | 'assets';

const tabs = [
  { id: 'linkedin' as Tab, label: 'LinkedIn', icon: Linkedin, badge: 'badge-linkedin' },
  { id: 'instagram' as Tab, label: 'Instagram Post', icon: Instagram, badge: 'badge-instagram' },
  { id: 'story' as Tab, label: 'IG Story', icon: Instagram, badge: 'badge-story' },
  { id: 'casestudy' as Tab, label: 'Case Study', icon: FileText, badge: 'badge-casestudy' },
  { id: 'assets' as Tab, label: 'Asset Scores', icon: BarChart2, badge: '' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function AssetImage({ asset }: { asset: MediaAsset }) {
  if (!asset) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`data:${asset.mimeType};base64,${asset.base64}`}
      alt={asset.name}
      className="w-full h-full object-cover"
    />
  );
}

export default function ResultsDashboard({ content, assets, brief, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('linkedin');
  const [expandedRationale, setExpandedRationale] = useState(false);
  const [storyGenerated, setStoryGenerated] = useState<string | null>(null);
  const [generatingStory, setGeneratingStory] = useState(false);

  const findAsset = (id: string) => assets.find((a) => a.id === id);

  const linkedinAsset = findAsset(content.selectedAssets.linkedin);
  const igPostAsset = findAsset(content.selectedAssets.instagramPost);
  const igStoryAsset = findAsset(content.selectedAssets.instagramStory);

  const handleGenerateStoryImage = async () => {
    if (!igStoryAsset) return;
    setGeneratingStory(true);
    try {
      const result = await generateStoryImageCanvas(igStoryAsset.base64, content.instagramStory);
      setStoryGenerated(result);
    } catch {
      console.error('Story generation failed');
    }
    setGeneratingStory(false);
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  };

  const sortedAssets = [...assets]
    .filter((a) => a.score)
    .sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h2 className="font-bold text-white">Content Generated</h2>
            <p className="text-gray-500 text-sm">{brief.eventName} · {brief.brandName}</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/5 px-6">
        <div className="flex gap-1 overflow-x-auto py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-500 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto px-6 py-8"
          >
            {/* ── LinkedIn ── */}
            {activeTab === 'linkedin' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Preview */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-400" />
                    Selected Image
                  </h3>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-gray-800 mb-4">
                    {linkedinAsset && <AssetImage asset={linkedinAsset} />}
                  </div>
                  {linkedinAsset?.score && (
                    <ScoreBadges score={linkedinAsset.score} />
                  )}
                  {content.selectedAssets.selectionRationale.linkedin && (
                    <div className="mt-3 text-xs text-gray-500 bg-gray-800/50 rounded-xl p-3">
                      <span className="text-gray-400 font-medium">Why this image: </span>
                      {content.selectedAssets.selectionRationale.linkedin}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-400">Generated Post</h3>
                    <CopyButton
                      text={`${content.linkedin.headline}\n\n${content.linkedin.body}\n\n${content.linkedin.callToAction}\n\n${content.linkedin.hashtags.join(' ')}`}
                    />
                  </div>

                  <div className="glass rounded-2xl p-6 space-y-4">
                    <div>
                      <span className="text-xs text-gray-600 uppercase tracking-wider">Headline</span>
                      <p className="text-white font-bold text-lg mt-1">{content.linkedin.headline}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 uppercase tracking-wider">Body</span>
                      <p className="text-gray-300 text-sm mt-1 leading-relaxed whitespace-pre-line">
                        {content.linkedin.body}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 uppercase tracking-wider">Call to Action</span>
                      <p className="text-brand-400 text-sm mt-1 font-medium">{content.linkedin.callToAction}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 uppercase tracking-wider">Hashtags</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {content.linkedin.hashtags.map((tag) => (
                          <span key={tag} className="badge-linkedin text-xs px-2 py-1 rounded-lg">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 pt-2 border-t border-white/5">
                      {content.linkedin.characterCount} characters
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Instagram Post ── */}
            {activeTab === 'instagram' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-400" />
                    Selected Image
                  </h3>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-800 mb-4">
                    {igPostAsset && <AssetImage asset={igPostAsset} />}
                  </div>
                  {igPostAsset?.score && <ScoreBadges score={igPostAsset.score} />}
                  {content.selectedAssets.selectionRationale.instagramPost && (
                    <div className="mt-3 text-xs text-gray-500 bg-gray-800/50 rounded-xl p-3">
                      <span className="text-gray-400 font-medium">Why this image: </span>
                      {content.selectedAssets.selectionRationale.instagramPost}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-400">Generated Caption</h3>
                    <CopyButton
                      text={`${content.instagramPost.caption}\n\n${content.instagramPost.hashtags.join(' ')}`}
                    />
                  </div>

                  <div className="glass rounded-2xl p-6 space-y-4">
                    <div>
                      <span className="text-xs text-gray-600 uppercase tracking-wider">Caption</span>
                      <p className="text-gray-300 text-sm mt-2 leading-relaxed whitespace-pre-line">
                        {content.instagramPost.caption}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 uppercase tracking-wider">Hashtags</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {content.instagramPost.hashtags.map((tag) => (
                          <span key={tag} className="badge-instagram text-xs px-2 py-1 rounded-lg">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 pt-2 border-t border-white/5">
                      {content.instagramPost.characterCount} characters
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Instagram Story ── */}
            {activeTab === 'story' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Story Preview</h3>
                  <div className="relative mx-auto" style={{ maxWidth: 320 }}>
                    <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-gray-800 relative">
                      {igStoryAsset && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={storyGenerated ?? `data:${igStoryAsset.mimeType};base64,${igStoryAsset.base64}`}
                          alt="Story"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {/* Overlay preview */}
                      {!storyGenerated && (
                        <StoryOverlay story={content.instagramStory} />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3 justify-center">
                    <button
                      onClick={handleGenerateStoryImage}
                      disabled={generatingStory}
                      className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                    >
                      {generatingStory ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      {generatingStory ? 'Generating...' : 'Render Story Image'}
                    </button>
                    {storyGenerated && (
                      <button
                        onClick={() => downloadImage(storyGenerated, `${brief.eventName}-story.jpg`)}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-xl transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-400">Story Text Overlay</h3>
                    <CopyButton
                      text={`${content.instagramStory.headline}\n${content.instagramStory.subtext}\n${content.instagramStory.ctaText}`}
                    />
                  </div>

                  <div className="glass rounded-2xl p-6 space-y-5">
                    <div>
                      <span className="text-xs text-gray-600 uppercase tracking-wider">Headline</span>
                      <p className="text-white font-black text-3xl mt-1 uppercase tracking-wide">
                        {content.instagramStory.headline}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 uppercase tracking-wider">Subtext</span>
                      <p className="text-gray-300 text-lg mt-1">{content.instagramStory.subtext}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 uppercase tracking-wider">CTA Button</span>
                      <div className="mt-2">
                        <span className="bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                          {content.instagramStory.ctaText}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 uppercase tracking-wider">Overlay Style</span>
                      <p className="text-gray-400 text-sm mt-1 capitalize">{content.instagramStory.overlayStyle}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Case Study ── */}
            {activeTab === 'casestudy' && (
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-bold text-xl">{content.caseStudy.title}</h3>
                  </div>
                  <CopyButton
                    text={[
                      content.caseStudy.title,
                      '\nEXECUTIVE SUMMARY\n' + content.caseStudy.executiveSummary,
                      '\nEVENT OVERVIEW\n' + content.caseStudy.eventOverview,
                      '\nKEY HIGHLIGHTS\n' + content.caseStudy.keyHighlights.map(h => '• ' + h).join('\n'),
                      '\nBRAND NARRATIVE\n' + content.caseStudy.brandNarrative,
                      '\nCONCLUSION\n' + content.caseStudy.conclusion,
                    ].join('\n\n')}
                  />
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {content.caseStudy.impactMetrics.map((metric) => (
                    <div key={metric.label} className="glass rounded-2xl p-4 text-center">
                      <div className="text-2xl font-black text-white">{metric.value}</div>
                      <div className="text-gray-500 text-xs mt-1">{metric.label}</div>
                    </div>
                  ))}
                </div>

                {/* Sections */}
                <div className="space-y-6">
                  <CaseStudySection title="Executive Summary" content={content.caseStudy.executiveSummary} />
                  <CaseStudySection title="Event Overview" content={content.caseStudy.eventOverview} />

                  <div className="glass rounded-2xl p-6">
                    <h4 className="text-white font-semibold mb-4">Key Highlights</h4>
                    <ul className="space-y-2">
                      {content.caseStudy.keyHighlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                          <Star className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <CaseStudySection title="Brand Narrative" content={content.caseStudy.brandNarrative} />
                  <CaseStudySection title="Conclusion" content={content.caseStudy.conclusion} />
                </div>

                {/* Case study images */}
                {content.selectedAssets.caseStudy.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-gray-400 text-sm font-medium mb-4">Selected Images for Case Study</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {content.selectedAssets.caseStudy.map((id) => {
                        const asset = findAsset(id);
                        if (!asset) return null;
                        return (
                          <div key={id} className="aspect-video rounded-xl overflow-hidden bg-gray-800">
                            <AssetImage asset={asset} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Asset Scores ── */}
            {activeTab === 'assets' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <BarChart2 className="w-5 h-5 text-brand-400" />
                  <h3 className="text-white font-bold text-xl">AI Asset Scoring</h3>
                  <span className="text-gray-500 text-sm">· {sortedAssets.length} images scored</span>
                </div>

                {/* Selection rationale */}
                <div className="glass rounded-2xl p-5 mb-6">
                  <button
                    onClick={() => setExpandedRationale(!expandedRationale)}
                    className="flex items-center justify-between w-full"
                  >
                    <span className="text-white font-semibold">Selection Rationale</span>
                    {expandedRationale ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedRationale && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3">
                          {Object.entries(content.selectedAssets.selectionRationale).map(([platform, reason]) => (
                            <div key={platform} className="flex gap-3">
                              <span className="text-xs font-medium text-gray-400 w-28 flex-shrink-0 capitalize pt-0.5">
                                {platform.replace(/([A-Z])/g, ' $1')}:
                              </span>
                              <span className="text-gray-300 text-sm">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Asset grid with scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedAssets.map((asset, rank) => (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: rank * 0.05 }}
                      className="glass rounded-2xl overflow-hidden"
                    >
                      <div className="relative aspect-video">
                        <AssetImage asset={asset} />
                        <div className="absolute top-2 left-2 bg-black/70 rounded-lg px-2 py-1 text-xs font-bold text-white">
                          #{rank + 1}
                        </div>
                        <div className="absolute top-2 right-2 bg-brand-600/90 rounded-lg px-2 py-1 text-xs font-bold text-white">
                          {asset.score?.overall.toFixed(1)}/10
                        </div>
                        {/* Platform badges */}
                        <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                          {asset.id === content.selectedAssets.linkedin && (
                            <span className="bg-blue-600/90 text-white text-xs px-1.5 py-0.5 rounded">LI</span>
                          )}
                          {asset.id === content.selectedAssets.instagramPost && (
                            <span className="bg-pink-600/90 text-white text-xs px-1.5 py-0.5 rounded">IG</span>
                          )}
                          {asset.id === content.selectedAssets.instagramStory && (
                            <span className="bg-orange-600/90 text-white text-xs px-1.5 py-0.5 rounded">Story</span>
                          )}
                        </div>
                      </div>
                      {asset.score && (
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <ScoreBar label="Sharpness" value={asset.score.sharpness} />
                            <ScoreBar label="Composition" value={asset.score.composition} />
                            <ScoreBar label="Brand" value={asset.score.brandRelevance} />
                            <ScoreBar label="Engagement" value={asset.score.humanEngagement} />
                          </div>
                          <p className="text-gray-600 text-xs leading-relaxed">{asset.score.reasoning}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ScoreBadges({ score }: { score: NonNullable<MediaAsset['score']> }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {[
        { label: 'Sharp', value: score.sharpness },
        { label: 'Comp', value: score.composition },
        { label: 'Brand', value: score.brandRelevance },
        { label: 'People', value: score.humanEngagement },
      ].map((s) => (
        <div key={s.label} className="glass rounded-xl p-2 text-center">
          <div className="text-white font-bold text-sm">{s.value.toFixed(1)}</div>
          <div className="text-gray-600 text-xs">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-400">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}

function CaseStudySection({ title, content }: { title: string; content: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h4 className="text-white font-semibold mb-3">{title}</h4>
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}

function StoryOverlay({ story }: { story: { headline: string; subtext: string; ctaText: string; overlayStyle: string } }) {
  const config = getStoryOverlayConfig(story as Parameters<typeof getStoryOverlayConfig>[0]);
  return (
    <div
      className="absolute inset-0 flex flex-col justify-end p-6"
      style={{ background: config.background }}
    >
      <h2
        className="font-black text-2xl uppercase tracking-wide mb-2"
        style={{ color: config.headlineColor }}
      >
        {story.headline}
      </h2>
      <p className="text-sm mb-4" style={{ color: config.subtextColor }}>
        {story.subtext}
      </p>
      <button
        className="self-start px-4 py-2 rounded-full text-sm font-bold"
        style={{ background: config.ctaBackground, color: config.ctaColor }}
      >
        {story.ctaText}
      </button>
    </div>
  );
}

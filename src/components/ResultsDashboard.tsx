'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Linkedin, Instagram, RotateCcw, Copy, Check,
  Download, Star, ChevronDown, ChevronUp, Zap,
  Twitter,
  Image as ImageIcon, Package, Share2, MessageCircle
} from 'lucide-react';
import { GeneratedContent, MediaAsset, EventBrief } from '@/types';
import { getStoryOverlayConfig, generateStoryImageCanvas } from '@/lib/storyImageGenerator';
import ArchitectureView from '@/components/ArchitectureView';
import PublishPanel from '@/components/PublishPanel';

interface Props {
  content: GeneratedContent;
  assets: MediaAsset[];
  brief: EventBrief;
  onReset: () => void;
}

type Tab = 'linkedin' | 'instagram' | 'story' | 'twitter' | 'whatsapp' | 'architecture';

const tabs: { id: Tab; label: string; icon: React.ElementType; colorClass: string }[] = [
  { id: 'linkedin',     label: 'LinkedIn',      icon: Linkedin,      colorClass: 'text-blue-400' },
  { id: 'instagram',    label: 'Instagram Post', icon: Instagram,     colorClass: 'text-pink-400' },
  { id: 'story',        label: 'IG Story',       icon: Instagram,     colorClass: 'text-orange-400' },
  { id: 'twitter',      label: 'Twitter/X',      icon: Twitter,       colorClass: 'text-sky-400' },
  { id: 'whatsapp',     label: 'WhatsApp',       icon: MessageCircle, colorClass: 'text-green-400' },
  { id: 'architecture', label: 'Architecture',   icon: Package,       colorClass: 'text-gray-400' },
];

// ─── Reusable helpers ────────────────────────────────────────────────────────

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all border border-white/8"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

function AssetImg({ asset, className = '' }: { asset: MediaAsset; className?: string }) {
  if (!asset?.base64) {
    // Demo mode placeholder — gradient based on asset id
    const colors = [
      'from-indigo-600 to-purple-700',
      'from-pink-600 to-rose-700',
      'from-orange-500 to-amber-600',
      'from-sky-600 to-blue-700',
    ];
    const idx = asset?.id ? parseInt(asset.id.replace(/\D/g, '').slice(-1) || '0') % colors.length : 0;
    return (
      <div className={`w-full h-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center ${className}`}>
        <span className="text-white/30 text-xs font-medium">Demo Image</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={`data:${asset.mimeType};base64,${asset.base64}`}
      alt={asset.name}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}

function ScoreBar({
  label,
  value,
  color = 'bg-indigo-500',
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-300 font-medium">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs text-gray-600 uppercase tracking-widest font-semibold">
      {children}
    </span>
  );
}

function HashtagPills({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-xs px-2 py-0.5 rounded-full text-indigo-300 border"
          style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.25)' }}
        >
          {tag.startsWith('#') ? tag : `#${tag}`}
        </span>
      ))}
    </div>
  );
}

// ─── Tab: LinkedIn ───────────────────────────────────────────────────────────

function LinkedInTab({ content, assets }: { content: GeneratedContent; assets: MediaAsset[] }) {
  const li = content.linkedin;
  const asset = assets.find((a) => a.id === li.selectedImageId) ?? assets[0];
  const score = asset?.score;
  const fullText = `${li.headline}\n\n${li.body}\n\n${li.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}\n\n${li.callToAction}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: image + scores */}
      <div className="space-y-4">
        <GlassCard className="overflow-hidden p-0">
          <div className="aspect-video w-full bg-gray-900 overflow-hidden rounded-2xl">
            {asset ? <AssetImg asset={asset} /> : <div className="w-full h-full flex items-center justify-center text-gray-700"><ImageIcon className="w-12 h-12" /></div>}
          </div>
        </GlassCard>
        {score && (
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Image Quality Scores</SectionLabel>
              <span className="text-sm font-bold text-indigo-400">{score.overall.toFixed(1)}/10</span>
            </div>
            <div className="space-y-3">
              <ScoreBar label="Sharpness" value={score.sharpness} color="bg-blue-500" />
              <ScoreBar label="Composition" value={score.composition} color="bg-purple-500" />
              <ScoreBar label="Brand Relevance" value={score.brandRelevance} color="bg-indigo-500" />
              <ScoreBar label="Human Engagement" value={score.humanEngagement} color="bg-pink-500" />
            </div>
            {score.reasoning && (
              <p className="text-xs text-gray-600 mt-3 leading-relaxed">{score.reasoning}</p>
            )}
          </GlassCard>
        )}
      </div>

      {/* Right: content */}
      <div className="space-y-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Headline</SectionLabel>
            <CopyButton text={li.headline} />
          </div>
          <p className="text-white font-bold text-lg leading-snug">{li.headline}</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Post Body</SectionLabel>
            <CopyButton text={li.body} />
          </div>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{li.body}</p>
        </GlassCard>

        <GlassCard>
          <SectionLabel>Hashtags</SectionLabel>
          <HashtagPills tags={li.hashtags} />
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Call to Action</SectionLabel>
            <CopyButton text={li.callToAction} />
          </div>
          <p className="text-indigo-300 font-medium">{li.callToAction}</p>
        </GlassCard>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">{li.characterCount} characters</span>
          <CopyButton text={fullText} label="Copy Full Post" />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Instagram Post ─────────────────────────────────────────────────────

function InstagramTab({ content, assets }: { content: GeneratedContent; assets: MediaAsset[] }) {
  const ig = content.instagramPost;
  const asset = assets.find((a) => a.id === ig.selectedImageId) ?? assets[0];
  const score = asset?.score;
  const fullText = `${ig.caption}\n\n${ig.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: square image */}
      <div className="space-y-4">
        <GlassCard className="overflow-hidden p-0">
          <div className="aspect-square w-full bg-gray-900 overflow-hidden rounded-2xl">
            {asset ? <AssetImg asset={asset} /> : <div className="w-full h-full flex items-center justify-center text-gray-700"><ImageIcon className="w-12 h-12" /></div>}
          </div>
        </GlassCard>
        {score && (
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Image Quality Scores</SectionLabel>
              <span className="text-sm font-bold text-pink-400">{score.overall.toFixed(1)}/10</span>
            </div>
            <div className="space-y-3">
              <ScoreBar label="Sharpness" value={score.sharpness} color="bg-pink-500" />
              <ScoreBar label="Composition" value={score.composition} color="bg-rose-500" />
              <ScoreBar label="Brand Relevance" value={score.brandRelevance} color="bg-orange-500" />
              <ScoreBar label="Human Engagement" value={score.humanEngagement} color="bg-red-500" />
            </div>
          </GlassCard>
        )}
      </div>

      {/* Right: caption */}
      <div className="space-y-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Caption</SectionLabel>
            <CopyButton text={ig.caption} />
          </div>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{ig.caption}</p>
          {ig.emojis && ig.emojis.length > 0 && (
            <div className="flex gap-1 mt-3 flex-wrap">
              {ig.emojis.map((e, i) => (
                <span key={i} className="text-xl">{e}</span>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <SectionLabel>Hashtags</SectionLabel>
          <HashtagPills tags={ig.hashtags} />
        </GlassCard>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">{ig.characterCount} characters</span>
          <CopyButton text={fullText} label="Copy Full Caption" />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Instagram Story ────────────────────────────────────────────────────

function StoryTab({ content, assets }: { content: GeneratedContent; assets: MediaAsset[] }) {
  const story = content.instagramStory;
  const asset = assets.find((a) => a.id === story.selectedImageId) ?? assets[0];
  const overlayConfig = getStoryOverlayConfig(story);
  const [rendering, setRendering] = useState(false);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(
    story.storyImageBase64 ? `data:image/jpeg;base64,${story.storyImageBase64}` : null
  );

  const handleRender = async () => {
    if (!asset) return;
    setRendering(true);
    try {
      const url = await generateStoryImageCanvas(asset.base64, story);
      setRenderedUrl(url);
    } finally {
      setRendering(false);
    }
  };

  const handleDownload = () => {
    if (!renderedUrl) return;
    const a = document.createElement('a');
    a.href = renderedUrl;
    a.download = 'instagram-story-1080x1920.jpg';
    a.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: 9:16 preview */}
      <div className="space-y-4">
        <GlassCard className="p-0 overflow-hidden">
          <div
            className="relative mx-auto overflow-hidden rounded-2xl"
            style={{ width: '100%', maxWidth: 320, aspectRatio: '9/16' }}
          >
            {asset ? (
              <AssetImg asset={asset} className="absolute inset-0" />
            ) : (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-700" />
              </div>
            )}

            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{ background: overlayConfig.background }}
            />

            {/* Brand bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500" />

            {/* Text content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3">
              <h2
                className="font-black text-2xl leading-tight uppercase"
                style={{ color: overlayConfig.headlineColor }}
              >
                {story.headline}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: overlayConfig.subtextColor }}>
                {story.subtext}
              </p>
              <div
                className="self-start px-5 py-2 rounded-full text-sm font-bold"
                style={{
                  background: overlayConfig.ctaBackground,
                  color: overlayConfig.ctaColor,
                }}
              >
                {story.ctaText}
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="flex gap-3">
          <button
            onClick={handleRender}
            disabled={rendering || !asset}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rendering ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Rendering...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Render 1080×1920
              </>
            )}
          </button>
          {renderedUrl && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all border text-gray-300 hover:text-white hover:border-white/20"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
        </div>
      </div>

      {/* Right: text fields */}
      <div className="space-y-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Headline</SectionLabel>
            <CopyButton text={story.headline} />
          </div>
          <p className="text-white font-bold text-lg">{story.headline}</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Subtext</SectionLabel>
            <CopyButton text={story.subtext} />
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{story.subtext}</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>CTA Text</SectionLabel>
            <CopyButton text={story.ctaText} />
          </div>
          <p className="text-indigo-300 font-semibold">{story.ctaText}</p>
        </GlassCard>

        <GlassCard>
          <SectionLabel>Overlay Style</SectionLabel>
          <p className="text-gray-400 text-sm mt-1 capitalize">{story.overlayStyle}</p>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── Tab: Twitter/X ──────────────────────────────────────────────────────────

function TwitterTab({ content, assets }: { content: GeneratedContent; assets: MediaAsset[] }) {
  const tw = content.twitter;
  const asset = assets.find((a) => a.id === tw.selectedImageId) ?? assets[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: image */}
      <div className="space-y-4">
        <GlassCard className="p-0 overflow-hidden">
          <div className="aspect-video w-full bg-gray-900 overflow-hidden rounded-2xl">
            {asset ? <AssetImg asset={asset} /> : <div className="w-full h-full flex items-center justify-center text-gray-700"><ImageIcon className="w-12 h-12" /></div>}
          </div>
        </GlassCard>
        {tw.threadHook && (
          <GlassCard>
            <SectionLabel>Thread Hook</SectionLabel>
            <p className="text-gray-300 text-sm mt-2 leading-relaxed">{tw.threadHook}</p>
          </GlassCard>
        )}
      </div>

      {/* Right: tweet cards */}
      <div className="space-y-3">
        {tw.tweets.map((tweet, i) => {
          const charCount = tweet.length;
          const overLimit = charCount > 280;
          return (
            <GlassCard key={i}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sky-400 text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 text-sm leading-relaxed">{tweet}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs font-medium ${overLimit ? 'text-red-400' : 'text-gray-600'}`}>
                      {charCount}/280
                    </span>
                    <CopyButton text={tweet} />
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
        <div className="flex justify-end pt-1">
          <CopyButton
            text={tw.tweets.join('\n\n')}
            label="Copy Full Thread"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ResultsDashboard({ content, assets, brief, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('linkedin');
  const [showPublish, setShowPublish] = useState(false);

  const buildExportText = useCallback(() => {
    const li = content.linkedin;
    const ig = content.instagramPost;
    const story = content.instagramStory;
    const tw = content.twitter;

    const lines: string[] = [
      `CONTENT ENGINE`,
      `Event: ${brief.eventName} | Brand: ${brief.brandName}`,
      `Generated: ${new Date().toLocaleString()}`,
      `${'='.repeat(60)}`,
      '',
      `LINKEDIN`,
      `${'─'.repeat(40)}`,
      `Headline: ${li.headline}`,
      '',
      li.body,
      '',
      li.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '),
      '',
      `CTA: ${li.callToAction}`,
      '',
      `${'='.repeat(60)}`,
      '',
      `INSTAGRAM POST`,
      `${'─'.repeat(40)}`,
      ig.caption,
      '',
      ig.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '),
      '',
      `${'='.repeat(60)}`,
      '',
      `INSTAGRAM STORY`,
      `${'─'.repeat(40)}`,
      `Headline: ${story.headline}`,
      `Subtext: ${story.subtext}`,
      `CTA: ${story.ctaText}`,
      '',
      `${'='.repeat(60)}`,
      '',
      `TWITTER/X THREAD`,
      `${'─'.repeat(40)}`,
      ...tw.tweets.map((t, i) => `[${i + 1}] ${t}`),
    ];

    return lines.join('\n');
  }, [content, brief]);

  const handleExportAll = useCallback(() => {
    const text = buildExportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brief.eventName.replace(/\s+/g, '-').toLowerCase()}-content.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildExportText, brief.eventName]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-30 border-b px-6 py-4 flex items-center gap-4"
        style={{
          background: 'rgba(9,9,11,0.85)',
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.2)' }}
          >
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-white text-sm truncate">{brief.eventName}</h1>
            <p className="text-gray-600 text-xs">{brief.brandName} · {assets.length} assets processed</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowPublish(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all text-white"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Publish & Share</span>
          </button>
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all text-gray-300 hover:text-white border"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">New Event</span>
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div
        className="sticky top-[65px] z-20 border-b px-6 overflow-x-auto"
        style={{
          background: 'rgba(9,9,11,0.85)',
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex gap-1 min-w-max py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={
                  isActive
                    ? { background: 'rgba(255,255,255,0.08)' }
                    : {}
                }
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.colorClass : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'linkedin' && (
              <LinkedInTab content={content} assets={assets} />
            )}
            {activeTab === 'instagram' && (
              <InstagramTab content={content} assets={assets} />
            )}
            {activeTab === 'story' && (
              <StoryTab content={content} assets={assets} />
            )}
            {activeTab === 'twitter' && (
              <TwitterTab content={content} assets={assets} />
            )}
            {activeTab === 'whatsapp' && (
              <WhatsAppTab content={content} assets={assets} />
            )}
            {activeTab === 'architecture' && (
              <ArchitectureView />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Publish Panel Modal */}
      <AnimatePresence>
        {showPublish && (
          <PublishPanel
            content={content}
            assets={assets}
            brief={brief}
            onClose={() => setShowPublish(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── WhatsApp Tab ─────────────────────────────────────────────────────────────

function WhatsAppTab({ content, assets }: { content: GeneratedContent; assets: MediaAsset[] }) {
  const wa = content.whatsapp;
  const asset = assets.find(a => a.id === wa?.selectedImageId) ?? assets[0];

  if (!wa) return (
    <div className="text-center py-20 text-white/30">
      <p>WhatsApp content not available. Try regenerating.</p>
    </div>
  );

  const shareText = `${wa.statusText}\n\n${wa.caption}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: image */}
      <div className="space-y-4">
        <GlassCard className="p-0 overflow-hidden">
          <div className="aspect-square w-full bg-gray-900 overflow-hidden rounded-2xl">
            {asset?.base64
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={`data:${asset.mimeType};base64,${asset.base64}`} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-white/10 text-sm">Demo Image</div>
            }
          </div>
        </GlassCard>
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 25px rgba(34,197,94,0.3)' }}
        >
          <MessageCircle className="w-5 h-5" />
          Share on WhatsApp
        </a>
        <p className="text-white/25 text-xs text-center">Opens WhatsApp with message pre-filled. Share to Status or contacts.</p>
      </div>

      {/* Right: content */}
      <div className="space-y-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Status Text</SectionLabel>
            <CopyButton text={wa.statusText} />
          </div>
          <p className="text-white font-bold text-xl">{wa.statusText}</p>
          <p className="text-white/30 text-xs mt-1">Short status for WhatsApp Status · max 700 chars</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Message Caption</SectionLabel>
            <CopyButton text={wa.caption} />
          </div>
          <p className="text-white/70 text-sm leading-relaxed">{wa.caption}</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Full Message</SectionLabel>
            <CopyButton text={shareText} label="Copy All" />
          </div>
          <p className="text-white/50 text-xs leading-relaxed whitespace-pre-line">{shareText}</p>
        </GlassCard>

        <div className="p-4 rounded-2xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <p className="text-green-300/60 text-xs leading-relaxed">
            <strong className="text-green-300">How to post as WhatsApp Status:</strong> Tap "Share on WhatsApp" → tap the Status tab → paste the text → attach the downloaded image → post.
          </p>
        </div>
      </div>
    </div>
  );
}


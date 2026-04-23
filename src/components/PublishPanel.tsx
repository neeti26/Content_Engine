'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Linkedin, Instagram, Twitter, MessageCircle, Share2,
  Download, Check, ExternalLink, Copy, X, Zap, Package,
  ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { GeneratedContent, MediaAsset, EventBrief } from '@/types';
import JSZip from 'jszip';

interface Props {
  content: GeneratedContent;
  assets: MediaAsset[];
  brief: EventBrief;
  onClose: () => void;
}

type Platform = 'linkedin' | 'instagram' | 'twitter' | 'whatsapp';

interface PlatformConfig {
  id: Platform;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  shareUrl: (text: string, url?: string) => string;
  note: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-400',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.25)',
    shareUrl: (text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://stepone.in')}&summary=${encodeURIComponent(text)}`,
    note: 'Opens LinkedIn share dialog. Paste your copied post.',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    color: 'text-pink-400',
    bg: 'rgba(236,72,153,0.1)',
    border: 'rgba(236,72,153,0.25)',
    shareUrl: () => 'https://www.instagram.com/',
    note: 'Copy caption → open Instagram → paste in new post.',
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: Twitter,
    color: 'text-sky-400',
    bg: 'rgba(56,189,248,0.1)',
    border: 'rgba(56,189,248,0.25)',
    shareUrl: (text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 260))}`,
    note: 'Opens Twitter with your first tweet pre-filled.',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-green-400',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.25)',
    shareUrl: (text) => `https://wa.me/?text=${encodeURIComponent(text)}`,
    note: 'Opens WhatsApp with your message pre-filled. Share to Status or contacts.',
  },
];

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
      style={{ background: done ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)', color: done ? '#34d399' : 'rgba(255,255,255,0.5)', border: `1px solid ${done ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)'}` }}
    >
      {done ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {done ? 'Copied!' : 'Copy'}
    </button>
  );
}

function getShareText(platform: Platform, content: GeneratedContent): string {
  switch (platform) {
    case 'linkedin':
      return `${content.linkedin.headline}\n\n${content.linkedin.body}\n\n${content.linkedin.hashtags.join(' ')}\n\n${content.linkedin.callToAction}`;
    case 'instagram':
      return `${content.instagramPost.caption}\n\n${content.instagramPost.hashtags.join(' ')}`;
    case 'twitter':
      return content.twitter.tweets[0] ?? content.twitter.threadHook;
    case 'whatsapp':
      return `${content.whatsapp.statusText}\n\n${content.whatsapp.caption}`;
  }
}

export default function PublishPanel({ content, assets, brief, onClose }: Props) {
  const [expanded, setExpanded] = useState<Platform | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const findAsset = (id: string) => assets.find(a => a.id === id);

  const handleExportZip = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`${brief.eventName.replace(/\s+/g, '-')}-content-package`)!;

      // Text content
      const li = content.linkedin;
      const ig = content.instagramPost;
      const tw = content.twitter;
      const wa = content.whatsapp;
      const cs = content.caseStudy;

      folder.file('linkedin-post.txt', `HEADLINE\n${li.headline}\n\nBODY\n${li.body}\n\nHASHTAGS\n${li.hashtags.join(' ')}\n\nCTA\n${li.callToAction}`);
      folder.file('instagram-caption.txt', `CAPTION\n${ig.caption}\n\nHASHTAGS\n${ig.hashtags.join(' ')}`);
      folder.file('instagram-story.txt', `HEADLINE: ${content.instagramStory.headline}\nSUBTEXT: ${content.instagramStory.subtext}\nCTA: ${content.instagramStory.ctaText}`);
      folder.file('twitter-thread.txt', tw.tweets.map((t, i) => `[${i+1}] ${t}`).join('\n\n'));
      folder.file('whatsapp.txt', `STATUS: ${wa.statusText}\n\nMESSAGE:\n${wa.caption}`);
      folder.file('case-study.txt', [
        cs.title, '', 'EXECUTIVE SUMMARY', cs.executiveSummary, '',
        'EVENT OVERVIEW', cs.eventOverview, '',
        'KEY HIGHLIGHTS', ...cs.keyHighlights.map(h => `• ${h}`), '',
        'BRAND NARRATIVE', cs.brandNarrative, '',
        'CONCLUSION', cs.conclusion,
      ].join('\n'));

      // Selected images
      const imgFolder = folder.folder('images')!;
      const platforms: Array<{ name: string; id: string }> = [
        { name: 'linkedin', id: content.selectedAssets.linkedin },
        { name: 'instagram-post', id: content.selectedAssets.instagramPost },
        { name: 'instagram-story', id: content.selectedAssets.instagramStory },
        { name: 'twitter', id: content.selectedAssets.twitter },
        { name: 'whatsapp', id: content.selectedAssets.whatsapp },
      ];
      for (const p of platforms) {
        const asset = findAsset(p.id);
        if (asset?.base64) {
          imgFolder.file(`${p.name}.jpg`, asset.base64, { base64: true });
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${brief.eventName.replace(/\s+/g, '-')}-content-package.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f0f1f, #0a0a15)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Share2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-black text-white text-base">Publish & Share</h2>
              <p className="text-white/30 text-xs">{brief.eventName} · {brief.brandName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-white/50 text-xs leading-relaxed">
              Direct API posting requires platform developer approval (takes days). Instead, use <strong className="text-white/70">one-click copy</strong> + <strong className="text-white/70">share link</strong> to open each platform with your content pre-filled. Or <strong className="text-white/70">download the ZIP</strong> with all assets.
            </p>
          </div>

          {/* Platform cards */}
          {PLATFORMS.map((p) => {
            const shareText = getShareText(p.id, content);
            const isOpen = expanded === p.id;
            const asset = findAsset(content.selectedAssets[p.id as keyof typeof content.selectedAssets] as string ?? '');

            return (
              <div key={p.id} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${p.border}`, background: p.bg }}>
                {/* Platform header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                  className="w-full flex items-center gap-3 px-5 py-4"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <p.icon className={`w-4.5 h-4.5 ${p.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-white text-sm">{p.label}</div>
                    <div className="text-white/30 text-xs">{p.note}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyBtn text={shareText} />
                    <a
                      href={p.shareUrl(shareText)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                      style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open
                    </a>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                  </div>
                </button>

                {/* Expanded preview */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-3 border-t border-white/8 pt-4">
                        {/* Selected image thumbnail */}
                        {asset?.base64 && (
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`data:${asset.mimeType};base64,${asset.base64}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-white/40 text-xs">Selected image</p>
                              <p className="text-white/60 text-xs mt-0.5">{asset.name}</p>
                              {asset.score && <p className="text-indigo-400 text-xs mt-0.5">Score: {asset.score.overall.toFixed(1)}/10</p>}
                            </div>
                          </div>
                        )}
                        {/* Content preview */}
                        <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <p className="text-white/60 text-xs leading-relaxed whitespace-pre-line line-clamp-6">{shareText}</p>
                        </div>
                        {/* WhatsApp specific */}
                        {p.id === 'whatsapp' && (
                          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                            <MessageCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <p className="text-green-300/70 text-xs">
                              <strong className="text-green-300">Status:</strong> "{content.whatsapp.statusText}" — tap Open to share directly to WhatsApp Status or send to contacts.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* ZIP Export */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <Package className="w-4 h-4 text-white/50" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Download Full Package</div>
                  <div className="text-white/30 text-xs">ZIP with all content + selected images for every platform</div>
                </div>
              </div>
              <button
                onClick={handleExportZip}
                disabled={exporting}
                className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
                style={{ background: exported ? 'rgba(52,211,153,0.15)' : 'linear-gradient(135deg, #6366f1, #4f46e5)', color: exported ? '#34d399' : 'white', border: exported ? '1px solid rgba(52,211,153,0.3)' : 'none' }}
              >
                {exporting
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Zipping...</>
                  : exported
                  ? <><Check className="w-4 h-4" />Downloaded!</>
                  : <><Download className="w-4 h-4" />Download ZIP</>}
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}
